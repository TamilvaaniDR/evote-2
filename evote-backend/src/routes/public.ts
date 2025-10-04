import express from 'express';
import nodemailer from 'nodemailer';
import { createRateLimit } from '../middleware/security';

const router = express.Router();

const contactLimiter = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  20, // max 20 requests per IP per window
  'Too many contact requests. Please try again later.'
);

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const service = process.env.EMAIL_SERVICE || 'gmail';
  if (!user || !pass) {
    const e: any = new Error('Email not configured');
    e.statusCode = 500;
    e.code = 'email_not_configured';
    throw e;
  }
  transporter = nodemailer.createTransport({
    service,
    auth: { user, pass },
  });
  return transporter;
}

router.post('/contact', contactLimiter, async (req, res, next) => {
  try {
    const { name, email, message } = req.body as { name?: string; email?: string; message?: string };
    if (!email || !message) {
      return res.status(400).json({ error: 'email and message are required' });
    }

    const toAddress = process.env.CONTACT_EMAIL || 'drtamilvaani2006@gmail.com';

    await getTransporter().sendMail({
      from: process.env.EMAIL_USER,
      to: toAddress,
      replyTo: email,
      subject: `[Contact] ${name ? name + ' - ' : ''}New message from website`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="margin:0 0 12px;">Website Contact</h2>
          <p><strong>From:</strong> ${name ? name + ' ' : ''}&lt;${email}&gt;</p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

export default router;


