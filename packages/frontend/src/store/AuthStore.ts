import { setSession } from "../services/jwt.service";
import axios from "axios";
import { create } from "zustand";

interface User {
  user_id: string;
}

interface AuthState {
  user: User | null;
  authLoading: boolean;
  tokenLoading: boolean;
  setUser: (args: User | null) => void;
  logoutService: () => void;
  loginService: (email: string, password: string) => Promise<void>;
  loginWithToken: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  authLoading: false,
  tokenLoading: true,
  setUser: (args: any) => set({ user: args }),
  logoutService: () => {
    setSession(null);
    set({ user: null, authLoading: false, tokenLoading: false });
  },
  loginService: async (email, password) => {
    set({ authLoading: true });
    try {
      const res = await axios.post(`/api/v0/user/login`, {
        email,
        password,
      });
      if (res.data.result?.user && res.data.result?.token) {
        setSession(res.data.result?.token);
        set({ user: res.data.result?.user, authLoading: false });
      } else {
        set({ authLoading: false, user: null });
      }
    } catch (err) {
      console.log(err);
      set({ authLoading: false });
    }
  },
  loginWithToken: async () => {
    try {
      const res = await axios.post(`/api/v0/user/validation`);
      if (res.data.result?.user && res.data.result?.token) {
        setSession(res.data.result?.token);
        set({ user: res.data.result?.user, tokenLoading: false });
      } else {
        set({ tokenLoading: false, user: null });
      }
    } catch (err) {
      console.log(err);
      get().logoutService();
    }
  },
}));

export default useAuthStore;
