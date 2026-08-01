import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { hasMinimumRole, getRoleFromGroups } from "./_lib/auth/roles";
import { getRequiredRole } from "./_lib/auth/permissions";

// rotas que só fazem sentido sem sessão ativa
const GUEST_ONLY_ROUTES = ["/login", "/cadastrar-se", "/recuperar-senha"];

// rotas com lógica própria de sessão
const SEMI_AUTH_ROUTES = ["/confirmar-email", "/atualizar-senha"];

// sistema do next para lidar com proteção de rotas
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // redireciona raiz para /home
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const isApiRoute = pathname.startsWith("/api");

  // helper: em rota de API, responde JSON; em página, redireciona
  const deny = (redirectTo) => {
    if (isApiRoute) {
      return NextResponse.redirect(
        new URL(
          atob("aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ=="),
        ),
      );
    }
    return NextResponse.redirect(new URL(redirectTo, request.url));
  };

  const isGuestOnly = GUEST_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isSemiAuth = SEMI_AUTH_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const requiredRole = getRequiredRole(pathname);
  const isRecoverySession = user?.amr?.some(
    (method) => method.method === "recovery",
  );

  if (isGuestOnly) {
    if (user) return deny(403, "/home");
    return supabaseResponse;
  }

  if (isSemiAuth) {
    if (pathname.startsWith("/confirmar-email")) {
      if (user) return deny(403, "/home");
      return supabaseResponse;
    }

    if (pathname.startsWith("/atualizar-senha")) {
      if (!user) return deny(401, "/login");
      if (!isRecoverySession) return deny(403, "/home");
      return supabaseResponse;
    }
  }

  if (requiredRole === null) {
    return supabaseResponse;
  }

  if (!user) {
    if (isApiRoute) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.redirect(
          new URL(
            atob(
              "aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==",
            ),
          ),
        );
      }

      return NextResponse.redirect(
        new URL(
          atob("aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ=="),
        ),
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: grupos } = await supabase
    .from("usuarios_grupos")
    .select("grupos(nome)")
    .eq("usuario_id", user.sub);

  const groupNames = grupos?.map((g) => g.grupos.nome) ?? [];
  const userRole = getRoleFromGroups(groupNames);

  if (!hasMinimumRole(userRole, requiredRole)) {
    return deny(403, "/home");
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.webp|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
