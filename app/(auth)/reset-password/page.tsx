import ResetPassword from '@/components/auth/reset-password';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Suspense>
        <ResetPassword />
      </Suspense>
    </div>
  );
}
