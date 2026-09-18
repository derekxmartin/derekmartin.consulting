import { createHmac, timingSafeEqual } from 'node:crypto';
import { isMockDelivery } from './config';
export const receiptCookie = 'dm_inquiry_receipt';
export const receiptLifetime = 15 * 60;
type Receipt = { reference: string; expires: number; mock: boolean };
function secret() {
  if (isMockDelivery()) return 'local-development-receipt-secret-not-for-production';
  if ((process.env.RECEIPT_SIGNING_SECRET?.length ?? 0) < 32) throw new Error('Receipt configuration unavailable');
  return process.env.RECEIPT_SIGNING_SECRET!;
}
export function signReceipt(reference: string, mock: boolean, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ reference, mock, expires: now + receiptLifetime * 1000 })).toString('base64url');
  return `${payload}.${createHmac('sha256', secret()).update(payload).digest('base64url')}`;
}
export function verifyReceipt(value: string | undefined, now = Date.now()): Receipt | null {
  if (!value || value.length > 1024) return null;
  try {
    const parts = value.split('.');
    if (parts.length !== 2) return null;
    const expected = createHmac('sha256', secret()).update(parts[0]).digest();
    const signature = Buffer.from(parts[1], 'base64url');
    if (signature.length !== expected.length || !timingSafeEqual(expected, signature)) return null;
    const data: Receipt = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    if (typeof data.expires !== 'number' || data.expires <= now || data.expires > now + receiptLifetime * 1000 || !/^DM-[A-F0-9]{12}$/.test(data.reference) || typeof data.mock !== 'boolean') return null;
    if (data.mock && !isMockDelivery()) return null;
    return data;
  } catch { return null; }
}
