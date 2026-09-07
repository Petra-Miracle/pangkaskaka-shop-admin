# PangkasKAKA Shop Admin

Website Admin PangkasKAKA — portal untuk role **Admin** (validator StreetBarber)
memvalidasi pelamar StreetBarber untuk toko-toko yang di-assign ke akun mereka
oleh SuperAdmin.

Ini adalah aplikasi **frontend murni**: tidak ada backend sendiri, semua data
dikonsumsi dari REST API PangkasKAKA yang sudah ada (backend FastAPI yang sama
dengan aplikasi mobile).

## Cakupan

- Login khusus role `admin` (role lain ditolak di sisi frontend).
- Dashboard: ringkasan toko yang dikelola & jumlah pelamar per status.
- Daftar pelamar StreetBarber (filter per toko & status).
- Detail pelamar: tinjau berkas (tahap 1), evaluasi 6 kriteria skor 0–20
  (tahap 2), dan chat rekrutmen untuk koordinasi jadwal tes.
- Profil akun Admin yang login.

Pembuatan akun Admin, approval toko/legalitas, dan manajemen operasional toko
biasa **di luar cakupan** — itu tetap wewenang SuperAdmin/Owner di aplikasi
mobile.

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # sesuaikan NEXT_PUBLIC_API_URL jika perlu
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

`NEXT_PUBLIC_API_URL` adalah base URL backend **tanpa** `/api` di akhir
(contoh: `https://api-production-xxxx.up.railway.app`). Default ke
`http://localhost:8000` jika tidak diset — cocok untuk menjalankan backend
FastAPI secara lokal.

## Autentikasi

Token JWT disimpan di `localStorage` (lihat [lib/auth.ts](lib/auth.ts)) dan
dikirim sebagai header `Authorization: Bearer <token>` di setiap request
([lib/api.ts](lib/api.ts)). Backend tidak membatasi role mana yang boleh
login — pembatasan role `admin` dilakukan di frontend saat submit form login
([contexts/AuthContext.tsx](contexts/AuthContext.tsx)).

## Struktur proyek

```text
app/
  login/page.tsx
  (dashboard)/
    layout.tsx               # auth guard + sidebar
    dashboard/page.tsx
    applicants/page.tsx
    applicants/[kid]/page.tsx  # + BerkasReview, EvaluationPanel, ChatPanel
    profile/page.tsx
contexts/
  AuthContext.tsx             # session, user, managed shops
  ApplicantsContext.tsx       # daftar pelamar (shared antar halaman)
lib/
  api.ts                      # fetch wrapper + auto Authorization header
  auth.ts                     # token storage
  config.ts                   # base URL API
  types.ts                    # tipe data (KaryawanApplication, Shop, dll)
```

## Build

```bash
npm run build
npm run lint
```
