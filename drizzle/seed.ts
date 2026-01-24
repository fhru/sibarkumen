import "dotenv/config";
import { db } from "@/lib/db";
import {
  kategori,
  satuan,
  jabatan,
  asalPembelian,
  pihakKetiga,
  kodeRekening,
  barang,
  pegawai,
  pegawaiJabatan,
} from "@/drizzle/schema";

async function main() {
  console.log("🌱 Seeding master data...");

  // 1. Kategori
  console.log("Inserting Kategori...");
  await db
    .insert(kategori)
    .values([
      { nama: "ATK", prefix: "ATK" },
      { nama: "Kebersihan", prefix: "KBR" },
      { nama: "Makanan & Minuman", prefix: "FNB" },
      { nama: "Komputer", prefix: "KMP" },
      { nama: "Cetakan Dinas", prefix: "CTK" },
      { nama: "Kesehatan", prefix: "MED" },
      { nama: "Perlengkapan Umum", prefix: "UTL" },
    ])
    .onConflictDoNothing();

  // 2. Satuan
  console.log("Inserting Satuan...");
  await db
    .insert(satuan)
    .values([
      { nama: "PCS" },
      { nama: "BOX" },
      { nama: "RIM" },
      { nama: "PACK" },
      { nama: "SET" },
      { nama: "LUSIN" },
      { nama: "UNIT" },
      { nama: "BUAH" },
    ])
    .onConflictDoNothing();

  // 3. Jabatan
  console.log("Inserting Jabatan...");
  await db
    .insert(jabatan)
    .values([
      {
        nama: "Pengurus Barang/Pengurus Barang Pembantu",
      },
      {
        nama: "Pejabat Penatausahaan Barang",
        unitKerja: "SKPD/UKPD/UPB KELURAHAN UJUNG MENTENG - JAKTIM",
      },
      { nama: "PPK/PPTK" },
    ])
    .onConflictDoNothing();

  // 4. Asal Pembelian
  console.log("Inserting Asal Pembelian...");
  await db
    .insert(asalPembelian)
    .values([{ nama: "APBD" }, { nama: "Hibah" }, { nama: "BOS" }])
    .onConflictDoNothing();

  // 5. Pihak Ketiga
  console.log("Inserting Pihak Ketiga...");
  await db
    .insert(pihakKetiga)
    .values([
      { nama: "PT. Berkah Jaya" },
      { nama: "CV. Maju Bersama" },
      { nama: "Toko Abadi" },
      { nama: "UD. Sumber Rejeki" },
      { nama: "PT. Sinar Mas" },
    ])
    .onConflictDoNothing();

  // 6. kode Rekening
  console.log("Inserting Kode Rekening...");
  await db
    .insert(kodeRekening)
    .values([
      {
        kode: "5.1.02.01",
        uraian: "Belanja Alat Tulis Kantor",
      },
      {
        kode: "5.1.02.02",
        uraian: "Belanja Bahan Habis Pakai",
      },
      {
        kode: "5.1.03.01",
        uraian: "Belanja Peralatan dan Mesin",
      },
    ])
    .onConflictDoNothing();

  // 7. Pegawai
  console.log("Inserting Pegawai...");
  // Note: Using hardcoded logic for brevity, ideally would check for existing
  await db
    .insert(pegawai)
    .values([
      { nama: "Wisnu Kurniawan", nip: "198001012010011001" },
      { nama: "Endang Suryaningsih", nip: "198001012010011002" },
      { nama: "Rudi Nugraha", nip: "198805052012041005" },
      { nama: "Faris Perancis", nip: "198805052012041006" },
    ])
    .onConflictDoNothing();

  console.log("Inserting Pegawai Jabatan...");
  await db
    .insert(pegawaiJabatan)
    .values([
      { pegawaiId: 1, jabatanId: 3 },
      { pegawaiId: 2, jabatanId: 2 },
      { pegawaiId: 3, jabatanId: 1 },
      { pegawaiId: 4, jabatanId: 3 },
    ])
    .onConflictDoNothing();

  // 8. Barang
  console.log("Inserting Barang...");
  await db
    .insert(barang)
    .values([
      {
        nama: "Kertas HVS A4 70gr",
        kodeBarang: "ATK.0001",
        stok: 0,
        kategoriId: 1,
        satuanId: 3,
        spesifikasi: "Kertas HVS Putih PaperOne",
      },
      // Kategori: ATK (ID: 1), Satuan: PCS (ID: 1)
      {
        nama: "Pulpen Standard AE7",
        kodeBarang: "ATK.0002",
        stok: 0,
        kategoriId: 1,
        satuanId: 1,
        spesifikasi: "Pulpen hitam mata pena 0.5",
      },
      // Kategori: Kebersihan (ID: 2), Satuan: BUAH (ID: 8)
      {
        nama: "Sapu Lantai Ijuk",
        kodeBarang: "KBR.0001",
        stok: 0,
        kategoriId: 2,
        satuanId: 8,
        spesifikasi: "Sapu lantai gagang kayu/plastik",
      },
      // Kategori: Komputer (ID: 4), Satuan: PCS (ID: 1)
      {
        nama: "Tinta Printer Epson 003 (Hitam)",
        kodeBarang: "KMP.0001",
        stok: 0,
        kategoriId: 4,
        satuanId: 1,
        spesifikasi: "Tinta botol original Epson L-Series",
      },
      // Kategori: Makanan & Minuman (ID: 3), Satuan: BOX (ID: 2)
      {
        nama: "Air Mineral Gelas 240ml",
        kodeBarang: "FNB.0001",
        stok: 0,
        kategoriId: 3,
        satuanId: 2,
        spesifikasi: "Air mineral dus isi 48 gelas",
      },
      // Kategori: Cetakan Dinas (ID: 5), Satuan: PACK (ID: 4)
      {
        nama: "Amplop Kop Surat Kelurahan",
        kodeBarang: "CTK.0001",
        stok: 0,
        kategoriId: 5,
        satuanId: 4,
        spesifikasi: "Amplop putih dengan cetakan logotype",
      },
      // Kategori: Kesehatan (ID: 6), Satuan: BOX (ID: 2)
      {
        nama: "Masker Medis 3-Ply",
        kodeBarang: "MED.0001",
        stok: 0,
        kategoriId: 6,
        satuanId: 2,
        spesifikasi: "Masker bedah isi 50 pcs",
      },
      // Kategori: Perlengkapan Umum (ID: 7), Satuan: PCS (ID: 1)
      {
        nama: "Lakban Bening 2 Inch",
        kodeBarang: "UTL.0001",
        stok: 0,
        kategoriId: 7,
        satuanId: 1,
        spesifikasi: "Daimaru 48mm x 90yard",
      },
      // Kategori: Kebersihan (ID: 2), Satuan: PACK (ID: 4)
      {
        nama: "Tissu Wajah 250s",
        kodeBarang: "KBR.0002",
        stok: 0,
        kategoriId: 2,
        satuanId: 4,
        spesifikasi: "Tissu wajah soft pack multi",
      },
      // Kategori: Komputer (ID: 4), Satuan: PCS (ID: 1)
      {
        nama: "Mouse Wireless Standard",
        kodeBarang: "KMP.0002",
        stok: 0,
        kategoriId: 4,
        satuanId: 1,
        spesifikasi: "Mouse optik tanpa kabel",
      },
      // Additional items to reach 30 total
      {
        nama: "Stapler Mini",
        kodeBarang: "ATK.0003",
        stok: 0,
        kategoriId: 1,
        satuanId: 1,
        spesifikasi: "Stapler mini dengan isi staples",
      },
      {
        nama: "Penghapus Papan Tulis",
        kodeBarang: "ATK.0004",
        stok: 0,
        kategoriId: 1,
        satuanId: 8,
        spesifikasi: "Penghapus papan tulis putih",
      },
      {
        nama: "Klip Kertas 28mm",
        kodeBarang: "ATK.0005",
        stok: 0,
        kategoriId: 1,
        satuanId: 1,
        spesifikasi: "Klip kertas isi 100 pcs",
      },
      {
        nama: "Map Plastik A4",
        kodeBarang: "ATK.0006",
        stok: 0,
        kategoriId: 1,
        satuanId: 8,
        spesifikasi: "Map plastik transparan A4",
      },
      {
        nama: "Toner Printer Laser",
        kodeBarang: "KMP.0003",
        stok: 0,
        kategoriId: 4,
        satuanId: 1,
        spesifikasi: "Toner black kompatibel",
      },
      {
        nama: "Keyboard USB Standard",
        kodeBarang: "KMP.0004",
        stok: 0,
        kategoriId: 4,
        satuanId: 1,
        spesifikasi: "Keyboard USB full size",
      },
      {
        nama: "Flashdisk 32GB",
        kodeBarang: "KMP.0005",
        stok: 0,
        kategoriId: 4,
        satuanId: 1,
        spesifikasi: "Flashdisk USB 3.0 32GB",
      },
      {
        nama: "Kabel HDMI 2M",
        kodeBarang: "KMP.0006",
        stok: 0,
        kategoriId: 4,
        satuanId: 1,
        spesifikasi: "Kabel HDMI 2 meter",
      },
      {
        nama: "Pembersih Lantai 1L",
        kodeBarang: "KBR.0003",
        stok: 0,
        kategoriId: 2,
        satuanId: 8,
        spesifikasi: "Cairan pembersih lantai 1 liter",
      },
      {
        nama: "Sabun Cuci Piring 800ml",
        kodeBarang: "KBR.0004",
        stok: 0,
        kategoriId: 2,
        satuanId: 8,
        spesifikasi: "Sabun cuci piring 800ml",
      },
      {
        nama: "Kantong Sampah Besar",
        kodeBarang: "KBR.0005",
        stok: 0,
        kategoriId: 2,
        satuanId: 4,
        spesifikasi: "Kantong sampah hitam ukuran besar",
      },
      {
        nama: "Disinfektan Spray 500ml",
        kodeBarang: "KBR.0006",
        stok: 0,
        kategoriId: 2,
        satuanId: 8,
        spesifikasi: "Spray disinfektan 500ml",
      },
      {
        nama: "Kopi Bubuk 250gr",
        kodeBarang: "FNB.0002",
        stok: 0,
        kategoriId: 3,
        satuanId: 8,
        spesifikasi: "Kopi bubuk kemasan 250gr",
      },
      {
        nama: "Teh Celup 100 pcs",
        kodeBarang: "FNB.0003",
        stok: 0,
        kategoriId: 3,
        satuanId: 1,
        spesifikasi: "Teh celup isi 100 pcs",
      },
      {
        nama: "Gula Pasir 1kg",
        kodeBarang: "FNB.0004",
        stok: 0,
        kategoriId: 3,
        satuanId: 8,
        spesifikasi: "Gula pasir kemasan 1kg",
      },
      {
        nama: "Gelas Plastik 12oz",
        kodeBarang: "FNB.0005",
        stok: 0,
        kategoriId: 3,
        satuanId: 4,
        spesifikasi: "Gelas plastik 12oz isi 50 pcs",
      },
      {
        nama: "Buku Agenda A5",
        kodeBarang: "CTK.0002",
        stok: 0,
        kategoriId: 5,
        satuanId: 1,
        spesifikasi: "Buku agenda A5 200 halaman",
      },
      {
        nama: "Kertas Letterhead",
        kodeBarang: "CTK.0003",
        stok: 0,
        kategoriId: 5,
        satuanId: 3,
        spesifikasi: "Kertas kop surat 80gr",
      },
      {
        nama: "Formulir Arsip",
        kodeBarang: "CTK.0004",
        stok: 0,
        kategoriId: 5,
        satuanId: 4,
        spesifikasi: "Formulir arsip isi 50 lembar",
      },
      {
        nama: "Sprei Kertas",
        kodeBarang: "MED.0002",
        stok: 0,
        kategoriId: 6,
        satuanId: 4,
        spesifikasi: "Sprei kertas sekali pakai",
      },
      {
        nama: "Sarung Tangan Medis",
        kodeBarang: "MED.0003",
        stok: 0,
        kategoriId: 6,
        satuanId: 2,
        spesifikasi: "Sarung tangan lateks isi 50 pcs",
      },
      {
        nama: "Hand Sanitizer 500ml",
        kodeBarang: "MED.0004",
        stok: 0,
        kategoriId: 6,
        satuanId: 8,
        spesifikasi: "Hand sanitizer 500ml",
      },
      {
        nama: "Tisu Basah Antiseptik",
        kodeBarang: "MED.0005",
        stok: 0,
        kategoriId: 6,
        satuanId: 4,
        spesifikasi: "Tisu basah antiseptik isi 50 lembar",
      },
      {
        nama: "Baterai AA",
        kodeBarang: "UTL.0002",
        stok: 0,
        kategoriId: 7,
        satuanId: 4,
        spesifikasi: "Baterai AA isi 4 pcs",
      },
      {
        nama: "Lampu LED 10W",
        kodeBarang: "UTL.0003",
        stok: 0,
        kategoriId: 7,
        satuanId: 1,
        spesifikasi: "Lampu LED 10W",
      },
      {
        nama: "Kabel Roll 10M",
        kodeBarang: "UTL.0004",
        stok: 0,
        kategoriId: 7,
        satuanId: 1,
        spesifikasi: "Kabel roll 10 meter",
      },
      {
        nama: "Payung Lipat",
        kodeBarang: "UTL.0005",
        stok: 0,
        kategoriId: 7,
        satuanId: 8,
        spesifikasi: "Payung lipat anti UV",
      },
      {
        nama: "Pengharum Ruangan",
        kodeBarang: "KBR.0007",
        stok: 0,
        kategoriId: 2,
        satuanId: 8,
        spesifikasi: "Pengharum ruangan aerosol",
      },
      {
        nama: "Air Mineral Botol 600ml",
        kodeBarang: "FNB.0006",
        stok: 0,
        kategoriId: 3,
        satuanId: 2,
        spesifikasi: "Air mineral botol isi 24 pcs",
      },
      {
        nama: "Kertas HVS A4 80gr",
        kodeBarang: "ATK.0007",
        stok: 0,
        kategoriId: 1,
        satuanId: 3,
        spesifikasi: "Kertas HVS A4 80gr",
      },
    ])
    .onConflictDoNothing();

  console.log("✅ Seeding completed!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed!");
  console.error(err);
  process.exit(1);
});
