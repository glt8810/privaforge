import type { AssociatedData } from './types.js';

const AAD_PREFIX = 'privaforge.v1';

/**
 * Serialises the associated-data struct to a canonical byte string.
 * AAD binds a ciphertext to its logical slot (user + resource + version) so
 * that swapping a blob into a different location causes GCM auth failure.
 *
 * Format: `privaforge.v1|<userId>|<resourceType>|<resourceId>|<version>`
 * Fields are joined with `|`. Fields must not contain `|` (userId and
 * resourceId are UUIDs; resourceType is an enum).
 */
export function serializeAAD(ad: AssociatedData): Uint8Array {
  for (const field of [ad.userId, ad.resourceId] as const) {
    if (field.includes('|')) {
      throw new Error(`AAD field contains reserved delimiter: ${field}`);
    }
  }
  const canonical = `${AAD_PREFIX}|${ad.userId}|${ad.resourceType}|${ad.resourceId}|${ad.version}`;
  return new TextEncoder().encode(canonical);
}
