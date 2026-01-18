import { db } from '@/lib/db';
import { konversiSatuan, barang, satuan } from '@/drizzle/schema';
import { desc, eq } from 'drizzle-orm';
import { KonversiTable } from './components/konversi-table';
import { KonversiStats } from './components/konversi-stats';

export const dynamic = 'force-dynamic';

export default async function KonversiSatuanPage() {
  // Fetch Konversi Data with Relations
  const data = await db
    .select({
      id: konversiSatuan.id,
      barangId: konversiSatuan.barangId,
      satuanBesarId: konversiSatuan.satuanBesarId,
      satuanKecilId: konversiSatuan.satuanKecilId,
      nilaiKonversi: konversiSatuan.nilaiKonversi,
      barangNama: barang.nama,
      satuanBesarNama: satuan.nama,
    })
    .from(konversiSatuan)
    .innerJoin(barang, eq(konversiSatuan.barangId, barang.id))
    .innerJoin(satuan, eq(konversiSatuan.satuanBesarId, satuan.id))
    .orderBy(desc(konversiSatuan.id));

  const results = await db.query.konversiSatuan.findMany({
    with: {
      barang: true,
      satuanBesar: true,
      satuanKecil: true,
    },
    orderBy: desc(konversiSatuan.id),
  });

  const formattedData = results.map((item) => ({
    id: item.id,
    barangId: item.barangId,
    satuanBesarId: item.satuanBesarId,
    satuanKecilId: item.satuanKecilId,
    nilaiKonversi: item.nilaiKonversi,
    barangNama: item.barang.nama,
    satuanBesarNama: item.satuanBesar.nama,
    satuanKecilNama: item.satuanKecil.nama,
  }));

  // Fetch lists for Dropdowns
  const barangList = await db
    .select({ id: barang.id, nama: barang.nama })
    .from(barang)
    .orderBy(barang.nama);

  const satuanList = await db
    .select({ id: satuan.id, nama: satuan.nama })
    .from(satuan)
    .orderBy(satuan.nama);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Konversi Satuan</h2>
          <p className="text-muted-foreground">
            Kelola aturan konversi satuan untuk barang di sini.
          </p>
        </div>
      </div>
      <KonversiStats totalKonversi={formattedData.length} />
      <KonversiTable
        data={formattedData}
        barangList={barangList}
        satuanList={satuanList}
      />
    </div>
  );
}
