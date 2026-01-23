'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { createSPB, updateSPB } from '@/drizzle/actions/spb';
import { AlertTriangle, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { SPBFormValues, createSpbSchema } from '@/lib/zod/spb-schema';
import { SPBFormDetails } from './spb-form-details';
import { SPBFormItems } from './spb-form-items';

import { Role } from '@/config/nav-items';
import { authClient } from '@/lib/auth-client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [showStockWarning, setShowStockWarning] = useState(false);
  const [pendingData, setPendingData] = useState<SPBFormValues | null>(null);
  const [warningItems, setWarningItems] = useState<
    { nama: string; stok: number; minta: number }[]
  >([]);

  const submitData = async (data: SPBFormValues) => {
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
      setPendingData(null);
      setShowStockWarning(false);
    }
  };

  const onSubmit = async (data: SPBFormValues) => {
    const warnings: { nama: string; stok: number; minta: number }[] = [];

    // Check for stock availability
    // We iterate through items. Since AsyncSelect sets the 'stok' in the form data (although not in schema strictly sent to server),
    // we can access it here if we cast or if schema allows.
    // We added 'stok' to schema, so it should be accessible.

    // Note: We need to access the 'option' details.
    // Since 'stok' is now in the form values (via our modification to SPBFormItems), we can check it.

    // However, for initialData (edit mode), 'stok' might be missing if we didn't populate it.
    // For CREATE mode, it should be fine.

    for (const item of data.items) {
      // @ts-ignore - stok is optional in schema but we populated it
      // item.barang?.stok is for initialData (Edit mode) where we haven't touched the item but it has nested data
      const availableStock = item.stok ?? (item as any).barang?.stok;

      // If stock is known and request > stock
      if (
        typeof availableStock === 'number' &&
        item.qtyPermintaan > availableStock
      ) {
        // We need the name of the item for the warning.
        // We don't have the name easily reachable here unless we stored it too.
        // But we can just say "Item with ID ..." or try to get name if possible.
        // Or we can store the name in the form items too.

        // Let's assume we want to show a generic message or try to improve this later.
        // Actually, let's just show the count.
        warnings.push({
          nama:
            item.nama ??
            (item as any).barang?.nama ??
            `Barang (ID: ${item.barangId})`,
          stok: availableStock,
          minta: item.qtyPermintaan,
        });
      }
    }

    if (warnings.length > 0) {
      setWarningItems(warnings);
      setPendingData(data);
      setShowStockWarning(true);
      return;
    }

    await submitData(data);
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

      <AlertDialog open={showStockWarning} onOpenChange={setShowStockWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-amber-500" />
              Peringatan Stok
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-muted-foreground text-sm">
                Beberapa barang yang Anda minta melebihi stok yang tersedia:
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {warningItems.map((w, idx) => (
                    <li key={idx}>
                      {w.nama}: Stok <strong>{w.stok}</strong>, Minta{' '}
                      <strong>{w.minta}</strong>
                    </li>
                  ))}
                </ul>
                <div className="mt-2">Apakah Anda yakin ingin melanjutkan?</div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingData(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingData && submitData(pendingData)}
            >
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormProvider>
  );
}
