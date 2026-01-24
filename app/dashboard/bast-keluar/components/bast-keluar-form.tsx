"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  createBastKeluarFromSPPB,
  updateBastKeluar,
} from "@/drizzle/actions/bast-keluar";
import { Info, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import {
  bastKeluarFormSchema,
  BastKeluarFormValues,
} from "@/lib/zod/bast-keluar-schema";
import { BastKeluarFormDetails } from "./bast-keluar-form-details";
import { BastKeluarFormItems } from "./bast-keluar-form-items";

interface BastKeluarFormProps {
  completedSPPBs: any[];
  initialData?: any;
  bastKeluarId?: number;
  preSelectedSppbId?: number;
}

export function BastKeluarForm({
  completedSPPBs,
  initialData,
  bastKeluarId,
  preSelectedSppbId,
}: BastKeluarFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSPPB, setSelectedSPPB] = useState<any>(null);

  const methods = useForm<BastKeluarFormValues>({
    resolver: zodResolver(bastKeluarFormSchema),
    defaultValues: initialData || {
      sppbId: preSelectedSppbId ?? undefined,
      tanggalBast: new Date(),
      pihakPertamaId: undefined,
      jabatanPihakPertamaId: undefined,
      pihakKeduaId: undefined,
      jabatanPihakKeduaId: undefined,
      keterangan: "",
      items: [],
    },
  });

  const { watch, setValue, handleSubmit, formState, control } = methods;
  const watchSppbId = watch("sppbId");

  const watchItems = useWatch({
    control,
    name: "items",
    defaultValue: [],
  });

  // Load initial SPPB data if editing or pre-selected
  useEffect(() => {
    const sppbIdToLoad = initialData?.sppbId || preSelectedSppbId;
    if (sppbIdToLoad) {
      const sppb = completedSPPBs.find((s) => s.id === sppbIdToLoad);
      if (sppb) setSelectedSPPB(sppb);
    }
  }, [initialData, preSelectedSppbId, completedSPPBs]);

  // Auto-populate items when SPPB changes
  useEffect(() => {
    if (watchSppbId && !isEdit) {
      const sppb = completedSPPBs.find((s) => s.id === watchSppbId);
      if (sppb) {
        setSelectedSPPB(sppb);

        // Auto-populate Pihak Kedua with SPB requester if available
        if (sppb.spb?.pemohonId) {
          // We need to fetch the applicant details to populate the AsyncSelect initial value as well
          // However, AsyncSelect handles initialOption.
          // But here we are setting the ID. AsyncSelect needs to know how to display it if we just set ID?
          // Actually AsyncSelect is controlled. If we set ID, we might need to set the object for display if it wasn't loaded via search?
          // The AsyncSelect component implementation usually takes 'initialOption' prop or fetches if value is set but no option?
          // Looking at AsyncSelect usage, it takes 'initialOption'.
          // But we are inside the form.
          // We can just set the ID.
          // BUT wait, SPPB data fetched in create/page.tsx needs to include SPB -> Pemohon relation.

          setValue("pihakKeduaId", sppb.spb.pemohonId);
        }

        const items = sppb.items.map((item: any) => ({
          barangId: item.barangId,
          qtySerahTerima: item.qtyDisetujui,
          hargaSatuan: 0,
          persentasePpn: 0,
          keterangan: "",
        }));
        setValue("items", items);
      }
    }
  }, [watchSppbId, completedSPPBs, isEdit, setValue]);

  // Calculate financial totals
  const financials = useMemo(() => {
    let subtotal = 0;
    let totalPpn = 0;

    watchItems?.forEach((item) => {
      const itemSubtotal = (item.qtySerahTerima || 0) * (item.hargaSatuan || 0);
      const nilaiPpn = (itemSubtotal * (item.persentasePpn || 0)) / 100;
      subtotal += itemSubtotal;
      totalPpn += nilaiPpn;
    });

    return { subtotal, totalPpn, grandTotal: subtotal + totalPpn };
  }, [watchItems]);

  const onSubmit = async (data: BastKeluarFormValues) => {
    setIsSubmitting(true);
    try {
      const result =
        isEdit && bastKeluarId
          ? await updateBastKeluar(bastKeluarId, null, data)
          : await createBastKeluarFromSPPB(null, data);

      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/bast-keluar");
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItems = watchItems?.length || 0;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Content (Form) - 70% */}
          <div className="flex-1 w-full min-w-0 space-y-8">
            <BastKeluarFormDetails
              completedSPPBs={completedSPPBs}
              isEdit={isEdit}
              initialData={initialData}
              selectedSPPB={selectedSPPB}
            />
            <BastKeluarFormItems selectedSPPB={selectedSPPB} />
          </div>

          {/* Sidebar (Actions & Summary) - 30% */}
          <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-8 space-y-6">
            <div className="rounded-lg border bg-background dark:bg-input/30 text-card-foreground shadow-none p-6">
              <h3 className="font-semibold text-lg mb-4">Ringkasan</h3>
              <div className="space-y-4">
                {/* Items Summary */}
                <div className="bg-muted/30 border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Item Diproses
                  </div>
                  <div className="text-2xl font-bold font-mono text-foreground">
                    {totalItems} Item
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-muted/30 border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold text-sm">
                      Total Keuangan
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      Rp {financials.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">PPN</span>
                    <span>
                      Rp {financials.totalPpn.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="border-t pt-2 mt-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      Grand Total
                    </div>
                    <div className="text-xl font-bold font-mono text-primary">
                      Rp {financials.grandTotal.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mt-2 flex gap-2 items-start">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Pastikan harga dan pajak sudah sesuai dengan dokumen fisik.
                  </span>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting || formState.isSubmitting}
                    className="w-full h-11"
                  >
                    {isSubmitting || formState.isSubmitting
                      ? "Menyimpan..."
                      : isEdit
                        ? "Simpan Perubahan"
                        : "Simpan BAST"}
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
