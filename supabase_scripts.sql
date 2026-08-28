
--Schema completo · SQL

-- =====================================================================
-- SCRIPT COMPLETO DE CRIAÇÃO DO SCHEMA (consolidado)
-- Junta tudo que estava espalhado/comentado no histórico de migrations
-- + as tabelas que faltavam (area_de_conhecimento e
-- area_de_conhecimento_linha_de_pesquisa) + as correções de FKs,
-- RLS e defaults discutidas.
--
-- Uso: rodar em um banco novo (do zero). Se for aplicar em um banco
-- que já existe, use "IF NOT EXISTS" / ajuste conforme necessário,
-- ou use o script incremental de correção que te passei antes.
-- =====================================================================
 
BEGIN;
 
-- =====================================================================
-- 1) TABELAS DE REFERÊNCIA (sem dependências)
-- =====================================================================
 
CREATE TABLE public.configuracoes_sistema (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 email_responsavel_produtos TEXT
);
 
CREATE TABLE public.grupos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 nome TEXT NOT NULL,
 descricao TEXT,
 padrao BOOLEAN NOT NULL DEFAULT true,
 data_criacao TIMESTAMP DEFAULT NOW()
);
 
CREATE TABLE public.permissoes (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 nome TEXT,
 descricao TEXT
);
 
CREATE TABLE public.status_projeto (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 nome TEXT
);
 
CREATE TABLE public.tipo_projeto (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 nome TEXT
);
 
CREATE TABLE public.tags (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 nome TEXT NOT NULL,
 registro_ativo BOOLEAN NOT NULL DEFAULT true
);
 
CREATE TABLE public.linha_de_pesquisa (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 nome TEXT NOT NULL,
 descricao TEXT,
 registro_ativo BOOLEAN NOT NULL DEFAULT true
);
 
-- Tabela que faltava no histórico original (existe no schema real)
CREATE TABLE public.area_de_conhecimento (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 nome TEXT NOT NULL,
 codigo INTEGER NOT NULL,
 nivel TEXT NOT NULL,
 id_referencia UUID REFERENCES public.area_de_conhecimento (id)
);
 
 
-- =====================================================================
-- 2) USUARIOS (depende de auth.users)
-- =====================================================================
 
CREATE TABLE public.usuarios (
 id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
 nome TEXT,
 avatar_url TEXT,
 registro_ativo BOOLEAN NOT NULL DEFAULT true,
 data_criacao TIMESTAMP DEFAULT NOW()
);
 
 
-- =====================================================================
-- 3) PROJETOS (depende de status_projeto, tipo_projeto,
-- linha_de_pesquisa e usuarios)
-- =====================================================================
 
CREATE TABLE public.projetos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 titulo_projeto TEXT NOT NULL,
 descricao TEXT,
 status_projeto_id UUID REFERENCES public.status_projeto (id),
 tipo_projeto_id UUID REFERENCES public.tipo_projeto (id),
 linha_de_pesquisa_id UUID REFERENCES public.linha_de_pesquisa (id),
 criado_por UUID REFERENCES public.usuarios (id),
 registro_ativo BOOLEAN NOT NULL DEFAULT true,
 data_criacao TIMESTAMP DEFAULT NOW()
);
 
 
-- =====================================================================
-- 4) TABELAS DE RELACIONAMENTO (N:N)
-- =====================================================================
 
CREATE TABLE public.usuarios_grupos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 usuario_id UUID REFERENCES public.usuarios (id),
 grupo_id UUID REFERENCES public.grupos (id),
 data_entrada TIMESTAMP DEFAULT NOW()
);
 
CREATE TABLE public.usuarios_projetos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 projeto_id UUID REFERENCES public.projetos (id),
 usuario_id UUID REFERENCES public.usuarios (id),
 funcao TEXT
);
 
CREATE TABLE public.usuarios_linha_de_pesquisa (
 linha_de_pesquisa_id UUID REFERENCES public.linha_de_pesquisa (id),
 usuario_id UUID REFERENCES public.usuarios (id),
 PRIMARY KEY (linha_de_pesquisa_id, usuario_id)
);
 
CREATE TABLE public.grupos_permissoes (
 grupo_id UUID REFERENCES public.grupos (id),
 permissoes_id UUID REFERENCES public.permissoes (id),
 PRIMARY KEY (grupo_id, permissoes_id)
);
 
CREATE TABLE public.usuarios_tags (
 tags_id UUID REFERENCES public.tags (id),
 usuario_id UUID REFERENCES public.usuarios (id),
 PRIMARY KEY (tags_id, usuario_id)
);
 
