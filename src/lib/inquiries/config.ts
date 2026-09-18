export function isMockDelivery(env: Record<string, string | undefined> = process.env): boolean {
  return env.INQUIRY_DELIVERY === 'mock' && env.NODE_ENV !== 'production' && env.VERCEL_ENV !== 'production';
}
export function deliveryConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return env.INQUIRY_DELIVERY === 'resend' && !!env.RESEND_API_KEY && !!env.CONTACT_FROM_EMAIL && !!env.CONTACT_TO_EMAIL &&
    (env.RECEIPT_SIGNING_SECRET?.length ?? 0) >= 32 && !!env.UPSTASH_REDIS_REST_URL && !!env.UPSTASH_REDIS_REST_TOKEN;
}

export function allowedOrigin(request: Request): boolean {
  const candidate = request.headers.get('origin');
  if (!candidate) return false;
  const allowed = new Set([process.env.SITE_URL || 'https://derekmartin.consulting']);
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) allowed.add(`https://${process.env.VERCEL_URL}`);
  if (process.env.NODE_ENV === 'development') {
    const port = new URL(request.url).port;
    for (const host of ['localhost', '127.0.0.1']) allowed.add(`http://${host}${port ? `:${port}` : ''}`);
  }
  return allowed.has(candidate);
}
