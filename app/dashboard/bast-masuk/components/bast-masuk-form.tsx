'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldContent,
  FieldError,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createBastMasuk, updateBastMasuk } from '@/drizzle/actions/bast-masuk';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AsyncSelect } from '@/components/ui/async-select';
import {
  searchBarang,
  searchPegawai,
  searchPihakKetiga,
} from '@/drizzle/actions/search';

// Data Types
type Option = { id: number; nama: string };
type RekeningOption = Option & { namaBank: string; nomorRekening: string };

const bastMasukDetailSchema = z.object({
  barangId: z.number('Barang wajib dipilih').min(1, 'Barang wajib dipilih'),
  qtyKemasan: z.number('Qty minimal 1').min(1, 'Qty minimal 1'),
  satuanKemasanId: z
    .number('Satuan wajib dipilih')
    .min(1, 'Satuan wajib dipilih'),
  isiPerKemasan: z
    .number('Isi per kemasan minimal 1')
    .min(1, 'Isi per kemasan minimal 1'),
  hargaSatuan: z
    .number('Harga tidak boleh negatif')
    .min(0, 'Harga tidak boleh negatif'),
  keterangan: z.string().optional(),
});

const createBastMasukSchema = z.object({
  nomorReferensi: z.string().min(1, 'Nomor Referensi wajib diisi'),
  nomorBast: z.string().min(1, 'Nomor BAST wajib diisi'),
  tanggalBast: z.date('Tanggal BAST wajib diisi'),
  nomorBapb: z.string().min(1, 'Nomor BAPB wajib diisi'),
  tanggalBapb: z.date('Tanggal BAPB wajib diisi'),
  asalPembelianId: z
    .number('Asal pembelian wajib diisi')
    .min(1, 'Asal pembelian wajib dipilih'),
  rekeningId: z.number('Rekening wajib diisi').min(1, 'Rekening wajib dipilih'),
  pihakKetigaId: z
    .number('Pihak ketiga wajib diisi')
    .min(1, 'Pihak ketiga wajib dipilih'),
  pptkPpkId: z.number('PPTK/PPK wajib diisi').min(1, 'PPTK/PPK wajib dipilih'),
  peruntukkan: z.string().optional(),
  keterangan: z.string().optional(),
  items: z
    .array(bastMasukDetailSchema)
    .min(1, 'Minimal satu barang harus ditambahkan'),
});

type BastMasukFormValues = z.infer<typeof createBastMasukSchema>;

interface BastMasukFormProps {
  barangList?: Option[];
  satuanList: Option[];
  asalPembelianList: Option[];
  rekeningList: RekeningOption[];
  pihakKetigaList?: Option[];
  pegawaiList?: Option[];
  initialData?: any;
}

