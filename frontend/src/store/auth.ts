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
  login: (userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,

  login: (userData) =>
    set({
      isAuthenticated: true,
      user: userData,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
    }),
}));
