# Plan: Fitur Baru ShopAdmin — Katalog Produk, Layanan, dan Revenue

**Tanggal:** 2026-09-09
**Status:** Rencana (belum diimplementasi)

---

## Ringkasan

Menambahkan 3 fitur baru ke dashboard Admin (ShopAdmin):

| # | Fitur | Akses Admin | Akses Owner |
|---|-------|-------------|-------------|
| 1 | Katalog Produk | **Input** (CRUD) | CRUD (sudah ada di repo Owner) |
| 2 | Layanan | **Input** (CRUD) | CRUD (sudah ada di repo Owner) |
| 3 | Revenue (Pendapatan & Pengeluaran) | **Read-only** | CRUD (manage) |

> **Catatan Penting:** `HANDOFF.md` baris 30 sebelumnya mencantumkan "layanan, produk, pesanan" sebagai wilayah Owner. Rencana ini **memperluas** wewenang Admin agar dapat menginput produk dan layanan, serta membaca data revenue.

---

## 1. Katalog Produk

### 1.1 Definisi

Produk fisik yang dijual di toko (contoh: pomade, sisir, handuk, dll). Admin dapat menambah, mengedit, dan menghapus produk.

### 1.2 TypeScript Types — `lib/types.ts`

```typescript
export interface Product {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  image_url?: string;
  is_active: boolean;
}
```

### 1.3 API Endpoints (Asumsi Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/shop-admin/products` | List semua produk di toko yang dikelola |
| `POST` | `/shop-admin/products` | Tambah produk baru |
| `PUT` | `/shop-admin/products/:id` | Update produk |
| `DELETE` | `/shop-admin/products/:id` | Hapus produk |

### 1.4 File yang Dibuat/Diubah

| File | Action | Deskripsi |
|------|--------|-----------|
| `lib/types.ts` | **Edit** | Tambah `Product`, `ProductFormData` |
| `lib/nav-items.ts` | **Edit** | Tambah item nav "Katalog Produk" |
| `contexts/ProductsContext.tsx` | **Baru** | Context provider untuk data produk |
| `app/(dashboard)/products/page.tsx` | **Baru** | Halaman daftar produk (table + filter) |
| `app/(dashboard)/products/ProductFormDialog.tsx` | **Baru** | Dialog form tambah/edit produk |
| `app/(dashboard)/layout.tsx` | **Edit** | Bungkus dengan `ProductsProvider` |

### 1.5 UI Components

- **Halaman Produk** (`products/page.tsx`):
  - `PageHeader` dengan tombol "Tambah Produk"
  - Tabel (`Table`) menampilkan: Nama, Kategori, Harga, Stok, Status (Aktif/Tidak)
  - Filter berdasarkan kategori dan status
  - Dialog form untuk tambah/edit

- **Form Dialog** (`ProductFormDialog.tsx`):
  - Fields: Nama (text), Deskripsi (textarea), Harga (number), Stok (number), Kategori (select), Status Aktif (toggle)
  - Validasi: Nama wajib, Harga > 0, Stok >= 0

### 1.6 Navigasi

```typescript
// Ditambahkan ke NAV_SECTIONS
{
  label: "Usaha",
  items: [
    { label: "Katalog Produk", href: "/products", icon: Package },
  ],
}
```

---

## 2. Layanan

### 2.1 Definisi

Layanan yang ditawarkan toko (contoh: potong rambut, cukur jenggot, creambath, dll). Admin dapat menambah, mengedit, dan menghapus layanan.

### 2.2 TypeScript Types — `lib/types.ts`

```typescript
export interface Service {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceFormData {
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  is_active: boolean;
}
```

### 2.3 API Endpoints (Asumsi Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/shop-admin/services` | List semua layanan di toko yang dikelola |
| `POST` | `/shop-admin/services` | Tambah layanan baru |
| `PUT` | `/shop-admin/services/:id` | Update layanan |
| `DELETE` | `/shop-admin/services/:id` | Hapus layanan |

