import { create } from "zustand";

export interface User {
  id: number | string;
  email: string;
  name?: string;
  role: string;
  is_active: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true, // Start as true to prevent premature redirects on refresh

  login: (userData) =>
    set({
      isAuthenticated: true,
      user: userData,
      isLoading: false,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    }),

  checkAuth: async () => {
    try {
      // Calls a FastAPI endpoint (e.g., GET /users/me) that reads your HttpOnly access_token cookie
      const response = await fetch("/api/users/me", {
        method: "GET",
        credentials: "include", // Essential for sending cookies cross-origin/locally
      });

      if (response.ok) {
        const userData: User = await response.json();
        set({ isAuthenticated: true, user: userData, isLoading: false });
      } else {
        set({ isAuthenticated: false, user: null, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },
}));
