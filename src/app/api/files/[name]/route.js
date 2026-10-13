import { NextResponse } from 'next/server';
import { readFile } from '@/lib/fileStore';

// Only these files are served publicly; anything else in the store stays private.
const PUBLIC_FILES = {
  'avatar-desktop.jpg': {},
  'avatar-mobile.jpg': {},
  'resume.pdf': { disposition: 'inline; filename="Tarangkumar_Patel_Resume.pdf"' },
};

export async function GET(request, { params }) {
  const { name } = await params;
  const config = PUBLIC_FILES[name];
  if (!config) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const file = await readFile(name);
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const headers = {
    'Content-Type': file.contentType,
    'Content-Length': String(file.buffer.length),
    // Upload URLs carry a ?v=<version>, so each version can be cached indefinitely.
    'Cache-Control': 'public, max-age=31536000, immutable',
  };
  if (config.disposition) headers['Content-Disposition'] = config.disposition;

  return new NextResponse(file.buffer, { headers });
}
