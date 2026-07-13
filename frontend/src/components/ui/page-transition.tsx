import { useState, useEffect } from "react";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useLocation } from "react-router-dom"; // 1. Importe o useLocation

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(true);
  const location = useLocation(); // 2. Pegue as informações da URL atual

  useEffect(() => {
    // 3. Força o estado para true sempre que a rota mudar
    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [location.pathname]); // 4. Adicione a URL (pathname) como dependência!

  if (isTransitioning) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <CircleNotchIcon className="w-10 h-10 animate-spin text-slate-900 mb-4" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          Carregando...
        </p>
      </div>
    );
  }

  // Quando termina o tempo, renderiza a página com um fade-in
  return (
    // Usamos a key para garantir que a animação de fade-in recomece na troca
    <div key={location.pathname} className="animate-in fade-in duration-500">
      {children}
    </div>
  );
}
