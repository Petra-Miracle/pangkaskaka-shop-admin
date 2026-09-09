# Backend Preparation Guide — ShopAdmin API

**Base URL:** `{API_BASE}/api` (default: `http://localhost:8000/api`)

Semua endpoint yang ditandai `🔑` memerlukan header `Authorization: Bearer <token>`.

---

## 1. Produk (4 endpoint)

### `GET /api/shop-admin/products` 🔑
**Response:**
```json
{
  "products": [
    {
      "id": "string",
      "shop_id": "string",
      "name": "Pomade Matte Clay",
      "description": "Deskripsi produk",
      "price": 50000,
      "stock": 10,
      "category": "Pomade",
      "image_url": "https://...",
      "is_active": true,
      "created_at": "2026-09-09T00:00:00Z",
      "updated_at": "2026-09-09T00:00:00Z"
    }
  ]
}
```

### `POST /api/shop-admin/products` 🔑
**Request:**
```json
{
  "shop_id": "string (wajib)",
  "name": "string (wajib)",
  "description": "string (opsional)",
  "price": 50000,
  "stock": 10,
  "category": "string (opsional)",
  "image_url": "string (opsional, base64 atau URL)",
  "is_active": true
}
```
**Response:** Object `Product` yang baru dibuat.

### `PUT /api/shop-admin/products/{id}` 🔑
**Request:** Sama seperti POST.
**Response:** Object `Product` yang sudah diupdate.

### `DELETE /api/shop-admin/products/{id}` 🔑
**Response:** `{}` atau `{ "ok": true }`

---

## 2. Layanan (4 endpoint)

### `GET /api/shop-admin/services` 🔑
**Response:**
```json
{
  "services": [
    {
      "id": "string",
      "shop_id": "string",
      "name": "Potong Rambut Premium",
      "description": "Deskripsi layanan",
      "price": 35000,
      "duration_minutes": 30,
      "is_active": true,
      "created_at": "2026-09-09T00:00:00Z",
      "updated_at": "2026-09-09T00:00:00Z"
    }
  ]
}
```

### `POST /api/shop-admin/services` 🔑
**Request:**
```json
{
  "shop_id": "string (wajib)",
  "name": "string (wajib)",
  "description": "string (opsional)",
  "price": 35000,
  "duration_minutes": 30,
  "is_active": true
}
```
**Response:** Object `Service` yang baru dibuat.

### `PUT /api/shop-admin/services/{id}` 🔑
**Request:** Sama seperti POST.
**Response:** Object `Service` yang sudah diupdate.

### `DELETE /api/shop-admin/services/{id}` 🔑
**Response:** `{}` atau `{ "ok": true }`

---

## 3. Revenue / Keuangan (2 endpoint, READ-ONLY untuk Admin)

### `GET /api/shop-admin/revenue/summary` 🔑
**Query params:**
| Param | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `shop_id` | string | Ya | ID toko |
| `type` | string | Tidak | `"income"` atau `"expense"` |
| `start_date` | string | Tidak | Format: `YYYY-MM-DD` |
| `end_date` | string | Tidak | Format: `YYYY-MM-DD` |

**Response:**
```json
{
  "shop_id": "string",
  "total_income": 500000,
  "total_expense": 200000,
  "net_profit": 300000,
  "transaction_count": 15,
  "period_start": "2026-09-01",
  "period_end": "2026-09-30"
}
```

### `GET /api/shop-admin/revenue` 🔑
**Query params:** Sama seperti summary.
**Response:**
```json
{
  "transactions": [
    {
      "id": "string",
      "shop_id": "string",
      "type": "income",
      "amount": 50000,
      "description": "Potong rambut pelanggan",
      "category": "Layanan",
      "recorded_by": "user_id",
      "recorded_by_role": "owner",
      "created_at": "2026-09-09T10:30:00Z"
    }
  ]
}
```

---

## 4. Endpoint yang Sudah Ada (Tidak Perlu Diubah)

| Method | Path | Catatan |
|--------|------|---------|
| POST | `/api/auth/login` | Sudah jalan |
| GET | `/api/auth/me` | Sudah jalan |
| GET | `/api/shops/{id}` | Sudah jalan |
| GET | `/api/shop-admin/karyawan` | Sudah jalan |
| POST | `/api/shop-admin/karyawan/{id}/berkas-decision` | Sudah jalan |
| POST | `/api/shop-admin/karyawan/{id}/evaluate` | Sudah jalan |
| GET | `/api/recruitment/{id}/messages` | Sudah jalan |
| POST | `/api/recruitment/{id}/messages` | Sudah jalan |

---

## 5. Database Collections (MongoDB)

### `products`
```javascript
{
  _id: ObjectId,
  shop_id: String,       // ref: shops
  name: String,          // required
  description: String,
  price: Number,         // required, in Rupiah
  stock: Number,         // default: 0
  category: String,      // "Pomade"|"Aksesoris"|"Perawatan"|"Peralatan"|"Lainnya"
  image_url: String,     // URL atau base64
  is_active: Boolean,    // default: true
  created_at: Date,
  updated_at: Date
}
```

### `services`
```javascript
{
  _id: ObjectId,
  shop_id: String,       // ref: shops
  name: String,          // required
  description: String,
  price: Number,         // required, in Rupiah
  duration_minutes: Number, // default: 30
  is_active: Boolean,    // default: true
  created_at: Date,
  updated_at: Date
}
```

### `transactions` (jika belum ada)
```javascript
{
  _id: ObjectId,
  shop_id: String,       // ref: shops
  type: String,          // "income"|"expense"
  amount: Number,        // required
  description: String,   // required
  category: String,      // opsional
  recorded_by: String,   // ref: users (user_id yang mencatat)
  recorded_by_role: String, // "owner"|"admin"|"barber"
  created_at: Date
}
```

---

## 6. Features Flag

Setelah endpoint selesai, update `lib/features.ts` di frontend:
```typescript
export const FEATURES = {
  products: true,   // ubah dari false ke true
  services: true,   // ubah dari false ke true
  revenue: true,    // ubah dari false ke true
};
```

---

## 7. Validasi Role

Pastikan endpoint `/api/shop-admin/*` hanya bisa diakses oleh user dengan `role: "admin"` dan hanya untuk `shop_id` yang ada di `managed_shop_ids` milik admin tersebut.

---

## 8. CORS

Backend harus mengizinkan origin `https://pangkaskaka-shop-admin.vercel.app` untuk:
- `GET`, `POST`, `PUT`, `DELETE`
- Header: `Content-Type`, `Authorization`

---

## Urutan Pengerjaan

1. **Produk CRUD** — paling sederhana, langsung bisa testing
2. **Layanan CRUD** — mirip produk
3. **Revenue read-only** — butuh data `transactions` (bisa dummy dulu)
4. **Update features flags** di frontend setelah semua endpoint jalan