export function BastMasukForm({
  barangList,
  satuanList,
  asalPembelianList,
  rekeningList,
  pihakKetigaList,
  pegawaiList,
  initialData,
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
          qtyKemasan: item.qtyKemasan,
          satuanKemasanId: item.satuanKemasanId,
          isiPerKemasan: item.isiPerKemasan,
          hargaSatuan: Number(item.hargaSatuan),
          keterangan: item.keterangan || '',
        })),
      }
    : undefined;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<BastMasukFormValues>({
    resolver: zodResolver(createBastMasukSchema),
    defaultValues: defaultValues || {
      nomorReferensi: '',
      nomorBast: '',
      nomorBapb: '',
      peruntukkan: '',
      keterangan: '',
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: 'items',
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
  const watchItems = watch('items');
  const totalPrice =
    watchItems?.reduce((sum, item) => {
      return sum + (item.qtyKemasan || 0) * (item.hargaSatuan || 0);
    }, 0) || 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <FieldGroup className="grid gap-6 md:grid-cols-2">
        {/* Header Card 1: Informasi Dokumen */}
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Informasi Dokumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel>
                Nomor Referensi
                <span className="text-destructive -ml-1">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Nomor Referensi"
                  {...register('nomorReferensi')}
                />
                <FieldError errors={[errors.nomorReferensi]} />
              </FieldContent>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>
                  Nomor BAST
                  <span className="text-destructive -ml-1">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input placeholder="Nomor BAST" {...register('nomorBast')} />
                  <FieldError errors={[errors.nomorBast]} />
                </FieldContent>
              </Field>

              <Controller
                control={control}
                name="tanggalBast"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>
                      Tanggal BAST
                      <span className="text-destructive -ml-1">*</span>
                    </FieldLabel>
                    <FieldContent>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: id })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FieldError errors={[errors.tanggalBast]} />
                    </FieldContent>
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>
                  Nomor BAPB
                  <span className="text-destructive -ml-1">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input placeholder="Nomor BAPB" {...register('nomorBapb')} />
                  <FieldError errors={[errors.nomorBapb]} />
                </FieldContent>
              </Field>

              <Controller
                control={control}
                name="tanggalBapb"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>
                      Tanggal BAPB
                      <span className="text-destructive -ml-1">*</span>
                    </FieldLabel>
                    <FieldContent>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: id })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FieldError errors={[errors.tanggalBapb]} />
                    </FieldContent>
                  </Field>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Header Card 2: Informasi Pihak Terkait */}
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Informasi Pihak Terkait</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              control={control}
              name="asalPembelianId"
              render={({ field }) => (
                <Field>
                  <FieldLabel>
                    Asal Pembelian
                    <span className="text-destructive -ml-1">*</span>
                  </FieldLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FieldContent>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Asal Pembelian" />
                      </SelectTrigger>
                      <SelectContent>
                        {asalPembelianList.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                      <FieldError errors={[errors.asalPembelianId]} />
                    </FieldContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="pihakKetigaId"
              render={({ field }) => (
                <Field>
                  <FieldLabel>
                    Pihak Ketiga
                    <span className="text-destructive -ml-1">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <AsyncSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      loadOptions={searchPihakKetiga}
                      placeholder="Pilih Pihak Ketiga"
                      searchPlaceholder="Cari pihak ketiga..."
                      className="w-full"
                      initialOption={initialData?.pihakKetiga}
                    />
                    <FieldError errors={[errors.pihakKetigaId]} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="pptkPpkId"
              render={({ field }) => (
                <Field>
                  <FieldLabel>
                    PPTK / PPK
                    <span className="text-destructive -ml-1">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <AsyncSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      loadOptions={searchPegawai}
                      placeholder="Pilih Pegawai"
                      searchPlaceholder="Cari pegawai..."
                      formatLabel={(option) =>
                        `${option.nama} - ${option.nip || ''}`
                      }
                      className="w-full"
                      initialOption={initialData?.pptkPpk}
                    />
                    <FieldError errors={[errors.pptkPpkId]} />
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="rekeningId"
              render={({ field }) => (
                <Field>
                  <FieldLabel>
                    Rekening Belanja
                    <span className="text-destructive -ml-1">*</span>
                  </FieldLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FieldContent>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Rekening" />
                      </SelectTrigger>
                      <SelectContent>
                        {rekeningList.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.namaBank} - {item.nomorRekening} ({item.nama})
                          </SelectItem>
                        ))}
                      </SelectContent>
                      <FieldError errors={[errors.rekeningId]} />
                    </FieldContent>
                  </Select>
                </Field>
              )}
            />

            <Field>
              <FieldLabel>Peruntukkan</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Contoh: Operasional Kantor"
                  {...register('peruntukkan')}
                />
                <FieldError errors={[errors.peruntukkan]} />
              </FieldContent>
            </Field>
          </CardContent>
        </Card>
      </FieldGroup>

      <Card className="rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Barang</CardTitle>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              append({
                qtyKemasan: 1,
                isiPerKemasan: 1,
                hargaSatuan: 0,
              } as any)
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Barang
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative grid gap-4 rounded-lg border p-4 md:grid-cols-6 items-start"
            >
              {/* Row 1 */}
              <div className="md:col-span-2">
                <Controller
                  control={control}
                  name={`items.${index}.barangId`}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-xs">Barang</FieldLabel>
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
                          className="h-9"
                          initialOption={initialData?.items?.[index]?.barang}
                        />
                        <FieldError
                          errors={[errors.items?.[index]?.barangId]}
                        />
                      </FieldContent>
                    </Field>
                  )}
                />
              </div>
              <div>
                <Field>
                  <FieldLabel className="text-xs">Qty Kemasan</FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min={1}
                      className="h-9"
                      {...register(`items.${index}.qtyKemasan`, {
                        valueAsNumber: true,
                      })}
                    />
                    <FieldError errors={[errors.items?.[index]?.qtyKemasan]} />
                  </FieldContent>
                </Field>
              </div>
              <div>
                <Controller
                  control={control}
                  name={`items.${index}.satuanKemasanId`}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-xs">
                        Satuan (Box/Pcs)
                      </FieldLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FieldContent>
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue placeholder="Satuan" />
                          </SelectTrigger>
                          <SelectContent>
                            {satuanList.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id.toString()}
                              >
                                {item.nama}
                              </SelectItem>
                            ))}
                          </SelectContent>
                          <FieldError
                            errors={[errors.items?.[index]?.satuanKemasanId]}
                          />
                        </FieldContent>
                      </Select>
                    </Field>
                  )}
                />
              </div>
              <div>
                <Field>
                  <FieldLabel className="text-xs">Isi per Kemasan</FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min={1}
                      className="h-9"
                      {...register(`items.${index}.isiPerKemasan`, {
                        valueAsNumber: true,
                      })}
                    />
                    <FieldError
                      errors={[errors.items?.[index]?.isiPerKemasan]}
                    />
                  </FieldContent>
                </Field>
              </div>
              <div className="md:col-span-1">
                <Field>
                  <FieldLabel className="text-xs">Harga Satuan (Rp)</FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min={0}
                      className="h-9"
                      {...register(`items.${index}.hargaSatuan`, {
                        valueAsNumber: true,
                      })}
                    />
                    <FieldError errors={[errors.items?.[index]?.hargaSatuan]} />
                  </FieldContent>
                </Field>
              </div>

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-6 w-6 text-destructive hover:text-destructive/90 -mr-2 -mt-2 md:mr-2 md:mt-2"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex justify-end text-sm text-muted-foreground p-2 bg-muted rounded-md">
            Total Estimasi Nilai: Rp {totalPrice.toLocaleString('id-ID')}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardContent>
          <Field>
            <FieldLabel>Keterangan Tambahan/Catatan</FieldLabel>
            <FieldContent>
              <Textarea
                placeholder="Keterangan..."
                className="resize-none"
                {...register('keterangan')}
              />
              <FieldError errors={[errors.keterangan]} />
            </FieldContent>
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Menyimpan...'
            : isEdit
              ? 'Simpan Perubahan'
              : 'Simpan BAST Masuk'}
        </Button>
      </div>
    </form>
  );
}
