import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Avatar,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import classRegisterApi from '@/api/tenant/class-register/classRegisterApi';

/**
 * Lists the specific students flagged by classArmOverview's needs_attention
 * summary, with a reason chip per student — reuses getStudentsByClass (one
 * fetch covering the whole arm) rather than a new backend endpoint, since
 * the overview already knows exactly which ids are affected and why.
 */
const NeedsAttentionModal = ({ open, onClose, classArmId, sessionTermId, needsAttention, onViewStudent }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !classArmId) return;
    setLoading(true);
    classRegisterApi
      .getStudentsByClass('all', classArmId, { session_term_id: sessionTermId, per_page: 100 })
      .then((res) => {
        if (res.data?.status) {
          setStudents(res.data.data || []);
        }
      })
      .catch((err) => console.error('Failed to load affected students:', err))
      .finally(() => setLoading(false));
  }, [open, classArmId, sessionTermId]);

  const affectedIds = new Set(needsAttention?.affected_student_registration_ids || []);
  const affected = students.filter((s) => affectedIds.has(s.student_registration_id));

  const reasonsFor = (s) => {
    const reasons = [];
    if (s.profile_status === 'Incomplete') reasons.push({ label: 'Incomplete Profile', color: 'warning' });
    if (s.attendance_pct !== null && s.attendance_pct < (needsAttention?.low_attendance_threshold ?? 70)) {
      reasons.push({ label: 'Low Attendance', color: 'error' });
    }
    if ((s.profile_missing || []).includes('guardian')) reasons.push({ label: 'Missing Guardian', color: 'default' });
    return reasons;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Students Needing Attention</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Stack spacing={1.5}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={1.5}>
                <Skeleton variant="circular" width={36} height={36} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="50%" />
                  <Skeleton variant="text" width="35%" />
                </Box>
              </Stack>
            ))}
          </Stack>
        ) : affected.length === 0 ? (
          <Alert severity="success">No students currently need attention in this class arm.</Alert>
        ) : (
          <Stack spacing={1.5}>
            {affected.map((s) => (
              <Stack
                key={s.student_registration_id}
                direction="row"
                alignItems="center"
                spacing={1.5}
                onClick={() => onViewStudent?.(s)}
                sx={{ cursor: onViewStudent ? 'pointer' : 'default', '&:hover': { bgcolor: '#F9FAFB' }, p: 0.5, borderRadius: 1 }}
              >
                <Avatar src={s.avatar} sx={{ width: 36, height: 36 }}>
                  {(s.name || '?').charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {s.name}
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.25 }}>
                    {reasonsFor(s).map((r) => (
                      <Chip key={r.label} label={r.label} size="small" color={r.color} sx={{ height: 20, fontSize: 11 }} />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NeedsAttentionModal;
