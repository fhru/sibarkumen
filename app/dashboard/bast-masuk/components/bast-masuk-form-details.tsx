'use client';

import { Controller, useFormContext } from 'react-hook-form';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { AsyncSelect } from '@/components/ui/async-select';
import { CalendarIcon, FileText, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { searchPegawai, searchPihakKetiga } from '@/drizzle/actions/search';
import {
  BastMasukFormValues,
  Option,
  RekeningOption,
} from '../../../../lib/zod/bast-masuk-schema';

interface BastMasukFormDetailsProps {
  asalPembelianList: Option[];
  rekeningList: RekeningOption[];
  initialData?: any;
}

export function BastMasukFormDetails({
  asalPembelianList,
  rekeningList,
  initialData,
}: BastMasukFormDetailsProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<BastMasukFormValues>();

  return (
    <div className="space-y-8">
      {/* SECTION 1: Informasi Dasar */}
      <div className="rounded-md border bg-background dark:bg-input/30 text-card-foreground shadow-none">
        <div className="flex items-center gap-2 p-6 pb-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Informasi Dokumen</h3>
        </div>
        <div className="p-6 pt-2">
          <FieldGroup className="grid gap-6 md:grid-cols-2">
            <Field>
              <FieldLabel>Nomor Referensi</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Nomor Referensi (Otomatis)"
                  {...register('nomorReferensi')}
                  readOnly
                  className="border-dashed bg-muted/50 cursor-not-allowed text-muted-foreground"
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
                              'w-full pl-3 text-left font-normal',
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
                              'w-full pl-3 text-left font-normal',
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

            <Field>
              <FieldLabel>Peruntukkan (Opsional)</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Contoh: Operasional Kantor"
                  {...register('peruntukkan')}
                />
                <FieldError errors={[errors.peruntukkan]} />
              </FieldContent>
            </Field>
          </FieldGroup>
        </div>
      </div>

      {/* SECTION 2: Pihak Terkait */}
      <div className="rounded-md border bg-background dark:bg-input/30 text-card-foreground shadow-none">
        <div className="flex items-center gap-2 p-6 pb-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Pihak Terkait</h3>
        </div>
        <div className="p-6 pt-2 space-y-4">
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

          <div className="grid gap-4 md:grid-cols-2">
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
                      placeholder="Pilih Petugas"
                      searchPlaceholder="Cari petugas..."
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
          </div>

          <Controller
            control={control}
            name="rekeningId"
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  Kode Rekening
                  <span className="text-destructive -ml-1">*</span>
                </FieldLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString()}
                >
                  <FieldContent>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Kode Rekening" />
                    </SelectTrigger>
                    <SelectContent>
                      {rekeningList.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.kode} - {item.uraian}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    <FieldError errors={[errors.rekeningId]} />
                  </FieldContent>
                </Select>
              </Field>
            )}
          />
        </div>
      </div>
    </div>
  );
}
