# Sibarkumen

Sibarkumen adalah Sistem Inventaris Barang Kelurahan Ujung Menteng. Aplikasi ini mengelola dokumen SPB, SPPB, dan BAST dengan alur terintegrasi, termasuk AI Assistant untuk bantuan ringkas berbasis data.

## Fitur Utama
- Manajemen SPB, SPPB, dan BAST (create, edit, print, arsip)
- Dashboard statistik dan pencarian data
- AI Assistant (streaming) via OpenRouter

## Teknologi
- Next.js (App Router) + React + TypeScript
- Drizzle ORM + PostgreSQL
- Tailwind CSS + shadcn/ui
- Better Auth
- Supabase (PostgreSQL)
- OpenRouter (AI chat)

## Prasyarat
- Node.js 18+ (disarankan 20+)
- npm
- PostgreSQL (gunakan Supabase)

## Quick Start
1) Clone repo:
```bash
git clone <URL_REPO_KAMU>
cd new-sibarkumen
```

2) Install dependencies:
```bash
npm install
```

3) Buat file `.env`:
```bash
cp .env.example .env
```
Jika belum ada `.env.example`, buat `.env` manual berdasarkan bagian **Environment Variables** di bawah.

4) Setup database (Supabase) dan jalankan migrasi:
```bash
npm run db:generate
npm run db:migrate
```
Alternatif (langsung push schema):
```bash
npm run db:push
```

5) Jalankan aplikasi:
```bash
npm run dev
```
Aplikasi berjalan di `http://localhost:3000`.

## Environment Variables
**Wajib**
- `DATABASE_URL`  
  Connection string PostgreSQL dari Supabase.
- `OPENROUTER_API_KEY` atau `OPENROUTER_API_KEYS`  
  Gunakan satu key (`OPENROUTER_API_KEY`) atau beberapa key dipisah koma (`OPENROUTER_API_KEYS`).
- `BETTER_AUTH_SECRET`  
  Secret untuk Better Auth.

**Disarankan**
- `NEXT_PUBLIC_SITE_URL`  
  Contoh: `http://localhost:3000` (dev) / domain production.
- `OPENROUTER_REFERRER`  
  Untuk header `HTTP-Referer` ke OpenRouter (default: `NEXT_PUBLIC_SITE_URL`).
- `OPENROUTER_TITLE`  
  Judul aplikasi untuk OpenRouter (default: `Sibarkumen`).
- `RESEND_API_KEY`  
  Untuk email reset password.
- `EMAIL_FROM`  
  Default pengirim email (contoh: `no-reply@domain.com`).

Contoh `.env`:
```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/postgres
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-super-secret

OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_REFERRER=http://localhost:3000
OPENROUTER_TITLE=Sibarkumen

RESEND_API_KEY=your-resend-key
EMAIL_FROM=no-reply@yourdomain.com
```

## Setup Supabase (PostgreSQL)
1) Buat project Supabase.
2) Ambil connection string **PostgreSQL** (Settings → Database → Connection string).
3) Isi `DATABASE_URL` pada `.env`.

Catatan:
- Gunakan string yang kompatibel dengan `pg`/`postgres`.
- Jika memakai connection pooler, pastikan formatnya sesuai.

## Setup Better Auth
Better Auth sudah terpasang di `lib/auth.ts`.
Hal yang perlu diperhatikan:
- Set `BETTER_AUTH_SECRET` di `.env`.
- Sesuaikan `trustedOrigins` di `lib/auth.ts` untuk production domain.

## Setup OpenRouter (AI Assistant)
AI Assistant berada di endpoint:
```
POST /api/chat
```
Konfigurasi env:
- `OPENROUTER_API_KEY` atau `OPENROUTER_API_KEYS`
- `OPENROUTER_REFERRER` (opsional)
- `OPENROUTER_TITLE` (opsional)

Model default saat ini:
```
openai/gpt-oss-120b:free
```
Anda bisa mengubah model di `app/api/chat/route.ts`.

## Perintah Penting
```bash
npm run dev       # menjalankan dev server
npm run build     # build production
npm run start     # jalankan build hasil production
npm run lint      # lint

npm run db:generate  # generate migration dari schema
npm run db:migrate   # jalankan migration
npm run db:push      # push schema tanpa migration
npm run db:studio    # drizzle studio
npm run db:seed      # seed data
```

## Deployment (ringkas)
1) Set semua environment variables di platform hosting (Vercel/Render/VM).
2) Pastikan `DATABASE_URL`, `BETTER_AUTH_SECRET`, dan `OPENROUTER_API_KEY` terisi.
3) Jalankan build & start.

## Lisensi
Internal use.
