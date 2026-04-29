import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default async function proxy(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const user = session?.user;
  const pathname = req.nextUrl.pathname.replace(/\/$/, "");

  // ---------- Route Definitions ---------- 
  const publicRoutes = ["/login", "/signup"];

  const privateRoutePrefixes = [
    "/booking",
    "/dashboard",
    "/history",
    "/inquiry-request",
    "/profile",
    "/renew",
    "/seat-map",
    "/settings",
    "/student",
    "/setup",
  ];

  const isPrivateRoute = privateRoutePrefixes.some((route) =>
    pathname.startsWith(route)
  );

  // ---------- Auth Guards ---------- 

  // Block unauthenticated users
  if (!user && isPrivateRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Prevent authenticated users from visiting auth pages
  if (user && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// ---------- Matcher ----------
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
