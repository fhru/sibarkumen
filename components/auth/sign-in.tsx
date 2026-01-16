'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Eye, EyeOff, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

import { signInSchema, type SignInValues } from '@/lib/zod/auth';
import { authClient } from '@/lib/auth-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@/components/ui/input-group';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onChange',
  });

  const { isValid, isSubmitting } = form.formState;

  async function onSubmit(data: SignInValues) {
    setLoading(true);
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      },
      {
        onSuccess: () => {
          router.push('/');
          toast.success('Signed in successfully');
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setLoading(false);
        },
      }
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-col items-center">
        <div className="flex justify-center mb-4 cursor-pointer">
          <Image
            src="/logo.png"
            alt="Sibarkumen Logo"
            width={64}
            height={64}
            className="h-12"
            draggable={false}
            onClick={() => router.push('/')}
          />
        </div>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Enter your email and password to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <div className="flex-1">
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription className="text-destructive-foreground">
                {error}
              </AlertDescription>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-destructive-foreground hover:opacity-75"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </button>
          </Alert>
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <InputGroup className="w-full">
              <InputGroupInput
                id="email"
                type="email"
                placeholder="m@example.com"
                {...form.register('email')}
              />
            </InputGroup>
            <FieldError errors={[form.formState.errors.email]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <InputGroup className="w-full">
              <InputGroupInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...form.register('password')}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={[form.formState.errors.password]} />
          </Field>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Controller
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </Label>
                  </div>
                )}
              />
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !isValid}
          >
            {loading ? <Loader2 className="animate-spin mr-2 size-4" /> : null}
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
