import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

const TOLERANCE_SECONDS = 5 * 60;

// Codeverity-Signature: t=<unix time>,v1=<hex>, where hex is
// HMAC-SHA256("<t>.<raw body>") keyed with the endpoint's signing secret.
export function verifySignature(header: string | null, rawBody: string, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const i = p.indexOf('=');
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    }),
  );
  const timestamp = Number(parts.t);
  if (!Number.isInteger(timestamp) || !parts.v1) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > TOLERANCE_SECONDS) return false;

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest();
  const actual = Buffer.from(parts.v1, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
