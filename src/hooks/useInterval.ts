import { useEffect, useRef } from 'react';

/**
 * Hook para executar uma função em intervalos regulares
 * @param callback - Função a ser executada
 * @param delay - Delay em milissegundos (null para pausar)
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  // Lembrar da callback mais recente
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Configurar o interval
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}