### 2.4 File yang Dibuat/Diubah

| File | Action | Deskripsi |
|------|--------|-----------|
| `lib/types.ts` | **Edit** | Tambah `Service`, `ServiceFormData` |
| `lib/nav-items.ts` | **Edit** | Tambah item nav "Layanan" |
| `contexts/ServicesContext.tsx` | **Baru** | Context provider untuk data layanan |
| `app/(dashboard)/services/page.tsx` | **Baru** | Halaman daftar layanan (table) |
| `app/(dashboard)/services/ServiceFormDialog.tsx` | **Baru** | Dialog form tambah/edit layanan |
| `app/(dashboard)/layout.tsx` | **Edit** | Bungkus dengan `ServicesProvider` |

### 2.5 UI Components

- **Halaman Layanan** (`services/page.tsx`):
  - `PageHeader` dengan tombol "Tambah Layanan"
  - Tabel menampilkan: Nama, Deskripsi, Harga, Durasi, Status
  - Dialog form untuk tambah/edit

- **Form Dialog** (`ServiceFormDialog.tsx`):
  - Fields: Nama (text), Deskripsi (textarea), Harga (number), Durasi (number, menit), Status Aktif (toggle)
  - Validasi: Nama wajib, Harga > 0

### 2.6 Navigasi

```typescript
// Ditambahkan ke NAV_SECTIONS di section "Usaha"
{ label: "Layanan", href: "/services", icon: Scissors }
```

---

## 3. Revenue (Read-Only)

### 3.1 Definisi

Data keuangan toko berisi **pendapatan** (income) dan **pengeluaran** (expense). Admin hanya bisa **membaca/melihat** — tidak bisa membuat, mengedit, atau menghapus. Manajemen revenue tetap di tangan Owner.

### 3.2 Perbedaan Role

| Aksi | Owner | Admin |
|------|-------|-------|
| Melihat daftar transaksi | ✅ | ✅ |
| Melihat detail transaksi | ✅ | ✅ |
| Melihat ringkasan (total pendapatan, pengeluaran, laba) | ✅ | ✅ |
| Filter tanggal | ✅ | ✅ |
| Membuat transaksi baru | ✅ | ❌ |
| Edit transaksi | ✅ | ❌ |
| Hapus transaksi | ✅ | ❌ |
| Export data | ✅ | ❌ |

### 3.3 TypeScript Types — `lib/types.ts`

```typescript
export type TransactionType = "income" | "expense";

export type TransactionRole = "owner" | "admin" | "barber" | string;

export interface Transaction {
  id: string;
  shop_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category?: string;
  recorded_by: string;
  recorded_by_role: TransactionRole;
  reference_id?: string;
  reference_type?: string;
  created_at: string;
}

export interface RevenueSummary {
  shop_id: string;
  total_income: number;
  total_expense: number;
  net_profit: number;
  transaction_count: number;
  period_start: string;
  period_end: string;
}

export interface RevenueFilter {
  shop_id?: string;
  type?: TransactionType;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}
```

### 3.4 API Endpoints (Asumsi Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/shop-admin/revenue` | List transaksi (filterable) |
| `GET` | `/shop-admin/revenue/summary` | Ringkasan pendapatan/pengeluaran |
| `GET` | `/shop-admin/revenue/:id` | Detail transaksi |

> **Tidak ada** `POST`, `PUT`, `DELETE` untuk Admin — hanya `GET`.

### 3.5 File yang Dibuat/Diubah

| File | Action | Deskripsi |
|------|--------|-----------|
| `lib/types.ts` | **Edit** | Tambah `Transaction`, `RevenueSummary`, `RevenueFilter` |
| `lib/nav-items.ts` | **Edit** | Tambah item nav "Revenue" |
| `app/(dashboard)/revenue/page.tsx` | **Baru** | Halaman revenue (summary cards + tabel) |
| `app/(dashboard)/revenue/RevenueTable.tsx` | **Baru** | Tabel transaksi (read-only) |
| `app/(dashboard)/revenue/RevenueSummaryCards.tsx` | **Baru** | Kartu ringkasan (total pendapatan, pengeluaran, laba) |

