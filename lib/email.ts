import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const renderEmailTemplate = (title: string, contentHtml: string) => {
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f8fafc;
          color: #1e293b;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }
        .header {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-bottom: 8px;
        }
        .title {
          font-size: 18px;
          opacity: 0.9;
          font-weight: 400;
        }
        .content {
          padding: 40px;
          line-height: 1.6;
        }
        .footer {
          padding: 30px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
          border-top: 1px solid #f1f5f9;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: #ffffff !important;
          padding: 14px 28px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 24px;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
        }
        .divider {
          height: 1px;
          background: #f1f5f9;
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Sibarkumen</div>
          <div class="title">${title}</div>
        </div>
        <div class="content">
          ${contentHtml}
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Sibarkumen. All rights reserved.
          <br>
          Sistem Informasi Bersama.
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not defined. Email not sent.');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return;
    }

    return data;
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
