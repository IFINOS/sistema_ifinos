create table configuracoes_sistema (
 id UUID primary key default gen_random_uuid (),
 email_responsavel_produtos TEXT
);

create table grupos (
 id UUID primary key default gen_random_uuid (),
 nome TEXT not null,
 descricao TEXT,
 padrao BOOLEAN default true,
 data_criacao TIMESTAMP default NOW()
);

create table permissoes (
 id UUID primary key default gen_random_uuid (),
 nome TEXT,
 descricao TEXT
);

create table status_projeto (
 id UUID primary key default gen_random_uuid (),
 nome TEXT
);

create table tipo_projeto (
 id UUID primary key default gen_random_uuid (),
 nome TEXT
);

create table tags (
 id UUID primary key default gen_random_uuid (),
 nome TEXT not null,
 registro_ativo BOOLEAN default true
);

create table linha_de_pesquisa (
 id UUID primary key default gen_random_uuid (),
 nome TEXT not null,
 descricao TEXT,
 registro_ativo BOOLEAN default true
);

create table usuarios (
 id UUID primary key references auth.users (id) on delete CASCADE,
 nome TEXT,
 avatar_url TEXT,
 registro_ativo BOOLEAN default true,
 data_criacao TIMESTAMP default NOW()
);

create table projetos (
 id UUID primary key default gen_random_uuid (),
 titulo_projeto TEXT not null,
 descricao TEXT,
 status_projeto_id UUID references public.status_projeto (id),
 tipo_projeto_id UUID references public.tipo_projeto (id),
 registro_ativo BOOLEAN default true,
 data_criacao TIMESTAMP default NOW()
);

create table usuarios_grupos (
 id UUID primary key default gen_random_uuid (),
 usuario_id UUID references public.usuarios (id),
 grupo_id UUID references public.grupos (id),
 data_entrada TIMESTAMP default NOW()
);

create table usuarios_projetos (
 id UUID primary key default gen_random_uuid (),
 projeto_id UUID references public.projetos (id),
 usuario_id UUID references public.usuarios (id),
 funcao TEXT
);

create table usuarios_linha_de_pesquisa (
 linha_de_pesquisa_id UUID references public.linha_de_pesquisa (id),
 usuario_id UUID references public.usuarios (id),
 primary key (linha_de_pesquisa_id, usuario_id)
);

create table grupos_permissoes (
 grupo_id UUID references public.grupos (id),
 permissoes_id UUID references public.permissoes (id),
 primary key (grupo_id, permissoes_id)
);

create table usuarios_tags (
 tags_id UUID references public.tags (id),
 usuario_id UUID references public.usuarios (id),
 primary key (tags_id, usuario_id)
);

create table projetos_tags (
 tags_id UUID references public.tags (id),
 projeto_id UUID references public.projetos (id),
 primary key (tags_id, projeto_id)
);

create table noticias (
 id UUID primary key default gen_random_uuid (),
 titulo_publicacao TEXT not null,
 resumo TEXT,
 projeto_id UUID references public.projetos (id) not null,
 usuario_id UUID references public.usuarios (id) not null,
 registro_ativo BOOLEAN default true,
 img_url TEXT,
 data_criacao TIMESTAMP default NOW()
);

create table pedidos (
 id UUID primary key default gen_random_uuid (),
 usuario_id UUID references public.usuarios (id) not null,
 status TEXT not null,
 registro_ativo BOOLEAN default true,
 data_criacao TIMESTAMP default NOW()
);

create table produtos (
 id UUID primary key default gen_random_uuid (),
 nome TEXT not null,
 descricao TEXT,
 valor NUMERIC(14, 2) not null,
 quantidade INT not null,
 img_url TEXT,
 unidades text[],
 registro_ativo BOOLEAN default true
);

