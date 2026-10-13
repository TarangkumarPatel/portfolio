import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';
import { saveFile } from '@/lib/fileStore';

const PROFILE_DOC_PATH = 'artifacts/portfolio-app/public/data/profile/main';

// Vercel rejects request bodies over 4.5MB before they reach this route.
const MAX_RESUME_BYTES = 4 * 1024 * 1024;

async function uploadFile(name, blob, contentType) {
  const buffer = Buffer.from(await blob.arrayBuffer());
  const version = await saveFile(name, buffer, contentType);
  return `/api/files/${name}?v=${version}`;
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const type = formData.get('type');
    const docRef = getAdminDb().doc(PROFILE_DOC_PATH);
    const update = { updatedAt: new Date().toISOString() };

    if (type === 'avatar') {
      const desktop = formData.get('desktop');
      const mobile = formData.get('mobile');
      if (!desktop || !mobile) {
        return NextResponse.json({ error: 'Both desktop and mobile crops are required' }, { status: 400 });
      }
      update.avatarDesktopUrl = await uploadFile('avatar-desktop.jpg', desktop, 'image/jpeg');
      update.avatarMobileUrl = await uploadFile('avatar-mobile.jpg', mobile, 'image/jpeg');
    } else if (type === 'resume') {
      const file = formData.get('file');
      if (!file || typeof file === 'string') {
        return NextResponse.json({ error: 'A PDF file is required' }, { status: 400 });
      }
      if (file.type && file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Resume must be a PDF file' }, { status: 400 });
      }
      if (file.size > MAX_RESUME_BYTES) {
        return NextResponse.json({ error: 'Resume must be under 4MB' }, { status: 400 });
      }
      update.resumeUrl = await uploadFile('resume.pdf', file, 'application/pdf');
    } else {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
    }

    await docRef.set(update, { merge: true });
    return NextResponse.json({ success: true, profile: update });
  } catch (err) {
    console.error('Profile upload error:', err);
    return NextResponse.json({ error: `Upload failed: ${err?.message || 'unknown error'}` }, { status: 500 });
  }
}
