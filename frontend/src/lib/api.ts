// src/lib/api.ts
import axios from "axios";
import { useAuthStore } from "@/store/auth";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Garante envio dos cookies httpOnly
});

// Adiciona um interceptador nas RESPOSTAS da API
api.interceptors.response.use(
  (response) => {
    // Se a requisição deu sucesso, apenas repassa a resposta
    return response;
  },
  async (error) => {
    // Guarda a requisição original que falhou
    const originalRequest = error.config;

    // Se o erro for 401 (Não autorizado) e ainda não tentamos refazer a requisição (_retry)
    // E garante que não estamos tentando interceptar a própria rota de login ou refresh (para evitar loop infinito)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/login" &&
      originalRequest.url !== "/auth/refresh"
    ) {
      originalRequest._retry = true; // Marca que estamos tentando novamente

      try {
        // Chama a rota do seu backend responsável por ler o refresh_token (cookie)
        // e enviar um novo access_token (também via set-cookie)
        await api.post("/auth/refresh");

        // Se o refresh deu certo, o navegador já salvou o novo cookie.
        // Agora, refazemos a requisição original que havia falhado no início.
        return api(originalRequest);
      } catch (refreshError) {
        // Se a rota de refresh também der erro (ex: o refresh_token também expirou)
        // Precisamos deslogar o usuário e mandar para a tela de login

        useAuthStore.getState().logout(); // Limpa o estado do Zustand

        // Redireciona para o login (forçando reload limpa o cache da memória)
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    // Se o erro não for 401, ou se já tentamos o refresh, apenas repassa o erro para o componente
    return Promise.reject(error);
  },
);
