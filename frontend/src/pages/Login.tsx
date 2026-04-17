import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  EnvelopeSimpleIcon, 
  LockSimpleIcon,
  CircleNotchIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@phosphor-icons/react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { AuthLayout } from "@/components/ui/auth-layout";

import {
  Card,
  CardContent,
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
      setApiError("E-mail ou senha incorretos.");
    }
  };

  return (
    <AuthLayout 
      title="Bem-vindo de volta" 
      subtitle="Acesse sua conta para gerenciar seus processos"
    >
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
                  {showPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
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
    </AuthLayout>
  );
}
