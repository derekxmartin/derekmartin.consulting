import type { Submission } from './schema';
import type { InquiryStore } from './store';
import { fingerprint } from './store';
import { DeliveryError, type DeliveryAdapter } from './delivery';
export async function submitInquiry(submission: Submission, store: InquiryStore, adapter: DeliveryAdapter) {
  const id = submission.submissionId;
  const value = { fingerprint: fingerprint(submission), done: false };
  const existing = await store.get(id);
  if (existing && existing.fingerprint !== value.fingerprint) throw new DeliveryError('conflict');
  if (existing?.done) return { duplicate: true };
  if (!existing && !(await store.create(id, value))) throw new DeliveryError('uncertain');
  if (!(await store.lock(id))) throw new DeliveryError('uncertain');
  try {
    await adapter.send(submission);
    try { await store.complete(id, value); } catch { throw new DeliveryError('uncertain'); }
    return { duplicate: false };
  } finally { await store.unlock(id).catch(() => {}); }
}
