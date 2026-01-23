import { getBastKeluarById } from '@/drizzle/actions/bast-keluar';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { PrintButton } from '@/components/print-button';
import { PrintStyles } from '@/components/print-styles';
import { Metadata } from 'next';

interface PrintBastKeluarPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PrintBastKeluarPageProps): Promise<Metadata> {
  const { id } = await params;
  const bastId = Number(id);

  if (isNaN(bastId)) return { title: 'Print BAST Keluar' };

  const result = await getBastKeluarById(bastId);

  if (!result.success || !result.data)
    return { title: 'BAST Keluar Not Found' };

  return {
    title: `BAST Keluar - ${result.data.nomorBast}`,
  };
}

export default async function PrintBastKeluarPage({
  params,
}: PrintBastKeluarPageProps) {
  const { id } = await params;
  const bastId = Number(id);

  if (isNaN(bastId)) return notFound();

  const result = await getBastKeluarById(bastId);

  if (!result.success || !result.data) return notFound();

  const data = result.data;
  const items = data.items ?? [];
  const bastDate = new Date(data.tanggalBast);
  const sppbDate = data.sppb?.tanggalSppb
    ? new Date(data.sppb.tanggalSppb)
    : bastDate;
  const totals = items.reduce(
    (acc, item) => {
      const qty = Number(item.qtySerahTerima) || 0;
      const harga = Number(item.hargaSatuan) || 0;
      const jumlah = qty * harga;
      const ppn = Number(item.nilaiPpn) || 0;
      const afterTax = Number(item.totalHarga) || 0;
      acc.jumlah += jumlah;
      acc.ppn += ppn;
      acc.afterTax += afterTax;
      return acc;
    },
    { jumlah: 0, ppn: 0, afterTax: 0 }
  );

  return (
    <div
      className="mx-auto w-[210mm] min-h-[297mm] bg-white relative print:w-auto print:h-auto print:min-h-0 text-black leading-tight"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      <PrintStyles />

      <PrintButton />

      <div className="p-8 h-full flex flex-col justify-between print:p-[15mm] print:h-[297mm] font-sans text-black text-[12px]">
        <div className="grow flex flex-col">
          {/* KOP SURAT */}
          <div className="flex flex-col items-center justify-center border-b-4 border-double border-black pb-2 mb-4 text-center">
            {/* Logo */}
            <div className="mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/jayaraya.png"
                alt="Logo Jaya Raya"
                className="h-16 w-auto object-contain"
              />
            </div>

            {/* Teks Kop */}
            <div className="space-y-0.5">
              <h1 className="text-lg font-bold uppercase tracking-wide">
                PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA
              </h1>
              <h2 className="text-base font-bold uppercase">
                KELURAHAN UJUNG MENTENG - JAKTIM
              </h2>
              <p className="text-xs">JL. RAYA BEKASI KM. 25</p>
            </div>
          </div>

          {/* Judul & Nomor */}
          <div className="text-center mb-6">
            <h3 className="text-base font-bold decoration-2 uppercase">
              BERITA ACARA SERAH TERIMA BARANG <br />
              DISTRIBUSI/PENGELUARAN
            </h3>
            <p className="text-sm mt-1">Nomor: {data.nomorBast}</p>
          </div>

          {/* Body Text */}
          <div className="mb-4 text-justify">
            <p className="mb-4">
              Pada hari ini{' '}
              {format(bastDate, 'EEEE', { locale: localeId }).toWellFormed()}{' '}
              tanggal {format(bastDate, 'd', { locale: localeId })} bulan{' '}
              {format(bastDate, 'MMMM', { locale: localeId })} tahun{' '}
              {format(bastDate, 'yyyy', { locale: localeId })}, yang bertanda
              tangan dibawah ini:
            </p>

            <div className="mb-4">
              <table className="w-full ml-4">
                <tbody>
                  <tr>
                    <td className="w-24 align-top">Nama</td>
                    <td className="w-3 align-top">:</td>
                    <td className="align-top font-bold">
                      {data.pihakPertama?.nama}
                    </td>
                  </tr>
                  <tr>
                    <td className="align-top">Jabatan</td>
                    <td className="align-top">:</td>
                    <td className="align-top">
                      {data.pihakPertama?.pegawaiJabatan?.[0]?.jabatan?.nama ||
                        '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="leading-relaxed mb-4">
              Berdasarkan Surat Perintah Penyaluran Barang (SPPB) dari Pejabat
              Penatausahaan Barang SKPD/UKPD/UPB KELURAHAN UJUNG MENTENG -
              JAKTIM Nomor: <b>{data.sppb?.nomorSppb}</b> tanggal{' '}
              {format(sppbDate, 'd', { locale: localeId })} bulan{' '}
              {format(sppbDate, 'MMMM', { locale: localeId })} tahun{' '}
              {format(sppbDate, 'yyyy', { locale: localeId })}. telah diserahkan
              oleh Pengurus Barang / Pengurus Barang Pembantu / Pengurus Barang
              UPB kepada Pemakai Barang Persediaan, sebagaimana daftar
              terlampir.
            </p>
          </div>

          {/* Tabel Item */}
          <div className="grow flex flex-col">
            <p className="mb-2">Daftar barang yang diterima sebagai berikut:</p>
            <table className="w-full text-[11px] border-collapse border border-black grow h-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-1 px-2 border-r border-b border-black w-10 text-center h-8">
                    No
                  </th>
                  <th className="py-1 w-32 px-2 border-r border-b border-black text-left h-8">
                    Nama Barang
                  </th>
                  <th className="py-1 px-2 border-r border-b border-black text-right w-24 h-8">
                    Harga Satuan
                  </th>
                  <th className="py-1 px-2 border-r border-b border-black text-center w-16 h-8">
                    Satuan
                  </th>
                  <th className="py-1 px-2 border-r border-b border-black text-center w-16 h-8">
                    Volume
                  </th>
                  <th className="py-1 px-2 border-r border-b border-black text-right w-24 h-8">
                    Jumlah
                  </th>
                  <th className="py-1 px-2 border-r border-b border-black text-right w-20 h-8">
                    PPN
                  </th>
                  <th className="py-1 px-2 border-r border-b border-black text-right w-28 h-8">
                    Harga Setelah Pajak
                  </th>
                  <th className="py-1 px-2 border-b border-black text-left h-8">
                    Keterangan
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="py-1 px-2 border-r border-black text-center align-top">
                      {index + 1}
                    </td>
                    <td className="py-1 px-2 border-r border-black align-top">
                      <div className="font-medium">{item.barang?.nama}</div>
                    </td>
                    <td className="py-1 px-2 border-r border-black text-right align-top">
                      Rp {parseFloat(item.hargaSatuan).toLocaleString('id-ID')}
                    </td>
                    <td className="py-1 px-2 border-r border-black text-center align-top">
                      {item.barang?.satuan?.nama || '-'}
                    </td>
                    <td className="py-1 px-2 border-r border-black text-center align-top">
                      {item.qtySerahTerima}
                    </td>
                    <td className="py-1 px-2 border-r border-black text-right align-top">
                      Rp{' '}
                      {(
                        Number(item.qtySerahTerima) * Number(item.hargaSatuan)
                      ).toLocaleString('id-ID')}
                    </td>
                    <td className="py-1 px-2 border-r border-black text-right align-top">
                      Rp {Number(item.nilaiPpn).toLocaleString('id-ID')}
                    </td>
                    <td className="py-1 px-2 border-r border-black text-right align-top">
                      Rp {Number(item.totalHarga).toLocaleString('id-ID')}
                    </td>
                    <td className="py-1 px-2 border-black align-top">
                      {item.keterangan || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td
                    colSpan={5}
                    className="py-1 px-2 border-r border-t border-black text-right"
                  >
                    Jumlah
                  </td>
                  <td className="py-1 px-2 border-r border-t border-black text-right">
                    Rp {totals.jumlah.toLocaleString('id-ID')}
                  </td>
                  <td className="py-1 px-2 border-r border-t border-black text-right">
                    Rp {totals.ppn.toLocaleString('id-ID')}
                  </td>
                  <td className="py-1 px-2 border-r border-t border-black text-right">
                    Rp {totals.afterTax.toLocaleString('id-ID')}
                  </td>
                  <td className="border-t border-black"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer Text & Tanda Tangan */}
        <div className="break-inside-avoid mt-8">
          <p className="mb-4 text-justify">
            Demikian Berita Acara Serah Terima Barang ini dibuat dalam rangkap 2
            (dua) untuk digunakan sebagaimana mestinya.
          </p>

          <div className="flex justify-end mb-10">
            <div className="text-right">
              <p>
                Jakarta, {format(bastDate, 'dd MMM yyyy', { locale: localeId })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="text-left">
              <p className="mb-1">Yang Menyerahkan</p>
              <p>
                {data.pihakPertama?.pegawaiJabatan?.[0]?.jabatan?.nama || '-'}
              </p>
              <div className="mt-16">
                <p className="font-bold">{data.pihakPertama?.nama}</p>
                <p>NIP. {data.pihakPertama?.nip || '-'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="mb-1">Yang Menerima</p>
              <p>Pemakai Persediaan</p>
              <div className="mt-16">
                <p className="font-bold">{data.pihakKedua?.nama}</p>
                <p>NIP. {data.pihakKedua?.nip || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
