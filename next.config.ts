import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // En producción (Vercel) las fotos se servirán desde Vercel Blob.
    // Descomentar y ajustar al migrar el upload:
    // remotePatterns: [
    //   { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    // ],
  },
};

export default nextConfig;
