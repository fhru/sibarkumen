'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BarangForm } from './barang-form';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';

export function EditBarangDialog({ barang }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Barang</DialogTitle>
        </DialogHeader>
        <BarangForm
          initialData={barang}
          onSuccess={() => {
            setOpen(false);
            toast.success('Barang berhasil diperbarui');
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
