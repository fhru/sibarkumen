const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Seed Users
  const adminUsername = 'admin';
  let adminUser = await prisma.user.findFirst({ where: { username: adminUsername } });
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    adminUser = await prisma.user.create({
      data: {
        username: adminUsername,
        password: hashedPassword,
        fullName: 'Administrator System',
        isActive: true,
      },
    });
    console.log('Created Admin User');
  }

  const staffUsername = 'staff';
  let staffUser = await prisma.user.findFirst({ where: { username: staffUsername } });
  if (!staffUser) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    staffUser = await prisma.user.create({
      data: {
        username: staffUsername,
        password: hashedPassword,
        fullName: 'Staff Gudang',
        isActive: true,
      },
    });
    console.log('Created Staff User');
  }

  // 2. Seed Referensi Kategori
  const categories = [
    { nama: 'Elektronik', kode: 'ELK' },
    { nama: 'Alat Tulis Kantor', kode: 'ATK' },
    { nama: 'Kendaraan Dinas', kode: 'KDR' },
    { nama: 'Mebel', kode: 'MEB' },
  ];

  for (const cat of categories) {
    await prisma.referensiKategori.upsert({
      where: { kode: cat.kode },
      update: {},
      create: cat,
    });
  }
  console.log('Created Categories');

  // 3. Seed Rekening
  const rekNumber = '1234567890';
  let rekening = await prisma.rekening.findFirst({ where: { nomorRekening: rekNumber } });
  if (!rekening) {
    rekening = await prisma.rekening.create({
      data: {
        namaBank: 'Bank Jawa Barat',
        kodeBank: 'BJB',
        nomorRekening: rekNumber,
        namaPemilik: 'Dinas Pendidikan',
        jenisRekening: 'Giro',
        keterangan: 'Rekening Operasional',
      },
    });
    console.log('Created Rekening');
  }

  // 3. Seed Pegawai (Needs to be created before PejabatPengelola)
  const nipPegawai1 = '198001012005011001';
  let pegawai1 = await prisma.pegawai.findFirst({ where: { nip: nipPegawai1 } });
  if (!pegawai1) {
    pegawai1 = await prisma.pegawai.create({
      data: {
        nama: 'Budi Santoso',
        nip: nipPegawai1,
        jabatan: 'Kepala Bagian Umum',
        unitKerja: 'Sekretariat',
      },
    });
    console.log('Created Pegawai 1');
  }

  const nipPegawai2 = '199002022015022002';
  let pegawai2 = await prisma.pegawai.findFirst({ where: { nip: nipPegawai2 } });
  if (!pegawai2) {
    pegawai2 = await prisma.pegawai.create({
      data: {
        nama: 'Siti Aminah',
        nip: nipPegawai2,
        jabatan: 'Staf Logistik',
        unitKerja: 'Gudang',
      },
    });
    console.log('Created Pegawai 2');
  }
  
  // 4. Seed Pejabat Pengelola
  // Check if pegawai1 is already a pejabat
  let pejabat1 = await prisma.pejabatPengelola.findFirst({ where: { idPegawai: pegawai1.id } });
  if (!pejabat1) {
    pejabat1 = await prisma.pejabatPengelola.create({
      data: {
        idPegawai: pegawai1.id,
        jenisJabatan: 'Pejabat Penatausahaan Barang',
        nomorSk: 'SK-2023-001',
        tanggalSk: new Date('2023-01-02'),
      },
    });
    console.log('Created Pejabat Pengelola 1');
  }

  let pejabat2 = await prisma.pejabatPengelola.findFirst({ where: { idPegawai: pegawai2.id } });
  if (!pejabat2) {
    pejabat2 = await prisma.pejabatPengelola.create({
      data: {
        idPegawai: pegawai2.id,
        jenisJabatan: 'Pengurus Barang',
        nomorSk: 'SK-2023-002',
        tanggalSk: new Date('2023-01-02'),
      },
    });
    console.log('Created Pejabat Pengelola 2');
  }

  // 5. Seed Barang
  const barangData = [
    {
      kodeBarang: 'ELK-001',
      namaBarang: 'Laptop ASUS Vivobook',
      kategori: 'Elektronik',
      satuan: 'Unit',
      spesifikasi: 'RAM 8GB, SSD 512GB, i5',
      asalPembelian: 'APBD 2023',
      stokTersedia: 10,
      hargaSatuan: 8000000,
    },
    {
      kodeBarang: 'ATK-001',
      namaBarang: 'Kertas A4 Sinar Dunia',
      kategori: 'ATK',
      satuan: 'Rim',
      spesifikasi: '70 GSM',
      asalPembelian: 'APBD 2023',
      stokTersedia: 100,
      hargaSatuan: 50000,
    },
  ];

  for (const brg of barangData) {
    const existing = await prisma.barang.findFirst({ where: { kodeBarang: brg.kodeBarang } });
    if (!existing) {
      await prisma.barang.create({
        data: {
          ...brg,
          totalHarga: brg.stokTersedia * brg.hargaSatuan,
        },
      });
      console.log(`Created Barang: ${brg.namaBarang}`);
    }
  }

  // 6. Seed BAST Masuk (Optional Example)
  const noBast = 'BAST-IN-001';
  let bastMasuk = await prisma.bastMasuk.findFirst({ where: { nomorBast: noBast } });
  if (!bastMasuk) {
    const barang1 = await prisma.barang.findFirst({ where: { kodeBarang: 'ELK-001' } });
    
    if (barang1) {
      bastMasuk = await prisma.bastMasuk.create({
        data: {
          nomorReferensi: 'REF-001',
          nomorBast: noBast,
          tanggalBast: new Date(),
          nomorBapb: 'BAPB-001',
          tanggalBapb: new Date(),
          asalPembelian: 'APBD 2023',
          idRekening: rekening.id,
          pptkPpkId: pegawai1.id,
          details: {
            create: [
              {
                idBarang: barang1.id,
                jumlah: 5,
                hargaSatuan: 8000000,
                totalHarga: 40000000,
              }
            ]
          }
        }
      });
      console.log('Created BAST Masuk');
    }
  }

  // 7. Seed SPB (Surat Permintaan Barang)
  const noSpb = 'SPB-001';
  let spb = await prisma.spb.findFirst({ where: { nomorSpb: noSpb } });
  if (!spb) {
    const barang2 = await prisma.barang.findFirst({ where: { kodeBarang: 'ATK-001' } });
    if (barang2) {
      spb = await prisma.spb.create({
        data: {
          nomorSpb: noSpb,
          tanggalSpb: new Date(),
          pemohonId: pegawai2.id,
          details: {
            create: [
              {
                idBarang: barang2.id,
                jumlah: 2,
              }
            ]
          }
        }
      });
      console.log('Created SPB');
    }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
