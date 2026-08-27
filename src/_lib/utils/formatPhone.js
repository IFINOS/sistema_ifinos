/*
  EXPLICAÇÃO PARA LEIGOS :)

  formata um número de telefone brasileiro enquanto o usuário digita

  aceita tanto celular (11 dígitos, com o 9) quanto fixo (10 dígitos)
  remove tudo que não for número antes de formatar, então funciona
  mesmo se o usuário colar um número já formatado ou com caracteres estranhos
*/
export function formatarTelefone(valor) {
  const apenasNumeros = valor.replace(/\D/g, "").slice(0, 11);

  if (apenasNumeros.length <= 2) {
    return apenasNumeros.replace(/^(\d*)/, "($1");
  }

  if (apenasNumeros.length <= 6) {
    return apenasNumeros.replace(/^(\d{2})(\d*)/, "($1) $2");
  }

  if (apenasNumeros.length <= 10) {
    // fixo: (XX) XXXX-XXXX
    return apenasNumeros.replace(/^(\d{2})(\d{4})(\d*)/, "($1) $2-$3");
  }

  // celular: (XX) XXXXX-XXXX
  return apenasNumeros.replace(/^(\d{2})(\d{5})(\d*)/, "($1) $2-$3");
}
