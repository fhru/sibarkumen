'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { banUser, unbanUser } from '@/drizzle/actions/users';
import { Textarea } from '@/components/ui/textarea';

interface UserDialogBanProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: { id: string; name: string; banned: boolean | null } | null;
}

export function UserDialogBan({ open, setOpen, user }: UserDialogBanProps) {
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleBan = () => {
    if (!user) return;
    startTransition(async () => {
      const result = await banUser(user.id, reason);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        setReason('');
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleUnban = () => {
    if (!user) return;
    startTransition(async () => {
      const result = await unbanUser(user.id);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user.banned ? 'Unban User' : 'Ban User'}</DialogTitle>
          <DialogDescription>
            {user.banned
              ? `Pulihkan akses untuk ${user.name}?`
              : `Batasi akses untuk ${user.name}. User tidak akan bisa login.`}
          </DialogDescription>
        </DialogHeader>

        {!user.banned && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Alasan Ban</Label>
              <Textarea
                id="reason"
                placeholder="Contoh: Melanggar ketentuan layanan..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          {user.banned ? (
            <Button onClick={handleUnban} disabled={isPending}>
              {isPending ? 'Memproses...' : 'Unban User'}
            </Button>
          ) : (
            <Button
              onClick={handleBan}
              disabled={isPending || !reason}
              variant="destructive"
            >
              {isPending ? 'Memproses...' : 'Ban User'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
