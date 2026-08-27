/*
  EXPLICAÇÃO PARA LEIGOS :)

  centraliza os status possíveis de um pedido, com o rótulo (o que
  aparece pro usuário) e a cor do badge — assim, se precisar mudar
  o texto ou a cor de um status, muda só aqui, não em cada tela
  que exibe pedidos
*/
export const PEDIDO_STATUS = {
  pendente: { label: "Pendente", color: "#f5a623" },
  confirmado: { label: "Confirmado", color: "#4a90d9" },
  em_producao: { label: "Em Produção", color: "#9b59b6" },
  pronto_para_retirada: { label: "Pronto para Retirada", color: "#16a085" },
  concluido: { label: "Concluído", color: "#2ecc71" },
  cancelado: { label: "Cancelado", color: "#e74c3c" },
};

export const PEDIDO_STATUS_OPTIONS = Object.keys(PEDIDO_STATUS);
