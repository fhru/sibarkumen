'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createBastMasuk, updateBastMasuk } from '@/drizzle/actions/bast-masuk';
import { useRouter } from 'next/navigation';
import { Info } from 'lucide-react';
import {
  BastMasukFormValues,
  createBastMasukSchema,
  Option,
  RekeningOption,
} from '../../../../lib/zod/bast-masuk-schema';
import { BastMasukFormDetails } from './bast-masuk-form-details';
import { BastMasukFormItems } from './bast-masuk-form-items';

interface BastMasukFormProps {
  barangList?: Option[];
  satuanList: Option[];
  asalPembelianList: Option[];
  rekeningList: RekeningOption[];
  pihakKetigaList?: Option[];
  pegawaiList?: Option[];
  initialData?: any;
  nextNomorReferensi?: string;
}

export function BastMasukForm({
  barangList,
  satuanList,
  asalPembelianList,
  rekeningList,
  pihakKetigaList,
  pegawaiList,
  initialData,
  nextNomorReferensi,
}: BastMasukFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const defaultValues = initialData
    ? {
        nomorReferensi: initialData.nomorReferensi,
        nomorBast: initialData.nomorBast,
        tanggalBast: new Date(initialData.tanggalBast),
        nomorBapb: initialData.nomorBapb,
        tanggalBapb: new Date(initialData.tanggalBapb),
        asalPembelianId: initialData.asalPembelianId,
        rekeningId: initialData.rekeningId,
        pihakKetigaId: initialData.pihakKetigaId,
        pptkPpkId: initialData.pptkPpkId,
        peruntukkan: initialData.peruntukkan || '',
        keterangan: initialData.keterangan || '',
        items: initialData.items.map((item: any) => ({
          barangId: item.barangId,
          qty: item.qty,
          hargaSatuan: Number(item.hargaSatuan),
          keterangan: item.keterangan || '',
          satuanNama: item.barang?.satuan?.nama || '',
        })),
      }
    : undefined;

  const methods = useForm<BastMasukFormValues>({
    resolver: zodResolver(createBastMasukSchema),
    defaultValues: defaultValues || {
      nomorReferensi: nextNomorReferensi || '',
      nomorBast: '',
      nomorBapb: '',
      peruntukkan: '',
      keterangan: '',
      items: [],
    },
  });

  async function onSubmit(data: BastMasukFormValues) {
    let res;
    if (isEdit) {
      res = await updateBastMasuk(initialData.id, null, data);
    } else {
      res = await createBastMasuk(null, data);
    }

    if (res.success) {
      toast.success(res.message);
      router.push('/dashboard/bast-masuk');
    } else {
      toast.error(res.message);
    }
  }

  // Calculate generic total price for UI preview
  const watchItems = methods.watch('items');
  const totalPrice =
    watchItems?.reduce((sum, item) => {
      return sum + (item.qty || 0) * (item.hargaSatuan || 0);
    }, 0) || 0;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Content (Form) - 70% */}
          <div className="flex-1 w-full min-w-0 space-y-8">
            <BastMasukFormDetails
              asalPembelianList={asalPembelianList}
              rekeningList={rekeningList}
              initialData={initialData}
            />
            <BastMasukFormItems initialData={initialData} />
          </div>

          {/* Sidebar (Actions & Summary) - 30% */}
          <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-8 space-y-6">
            <div className="rounded-lg border bg-background dark:bg-input/30 text-card-foreground shadow-none p-6">
              <h3 className="font-semibold text-lg mb-4">Ringkasan</h3>

              <div className="space-y-4">
                <div className="bg-muted/30 border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Total Estimasi
                  </div>
                  <div className="text-2xl font-bold font-mono text-primary">
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 flex gap-2">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>
                      Total ini adalah estimasi berdasarkan input harga satuan.
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Button
                    type="submit"
                    disabled={methods.formState.isSubmitting}
                    className="w-full h-11"
                  >
                    {methods.formState.isSubmitting
                      ? 'Menyimpan...'
                      : isEdit
                        ? 'Simpan Perubahan'
                        : 'Simpan BAST Masuk'}
                  </Button>

                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.back()}
                    className="w-full"
                  >
                    Batal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
