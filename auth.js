import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';
import prisma from '@/lib/prisma';
import { z } from 'zod';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ username: z.string().min(1), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data;
          const user = await prisma.user.findFirst({ where: { username } });

          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
             if (!user.isActive) {
                 throw new Error("Akun Non-Aktif.");
             }

             // Reset failed login attempts on successful login
             if (user.failedLoginAttempts > 0) {
               await prisma.user.update({
                 where: { id: user.id },
                 data: { failedLoginAttempts: 0, lastLogin: new Date() }
               });
             } else {
               await prisma.user.update({
                 where: { id: user.id },
                 data: { lastLogin: new Date() }
               });
             }

             return user;
          } else {
            // Increment failed login attempts
            await prisma.user.update({
              where: { id: user.id },
              data: { failedLoginAttempts: (user.failedLoginAttempts || 0) + 1 }
            });
          }
        }
        
        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
