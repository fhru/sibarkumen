'use client';

import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Package } from 'lucide-react';
import { BastKeluarFormValues } from '@/lib/zod/bast-keluar-schema';
import { getLastPurchasePrice } from '@/drizzle/actions/barang';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BastKeluarFormItemsProps {
  selectedSPPB: any;
}

export function BastKeluarFormItems({
  selectedSPPB,
}: BastKeluarFormItemsProps) {
  const {
    control,
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<BastKeluarFormValues>();

  const { fields } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');

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
                Pilih SPPB terlebih dahulu untuk memuat barang
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header Labels (Desktop) */}
              <div className="hidden md:grid gap-4 md:grid-cols-12 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                <div className="md:col-span-3">Barang</div>
                <div className="md:col-span-1 text-center">Qty SPPB</div>
                <div className="md:col-span-1 text-center">Qty BAST</div>
                <div className="md:col-span-3">Harga Satuan</div>
                <div className="md:col-span-1 text-center">PPN %</div>
                <div className="md:col-span-3 text-right">Total</div>
              </div>

              {fields.map((field, index) => {
                const spbItem = selectedSPPB?.items?.find(
                  (item: any) => item.barangId === field.barangId
                );
                const barang = spbItem?.barang;
                const qtySppb = spbItem?.qtyDisetujui || 0;

                // Watch values for live calculation
                const currentItem = items?.[index];
                const qty = currentItem?.qtySerahTerima || 0;
                const harga = currentItem?.hargaSatuan || 0;
                const ppn = currentItem?.persentasePpn || 0;

                const subtotal = qty * harga;
                const nilaiPpn = (subtotal * ppn) / 100;
                const total = subtotal + nilaiPpn;

                return (
                  <div
                    key={field.id}
                    className="relative grid gap-4 rounded-lg border bg-muted/10 hover:bg-muted/30 transition-colors p-4 md:grid-cols-12 items-start group"
                  >
                    {/* Row 1: Barang (Read Only) */}
                    <div className="md:col-span-3">
                      <Field>
                        <FieldLabel className="md:hidden text-xs">
                          Barang
                        </FieldLabel>
                        <FieldContent>
                          <div className="text-sm font-medium">
                            {barang?.nama || '-'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {barang?.kodeBarang || '-'}
                          </div>
                        </FieldContent>
                      </Field>
                    </div>

                    {/* Row 2: Qty SPPB (Read Only) */}
                    <div className="md:col-span-1">
                      <Field>
                        <FieldLabel className="md:hidden text-xs">
                          Qty SPPB
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            readOnly
                            className="bg-muted/50 text-muted-foreground h-9 text-center"
                            value={qtySppb}
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    {/* Row 3: Qty BAST (Editable) */}
                    <div className="md:col-span-1">
                      <Field>
                        <FieldLabel className="md:hidden text-xs">
                          Qty BAST
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            type="number"
                            min={1}
                            className="h-9 text-center"
                            {...register(`items.${index}.qtySerahTerima`, {
                              valueAsNumber: true,
                            })}
                          />
                          <FieldError
                            errors={[errors.items?.[index]?.qtySerahTerima]}
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    {/* Row 4: Harga Satuan */}
                    <div className="md:col-span-3">
                      <Field>
                        <FieldLabel className="md:hidden text-xs">
                          Harga Satuan
                        </FieldLabel>
                        <FieldContent>
                          <div className="flex gap-2">
                            <div className="relative w-full">
                              <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">
                                Rp
                              </span>
                              <Input
                                type="number"
                                min={0}
                                className="h-9 pl-8"
                                placeholder="0"
                                {...register(`items.${index}.hargaSatuan`, {
                                  valueAsNumber: true,
                                })}
                              />
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-primary"
                                    onClick={async () => {
                                      if (!field.barangId) return;
                                      try {
                                        const lastData =
                                          await getLastPurchasePrice(
                                            field.barangId
                                          );
                                        if (lastData && lastData.hargaSatuan) {
                                          setValue(
                                            `items.${index}.hargaSatuan`,
                                            Number(lastData.hargaSatuan),
                                            { shouldValidate: true }
                                          );
                                          const dateStr = lastData.tanggalBast
                                            ? new Date(
                                                lastData.tanggalBast
                                              ).toLocaleDateString('id-ID')
                                            : '-';
                                          toast.success(
                                            `Harga diset ke ${formatCurrency(
                                              Number(lastData.hargaSatuan)
                                            )} (BAST: ${dateStr})`
                                          );
                                        } else {
                                          toast.info(
                                            'Tidak ada riwayat harga pembelian untuk barang ini'
                                          );
                                        }
                                      } catch (error) {
                                        toast.error(
                                          'Gagal mengambil saran harga'
                                        );
                                      }
                                    }}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Ambil saran harga dari pembelian terakhir
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FieldError
                            errors={[errors.items?.[index]?.hargaSatuan]}
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    {/* Row 5: PPN */}
                    <div className="md:col-span-1">
                      <Field>
                        <FieldLabel className="md:hidden text-xs">
                          PPN (%)
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            className="h-9 text-center"
                            placeholder="0"
                            {...register(`items.${index}.persentasePpn`, {
                              valueAsNumber: true,
                            })}
                          />
                          <FieldError
                            errors={[errors.items?.[index]?.persentasePpn]}
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    {/* Row 6: Total */}
                    <div className="md:col-span-3 text-right">
                      <Field>
                        <FieldLabel className="md:hidden text-xs">
                          Total
                        </FieldLabel>
                        <FieldContent>
                          <div className="text-sm font-bold h-9 flex items-center justify-end">
                            Rp {total.toLocaleString('id-ID')}
                          </div>
                        </FieldContent>
                      </Field>
                    </div>

                    <div className="md:col-span-12 mt-2">
                      <Field>
                        <FieldContent>
                          <Input
                            className="h-8 text-xs"
                            placeholder="Keterangan item (opsional)..."
                            {...register(`items.${index}.keterangan`)}
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
