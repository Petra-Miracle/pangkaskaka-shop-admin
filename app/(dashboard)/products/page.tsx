"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Product } from "@/lib/types";
import { PageHeader } from "@/components/nav/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFormDialog } from "./ProductFormDialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ products: Product[] }>(
        "/shop-admin/products"
      );
      setProducts(res.products || []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("Fitur katalog produk belum tersedia di server.");
      } else {
        setError(
          err instanceof Error ? err.message : "Gagal memuat daftar produk."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addLocal = useCallback((product: Product) => {
    setProducts((prev) => [product, ...prev]);
  }, []);

  const updateLocal = useCallback((id: string, patch: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  }, []);

  const removeLocal = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    [products]
  );

  const filtered = useMemo(
    () =>
      products.filter(
        (p) => filterCategory === "all" || p.category === filterCategory
      ),
    [products, filterCategory]
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(undefined);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    setDeleting(id);
    try {
      await api.del(`/shop-admin/products/${id}`);
      removeLocal(id);
    } catch (err) {
      alert(
        err instanceof ApiError ? err.message : "Gagal menghapus produk."
      );
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Usaha"
        title="Katalog Produk"
        description="Kelola produk yang dijual di toko Anda."
        actions={
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-1.5 size-4" />
            Tambah Produk
          </Button>
        }
      />

      {error && (
        <div className="rounded-md bg-muted px-4 py-3 text-sm font-medium text-muted-foreground">
          {error}
          <Button
            variant="link"
            className="ml-2 h-auto p-0 underline"
            onClick={fetchProducts}
          >
            Coba lagi
          </Button>
        </div>
      )}

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategory("all")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              filterCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat!)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filterCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="glass-card rounded-2xl">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-foreground">
              {error ? "Belum ada data." : "Belum ada produk."}
            </p>
            {!error && (
              <p className="mt-1 text-sm text-muted-foreground">
                Klik &quot;Tambah Produk&quot; untuk mulai menambahkan produk ke katalog.
              </p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    {product.name}
                  </TableCell>
                  <TableCell>
                    {product.category ? (
                      <Badge variant="outline">{product.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatRupiah(product.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        product.stock <= 5
                          ? "font-semibold text-destructive"
                          : ""
                      }
                    >
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    {product.is_active ? (
                      <Badge className="bg-success/15 text-success">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Nonaktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingProduct(undefined);
        }}
        product={editingProduct}
        onCreated={addLocal}
        onUpdated={updateLocal}
      />
    </div>
  );
}
