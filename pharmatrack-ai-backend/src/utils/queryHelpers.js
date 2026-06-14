/** Escapes special regex characters so user search input is safe to use in a RegExp. */
export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Case-insensitive "contains" RegExp for a search query. */
export function searchRegex(value) {
  return new RegExp(escapeRegex(value), 'i');
}
