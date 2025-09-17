/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['storage.yandexcloud.net'],
  },
  experimental: {
    typedRoutes: true,
  },
}

export default nextConfig