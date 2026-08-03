/**
 * permissionGrouping.js
 *
 * Helpers used by the ACL Manager modals to group permissions by their module
 * so they can be presented in readable sections (e.g. "ACL", "Organization").
 */

/**
 * Extract a module key from a permission object.
 * Prefers explicit fields, falls back to deriving it from the dotted name
 * (e.g. "landlord.acl.index" -> "landlord.acl").
 */
export const getPermissionModule = (permission = {}) => {
  if (permission?.module) return permission.module;
  if (permission?.module_name) return permission.module_name;
  if (permission?.group_name) return permission.group_name;

  const name = permission?.name || '';
  const parts = name.split('.');
  if (parts.length >= 2) return parts.slice(0, -1).join('.');

  return 'Other';
};

/** Human friendly module label, e.g. "landlord.acl" -> "Landlord Acl". */
export const prettifyModuleName = (moduleKey) => {
  if (!moduleKey) return 'Other';
  return String(moduleKey)
    .split(/[._-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Group an array of permissions into an array of
 * { module, permissions: [...] } buckets, sorted alphabetically.
 */
export const groupPermissionsByModule = (permissions = []) => {
  const groups = {};

  permissions.forEach((permission) => {
    const moduleKey = getPermissionModule(permission);
    if (!groups[moduleKey]) {
      groups[moduleKey] = { module: moduleKey, permissions: [] };
    }
    groups[moduleKey].permissions.push(permission);
  });

  return Object.values(groups).sort((a, b) => a.module.localeCompare(b.module));
};
