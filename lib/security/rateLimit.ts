import "server-only";
import { headers } from "next/headers";
import crypto from "crypto";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window rate limiter
const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale keys every 10 minutes
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredRecords() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    if (now >= record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Extracts and anonymizes the client IP address from request headers.
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const cfConnectingIp = headersList.get("cf-connecting-ip");

  const rawIp =
    cfConnectingIp ||
    realIp ||
    (forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1");

  // Hash IP address with SHA-256 for privacy compliance
  return crypto.createHash("sha256").update(rawIp).digest("hex").slice(0, 16);
}

/**
 * Server-side sliding window rate limit checker.
 * Default: Max 5 gifts per 1 hour (3600 seconds) per IP.
 */
export async function checkRateLimit(
  key: string,
  limit: number = 5,
  windowSeconds: number = 3600
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  cleanupExpiredRecords();

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = rateLimitStore.get(key);

  if (!existing || now >= existing.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, newRecord);
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: newRecord.resetTime,
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetTime: existing.resetTime,
  };
}
