/**
 * Determine if a given string is a valid URL with the HTTP or HTTPS scheme
 * @export
 * @param {string} str
 * @return {boolean}
 */
export function isStringUrl(str: string) {
  let url;
  try {
    url = new URL(str);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}
