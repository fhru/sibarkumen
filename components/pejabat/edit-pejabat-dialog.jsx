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
import { Pencil } from 'lucide-react';

export function EditPejabatDialog({ pejabat }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Pejabat Pengelola</DialogTitle>
        </DialogHeader>
        <PejabatForm initialData={pejabat} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
