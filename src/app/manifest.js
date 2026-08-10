export default function manifest() {
  return {
    name: "ifinos –  Grupo de pesquisa em Computação Física e Sistemas Embarcados",
    short_name: "ifinos",
    description: "Grupo de pesquisa em Computação Física e Sistemas Embarcados",
    start_url: "/home",
    display: "standalone",
    background_color: "#f3f3f2",
    theme_color: "#00b82b",
    lang: "pt-BR",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
