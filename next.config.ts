import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Property photos are uploaded to UploadThing (https://<appId>.ufs.sh/f/<key>)
    remotePatterns: [{ protocol: "https", hostname: "*.ufs.sh", pathname: "/f/**" }],
  },
  experimental: {
    /*
    Turbopack's saved build cache can serve an old globals.css after the file
    changes, locally and on Vercel (which restores .next/cache between builds).
    Every build compiles from scratch instead.
    */
    turbopackFileSystemCacheForBuild: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
