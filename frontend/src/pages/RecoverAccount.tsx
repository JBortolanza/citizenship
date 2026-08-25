import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CircleNotchIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { AuthLayout } from "@/components/ui/auth-layout";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function RecoverAccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Evita execução duplicada no modo estrito do React (React.StrictMode)
  const hasCalledApi = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }

    if (!token) {
      setStatus("error");
      setErrorMessage("Token de reativação ausente ou inválido.");
      return;
    }

    if (hasCalledApi.current) return;
    hasCalledApi.current = true;

    const reactivateAccount = async () => {
      try {
        await api.post(`/users/recover-confirm?token=${token}`);
        setStatus("success");
      } catch (error: any) {
        setStatus("error");
        setErrorMessage(
          error.response?.data?.detail ||
            "Não foi possível reativar sua conta. O link pode ter expirado.",
        );
      }
    };

    reactivateAccount();
  }, [token, isAuthenticated, navigate]);

  return (
    <AuthLayout
      title="Reativação de Conta"
      subtitle="Aguarde enquanto processamos a reativação da sua conta"
    >
      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/30 bg-white ring-1 ring-black/[0.02]">
        <CardContent className="pt-8 text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <CircleNotchIcon className="h-12 w-12 text-blue-600 animate-spin" />
              <p className="text-sm font-medium text-slate-600">
                Validando token e reativando sua conta...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircleIcon
                  className="w-10 h-10 text-emerald-500"
                  weight="fill"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">
                  Conta reativada com sucesso!
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Sua conta está ativa novamente. Você já pode fazer login e
                  utilizar a plataforma.
                </p>
              </div>
              <Button
                onClick={() => navigate("/login")}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98] mt-2"
              >
                Ir para o Login
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <XCircleIcon className="w-10 h-10 text-red-500" weight="fill" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">
                  Falha na reativação
                </h3>
                <p className="text-xs text-red-600 max-w-xs mx-auto font-medium">
                  {errorMessage}
                </p>
              </div>
              <div className="w-full space-y-3 pt-2">
                <Button
                  onClick={() => navigate("/recover-account")}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                >
                  Solicitar novo link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="w-full h-12 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-all active:scale-[0.98]"
                >
                  Voltar para o login
                </Button>
              </div>
            </div>
          )}
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
