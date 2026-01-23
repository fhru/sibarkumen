import { getSPBById } from "@/drizzle/actions/spb";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Image from "next/image";

import { PrintButton } from "@/components/print-button";

import { PrintStyles } from "@/components/print-styles";
import { Metadata } from "next";

interface PrintSPBPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PrintSPBPageProps): Promise<Metadata> {
  const { id } = await params;
  const spbId = Number(id);

  if (isNaN(spbId)) return { title: "Print SPB" };

  const data = await getSPBById(spbId);

  if (!data) return { title: "SPB Not Found" };

  return {
    title: `SPB - ${data.nomorSpb}`,
  };
}

export default async function PrintSPBPage({ params }: PrintSPBPageProps) {
  const { id } = await params;
  const spbId = Number(id);

  if (isNaN(spbId)) return notFound();

  const data = await getSPBById(spbId);

  if (!data) return notFound();

  const items = data.items ?? [];
  const minRows = 15; // Minimum rows to ensure table takes significant height
  const emptyRowsCtx =
    items.length < minRows ? Array(minRows - items.length).fill(null) : [];

  return (
    <div
      className="mx-auto w-[210mm] min-h-[297mm] bg-white relative print:w-auto print:h-auto print:min-h-0 text-black leading-tight"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
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
            <h3 className="text-base font-bold underline decoration-2 underline-offset-4 uppercase">
              SURAT PERMINTAAN BARANG (SPB)
            </h3>
            <p className="text-sm mt-1">Nomor: {data.nomorSpb}</p>
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
                      <div className="font-medium">{item.barang.nama}</div>
                    </td>
                    <td className="py-1 px-2 border-r border-black text-center align-top">
                      {item.qtyPermintaan}
                    </td>
                    <td className="py-1 px-2 border-r border-black text-center align-top">
                      {item.barang.satuan?.nama || "-"}
                    </td>
                    <td className="py-1 px-2 border-black align-top">
                      {item.keterangan || ""}
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

        {/* Tanda Tangan */}
        <div className="flex justify-end text-[12px] break-inside-avoid mt-4">
          <div className="text-center min-w-[200px]">
            <p className="mb-0.5">
              Jakarta,{" "}
              {format(new Date(data.tanggalSpb), "dd MMMM yyyy", {
                locale: localeId,
              })}
            </p>
            <p className="mb-16">Yang Meminta</p>

            <p className="font-bold uppercase">{data.pemohon?.nama}</p>
            {data.pemohon?.nip && <p>NIP. {data.pemohon.nip}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
