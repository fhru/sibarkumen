import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { PrintBastMasuk } from '@/components/print/print-bast-masuk';
import { PrintSpb } from '@/components/print/print-spb';
import { PrintSppb } from '@/components/print/print-sppb';
import { PrintBastKeluar } from '@/components/print/print-bast-keluar';
import { PrintButton } from '@/components/print/print-button';

export default async function PrintPage(props) {
  const params = await props.params;
  const session = await auth();
  if (!session) redirect('/login');

  const { doctype, id } = params;
  const docId = parseInt(id);
  if (isNaN(docId)) notFound();

  let data = null;
  let Component = null;

  try {
      if (doctype === 'bast-masuk') {
          data = await prisma.bastMasuk.findUnique({
              where: { id: docId },
              include: {
                  rekening: true,
                  pptkPpk: true,
                  details: { include: { barang: true } }
              }
          });
          Component = PrintBastMasuk;
      } 
      else if (doctype === 'spb') {
          data = await prisma.spb.findUnique({
              where: { id: docId },
              include: {
                  pemohon: true,
                  details: { include: { barang: true } }
              }
          });
          Component = PrintSpb;
      }
      else if (doctype === 'sppb') {
          data = await prisma.sppb.findUnique({
              where: { id: docId },
              include: {
                  penerima: true,
                  pejabatPenatausahaan: { include: { pegawai: true } },
                  pengelolaBarang: { include: { pegawai: true } },
                  details: { include: { barang: true } }
              }
          });
          Component = PrintSppb;
      }
      else if (doctype === 'bast-keluar') {
          data = await prisma.bastKeluar.findUnique({
              where: { id: docId },
              include: {
                  sppb: true,
                  pihakMenyerahkan: { include: { pegawai: true } },
                  pihakMenerima: true,
                  details: { include: { barang: true } }
              }
          });
          Component = PrintBastKeluar;
      }
  } catch (e) {
      console.error(e);
      return <div>Error loading document</div>;
  }

  if (!data) return notFound();

  return (
    <div className="min-h-screen bg-white text-black p-8 print:p-0">
      {/* Print Controls - Hidden when printing */}
      <div className="mb-8 flex justify-end gap-4 print:hidden">
        <PrintButton />
      </div>

      {/* A4 Container */}
      <div className="mx-auto max-w-[210mm] print:max-w-none">
          <Component data={data} />
      </div>
    </div>
  );
}


