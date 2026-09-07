"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, UNAUTHORIZED_EVENT } from "@/lib/api";
import { clearToken, getToken, setToken } from "@/lib/auth";
import { Shop, User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  shopsById: Record<string, Shop>;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [shopsById, setShopsById] = useState<Record<string, Shop>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShops = useCallback(async (shopIds: string[]) => {
    const uniqueIds = Array.from(new Set(shopIds)).filter(Boolean);
    if (uniqueIds.length === 0) {
      setShopsById({});
      return;
    }
    const results = await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const shop = await api.get<Shop>(`/shops/${id}`, { auth: false });
          return shop;
        } catch {
          return null;
        }
      })
    );
    const map: Record<string, Shop> = {};
    for (const shop of results) {
      if (shop) map[shop.id] = shop;
    }
    setShopsById(map);
  }, []);

  const loadMe = useCallback(async () => {
    const me = await api.get<{ user: User }>("/auth/me");
    setUser(me.user);
    await loadShops(me.user.managed_shop_ids || []);
    return me.user;
  }, [loadShops]);

  const bootstrap = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      await loadMe();
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [loadMe]);

  useEffect(() => {
    // Session bootstrap on mount: validates the stored token against the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    bootstrap();
    const handleUnauthorized = () => {
      setUser(null);
      router.replace("/login");
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      const res = await api.post<{ token: string; user: User }>(
        "/auth/login",
        { email, password },
        { auth: false }
      );
      if (res.user.role !== "admin") {
        throw new ApiError(
          "Akun ini bukan akun Admin. Website ini khusus untuk akun Admin yang dibuat oleh SuperAdmin.",
          403
        );
      }
      setToken(res.token);
      setUser(res.user);
      await loadShops(res.user.managed_shop_ids || []);
    },
    [loadShops]
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setShopsById({});
    router.replace("/login");
  }, [router]);

  const refresh = useCallback(async () => {
    await loadMe();
  }, [loadMe]);

  const value = useMemo(
    () => ({ user, shopsById, loading, error, login, logout, refresh }),
    [user, shopsById, loading, error, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
