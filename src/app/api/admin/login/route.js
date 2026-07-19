import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { signAdminToken, ADMIN_COOKIE, ADMIN_COOKIE_OPTIONS } from '@/lib/adminAuth';

const CREDENTIALS_PATH = 'artifacts/portfolio-app/admin/credentials';

export async function POST(request) {
  try {
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const snap = await getAdminDb().doc(CREDENTIALS_PATH).get();
    if (!snap.exists) {
      console.error('Admin credentials document does not exist. Run the seed script first.');
      return NextResponse.json({ error: 'Admin account not set up' }, { status: 500 });
    }

    const { passwordHash } = snap.data();
    const valid = passwordHash && await bcrypt.compare(password, passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signAdminToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, token, ADMIN_COOKIE_OPTIONS);
    return response;
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
