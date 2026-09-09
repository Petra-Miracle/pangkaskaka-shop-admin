# System Building Report — PangkasKAKA Shop Admin

## 1. Project Overview

| Item | Detail |
|------|--------|
| **Nama Project** | PangkasKAKA Shop Admin |
| **URL** | https://pangkaskaka-shop-admin.vercel.app |
| **Repo Frontend** | https://github.com/Petra-Miracle/pangkaskaka-shop-admin |
| **Repo Backend** | https://github.com/Petra-Miracle/APP-PangkasKAKA |
| **Branch** | `main` |
| **Framework** | Next.js 16.3.4 (Turbopack) |
| **UI Library** | HeroUI v3 + shadcn/ui + Tailwind CSS |
| **Chart** | Recharts |
| **Tabel** | @tanstack/react-table v9 (legacy API) |
| **Excel Export** | xlsx v0.20.3 |
| **Deployment** | Vercel (Production) |
| **Backend Deploy** | Railway |
| **Report Date** | September 10, 2026 |

---

## 2. Tech Stack

### Frontend
- **Next.js 16.3.4** — App Router, React Server Components
- **TypeScript** — Strict mode
- **Tailwind CSS** — Utility-first CSS
- **HeroUI v3** — Dropdown, Avatar, Separator, Label
- **shadcn/ui** — Button, Input, Badge, Dialog, Table, Card
- **@tanstack/react-table v9** — DataTable with sorting, pagination
- **Recharts** — Revenue charts
- **xlsx v0.20.3** — Excel export
- **Lucide React** — Icons

### Backend
- **FastAPI** — Python web framework
- **Motor** — Async MongoDB driver
- **MongoDB** — Database
- **Cloudflare R2** — File/image storage

---

## 3. Feature Flags

```typescript
// lib/features.ts
export const FEATURES = {
  products: true,   // Products CRUD via API
  services: true,   // Services CRUD via API
  revenue: true,    // Revenue read-only via API
  barbers: true,    // Barbers CRUD via API
} as const;
```

When feature flag is `true`, data comes from backend API. When `false` or API returns 404, falls back to localStorage.

---

## 4. Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/login` | LoginPage | Email + password auth |
| `/dashboard` | DashboardPage | Summary cards, quick links |
| `/applicants` | ApplicantsPage | StreetBarber applicant management |
| `/applicants/[kid]` | ApplicantDetailPage | Detail & evaluation |
| `/barbers` | BarbersPage | Karyawan/Barber CRUD + batch delete |
| `/products` | ProductsPage | Product catalog CRUD + batch delete |
| `/services` | ServicesPage | Service management CRUD + batch delete |
| `/revenue` | RevenuePage | Revenue (read-only) + Excel export |
| `/profile` | ProfilePage | User info & shop list |

---

## 5. Navigation Structure

```
Utama
  └── Dashboard

Manajemen
  ├── Pelamar StreetBarber
  └── Karyawan / Barber

Usaha
  ├── Katalog Produk
  └── Layanan

Keuangan
  └── Revenue

Akun
  └── Profil
```

---

## 6. API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shop-admin/products` | List products |
| POST | `/shop-admin/products` | Create product (returns `{product: ...}`) |
| PUT | `/shop-admin/products/{id}` | Update product (returns `{ok: true}`) |
| DELETE | `/shop-admin/products/{id}` | Delete product |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shop-admin/services` | List services |
| POST | `/shop-admin/services` | Create service (returns `{service: ...}`) |
| PUT | `/shop-admin/services/{id}` | Update service (returns `{ok: true}`) |
| DELETE | `/shop-admin/services/{id}` | Delete service |

### Barbers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shop-admin/barbers` | List barbers (maps `status` → `is_active`) |
| POST | `/shop-admin/barbers` | Create barber (stores `status: "active"/"inactive"`) |
| PUT | `/shop-admin/barbers/{id}` | Update barber (returns `{ok: true}`) |
| DELETE | `/shop-admin/barbers/{id}` | Delete barber |

### Revenue
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shop-admin/revenue` | List transactions |
| GET | `/shop-admin/revenue/summary` | Revenue summary |

### Applicants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shop-admin/applicants` | List applicants |
| GET | `/shop-admin/applicants/{id}` | Applicant detail |
| PUT | `/shop-admin/applicants/{id}` | Update applicant |

---

## 7. Component Architecture

### Layout
```
app/layout.tsx (RootLayout)
  └── app/(dashboard)/layout.tsx (DashboardLayout)
        ├── Sidebar
        ├── Topbar
        ├── MobileNav
        └── <children>
```

