import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

const COLLECTION_PATH = 'artifacts/portfolio-app/public/data/messages';

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const snap = await getAdminDb().collection(COLLECTION_PATH).get();
  const messages = snap.docs
    .map(d => ({ ...d.data(), id: d.id }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return NextResponse.json({ messages });
}
