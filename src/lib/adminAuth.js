import jwt from 'jsonwebtoken';

export const ADMIN_COOKIE = 'admin_session';
const SESSION_TTL = '12h';
const SESSION_MAX_AGE_S = 60 * 60 * 12;

export function signAdminToken() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured.');
  return jwt.sign({ role: 'admin' }, secret, { expiresIn: SESSION_TTL });
}

export function isValidAdminToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret || !token) return false;
  try {
    const payload = jwt.verify(token, secret);
    return payload?.role === 'admin';
  } catch {
    return false;
  }
}

export function requireAdmin(request) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return isValidAdminToken(token);
}

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_MAX_AGE_S,
};
