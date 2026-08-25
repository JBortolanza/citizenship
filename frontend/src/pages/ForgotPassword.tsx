import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  EnvelopeSimpleIcon,
  CircleNotchIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { AuthLayout } from "@/components/ui/auth-layout";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const forgotPasswordSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Se o usuário já estiver logado, redireciona para a home
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: ForgotPasswordForm) => {
    setApiError(null);
    setSuccessMessage(null);

    try {
      await api.post("/users/forgot-password", {
        email: data.email,
      });

      setSuccessMessage(
        "Se o e-mail estiver cadastrado, você receberá um link com as instruções para redefinir sua senha.",
      );
    } catch (error: any) {
      setApiError(
        "Não foi possível processar sua solicitação no momento. Tente novamente.",
      );
    }
  };

  return (
    <AuthLayout
      title="Recuperar Senha"
      subtitle="Digite seu e-mail para receber um link de redefinição de senha"
    >
      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/30 bg-white ring-1 ring-black/[0.02]">
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                E-mail
              </Label>
              <div className="relative group">
                <EnvelopeSimpleIcon
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={18}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  className="pl-11 h-12 border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                  disabled={isSubmitting || !!successMessage}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-semibold text-destructive mt-1.5 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {apiError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {apiError}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl font-medium flex items-start gap-2 animate-in fade-in slide-in-from-top-1 leading-relaxed">
                <CheckCircleIcon
                  className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                  weight="fill"
                />
                {successMessage}
              </div>
            )}

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                disabled={isSubmitting || !!successMessage}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <CircleNotchIcon className="h-5 w-5 animate-spin" />
                    <span>Enviando...</span>
                  </div>
                ) : (
                  "Enviar link de recuperação"
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-white px-3 text-slate-400">Ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full h-12 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-all active:scale-[0.98]"
              >
                Voltar para o login
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="pb-8 pt-2 flex flex-col gap-4 px-8">
          <div className="w-full h-px bg-slate-100" />
          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Ambiente seguro com certificação SSL.
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
