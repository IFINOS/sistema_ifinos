/*
  EXPLICAÇÃO PARA LEIGOS :)

  gera a lista de "o que mostrar" nos botões de paginação, sem listar
  todas as páginas quando são muitas (ex: 50 páginas viraria 50 botões,
  quebrando o layout)

  a ideia: sempre mostra a primeira e a última página, mais um número
  limitado de páginas "ao redor" da página atual — o resto vira "..."

  exemplo com currentPage = 5 (0-indexed, ou seja "página 6" pro usuário),
  totalPages = 20, siblingCount = 1:
  [0, "...", 4, 5, 6, "...", 19]
*/
export function get_pagination_range(
  currentPage,
  totalPages,
  siblingCount = 1,
  boundaryCount = 2, // quantos números fixos aparecem no início/fim 
) {
  // páginas suficientes pra mostrar todas sem reticências
  const totalNumbersToShow = siblingCount * 2 + boundaryCount + 3;
  if (totalPages <= totalNumbersToShow) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 0);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1);

  const showLeftDots = leftSibling > boundaryCount;
  const showRightDots = rightSibling < totalPages - 1 - boundaryCount;

  if (!showLeftDots && showRightDots) {
    // perto do início: mostra mais páginas iniciais, reticências só no fim
    const leftRangeLength = boundaryCount + siblingCount * 2 + 1;
    const leftRange = Array.from({ length: leftRangeLength }, (_, i) => i);
    return [...leftRange, "...", totalPages - 1];
  }

  if (showLeftDots && !showRightDots) {
    // perto do fim: reticências só no início
    const rightRangeLength = boundaryCount + siblingCount * 2 + 1;
    const rightRange = Array.from(
      { length: rightRangeLength },
      (_, i) => totalPages - rightRangeLength + i,
    );
    return [0, "...", ...rightRange];
  }

  // no meio: reticências dos dois lados
  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i,
  );
  return [0, "...", ...middleRange, "...", totalPages - 1];
}
