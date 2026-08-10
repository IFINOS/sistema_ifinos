import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function sitemap() {
  const baseUrl = 'https://ifinos.vercel.app';

  const [{ data: noticias }, { data: projetos }, { data: demandas }] = await Promise.all([
    supabase.from('home').select('slug, updated_at'),
    supabase.from('projetos').select('slug, updated_at'),
    supabase.from('demandas').select('slug, updated_at'),
  ]);

  const noticiasUrls = (noticias ?? []).map((item) => ({
    url: `${baseUrl}/home/${item.slug}`,
    lastModified: item.updated_at ?? new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const projetosUrls = (projetos ?? []).map((item) => ({
    url: `${baseUrl}/projetos/${item.slug}`,
    lastModified: item.updated_at ?? new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const demandasUrls = (demandas ?? []).map((item) => ({
    url: `${baseUrl}/demandas/${item.slug}`,
    lastModified: item.updated_at ?? new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/projetos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/demandas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...noticiasUrls,
    ...projetosUrls,
    ...demandasUrls,
  ];
}