// Every tenant user, staff included, carries the same base "user" role — so a
// role list alone never tells you what someone actually does. This resolves
// a human-readable label the same way SchoolDashboard.jsx picks which
// dashboard to render, so "who sees what dashboard" and "what the
// impersonation bar calls them" can never drift apart. Keep both in sync
// with any change here.

// user_type_id: 1 = Staff, 2 = Learner, 3 = Parent.
const USER_TYPE_LABELS = { 2: 'Learner', 3: 'Parent' };

// Checked in this order — matches SchoolDashboard.jsx's isAdmin /
// isAdmissionOfficer / isBursaryOfficer precedence.
const ADMIN_TIER_ROLE_LABELS = {
  super_admin: 'Super Admin',
  school_admin: 'School Admin',
  school_owner: 'School Owner',
  school_head: 'School Head',
};

const OTHER_ROLE_LABELS = {
  admission_officer: 'Admission Officer',
  bursar: 'Bursar',
  class_teacher: 'Class Teacher',
  subject_teacher: 'Subject Teacher',
};

export const hasRole = (roles, roleName) =>
  Array.isArray(roles) && roles.some((r) => (typeof r === 'string' ? r : r?.name) === roleName);

/**
 * Label for a staff member (user_type_id === 1) from their roles, falling
 * back to their staff_type, then a generic "Staff".
 */
export function resolveStaffLabel({ roles, staffType }) {
  for (const [role, label] of Object.entries(ADMIN_TIER_ROLE_LABELS)) {
    if (hasRole(roles, role)) return label;
  }
  for (const [role, label] of Object.entries(OTHER_ROLE_LABELS)) {
    if (hasRole(roles, role)) return label;
  }
  if (staffType === 'teaching') return 'Teacher';
  if (staffType === 'non-teaching') return 'Non-Teaching Staff';
  return 'Staff';
}

/**
 * Label for any tenant user — parents/learners keep their plain user type;
 * staff resolve through their roles (see resolveStaffLabel).
 */
export function resolveUserLabel({ userTypeId, roles, staffType }) {
  if (userTypeId === 1) return resolveStaffLabel({ roles, staffType });
  return USER_TYPE_LABELS[userTypeId] || null;
}
