'use client';

import { Users, UserCheck, ShieldAlert } from 'lucide-react';

interface UserStatsProps {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
}

export function UserStats({
  totalUsers,
  activeUsers,
  bannedUsers,
}: UserStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total Users
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Users className="h-4 w-4 text-foreground" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {totalUsers}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pengguna terdaftar
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Active Users
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {activeUsers}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Pengguna aktif</p>
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-lg border bg-card p-6 transition-colors hover:border-foreground/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Banned Users
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {bannedUsers}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pengguna diblokir
          </p>
        </div>
      </div>
    </div>
  );
}
