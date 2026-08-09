import { createClient as createServerSupabase } from "@/_lib/supabase/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

/*
  EXPLICAÇÃO PARA LEIGOS :)

  essa rota gera uma "assinatura" temporária pro upload direto ao Cloudinary

  em vez do client fazer upload direto usando um preset "unsigned" (que
  qualquer pessoa poderia usar, mesmo sem estar logada no nosso site),
  o client primeiro pede uma assinatura aqui - e essa rota só assina
  se o usuário estiver autenticado

  a assinatura é um hash (SHA-1) dos parâmetros do upload + nossa
  api secret, calculado aqui no servidor (a secret nunca vai pro client)
  o Cloudinary recalcula o mesmo hash do lado dele e só aceita o upload
  se bater, confirmando que a requisição realmente veio de nós
*/
export async function POST() {
  try {
    const supabaseSession = await createServerSupabase();
    const {
      data: { user },
    } = await supabaseSession.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "noticias";

    // parâmetros que vão ser assinados - precisam ser EXATAMENTE
    // os mesmos que o client vai enviar no upload depois
    const paramsToSign = { folder, timestamp };

    // o Cloudinary exige que os parâmetros sejam ordenados alfabeticamente
    // antes de gerar a string que será assinada
    const sortedParams = Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join("&");

    const signature = crypto
      .createHash("sha1")
      .update(sortedParams + process.env.CLOUDINARY_API_SECRET)
      .digest("hex");

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
