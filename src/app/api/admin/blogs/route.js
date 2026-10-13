import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';
import { sanitizeBlog } from '@/lib/blogFields';

const COLLECTION_PATH = 'artifacts/portfolio-app/public/data/blogs';

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const snap = await getAdminDb().collection(COLLECTION_PATH).get();
  const blogs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
  return NextResponse.json({ blogs });
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = sanitizeBlog(await request.json());
  if (!data.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  if (!data.content.trim() && !data.externalUrl) {
    return NextResponse.json({ error: 'Add either the full content or an external link' }, { status: 400 });
  }
  const docRef = await getAdminDb().collection(COLLECTION_PATH).add({ ...data, createdAt: data.updatedAt });
  return NextResponse.json({ id: docRef.id });
}
