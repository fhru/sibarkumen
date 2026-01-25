import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import { admin } from 'better-auth/plugins';
import { sendEmail, renderEmailTemplate } from '@/lib/email';

const RESET_RATE_LIMIT_MAX = 20;
const RESET_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const resetRateLimitStore = new Map<
  string,
  { count: number; resetAt: number }
>();

function getClientIp(request: Request | undefined) {
  if (!request) return 'unknown';
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim();
  return ip || request.headers.get('x-real-ip') || 'unknown';
}

function checkResetRateLimit(ip: string) {
  const now = Date.now();
  const current = resetRateLimitStore.get(ip);
  if (!current || current.resetAt <= now) {
    resetRateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RESET_RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (current.count >= RESET_RATE_LIMIT_MAX) {
    return false;
  }

  current.count += 1;
  return true;
}

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    async sendResetPassword(data, request) {
      const clientIp = getClientIp(request);
      if (!checkResetRateLimit(clientIp)) {
        throw new Error('Reset password rate limit exceeded');
      }

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
  trustedOrigins: ['http://localhost:3000'],
});
