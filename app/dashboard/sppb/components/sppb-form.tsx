"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { createSPPBFromSPB, updateSPPB } from "@/drizzle/actions/sppb";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { SPPBFormValues, sppbFormSchema } from "@/lib/zod/sppb-schema";
import { SPPBFormDetails } from "./sppb-form-details";
import { SPPBFormItems } from "./sppb-form-items";

interface SPPBFormProps {
  pendingSPBs: any[];
  initialData?: any;
  sppbId?: number;
  preSelectedSpbId?: number;
}

export function SPPBForm({
  pendingSPBs,
  initialData,
  sppbId,
  preSelectedSpbId,
}: SPPBFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSPB, setSelectedSPB] = useState<any>(null);

  const methods = useForm<SPPBFormValues>({
    resolver: zodResolver(sppbFormSchema),
    defaultValues: initialData || {
      spbId: preSelectedSpbId || 0,
      tanggalSppb: new Date(),
      pejabatPenyetujuId: 0,
      keterangan: "",
      items: [],
    },
  });

  const { watch, reset, setValue, setError } = methods;
  const watchSpbId = watch("spbId");
  const items = watch("items");

  // Load initial SPB data if editing or pre-selected
  useEffect(() => {
    const spbIdToLoad = initialData?.spbId || preSelectedSpbId;
    if (spbIdToLoad) {
      const spb = pendingSPBs.find((s) => s.id === spbIdToLoad);
      if (spb) setSelectedSPB(spb);
    }
  }, [initialData, preSelectedSpbId, pendingSPBs]);

  // Auto-populate items when SPB changes
  useEffect(() => {
    if (watchSpbId && !isEdit) {
      const spb = pendingSPBs.find((s) => s.id === watchSpbId);
      if (spb) {
        setSelectedSPB(spb);
        // Only replace items if the SPB ID actually changed and we aren't just hydrating
        // To be safe, we just reset the items part
        const newItems = spb.items.map((item: any) => ({
          barangId: item.barangId,
          qtyDisetujui: item.qtyPermintaan, // Default to requested qty
          keterangan: item.keterangan || "",
        }));
        setValue("items", newItems);
      }
    }
  }, [watchSpbId, pendingSPBs, isEdit, setValue]);

  const saveSppb = async (data: SPPBFormValues) => {
    setIsSubmitting(true);
    try {
      const result =
        isEdit && sppbId
          ? await updateSPPB(sppbId, null, data)
          : await createSPPBFromSPB(null, data);

      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/sppb");
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: SPPBFormValues) => {
    if (!isEdit && selectedSPB?.items?.length) {
      const overStock = data.items
        .map((item, index) => {
          const spbItem = selectedSPB.items.find(
            (spb: any) => spb.barangId === item.barangId,
          );
          const stok = spbItem?.barang?.stok ?? 0;
          return {
            index,
            nama: spbItem?.barang?.nama || "Barang",
            stok,
            qty: item.qtyDisetujui,
          };
        })
        .filter((row) => (row.qty ?? 0) > (row.stok ?? 0));

      if (overStock.length > 0) {
        overStock.forEach((row) => {
          setError(`items.${row.index}.qtyDisetujui`, {
            type: "validate",
            message: `Stok saat ini ${row.stok}`,
          });
        });
        toast.error(
          "Qty disetujui melebihi stok saat ini. Periksa item yang ditandai.",
        );
        return;
      }
    }

    await saveSppb(data);
  };

  const totalItems = items?.length || 0;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Content (Form) - 70% */}
          <div className="flex-1 w-full min-w-0 space-y-8">
            <SPPBFormDetails
              pendingSPBs={pendingSPBs}
              isEdit={isEdit}
              initialData={initialData}
            />
            <SPPBFormItems selectedSPB={selectedSPB} />
          </div>

          {/* Sidebar (Actions) - 30% */}
          <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-8 space-y-6">
            <div className="rounded-lg border bg-background dark:bg-input/30 text-card-foreground shadow-none p-6">
              <h3 className="font-semibold text-lg mb-4">Ringkasan</h3>
              <div className="space-y-4">
                <div className="bg-muted/30 border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Item Diproses
                  </div>
                  <div className="text-2xl font-bold font-mono text-primary">
                    {totalItems} Item
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 flex gap-2">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>Pastikan jumlah sesuai fisik barang.</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting || methods.formState.isSubmitting}
                    className="w-full h-11"
                  >
                    {isSubmitting || methods.formState.isSubmitting
                      ? "Menyimpan..."
                      : isEdit
                        ? "Simpan Perubahan"
                        : "Simpan SPPB"}
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
