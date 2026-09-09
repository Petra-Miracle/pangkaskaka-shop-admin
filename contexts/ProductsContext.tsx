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
import { Product } from "@/lib/types";

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addLocal: (product: Product) => void;
  updateLocal: (id: string, patch: Partial<Product>) => void;
  removeLocal: (id: string) => void;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get<{ products: Product[] }>(
        "/shop-admin/products"
      );
      setProducts(res.products || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat daftar produk."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  const addLocal = useCallback((product: Product) => {
    setProducts((prev) => [product, ...prev]);
  }, []);

  const updateLocal = useCallback(
    (id: string, patch: Partial<Product>) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
    },
    []
  );

  const removeLocal = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const value = useMemo(
    () => ({ products, loading, error, refetch, addLocal, updateLocal, removeLocal }),
    [products, loading, error, refetch, addLocal, updateLocal, removeLocal]
  );

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
