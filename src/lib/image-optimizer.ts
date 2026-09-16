import sharp from "sharp";

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface OptimizedImageResult {
  buffer: Buffer;
  contentType: string;
  size: number;
  width?: number;
  height?: number;
  isOptimized: boolean;
}

const RASTER_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

/**
 * Optimizes an uploaded image buffer before writing to S3 / Cloudflare R2:
 * - Auto-orients based on EXIF orientation tags (.rotate())
 * - Clamps max dimensions to 2048x2048 (preserving aspect ratio, without enlargement)
 * - Compresses with format-optimal settings (progressive JPEG, optimized WebP/PNG/AVIF)
 * - Non-images (PDFs, videos) pass through completely untouched
 * - Resilient fallback: returns original buffer if Sharp fails or file is corrupt
 */
export async function optimizeImageForUpload(
  inputBuffer: Buffer,
  originalContentType: string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const contentType = originalContentType.toLowerCase().trim();

  // If not a raster image, pass through immediately
  if (!RASTER_IMAGE_TYPES.has(contentType)) {
    return {
      buffer: inputBuffer,
      contentType: originalContentType,
      size: inputBuffer.length,
      isOptimized: false,
    };
  }

  const maxWidth = options.maxWidth ?? 2048;
  const maxHeight = options.maxHeight ?? 2048;
  const isGif = contentType === "image/gif";

  try {
    let pipeline = sharp(inputBuffer, { failOn: "none", animated: isGif });

    // Auto-orient based on EXIF tags (e.g. mobile portrait photos)
    if (!isGif) {
      pipeline = pipeline.rotate();
    }

    // Resize within bounds if larger than max dimensions
    pipeline = pipeline.resize({
      width: maxWidth,
      height: maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    });

    let targetContentType = contentType;

    switch (contentType) {
      case "image/jpeg":
      case "image/jpg":
        pipeline = pipeline.jpeg({
          quality: options.quality ?? 82,
          mozjpeg: true,
          progressive: true,
        });
        targetContentType = "image/jpeg";
        break;
      case "image/png":
        pipeline = pipeline.png({
          quality: options.quality ?? 85,
          compressionLevel: 8,
          palette: true,
        });
        targetContentType = "image/png";
        break;
      case "image/webp":
        pipeline = pipeline.webp({
          quality: options.quality ?? 82,
          effort: 4,
        });
        targetContentType = "image/webp";
        break;
      case "image/avif":
        pipeline = pipeline.avif({
          quality: options.quality ?? 80,
          effort: 4,
        });
        targetContentType = "image/avif";
        break;
      case "image/gif":
        pipeline = pipeline.gif({ effort: 7 });
        targetContentType = "image/gif";
        break;
    }

    const optimizedBuffer = await pipeline.toBuffer();
    const metadata = await sharp(optimizedBuffer)
      .metadata()
      .catch(() => ({ width: undefined, height: undefined }));

    return {
      buffer: optimizedBuffer,
      contentType: targetContentType,
      size: optimizedBuffer.length,
      width: metadata.width,
      height: metadata.height,
      isOptimized: true,
    };
  } catch (error) {
    console.warn(
      "[ImageOptimizer] Sharp optimization failed, falling back to original buffer:",
      error instanceof Error ? error.message : error
    );
    return {
      buffer: inputBuffer,
      contentType: originalContentType,
      size: inputBuffer.length,
      isOptimized: false,
    };
  }
}
