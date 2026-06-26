// Hooks
import { createBrowserClient } from "@supabase/ssr";

/*
 EXPLICAÇÃO PARA LEIGOS :)

 cria um cliente supabase para uso no navegador

 diferente do cliente servidor, este roda no browser e gerencia a sessão
 automaticamente via localStorage

 deve ser usado apenas em arquivos com 'use client', nunca em server components,
 pois depende de APIs do browser (localStorage, window) que não existem no servidor

 o createBrowserClient do @supabase/ssr garante que apenas uma instância do cliente
 seja criada por sessão do browser, evitando múltiplas conexões 
*/
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
