/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode:true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dvvbxrs55/image/upload/**",
      },
      {
        protocol: "https",
        hostname: "asset.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 86400,
  },
  output: "standalone",
};

export const cloudinaryConfig = {
  cloudName: "dvvbxrs55",
  uploadPreset: {
    profilePic: "msnsPDP",
    cv: "msnsCV",
  },
};

export default nextConfig;
