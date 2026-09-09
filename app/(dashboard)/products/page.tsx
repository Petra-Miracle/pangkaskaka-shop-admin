"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { FEATURES } from "@/lib/features";
import { Product } from "@/lib/types";
import { getProducts, deleteProduct } from "@/lib/storage";
import { formatRupiah } from "@/lib/utils";
import { PageHeader } from "@/components/nav/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, legacyCreateColumnHelper } from "@/components/ui/data-table";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { ProductFormDialog } from "./ProductFormDialog";
import { Plus, Pencil, Trash2, Trash } from "lucide-react";

type ProductRow = Product & { _onEdit?: (p: Product) => void; _onDelete?: (id: string) => void };

const columnHelper = legacyCreateColumnHelper<ProductRow>();

const columns: LegacyColumnDef<ProductRow, any>[] = [
  columnHelper.accessor("name", {
    header: "Nama",
    cell: ({ row, getValue }) => (
      <div className="flex items-center gap-3">
        {row.original.image_url ? (
          <img
            src={row.original.image_url}
            alt={getValue()}
            className="size-9 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
            -
          </div>
        )}
        <span className="font-semibold">{getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor("category", {
    header: "Kategori",
    cell: (info) => {
      const val = info.getValue();
      return val ? (
        <Badge variant="outline">{val}</Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  }),
  columnHelper.accessor("price", {
    header: "Harga",
    cell: (info) => (
      <span className="tabular-nums">{formatRupiah(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("stock", {
    header: "Stok",
    cell: (info) => {
      const val = info.getValue() as number;
      return (
        <span className={val <= 5 ? "font-semibold text-destructive" : "tabular-nums"}>
          {val}
        </span>
      );
    },
  }),
  columnHelper.accessor("is_active", {
    header: "Status",
    cell: (info) =>
      info.getValue() ? (
        <Badge className="bg-success/15 text-success">Aktif</Badge>
      ) : (
        <Badge variant="secondary">Nonaktif</Badge>
      ),
  }),
  columnHelper.display({
    id: "actions",
    header: () => <span className="sr-only">Aksi</span>,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={(e) => {
              e.stopPropagation();
              product._onEdit?.(product);
            }}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={(e) => {
              e.stopPropagation();
              product._onDelete?.(product.id);
            }}
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      );
    },
  }),
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchProducts = useCallback(async () => {
    if (!FEATURES.products) {
      setProducts(getProducts());
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ products: Product[] }>("/shop-admin/products");
      setProducts(res.products || []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("Fitur katalog produk belum tersedia di server.");
      } else {
        setError(err instanceof Error ? err.message : "Gagal memuat daftar produk.");
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
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const removeLocal = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    [products]
  );

  const filtered = useMemo(
    () => products.filter((p) => filterCategory === "all" || p.category === filterCategory),
    [products, filterCategory]
  );

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingProduct(undefined);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      if (!FEATURES.products) {
        deleteProduct(id);
        removeLocal(id);
      } else {
        await api.del(`/shop-admin/products/${id}`);
        removeLocal(id);
      }
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Gagal menghapus produk.");
    }
  }, [removeLocal]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Yakin ingin menghapus ${selectedIds.size} produk yang dipilih?`)) return;
    try {
      const ids = Array.from(selectedIds);
      if (!FEATURES.products) {
        ids.forEach((id) => deleteProduct(id));
        ids.forEach((id) => removeLocal(id));
      } else {
        await Promise.all(ids.map((id) => api.del(`/shop-admin/products/${id}`)));
        ids.forEach((id) => removeLocal(id));
      }
      setSelectedIds(new Set());
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Gagal menghapus produk.");
    }
  }, [selectedIds, removeLocal]);

  const enrichedData = useMemo(
    (): ProductRow[] =>
      filtered.map((p) => ({
        ...p,
        _onEdit: handleEdit,
        _onDelete: handleDelete,
      })),
    [filtered, handleEdit, handleDelete]
  );

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

      <div className="glass-card rounded-2xl overflow-hidden p-0">
        <DataTable
          columns={columns}
          data={enrichedData}
          loading={loading}
          initialSorting={[{ id: "name", desc: false }]}
          pageSize={10}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          getRowId={(row) => row.id}
          selectionBar={
            <div className="flex items-center justify-between border-b border-border bg-primary/5 px-4 py-2">
              <span className="text-sm font-medium text-primary">
                {selectedIds.size} produk dipilih
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash className="mr-1.5 size-4" />
                Hapus Terpilih
              </Button>
            </div>
          }
          emptyState={
            <p className="text-sm text-muted-foreground">
              {error ? "Belum ada data." : "Belum ada produk."}
            </p>
          }
        />
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
