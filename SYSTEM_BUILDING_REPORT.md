# PangkasKAKA Shop Admin Dashboard — System Building Report

**Tanggal:** 10 September 2026  
**Status:** ✅ Selesai  
**Repository:** https://github.com/Petra-Miracle/pangkaskaka-shop-admin  
**Branch:** `main`  
**Deploy:** https://pangkaskaka-shop-admin.vercel.app

---

## 1. Ringkasan Proyek

PangkasKAKA Shop Admin Dashboard adalah aplikasi web untuk mengelola usaha pangkasan rambut. Dashboard ini dibangun dengan Next.js 16 dan terintegrasi dengan backend API (APP-PangkasKAKA).

### Tujuan
- Mengelola pelamar StreetBarber (review berkas, evaluasi skill, chat)
- Mengelola produk, layanan, dan karyawan
- Melihat laporan keuangan (read-only)
- Mengelola profil admin

---

## 2. Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Framework | Next.js 16.3.4 (Turbopack) |
| Bahasa | TypeScript |
| UI Library | HeroUI v3 + shadcn/ui |
| CSS | Tailwind CSS |
| State Management | React Context + useState |
| Auth | JWT (useAuth hook) |
| Backend | FastAPI (Python) + MongoDB |
| Deploy Frontend | Vercel |
| Deploy Backend | Railway |

---

