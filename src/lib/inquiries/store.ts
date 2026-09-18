import { createHash } from 'node:crypto';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { isMockDelivery } from './config';
export type RecordState = { fingerprint: string; done: boolean };
export interface InquiryStore {
  limit(identity: string): Promise<{ success: boolean; reset: number }>;
  get(id: string): Promise<RecordState | null>;
  create(id: string, value: RecordState): Promise<boolean>;
  complete(id: string, value: RecordState): Promise<void>;
  lock(id: string): Promise<boolean>;
  unlock(id: string): Promise<void>;
}
const ttl = 7 * 86400;
class RedisStore implements InquiryStore {
  private redis = Redis.fromEnv({ signal: () => AbortSignal.timeout(2500), retry: false });
  private limiter = new Ratelimit({ redis: this.redis, limiter: Ratelimit.slidingWindow(5, '15 m'), prefix: 'dm:rate', analytics: false, timeout: 4000 });
  async limit(identity: string) {
    const result = await this.limiter.limit(identity);
    // The SDK's timeout fallback can allow traffic; fail closed instead.
    if (result.reason === 'timeout') throw new Error('Rate limiter unavailable');
    return { success: result.success, reset: result.reset };
  }
  async get(id: string) { return this.redis.get<RecordState>(`dm:inquiry:${id}`); }
  async create(id: string, value: RecordState) { return (await this.redis.set(`dm:inquiry:${id}`, value, { nx: true, ex: ttl })) === 'OK'; }
  async complete(id: string, value: RecordState) { await this.redis.set(`dm:inquiry:${id}`, { ...value, done: true }, { ex: ttl }); }
  async lock(id: string) { return (await this.redis.set(`dm:lock:${id}`, 'locked', { nx: true, ex: 45 })) === 'OK'; }
  async unlock(id: string) { await this.redis.del(`dm:lock:${id}`); }
}
// Process memory is used ONLY for explicitly selected local mock delivery.
export class MockStore implements InquiryStore {
  private records = new Map<string, { value: RecordState; expires: number }>();
  private locks = new Map<string, number>();
  private limits = new Map<string, number[]>();
  async limit(identity: string) {
    const now = Date.now();
    const attempts = (this.limits.get(identity) || []).filter(t => t > now - 900000);
    const success = attempts.length < 5;
    if (success) attempts.push(now);
    this.limits.set(identity, attempts);
    return { success, reset: (attempts[0] || now) + 900000 };
  }
  async get(id: string) { const record = this.records.get(id); return record && record.expires > Date.now() ? record.value : null; }
  async create(id: string, value: RecordState) { if (await this.get(id)) return false; this.records.set(id, { value, expires: Date.now() + ttl * 1000 }); return true; }
  async complete(id: string, value: RecordState) { this.records.set(id, { value: { ...value, done: true }, expires: Date.now() + ttl * 1000 }); }
  async lock(id: string) { if ((this.locks.get(id) || 0) > Date.now()) return false; this.locks.set(id, Date.now() + 45000); return true; }
  async unlock(id: string) { this.locks.delete(id); }
}
let store: InquiryStore | undefined;
export function getStore() { return store ??= isMockDelivery() ? new MockStore() : new RedisStore(); }
export function fingerprint(value: unknown): string { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
