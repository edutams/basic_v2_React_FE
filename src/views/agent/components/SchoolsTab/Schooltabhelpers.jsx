import React from 'react';
import { Chip } from '@mui/material';

// ── Status config ─────────────────────────────────────────────────────────────

export const statusConfig = {
  active: { bg: '#dcfce7', color: '#16a34a', label: 'active' },
  Active: { bg: '#dcfce7', color: '#16a34a', label: 'Active' },
  inactive: { bg: '#ffe4e6', color: '#e11d48', label: 'Inactive' },
  Inactive: { bg: '#ffe4e6', color: '#e11d48', label: 'Inactive' },
  pending: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  approved: { bg: '#dcfce7', color: '#16a34a', label: 'Approved' },
  rejected: { bg: '#ffe4e6', color: '#e11d48', label: 'Rejected' },
};

export const StatusChip = ({ status }) => {
  const s = statusConfig[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
  return (
    <Chip
      size="small"
      label={s.label}
      sx={{
        bgcolor: s.bg,
        color: s.color,
        fontWeight: 600,
        borderRadius: '6px',
        // textTransform: 'capitalize',
        fontSize: '11px',
      }}
    />
  );
};

// ── Contact helpers ───────────────────────────────────────────────────────────

export const getSpaContact = (row) => {
  const spa = row?.administrator_info?.school_spa;
  if (spa)
    return {
      name: `${spa.admin_first_name || ''} ${spa.admin_last_name || ''}`.trim(),
      email: spa.admin_email || '—',
      phone: spa.admin_phone || '—',
      image: spa.admin_image || '',
    };
  return {
    name: `${row?.admin_fname || ''} ${row?.admin_lname || ''}`.trim() || '—',
    email: row?.admin_email || '—',
    phone: row?.admin_phone || '—',
    image: '',
  };
};

export const getOwnerContact = (row) => {
  const owner = row?.administrator_info?.school_owner;
  if (owner)
    return {
      name: `${owner.school_owner_first_name || ''} ${owner.school_owner_last_name || ''}`.trim(),
      email: owner.school_owner_email || '—',
      phone: owner.school_owner_phone || '—',
      gender: owner.school_owner_gender || '',
      image: owner.school_owner_image || '',
    };
  return {
    name: `${row?.owner_fname || ''} ${row?.owner_lname || ''}`.trim() || '—',
    email: row?.owner_email || '—',
    phone: row?.owner_phone || '—',
    gender: '',
    image: '',
  };
};

export const getHeadContact = (row) => {
  const head = row?.administrator_info?.school_head;
  if (head)
    return {
      name: `${head.school_head_first_name || ''} ${head.school_head_last_name || ''}`.trim(),
      email: head.school_head_email || '—',
      phone: head.school_head_phone || '—',
      gender: head.school_head_gender || '',
      image: head.school_head_image || '',
    };
  return { name: '—', email: '—', phone: '—', gender: '', image: '' };
};

export const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
