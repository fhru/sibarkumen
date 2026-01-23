# Sibarkumen

Sibarkumen adalah Sistem Inventaris Barang Kelurahan Ujung Menteng, dibuat oleh mahasiswa Gunadarma. Aplikasi ini mengelola dokumen SPB, SPPB, dan BAST dengan alur yang terintegrasi, termasuk fitur AI Assistant untuk bantuan ringkas berbasis data.

## Fitur Utama
- Manajemen SPB (Surat Permintaan Barang)
- Manajemen SPPB (Surat Perintah Penyaluran Barang)
- Manajemen BAST (Berita Acara Serah Terima)
- Print dokumen dengan format resmi
- AI Assistant (streaming) berbasis OpenRouter
- Dashboard statistik dan pencarian data

## Teknologi
- Next.js (App Router)
- React + TypeScript
- Drizzle ORM + PostgreSQL
- Tailwind CSS + shadcn/ui
- OpenRouter (AI chat)

## Konfigurasi Environment
Buat file `.env` lokal.

Wajib:
- `DATABASE_URL`
- `OPENROUTER_API_KEY` atau `OPENROUTER_API_KEYS` (comma-separated)

Disarankan:
- `NEXT_PUBLIC_SITE_URL`
- `BETTER_AUTH_SECRET`
- `RESEND_API_KEY`

## Menjalankan Aplikasi
Install dependencies:
```bash
npm install
```

Jalankan dev server:
```bash
npm run dev
```

Build:
```bash
npm run build
```

## Database
Gunakan Drizzle:
```bash
npm run db:generate
npm run db:migrate
```

## AI Assistant
Endpoint streaming tersedia di:
- `POST /api/chat`

Model default:
- `tngtech/deepseek-r1t2-chimera:free`

## Lisensi
Internal use.
