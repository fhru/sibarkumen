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
    { nama: 'Perlengkapan Kebersihan', kode: 'PKB' },
    { nama: 'Peralatan Komputer', kode: 'PKM' },
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
    console.log('Created Rekening 1');
  }

  const rekNumber2 = '0987654321';
  let rekening2 = await prisma.rekening.findFirst({ where: { nomorRekening: rekNumber2 } });
  if (!rekening2) {
    rekening2 = await prisma.rekening.create({
      data: {
        namaBank: 'Bank Mandiri',
        kodeBank: 'MDR',
        nomorRekening: rekNumber2,
        namaPemilik: 'Dinas Pendidikan',
        jenisRekening: 'Tabungan',
        keterangan: 'Rekening Cadangan',
      },
    });
    console.log('Created Rekening 2');
  }

  // 4. Seed Pegawai
  const pegawaiData = [
    {
      nip: '198001012005011001',
      nama: 'Budi Santoso',
      jabatan: 'Kepala Bagian Umum',
      unitKerja: 'Sekretariat',
    },
    {
      nip: '199002022015022002',
      nama: 'Siti Aminah',
      jabatan: 'Staf Logistik',
      unitKerja: 'Gudang',
    },
    {
      nip: '198503152010011003',
      nama: 'Ahmad Hidayat',
      jabatan: 'Pengelola Barang',
      unitKerja: 'Gudang',
    },
    {
      nip: '197806201998031004',
      nama: 'Dewi Lestari',
      jabatan: 'Kepala Gudang',
      unitKerja: 'Gudang',
    },
  ];

  const pegawaiList = [];
  for (const peg of pegawaiData) {
    let pegawai = await prisma.pegawai.findFirst({ where: { nip: peg.nip } });
    if (!pegawai) {
      pegawai = await prisma.pegawai.create({ data: peg });
      console.log(`Created Pegawai: ${peg.nama}`);
    }
    pegawaiList.push(pegawai);
  }

  const [pegawai1, pegawai2, pegawai3, pegawai4] = pegawaiList;

  // 5. Seed Pejabat Pengelola
  const pejabatData = [
    {
      idPegawai: pegawai1.id,
      jenisJabatan: 'Pejabat Penatausahaan Barang',
      nomorSk: 'SK-2023-001',
      tanggalSk: new Date('2023-01-02'),
    },
    {
      idPegawai: pegawai3.id,
      jenisJabatan: 'Pengurus Barang',
      nomorSk: 'SK-2023-002',
      tanggalSk: new Date('2023-01-02'),
    },
    {
      idPegawai: pegawai4.id,
      jenisJabatan: 'Pengelola Barang',
      nomorSk: 'SK-2023-003',
      tanggalSk: new Date('2023-01-15'),
    },
  ];

  const pejabatList = [];
  for (const pej of pejabatData) {
    let pejabat = await prisma.pejabatPengelola.findFirst({ where: { idPegawai: pej.idPegawai } });
    if (!pejabat) {
      pejabat = await prisma.pejabatPengelola.create({ data: pej });
      console.log(`Created Pejabat: ${pej.jenisJabatan}`);
    }
    pejabatList.push(pejabat);
  }

  const [pejabat1, pejabat2, pejabat3] = pejabatList;

  // 6. Seed Barang
  const barangData = [
    {
      kodeBarang: 'ELK-001',
      namaBarang: 'Laptop ASUS Vivobook',
      kategori: 'Elektronik',
      satuan: 'Unit',
      spesifikasi: 'RAM 8GB, SSD 512GB, i5',
      asalPembelian: 'APBD 2023',
      stokTersedia: 10,
      stokMinimum: 5,
      hargaSatuan: 8000000,
    },
    {
      kodeBarang: 'ATK-001',
      namaBarang: 'Kertas A4 Sinar Dunia',
      kategori: 'Alat Tulis Kantor',
      satuan: 'Rim',
      spesifikasi: '70 GSM',
      asalPembelian: 'APBD 2023',
      stokTersedia: 100,
      stokMinimum: 20,
      hargaSatuan: 50000,
    },
    {
      kodeBarang: 'MEB-001',
      namaBarang: 'Meja Kerja Kayu Jati',
      kategori: 'Mebel',
      satuan: 'Unit',
      spesifikasi: '120x60x75 cm',
      asalPembelian: 'APBD 2023',
      stokTersedia: 15,
      stokMinimum: 3,
      hargaSatuan: 2500000,
    },
    {
      kodeBarang: 'PKM-001',
      namaBarang: 'Printer HP LaserJet Pro',
      kategori: 'Peralatan Komputer',
      satuan: 'Unit',
      spesifikasi: 'M404dn, Mono, Duplex',
      asalPembelian: 'APBD 2024',
      stokTersedia: 8,
      stokMinimum: 2,
      hargaSatuan: 4500000,
    },
    {
      kodeBarang: 'PKB-001',
      namaBarang: 'Sapu Ijuk',
      kategori: 'Perlengkapan Kebersihan',
      satuan: 'Buah',
      spesifikasi: 'Gagang kayu',
      asalPembelian: 'APBD 2024',
      stokTersedia: 50,
      stokMinimum: 10,
      hargaSatuan: 25000,
    },
  ];

  const barangList = [];
  for (const brg of barangData) {
    let existing = await prisma.barang.findFirst({ where: { kodeBarang: brg.kodeBarang } });
    if (!existing) {
      existing = await prisma.barang.create({
        data: {
          ...brg,
          totalHarga: brg.stokTersedia * brg.hargaSatuan,
        },
      });
      console.log(`Created Barang: ${brg.namaBarang}`);
    }
    barangList.push(existing);
  }

  const [barang1, barang2, barang3, barang4, barang5] = barangList;

  // 7. Seed BAST Masuk
  const noBast = 'BAST-IN-001';
  let bastMasuk = await prisma.bastMasuk.findFirst({ where: { nomorBast: noBast } });
  if (!bastMasuk) {
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
        pihakKetiga: 'CV Teknologi Maju',
        details: {
          create: [
            {
              idBarang: barang1.id,
              jumlah: 5,
              hargaSatuan: 8000000,
              totalHarga: 40000000,
            },
            {
              idBarang: barang4.id,
              jumlah: 3,
              hargaSatuan: 4500000,
              totalHarga: 13500000,
            },
          ],
        },
      },
    });
    console.log('Created BAST Masuk');
  }

  // 8. Seed SPB (Surat Permintaan Barang)
  const noSpb = 'SPB-001';
  let spb = await prisma.spb.findFirst({ where: { nomorSpb: noSpb } });
  if (!spb) {
    spb = await prisma.spb.create({
      data: {
        nomorSpb: noSpb,
        tanggalSpb: new Date(),
        pemohonId: pegawai2.id,
        keterangan: 'Permintaan untuk kebutuhan kantor',
        details: {
          create: [
            {
              idBarang: barang2.id,
              jumlah: 10,
            },
            {
              idBarang: barang5.id,
              jumlah: 5,
            },
          ],
        },
      },
    });
    console.log('Created SPB');
  }

  // 9. Seed SPPB (Surat Perintah Penyaluran Barang)
  const noSppb = 'SPPB-001';
  let sppb = await prisma.sppb.findFirst({ where: { nomorSppb: noSppb } });
  if (!sppb && spb) {
    sppb = await prisma.sppb.create({
      data: {
        nomorSppb: noSppb,
        tanggalSppb: new Date(),
        idSpb: spb.id,
        idPejabatPenatausahaan: pejabat1.id,
        idPengelolaBarang: pejabat2.id,
        idPenerima: pegawai2.id,
        keterangan: 'Penyaluran sesuai SPB-001',
        details: {
          create: [
            {
              idBarang: barang2.id,
              jumlahDisalurkan: 10,
            },
            {
              idBarang: barang5.id,
              jumlahDisalurkan: 5,
            },
          ],
        },
      },
    });
    console.log('Created SPPB');
  }

  // 10. Seed BAST Keluar
  const noBastKeluar = 'BAST-OUT-001';
  let bastKeluar = await prisma.bastKeluar.findFirst({ where: { nomorBast: noBastKeluar } });
  if (!bastKeluar && sppb) {
    bastKeluar = await prisma.bastKeluar.create({
      data: {
        nomorBast: noBastKeluar,
        tanggalBast: new Date(),
        idSppb: sppb.id,
        idPihakMenyerahkan: pejabat1.id,
        idPihakMenerima: pegawai2.id,
        keterangan: 'Serah terima barang sesuai SPPB-001',
        details: {
          create: [
            {
              idBarang: barang2.id,
              volume: 10,
              jumlahHarga: 500000,
              ppn: 55000,
              hargaSetelahPpn: 555000,
            },
            {
              idBarang: barang5.id,
              volume: 5,
              jumlahHarga: 125000,
              ppn: 13750,
              hargaSetelahPpn: 138750,
            },
          ],
        },
      },
    });
    console.log('Created BAST Keluar');
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
