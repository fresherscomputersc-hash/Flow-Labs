/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/estimator',
        destination: '/scoping',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/scoping',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
