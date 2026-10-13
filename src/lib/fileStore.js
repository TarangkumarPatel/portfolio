import { randomUUID } from 'crypto';
import { getAdminDb } from '@/lib/firebaseAdmin';

// Stores small binary files (profile photo, resume) in Firestore instead of Cloud Storage,
// so the project can stay on the free Spark plan. Firestore caps documents at ~1MiB, so each
// file is split into chunks. Chunks are written under a fresh version id before the metadata
// is switched over, so visitors never get a half-written file mid-upload.

const FILES_PATH = 'artifacts/portfolio-app/files';
const CHUNK_BYTES = 900 * 1024;

export async function saveFile(name, buffer, contentType) {
  const db = getAdminDb();
  const fileRef = db.collection(FILES_PATH).doc(name);
  const chunksRef = fileRef.collection('chunks');
  const version = randomUUID();

  const chunkCount = Math.max(1, Math.ceil(buffer.length / CHUNK_BYTES));
  await Promise.all(
    Array.from({ length: chunkCount }, (_, i) =>
      chunksRef.doc(`${version}-${i}`).set({
        version,
        index: i,
        data: buffer.subarray(i * CHUNK_BYTES, (i + 1) * CHUNK_BYTES),
      })
    )
  );

  await fileRef.set({ contentType, size: buffer.length, chunkCount, version, updatedAt: new Date().toISOString() });

  const stale = await chunksRef.where('version', '!=', version).get();
  await Promise.all(stale.docs.map(d => d.ref.delete()));

  return version;
}

export async function readFile(name) {
  const fileRef = getAdminDb().collection(FILES_PATH).doc(name);
  const meta = await fileRef.get();
  if (!meta.exists) return null;

  const { contentType, chunkCount, version } = meta.data();
  const chunks = await Promise.all(
    Array.from({ length: chunkCount }, (_, i) => fileRef.collection('chunks').doc(`${version}-${i}`).get())
  );
  if (chunks.some(c => !c.exists)) return null;

  return { contentType, buffer: Buffer.concat(chunks.map(c => Buffer.from(c.data().data))) };
}

export async function deleteFile(name) {
  const fileRef = getAdminDb().collection(FILES_PATH).doc(name);
  const chunks = await fileRef.collection('chunks').get();
  await Promise.all(chunks.docs.map(d => d.ref.delete()));
  await fileRef.delete();
}
