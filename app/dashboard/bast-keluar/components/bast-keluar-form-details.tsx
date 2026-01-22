"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AsyncSelect } from "@/components/ui/async-select";
import { Textarea } from "@/components/ui/textarea";
import { searchPegawai } from "@/drizzle/actions/search";
import { CalendarIcon, FileText, Building2, Info } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BastKeluarFormValues } from "@/lib/zod/bast-keluar-schema";

interface BastKeluarFormDetailsProps {
  completedSPPBs: any[];
  isEdit?: boolean;
  initialData?: any;
  selectedSPPB?: any;
}

export function BastKeluarFormDetails({
  completedSPPBs,
  isEdit,
  initialData,
  selectedSPPB,
}: BastKeluarFormDetailsProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<BastKeluarFormValues>();

  const pihakKeduaInitialOption = selectedSPPB?.spb?.pemohon
    ? {
        id: selectedSPPB.spb.pemohon.id,
        nama: selectedSPPB.spb.pemohon.nama,
        nip: selectedSPPB.spb.pemohon.nip,
      }
    : initialData?.pihakKedua;

  return (
    <div className="space-y-8">
      {/* SECTION 1: Informasi Dokumen */}
      <div className="rounded-lg border bg-background dark:bg-input/30">
        <div className="flex items-center gap-2 p-6 pb-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Informasi Dokumen</h3>
        </div>

        <div className="p-6 pt-2 grid gap-6 md:grid-cols-2">
          {/* SPPB Selection */}
          <Controller
            control={control}
            name="sppbId"
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  Pilih SPPB
                  <span className="text-destructive -ml-1">*</span>
                </FieldLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString()}
                  disabled={isEdit}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih SPPB" />
                  </SelectTrigger>
                  <SelectContent>
                    {completedSPPBs.map((sppb) => (
                      <SelectItem key={sppb.id} value={sppb.id.toString()}>
                        {sppb.nomorSppb} -{" "}
                        {format(new Date(sppb.tanggalSppb), "dd MMM yyyy", {
                          locale: localeId,
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.sppbId]} />
              </Field>
            )}
          />

          {/* Tanggal BAST */}
          <Controller
            control={control}
            name="tanggalBast"
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  Tanggal BAST
                  <span className="text-destructive -ml-1">*</span>
                </FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: localeId })
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
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FieldError errors={[errors.tanggalBast]} />
              </Field>
            )}
          />
        </div>
      </div>

      {/* SECTION 2: Pihak Terkait */}
      <div className="rounded-lg border bg-background dark:bg-input/30">
        <div className="flex items-center gap-2 p-6 pb-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Pihak Terkait</h3>
        </div>

        <div className="p-6 pt-2 grid gap-6 md:grid-cols-2">
          {/* Pihak Pertama */}
          <Controller
            control={control}
            name="pihakPertamaId"
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  Pihak Pertama (Yang Menyerahkan)
                  <span className="text-destructive -ml-1">*</span>
                </FieldLabel>
                <AsyncSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  loadOptions={searchPegawai}
                  placeholder="Pilih Pegawai"
                  searchPlaceholder="Cari pegawai..."
                  formatLabel={(option) =>
                    `${option.nama} - ${option.nip || ""}`
                  }
                  className="w-full"
                  initialOption={initialData?.pihakPertama}
                />
                <FieldError errors={[errors.pihakPertamaId]} />
              </Field>
            )}
          />

          {/* Pihak Kedua */}
          <Controller
            control={control}
            name="pihakKeduaId"
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  Pihak Kedua (Yang Menerima)
                  <span className="text-destructive -ml-1">*</span>
                </FieldLabel>
                <AsyncSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  loadOptions={searchPegawai}
                  placeholder="Pilih Pegawai"
                  searchPlaceholder="Cari pegawai..."
                  formatLabel={(option) =>
                    `${option.nama} - ${option.nip || ""}`
                  }
                  className="w-full"
                  initialOption={pihakKeduaInitialOption}
                />
                <FieldError errors={[errors.pihakKeduaId]} />
              </Field>
            )}
          />
        </div>
      </div>

      {/* SECTION 3: Keterangan */}
      <div className="rounded-lg border bg-background dark:bg-input/30">
        <div className="flex items-center gap-2 p-6 pb-2">
          <Info className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Keterangan Tambahan</h3>
        </div>

        <div className="p-6 pt-2">
          <Field>
            <Controller
              control={control}
              name="keterangan"
              render={({ field }) => (
                <Textarea
                  placeholder="Tulis keterangan disini..."
                  className="resize-none min-h-25"
                  {...field}
                  value={field.value || ""}
                />
              )}
            />
            <FieldError errors={[errors.keterangan]} />
          </Field>
        </div>
      </div>
    </div>
  );
}
