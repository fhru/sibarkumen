'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import {
  createPegawaiJabatan,
  deletePegawaiJabatan,
  togglePegawaiJabatanStatus,
} from '@/drizzle/actions/pegawai-jabatan';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PegawaiJabatanManagerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  pegawai: {
    id: number;
    nama: string;
    pegawaiJabatan: {
      id: number;
      isAktif: boolean;
      jabatan: {
        id: number;
        nama: string;
      };
    }[];
  } | null;
  jabatanList: { id: number; nama: string }[];
}

export function PegawaiJabatanManager({
  open,
  setOpen,
  pegawai,
  jabatanList,
}: PegawaiJabatanManagerProps) {
  const [selectedJabatanId, setSelectedJabatanId] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const handleAddJabatan = () => {
    if (!pegawai || !selectedJabatanId) return;

    const formData = new FormData();
    formData.append('pegawaiId', pegawai.id.toString());
    formData.append('jabatanId', selectedJabatanId);
    formData.append('isAktif', 'true');

    startTransition(async () => {
      const result = await createPegawaiJabatan(null, formData);
      if (result.success) {
        toast.success(result.message);
        setSelectedJabatanId('');
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = (id: number) => {
    startTransition(async () => {
      const result = await deletePegawaiJabatan(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await togglePegawaiJabatanStatus(id, !currentStatus);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  if (!pegawai) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Kelola Jabatan Pegawai</DialogTitle>
          <DialogDescription>
            Atur riwayat jabatan untuk <strong>{pegawai.nama}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Jabatan */}
          <div className="flex items-end space-x-2 border-b pb-4">
            <div className="space-y-2 flex-1">
              <Label>Tambah Jabatan Baru</Label>
              <Select
                value={selectedJabatanId}
                onValueChange={setSelectedJabatanId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jabatan" />
                </SelectTrigger>
                <SelectContent>
                  {jabatanList
                    .filter(
                      (j) =>
                        !pegawai.pegawaiJabatan.some(
                          (pj) => pj.jabatan.id === j.id
                        )
                    )
                    .map((j) => (
                      <SelectItem key={j.id} value={j.id.toString()}>
                        {j.nama}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddJabatan}
              disabled={!selectedJabatanId || isPending}
            >
              <Plus className="mr-2 h-4 w-4" /> Tambah
            </Button>
          </div>

          {/* List Existing Jabatan */}
          <div className="space-y-2">
            <Label>Riwayat Jabatan</Label>
            <ScrollArea className="h-[200px] rounded-md border p-3">
              {pegawai.pegawaiJabatan.length === 0 ? (
                <div className="flex py-10 flex-col items-center justify-center text-muted-foreground text-sm">
                  <Briefcase className="h-8 w-8 mb-2 opacity-50" />
                  Belum ada jabatan yang ditetapkan.
                </div>
              ) : (
                <div className="space-y-3">
                  {pegawai.pegawaiJabatan.map((pj) => (
                    <div
                      key={pj.id}
                      className="flex items-center justify-between rounded-md shadow-sm border p-3"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{pj.jabatan.nama}</span>
                        <div className="flex items-center mt-1 space-x-2">
                          <Badge
                            variant={pj.isAktif ? 'default' : 'secondary'}
                            className="text-[10px]"
                          >
                            {pj.isAktif ? 'Aktif' : 'Tidak Aktif'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2 mr-2">
                          <Label
                            htmlFor={`status-${pj.id}`}
                            className="text-xs text-muted-foreground cursor-pointer"
                          >
                            {pj.isAktif ? 'Nonaktifkan' : 'Aktifkan'}
                          </Label>
                          <Switch
                            id={`status-${pj.id}`}
                            checked={pj.isAktif}
                            onCheckedChange={() =>
                              handleToggleStatus(pj.id, pj.isAktif)
                            }
                            disabled={isPending}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={() => handleDelete(pj.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
