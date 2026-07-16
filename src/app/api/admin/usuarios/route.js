import { createClient as createServerSupabase } from "@/_lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/*
  EXPLICAÇÃO PARA LEIGOS :)

  esse route handler lida com operações administrativas de usuários
  que não podem ser feitas pelo client-side por segurança

  a service_role key ignora o RLS e tem acesso total ao banco
  por isso ela só pode ser usada aqui no servidor, nunca no browser

  operações disponíveis:
  - PATCH: atualiza email, nome e/ou grupo do usuário
  - DELETE: remove o usuário do sistema
*/

// cria um cliente com a service_role key para operações administrativas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function PATCH(request) {
  try {
    const { userId, email, nome, grupoId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 },
      );
    }

    if (nome && nome.length > 64) {
      return NextResponse.json(
        { error: "Nome de usuário ultrapassa o limite" },
        { status: 403 },
      );
    }

    // atualiza o email no auth.users se foi fornecido
    if (nome || email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          ...(email && { email }),
          ...(nome && { user_metadata: { name: nome } }),
        },
      );

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 500 });
      }
    }

    // atualiza o nome na tabela usuarios se foi fornecido
    if (nome) {
      const { error: userError } = await supabase
        .from("usuarios")
        .update({ nome })
        .eq("id", userId);

      if (userError) {
        return NextResponse.json({ error: userError.message }, { status: 500 });
      }
    }

    // atualiza o grupo do usuário se foi fornecido
    // remove o grupo atual e insere o novo
    if (grupoId) {
      const { error: deleteError } = await supabase
        .from("usuarios_grupos")
        .delete()
        .eq("usuario_id", userId);

      if (deleteError) {
        return NextResponse.json(
          { error: deleteError.message },
          { status: 500 },
        );
      }

      const { error: insertError } = await supabase
        .from("usuarios_grupos")
        .insert({ usuario_id: userId, grupo_id: grupoId });

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const supabaseSession = await createServerSupabase();

    const {
      data: { user },
    } = await supabaseSession.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { data: grupos, error: gruposError } = await supabaseSession
      .from("usuarios_grupos")
      .select("grupos(nome)")
      .eq("usuario_id", user.id);

    const groupNames = grupos?.map((g) => g.grupos.nome) ?? [];

    if (gruposError || !groupNames === "Administradores") {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 0);
    const query = searchParams.get("query") ?? "";

    const from = page * 10;
    const to = from + 9;

    let req = supabase
      .from("usuarios_completos")
      .select("*", { count: "exact" })
      .filter("registro_ativo", "eq", true)
      .order("nome", { ascending: true })
      .range(from, to);

    if (query) req = req.ilike("nome", `%${query}%`);

    const { data, error, count } = await req;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: data, count });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "UserId é obrigatório!" },
        { status: 400 },
      );
    }

    // soft delete no auth.users, preserva os dados mas desativa a conta
    const { data: authData, error: authError } =
      await supabase.auth.admin.deleteUser(userId, true);

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const { error: dbError } = await supabase
      .from("usuarios")
      .update({ registro_ativo: false })
      .eq("id", userId);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
