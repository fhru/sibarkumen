'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Ensure the request is authorized as admin
async function checkAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session;
}

export async function banUser(userId: string, reason: string) {
  try {
    await checkAdmin();
    await auth.api.banUser({
      headers: await headers(),
      body: {
        userId,
        banReason: reason,
      },
    });

    revalidatePath('/dashboard/users');
    return { success: true, message: 'User berhasil dibanned' };
  } catch (error: any) {
    // Fallback if API call fails (e.g. self-ban protection caught by API)
    return {
      success: false,
      message: error.message || 'Gagal melakukan ban user',
    };
  }
}

export async function unbanUser(userId: string) {
  try {
    await checkAdmin();
    await auth.api.unbanUser({
      headers: await headers(),
      body: { userId },
    });

    revalidatePath('/dashboard/users');
    return { success: true, message: 'User berhasil di-unban' };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal melakukan unban user',
    };
  }
}

export async function setUserRole(userId: string, role: string) {
  try {
    await checkAdmin();
    await auth.api.setRole({
      headers: await headers(),
      body: {
        userId,
        role: role as any,
      },
    });

    revalidatePath('/dashboard/users');
    return { success: true, message: 'Role user berhasil diubah' };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Gagal mengubah role user',
    };
  }
}

export async function deleteUser(userId: string) {
  try {
    await checkAdmin();
    await auth.api.removeUser({
      headers: await headers(),
      body: {
        userId,
      },
    });

    revalidatePath('/dashboard/users');
    return { success: true, message: 'User berhasil dihapus' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal menghapus user' };
  }
}

import { createUserSchema, updateUserSchema } from '@/lib/zod/users';

export async function createUser(prevState: any, formData: FormData) {
  try {
    await checkAdmin();
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createUserSchema.parse(rawData);

    await auth.api.createUser({
      headers: await headers(),
      body: {
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name,
        role: (validatedData.role || 'user') as any,
      },
    });

    revalidatePath('/dashboard/users');
    return { success: true, message: 'User berhasil dibuat' };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validasi gagal',
        errors: error.flatten().fieldErrors,
      };
    }
    // Handle better-auth specific errors if needed
    return {
      success: false,
      message: error.message || 'Gagal membuat user',
    };
  }
}

export async function updateUser(prevState: any, formData: FormData) {
  try {
    await checkAdmin();
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = updateUserSchema.parse(rawData);

    // 1. Update Details (Name & Email - Email not editable here for safety/complexity, just name)
    // Using direct DB update to avoid type conflicts with auth.api.updateUser (which might be self-update)
    await db
      .update(user)
      .set({
        name: validatedData.name,
      })
      .where(eq(user.id, validatedData.id));

    // 2. Update Role
    await auth.api.setRole({
      headers: await headers(),
      body: {
        userId: validatedData.id,
        role: validatedData.role as any,
      },
    });

    // 3. Update Password if provided
    if (validatedData.password && validatedData.password.trim() !== '') {
      if (validatedData.password.length < 8) {
        throw new Error('Password baru minimal 8 karakter');
      }
      await auth.api.setUserPassword({
        headers: await headers(),
        body: {
          userId: validatedData.id,
          newPassword: validatedData.password,
        },
      });
    }

    revalidatePath('/dashboard/users');
    return { success: true, message: 'Data user berhasil diperbarui' };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validasi gagal',
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      message: error.message || 'Gagal memperbarui user',
    };
  }
}
