# Sibarkumen

Aplikasi manajemen inventaris dan dokumen administrasi barang (BAST, SPB, SPPB) berbasis web yang dibangun menggunakan Next.js.

## Teknologi Utama

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **UI Component**: shadcn/ui + Tailwind CSS 4
- **Authentication**: NextAuth.js v5 (Credentials)
- **Form Handling**: React Hook Form + Zod

## Persyaratan Sistem

Sebelum memulai, pastikan Anda telah menginstal:

- [Node.js](https://nodejs.org/) (Versi 18 atau lebih baru)
- [PostgreSQL](https://www.postgresql.org/) (Atau akses ke database Postgres cloud seperti Supabase/Neon)

## Panduan Instalasi

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di komputer lokal Anda:

### 1. Clone Repository

```bash
git clone <url-repository-anda>
cd sibarkumen3
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Buat file `.env` di root direktori proyek. Anda bisa menyalin format di bawah ini:

```env
# Koneksi Database (Ganti dengan kredensial database Anda)
DATABASE_URL="postgresql://user:password@localhost:5432/sibarkumen?schema=public"

# Jika menggunakan Supabase dengan pooling (Opsional)
# DIRECT_URL="postgresql://..."

# NextAuth Configuration
# Generate secret baru bisa menggunakan: openssl rand -base64 32
NEXTAUTH_SECRET="rahasia_dapur_kuncinya_disini_ganti_ya"
NEXTAUTH_URL="http://localhost:3000"

# App Environment
NODE_ENV="development"
```

### 4. Setup Database

Jalankan migrasi Prisma untuk membuat struktur tabel di database Anda:

```bash
npx prisma migrate dev --name init
```

Isi database dengan data awal (Seeding):
_Catatan: Cek file `prisma/seed.js` untuk melihat data pengguna default._

```bash
npx prisma db seed
```

### 5. Jalankan Aplikasi

Mulai server development:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## Informasi Login Default

Jika Anda menjalankan seeding database bawaan, akun administrator default adalah:

- **Username**: `admin`
- **Password**: `admin123`

_(Password di database disimpan dalam bentuk hash menggunakan bcrypt)_

## Fitur Aplikasi

1. **Manajemen Master Data**:

   - Barang (Stok, Harga, Kategori)
   - Pegawai & Pejabat Pengelola
   - Rekening Belanja

2. **Transaksi Barang Masuk (Procurement)**:

   - Pembuatan BAST Masuk (Berita Acara Serah Terima)
   - Penambahan stok otomatis

3. **Transaksi Barang Keluar (Distribution)**:

   - **SPB**: Surat Permintaan Barang (dari Pegawai)
   - **SPPB**: Surat Perintah Penyaluran Barang (Verifikasi Pejabat)
   - **BAST Keluar**: Serah terima barang ke pemohon

4. **Utilitas**:
   - Dashboard Ringkasan
   - Cetak Dokumen Transaksi
