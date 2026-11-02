import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // 1. Génération du Nonce cryptographique
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  
  // 2. Définition de la CSP stricte (sans unsafe-inline / unsafe-eval)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://*.supabase.co;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.supabase.co;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, " ").trim();

  // 3. Préparation des headers avec le nonce
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Application de la CSP sur la réponse initiale
  supabaseResponse.headers.set("Content-Security-Policy", cspHeader);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ 
            request: { headers: requestHeaders } 
          });
          // On réapplique la CSP et les headers
          supabaseResponse.headers.set("Content-Security-Policy", cspHeader);
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT : ne rien mettre entre createServerClient et getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/auth");
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/tenant") || pathname.startsWith("/admin");

  // Non connecté → tente d'accéder à une route protégée → login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectTo", pathname);
    
    const redirectRes = NextResponse.redirect(url);
    redirectRes.headers.set("Content-Security-Policy", cspHeader);
    return redirectRes;
  }

  // Connecté → tente d'accéder aux routes auth → dashboard
  if (user && isAuthRoute) {
    if (
      pathname === "/auth/callback" ||
      pathname === "/auth/reset-password"
    ) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    
    const redirectRes = NextResponse.redirect(url);
    redirectRes.headers.set("Content-Security-Policy", cspHeader);
    return redirectRes;
  }

  return supabaseResponse;
}