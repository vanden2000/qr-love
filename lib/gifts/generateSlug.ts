/**
 * Generates a cryptographically secure random slug.
 * Example: x8KaP2Lm (8-12 characters)
 */
export function generateSlug(length: number = 8): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const clampedLength = Math.max(8, Math.min(12, length));
  const array = new Uint8Array(clampedLength);
  crypto.getRandomValues(array);

  let slug = "";
  for (let i = 0; i < clampedLength; i++) {
    slug += chars[array[i] % chars.length];
  }

  return slug;
}
