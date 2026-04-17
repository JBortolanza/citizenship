import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  EnvelopeSimple as EnvelopeSimpleIcon, 
  LockSimple as LockSimpleIcon,
  CircleNotch as CircleNotchIcon,
  Eye,
  EyeSlash,
  ShieldCheck,
  ChartLineUp,
  CheckCircle,
} from "@phosphor-icons/react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

import {
  Card,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

const FEATURES = [
  { icon: ShieldCheck, title: "Segurança de Dados", desc: "Criptografia de ponta a ponta para seus documentos." },
  { icon: ChartLineUp, title: "Acompanhamento Real", desc: "Status atualizado de cada etapa do seu processo." },
  { icon: CheckCircle, title: "Conformidade Legal", desc: "Processos em total acordo com a legislação italiana." }
];

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginForm) => {
    setApiError(null);
    try {
      const response = await api.post("/users/login", {
        email: data.email,
        password: data.password,
      });

      login(response.data);
      navigate("/", { replace: true });
    } catch (error: any) {
      setApiError(
        error.response?.data?.detail || "E-mail ou senha incorretos."
      );
    }
  };

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
              <ShieldCheck className="text-white" size={24} weight="fill" />
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
          
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Bem-vindo de volta</h2>
            <p className="text-slate-500 text-sm">Acesse sua conta para gerenciar seus processos</p>
          </div>

          <Card className="border-slate-200/60 shadow-xl shadow-slate-200/30 bg-white ring-1 ring-black/[0.02]">
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">E-mail</Label>
                  <div className="relative group">
                    <EnvelopeSimpleIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="usuario@exemplo.com" 
                      className="pl-11 h-12 border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl" 
                      {...register("email")} 
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs font-semibold text-destructive mt-1.5 ml-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700 font-medium">Senha</Label>
                    <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                      Esqueceu a senha?
                    </a>
                  </div>
                  <div className="relative group">
                    <LockSimpleIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="pl-11 pr-11 h-12 border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl" 
                      {...register("password")} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs font-semibold text-destructive mt-1.5 ml-1">{errors.password.message}</p>
                  )}
                </div>

                {apiError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {apiError}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98]" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <CircleNotchIcon className="h-5 w-5 animate-spin" />
                      <span>Autenticando...</span>
                    </div>
                  ) : (
                    "Acessar Sistema"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="pb-8 pt-2 flex flex-col gap-4 px-8">
              <div className="w-full h-px bg-slate-100" />
              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                Ambiente seguro com certificação SSL. Suas informações estão protegidas de acordo com a LGPD e GDPR.
              </p>
            </CardFooter>
          </Card>

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
