import { ShieldCheckIcon, ChartLineUpIcon, CheckCircleIcon } from "@phosphor-icons/react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const FEATURES = [
  { icon: ShieldCheckIcon, title: "Segurança de Dados", desc: "Criptografia de ponta a ponta para seus documentos." },
  { icon: ChartLineUpIcon, title: "Acompanhamento Real", desc: "Status atualizado de cada etapa do seu processo." },
  { icon: CheckCircleIcon, title: "Conformidade Legal", desc: "Processos em total acordo com a legislação italiana." }
];

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white font-sans overflow-hidden">
      {/* Lado Esquerdo - Informativo (Oculto em Mobile) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-950 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(30,58,138,0.2),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(30,58,138,0.15),transparent_50%)]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="text-white" size={24} weight="fill" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight uppercase">Portal da Cidadania Italiana</span>
          </div>

          <div className="max-w-md space-y-6">
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Gestão Inteligente de Processos de Nacionalidade
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Sua ponte segura e eficiente para a cidadania europeia. Tecnologia a serviço do seu direito.
            </p>
          </div>

          <div className="mt-16 space-y-8">
            {FEATURES.map((feature, idx) => (
              <div key={idx} className="flex gap-4 items-start group">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-blue-500 group-hover:scale-110 transition-transform">
                  <feature.icon size={22} weight="duotone" />
                </div>
                <div>
                  <h3 className="text-slate-100 font-semibold mb-1">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-snug">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-slate-900 flex justify-between items-center text-slate-500 text-xs font-medium">
          <span>© {new Date().getFullYear()} Gestão de Cidadania</span>
          <div className="flex gap-6 uppercase tracking-wider">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Suporte</a>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex flex-col justify-center items-center p-6 lg:p-12 bg-slate-50/50">
        <div className="w-full max-w-md space-y-8 relative">
          
          {(title || subtitle) && (
            <div className="text-center lg:text-left space-y-2">
              {title && <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>}
              {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
            </div>
          )}

          {children}

          {/* Mobile Footer */}
          <div className="lg:hidden text-center space-y-4 pt-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              © {new Date().getFullYear()} Gestão de Cidadania
            </p>
            <div className="flex justify-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              <a href="#">Privacidade</a>
              <a href="#">Termos</a>
              <a href="#">Suporte</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