CREATE TABLE public.projetos_tags (
 tags_id UUID REFERENCES public.tags (id),
 projeto_id UUID REFERENCES public.projetos (id),
 PRIMARY KEY (tags_id, projeto_id)
);
 
-- Tabela que faltava no histórico original (existe no schema real).
-- Constraints de FK corrigidas: no schema real havia referências
-- erradas/duplicadas (uma FK apontando para "noticias" por engano,
-- e duas FKs diferentes para a mesma coluna area_de_conhecimento_id).
-- Aqui já sai certo desde a criação.
CREATE TABLE public.area_de_conhecimento_linha_de_pesquisa (
 linha_de_pesquisa_id UUID NOT NULL REFERENCES public.linha_de_pesquisa (id),
 area_de_conhecimento_id UUID NOT NULL REFERENCES public.area_de_conhecimento (id),
 PRIMARY KEY (area_de_conhecimento_id, linha_de_pesquisa_id)
);
 
 
-- =====================================================================
-- 5) NOTICIAS, PEDIDOS, PRODUTOS
-- =====================================================================
 
CREATE TABLE public.noticias (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 titulo_publicacao TEXT NOT NULL,
 resumo TEXT,
 projeto_id UUID NOT NULL REFERENCES public.projetos (id),
 usuario_id UUID NOT NULL REFERENCES public.usuarios (id),
 registro_ativo BOOLEAN NOT NULL DEFAULT true,
 img_url TEXT,
 data_publicacao TIMESTAMP,
 ultima_atualizacao TIMESTAMP DEFAULT NOW(),
 data_criacao TIMESTAMP DEFAULT NOW()
);
 
CREATE TABLE public.pedidos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 usuario_id UUID NOT NULL REFERENCES public.usuarios (id),
 status TEXT NOT NULL,
 registro_ativo BOOLEAN NOT NULL DEFAULT true,
 data_criacao TIMESTAMP DEFAULT NOW()
);
 
CREATE TABLE public.produtos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 nome TEXT NOT NULL,
 descricao TEXT,
 valor NUMERIC(14, 2) NOT NULL,
 quantidade INT NOT NULL,
 img_url TEXT,
 unidades TEXT[],
 registro_ativo BOOLEAN NOT NULL DEFAULT true
);
 
CREATE TABLE public.produtos_pedidos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 produto_id UUID NOT NULL REFERENCES public.produtos (id),
 pedido_id UUID NOT NULL REFERENCES public.pedidos (id),
 unidade TEXT,
 valor NUMERIC(14, 2) NOT NULL,
 quantidade INT NOT NULL
);
 
 
-- =====================================================================
-- 6) TRIGGER: cria registro em public.usuarios e associa ao grupo
-- "Visitantes" quando um novo usuário se registra no auth.users
-- =====================================================================
 
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
 visitantes_id UUID;
BEGIN
 INSERT INTO public.usuarios (
 id,
 nome,
 avatar_url,
 registro_ativo,
 data_criacao
 )
 VALUES (
 NEW.id,
 NEW.raw_user_meta_data->>'name',
 NEW.raw_user_meta_data->>'avatar_url',
 true,
 NOW()
 );
 
 SELECT id INTO visitantes_id
 FROM public.grupos
 WHERE lower(nome) = 'visitantes'
 LIMIT 1;
 
 INSERT INTO public.usuarios_grupos (usuario_id, grupo_id)
 VALUES (NEW.id, visitantes_id);
 
 RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
 
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
 
 
-- =====================================================================
-- 7) CONFIGURAÇÃO DE TIMEZONE
-- =====================================================================
 
ALTER DATABASE postgres SET timezone TO 'America/Sao_Paulo';
 
 
-- =====================================================================
-- 8) ROW LEVEL SECURITY — habilitar em todas as tabelas
-- (incluindo area_de_conhecimento e area_de_conhecimento_linha_de_pesquisa,
-- que não tinham RLS habilitado no histórico original)
-- =====================================================================
 
