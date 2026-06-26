import { NextResponse } from "next/server";
import { createClient } from "@/_lib/supabase/server";

/*
  EXPLICAÇÃO PARA LEIGOS :)

  o signOut() do cliente browser só limpa a sessão na memória/localStorage
  mas o cookie de sessão é httpOnly, ou seja, só pode ser removido pelo servidor

  sem essa rota, ao recarregar a página o supabase leria o cookie ainda presente
  e restauraria a sessão como se o logout nunca tivesse acontecido

  fluxo:
  usuário clica em logout
    frontend chama POST /auth/logout
    createClient() cria um cliente com acesso aos cookies do servidor
    signOut() remove a sessão e limpa o cookie httpOnly
    usuário é redirecionado para /login
*/
export async function POST() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  return NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_SITE_URL),
  );
}
