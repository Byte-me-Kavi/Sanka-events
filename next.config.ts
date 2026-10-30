import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // The hidden admin area: never framed by other sites (clickjacking), never cached or leaked via referrer.
    const admin = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "same-origin" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
    ];
    return [
      { source: "/admin", headers: admin },
      { source: "/admin/:path*", headers: admin },
    ];
  },
};

export default nextConfig;
