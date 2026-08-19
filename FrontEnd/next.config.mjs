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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Referrer-Policy",
            value: "no-referrer",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.stripe.com\")",
          },
          {
            key: "Content-Security-Policy",
            value: "base-uri 'self'; form-action 'self' https://checkout.stripe.com; frame-ancestors 'none'; object-src 'none'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
