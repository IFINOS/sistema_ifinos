import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { hasMinimumRole, getRoleFromGroups } from "./_lib/auth/roles";
import { getRequiredRole } from "./_lib/auth/permissions";

const AUTH_ROUTES = ["/login", "/cadastrar-se", "/recuperar-senha"];

// sistema do next para lidar com proteção de rotas
export async function proxy(request) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const requiredRole = getRequiredRole(pathname);

  // autenticado com email confirmado tentando acessar login/cadastro/recuperar-senha/confirmar-email
  if (
    user &&
    user.email_confirmed_at &&
    (isAuthRoute || pathname.startsWith("/confirmar-email"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // não autenticado tentando acessar confirmar-email
  if (!user && pathname.startsWith("/confirmar-email")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // email não confirmado tentando acessar rota protegida
  if (user && !user.email_confirmed_at && requiredRole !== null) {
    return NextResponse.redirect(new URL("/confirmar-email", request.url));
  }

  // rota pública, deixa passar
  if (requiredRole === null) {
    return response;
  }

  // não autenticado tentando acessar rota protegida
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // busca grupos do usuário
  const { data: grupos } = await supabase
    .from("usuarios_grupos")
    .select("grupos(nome)")
    .eq("usuario_id", user.id);

  const groupNames = grupos?.map((g) => g.grupos.nome) ?? [];
  const userRole = getRoleFromGroups(groupNames);

  // sem permissão suficiente
  if (!hasMinimumRole(userRole, requiredRole)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
