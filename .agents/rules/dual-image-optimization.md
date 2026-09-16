# MSNS Dual Image Optimization Pipeline Rules

## 1. Architectural Invariant
All media assets across the MSNS ecosystem (`msns-home`, `msns-build`, and Capacitor Android) must adhere to the **Dual-Tier Image Optimization Architecture**:
- **Ingress Tier (Pre-Persistence)**: Every image uploaded via API endpoints (`/api/gallery/upload`, `/api/v1/upload`) MUST pass through the Sharp optimization engine (`src/lib/image-optimizer.ts`) before writing to S3 / Cloudflare R2.
- **Egress Tier (Edge Delivery)**: Every image rendered on the web MUST be delivered via Next.js `<Image />` with Edge AVIF/WebP dynamic transcoding and long-term immutable caching.

## 2. Ingress Compression Standards
- **Max Dimension**: Clamped to 2048px on the longest edge (`fit: 'inside'`, `withoutEnlargement: true`).
- **Orientation**: Mandatory `.rotate()` to align EXIF orientation tags before upload.
- **Format Compression Targets**:
  - JPEG: `mozjpeg: true, quality: 82, progressive: true`
  - PNG: `compressionLevel: 8, quality: 85`
  - WebP: `quality: 82, effort: 4`
  - AVIF: `quality: 80, effort: 4`
- **Fallback Guarantee**: Non-image buffers (PDFs, videos) pass through untouched. Sharp failures must log a warning and safely fall back to the original buffer.

## 3. Next.js Edge Caching & Delivery Invariants
- `next.config.js` MUST NEVER set `images.unoptimized: true` in production.
- `images.formats` must include `["image/avif", "image/webp"]`.
- `images.minimumCacheTTL` must be configured to at least 1 year (`31536000` seconds) to maximize edge cache hit rates and eliminate redundant transformation compute.
- `remotePatterns` must permit `**.r2.cloudflarestorage.com`, `msns.edu.pk`, and `lms.msns.edu.pk`.
- Proxy image routes (`/api/images/[...key]`, `/api/uploads/[...filename]`) must emit `Cache-Control: public, max-age=31536000, immutable`.
