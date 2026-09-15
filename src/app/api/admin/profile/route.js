import { NextResponse } from 'next/server';
import { getAdminDb, getAdminBucket } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/adminAuth';

const PROFILE_DOC_PATH = 'artifacts/portfolio-app/public/data/profile/main';

async function uploadFile(bucket, path, blob, contentType) {
  const buffer = Buffer.from(await blob.arrayBuffer());
  const file = bucket.file(path);
  await file.save(buffer, { contentType, public: true, metadata: { cacheControl: 'public, max-age=31536000' } });
  return `https://storage.googleapis.com/${bucket.name}/${path}?v=${Date.now()}`;
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const type = formData.get('type');
    const bucket = getAdminBucket();
    const docRef = getAdminDb().doc(PROFILE_DOC_PATH);
    const update = { updatedAt: new Date().toISOString() };

    if (type === 'avatar') {
      const desktop = formData.get('desktop');
      const mobile = formData.get('mobile');
      if (!desktop || !mobile) {
        return NextResponse.json({ error: 'Both desktop and mobile crops are required' }, { status: 400 });
      }
      update.avatarDesktopUrl = await uploadFile(bucket, 'profile/avatar-desktop.jpg', desktop, 'image/jpeg');
      update.avatarMobileUrl = await uploadFile(bucket, 'profile/avatar-mobile.jpg', mobile, 'image/jpeg');
    } else if (type === 'resume') {
      const file = formData.get('file');
      if (!file) {
        return NextResponse.json({ error: 'A PDF file is required' }, { status: 400 });
      }
      update.resumeUrl = await uploadFile(bucket, 'profile/resume.pdf', file, 'application/pdf');
    } else {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 });
    }

    await docRef.set(update, { merge: true });
    return NextResponse.json({ success: true, profile: update });
  } catch (err) {
    console.error('Profile upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
