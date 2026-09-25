// Small in-memory rate limiter for auth endpoints. Counts attempts per key within a
// sliding window. State lives in this server process only, which is enough to slow
// down automated sign-up or password guessing on a single instance.

const buckets = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    const retryAfterSec = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
    buckets.set(key, recent);
    return { ok: false, retryAfterSec };
  }
  recent.push(now);
  buckets.set(key, recent);
  // Keep the map from growing without bound.
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
  }
  return { ok: true, retryAfterSec: 0 };
}

/** Best-effort client address from proxy headers; "local" when running without a proxy. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "local";
}