### 3.6 UI Components

- **Halaman Revenue** (`revenue/page.tsx`):
  - `PageHeader` dengan deskripsi "Data keuangan toko — hanya untuk dibaca"
  - **Tidak ada tombol "Tambah"** (beda dengan Owner)
  - `RevenueSummaryCards`: 3 kartu (Total Pendapatan, Total Pengeluaran, Laba Bersih)
  - `RevenueFilter`: Filter tanggal (start/end) dan tipe (income/expense/all)
  - `RevenueTable`: Tabel transaksi read-only

- **RevenueSummaryCards** (`RevenueSummaryCards.tsx`):
  - 3 kartu `glass-card`:
    - 💰 Pendapatan (hijau)
    - 💸 Pengeluaran (merah)
    - 📊 Laba Bersih (biru/ungu)

- **RevenueTable** (`RevenueTable.tsx`):
  - Kolom: Tanggal, Deskripsi, Kategori, Tipe (badge income/expense), Jumlah, Dicatat Oleh
  - **Tidak ada** kolom aksi (edit/hapus)
  - Badge warna: hijau untuk income, merah untuk expense

- **RevenueFilter** (inline di `page.tsx`):
  - Date picker start/end
  - Select tipe: Semua / Pendapatan / Pengeluaran
  - Tombol "Terapkan"

### 3.7 Navigasi

```typescript
// Ditambahkan ke NAV_SECTIONS
{
  label: "Keuangan",
  items: [
    { label: "Revenue", href: "/revenue", icon: TrendingUp },
  ],
}
```

---

## 4. Struktur Navigasi Baru

```typescript
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Utama",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Manajemen",
    items: [
      { label: "Pelamar StreetBarber", href: "/applicants", icon: ClipboardCheck },
    ],
  },
  {
    label: "Usaha",
    items: [
      { label: "Katalog Produk", href: "/products", icon: Package },
      { label: "Layanan", href: "/services", icon: Scissors },
    ],
  },
  {
    label: "Keuangan",
    items: [
      { label: "Revenue", href: "/revenue", icon: TrendingUp },
    ],
  },
  {
    label: "Akun",
    items: [
      { label: "Profil", href: "/profile", icon: User },
    ],
  },
];
```

---

## 5. Route Map (Lengkap)

```
/login                                  → Login
/                                       → Redirect ke /dashboard
/dashboard                              → Dashboard (ringkasan)
/applicants                             → Daftar pelamar
/applicants/[kid]                       → Detail pelamar
/products                               → [BARU] Katalog produk
/services                               → [BARU] Layanan
/revenue                                → [BARU] Revenue (read-only)
/profile                                → Profil admin
```

---

## 6. Context Providers — Pembaruan Dashboard Layout

```tsx
// app/(dashboard)/layout.tsx (pembaruan)
<ApplicantsProvider>
  <ProductsProvider>
    <ServicesProvider>
      <div className="bg-gradient-mesh relative flex min-h-screen">
        <Sidebar />
        {/* ... */}
      </div>
    </ServicesProvider>
  </ProductsProvider>
</ApplicantsProvider>
```

> **Note:** Revenue tidak perlu context provider sendiri karena data di-fetch langsung di halaman (read-only, tidak perlu shared state). Cukup gunakan `useEffect` + `useState` di `revenue/page.tsx`.

---

## 7. Urutan Implementasi

### Phase 1 — Types & Navigation
1. Tambah semua types baru ke `lib/types.ts`
2. Update `lib/nav-items.ts` dengan section baru

