"use client";

import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Package } from "lucide-react";
import { SPPBFormValues } from "@/lib/zod/sppb-schema";

interface SPPBFormItemsProps {
  selectedSPB: any;
}

export function SPPBFormItems({ selectedSPB }: SPPBFormItemsProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<SPPBFormValues>();

  const { fields } = useFieldArray({
    control,
    name: "items",
  });

  return (
    <div className="space-y-8">
      {/* SECTION 3: Daftar Barang */}
      <div className="rounded-md border bg-background dark:bg-input/30 text-card-foreground shadow-none">
        <div className="flex items-center gap-2 p-6 pb-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Daftar Barang</h3>
        </div>

        <div className="p-6 pt-2">
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground">
              <Package className="h-10 w-10 mb-3 opacity-20" />
              <p className="font-medium">Belum ada barang</p>
              <p className="text-xs">
                Pilih SPB terlebih dahulu untuk memuat barang
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header Labels (Desktop) */}
              <div className="hidden md:grid gap-4 md:grid-cols-12 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                <div className="md:col-span-4">Barang</div>
                <div className="md:col-span-2">Qty Diminta</div>
                <div className="md:col-span-2">Stok Saat Ini</div>
                <div className="md:col-span-2">Qty Disetujui</div>
                <div className="md:col-span-2">Keterangan</div>
              </div>

              {fields.map((field, index) => {
                const spbItem = selectedSPB?.items?.find(
                  (item: any) => item.barangId === field.barangId,
                );

                const barang = spbItem?.barang;
                const qtyDiminta = spbItem?.qtyPermintaan;

                const stokSaatIni = barang?.stok ?? 0;

                return (
                  <div
                    key={field.id}
                    className="relative grid gap-4 rounded-lg border bg-muted/10 hover:bg-muted/30 transition-colors p-4 md:grid-cols-12 items-start group"
                  >
                    {/* Row 1: Barang (Read Only) */}
                    <div className="md:col-span-4">
                      <Field>
                        <FieldLabel className="md:hidden text-xs">
                          Barang
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            readOnly
                            className="bg-muted/50 text-muted-foreground h-9"
                            value={`${barang?.nama || ""} ${
                              barang?.kodeBarang ? `(${barang.kodeBarang})` : ""
                            }`}
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    {/* Row 2: Qty Diminta (Read Only) */}
                    <div className="md:col-span-2">
                      <Field>
                        <FieldLabel className="md:hidden text-xs">
                          Qty Diminta
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            readOnly
                            className="bg-muted/50 text-muted-foreground h-9"
                            value={qtyDiminta || 0}
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    {/* Row 3: Stok Saat Ini (Read Only) */}
                    <div className="md:col-span-2">
                      <Field>
                        <FieldLabel className="md:hidden text-xs">
                          Stok Saat Ini
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            readOnly
                            className="bg-muted/50 text-muted-foreground h-9"
                            value={stokSaatIni}
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    {/* Row 3: Qty Disetujui (Editable) */}
                    <div className="md:col-span-2">
                      <Field>
                        <FieldLabel className="md:hidden text-xs">
                          Qty Disetujui
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            type="number"
                            min={1}
                            className="h-9"
                            placeholder="Qty"
                            {...register(`items.${index}.qtyDisetujui`, {
                              valueAsNumber: true,
                            })}
                          />
                          <FieldError
                            errors={[errors.items?.[index]?.qtyDisetujui]}
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    {/* Row 4: Keterangan (Editable) */}
                    <div className="md:col-span-2">
                      <Field>
                        <FieldLabel className="md:hidden text-xs">
                          Keterangan
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            className="h-9"
                            placeholder="Keterangan Item"
                            {...register(`items.${index}.keterangan`)}
                          />
                          <FieldError
                            errors={[errors.items?.[index]?.keterangan]}
                          />
                        </FieldContent>
                      </Field>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
