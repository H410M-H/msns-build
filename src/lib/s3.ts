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

export async function listGalleryImages(): Promise<{images: GalleryImage[], folders: string[]}> {
  const s3 = getS3Client();
  const command = new ListObjectsV2Command({
    Bucket: getBucket(),
    Prefix: "gallery/",
  });

  const response = await s3.send(command);
  const contents = response.Contents ?? [];

  const folders = new Set<string>();

  const images = contents
    .filter((obj) => {
      if (!obj.Key) return false;
      // Track explicit folder objects
      if (obj.Key.endsWith("/")) {
        const parts = obj.Key.split("/");
        if (parts.length > 1 && parts[1]) {
          folders.add(parts[1]);
        }
        return false;
      }
      return true;
    })
    .map((obj) => ({
      key: obj.Key!,
      url: `/api/images/${obj.Key!}`,
      lastModified: obj.LastModified?.toISOString(),
      size: obj.Size,
    }))
    .sort((a, b) => {
      if (a.lastModified && b.lastModified) {
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      }
      return 0;
    });

  return { images, folders: Array.from(folders) };
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
  const key = `gallery/${folderName.endsWith('/') ? folderName : folderName + '/'}`;
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: new Uint8Array(0), // Empty body
  });
  await s3.send(command);
}

export async function deleteS3Folder(folderName: string): Promise<void> {
  const s3 = getS3Client();
  const prefix = `gallery/${folderName.endsWith('/') ? folderName : folderName + '/'}`;

  let isTruncated = true;
  let continuationToken: string | undefined = undefined;

  while (isTruncated) {
    const listCommand = new ListObjectsV2Command({
      Bucket: getBucket(),
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });

    const listResponse = await s3.send(listCommand);
    if (!listResponse.Contents || listResponse.Contents.length === 0) break;

    const deleteCommand = new DeleteObjectsCommand({
      Bucket: getBucket(),
      Delete: {
        Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key! })),
        Quiet: true,
      },
    });

    await s3.send(deleteCommand);

    isTruncated = listResponse.IsTruncated ?? false;
    continuationToken = listResponse.NextContinuationToken;
  }
}
