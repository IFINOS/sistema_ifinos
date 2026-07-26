// Hooks
import { useEffect, useRef, useState } from "react";

/*
  EXPLICAÇÃO PARA LEIGOS :)

  esse hook resolve o problema do loading piscar na tela

  quando uma busca é rápida demais (ex: 100ms), mostrar e esconder
  o spinner nesse intervalo curto passa a sensação de bug pro usuário

  resolvemos isso com duas regras:

  - delay: só mostra o loading se a operação demorar mais que X ms
    (se a resposta vier antes disso, o usuário nunca vê o spinner)

  - minDuration: uma vez que o loading APARECEU na tela, ele fica visível
    por pelo menos X ms, mesmo que a operação real já tenha terminado
    (evita o loading aparecer e sumir rápido demais, o que também pisca)

  ATENÇÃO:
  isLoading deve vir de um estado já existente (ex: profileLoading || userLoading)
  esse hook não busca dado nenhum, ele só "atrasa" a exibição do loading em cima
  de um isLoading que você já controla
*/
export function useSmartLoading(
  isLoading,
  { delay = 250, minDuration = 400 } = {},
) {
  const [showLoading, setShowLoading] = useState(false);

  // guarda o timestamp de quando o loading passou a aparecer de verdade na tela
  // usado pra calcular quanto tempo falta pra bater a duração mínima
  const shownAtRef = useRef(null);

  useEffect(() => {
    let delayTimeout;
    let minDurationTimeout;

    if (isLoading) {
      // só agenda mostrar o loading depois do delay
      // se isLoading virar false antes disso, o timeout é cancelado no cleanup
      // e o spinner nunca chega a aparecer (esse é o caso "rápido demais")
      delayTimeout = setTimeout(() => {
        shownAtRef.current = Date.now();
        setShowLoading(true);
      }, delay);
    } else if (shownAtRef.current) {
      // a operação terminou, mas o loading já estava sendo mostrado
      // calcula quanto tempo ele já ficou visível e completa o restante
      // da duração mínima antes de esconder
      const elapsed = Date.now() - shownAtRef.current;
      const remaining = Math.max(minDuration - elapsed, 0);

      minDurationTimeout = setTimeout(() => {
        setShowLoading(false);
        shownAtRef.current = null;
      }, remaining);
    } else {
      setShowLoading(false);
    }

    return () => {
      clearTimeout(delayTimeout);
      clearTimeout(minDurationTimeout);
    };
  }, [isLoading, delay, minDuration]);

  return showLoading;
}
