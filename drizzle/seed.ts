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
