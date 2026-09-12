import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { RELATIONSHIP_OPTIONS } from '@/data/mockTestimonials';

const COLLECTION_PATH = 'artifacts/portfolio-app/public/data/testimonials';
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request) {
  const data = await request.json().catch(() => null);
  if (!data) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

  const { name, title, organization, relationship, message, email, linkedinUrl } = data;

  if (!name?.trim() || !title?.trim() || !organization?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Name, title, organization, and testimonial are required.' }, { status: 400 });
  }
  if (message.trim().length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: 'Testimonial is too long.' }, { status: 400 });
  }

  const doc = {
    name: name.trim().slice(0, 120),
    title: title.trim().slice(0, 150),
    organization: organization.trim().slice(0, 150),
    relationship: RELATIONSHIP_OPTIONS.includes(relationship) ? relationship : 'Other',
    message: message.trim().slice(0, MAX_MESSAGE_LENGTH),
    email: (email || '').trim().slice(0, 200),
    linkedinUrl: (linkedinUrl || '').trim().slice(0, 300),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const docRef = await getAdminDb().collection(COLLECTION_PATH).add(doc);
  return NextResponse.json({ id: docRef.id, success: true });
}
