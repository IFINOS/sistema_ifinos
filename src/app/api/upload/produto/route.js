import { createClient as createServerSupabase } from "@/_lib/supabase/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

/*
  EXPLICAÇÃO PARA LEIGOS :)

  mesma lógica da rota de upload de notícias: gera uma assinatura
  temporária pro Cloudinary, só que aqui exige também que o usuário
  seja admin, já que só admin pode cadastrar produtos no sistema
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

    // confirma que o usuário é admin antes de autorizar o upload
    const { data: grupos, error: gruposError } = await supabaseSession
      .from("usuarios_grupos")
      .select("grupos(nome)")
      .eq("usuario_id", user.id);

    const isAdmin = grupos?.some(
      (g) => g.grupos?.nome?.toLowerCase() === "administradores",
    );

    if (gruposError || !isAdmin) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "produtos";

    const paramsToSign = { folder, timestamp };

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
