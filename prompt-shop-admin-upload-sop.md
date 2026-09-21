# Prompt Implementasi — Unggah Dokumen SOP StreetBarber (Website Admin Toko)

Prompt ini untuk AI agent yang bekerja di repo **WEBSITE ADMIN TOKO terpisah**
(`pangkaskaka-shop-admin` — role "Admin", scope-nya per toko lewat `managed_shop_ids`),
BUKAN repo aplikasi mobile PangkasKAKA. Tempel isi file ini sebagai instruksi awal ke
agent tersebut. Saya (yang menulis prompt ini) tidak punya akses ke repo website ini,
jadi ikuti pola kode/komponen/routing yang SUDAH ADA di repo ini sendiri — jangan
menebak dari prompt lain yang mungkin menyebut konvensi repo aplikasi mobile, itu tidak
berlaku di sini.

## 1. Konteks

Mentor meminta setiap StreetBarber wajib mematuhi SOP (Standar Operasional Prosedur)
yang mencakup kebersihan, kerapihan, kesopanan, kelengkapan alat, dan interaksi dengan
pelanggan saat melayani panggilan ke rumah (lihat
`Noted/2026-09-21/Mentoring-Pitching.md` poin 6). Alurnya:

1. **Admin toko** (role "Admin" di website ini) mengunggah SATU dokumen PDF berisi SOP,
   per toko yang dia kelola.
2. StreetBarber yang tervalidasi toko itu membaca dokumen ini di dashboard mereka
   (aplikasi mobile — SUDAH SELESAI dibuat di sisi mobile, di luar cakupan prompt ini).

Backend (FastAPI, shared dengan aplikasi mobile) sudah menyediakan endpoint upload-nya —
lihat §2. Tugas prompt ini murni membuat UI unggah di website ini.

Sebagai referensi konten, template SOP default (5 bagian: Kebersihan, Kerapihan,
Kesopanan, Kelengkapan Alat, Interaktif dengan Pelanggan — masing-masing dengan
checklist konkret) sudah dibuatkan di `backend/db/SOP-StreetBarber-PangkasKAKA.pdf`.
Admin toko boleh unggah file ini apa adanya sebagai titik awal, atau menggantinya
dengan versi mereka sendiri.

## 2. Endpoint backend yang SUDAH ADA (jangan ubah `server.py`)

```
PUT /shop-admin/shops/{shop_id}/sop
  auth: Bearer token role "admin", DAN shop_id harus ada di managed_shop_ids user itu
        (kalau tidak, balas 403 "Bukan toko yang Anda kelola")
  body: { shop_id: string, document: string }
        // document = data-URL base64, format "data:application/pdf;base64,<data>"
  → { ok: true, sop_document_url: string }   // URL R2 publik dari PDF yang baru diunggah

  Catatan: endpoint ini MENIMPA dokumen SOP lama toko itu (satu dokumen per toko,
  bukan riwayat versi). Unggah ulang = ganti total.
```

Untuk MENAMPILKAN status SOP saat ini (misal cek apakah toko sudah punya SOP, kapan
terakhir diperbarui), gunakan endpoint yang dipakai layar lain di website ini untuk
mengambil detail toko yang dikelola Admin (`GET /shop-admin/...` — cek pola yang sudah
ada di repo ini untuk shape response toko; kalau field `sop_document_url` /
`sop_updated_at` belum muncul di endpoint GET yang ada, laporkan dulu ke user, jangan
menambah endpoint baru sendiri di backend).

## 3. Cakupan

**Di dalam cakupan:**

- Satu layar/section baru (atau tambahan di layar pengaturan toko yang sudah ada, kalau
  repo ini sudah punya konsep "Pengaturan Toko") untuk Admin: unggah/ganti dokumen SOP.
- Terima file `.pdf` saja (validasi tipe file di sisi client sebelum encode ke base64;
  server tidak memvalidasi tipe MIME secara ketat).
- Encode file yang dipilih jadi data-URL base64, kirim lewat `PUT
  /shop-admin/shops/{shop_id}/sop`.
- Tampilkan status: kalau toko sudah punya SOP, tampilkan link "Lihat SOP saat ini"
  (buka `sop_document_url` di tab baru) + tombol "Ganti Dokumen". Kalau belum ada,
  tampilkan ajakan unggah + boleh sertakan link unduh template default di
  `backend/db/SOP-StreetBarber-PangkasKAKA.pdf` sebagai titik awal (tanyakan ke user di
  mana template ini sebaiknya di-hosting supaya bisa diunduh dari website — file-nya
  ada di repo backend, bukan di repo website ini).
- Loading state saat upload berlangsung (file PDF bisa beberapa ratus KB — jangan
  biarkan UI terasa diam tanpa feedback).
- Pesan error yang jelas kalau upload gagal (403 toko bukan miliknya, ukuran file
  kelewat besar, dsb — cek batas ukuran upload yang berlaku di endpoint upload lain di
  repo ini kalau ada, biar konsisten).

**Di luar cakupan (JANGAN dikerjakan):**

- Perubahan apa pun di backend `server.py` — endpoint di §2 sudah aktif dan
  diverifikasi (`python -m py_compile` OK).
- Riwayat/versi SOP (multiple SOP tersimpan sekaligus) — di luar scope, satu dokumen
  aktif per toko sudah cukup untuk sekarang.
- Apa pun di sisi aplikasi mobile (tampilan StreetBarber membaca SOP) — itu sudah
  selesai dibuat terpisah, di luar cakupan prompt ini.

## 4. Verifikasi

1. Jalankan type-check/lint yang biasa dipakai repo ini — harus bersih.
2. Login sebagai Admin toko (akun yang `managed_shop_ids`-nya berisi minimal satu toko)
   → buka fitur unggah SOP → pilih file PDF → unggah → pastikan `sop_document_url`
   tersimpan dan bisa dibuka lagi di tab baru.
3. Ganti dokumen dengan file PDF lain → pastikan dokumen lama benar-benar tergantikan
   (bukan bertambah jadi daftar).
4. Coba akses fitur ini dengan akun Admin yang TIDAK mengelola toko tsb (`shop_id` di
   luar `managed_shop_ids`-nya) → pastikan mendapat error 403 yang ditangani dengan
   pesan jelas, bukan crash.
