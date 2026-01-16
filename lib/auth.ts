import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import { admin } from 'better-auth/plugins';
import { sendEmail, renderEmailTemplate } from '@/lib/email';

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    async sendResetPassword(data, request) {
      // Send email to user
      await sendEmail({
        to: data.user.email,
        subject: 'Reset Password - Sibarkumen',
        html: renderEmailTemplate(
          'Reset Password',
          `
          <p>Halo <strong>${data.user.name || 'User'}</strong>,</p>
          <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Sibarkumen Anda. Jika Anda merasa tidak melakukan permintaan ini, silakan abaikan email ini.</p>
          <p>Untuk melanjutkan proses pengaturan ulang kata sandi, silakan klik tombol di bawah ini:</p>
          <div style="text-align: center;">
            <a href="${data.url}" class="button">Atur Ulang Kata Sandi</a>
          </div>
          <div class="divider"></div>
          <p style="font-size: 13px; color: #64748b;">
            Tautan ini akan kedaluwarsa dalam 1 jam. <br>
            Jika tombol tidak berfungsi, salin dan tempel tautan berikut ke browser Anda: <br>
            <span style="color: #3b82f6; word-break: break-all;">${
              data.url
            }</span>
          </p>
          `
        ),
      });
    },
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  plugins: [admin()],
});
