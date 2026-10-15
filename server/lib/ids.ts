import { randomBytes } from 'node:crypto';

export function newId(prefix: string) {
  return `${prefix}_${randomBytes(9).toString('base64url')}`;
}
