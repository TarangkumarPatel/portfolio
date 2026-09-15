import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { getAdminDb } from '@/lib/firebaseAdmin';

const CREDENTIALS_PATH = 'artifacts/portfolio-app/admin/credentials';
const RESET_TTL_MS = 15 * 60 * 1000;
const COOLDOWN_MS = 60 * 1000;

export async function POST() {
  try {
    const { GMAIL_USER, GMAIL_APP_PASSWORD, ADMIN_NOTIFY_EMAIL } = process.env;
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !ADMIN_NOTIFY_EMAIL) {
      console.error('Forgot-password route is missing GMAIL_USER, GMAIL_APP_PASSWORD, or ADMIN_NOTIFY_EMAIL env vars.');
      return NextResponse.json({ error: 'Password reset is not configured' }, { status: 500 });
    }

    const docRef = getAdminDb().doc(CREDENTIALS_PATH);
    const snap = await docRef.get();
    const existing = snap.exists ? snap.data() : {};

    if (existing.resetRequestedAt && Date.now() - new Date(existing.resetRequestedAt).getTime() < COOLDOWN_MS) {
      return NextResponse.json({ error: 'A code was already sent recently. Please wait a minute and try again.' }, { status: 429 });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const resetCodeHash = await bcrypt.hash(code, 12);
    const resetExpiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString();

    await docRef.set({
      resetCodeHash,
      resetExpiresAt,
      resetAttempts: 0,
      resetRequestedAt: new Date().toISOString(),
    }, { merge: true });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });

    await transporter.sendMail({
      from: GMAIL_USER,
      to: ADMIN_NOTIFY_EMAIL,
      subject: 'Your admin panel password reset code',
      text: `Your password reset code is: ${code}\n\nThis code expires in 15 minutes. If you didn't request this, you can ignore this email.`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Forgot-password error:', err);
    return NextResponse.json({ error: 'Failed to send reset code' }, { status: 500 });
  }
}
