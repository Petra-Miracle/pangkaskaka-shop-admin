# Laporan Serah Terima — Repo Shop-Admin (Validator StreetBarber)

| | |
|---|---|
| **Repo** | `pangkaskaka-shop-admin` |
| **Sistem** | Admin (bukan SuperAdmin, bukan aplikasi utama) |
| **Cabang** | `main` |
| **Terakhir diupdate** | 8 September 2026 |
| **Link repo** | https://github.com/Petra-Miracle/pangkaskaka-shop-admin |

> Catatan: repo ini adalah sistem **Admin** — dashboard untuk memvalidasi pelamar
> StreetBarber di toko yang di-*assign*. Kalau kamu ditugaskan pegang repo
> **SuperAdmin** yang terpisah, laporan ini tetap berguna sebagai referensi batas
> antar sistem (lihat bagian "Batas Sistem" di bawah), tapi kode & struktur
> folder yang dibahas di sini ada di repo yang berbeda.

**Ringkasan:** 9 item sudah selesai · 3 prioritas tinggi belum bisa dites (butuh backend/akun asli) · 4 item menengah/rendah belum dikerjakan.

---

## ⚠ Batas Sistem — Jangan Dikerjakan di Repo Ini

Ini bagian paling penting. Repo ini murni untuk validasi StreetBarber. Hal-hal
berikut sengaja **di luar cakupan** karena jadi tanggung jawab sistem lain —
kalau butuh salah satu dari ini, itu tandanya harus koordinasi ke pemilik
produk / tim SuperAdmin atau Owner dulu, bukan ditambah sendiri di sini.

- ❌ Membuat / mengedit akun Admin (`POST /superadmin/admins`) — wewenang SuperAdmin, dilakukan di sistem lain.
- ❌ Approval toko & dokumen legalitas (KTP pemilik, NIB, NPWP, dsb) — tetap di aplikasi SuperAdmin.
- ❌ Manajemen barber toko biasa (non-StreetBarber), layanan, produk, pesanan — wilayah dashboard Owner.
- ❌ Fitur baru di luar: login, dashboard ringkasan, daftar & detail pelamar (berkas + evaluasi), chat rekrutmen, profil.
- ❌ Mengubah urutan status pelamar (`pending → menunggu_tes/rejected → active/rejected`) di frontend — status ini ditentukan backend, jangan di-hardcode ulang alurnya di sini.

---

## ✅ Sudah Selesai

- **Login + gerbang role** — hanya role `admin` yang diloloskan; role lain ditolak di frontend dengan pesan jelas meski backend tetap mengeluarkan token.
- **Sesi & token** — token JWT di `localStorage`, auto-attach ke tiap request, auto-redirect ke login saat 401. Sudah dites: refresh halaman tidak memaksa logout.
- **Dashboard** — ringkasan toko yang dikelola + jumlah pelamar per status per toko, dengan empty-state kalau belum ada toko di-*assign*.
- **Daftar pelamar** — gabungan semua toko yang dikelola, filter per toko & per status.
- **Tinjau berkas (tahap 1)** — tampilkan semua dokumen pelamar; tombol Setujui/Tolak muncul hanya saat status `pending`; alasan wajib diisi saat menolak.
- **Evaluasi tes (tahap 2)** — form 6 kriteria (0–20), live total & prediksi hasil/level (tampilan saja — hasil final tetap dari backend), hasil read-only setelah dievaluasi.
- **Chat rekrutmen** — polling tiap 4 detik, kirim teks + lampiran gambar; otomatis nonaktif untuk status `pending`/`rejected`.
- **Profil & visual** — halaman profil (info + daftar toko + logout). Desain memakai token warna & font yang sama persis dengan dashboard SuperAdmin mobile.
- **Build, lint, verifikasi alur** — `npm run build` & `npm run lint` bersih. Seluruh alur (login ditolak untuk non-admin, pending→approve→evaluasi, kirim chat, sesi bertahan) sudah dites lewat mock API lokal — **belum lewat backend asli**, lihat di bawah.

---

## 🔴 Belum Selesai — Prioritas Tinggi

### 1. Sambungkan ke backend asli
`NEXT_PUBLIC_API_URL` sekarang cuma fallback ke `http://localhost:8000` dan
belum pernah dicoba ke URL Railway/staging sungguhan.

**Selesai kalau:** `.env.local` diisi URL asli (jangan di-commit, sudah masuk
`.gitignore`), lalu semua alur di bawah dites ulang dengan data nyata.

### 2. Akun Admin uji coba sungguhan
Belum ada kredensial akun Admin asli untuk login. Akun ini **tidak bisa dibuat
dari repo ini** — harus diminta ke tim SuperAdmin lewat `POST
/superadmin/admins`, lengkap dengan `managed_shop_ids` yang sudah di-assign.

**Selesai kalau:** login berhasil dan toko yang tampil di dashboard cocok
dengan yang di-assign SuperAdmin.

### 3. Verifikasi alur end-to-end ke database asli
Alur pending → setujui berkas → evaluasi → status akhir (aktif jika total ≥
60) baru divalidasi lewat mock API, belum dicocokkan dengan data MongoDB
sungguhan.

**Selesai kalau:** satu pelamar uji coba dijalankan penuh dan hasil di
database sesuai yang tampil di web.

---

## 🟡 Belum Selesai — Prioritas Menengah

### 4. Cek silang chat dengan aplikasi mobile
Pesan yang dikirim Admin dari web ini belum dikonfirmasi muncul di sisi
aplikasi mobile StreetBarber pada thread yang sama.

**Selesai kalau:** kirim pesan dari web, muncul di mobile app, dan sebaliknya.

### 5. Deployment
Belum di-deploy ke hosting manapun. Rekomendasi awal: Vercel (gratis, cocok
untuk skala ini) — tapi domain/hosting final perlu dikonfirmasi ke pemilik
produk.

**Selesai kalau:** ada URL production yang bisa diakses tim & SuperAdmin
untuk demo.

---

## ⚪ Belum Selesai — Prioritas Rendah / Catatan

### 6. Automated test
Belum ada unit/e2e test otomatis. Verifikasi sejauh ini manual (screenshot
Playwright + mock API sekali jalan).

### 7. Gambar pakai `<img>` biasa, bukan `next/image`
Sengaja, karena domain sumber foto KTP/portofolio dari backend belum
diketahui. Kalau nanti mau pindah ke `next/image` untuk optimasi, tambahkan
dulu `images.remotePatterns` di `next.config.ts` — jangan diubah tanpa tahu
domain storage yang dipakai backend.

---

## Referensi Cepat

**Menjalankan lokal**
```bash
npm install
cp .env.example .env.local
npm run dev
```

**Struktur inti**
- `app/(dashboard)/applicants/[kid]/` — detail pelamar
- `contexts/AuthContext.tsx` — sesi & toko
- `lib/api.ts` — wrapper fetch
- `lib/types.ts` — bentuk data API

Detail lebih lengkap ada di `README.md` di root repo.

---

Ada pertanyaan soal batas antar sistem (Admin / SuperAdmin / aplikasi utama)?
Konfirmasi ke pemilik produk sebelum menambah cakupan baru.
