import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const [{ data: noticias }, { data: projetos }, { data: demandas }] =
    await Promise.all([
      supabase
        .from("noticias")
        .select("id, data_publicacao")
        .filter("registro_ativo", "eq", true)
        .not("data_publicacao", "is", null),
      supabase
        .from("projetos")
        .select("id, data_criacao, tipo_projeto!inner(nome)")
        .filter("registro_ativo", "eq", true)
        .eq("tipo_projeto.nome", "Projeto"),
      supabase
        .from("projetos")
        .select("id, data_criacao, tipo_projeto!inner(nome)")
        .filter("registro_ativo", "eq", true)
        .eq("tipo_projeto.nome", "Demanda"),
    ]);

  const noticiasUrls = (noticias ?? []).map((item) => ({
    url: `${baseUrl}/noticias/${item.id}`,
    lastModified: item.data_publicacao ?? new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const projetosUrls = (projetos ?? []).map((item) => ({
    url: `${baseUrl}/projetos/${item.id}`,
    lastModified: item.data_criacao ?? new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const demandasUrls = (demandas ?? []).map((item) => ({
    url: `${baseUrl}/demandas/${item.id}`,
    lastModified: item.data_criacao ?? new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    {
      url: `${baseUrl}/home`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/noticias`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projetos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/demandas`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...noticiasUrls,
    ...projetosUrls,
    ...demandasUrls,
  ];
}
