# 🎨 **User Interface Description Document (UIDD)**

### **SibarKumen – Versi Full Admin Only**

Dokumen ini menggambarkan struktur UI, komponen inti, pola interaksi, serta gaya visual berdasarkan PRD v3.0.

---

# 1. **Layout Structure**

## **1.1 Global Layout (Desktop-first)**

### **Header**

- Logo Kelurahan / SibarKumen
- Judul: _Sistem Inventaris Barang Kelurahan Ujung Menteng_
- Profil Admin (dropdown):

  - Profil Admin
  - Logout

### **Side Navigation (Left Sidebar)**

Menu utama:

1. **Dashboard**
2. **Barang**
3. **BAST Masuk**
4. **SPB**
5. **SPPB**
6. **BAST Keluar**
7. **Pegawai**
8. **Pejabat Pengelola**
9. **Rekening**
10. **Arsip**
11. **Pengaturan (opsional)**

### **Content Area**

- Bagian kanan yang menampilkan halaman sesuai menu.
- Lebar fleksibel, form maksimal 960px agar tidak terlalu lebar.

### **Footer**

- Sistem Informasi Kelurahan Ujung Menteng — © Tahun berjalan

---

# 2. **Core Components**

## **2.1 Dashboard Admin**

Menampilkan:

- **Kartu ringkas:**

  - Stok Barang Kritis
  - Jumlah BAST Masuk bulan ini
  - Jumlah SPB yang belum diproses
  - Total Barang Keluar (SPPB)

- **Grafik sederhana:**

  - Tren penyaluran & penerimaan bulanan

- **Tabel ringkas:**

  - Dokumen terbaru (BAST/ SPB/ SPPB)

---

## **2.2 Barang**

### **Tampilan List**

Kolom:

- Kode Barang
- Nama Barang
- Kategori
- Stok Tersedia
- Stok Minimum
- Aksi (Lihat / Edit / Nonaktifkan)

### **Form Tambah/Edit Barang**

Field:

- kode_barang
- nama_barang
- kategori
- satuan
- spesifikasi
- asal_pembelian
- stok_minimum
- harga_satuan
- total_harga
  (Penghitungan total bisa otomatis: harga × stok)

---

## **2.3 BAST Masuk**

### **List BAST Masuk**

- Nomor BAST
- Tanggal
- PPTK/PPK
- Rekening
- Total Barang
- Aksi (Lihat / PDF / Edit)

### **Form BAST Masuk**

Bagian 1 — Informasi Dokumen:

- nomor_referensi
- nomor_bast
- tanggal_bast
- nomor_bapb
- tanggal_bapb
- asal_pembelian
- id_rekening (dropdown)
- pptk_ppk (dropdown pegawai)
- pihak_ketiga
- peruntukkan

Bagian 2 — Detail Barang:

- Tabel dynamic row:

  - barang (dropdown)
  - jumlah
  - harga_satuan
  - total_harga (auto)

---

## **2.4 SPB**

### **List SPB**

Kolom:

- Nomor SPB
- Pemohon
- Tanggal
- Status (Menunggu / Diproses)
- Aksi (Lihat / Proses / PDF)

### **Form SPB**

Field:

- nomor_spb (auto)
- tanggal_spb
- pemohon (dropdown pegawai)
- keterangan

Detail Barang:

- id_barang
- jumlah

Tombol:

- Simpan
- Simpan & Proses ke SPPB (shortcut opsional)

---

## **2.5 SPPB**

### **List SPPB**

Kolom:

- Nomor SPPB
- Tanggal
- SPB Terkait
- Penerima
- Status (Selesai)
- Aksi (Lihat / PDF)

### **Form SPPB**

Field:

- nomor_sppb (auto)
- tanggal_sppb
- id_spb (locked)
- id_pejabat_penatausahaan
- id_pengelola_barang
- id_penerima
- keterangan

Detail:

- id_barang
- jumlah_disalurkan (validasi stok otomatis)

---

## **2.6 BAST Keluar**

### **List**

- Nomor BAST
- Tanggal
- SPPB Terkait
- Pihak Menyerahkan
- Pihak Menerima
- Aksi

### **Form**

Field:

- nomor_bast
- tanggal_bast
- id_sppb
- id_pihak_menyerahkan (pejabat)
- id_pihak_menerima (pegawai)
- keterangan

Detail:

- id_barang
- volume
- jumlah_harga
- ppn
- harga_setelah_ppn

---

## **2.7 Pegawai**

List:

- Nama
- NIP
- Jabatan
- Unit Kerja
- Status aktif

Form:

- nama
- nip
- jabatan
- unit_kerja
- keterangan

---

## **2.8 Pejabat Pengelola**

List:

- Nama Pegawai
- Jenis Jabatan
- Nomor SK
- Tanggal SK

Form:

- id_pegawai
- jenis_jabatan (dropdown: Penatausahaan / Pengelola Barang / Pihak Menyerahkan)
- nomor_sk
- tanggal_sk
- keterangan

---

## **2.9 Rekening**

List:

- Nama Bank
- Nomor Rekening
- Pemilik
- Jenis Rekening

Form:

- nama_bank
- kode_bank
- nomor_rekening
- nama_pemilik
- jenis_rekening
- keterangan

---

## **2.10 Arsip**

Filter:

- Jenis Dokumen
- Tanggal
- Pegawai Terkait
- Nomor Dokumen

List gabungan dokumen dengan tipe:

- SPB
- SPPB
- BAST Masuk
- BAST Keluar

---

# 3. **Interaction Patterns**

## **3.1 Navigasi**

- Sidebar → halaman berganti tanpa reload (SPA behavior).
- Breadcrumb ditampilkan pada setiap halaman form.

## **3.2 Pengelolaan Dokumen**

- Semua dokumen dapat:

  - Dilihat detail
  - Diunduh PDF
  - Dicetak

- PDF dihasilkan oleh backend secara otomatis.

## **3.3 Validasi Stok**

- Pada SPPB:

  - Jika stok kurang → muncul notifikasi error:
    **"Stok tidak mencukupi untuk barang: [nama_barang]"**
  - Tombol submit dinonaktifkan.

## **3.4 Tabel Dinamis**

- Digunakan pada input detail barang (BAST Masuk / SPB / SPPB / BAST Keluar)
- Row bisa:

  - Ditambah
  - Dihapus
  - Diedit in-place

## **3.5 Notifikasi**

- Success (hijau)
- Warning (kuning)
- Error (merah)
- Info (biru)

---

## **4 Komponen Visual**

- Sidebar hijau gelap
- Ikon flat minimalis
- Tabel dengan border halus
- Form putih bersih (Clean Office UI)

---

# 5. **Mobile, Web App, Desktop Considerations**

- Fokus utama: **Desktop**
- Mobile disesuaikan untuk minimal view:

  - Tabel scroll horizontal
  - Sidebar collapse otomatis
  - Form 1 kolom

---

# 7. **Accessibility**

- Kontras teks minimal WCAG AA
- Tombol berwarna disertai ikon dan label
- Form memiliki label yang jelas
- Notifikasi disertai warna dan ikon status
- Komponen tabel dapat di-navigate keyboard