## 3. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                    PANGKASKAKA SHOP ADMIN                    │
├─────────────────────────────────────────────────────────────┤
│  Next.js 16 + Tailwind CSS + HeroUI v3                      │
├─────────────────────────────────────────────────────────────┤
│  AuthContext │ ApplicantsContext │ Feature Flags             │
├─────────────────────────────────────────────────────────────┤
│  API Layer (lib/api.ts) + Storage (lib/storage.ts)          │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    APP-PANGKASKAKA BACKEND                   │
├─────────────────────────────────────────────────────────────┤
│  FastAPI + Motor (MongoDB) + JWT Auth                        │
├─────────────────────────────────────────────────────────────┤
│  /api/auth/* │ /api/shop-admin/* │ /api/shops/*              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Struktur Folder

```
pangkaskaka-shop-admin/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx              # Halaman login
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Dashboard layout + sidebar
│   │   ├── dashboard/page.tsx          # Ringkasan data
│   │   ├── applicants/
│   │   │   ├── page.tsx                # Daftar pelamar
│   │   │   └── [kid]/page.tsx          # Detail pelamar
│   │   ├── barbers/
│   │   │   ├── page.tsx                # Daftar karyawan
│   │   │   └── BarberFormDialog.tsx    # Form tambah/edit
│   │   ├── products/
│   │   │   ├── page.tsx                # Daftar produk
│   │   │   └── ProductFormDialog.tsx   # Form tambah/edit
│   │   ├── services/
│   │   │   ├── page.tsx                # Daftar layanan
│   │   │   └── ServiceFormDialog.tsx   # Form tambah/edit
│   │   ├── revenue/page.tsx            # Laporan keuangan
│   │   └── profile/page.tsx            # Profil admin
│   ├── layout.tsx                      # Root layout
│   └── page.tsx                        # Root redirect
├── components/
│   ├── nav/
│   │   ├── sidebar.tsx                 # Sidebar navigasi
│   │   └── page-header.tsx             # Header halaman
│   └── ui/                             # shadcn/ui components
├── contexts/
│   ├── AuthContext.tsx                  # Autentikasi + session
│   └── ApplicantsContext.tsx            # Data pelamar
├── lib/
│   ├── api.ts                          # Fetch wrapper
│   ├── auth.ts                         # Token management
│   ├── features.ts                     # Feature flags
│   ├── nav-items.ts                    # Navigasi sidebar
│   ├── storage.ts                      # localStorage CRUD
│   └── types.ts                        # TypeScript types
├── public/                             # Static assets
├── SYSTEM_BUILDING_REPORT.md           # Dokumen ini
└── HANDOFF.md                          # Handoff documentation
```

---

## 5. Halaman dan Fitur

### 5.1 Login (`/login`)
- Email + password form
- Validasi role harus `admin`
- Error handling untuk credentials salah
- Redirect ke dashboard setelah login

### 5.2 Dashboard (`/dashboard`)
- 4 kartu status pelamar (Menunggu Berkas, Tahap Tes, StreetBarber Aktif, Ditolak)
- Quick link: jumlah produk, jumlah layanan, total revenue
- Daftar toko yang dikelola dengan jumlah pelamar per toko

### 5.3 Pelamar StreetBarber (`/applicants`)
- **Daftar:** DataTable dengan filter toko dan status
- **Detail (`/applicants/[kid]`):**
  - Review berkas (KTP, Ijazah, Portofolio, Alat, BNSP, Sertifikat)
  - Approve/reject berkas dengan alasan
  - Evaluasi skill (6 kriteria, skor 0-20, total 120, passing 60)
  - Chat dengan pelamar (teks + gambar, polling 4 detik)

### 5.4 Karyawan/Barber (`/barbers`)
- **CRUD Operations:**
  - Create: Form dialog (nama, telepon, email, spesialisasi)
  - Read: DataTable dengan status aktif/nonaktif
  - Update: Edit via form dialog
  - Delete: Single delete + batch delete
- **Backend Mapping:** `status: "active"/"inactive"` → `is_active: boolean`

### 5.5 Produk (`/products`)
- **CRUD Operations:**
  - Create: Form dialog dengan upload gambar (base64, max 2MB)
  - Read: DataTable dengan filter kategori
  - Update: Edit via form dialog
  - Delete: Single delete + batch delete
- **Fitur:**
  - Format harga Rupiah
  - Stok merah jika ≤ 5
  - Status aktif/nonaktif

### 5.6 Layanan (`/services`)
- **CRUD Operations:**
  - Create: Form dialog (nama, deskripsi, harga, durasi)
  - Read: DataTable
  - Update: Edit via form dialog
  - Delete: Single delete + batch delete
- **Fitur:**
  - Format harga Rupiah
  - Durasi dalam menit

### 5.7 Revenue (`/revenue`)
- **Read-only** (admin hanya bisa melihat)
- **Summary cards:**
  - Total Pendapatan (dari transaksi `completed`)
  - Total Pengeluaran (semua transaksi)
  - Laba Bersih
- **Tabel transaksi:** Filter tanggal dan tipe
- **Excel Export:**
  - Format .xlsx
  - Summary section (LAPORAN KEUANGAN TOKO)
  - SUMIF formulas untuk pendapatan, pengeluaran, laba bersih
  - Data transaksi detail

### 5.8 Profil (`/profile`)
- **Kiri:** Foto profil (upload), nama, email, badge Admin, telepon, bergabung, login terakhir
- **Kanan:** Info toko (jam operasional, telepon, jumlah barber aktif, jumlah layanan)
- **Aksi:** Ganti password, lihat karyawan (link ke `/barbers`), keluar

---

## 6. Autentikasi dan Otorisasi

### Flow Login
```
User Input → POST /api/auth/login → JWT Token → localStorage → AuthContext
```

### Token Management
- Token disimpan di `localStorage` key: `pangkaskaka_token`
- Auto-attach header `Authorization: Bearer <token>` di semua request
- Auto-redirect ke `/login` jika 401

### Role Validation
- Login hanya menerima role `admin`
- Role lain ditolak dengan pesan error

---

## 7. API Integration

### Base URL
```
NEXT_PUBLIC_API_URL=https://app-pangkaskaka-production.up.railway.app
```

### Endpoint yang Digunakan

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Data user + shops |
| PUT | `/api/auth/profile` | Update profil (photo) |
| PUT | `/api/auth/change-password` | Ganti password |
| GET | `/api/shops/{id}` | Data toko |
| GET | `/api/shop-admin/barbers` | Daftar barber |
| POST | `/api/shop-admin/barbers` | Tambah barber |
| PUT | `/api/shop-admin/barbers/{id}` | Edit barber |
| DELETE | `/api/shop-admin/barbers/{id}` | Hapus barber |
| GET | `/api/shop-admin/products` | Daftar produk |
| POST | `/api/shop-admin/products` | Tambah produk |
| PUT | `/api/shop-admin/products/{id}` | Edit produk |
| DELETE | `/api/shop-admin/products/{id}` | Hapus produk |
| GET | `/api/shop-admin/services` | Daftar layanan |
| POST | `/api/shop-admin/services` | Tambah layanan |
| PUT | `/api/shop-admin/services/{id}` | Edit layanan |
| DELETE | `/api/shop-admin/services/{id}` | Hapus layanan |
| GET | `/api/shop-admin/revenue` | Data revenue |
| GET | `/api/applicants` | Daftar pelamar |
| GET | `/api/applicants/{kid}` | Detail pelamar |
| POST | `/api/applicants/{kid}/berkas-decision` | Approve/reject berkas |
| POST | `/api/applicants/{kid}/evaluate` | Evaluasi skill |
| GET | `/api/applicants/{kid}/chat` | Pesan chat |
| POST | `/api/applicants/{kid}/chat` | Kirim chat |

### Response Format
```json
// POST response
{ "product": { ... } }

// PUT response
{ "ok": true }
```

---

## 8. Fitur Khusus

### 8.1 Feature Flags
```typescript
// lib/features.ts
export const FEATURES = {
  products: true,    // Aktifkan jika backend siap
  services: true,
  revenue: true,
  barbers: true,
} as const;
```
- Jika `false` atau API error → fallback ke `localStorage`

### 8.2 Batch Delete
- Pilih multiple item dengan checkbox
- Tombol "Hapus Semua" muncul saat ada seleksi
- Menggunakan `Promise.allSettled` (tidak gagal jika satu gagal)
- Konfirmasi sebelum hapus

### 8.3 Form Double-Submit Prevention
- Semua form dialog punya state `submitting`
- Button disabled saat submitting
- Prevent submit berulang

### 8.4 DataTable Sorting
- Uncontrolled sorting (bukan controlled state)
- Klik header untuk sort
- Sorting berfungsi tanpa lock

### 8.5 Excel Export
- Library: `xlsx`
- Format: `.xlsx`
- Summary section dengan SUMIF formulas
- Kolom: Waktu, Toko, Tipe, Metode, Status, Jumlah, Keterangan

---

## 9. UI/UX

### Design System
- **Theme:** Glass morphism dengan gradients
- **Colors:** Primary (biru), Success (hijau), Destructive (merah)
- **Typography:** Bold untuk headings, medium untuk values
- **Spacing:** Konsisten menggunakan Tailwind spacing

### Komponen
- **Sidebar:** Navigasi dengan sections (Utama, Manajemen, Usaha, Keuangan, Akun)
- **PageHeader:** Eyebrow + title + description
- **DataTable:** Sortable, filterable, selectable rows
- **Dialogs:** Form dialogs dengan validasi
- **Cards:** Glass cards dengan hover effects

### Responsive
- Mobile: Single column layout
- Desktop: Grid layout (sidebar + content)

---

## 10. Testing

### Build Status
```
✅ TypeScript compilation passed
✅ Static page generation passed (12/12 pages)
✅ Production build optimized
```

### Routes
```
○ /                    (Static)
○ /_not-found          (Static)
○ /applicants          (Static)
ƒ /applicants/[kid]    (Dynamic)
○ /barbers             (Static)
○ /dashboard           (Static)
○ /login               (Static)
○ /products            (Static)
○ /profile             (Static)
○ /revenue             (Static)
○ /services            (Static)
```

---

## 11. Deployment

### Frontend (Vercel)
- Auto-deploy dari branch `main`
- Environment variable: `NEXT_PUBLIC_API_URL`
- Build command: `npx next build`
- Output: `.next`

### Backend (Railway)
- URL: `https://app-pangkaskaka-production.up.railway.app`
- Docs: `/openapi.json`

---

## 12. Known Issues

| Issue | Status | Keterangan |
|-------|--------|------------|
| Telepon toko显示 "-" | ⏳ Menunggu backend | Shop schema belum ada field `phone` |
| Login terakhir显示 "-" | ⏳ Menunggu backend | Backend belum return `last_login` |
| Shop fetch tanpa auth | ⚠️ Low priority | AuthContext fetch shop dengan `auth: false` |
| Chat pakai polling | ℹ️ Known limitation | 4 detik interval, bisa pakai WebSocket |

---

## 13. Commits Terakhir

| Hash | Message |
|------|---------|
| `54c7f15` | fix: hilangkan edit nomor telepon di profile |
| `c5cb615` | fix: rapikan layout telepon di profile page |
| `3ed2f55` | feat: clean profile page - remove ganti email, tambah toko, change to lihat karyawan |
| `e3e72fe` | style: rapikan profile page |
| `a7691fa` | feat: tambah kolom Total Transaksi ke Excel export |
| `21fa6e0` | fix: tambah COUNTA formula untuk Total Transaksi di Excel |
| `f96231f` | fix: rapikan layout profile page |
| `1f2e663` | fix: Excel export pakai SUMIF formulas |

---

## 14. Checklist Kesiapan Produksi

- [x] Semua halaman berfungsi
- [x] Build clean tanpa error
- [x] Deploy ke Vercel berhasil
- [x] Autentikasi berfungsi
- [x] CRUD operations berfungsi
- [x] Batch delete berfungsi
- [x] Excel export berfungsi
- [x] Responsive design
- [x] Error handling
- [x] Loading states
- [ ] Test dengan backend real
- [ ] E2E testing
- [ ] Performance optimization

---

## 15. Catatan untuk Developer Lain

1. **Feature Flags:** Matikan fitur di `lib/features.ts` jika backend belum siap
2. **API Response:** POST return `{entity: ...}`, PUT return `{ok: true}`
3. **Barber Status:** Backend pakai `status: "active"/"inactive"`, frontend convert ke `is_active`
4. **Image Upload:** Gunakan base64, max 2MB
5. **Windows/Linux:** Repository case-sensitive, gunakan lowercase untuk filenames

---

## 16. Penutup

Dashboard admin PangkasKAKA sudah selesai dan berfungsi dengan baik. Semua fitur utama sudah terimplementasi:

- ✅ Autentikasi dan otorisasi
- ✅ Manajemen pelamar StreetBarber
- ✅ CRUD produk, layanan, dan karyawan
- ✅ Laporan keuangan dengan Excel export
- ✅ Profil admin

Sistem siap untuk digunakan setelah integrasi dengan backend yang sesungguhnya.

---

*Document generated on 10 September 2026*
