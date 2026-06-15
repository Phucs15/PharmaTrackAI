/** Returns a shallow copy of `obj` containing only the given keys (when present). */
export function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});
}
