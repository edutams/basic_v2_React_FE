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
  const [guardian, setGuardian] = useState(null);

  // ── Fetch parent/guardian data for this student ──
  useEffect(() => {
    if (!open || !student) return;

    let cancelled = false;
    setGuardian(null);

    const fetchGuardian = async () => {
      try {
        const res = await learnerApi.getParents(student.student_reg_id);
        if (cancelled) return;
        const parentData = res.data?.data || res.data;
        if (parentData) {
          const parents = Array.isArray(parentData) ? parentData : [parentData];
          const p = parents[0];
          if (p) {
            setGuardian({
              name: p.name || p.guardian_name || p.full_name || null,
              phone: p.phone || p.guardian_phone || p.mobile || null,
              email: p.email || p.guardian_email || null,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch guardian:', error);
      }
    };

    fetchGuardian();

    return () => { cancelled = true; };
  }, [open, student]);

  if (!student) return null;

  const classArmDisplay =
    student.class_arm ||
    (student.class_name && student.arm_name
      ? `${student.class_name} (${student.arm_name})`
      : '—');

  // Use background-fetched guardian, fall back to student prop data
  const guardianName = guardian?.name || student.guardian_name || null;
  const guardianPhone = guardian?.phone || student.guardian_phone || null;
  const guardianEmail = guardian?.email || student.guardian_email || null;
  const hasGuardian = !!(guardianName || guardianPhone || guardianEmail);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Student Details</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={student.avatar}
              sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 20 }}
            >
              {(student.name || '?').charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {student.name}
              </Typography>
              <Chip
                label={student.admission_no || '—'}
                size="small"
                color="success"
                variant="outlined"
                sx={{ mt: 0.5, fontWeight: 600 }}
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
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
                Parent / Guardian
              </Typography>
              {guardianName && (
                <Typography variant="body2" fontWeight={600}>
                  {guardianName}
                </Typography>
              )}
              {guardianPhone && (
                <Typography variant="body2" color="text.secondary">
                  📞 {guardianPhone}
                </Typography>
              )}
              {guardianEmail && (
                <Typography variant="body2" color="text.secondary">
                  ✉️ {guardianEmail}
                </Typography>
              )}
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
