import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_EMAIL } from "../admin";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Refreshes the token if needed; must run before any redirect decision.
  const { data } = await supabase.auth.getClaims();
  const isAdmin = data?.claims?.email === ADMIN_EMAIL;
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" && isAdmin) return redirectWithSession(request, response, "/admin/concerts");
  if (pathname.startsWith("/admin/") && !isAdmin) return redirectWithSession(request, response, "/admin");

  return response;
}

// A redirect must carry the refreshed cookies and no-cache headers, or the user is signed out on the next request.
function redirectWithSession(request: NextRequest, from: NextResponse, path: string) {
  const to = NextResponse.redirect(new URL(path, request.url));
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie));
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = from.headers.get(header);
    if (value) to.headers.set(header, value);
  }
  return to;
}
