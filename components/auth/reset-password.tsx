'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: ResetPasswordValues) {
    setIsLoading(true);
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      toast.error('Invalid or missing reset token.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await authClient.resetPassword({
        newPassword: data.password,
        token: token,
      });
      if (error) {
        toast.error(error.message || 'Something went wrong. Please try again.');
        // Optionally redirect to request reset again if token invalid
      } else {
        toast.success(
          'Password updated successfully. Please sign in with your new password.'
        );
        router.push('/sign-in');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="password">New Password</FieldLabel>
            <InputGroup className="w-full">
              <InputGroupInput
                id="password"
                type="password"
                placeholder="••••••••"
                {...form.register('password')}
              />
            </InputGroup>
            <FieldError errors={[form.formState.errors.password]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">
              Confirm New Password
            </FieldLabel>
            <InputGroup className="w-full">
              <InputGroupInput
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...form.register('confirmPassword')}
              />
            </InputGroup>
            <FieldError errors={[form.formState.errors.confirmPassword]} />
          </Field>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Update Password
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
