import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  LockSimpleIcon,
  CircleNotchIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { AuthLayout } from "@/components/ui/auth-layout";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const passwordSchema = z
  .string()
  .min(8, { message: "A senha deve conter no mínimo 8 caracteres." })
  .max(50, { message: "A senha não deve conter mais de 50 caracteres." })
  .refine((password) => /[A-Z]/.test(password), {
    message: "A senha deve conter pelo menos uma letra maiúscula.",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "A senha deve conter pelo menos uma letra minúscula.",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "A senha deve conter pelo menos um número.",
  })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    message: "A senha deve conter pelo menos um caractere especial.",
  });

// Schema estendido com a confirmação de senha
const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"], // Define onde o erro vai aparecer
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Captura o token da URL

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: ResetPasswordForm) => {
    setApiError(null);
    setSuccessMessage(null);

    if (!token) {
      setApiError("Token de recuperação inválido ou ausente na URL.");
      return;
    }

    try {
      await api.post(`/users/reset-password?token=${token}`, {
        new_password: data.password,
      });

      setSuccessMessage("Sua senha foi redefinida com sucesso!");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (error: any) {
      console.error(error.response?.data);
      setApiError(
        "Não foi possível redefinir a senha. Verifique se o token é válido ou tente novamente.",
      );
    }
  };

  return (
    <AuthLayout
      title="Criar nova senha"
      subtitle="Defina uma nova senha segura para acessar sua conta"
    >
      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/30 bg-white ring-1 ring-black/[0.02]">
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo: Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Nova Senha
              </Label>
              <div className="relative group">
                <LockSimpleIcon
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={18}
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-12 border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                  disabled={isSubmitting || !!successMessage}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting || !!successMessage}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeSlashIcon size={18} />
                  ) : (
                    <EyeIcon size={18} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-semibold text-destructive mt-1.5 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Campo: Confirmar Nova Senha */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-slate-700 font-medium"
              >
                Confirmar Nova Senha
              </Label>
              <div className="relative group">
                <LockSimpleIcon
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={18}
                />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-12 border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                  disabled={isSubmitting || !!successMessage}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting || !!successMessage}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon size={18} />
                  ) : (
                    <EyeIcon size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-semibold text-destructive mt-1.5 ml-1">
                  {errors.confirmPassword.message}
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
                    <span>Redefinindo...</span>
                  </div>
                ) : (
                  "Redefinir senha"
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