### UI Components
| Component | Path | Description |
|-----------|------|-------------|
| Button | `components/ui/button.tsx` | Variants: default, outline, ghost, destructive |
| Input | `components/ui/input.tsx` | With base-ui InputPrimitive |
| Label | `components/ui/label.tsx` | Form label |
| Badge | `components/ui/badge.tsx` | Status badges |
| Dialog | `components/ui/dialog.tsx` | Modal dialogs |
| Table | `components/ui/table.tsx` | Base table (uppercase header) |
| DataTable | `components/ui/data-table.tsx` | Generic table with sorting, pagination, batch delete |
| Card | `components/ui/card.tsx` | Simple card wrapper |

### Shared Components
| Component | Path | Description |
|-----------|------|-------------|
| Sidebar | `components/nav/sidebar.tsx` | Left navigation |
| Topbar | `components/nav/topbar.tsx` | Header with breadcrumb |
| MobileNav | `components/nav/mobile-nav.tsx` | Mobile drawer nav |
| PageHeader | `components/nav/page-header.tsx` | Page title + description |
| StatusBadge | `components/StatusBadge.tsx` | Applicant status badges |

---

## 8. Data Flow

### LocalStorage Fallback Pattern
```
Feature Flag = true?
  ├── YES → Fetch from API
  │         ├── Success → Display data
  │         └── 404 → Load from localStorage
  └── NO  → Load from localStorage
```

### State Management
- **AuthContext** — User, shops, login/logout
- **ApplicantsContext** — Applicants data
- **Page-level useState** — Products, services, barbers, revenue

### Form Pattern
```
useEffect([open, entity]) → Reset form fields on dialog open
handleSubmit → Set submitting → Try API → On 404 → Fallback to localStorage
onCreated/onUpdated → Update parent state → Close dialog
finally → Set submitting false
```

### API Response Extraction
```
POST /shop-admin/products  → {product: ...}  → extract .product
POST /shop-admin/services  → {service: ...}  → extract .service
POST /shop-admin/barbers   → {barber: ...}   → extract .barber
PUT  /shop-admin/products/{id} → {ok: true}  → pass payload to onUpdated
PUT  /shop-admin/services/{id} → {ok: true}  → pass payload to onUpdated
PUT  /shop-admin/barbers/{id}  → {ok: true}  → pass payload to onUpdated
```

---

## 9. File Structure

```
pangkaskaka-shop-admin/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles + HeroUI
│   ├── login/page.tsx                # Login page
│   └── (dashboard)/
│       ├── layout.tsx                # Dashboard layout (auth guard)
│       ├── dashboard/page.tsx        # Dashboard
│       ├── applicants/
│       │   ├── page.tsx              # Applicants list
│       │   └── [kid]/page.tsx        # Applicant detail
│       ├── barbers/
│       │   ├── page.tsx              # Barbers list + batch delete
│       │   └── BarberFormDialog.tsx  # Add/edit barber
│       ├── products/
│       │   ├── page.tsx              # Products list + batch delete
│       │   └── ProductFormDialog.tsx # Add/edit product
│       ├── services/
│       │   ├── page.tsx              # Services list + batch delete
│       │   └── ServiceFormDialog.tsx # Add/edit service
│       ├── revenue/
│       │   ├── page.tsx              # Revenue + Excel export
│       │   ├── RevenueTable.tsx      # Transaction table
│       │   └── RevenueSummaryCards.tsx # Summary cards
│       └── profile/page.tsx          # Profile
├── components/
│   ├── ui/                           # shadcn components
│   ├── nav/                          # Navigation components
│   └── StatusBadge.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── ApplicantsContext.tsx
├── lib/
│   ├── api.ts                        # API wrapper with auth
│   ├── auth.ts                       # Token management
│   ├── features.ts                   # Feature flags
│   ├── nav-items.ts                  # Navigation config
│   ├── storage.ts                    # localStorage CRUD (products, services, barbers)
│   ├── types.ts                      # TypeScript types
│   └── utils.ts                      # cn, formatRupiah, formatRelativeTime
├── public/
│   └── pangkaskaka-logo.jpeg
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 10. Key Features Implemented

### 10.1 DataTable with Pagination
- Controlled pagination state via `useState`
- Memoized table options to prevent reset on re-render
- Page size selector: 10 / 25 / 50
- Sorting on all columns (uncontrolled)
- Skeleton loading state

### 10.2 Batch Delete
- Checkbox selection per row
- "Select All" checkbox in header
- "Hapus Terpilih" button with confirmation dialog
- Uses `Promise.allSettled` for partial failure tolerance
- Only removes successfully deleted items from UI

### 10.3 Form Dialogs (Product, Service, Barber)
- `useEffect` resets form on dialog open
- No loading states (instant save)
- `submitting` state prevents double-click duplicates
- Disable submit button while submitting
- localStorage fallback on API 404

### 10.4 Revenue Page
- Filter by date range (start/end)
- Filter by type (All/Income/Expense)
- Summary cards: Total Pendapatan, Total Pengeluaran, Laba Bersih
- Transaction table with all details
- Export Excel with SUMIF formulas

### 10.5 Excel Export Structure
```
LAPORAN KEUANGAN TOKO
─────────────────────────────────────
Toko      : PangkasKAKA
Periode   : 1 Sep 2026 — 9 Sep 2026
Filter    : Semua

