import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request) {
  return NextResponse.json({ authenticated: requireAdmin(request) });
}