ALTER TABLE public.configuracoes_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipo_projeto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linha_de_pesquisa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_de_conhecimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_linha_de_pesquisa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_de_conhecimento_linha_de_pesquisa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos_pedidos ENABLE ROW LEVEL SECURITY;
 
 
-- =====================================================================
-- 9) FUNÇÕES AUXILIARES (usadas nas policies)
-- =====================================================================
 
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
 SELECT EXISTS (
 SELECT 1
 FROM public.usuarios_grupos ug
 JOIN public.grupos g ON g.id = ug.grupo_id
 WHERE ug.usuario_id = auth.uid()
 AND lower(g.nome) = 'administradores'
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
 
CREATE OR REPLACE FUNCTION public.is_professor()
RETURNS BOOLEAN AS $$
 SELECT EXISTS (
 SELECT 1
 FROM public.usuarios_grupos ug
 JOIN public.grupos g ON g.id = ug.grupo_id
 WHERE ug.usuario_id = auth.uid()
 AND lower(g.nome) = 'professores'
 );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
 
 
-- =====================================================================
-- 10) POLICIES
-- =====================================================================
 
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
 
-- grupos_permissoes
CREATE POLICY "admin_all_grupos_permissoes" ON public.grupos_permissoes
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
 
-- status_projeto
CREATE POLICY "public_select_status_projeto" ON public.status_projeto
 FOR SELECT USING (true);
CREATE POLICY "admin_all_status_projeto" ON public.status_projeto
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
 
-- tipo_projeto
CREATE POLICY "public_select_tipo_projeto" ON public.tipo_projeto
 FOR SELECT USING (true);
CREATE POLICY "admin_all_tipo_projeto" ON public.tipo_projeto
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
 
-- tags
CREATE POLICY "public_select_tags" ON public.tags
 FOR SELECT USING (true);
CREATE POLICY "admin_all_tags" ON public.tags
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
 
-- linha_de_pesquisa
CREATE POLICY "public_select_linha_pesquisa" ON public.linha_de_pesquisa
 FOR SELECT USING (registro_ativo = true);
CREATE POLICY "admin_all_linha_pesquisa" ON public.linha_de_pesquisa
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
 
-- area_de_conhecimento (nova — não existia policy no histórico original)
CREATE POLICY "public_select_area_de_conhecimento" ON public.area_de_conhecimento
 FOR SELECT USING (true);
CREATE POLICY "admin_all_area_de_conhecimento" ON public.area_de_conhecimento
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
 
-- area_de_conhecimento_linha_de_pesquisa (nova)
CREATE POLICY "public_select_area_conh_linha_pesq" ON public.area_de_conhecimento_linha_de_pesquisa
 FOR SELECT USING (true);
CREATE POLICY "admin_all_area_conh_linha_pesq" ON public.area_de_conhecimento_linha_de_pesquisa
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
 
-- usuarios
CREATE POLICY "public_select_usuario" ON public.usuarios
 FOR SELECT USING (true);
CREATE POLICY "usuario_update_proprio" ON public.usuarios
 FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "admin_all_usuarios" ON public.usuarios
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
 
-- usuarios_grupos
CREATE POLICY "public_select_usuario_grupo" ON public.usuarios_grupos
 FOR SELECT USING (true);
CREATE POLICY "admin_all_usuarios_grupos" ON public.usuarios_grupos
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
 
-- usuarios_tags
CREATE POLICY "public_select_usuarios_tags" ON public.usuarios_tags
 FOR SELECT USING (true);
CREATE POLICY "usuario_insert_propria_tag" ON public.usuarios_tags
 FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "usuario_delete_propria_tag" ON public.usuarios_tags
 FOR DELETE USING (auth.uid() = usuario_id);
CREATE POLICY "admin_all_usuarios_tags" ON public.usuarios_tags
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
 
-- usuarios_linha_de_pesquisa
CREATE POLICY "usuario_select_propria_linha" ON public.usuarios_linha_de_pesquisa
 FOR SELECT USING (auth.uid() = usuario_id OR public.is_admin());
CREATE POLICY "usuario_insert_propria_linha" ON public.usuarios_linha_de_pesquisa
 FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "usuario_delete_propria_linha" ON public.usuarios_linha_de_pesquisa
 FOR DELETE USING (auth.uid() = usuario_id);
CREATE POLICY "admin_all_usuario_linha" ON public.usuarios_linha_de_pesquisa
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
 
-- projetos
CREATE POLICY "public_select_projetos" ON public.projetos
 FOR SELECT USING (
 registro_ativo = true
 OR public.is_admin()
 OR public.is_membro_projeto(id)
 );
CREATE POLICY "professor_insert_projeto" ON public.projetos
 FOR INSERT TO authenticated
 WITH CHECK (public.is_professor() AND criado_por = auth.uid());
CREATE POLICY "admin_insert_projeto" ON public.projetos
 FOR INSERT TO authenticated
 WITH CHECK (public.is_admin() AND criado_por = auth.uid());
