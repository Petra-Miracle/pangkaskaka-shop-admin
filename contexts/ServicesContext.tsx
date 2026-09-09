"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/api";
import { Service } from "@/lib/types";

interface ServicesContextValue {
  services: Service[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addLocal: (service: Service) => void;
  updateLocal: (id: string, patch: Partial<Service>) => void;
  removeLocal: (id: string) => void;
}

const ServicesContext = createContext<ServicesContextValue | null>(null);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get<{ services: Service[] }>(
        "/shop-admin/services"
      );
      setServices(res.services || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat daftar layanan."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  const addLocal = useCallback((service: Service) => {
    setServices((prev) => [service, ...prev]);
  }, []);

  const updateLocal = useCallback(
    (id: string, patch: Partial<Service>) => {
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
      );
    },
    []
  );

  const removeLocal = useCallback((id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const value = useMemo(
    () => ({ services, loading, error, refetch, addLocal, updateLocal, removeLocal }),
    [services, loading, error, refetch, addLocal, updateLocal, removeLocal]
  );

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error("useServices must be used within ServicesProvider");
  return ctx;
}
