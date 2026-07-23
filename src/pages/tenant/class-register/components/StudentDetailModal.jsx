import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Box,
  Avatar,
  Typography,
  Chip,
} from '@mui/material';
import learnerApi from '@/api/tenant/learners/learnerApi';

const StudentDetailModal = ({ open, onClose, student }) => {
  const [guardians, setGuardians] = useState([]);

  // ── Fetch parent/guardian data for this student ──
  useEffect(() => {
    if (!open || !student) return;

    let cancelled = false;
    setGuardians([]);

    const fetchGuardians = async () => {
      try {
        // Use user_id if available, otherwise fall back to student_reg_id
        const learnerId = student.user_id || student.users?.id || student.student_reg_id;
        const res = await learnerApi.getParents(learnerId);
        if (cancelled) return;
        const parents = Array.isArray(res.data?.data) ? res.data.data : [];
        // Show up to 2 guardians
        const displayParents = parents.slice(0, 2).map((p) => {
          const u = p.user || {};
          const fullName = [u.fname, u.lname].filter(Boolean).join(' ');
          return {
            name: fullName || null,
            phone: u.phone || null,
            email: u.email || null,
            relationship: p.relationship || null,
          };
        });
        setGuardians(displayParents);
      } catch (error) {
        console.error('Failed to fetch guardians:', error);
      }
    };

    fetchGuardians();

    return () => { cancelled = true; };
  }, [open, student]);

  if (!student) return null;

  const classArmDisplay =
    student.class_arm ||
    (student.class_name && student.arm_name
      ? `${student.class_name} (${student.arm_name})`
      : '—');

  // Use background-fetched guardians, fall back to student prop data
  const hasGuardian = guardians.length > 0 || !!(student.guardian_name || student.guardian_phone || student.guardian_email);
  const fallbackGuardian = (student.guardian_name || student.guardian_phone || student.guardian_email)
    ? [{
      name: student.guardian_name || null,
      phone: student.guardian_phone || null,
      email: student.guardian_email || null,
      relationship: null,
    }]
    : [];
  const displayGuardians = guardians.length > 0 ? guardians : fallbackGuardian;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Student Details</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={student.avatar}
              sx={{ width: 56, height: 56, fontSize: 20 }}
            >
              {(student.name || '?').charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" color='primary' fontWeight={700}>
                {student.name}
              </Typography>
              <Chip
                label={student.admission_no || '—'}
                size="small"
                sx={{ mt: 0.5, fontWeight: 600, color: 'primary.main', bgcolor: 'primary.light' }}
              />
            </Box>
          </Box>
          <Typography variant="body2">
            <strong>Gender:</strong> {student.gender || '—'}
          </Typography>
          <Typography variant="body2">
            <strong>Current Class/Arm:</strong> {classArmDisplay}
          </Typography>

          {/* ── Guardian Section ───────────────────────────── */}
          {hasGuardian && (
            <Box
              sx={{
                mt: 1,
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'primary.light',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  mb: 1,
                  display: 'block',
                }}
              >
                {displayGuardians.length > 1 ? 'Parents / Guardians' : 'Parent / Guardian'}
              </Typography>

              {displayGuardians.map((g, i) => (
                <Box key={i} sx={{ mb: i < displayGuardians.length - 1 ? 1.5 : 0 }}>
                  {g.relationship && (
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                      {g.relationship}
                    </Typography>
                  )}
                  {g.name && (
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      {g.name}
                    </Typography>
                  )}
                  {(g.phone || g.email) && (
                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ mt: 0.25 }}>
                      {g.phone && (
                        <Typography variant="body2">📞 {g.phone}</Typography>
                      )}
                      {g.email && (
                        <Typography variant="body2" color="text.secondary">✉️ {g.email}</Typography>
                      )}
                    </Stack>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentDetailModal;