CREATE POLICY "membro_update_projeto" ON public.projetos
 FOR UPDATE
 USING (public.is_membro_projeto(id) OR public.is_admin())
 WITH CHECK (public.is_membro_projeto(id) OR public.is_admin());
CREATE POLICY "admin_delete_projeto" ON public.projetos
 FOR DELETE USING (public.is_admin());
 
-- usuarios_projetos
CREATE POLICY "public_select_usuarios_projetos" ON public.usuarios_projetos
 FOR SELECT USING (true);
CREATE POLICY "admin_all_usuarios_projetos" ON public.usuarios_projetos
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
 
-- projetos_tags
CREATE POLICY "public_select_projetos_tags" ON public.projetos_tags
 FOR SELECT USING (true);
CREATE POLICY "membro_insert_projetos_tags" ON public.projetos_tags
 FOR INSERT WITH CHECK (public.is_membro_projeto(projeto_id) OR public.is_admin());
CREATE POLICY "membro_delete_projetos_tags" ON public.projetos_tags
 FOR DELETE USING (public.is_membro_projeto(projeto_id) OR public.is_admin());
CREATE POLICY "professor_insert_projetos_tags" ON public.projetos_tags
 FOR INSERT TO authenticated WITH CHECK (public.is_professor());
CREATE POLICY "professor_delete_projetos_tags" ON public.projetos_tags
 FOR DELETE USING (public.is_professor());
 
-- noticias
CREATE POLICY "public_select_noticias" ON public.noticias
 FOR SELECT USING (true);
CREATE POLICY "membro_insert_noticia" ON public.noticias
 FOR INSERT WITH CHECK (
 auth.uid() = usuario_id AND public.is_membro_projeto(projeto_id)
 );
CREATE POLICY "admin_insert_noticia" ON public.noticias
 FOR INSERT WITH CHECK (auth.uid() = usuario_id AND public.is_admin());
CREATE POLICY "autor_update_noticia" ON public.noticias
 FOR UPDATE
 USING (auth.uid() = usuario_id OR public.is_admin())
 WITH CHECK (auth.uid() = usuario_id OR public.is_admin());
CREATE POLICY "admin_delete_noticia" ON public.noticias
 FOR DELETE USING (public.is_admin());
 
-- pedidos
CREATE POLICY "usuario_select_proprio_pedido" ON public.pedidos
 FOR SELECT USING (auth.uid() = usuario_id OR public.is_admin());
CREATE POLICY "usuario_insert_proprio_pedido" ON public.pedidos
 FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "usuario_update_proprio_pedido" ON public.pedidos
 FOR UPDATE
 USING (auth.uid() = usuario_id OR public.is_admin())
 WITH CHECK (auth.uid() = usuario_id OR public.is_admin());
CREATE POLICY "admin_delete_pedido" ON public.pedidos
 FOR DELETE USING (public.is_admin());
 
-- produtos
CREATE POLICY "auth_select_produtos" ON public.produtos
 FOR SELECT USING (auth.uid() IS NOT NULL AND registro_ativo = true);
CREATE POLICY "admin_all_produtos" ON public.produtos
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
 
-- produtos_pedidos
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
 WHERE p.id = pedido_id AND p.usuario_id = auth.uid()
 )
 );
CREATE POLICY "admin_all_produtos_pedidos" ON public.produtos_pedidos
 FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
 
 
-- =====================================================================
-- 11) VIEW usuarios_completos
-- =====================================================================
 
CREATE OR REPLACE VIEW usuarios_completos
WITH (security_invoker = false)
AS
SELECT
 u.id,
 u.nome,
 u.avatar_url,
 u.registro_ativo,
 u.data_criacao,
 a.email,
 g.nome AS grupo_nome,
 g.id AS grupo_id
FROM usuarios u
JOIN auth.users a ON u.id = a.id
LEFT JOIN usuarios_grupos ug ON u.id = ug.usuario_id
LEFT JOIN grupos g ON g.id = ug.grupo_id;
 
REVOKE SELECT ON public.usuarios_completos FROM anon, authenticated;
GRANT SELECT ON public.usuarios_completos TO service_role;
 
 
-- =====================================================================
-- 12) DADOS INICIAIS
-- =====================================================================
 
INSERT INTO public.grupos (nome, descricao, padrao) VALUES
 ('Visitantes', 'Usuário padrão com login.', true),
 ('Administradores', 'Usuários com as mais altas permissões.', false),
 ('Professores', 'Usuários com permissões de professores/orientadores', false),
 ('Membros de Projetos', 'Usuários com permissões de alunos, bolsistas e professores/orientadores.', false);
 
COMMIT;
 



