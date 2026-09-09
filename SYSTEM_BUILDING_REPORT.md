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
- **xlsx** — Excel export
- **Lucide React** — Icons

### Backend
- **FastAPI** — Python web framework
- **Motor** — Async MongoDB driver
- **MongoDB** — Database

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
| `/barbers` | BarbersPage | Karyawan/Barber management |
| `/products` | ProductsPage | Product catalog CRUD |
| `/services` | ServicesPage | Service management CRUD |
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
| POST | `/shop-admin/products` | Create product |
| PUT | `/shop-admin/products/{id}` | Update product |
| DELETE | `/shop-admin/products/{id}` | Delete product |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shop-admin/services` | List services |
| POST | `/shop-admin/services` | Create service |
| PUT | `/shop-admin/services/{id}` | Update service |
| DELETE | `/shop-admin/services/{id}` | Delete service |

### Barbers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shop-admin/barbers` | List barbers |
| POST | `/shop-admin/barbers` | Create barber |
| PUT | `/shop-admin/barbers/{id}` | Update barber |
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
| DataTable | `components/ui/data-table.tsx` | Generic table with sorting, pagination |
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
handleSubmit → Try API → On 404 → Fallback to localStorage
onCreated/onUpdated → Update parent state → Close dialog
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
│       │   ├── page.tsx              # Barbers list
│       │   └── BarberFormDialog.tsx  # Add/edit barber
│       ├── products/
│       │   ├── page.tsx              # Products list
│       │   └── ProductFormDialog.tsx # Add/edit product
│       ├── services/
│       │   ├── page.tsx              # Services list
│       │   └── ServiceFormDialog.tsx # Add/edit service
│       ├── revenue/
│       │   ├── page.tsx              # Revenue + export
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
│   ├── api.ts                        # API wrapper
│   ├── auth.ts                       # Token management
│   ├── features.ts                   # Feature flags
│   ├── nav-items.ts                  # Navigation config
│   ├── storage.ts                    # localStorage CRUD
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

## 10. Deployment

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

## 11. Development Notes

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

## 12. Current Status

| Feature | Status | API Required |
|---------|--------|--------------|
| Login | ✅ Working | Yes |
| Dashboard | ✅ Working | Yes |
| Applicants | ✅ Working | Yes |
| Barbers | ✅ Working | No (localStorage fallback) |
| Products | ✅ Working | No (localStorage fallback) |
| Services | ✅ Working | No (localStorage fallback) |
| Revenue | ✅ Working | Yes |
| Revenue Export | ✅ Working | No |
| Profile | ✅ Working | Yes |

---

## 13. Known Limitations

1. **Barbers API** — Backend endpoint `/shop-admin/barbers` may not exist yet; currently uses localStorage fallback
2. **No real-time updates** — Data refreshes on page load
3. **No image upload** — Products use URL input, not file upload
4. **Revenue read-only** — Admin cannot create/edit transactions

---

## 14. Future Improvements

- [ ] Add backend endpoints for barbers
- [ ] Real-time updates via WebSocket
- [ ] Image upload for products and barbers
- [ ] Dark mode toggle
- [ ] Push notifications
- [ ] Mobile responsive improvements
- [ ] Export to PDF
- [ ] Multi-language support

---

*Report generated on: September 9, 2026*
*Last deployment: Production (Vercel)*
