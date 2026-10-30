import type { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Only the hidden admin area touches Supabase; the public site skips this entirely.
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
