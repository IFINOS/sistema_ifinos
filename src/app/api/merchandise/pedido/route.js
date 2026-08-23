import { createClient as createServerSupabase } from "@/_lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function POST(req) {
  try {
    const supabaseSession = await createServerSupabase();
    const {
      data: { user },
    } = await supabaseSession.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const {
      pedidoId,
      nome,
      whatsapp,
      email,
      nome_camiseta,
      observacoes,
      itens,
      total,
    } = await req.json();

    // busca o email configurado para receber pedidos
    const { data: config, error: configError } = await supabaseAdmin
      .from("configuracoes_sistema")
      .select("email_responsavel_produtos")
      .single();

    if (configError || !config?.email_responsavel_produtos) {
      return NextResponse.json(
        { error: "Email de destino não configurado." },
        { status: 500 },
      );
    }

    const itensHtml = itens
      .map(
        (item) =>
          `<li>${item.quantidade}x ${item.nome} (${item.unidade}) — R$ ${(
            Number(item.valor) * item.quantidade
          ).toFixed(2)}</li>`,
      )
      .join("");

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "IFINOS", email: "ifinos.ifpr@gmail.com" },
        to: [{ email: config.email_responsavel_produtos }],
        replyTo: { email, name: nome },
        subject: `[Pedido Merchandise] ${nome}`,
        htmlContent: `
          <p><strong>Pedido:</strong> ${pedidoId}</p>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>WhatsApp:</strong> ${whatsapp}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${nome_camiseta ? `<p><strong>Nome na camiseta:</strong> ${nome_camiseta}</p>` : ""}
          ${observacoes ? `<p><strong>Observações:</strong> ${observacoes}</p>` : ""}
          <p><strong>Itens:</strong></p>
          <ul>${itensHtml}</ul>
          <p><strong>Total:</strong> R$ ${Number(total).toFixed(2)}</p>
        `,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Erro ao enviar email." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
