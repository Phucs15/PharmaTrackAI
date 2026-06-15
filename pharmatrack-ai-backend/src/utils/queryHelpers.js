/** Escapes special regex characters so user search input is safe to use in a RegExp. */
export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Case-insensitive "contains" RegExp for a search query. */
export function searchRegex(value) {
  return new RegExp(escapeRegex(value), 'i');
}

/**
 * Opt-in pagination: when `page` and `limit` are both valid positive integers,
 * returns `{ data, pagination: { page, limit, total, totalPages } }`. Otherwise
 * returns `results` unchanged, preserving the existing "return all records" shape
 * for callers that don't request pagination.
 */
export function paginateResults(results, query = {}) {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);

  if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1) {
    return results;
  }

  const total = results.length;
  const start = (page - 1) * limit;

  return {
    data: results.slice(start, start + limit),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}
