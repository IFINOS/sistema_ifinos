import { NextResponse } from "next/server";
import { createClient } from "@/_lib/supabase/server";

/*
  EXPLICAÇÃO PARA LEIGOS :)

  quando o supabase envia um email de confirmação, recuperação de senha ou
  magic link, o link gerado aponta para essa rota com um ?code=1234 na URL

  o "code" é um código temporário de uso único que precisa ser trocado por uma sessão real
  sem essa troca o usuário fica sem sessão mesmo tendo clicado no link

  fluxo:
  usuário clica no link do email
    cai aqui com ?code=1234
    exchangeCodeForSession() troca o code por uma sessão
    sessão é salva nos cookies automaticamente pelo createClient
    usuário é redirecionado para o destino final

  o parâmetro ?next= é opcional e serve para redirecionar o usuário para
  uma página específica após a autenticação, ex: /auth/callback?next=/nova-senha
  se não for passado, redireciona para /home por padrão

  ATENÇÃO:
  essa rota precisa estar cadastrada no supabase dashboard em
  Authentication → URL Configuration → Redirect URLs
  sem isso o supabase rejeita o redirecionamento por segurança :)
*/
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home"; // para onde redirecionar após

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?error=invalid_code", origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
