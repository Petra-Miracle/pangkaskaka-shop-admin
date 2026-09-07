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
import { KaryawanApplication } from "@/lib/types";

interface ApplicantsContextValue {
  applicants: KaryawanApplication[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateLocal: (id: string, patch: Partial<KaryawanApplication>) => void;
}

const ApplicantsContext = createContext<ApplicantsContextValue | null>(null);

export function ApplicantsProvider({ children }: { children: React.ReactNode }) {
  const [applicants, setApplicants] = useState<KaryawanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get<{ karyawan: KaryawanApplication[] }>(
        "/shop-admin/karyawan"
      );
      setApplicants(res.karyawan || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat daftar pelamar."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load the applicant list on mount (and whenever refetch is invalidated).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  const updateLocal = useCallback(
    (id: string, patch: Partial<KaryawanApplication>) => {
      setApplicants((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
      );
    },
    []
  );

  const value = useMemo(
    () => ({ applicants, loading, error, refetch, updateLocal }),
    [applicants, loading, error, refetch, updateLocal]
  );

  return (
    <ApplicantsContext.Provider value={value}>
      {children}
    </ApplicantsContext.Provider>
  );
}

export function useApplicants() {
  const ctx = useContext(ApplicantsContext);
  if (!ctx) throw new Error("useApplicants must be used within ApplicantsProvider");
  return ctx;
}
