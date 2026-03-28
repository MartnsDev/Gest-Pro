/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      // Foto do Google
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Backend Railway
      {
        protocol: "https",
        hostname: "gestpro-backend-production.up.railway.app",
      },
      // Cloudinary — fotos de upload
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Permite que imagens do Google carreguem com referrer correto
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Referrer-Policy",
            value: "no-referrer-when-downgrade",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
