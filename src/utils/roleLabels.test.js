import { describe, it, expect } from 'vitest';
import { hasRole, resolveStaffLabel, resolveUserLabel } from './roleLabels';

describe('hasRole', () => {
  it('matches plain string roles', () => {
    expect(hasRole(['bursar', 'user'], 'bursar')).toBe(true);
  });

  it('matches role objects with a name field', () => {
    expect(hasRole([{ name: 'bursar' }, { name: 'user' }], 'bursar')).toBe(true);
  });

  it('returns false when the role is absent or roles is not an array', () => {
    expect(hasRole(['user'], 'bursar')).toBe(false);
    expect(hasRole(null, 'bursar')).toBe(false);
    expect(hasRole(undefined, 'bursar')).toBe(false);
  });
});

describe('resolveStaffLabel', () => {
  it.each([
    ['super_admin', 'Super Admin'],
    ['school_admin', 'School Admin'],
    ['school_owner', 'School Owner'],
    ['school_head', 'School Head'],
    ['admission_officer', 'Admission Officer'],
    ['bursar', 'Bursar'],
    ['class_teacher', 'Class Teacher'],
    ['subject_teacher', 'Subject Teacher'],
  ])('resolves the "%s" role to "%s"', (role, label) => {
    expect(resolveStaffLabel({ roles: ['user', role], staffType: null })).toBe(label);
  });

  it('prefers an admin-tier role over any other role a staff member also holds', () => {
    expect(resolveStaffLabel({ roles: ['user', 'bursar', 'school_admin'] })).toBe('School Admin');
  });

  it('falls back to staff_type when no named role matches', () => {
    expect(resolveStaffLabel({ roles: ['user'], staffType: 'teaching' })).toBe('Teacher');
    expect(resolveStaffLabel({ roles: ['user'], staffType: 'non-teaching' })).toBe(
      'Non-Teaching Staff',
    );
  });

  it('falls back to a generic "Staff" label when nothing else matches', () => {
    expect(resolveStaffLabel({ roles: ['user'], staffType: null })).toBe('Staff');
    expect(resolveStaffLabel({ roles: [], staffType: undefined })).toBe('Staff');
  });
});

describe('resolveUserLabel', () => {
  it('labels parents and learners by user type, ignoring roles', () => {
    expect(resolveUserLabel({ userTypeId: 3, roles: ['user'] })).toBe('Parent');
    expect(resolveUserLabel({ userTypeId: 2, roles: ['user'] })).toBe('Learner');
  });

  it('resolves staff (user_type_id 1) through their roles', () => {
    expect(resolveUserLabel({ userTypeId: 1, roles: ['user', 'bursar'] })).toBe('Bursar');
  });

  it('returns null for an unknown user type', () => {
    expect(resolveUserLabel({ userTypeId: 99, roles: [] })).toBeNull();
  });
});
