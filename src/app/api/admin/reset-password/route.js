import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminDb } from '@/lib/firebaseAdmin';

const CREDENTIALS_PATH = 'artifacts/portfolio-app/admin/credentials';
const MAX_ATTEMPTS = 5;

export async function POST(request) {
  try {
    const { code, newPassword } = await request.json();
    if (!code || !newPassword) {
      return NextResponse.json({ error: 'Code and new password are required' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const docRef = getAdminDb().doc(CREDENTIALS_PATH);
    const snap = await docRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'No password reset in progress' }, { status: 400 });
    }

    const { resetCodeHash, resetExpiresAt, resetAttempts = 0 } = snap.data();

    if (!resetCodeHash || !resetExpiresAt) {
      return NextResponse.json({ error: 'No password reset in progress' }, { status: 400 });
    }
    if (new Date(resetExpiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: 'This code has expired. Request a new one.' }, { status: 400 });
    }
    if (resetAttempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'Too many attempts. Request a new code.' }, { status: 429 });
    }

    const valid = await bcrypt.compare(code, resetCodeHash);
    if (!valid) {
      await docRef.set({ resetAttempts: resetAttempts + 1 }, { merge: true });
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await docRef.set({
      passwordHash,
      resetCodeHash: null,
      resetExpiresAt: null,
      resetAttempts: 0,
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reset-password error:', err);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
