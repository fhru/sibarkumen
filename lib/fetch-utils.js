/**
 * Execute multiple async functions in parallel with error handling
 * @param {Array<Promise>} fetchers - Array of promises to execute
 * @returns {Promise<Array>} - Array of results (null for failed fetchers)
 */
export async function parallelFetch(fetchers) {
  const results = await Promise.allSettled(fetchers);
  return results.map(r => r.status === 'fulfilled' ? r.value : null);
}

/**
 * Execute multiple async functions in parallel, throw if any fails
 * @param {Array<Promise>} fetchers - Array of promises to execute
 * @returns {Promise<Array>} - Array of results
 */
export async function parallelFetchStrict(fetchers) {
  return await Promise.all(fetchers);
}

/**
 * Serialize Prisma Decimal fields to numbers
 * @param {Object} obj - Object with potential Decimal fields
 * @param {Array<string>} fields - Field names to convert
 * @returns {Object} - Object with converted fields
 */
export function serializeDecimals(obj, fields) {
  const result = { ...obj };
  for (const field of fields) {
    if (result[field] && typeof result[field].toNumber === 'function') {
      result[field] = result[field].toNumber();
    }
  }
  return result;
}
