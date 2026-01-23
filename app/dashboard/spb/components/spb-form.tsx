'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { createSPB, updateSPB } from '@/drizzle/actions/spb';
import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { SPBFormValues, createSpbSchema } from '@/lib/zod/spb-schema';
import { SPBFormDetails } from './spb-form-details';
import { SPBFormItems } from './spb-form-items';

import { Role } from '@/config/nav-items';
import { authClient } from '@/lib/auth-client';

interface SPBFormProps {
  initialData?: any;
  spbId?: number;
  generatedNomorSpb?: string;
  currentPegawai?: any;
}

export function SPBForm({
  initialData,
  spbId,
  generatedNomorSpb,
  currentPegawai,
}: SPBFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const session = authClient.useSession();
  const userRole = session.data?.user.role as Role | undefined;

  const methods = useForm<SPBFormValues>({
    resolver: zodResolver(createSpbSchema),
    defaultValues: initialData || {
      nomorSpb: generatedNomorSpb || '',
      tanggalSpb: new Date(),
      pemohonId: userRole === 'petugas' ? currentPegawai?.id : undefined,
      keterangan: '',
      items: [],
    },
  });

  const onSubmit = async (data: SPBFormValues) => {
    setIsSubmitting(true);
    try {
      const result =
        isEdit && spbId
          ? await updateSPB(spbId, null, data)
          : await createSPB(null, data);

      if (result.success) {
        toast.success(result.message);
        router.push('/dashboard/spb');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const items = methods.watch('items');
  const totalItems = items?.length || 0;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Content (Form) - 70% */}
          <div className="flex-1 w-full min-w-0 space-y-8">
            <SPBFormDetails currentPegawai={currentPegawai} />
            <SPBFormItems />
          </div>

          {/* Sidebar (Actions) - 30% */}
          <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-8 space-y-6">
            <div className="rounded-lg border bg-background dark:bg-input/30 text-card-foreground shadow-none p-6">
              <h3 className="font-semibold text-lg mb-4">Ringkasan</h3>
              <div className="space-y-4">
                <div className="bg-muted/30 border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Total Barang
                  </div>
                  <div className="text-2xl font-bold font-mono text-primary">
                    {totalItems} Item
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 flex gap-2">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>Pastikan stok tersedia sebelum mengajukan.</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      methods.formState.isSubmitting ||
                      (userRole === 'petugas' && !currentPegawai)
                    }
                    className="w-full h-11"
                  >
                    {isSubmitting || methods.formState.isSubmitting
                      ? 'Menyimpan...'
                      : isEdit
                        ? 'Simpan Perubahan'
                        : 'Buat SPB'}
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
