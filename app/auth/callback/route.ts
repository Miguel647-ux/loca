import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?reason=no_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/auth/error?reason=exchange_failed`);
  }

  // --- Redirection intelligente (Owner vs Tenant) ---
  let redirectTo = next;
  try {
    const { data: ctx } = await supabase.rpc("get_my_user_context");
    const c = ctx as { is_tenant?: boolean; properties_count?: number } | null;
    
    // Si locataire lié ET 0 propriété → espace locataire
    if (c?.is_tenant && (c?.properties_count ?? 0) === 0) {
      redirectTo = "/tenant";
    } else {
      redirectTo = "/dashboard";
    }
  } catch {
    // En cas d'échec de la RPC, on garde /dashboard par défaut
    redirectTo = "/dashboard";
  }

  // --- Protection contre les redirections ouvertes (Open Redirect) ---
  // La fonction getSafeRedirect vérifie que l'URL commence par un "/" et ne contient pas "://"
  const safeUrl = getSafeRedirect(redirectTo);

  return NextResponse.redirect(`${origin}${safeUrl}`);
}