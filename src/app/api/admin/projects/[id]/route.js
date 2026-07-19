import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

const COLLECTION_PATH = 'artifacts/portfolio-app/public/data/projects';

export async function PUT(request, { params }) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const data = await request.json();
  delete data.id;
  await getAdminDb().collection(COLLECTION_PATH).doc(id).set(data, { merge: true });
  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await getAdminDb().collection(COLLECTION_PATH).doc(id).delete();
  return NextResponse.json({ success: true });
}
