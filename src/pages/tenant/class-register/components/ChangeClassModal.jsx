import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Box,
} from '@mui/material';
import { SwapHoriz as ChangeClassIcon } from '@mui/icons-material';
import classRegisterApi from '@/api/tenant/class-register/classRegisterApi';

const ChangeClassModal = ({ open, onClose, student, onSuccess }) => {
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [selectedArmId, setSelectedArmId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── Load all classes with their arm breakdowns ────────────
  useEffect(() => {
    if (!open) return;

    const loadEnrollmentData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await classRegisterApi.getClassEnrollmentBreakdown();
        if (res.data?.status && res.data?.data) {
          setEnrollmentData(res.data.data);
        } else {
          setEnrollmentData([]);
        }
      } catch (err) {
        console.error('Failed to load enrollment data:', err);
        setError('Failed to load available classes and arms.');
      } finally {
        setLoading(false);
      }
    };

    loadEnrollmentData();
  }, [open]);

  // ── Pre-select current class arm on open ───────────────────
  useEffect(() => {
    if (open && student) {
      setSelectedArmId(student.class_arm_id || '');
      setError('');
    }
  }, [open, student]);

  // ── Filter breakdown to only the class the selected student belongs to ──────
  const studentClassData = enrollmentData.filter((cls) => {
    const hasArmMatch = (cls.arms || []).some(
      (arm) => Number(arm.arm_id) === Number(student?.class_arm_id)
    );
    const hasClassIdMatch =
      student?.class_id && Number(cls.class_id) === Number(student.class_id);
    const hasNameMatch =
      student?.class_name &&
      (cls.raw_class_name === student.class_name ||
        cls.class_display_name === student.class_name ||
        cls.class_name === student.class_name);

    return hasArmMatch || hasClassIdMatch || hasNameMatch;
  });

  const targetClasses = studentClassData.length > 0 ? studentClassData : enrollmentData;

  const armOptions = targetClasses.flatMap((cls) =>
    (cls.arms || []).map((arm) => {
      const isCurrent = Number(arm.arm_id) === Number(student?.class_arm_id);
      const displayName = cls.class_display_name || cls.raw_class_name || cls.class_name;
      return {
        armId: arm.arm_id,
        isCurrent,
        label: `${displayName} - ${arm.arm_name} (${arm.count} Students)`,
        className: cls.class_name,
        classTotal: cls.total,
        armName: arm.arm_name,
        armCount: arm.count,
      };
    })
  );

  const handleSave = async () => {
    if (!selectedArmId) {
      setError('Please select an arm.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await classRegisterApi.changeStudentClass(student?.student_reg_id, {
        class_arm_id: selectedArmId,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to change class arm.');
    } finally {
      setSaving(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ChangeClassIcon color="primary" />
        Change Student Class Arm
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Transfer{' '}
            <Typography component="span" color="primary" fontWeight={700}>
              {student?.name}
            </Typography>{' '}
            to a different arm.
          </Typography>

          {/* Current Class & Arm Banner */}
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}
            >
              Current Class &amp; Arm
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip
                label={
                  student.class_arm ||
                  (student.class_name
                    ? `${student.class_name} (${student.arm_name || ''})`
                    : 'Not Assigned')
                }
                size="small"
                color="primary"
                variant="filled"
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ '& .MuiAlert-icon': { mr: 1 } }}>
              {error}
            </Alert>
          )}

          <FormControl fullWidth size="small">
            <InputLabel>Select Arm</InputLabel>
            <Select
              value={selectedArmId}
              label="Select Arm"
              onChange={(e) => setSelectedArmId(e.target.value)}
              disabled={loading}
            >
              {loading ? (
                <MenuItem disabled value="">
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Loading arms...
                </MenuItem>
              ) : armOptions.length === 0 ? (
                <MenuItem disabled value="">
                  No arms available for this class
                </MenuItem>
              ) : (
                armOptions.map((opt) => (
                  <MenuItem
                    key={opt.armId}
                    value={opt.armId}
                    sx={{
                      fontWeight: opt.isCurrent ? 700 : 400,
                      bgcolor: opt.isCurrent
                        ? (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(25, 118, 210, 0.15)'
                            : '#e3f2fd'
                        : 'transparent',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <Typography variant="body2" fontWeight={opt.isCurrent ? 700 : 400}>
                        {opt.label}
                      </Typography>
                      {opt.isCurrent && (
                        <Chip
                          label="Current"
                          size="small"
                          color="primary"
                          sx={{ height: 18, fontSize: 10, ml: 1, fontWeight: 700 }}
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || loading || !selectedArmId}
        >
          {saving ? 'Saving...' : 'Save Change'}
        </Button>
      </DialogActions>
    </Dialog >
  );
};

export default ChangeClassModal;
