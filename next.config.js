/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gen-wealth.github.io",
        port: "",
        pathname: "/public/**",
      },
      {
        protocol: "https",
        hostname: "**.**.nftcdn.io",
        port: "",
        pathname: "/image",
      },
    ],
  },
};

module.exports = nextConfig;
