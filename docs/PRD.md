# 📄 **PRD (Product Requirements Document) – Versi Full Admin Only**

## **Nama Sistem**

**SibarKumen — Sistem Inventaris Barang Kelurahan Ujung Menteng**

## **Versi Dokumen**

v3.0 — Tanpa Role User, Full Admin, Selaras dengan Schema Prisma

---

# **1. Elevator Pitch**

SibarKumen adalah sistem inventaris berbasis web yang mengelola seluruh proses administrasi barang habis pakai di kelurahan, mencakup: pencatatan barang masuk melalui BAST Masuk, permintaan barang internal (SPB), penyaluran barang melalui SPPB, hingga serah terima barang keluar melalui BAST Keluar. Sistem ini dioperasikan sepenuhnya oleh Admin sehingga lebih praktis, cepat, dan menghindari kompleksitas multi-user.

---

# 2. **Siapa Pengguna Sistem**

## **Admin (Satu-satunya user)**

Admin adalah satu-satunya pengguna yang memiliki akses terhadap seluruh fitur, antara lain:

- Mengelola barang.
- Mengelola pegawai.
- Mengelola pejabat pengelola barang.
- Membuat BAST Masuk.
- Membuat SPB (atas nama pegawai).
- Memproses SPB menjadi SPPB.
- Membuat BAST Keluar.
- Melihat arsip dokumen.
- Mengelola rekening.

Admin **satu orang saja**, sesuai kebutuhan kelurahan.

---

# 3. **Kebutuhan Fungsional**

## **3.1 User Management (Simplified)**

Karena role USER dihilangkan:

- Sistem hanya memiliki **1 role: ADMIN**.
- Hanya admin yang dapat login.
- Tidak ada proses register dan approval.
- Tidak ada multi-user management kecuali keperluan administrasi teknis (opsional).

---

## **3.2 Manajemen Pegawai (pegawai)**

Admin dapat:

- Menambah, mengedit, dan menonaktifkan pegawai.
- Menggunakan pegawai sebagai entitas:

  - Pemohon SPB,
  - Penerima SPPB,
  - PPTK/PPK BAST Masuk,
  - Penerima BAST Keluar.

> Pegawai **bukan user login**, hanya data referensi.

---

## **3.3 Pejabat Pengelola (pejabat_pengelola)**

Admin dapat:

- Menambah pejabat berdasarkan SK.
- Menentukan jenis jabatan:

  - Penatausahaan,
  - Pengelola Barang,
  - Pihak Menyerahkan untuk BAST Keluar.

- Data dipakai untuk dokumen SPPB dan BAST Keluar.

---

## **3.4 Barang (barang)**

Admin dapat:

- Menambah dan mengubah data barang.
- Menentukan kategori fleksibel.
- Mengatur:

  - kode_barang
  - nama_barang
  - kategori
  - satuan
  - spesifikasi
  - asal_pembelian
  - stok_minimum
  - harga_satuan
  - total_harga

Stok:

- **Bertambah otomatis** ketika BAST Masuk dibuat.
- **Berkurang otomatis** ketika SPPB dibuat.

---

## **3.5 Rekening (rekening)**

Admin dapat mengelola rekening:

- nama_bank
- nomor_rekening
- nama_pemilik
- kode_bank
- jenis_rekening

Dipakai untuk BAST Masuk.

---

## **3.6 BAST Masuk (bast_masuk)**

Digunakan untuk mencatat barang masuk.

### Data:

- nomor_referensi
- nomor_bast
- tanggal_bast
- nomor_bapb
- tanggal_bapb
- asal_pembelian
- id_rekening
- pptk_ppk (pegawai)
- pihak_ketiga
- peruntukkan

### Detail (bast_masuk_detail):

- id_barang
- jumlah
- harga_satuan
- total_harga

### Efek sistem:

- Stok barang bertambah otomatis secara transaksi atomic.

### Output:

- PDF BAST Masuk sesuai format kelurahan.

---

## **3.7 SPB (Surat Permintaan Barang)**

SPB dibuat **oleh Admin** atas nama pegawai pemohon.

### Data:

- nomor_spb
- tanggal_spb
- pemohon (pegawai)
- keterangan

### Detail (spb_detail):

- id_barang
- jumlah

---

## **3.8 SPPB (Surat Perintah Penyaluran Barang)**

Dibuat Admin sebagai tindak lanjut SPB.

### Data:

- nomor_sppb
- tanggal_sppb
- id_spb
- id_pejabat_penatausahaan
- id_pengelola_barang
- id_penerima (pegawai)
- keterangan

### Detail (sppb_detail):

- id_barang
- jumlah_disalurkan

### Efek sistem:

- Stok otomatis berkurang.
- Validasi stok sebelum proses.

---

## **3.9 BAST Keluar (bast_keluar)**

Dokumen serah terima barang keluar.

### Data:

- nomor_bast
- tanggal_bast
- id_sppb
- id_pihak_menyerahkan (pejabat)
- id_pihak_menerima (pegawai)
- keterangan

### Detail:

- id_barang
- volume
- jumlah_harga
- ppn
- harga_setelah_ppn

### Output:

- PDF BAST Keluar format baku.

---

## **3.10 Arsip Dokumen**

Admin dapat melihat arsip:

- BAST Masuk
- SPB
- SPPB
- BAST Keluar

Filter: tanggal, pegawai, nomor dokumen.

---

# 4. **User Stories (Full Admin)**

- Sebagai Admin, saya ingin mengelola data barang agar inventaris tercatat dengan baik.
- Sebagai Admin, saya ingin menambah BAST Masuk agar stok bertambah otomatis.
- Sebagai Admin, saya ingin membuat SPB atas nama pegawai.
- Sebagai Admin, saya ingin memproses SPB menjadi SPPB agar barang dapat disalurkan.
- Sebagai Admin, saya ingin membuat BAST Keluar sebagai dokumen resmi serah terima.
- Sebagai Admin, saya ingin mengelola pegawai dan pejabat sesuai kebutuhan dokumen.
- Sebagai Admin, saya ingin melihat stok terkini dan arsip dokumen.

---

# 5. **Antarmuka Pengguna (High Level – Full Admin)**

- **Dashboard Admin:**

  - Stok kritis
  - Dokumen terbaru
  - Statistik permintaan & penyaluran

- **Modul Barang**

- **Modul BAST Masuk**

- **Modul SPB**

- **Modul SPPB**

- **Modul BAST Keluar**

- **Modul Pegawai**

- **Modul Pejabat Pengelola**

- **Modul Rekening**

- **Modul Arsip**

- **Profil Admin**
