import { S3Client, ListObjectsV2Command, DeleteObjectCommand, PutObjectCommand, GetObjectCommand, CopyObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";


const getS3Client = () => {
  return new S3Client({
    region: process.env.AWS_DEFAULT_REGION ?? "auto",
    endpoint: process.env.AWS_ENDPOINT_URL,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  });
};

const getBucket = () => process.env.AWS_S3_BUCKET_NAME!;

export interface GalleryImage {
  key: string;
  url: string;
  lastModified?: string;
  size?: number;
}

export async function listGalleryImages(): Promise<{ images: GalleryImage[], folders: string[] }> {
  const s3 = getS3Client();
  
  const [galleryResponse, videosResponse] = await Promise.all([
    s3.send(new ListObjectsV2Command({ Bucket: getBucket(), Prefix: "gallery/" })),
    s3.send(new ListObjectsV2Command({ Bucket: getBucket(), Prefix: "videos/" }))
  ]);
  
  const galleryContents = galleryResponse.Contents ?? [];
  const videosContents = videosResponse.Contents ?? [];
  const contents = [...galleryContents, ...videosContents];

  const folders = new Set<string>();

  const images = contents
    .filter((obj) => {
      if (!obj.Key) return false;
      // Track explicit folder objects
      if (obj.Key.endsWith("/")) {
        let folderPath = "";
        if (obj.Key.startsWith("gallery/")) {
          folderPath = obj.Key.substring("gallery/".length, obj.Key.length - 1);
        } else if (obj.Key.startsWith("videos/")) {
          folderPath = obj.Key.substring(0, obj.Key.length - 1);
        }
        if (folderPath) {
          folders.add(folderPath);
        }
        return false;
      }
      return true;
    })
    .map((obj) => {
      const key = obj.Key!;
      let folderPath = "";
      if (key.startsWith("gallery/")) {
        const parts = key.split("/");
        if (parts.length > 2) {
          folderPath = parts.slice(1, -1).join("/");
        }
      } else if (key.startsWith("videos/")) {
        const parts = key.split("/");
        if (parts.length > 1) {
          folderPath = parts.slice(0, -1).join("/");
        }
      }
      if (folderPath) {
        folders.add(folderPath);
      }
      
      return {
        key,
        url: `/api/images/${key}`,
        lastModified: obj.LastModified?.toISOString(),
        size: obj.Size,
      };
    })
    .sort((a, b) => {
      if (a.lastModified && b.lastModified) {
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      }
      return 0;
    });

  // Always ensure the top level "videos" folder exists if there are videos
  if (videosContents.length > 0) {
    folders.add("videos");
  }

  return { images, folders: Array.from(folders).sort() };
}

export async function findImageByFilename(filename: string): Promise<string | null> {
  const s3 = getS3Client();
  const [galleryResponse, videosResponse] = await Promise.all([
    s3.send(new ListObjectsV2Command({ Bucket: getBucket(), Prefix: "gallery/" })),
    s3.send(new ListObjectsV2Command({ Bucket: getBucket(), Prefix: "videos/" }))
  ]);
  
  const contents = [
    ...(galleryResponse.Contents ?? []),
    ...(videosResponse.Contents ?? [])
  ];

  for (const obj of contents) {
    if (!obj.Key || obj.Key.endsWith("/")) continue;
    const basename = obj.Key.split("/").pop();
    if (basename === filename) {
      return obj.Key;
    }
  }

  return null;
}

export async function uploadToS3(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const s3 = getS3Client();
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  await s3.send(command);
  return key;
}

export async function deleteFromS3(key: string): Promise<void> {
  const s3 = getS3Client();
  const command = new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });
  await s3.send(command);
}

export async function getFromS3(key: string) {
  const s3 = getS3Client();
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });
  return s3.send(command);
}

export async function copyS3Object(sourceKey: string, destinationKey: string): Promise<void> {
  const s3 = getS3Client();
  const command = new CopyObjectCommand({
    Bucket: getBucket(),
    CopySource: `${getBucket()}/${sourceKey}`,
    Key: destinationKey,
  });
  await s3.send(command);
}

export async function moveS3Object(sourceKey: string, destinationKey: string): Promise<void> {
  await copyS3Object(sourceKey, destinationKey);
  await deleteFromS3(sourceKey);
}

export async function createS3Folder(folderName: string): Promise<void> {
  const s3 = getS3Client();
  // Ensure folder name ends with /
  let key = "";
  if (folderName === "videos" || folderName.startsWith("videos/")) {
    key = folderName.endsWith('/') ? folderName : folderName + '/';
  } else {
    key = `gallery/${folderName.endsWith('/') ? folderName : folderName + '/'}`;
  }
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: new Uint8Array(0), // Empty body
  });
  await s3.send(command);
}

export async function deleteS3Folder(folderName: string): Promise<void> {
  const s3 = getS3Client();
  let prefix = "";
  if (folderName === "videos" || folderName.startsWith("videos/")) {
    prefix = folderName.endsWith('/') ? folderName : folderName + '/';
  } else {
    prefix = `gallery/${folderName.endsWith('/') ? folderName : folderName + '/'}`;
  }

  let isTruncated = true;
  let continuationToken: string | undefined = undefined;

  while (isTruncated) {
    const cmd: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: getBucket(),
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });

    const response = await s3.send(cmd);
    if (!response.Contents || response.Contents.length === 0) break;

    const delCmd = new DeleteObjectsCommand({
      Bucket: getBucket(),
      Delete: {
        Objects: response.Contents.map((obj) => ({ Key: obj.Key! })),
        Quiet: true,
      },
    });

    await s3.send(delCmd);

    isTruncated = response.IsTruncated ?? false;
    continuationToken = response.NextContinuationToken;
  }
}