### Phase 2 — Katalog Produk
3. Buat `contexts/ProductsContext.tsx`
4. Buat `app/(dashboard)/products/page.tsx`
5. Buat `app/(dashboard)/products/ProductFormDialog.tsx`
6. Update `app/(dashboard)/layout.tsx` — tambah `ProductsProvider`

### Phase 3 — Layanan
7. Buat `contexts/ServicesContext.tsx`
8. Buat `app/(dashboard)/services/page.tsx`
9. Buat `app/(dashboard)/services/ServiceFormDialog.tsx`
10. Update `app/(dashboard)/layout.tsx` — tambah `ServicesProvider`

### Phase 4 — Revenue (Read-Only)
11. Buat `app/(dashboard)/revenue/page.tsx`
12. Buat `app/(dashboard)/revenue/RevenueSummaryCards.tsx`
13. Buat `app/(dashboard)/revenue/RevenueTable.tsx`

### Phase 5 — Finishing
14. Update dashboard page — tambah quick stats untuk produk/layanan
15. Jalankan `npm run build` dan `npm run lint` untuk verifikasi
16. Jalankan `npm run test` untuk memastikan tidak ada regression

---

## 8. Kendala & Pertanyaan yang Perlu Dijawab

| # | Pertanyaan | Dampak |
|---|-----------|--------|
| 1 | **Backend sudah siap?** Endpoint `/shop-admin/products`, `/shop-admin/services`, `/shop-admin/revenue` belum ada di `lib/api.ts` | Definisikan endpoint di `lib/api.ts` atau gunakan path langsung |
| 2 | **Shop context** — Produk dan layanan perlu shop_id. Apakah user bisa memilih toko mana? | Ada di `useAuth().user.managed_shop_ids` |
| 3 | **Revenue filter** — Perlu date picker component? | Belum ada di shadcn components. Perlu tambah `date-picker` atau gunakan `<input type="date">` |
| 4 | **Revenue export** — Admin tidak bisa export, tapi perlu dijelaskan di UI? | Tambah tooltip "Export hanya tersedia untuk Owner" |
| 5 | **Multi-shop** — Apakah produk/layanan perlu filter per toko? | Ya, gunakan `managed_shop_ids` + select toko |

---

## 9. Komponen shadcn yang Digunakan

| Komponen | Untuk |
|----------|-------|
| `Table` | Daftar produk, layanan, transaksi |
| `Dialog` + `DialogForm` | Form tambah/edit produk & layanan |
| `Input` | Form fields |
| `Label` | Form fields |
| `Select` | Filter & form dropdown |
| `Badge` | Status aktif, tipe transaksi |
| `Tabs` | Revenue (tab per toko jika multi-shop) |
| `Button` | Aksi (tambah, edit, hapus) |
| `Skeleton` | Loading state |
| `Card` (glass-card) | Summary cards, product/service cards |
| `Textarea` | Deskripsi produk & layanan |

---

## 10. Estimasi File Baru

```
lib/types.ts                                    [EDIT] — tambah 3 interface groups
lib/nav-items.ts                                [EDIT] — tambah 2 section, 3 item
contexts/ProductsContext.tsx                     [BARU] ~70 baris
contexts/ServicesContext.tsx                     [BARU] ~70 baris
app/(dashboard)/products/page.tsx               [BARU] ~150 baris
app/(dashboard)/products/ProductFormDialog.tsx  [BARU] ~120 baris
app/(dashboard)/services/page.tsx               [BARU] ~130 baris
app/(dashboard)/services/ServiceFormDialog.tsx  [BARU] ~110 baris
app/(dashboard)/revenue/page.tsx                [BARU] ~200 baris
app/(dashboard)/revenue/RevenueSummaryCards.tsx [BARU] ~60 baris
app/(dashboard)/revenue/RevenueTable.tsx        [BARU] ~100 baris
app/(dashboard)/layout.tsx                      [EDIT] — tambah 2 provider
```

**Total: ~11 file baru/ubah, ~1.100 baris kode baru**
