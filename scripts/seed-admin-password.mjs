// One-time setup: hashes your chosen admin password with bcrypt and stores
// it in Firestore. Run this locally whenever you want to set or change the
// admin password:
//
//   node scripts/seed-admin-password.mjs "your-new-password"
//
// Requires FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and
// FIREBASE_ADMIN_PRIVATE_KEY to already be set in .env.local.

import { readFileSync } from 'fs';
import bcrypt from 'bcryptjs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function loadEnvLocal() {
  const content = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
  const env = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/seed-admin-password.mjs "your-new-password"');
  process.exit(1);
}

const env = loadEnvLocal();
const projectId = env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY in .env.local');
  process.exit(1);
}

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore(app);

const passwordHash = await bcrypt.hash(password, 12);
await db.doc('artifacts/portfolio-app/admin/credentials').set({ passwordHash });

console.log('Admin password set successfully.');
process.exit(0);