create table produtos_pedidos (
 id UUID primary key default gen_random_uuid (),
 produto_id UUID references public.produtos (id) not null,
 pedido_id UUID references public.pedidos (id) not null,
 unidade TEXT,
 valor NUMERIC(14, 2) not null,
 quantidade INT not null
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
 INSERT INTO public.usuarios (
   id,
   nome,
   avatar_url,
   tipo_usuario,
   registro_ativo,
   data_criacao
 )
 VALUES (
   NEW.id,
   NEW.raw_user_meta_data->>'name',
   NEW.raw_user_meta_data->>'avatar_url',
   'visitante',
   true,
   NOW()
 );
 RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

create trigger on_auth_user_created
after INSERT on auth.users for EACH row
execute FUNCTION public.handle_new_user ();

ALTER DATABASE postgres SET timezone TO 'America/Sao_Paulo';
ALTER TABLE configuracoes_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipo_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE linha_de_pesquisa ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_linha_de_pesquisa ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupos_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos_pedidos ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
 SELECT EXISTS (
   SELECT 1
   FROM public.usuarios_grupos ug
   JOIN public.grupos g ON g.id = ug.grupo_id
   WHERE ug.usuario_id = auth.uid()
     AND lower(g.nome) = 'admin'
 );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_membro_projeto(p_projeto_id UUID)
RETURNS BOOLEAN AS $$
 SELECT EXISTS (
   SELECT 1
   FROM public.usuarios_projetos
   WHERE usuario_id = auth.uid()
     AND projeto_id = p_projeto_id
 );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- configuracoes_sistema
CREATE POLICY "admin_all_config" ON public.configuracoes_sistema
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- grupos
CREATE POLICY "public_select_grupos" ON public.grupos
 FOR SELECT USING (true);

CREATE POLICY "admin_all_grupos" ON public.grupos
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- permissoes
CREATE POLICY "admin_all_permissoes" ON public.permissoes
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -- grupos_permissoes
CREATE POLICY "admin_all_grupos_permissoes" ON public.grupos_permissoes
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -- status_projeto e tipo_projeto
CREATE POLICY "public_select_status_projeto" ON public.status_projeto
 FOR SELECT USING (true);

CREATE POLICY "admin_all_status_projeto" ON public.status_projeto
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "public_select_tipo_projeto" ON public.tipo_projeto
 FOR SELECT USING (true);

CREATE POLICY "admin_all_tipo_projeto" ON public.tipo_projeto
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -- tags
CREATE POLICY "auth_select_tags" ON public.tags
 FOR SELECT USING (auth.uid() IS NOT NULL AND registro_ativo = true);

CREATE POLICY "admin_all_tags" ON public.tags
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -- linha_de_pesquisa
CREATE POLICY "auth_select_linha_pesquisa" ON public.linha_de_pesquisa
 FOR SELECT USING (auth.uid() IS NOT NULL AND registro_ativo = true);

CREATE POLICY "admin_all_linha_pesquisa" ON public.linha_de_pesquisa
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -- usuarios
CREATE POLICY "public_select_usuario" ON public.usuarios
 FOR SELECT USING (true);

CREATE POLICY "usuario_update_proprio" ON public.usuarios
 FOR UPDATE USING (auth.uid() = id)
 WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_all_usuarios" ON public.usuarios
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -- usuarios_grupos
CREATE POLICY "public_select_usuario_grupo" ON public.usuarios_grupos
 FOR SELECT USING (true);

CREATE POLICY "admin_all_usuarios_grupos" ON public.usuarios_grupos
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -- usuarios_tags
CREATE POLICY "public_select_tags" ON public.usuarios_tags
 FOR SELECT USING (true);

CREATE POLICY "usuario_insert_propria_tag" ON public.usuarios_tags
 FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "usuario_delete_propria_tag" ON public.usuarios_tags
 FOR DELETE USING (auth.uid() = usuario_id);

CREATE POLICY "admin_all_usuarios_tags" ON public.usuarios_tags
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -- usuarios_linha_de_pesquisa
CREATE POLICY "usuario_select_propria_linha" ON public.usuarios_linha_de_pesquisa
 FOR SELECT USING (auth.uid() = usuario_id OR public.is_admin());

CREATE POLICY "usuario_insert_propria_linha" ON public.usuarios_linha_de_pesquisa
 FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "usuario_delete_propria_linha" ON public.usuarios_linha_de_pesquisa
 FOR DELETE USING (auth.uid() = usuario_id);

CREATE POLICY "admin_all_usuario_linha" ON public.usuarios_linha_de_pesquisa
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -- projetos
CREATE POLICY "membro_select_projeto" ON public.projetos
 FOR SELECT USING (
   public.is_membro_projeto(id) OR public.is_admin()
 );

CREATE POLICY "auth_insert_projeto" ON public.projetos
 FOR INSERT TO AUTHENTICATED WITH CHECK ((select auth.uid() IS NOT NULL));

CREATE POLICY "membro_update_projeto" ON public.projetos
 FOR UPDATE USING (public.is_membro_projeto(id) OR public.is_admin())
 WITH CHECK (public.is_membro_projeto(id) OR public.is_admin());

CREATE POLICY "admin_delete_projeto" ON public.projetos
 FOR DELETE USING (public.is_admin());


-- -- usuarios_projetos
CREATE POLICY "public_select_usuarios_projetos" ON public.usuarios_projetos
 FOR SELECT USING (true);

CREATE POLICY "admin_all_usuarios_projetos" ON public.usuarios_projetos
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -- projetos_tags
CREATE POLICY "public_select_projetos_tags" ON public.projetos_tags
 FOR SELECT USING (true);

CREATE POLICY "membro_insert_projetos_tags" ON public.projetos_tags
 FOR INSERT WITH CHECK (
   public.is_membro_projeto(projeto_id) OR public.is_admin()
 );

CREATE POLICY "membro_delete_projetos_tags" ON public.projetos_tags
 FOR DELETE USING (
   public.is_membro_projeto(projeto_id) OR public.is_admin()
 );


-- -- noticias
CREATE POLICY "public_select_noticias" ON public.noticias
 FOR SELECT USING (true);

CREATE POLICY "membro_insert_noticia" ON public.noticias
 FOR INSERT WITH CHECK (
   auth.uid() = usuario_id
   AND public.is_membro_projeto(projeto_id)
 );

CREATE POLICY "autor_update_noticia" ON public.noticias
 FOR UPDATE USING (auth.uid() = usuario_id OR public.is_admin())
 WITH CHECK (auth.uid() = usuario_id OR public.is_admin());

CREATE POLICY "admin_delete_noticia" ON public.noticias
 FOR DELETE USING (public.is_admin());


-- -- pedidos
CREATE POLICY "usuario_select_proprio_pedido" ON public.pedidos
 FOR SELECT USING (auth.uid() = usuario_id OR public.is_admin());

CREATE POLICY "usuario_insert_proprio_pedido" ON public.pedidos
 FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "usuario_update_proprio_pedido" ON public.pedidos
 FOR UPDATE USING (auth.uid() = usuario_id OR public.is_admin())
 WITH CHECK (auth.uid() = usuario_id OR public.is_admin());

CREATE POLICY "admin_delete_pedido" ON public.pedidos
 FOR DELETE USING (public.is_admin());


-- -- produtos
CREATE POLICY "auth_select_produtos" ON public.produtos
 FOR SELECT USING (
   auth.uid() IS NOT NULL AND registro_ativo = true
 );

CREATE POLICY "admin_all_produtos" ON public.produtos
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -- produtos_pedidos
CREATE POLICY "usuario_select_produtos_pedidos" ON public.produtos_pedidos
 FOR SELECT USING (
   EXISTS (
     SELECT 1 FROM public.pedidos p
     WHERE p.id = pedido_id
       AND (p.usuario_id = auth.uid() OR public.is_admin())
   )
 );

CREATE POLICY "usuario_insert_produtos_pedidos" ON public.produtos_pedidos
 FOR INSERT WITH CHECK (
   EXISTS (
     SELECT 1 FROM public.pedidos p
     WHERE p.id = pedido_id
       AND p.usuario_id = auth.uid()
   )
 );

CREATE POLICY "admin_all_produtos_pedidos" ON public.produtos_pedidos
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());