'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function authenticate(prevState, formData) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

const RegisterSchema = z.object({
  username: z.string().min(4, 'Username minimal 4 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  fullName: z.string().min(1, 'Nama lengkap harus diisi'),
});

export async function register(prevState, formData) {
  const validatedFields = RegisterSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Register.',
    };
  }

  const { username, password, fullName } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findFirst({
      where: { username },
    });

    if (existingUser) {
        return {
            message: 'Username sudah digunakan.',
        };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        isActive: true,
      },
    });
    
  } catch (error) {
    return {
      message: 'Database Error: Failed to Register.',
    };
  }
  
  redirect('/login');
}
