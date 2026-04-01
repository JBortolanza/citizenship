import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import { useAuthStore } from "./store/auth";

// Um componente simples para proteger rotas privadas
function RotaPrivada({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Se não estiver logado, joga para o login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, mostra o conteúdo (ex: Dashboard)
  return <>{children}</>;
}

// Componente temporário para o painel principal (você criará o real depois)
function DashboardTemporario() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Painel de Cidadania</h1>
      <p>Bem-vindo, {user?.name || user?.email}</p>
      <button
        onClick={logout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
      >
        Sair
      </button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública: Página de Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rota privada: Raiz do sistema */}
        <Route
          path="/"
          element={
            <RotaPrivada>
              <DashboardTemporario />
            </RotaPrivada>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
