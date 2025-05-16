/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Netlify için static export ayarı
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Basit dağıtım için "trailingSlash" ayarını etkinleştirin 
  trailingSlash: true,
};

module.exports = nextConfig;