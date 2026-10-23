// Shared opaque-token encoding for cross-page Score Manager links
// (Score Sheet, Performance Analytics) — keeps subject/class/term ids out
// of the visible address bar. This is cosmetic, not a security boundary:
// every endpoint these ids eventually reach still enforces its own
// TeacherScopeService checks server-side regardless of how the id arrived.
export const encodeLinkParams = (params) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );
  return btoa(JSON.stringify(clean));
};

export const decodeLinkParams = (token) => {
  if (!token) return {};
  try {
    return JSON.parse(atob(token));
  } catch {
    return {};
  }
};
