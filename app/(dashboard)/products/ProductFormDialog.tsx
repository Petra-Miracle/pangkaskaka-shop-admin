"use client";

import { useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Product, ProductFormData } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { FEATURES } from "@/lib/features";
import { createProduct, updateProduct } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImagePlus, X } from "lucide-react";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  onCreated?: (product: Product) => void;
  onUpdated?: (id: string, patch: Partial<Product>) => void;
}

const CATEGORIES = [
  "Pomade",
  "Aksesoris",
  "Perawatan",
  "Peralatan",
  "Lainnya",
];

function formatRupiahInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseRupiahInput(formatted: string): number {
  return Number(formatted.replace(/\./g, ""));
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onCreated,
  onUpdated,
}: ProductFormDialogProps) {
  const { user, shopsById } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [priceRaw, setPriceRaw] = useState(
    product?.price ? String(product.price) : ""
  );
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [category, setCategory] = useState(product?.category || "");
  const [imagePreview, setImagePreview] = useState(product?.image_url || "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);

  const managedShopIds = user?.managed_shop_ids || [];
  const [selectedShopId, setSelectedShopId] = useState(
    product?.shop_id || managedShopIds[0] || ""
  );

  const priceFormatted = formatRupiahInput(priceRaw);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setPriceRaw(raw);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: ProductFormData & { shop_id: string; image_url?: string } = {
        name,
        description: description || undefined,
        price: parseRupiahInput(priceRaw),
        stock,
        category: category || undefined,
        image_url: imagePreview || undefined,
        is_active: isActive,
        shop_id: selectedShopId,
      };

      if (!FEATURES.products) {
        if (product) {
          const updated = updateProduct(product.id, payload);
          if (updated) onUpdated?.(product.id, updated);
        } else {
          const created = createProduct(payload);
          onCreated?.(created);
        }
        onOpenChange(false);
        resetForm();
        setLoading(false);
        return;
      }

      if (product) {
        const updated = await api.put<Product>(
          `/shop-admin/products/${product.id}`,
          payload
        );
        onUpdated?.(product.id, updated);
      } else {
        const created = await api.post<Product>(
          "/shop-admin/products",
          payload
        );
        onCreated?.(created);
      }
      onOpenChange(false);
      resetForm();
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("Fitur produk belum tersedia di server.");
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "Gagal menyimpan produk. Silakan coba lagi."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPriceRaw("");
    setStock(0);
    setCategory("");
    setImagePreview("");
    setIsActive(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Produk" : "Tambah Produk Baru"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            {error}
          </div>
        )}

        {!FEATURES.products && (
          <div className="rounded-md bg-info/10 px-3 py-2 text-xs text-info">
            Mode testing — data tidak dikirim ke server.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {managedShopIds.length > 1 && (
            <div className="space-y-1.5">
              <Label>Toko</Label>
              <select
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {managedShopIds.map((id) => (
                  <option key={id} value={id}>
                    {shopsById[id]?.name || id}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Produk *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Pomade Matte Clay"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Deskripsi</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat produk..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">Harga (Rp) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="price"
                  type="text"
                  inputMode="numeric"
                  value={priceFormatted}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="pl-10"
                  required
                />
              </div>
              {priceFormatted && (
                <p className="text-xs text-muted-foreground">
                  = Rp {priceFormatted}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stok *</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Kategori</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Pilih kategori</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Gambar Produk</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 w-32 rounded-lg border object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-destructive text-white"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <ImagePlus className="size-8" />
                <span>Klik untuk upload gambar</span>
                <span className="text-xs">PNG, JPG, max 2MB</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="is_active" className="text-sm font-normal">
              Aktif (tersedia untuk dijual)
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Menyimpan..."
                : product
                  ? "Simpan Perubahan"
                  : "Tambah Produk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
