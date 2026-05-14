import { S3Client, ListObjectsV2Command, DeleteObjectCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

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

export async function listGalleryImages(): Promise<GalleryImage[]> {
  const s3 = getS3Client();
  const command = new ListObjectsV2Command({
    Bucket: getBucket(),
    Prefix: "gallery/",
  });

  const response = await s3.send(command);
  const contents = response.Contents ?? [];

  return contents
    .filter((obj) => obj.Key && !obj.Key.endsWith("/"))
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
