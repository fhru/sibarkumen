'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AsyncSelect } from '@/components/ui/async-select';
import { searchPegawai } from '@/drizzle/actions/search';
import {
  CalendarIcon,
  Hash,
  User,
  Info,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { SPBFormValues } from '@/lib/zod/spb-schema';

import { Role } from '@/config/nav-items';
import { authClient } from '@/lib/auth-client';
import { useEffect } from 'react';

interface SPBFormDetailsProps {
  currentPegawai?: any;
}

export function SPBFormDetails({ currentPegawai }: SPBFormDetailsProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<SPBFormValues>();

  const session = authClient.useSession();
  const userRole = session.data?.user.role as Role | undefined;

  return (
    <div className="rounded-lg border bg-background dark:bg-input/30">
      <div className="flex items-center gap-2 p-6 pb-2">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Informasi Dokumen</h3>
      </div>

      {userRole === 'petugas' && !currentPegawai && (
        <div className="px-6 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Profil Belum Terhubung</AlertTitle>
            <AlertDescription>
              Akun Anda belum terhubung dengan data Pegawai. Silahkan
              hubungi Admin untuk melakukan klaim data pegawai agar dapat
              memproses SPB.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="p-6 pt-2 grid gap-6 md:grid-cols-2">
        {/* Nomor SPB - Visual Styling */}
        <Field>
          <FieldLabel htmlFor="nomorSpb" className="flex items-center gap-2">
            Nomor SPB
          </FieldLabel>
          <Controller
            control={control}
            name="nomorSpb"
            render={({ field }) => (
              <div className="relative">
                <Input
                  {...field}
                  id="nomorSpb"
                  placeholder="Auto-generated"
                  readOnly
                  className="bg-muted/40 font-mono text-muted-foreground border-dashed"
                />
              </div>
            )}
          />
        </Field>

        {/* Tanggal SPB */}
        <Field>
          <FieldLabel className="flex items-center gap-2">
            Tanggal Pengajuan <span className="text-destructive">*</span>
          </FieldLabel>
          <Controller
            control={control}
            name="tanggalSpb"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    {field.value ? (
                      format(field.value, 'dd MMMM yyyy', {
                        locale: localeId,
                      })
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
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          <FieldError errors={errors.tanggalSpb ? [errors.tanggalSpb] : []} />
        </Field>

        {/* Pemohon */}
        <Field>
          <FieldLabel className="flex items-center gap-2">
            Pemohon <span className="text-destructive">*</span>
          </FieldLabel>
          <Controller
            control={control}
            name="pemohonId"
            render={({ field }) =>
              userRole === 'petugas' ? (
                currentPegawai ? (
                  <Input
                    value={`${currentPegawai.nama} - ${currentPegawai.nip || 'No NIP'}`}
                    readOnly
                    className="bg-muted text-muted-foreground"
                  />
                ) : (
                  <Input
                    value="-"
                    readOnly
                    className="bg-muted text-muted-foreground"
                  />
                )
              ) : (
                <AsyncSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  loadOptions={searchPegawai}
                  placeholder="Cari nama pegawai..."
                  formatLabel={(option) => `${option.nama} (${option.nip})`}
                  disabled={userRole === ('petugas' as Role)}
                />
              )
            }
          />
          <FieldError errors={errors.pemohonId ? [errors.pemohonId] : []} />
        </Field>
      </div>
    </div>
  );
}
