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
import { PejabatForm } from './pejabat-form';
import { Plus } from 'lucide-react';

export function AddPejabatDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pejabat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tambah Pejabat Pengelola</DialogTitle>
        </DialogHeader>
        <PejabatForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
