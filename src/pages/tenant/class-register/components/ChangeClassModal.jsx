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
} from '@mui/material';
import { SwapHoriz as ChangeClassIcon } from '@mui/icons-material';
import classRegisterApi from '@/api/tenant/class-register/classRegisterApi';

const ChangeClassModal = ({ open, onClose, student, onSuccess }) => {
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
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

  const getClsKey = (cls) => (cls?.programme_class_id ? String(cls.programme_class_id) : `${cls?.programme_id}_${cls?.class_id}`);

  // ── Pre-select current class/arm on open ──────────────────
  useEffect(() => {
    if (open && student) {
      // Find which class entry contains the student's current arm
      const currentClassEntry = enrollmentData.find((cls) =>
        (cls.arms || []).some((arm) => Number(arm.arm_id) === Number(student.class_arm_id))
      );
      setSelectedClassId(currentClassEntry ? getClsKey(currentClassEntry) : '');
      setSelectedArmId(student.class_arm_id || '');
      setError('');
    }
  }, [open, student, enrollmentData]);

  // ── Arms for the selected class ───────────────────────────
  const selectedClassEntry = enrollmentData.find(
    (cls) => getClsKey(cls) === String(selectedClassId)
  );
  const armOptions = (selectedClassEntry?.arms || []).map((arm) => ({
    armId: arm.arm_id,
    armName: arm.arm_name,
    count: arm.count,
    isCurrent: Number(arm.arm_id) === Number(student?.class_arm_id),
  }));

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
    setSelectedArmId(''); // reset arm when class changes
  };

  const handleSave = async () => {
    if (!selectedArmId) {
      setError('Please select a class and arm.');
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
            to a different class or arm.
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
          </Paper>

          {error && (
            <Alert severity="error" sx={{ '& .MuiAlert-icon': { mr: 1 } }}>
              {error}
            </Alert>
          )}

          {/* Class filter */}
          <FormControl fullWidth size="small">
            <InputLabel>Select Class</InputLabel>
            <Select
              value={selectedClassId}
              label="Select Class"
              onChange={handleClassChange}
              disabled={loading}
            >
              {loading ? (
                <MenuItem disabled value="">
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Loading classes...
                </MenuItem>
              ) : enrollmentData.length === 0 ? (
                <MenuItem disabled value="">
                  No classes available
                </MenuItem>
              ) : (
                enrollmentData.map((cls) => {
                  const key = getClsKey(cls);
                  const displayName =
                    cls.class_display_name || cls.raw_class_name || cls.class_name;
                  const label = cls.programme_code
                    ? `${displayName} (${cls.programme_code})`
                    : displayName;
                  const isCurrentClass = (cls.arms || []).some(
                    (arm) => Number(arm.arm_id) === Number(student?.class_arm_id)
                  );
                  return (
                    <MenuItem key={key} value={key}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
                        <Typography variant="body2" fontWeight={isCurrentClass ? 700 : 400}>
                          {label}
                        </Typography>
                        {isCurrentClass && (
                          <Chip
                            label="Current"
                            size="small"
                            color="primary"
                            sx={{ height: 18, fontSize: 10, ml: 1, fontWeight: 700 }}
                          />
                        )}
                      </Stack>
                    </MenuItem>
                  );
                })
              )}
            </Select>
          </FormControl>

          {/* Arm filter — only shown once a class is selected */}
          {selectedClassId && (
            <FormControl fullWidth size="small">
              <InputLabel>Select Arm</InputLabel>
              <Select
                value={selectedArmId}
                label="Select Arm"
                onChange={(e) => setSelectedArmId(e.target.value)}
                disabled={loading}
              >
                {armOptions.length === 0 ? (
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
                      <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
                        <Typography variant="body2" fontWeight={opt.isCurrent ? 700 : 400}>
                          {opt.armName} ({opt.count} students)
                        </Typography>
                        {opt.isCurrent && (
                          <Chip
                            label="Current"
                            size="small"
                            color="primary"
                            sx={{ height: 18, fontSize: 10, ml: 1, fontWeight: 700 }}
                          />
                        )}
                      </Stack>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}
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
    </Dialog>
  );
};

export default ChangeClassModal;
