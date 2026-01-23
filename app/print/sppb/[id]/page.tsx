import { getSPPBById } from '@/drizzle/actions/sppb';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import Image from 'next/image';

import { PrintButton } from '@/components/print-button';

import { PrintStyles } from '@/components/print-styles';
import { Metadata } from 'next';

interface PrintSPPBPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PrintSPPBPageProps): Promise<Metadata> {
  const { id } = await params;
  const sppbId = Number(id);

  if (isNaN(sppbId)) return { title: 'Print SPPB' };

  const result = await getSPPBById(sppbId);

  if (!result.success || !result.data) return { title: 'SPPB Not Found' };

  return {
    title: `SPPB - ${result.data.nomorSppb}`,
  };
}

export default async function PrintSPPBPage({ params }: PrintSPPBPageProps) {
  const { id } = await params;
  const sppbId = Number(id);

  if (isNaN(sppbId)) return notFound();

  const result = await getSPPBById(sppbId);

  if (!result.success || !result.data) return notFound();

  const data = result.data;
  const items = data.items ?? [];
  const minRows = 15; // Minimum rows to ensure table takes significant height
  const emptyRowsCtx =
    items.length < minRows ? Array(minRows - items.length).fill(null) : [];

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
          <div className="text-center mb-4">
            <h3 className="text-base font-bold decoration-2 uppercase">
              SURAT PERINTAH PENYALURAN BARANG
            </h3>
            <p className="text-base font-bold uppercase">(SPPB)</p>
            <p className="text-sm mt-1">Nomor: {data.nomorSppb}</p>
          </div>

          {/* Body Text */}
          <div className="mb-2 text-justify">
            <p className="mb-2">
              Pada hari ini {format(new Date(), 'EEEE', { locale: localeId })}{' '}
              tanggal {format(new Date(), 'd', { locale: localeId })} bulan{' '}
              {format(new Date(), 'MMMM', { locale: localeId })} tahun{' '}
              {format(new Date(), 'yyyy', { locale: localeId })}, yang bertanda
              tangan dibawah ini:
            </p>

            <table className="w-full mb-2">
              <tbody>
                <tr>
                  <td className="w-24 align-top">Nama</td>
                  <td className="w-3 align-top">:</td>
                  <td className="align-top font-bold">
                    {data.pejabatPenyetuju?.nama}
                  </td>
                </tr>
                <tr>
                  <td className="align-top">Jabatan</td>
                  <td className="align-top">:</td>
                  <td className="align-top">
                    {/* @ts-ignore */}
                    {data.pejabatPenyetuju?.pegawaiJabatan?.[0]?.jabatan
                      ?.nama || '-'}
                    <br />
                    {data.pejabatPenyetuju?.pegawaiJabatan?.[0]?.jabatan
                      ?.unitKerja || '-'}
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="leading-relaxed mb-4">
              Berdasarkan surat permintaan barang (SPB) dari Nomor:{' '}
              <span className="font-bold">{data.spb?.nomorSpb}</span>, tanggal{' '}
              {data.spb?.tanggalSpb
                ? format(new Date(data.spb.tanggalSpb), 'dd MMMM yyyy', {
                    locale: localeId,
                  })
                : '-'}
              , dengan ini diperintahkan kepada Pengurus Barang/ Pengurus Barang
              Pembantu/ Pengurus Barang UPB untuk mendistribusikan /
              mengeluarkan persediaan, sebagaimana daftar terlampir:
            </p>
          </div>

          {/* Tabel Item - Flex Grow to push footer down, but table inside needs to be structured */}
          <div className="grow flex flex-col">
            <table className="w-full text-[11px] border-collapse border border-black grow h-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-1 px-2 border-r border-b border-black w-10 text-center h-8">
                    No
                  </th>
                  <th className="py-1 px-2 border-r border-b border-black text-left h-8">
                    Nama Barang
                  </th>
                  <th className="py-1 px-2 border-r border-b border-black text-center w-16 h-8">
                    Jumlah
                  </th>
                  <th className="py-1 px-2 border-r border-b border-black text-center w-16 h-8">
                    Satuan
                  </th>
                  <th className="py-1 px-2 border-b border-black text-center w-1/4 h-8">
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
                    <td className="py-1 px-2 border-r border-black text-center align-top">
                      {item.qtyDisetujui}
                    </td>
                    <td className="py-1 px-2 border-r border-black text-center align-top">
                      {item.barang?.satuan?.nama || '-'}
                    </td>
                    <td className="py-1 px-2 border-black align-top">
                      {item.keterangan || ''}
                    </td>
                  </tr>
                ))}
                {/* Empty Rows Filler */}
                {emptyRowsCtx.map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td className="py-1 px-2 border-r border-black">&nbsp;</td>
                    <td className="py-1 px-2 border-r border-black">&nbsp;</td>
                    <td className="py-1 px-2 border-r border-black">&nbsp;</td>
                    <td className="py-1 px-2 border-r border-black">&nbsp;</td>
                    <td className="py-1 px-2 border-black">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Text & Tanda Tangan */}
        <div className="break-inside-avoid mt-4">
          <p className="mb-4 text-justify">
            Demikian surat perintah penyaluran barang ini dibuat dalam rangkap 2
            (dua) untuk digunakan sebagaimana mestinya.
          </p>

          <div className="flex justify-end text-[12px] px-8">
            <div className="text-center min-w-[200px]">
              <p className="mb-0.5">
                Jakarta,{' '}
                {format(new Date(), 'dd MMM yyyy', {
                  locale: localeId,
                })}
              </p>
              {/* @ts-ignore */}
              <p className="mb-16">
                {/* @ts-ignore */}
                PPB-SKPD/PPB-UKPD/PPB-UPB
              </p>

              <p className="font-bold uppercase">
                {data.pejabatPenyetuju?.nama}
              </p>
              {data.pejabatPenyetuju?.nip && (
                <p>NIP. {data.pejabatPenyetuju.nip}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
