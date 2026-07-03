// Hooks
import { createClient } from "@/_lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { nome, email, mensagem } = await req.json();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email_real = user ? user.email : email;
  const nome_real = user ? user.user_metadata.full_name : nome;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "IFINOS", email: "ifinos.ifpr@gmail.com" },
      to: [{ email: "ifinos.ifpr@gmail.com" }],
      replyTo: { email: email_real, name: nome_real },
      subject: `[Fale Conosco] ${nome_real}`,
      htmlContent: `
        <p><strong>Nome:</strong> ${nome_real}</p>
        <p><strong>Email:</strong> ${email_real}</p>
        <p><strong>Mensagem:</strong> ${mensagem}</p>
      `,
    }),
  });

  if (!res.ok)
    return NextResponse.json({ error: "Erro ao enviar" }, { status: 500 });

  return NextResponse.json({ success: true });
}
