import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Les images de propriétés sont limitées à 5 MB côté serveur,
      // on laisse une marge pour le formulaire multipart + métadonnées.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;