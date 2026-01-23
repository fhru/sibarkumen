'use client';

import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AsyncSelect } from '@/components/ui/async-select';
import { Package, Plus, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchBarang } from '@/drizzle/actions/search';
import { BastMasukFormValues } from '../../../../lib/zod/bast-masuk-schema';
import { Textarea } from '@/components/ui/textarea';

interface BastMasukFormItemsProps {
  initialData?: any;
}

export function BastMasukFormItems({ initialData }: BastMasukFormItemsProps) {
  const {
    control,
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<BastMasukFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  return (
    <div className="space-y-8">
      {/* SECTION 3: Daftar Barang */}
      <div className="rounded-md border bg-background dark:bg-input/30 text-card-foreground shadow-none">
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Daftar Barang</h3>
          </div>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() =>
              append({
                barangId: 0,
                qty: 1,
                hargaSatuan: 0,
                keterangan: '',
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Barang
          </Button>
        </div>
        <div className="p-6 pt-2">
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/20 text-muted-foreground">
              <Package className="h-10 w-10 mb-3 opacity-20" />
              <p className="font-medium">Belum ada barang ditambahkan</p>
              <p className="text-xs">Klik "Tambah Barang" untuk memulai</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() =>
                  append({
                    barangId: 0,
                    qty: 1,
                    hargaSatuan: 0,
                    keterangan: '',
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Tambah Item
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header Labels (Desktop) */}
              <div className="hidden md:grid gap-4 md:grid-cols-12 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                <div className="md:col-span-4">
                  Barang <span className="text-destructive">*</span>
                </div>
                <div className="md:col-span-2">
                  Qty <span className="text-destructive">*</span>
                </div>
                <div className="md:col-span-2">Satuan</div>
                <div className="md:col-span-3">
                  Harga Satuan <span className="text-destructive">*</span>
                </div>
                <div className="md:col-span-1 text-center">Aksi</div>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative grid gap-4 rounded-lg border bg-muted/10 hover:bg-muted/30 transition-colors p-4 md:grid-cols-12 items-start group"
                >
                  {/* Row 1 */}
                  <div className="md:col-span-4">
                    <Controller
                      control={control}
                      name={`items.${index}.barangId`}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel className="md:hidden text-xs">
                            Barang
                          </FieldLabel>
                          <FieldContent>
                            <AsyncSelect
                              value={field.value}
                              onValueChange={field.onChange}
                              loadOptions={searchBarang}
                              placeholder="Pilih Barang"
                              searchPlaceholder="Cari barang..."
                              formatLabel={(option) =>
                                `${option.nama}${option.kodeBarang ? ` (${option.kodeBarang})` : ''}`
                              }
                              className="h-10 md:h-9"
                              initialOption={
                                initialData?.items?.[index]?.barang
                              }
                              onSelectOption={(option) => {
                                setValue(`items.${index}.qty`, 1);
                                if (option.satuanNama) {
                                  setValue(
                                    `items.${index}.satuanNama`,
                                    option.satuanNama
                                  );
                                }
                              }}
                            />
                            <FieldError
                              errors={[errors.items?.[index]?.barangId]}
                            />
                          </FieldContent>
                        </Field>
                      )}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Field>
                      <FieldLabel className="md:hidden text-xs">Qty</FieldLabel>
                      <FieldContent>
                        <Input
                          type="number"
                          min={1}
                          className="h-9"
                          placeholder="Qty"
                          {...register(`items.${index}.qty`, {
                            valueAsNumber: true,
                          })}
                        />
                        <FieldError errors={[errors.items?.[index]?.qty]} />
                      </FieldContent>
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center h-9 px-3 text-sm border rounded-md bg-muted text-muted-foreground">
                      <span
                        className={cn(
                          !watch(`items.${index}.satuanNama`) && 'opacity-50'
                        )}
                      >
                        {watch(`items.${index}.satuanNama`) || 'Unit'}
                      </span>
                      <input
                        type="hidden"
                        {...register(`items.${index}.satuanNama`)}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <Field>
                      <FieldLabel className="md:hidden text-xs">
                        Harga Satuan (Rp)
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          type="number"
                          min={0}
                          className="h-9"
                          placeholder="Harga"
                          {...register(`items.${index}.hargaSatuan`, {
                            valueAsNumber: true,
                          })}
                        />
                        <FieldError
                          errors={[errors.items?.[index]?.hargaSatuan]}
                        />
                      </FieldContent>
                    </Field>
                  </div>

                  {/* Delete Button */}
                  <div className="absolute right-2 top-2 z-10 md:static md:col-span-1 flex items-end justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => remove(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-background dark:bg-input/30 text-card-foreground shadow-none">
        <div className="p-6">
          <Field>
            <FieldLabel>Keterangan Tambahan/Catatan (Opsional)</FieldLabel>
            <FieldContent>
              <Textarea
                placeholder="Keterangan..."
                className="resize-none min-h-[100px]"
                {...register('keterangan')}
              />
              <FieldError errors={[errors.keterangan]} />
            </FieldContent>
          </Field>
        </div>
      </div>
    </div>
  );
}
