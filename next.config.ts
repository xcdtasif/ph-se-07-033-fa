import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The dev server refuses its scripts to other hostnames; omarchy is this machine on Tailscale
  allowedDevOrigins: ["omarchy"],
  /*
  The browser uploads property photos through the backend's UploadThing route. Sending it through
  this site keeps it same-origin, so the request carries the auth cookie, which is set for this
  site rather than the backend's.
  */
  async rewrites() {
    return [{ source: "/api/uploadthing", destination: `${process.env.API_URL}/api/uploadthing` }]
  },
  images: {
    // Property photos are uploaded to UploadThing (https://<appId>.ufs.sh/f/<key>)
    remotePatterns: [{ protocol: "https", hostname: "*.ufs.sh", pathname: "/f/**" }],
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
