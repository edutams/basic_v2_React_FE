const SAFE_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Open a URL in a new tab only if it's a well-formed http(s) URL.
 *
 * Tenant impersonation redirect URLs legitimately point at a different
 * origin on purpose (each school/reseller can have its own custom domain),
 * so this deliberately does NOT enforce same-origin — only that the URL
 * can't be a `javascript:`/`data:`/other dangerous-scheme injection.
 *
 * @returns {boolean} whether the window was opened.
 */
export function safeWindowOpen(url) {
  if (!url) return false;

  let parsed;
  try {
    parsed = new URL(url, window.location.origin);
  } catch {
    return false;
  }

  if (!SAFE_PROTOCOLS.has(parsed.protocol)) {
    return false;
  }

  window.open(url, '_blank');
  return true;
}
