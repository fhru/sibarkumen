import 'dotenv/config';
import { db } from '@/lib/db';
import {
  kategori,
  satuan,
  jabatan,
  asalPembelian,
  pihakKetiga,
  rekening,
} from '@/drizzle/schema';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('🌱 Seeding master data...');

  // 1. Kategori
  console.log('Insering Kategori...');
  await db
    .insert(kategori)
    .values([
      { nama: 'Elektronik' },
      { nama: 'Furniture' },
      { nama: 'ATK' },
      { nama: 'Kebersihan' },
    ])
    .onConflictDoNothing();

  // 2. Satuan
  console.log('Inserting Satuan...');
  await db
    .insert(satuan)
    .values([
      { nama: 'PCS' },
      { nama: 'BOX' },
      { nama: 'RIM' },
      { nama: 'PAC' },
      { nama: 'SET' },
      { nama: 'LUSIN' },
      { nama: 'UNIT' },
      { nama: 'BUAH' },
    ])
    .onConflictDoNothing();

  // 3. Jabatan
  console.log('Inserting Jabatan...');
  await db
    .insert(jabatan)
    .values([
      { nama: 'Staff Gudang' },
      { nama: 'Kepala Bagian' },
      { nama: 'Admin' },
      { nama: 'PPK' },
      { nama: 'PPTK' },
    ])
    .onConflictDoNothing();

  // 4. Asal Pembelian
  console.log('Inserting Asal Pembelian...');
  await db
    .insert(asalPembelian)
    .values([{ nama: 'APBD' }, { nama: 'Hibah' }, { nama: 'BOS' }])
    .onConflictDoNothing();

  // 5. Pihak Ketiga
  console.log('Inserting Pihak Ketiga...');
  await db
    .insert(pihakKetiga)
    .values([
      { nama: 'PT. Berkah Jaya' },
      { nama: 'CV. Maju Bersama' },
      { nama: 'Toko Abadi' },
    ])
    .onConflictDoNothing();

  // 6. Rekening
  console.log('Inserting Rekening...');
  await db
    .insert(rekening)
    .values([
      {
        namaBank: 'Bank Jatim',
        nomorRekening: '0012345678',
        namaPemilik: 'Bendahara Barang',
        keterangan: 'Rekening Utama',
      },
    ])
    .onConflictDoNothing();

  console.log('✅ Seeding completed!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seeding failed!');
  console.error(err);
  process.exit(1);
});
