import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

const COLLECTION_PATH = 'artifacts/portfolio-app/public/data/hobbies';

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const snap = await getAdminDb().collection(COLLECTION_PATH).get();
  const hobbies = snap.docs.map(d => ({ ...d.data(), id: d.id }));
  return NextResponse.json({ hobbies });
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.json();
  const docRef = await getAdminDb().collection(COLLECTION_PATH).add(data);
  return NextResponse.json({ id: docRef.id });
}
