import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  role: z.string().optional(),
});

export const updateUserSchema = z.object({
  id: z.string().min(1, 'ID User wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  role: z.string().min(1, 'Role wajib diisi'),
  password: z.string().optional(),
});
