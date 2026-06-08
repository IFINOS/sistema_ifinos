import { NextResponse } from "next/server";

// sistema do next para lidar com proteção de rotas
export default async function proxy() {
  // faz sentido colocar proteção de rotas em: login, signup, confirmar-email se ja tiver usuario
  // faz sentido colocar proteção de rotas em: cadastrar-demanda, meu-perfil?, cadastrar-projeto, qualquer rota envolvendo sistema

  return NextResponse.next();
}
