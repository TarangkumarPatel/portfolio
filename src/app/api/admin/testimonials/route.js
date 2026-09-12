import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

const COLLECTION_PATH = 'artifacts/portfolio-app/public/data/testimonials';

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const snap = await getAdminDb().collection(COLLECTION_PATH).get();
  const testimonials = snap.docs
    .map(d => ({ ...d.data(), id: d.id }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return NextResponse.json({ testimonials });
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  const docRef = await getAdminDb().collection(COLLECTION_PATH).add({
    status: 'approved',
    createdAt: new Date().toISOString(),
    ...data,
  });
  return NextResponse.json({ id: docRef.id });
}
