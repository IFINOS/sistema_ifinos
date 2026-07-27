// app/api/perfil/deletar/route.js
import { createClient as createServerSupabase } from "@/_lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function DELETE(request) {
  try {
    const supabaseSession = await createServerSupabase();
    const {
      data: { user },
    } = await supabaseSession.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(
      user.id,
      true,
    );

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const { error: dbError } = await supabase
      .from("usuarios")
      .update({ registro_ativo: false })
      .eq("id", user.id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
