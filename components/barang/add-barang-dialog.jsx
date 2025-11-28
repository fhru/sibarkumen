'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BarangForm } from './barang-form';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export function AddBarangDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Barang
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Barang Baru</DialogTitle>
          <DialogDescription>
            Masukkan detail barang inventaris baru.
          </DialogDescription>
        </DialogHeader>
        <BarangForm
          onSuccess={() => {
            setOpen(false);
            toast.success('Barang berhasil ditambahkan');
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