RINGKASAN KEUANGAN
─────────────────────────────────────
Keterangan                        | Jumlah
Total Pendapatan (Pemasukan)      | =SUMIF(range,"Pendapatan",amount_range)
Total Pengeluaran (Pengeluaran)   | =ABS(SUMIF(range,"Pengeluaran",amount_range))
Laba Bersih                       | =B10-B11

DATA TRANSAKSI
─────────────────────────────────────
Tanggal | Deskripsi | Kategori | Tipe | Jumlah (Rp) | Dicatat Oleh
```

---

## 11. Bug Fixes Applied

### Critical Fixes
| Bug | Fix |
|-----|-----|
| Revenue page permanent loading | Added `useEffect` to initialize `selectedShopId` when shops load |
| Form double-click creates duplicates | Added `submitting` state + disable button while processing |

### Medium Fixes
| Bug | Fix |
|-----|-----|
| DataTable sorting locked to initial state | Made sorting uncontrolled (removed `state.sorting`) |
| Batch delete leaves UI inconsistent on partial failure | Changed `Promise.all` → `Promise.allSettled` |
| Barbers not appearing in customer app | Backend stores `status: "active"` instead of `is_active: true` |

### Backend Fixes
| Bug | Fix |
|-----|-----|
| Admin barbers endpoint stores `is_active` | Changed to store `status: "active"/"inactive"` + `photo` + `skill_level` |
| GET barbers response missing `is_active` | Added mapping: `is_active = status == "active"` |

---

## 12. Deployment

### Frontend (Vercel)
```bash
# Clean deploy
Remove-Item -Recurse -Force .vercel
npx vercel --prod --force
```

### Backend (Railway)
- Auto-deploy from `main` branch
- URL: https://app-pangkaskaka-production.up.railway.app

---

## 13. Development Notes

### Windows + Vercel
- `core.ignorecase = true` on Windows
- Vercel builds on Linux (case-sensitive)
- Always use lowercase file paths

### PowerShell
- No `&&` support — use `; if ($?) { ... }`
- Quote paths with parentheses: `"app/(dashboard)/..."`

### HeroUI v3
- No Provider wrapper needed
- Import styles in `globals.css`: `@import "@heroui/styles"`
- Dropdown pattern: `Dropdown > Dropdown.Trigger > Dropdown.Popover > Dropdown.Menu`

### @tanstack/react-table v9
- Use legacy API: `import { useLegacyTable, legacyCreateColumnHelper } from "@tanstack/react-table/legacy"`
- ColumnHelper: `legacyCreateColumnHelper<Type>()`
- Types: `LegacyColumnDef<Type, any>`

---

## 14. Current Status

| Feature | Status | API | Notes |
|---------|--------|-----|-------|
| Login | ✅ Working | Yes | Email + password |
| Dashboard | ✅ Working | Yes | Summary cards |
| Applicants | ✅ Working | Yes | List + detail + evaluation |
| Barbers | ✅ Working | Yes | CRUD + batch delete + customer app compatible |
| Products | ✅ Working | Yes | CRUD + batch delete |
| Services | ✅ Working | Yes | CRUD + batch delete |
| Revenue | ✅ Working | Yes | Read-only + SUMIF Excel export |
| Profile | ✅ Working | Yes | User info |

---

## 15. Git History (Recent)

```
843fa1b Revert "feat: add Total Transaksi with COUNTA formula to Excel export"
88d9abb feat: Excel export with SUMIF formulas for accurate calculations
94451c0 feat: structured Excel export with summary section
432abc9 chore: add WhatsApp images to gitignore
c6d34e0 fix: critical dashboard issues - revenue loading, double-submit, sorting, bulk delete
928f042 fix: extract API response correctly for products and services
3e4d1a1 fix: pagination state management in DataTable
6ca4afa feat: add batch delete to products, barbers, services
9aff22c fix: handle backend response format for barbers
8b255e2 feat: add barbers CRUD page with batch delete
c1d38e7 feat: add barbers page and backend endpoints
```

---

*Report generated on: September 10, 2026*
*Last deployment: Production (Vercel + Railway)*
*Status: All features working, no critical issues*
