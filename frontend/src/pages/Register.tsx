import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User,
  EnvelopeSimpleIcon,
  LockSimpleIcon,
  CircleNotchIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@phosphor-icons/react";

import { api } from "@/lib/api";
import { AuthLayout } from "@/components/ui/auth-layout";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Zod schema to enforce password rules
const passwordSchema = z
  .string()
  .min(8, { message: "A senha deve conter no mínimo 8 caractere." })
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

const registerSchema = z
  .object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    email: z.email("Digite um e-mail válido"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setApiError(null);
    try {
      await api.post("/users/register", {
        full_name: data.name,
        email: data.email,
        password: data.password,
      });

      // Redireciona para o login após o cadastro com sucesso
      navigate("/login", { replace: true });
    } catch (error: any) {
      setApiError(
        error.response?.data?.detail || "Erro ao criar conta. Tente novamente.",
      );
    }
  };

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Cadastre-se para gerenciar seus processos de cidadania"
    >
      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/30 bg-white ring-1 ring-black/[0.02]">
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Campo: Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-medium">
                Nome Completo
              </Label>
              <div className="relative group">
                <User
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  size={18}
                />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  className="pl-11 h-12 border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-semibold text-destructive mt-1.5 ml-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Campo: E-mail */}
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
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-semibold text-destructive mt-1.5 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo: Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Senha
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
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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

            {/* Campo: Confirmar Senha */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-slate-700 font-medium"
              >
                Confirmar Senha
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
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {apiError}
              </div>
            )}

            {/* Ações do Formulário */}
            <div className="space-y-4 pt-2">
              <Button
                type="submit"
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <CircleNotchIcon className="h-5 w-5 animate-spin" />
                    <span>Criando conta...</span>
                  </div>
                ) : (
                  "Cadastrar"
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
                disabled={isSubmitting}
              >
                Voltar para o Login
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
