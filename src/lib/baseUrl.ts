/**
 * Reduce DECISION_BASE_URL to the server root when it already ends with (part of) the
 * endpoint path, e.g. `http://host:8080/v1/systemone` or `http://host:8080/v1` with the
 * default `/v1/systemone` path. Otherwise the path would be appended twice.
 */
export function normalizeBaseUrl(raw: string, paths: string[]): string {
  const trimmed = raw.replace(/\/+$/, '');
  if (!trimmed) return '';
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return trimmed;
  }
  let pathname = url.pathname.replace(/\/+$/, '');
  for (const p of paths) {
    const segments = p.replace(/\/+$/, '').split('/').filter(Boolean);
    // Longest leading run of the endpoint path's segments that the base URL ends with.
    for (let n = segments.length; n > 0; n--) {
      const suffix = `/${segments.slice(0, n).join('/')}`;
      if (pathname === suffix || pathname.endsWith(suffix)) {
        pathname = pathname.slice(0, -suffix.length);
        return `${url.origin}${pathname}`;
      }
    }
  }
  return `${url.origin}${pathname}`;
}
