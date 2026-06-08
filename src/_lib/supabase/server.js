// Hooks
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/*
  EXPLICAÇÃO PARA LEIGOS :)

 cria um cliente supabase para uso no servidor, ex: o proxy.js

 no app router do next, cookies são a forma de manter a sessão do usuário entre
 requisições, esse cliente lê e escreve cookies automaticamente para manter a sessão
 autenticada sem precisar passar tokens manualmente

 - getAll: ele lê todos os cookies da requisição atual
 - setAll: escreve cookies de volta na resposta, ex: refresh de token

 o try/catch no setAll existe porque server components não podem setar cookies
 diretamente, apenas server actions e route handlers podem
 
 ATENÇÃO:
 sem o try/catch, a aplicação quebraria ao tentar renderizar um server component com sessão expirada, ou seja, NÃO APAGA :)

 deve ser chamado com await pois cookies() é assíncrono
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch (e) {
            console.error(e);
          }
        },
      },
    },
  );
}
