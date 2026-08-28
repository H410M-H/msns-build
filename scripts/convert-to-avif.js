// @ts-nocheck
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const region = process.env.S3_REGION || process.env.AWS_DEFAULT_REGION || 'auto';
const endpoint = process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT_URL || 'https://c678cf5c0fc5ef3806edacc18e6a762d.r2.cloudflarestorage.com';
const bucket = process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || 'msns';
const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';

if (!accessKeyId || !secretAccessKey) {
  console.log('⚡ Cloudflare R2 / S3 credentials not present in environment. Next.js native AVIF optimization enabled in config.');
  process.exit(0);
}

const s3Client = new S3Client({
  region,
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
});

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function runAvifOptimization() {
  console.log(`🚀 Starting AVIF Media Optimization for bucket "${bucket}"...`);

  let sharp;
  try {
    const sharpModule = await import('sharp');
    sharp = sharpModule.default || sharpModule;
  } catch (_e) {
    console.log('⚠️ Sharp is not installed locally. Next.js image optimizer will handle AVIF encoding dynamically on-demand.');
    return;
  }

  try {
    const listRes = await s3Client.send(new ListObjectsV2Command({ Bucket: bucket }));
    const objects = listRes.Contents || [];

    const imageObjects = objects.filter((obj) => {
      if (!obj.Key || obj.Key.endsWith('/')) return false;
      const lower = obj.Key.toLowerCase();
      return (
        (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp')) &&
        !lower.endsWith('.avif')
      );
    });

    console.log(`📸 Found ${imageObjects.length} images to optimize into AVIF format...`);

    let totalOriginalBytes = 0;
    let totalAvifBytes = 0;
    let convertedCount = 0;

    for (const obj of imageObjects) {
      try {
        const key = obj.Key;
        const avifKey = key.replace(/\.[^/.]+$/, '') + '.avif';

        // Check if AVIF already exists
        const exists = objects.some((o) => o.Key === avifKey);
        if (exists) {
          console.log(`⏩ Skipping ${key} (AVIF version already exists: ${avifKey})`);
          continue;
        }

        console.log(`⏳ Converting ${key} -> ${avifKey}...`);
        const getRes = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        const origBuffer = await streamToBuffer(getRes.Body);

        const avifBuffer = await sharp(origBuffer)
          .avif({ quality: 80, effort: 4 })
          .toBuffer();

        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: avifKey,
            Body: avifBuffer,
            ContentType: 'image/avif',
            CacheControl: 'public, max-age=31536000, immutable',
          })
        );

        totalOriginalBytes += origBuffer.length;
        totalAvifBytes += avifBuffer.length;
        convertedCount++;

        const savedRatio = ((1 - avifBuffer.length / origBuffer.length) * 100).toFixed(1);
        console.log(
          `✅ Converted ${key}: ${(origBuffer.length / 1024).toFixed(1)} KB -> ${(avifBuffer.length / 1024).toFixed(1)} KB (${savedRatio}% saved)`
        );
      } catch (err) {
        console.error(`❌ Error converting ${obj.Key}:`, err.message);
      }
    }

    console.log(`\n🎉 AVIF Optimization Complete!`);
    console.log(`📊 Converted ${convertedCount} images.`);
    if (totalOriginalBytes > 0) {
      const savedBytes = totalOriginalBytes - totalAvifBytes;
      console.log(
        `📉 Original Size: ${(totalOriginalBytes / (1024 * 1024)).toFixed(2)} MB | AVIF Size: ${(totalAvifBytes / (1024 * 1024)).toFixed(2)} MB`
      );
      console.log(`✨ Net Saved: ${(savedBytes / (1024 * 1024)).toFixed(2)} MB (${((savedBytes / totalOriginalBytes) * 100).toFixed(1)}% reduction)`);
    }
  } catch (err) {
    console.error('❌ Failed to list bucket contents:', err.message);
  }
}

runAvifOptimization();
