/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // No external image domains needed - all images served via /api/images proxy
    ],
    minimumCacheTTL: 86400,
  },
  output: "standalone",
};

export default nextConfig;
