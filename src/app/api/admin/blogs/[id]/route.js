import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';
import { sanitizeBlog } from '@/lib/blogFields';

const COLLECTION_PATH = 'artifacts/portfolio-app/public/data/blogs';

export async function PUT(request, { params }) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const data = sanitizeBlog(await request.json());
  if (!data.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  if (!data.content.trim() && !data.externalUrl) {
    return NextResponse.json({ error: 'Add either the full content or an external link' }, { status: 400 });
  }
  await getAdminDb().collection(COLLECTION_PATH).doc(id).set(data, { merge: true });
  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await getAdminDb().collection(COLLECTION_PATH).doc(id).delete();
  return NextResponse.json({ success: true });
}
