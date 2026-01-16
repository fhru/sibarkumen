'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

import { signUpSchema, type SignUpValues } from '@/lib/zod/auth';
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

export function SignUp() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const { isValid } = form.formState;

  async function onSubmit(data: SignUpValues) {
    setLoading(true);
    await authClient.signUp.email(
      {
        email: data.email,
        password: data.password,
        name: data.name,
      },
      {
        onSuccess: () => {
          toast.success('Account created successfully');
          router.push('/sign-in');
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
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
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <InputGroup className="w-full">
              <InputGroupInput
                id="name"
                type="text"
                placeholder="John Doe"
                {...form.register('name')}
              />
            </InputGroup>
            <FieldError errors={[form.formState.errors.name]} />
          </Field>
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
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <InputGroup className="w-full">
              <InputGroupInput
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...form.register('confirmPassword')}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={[form.formState.errors.confirmPassword]} />
          </Field>
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !isValid}
          >
            {loading ? <Loader2 className="animate-spin mr-2 size-4" /> : null}
            Sign Up
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/sign-in" className="text-primary hover:underline ml-1">
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
