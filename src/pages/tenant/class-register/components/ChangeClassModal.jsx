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

  // ── Reset state on open ───────────────────────────────────
  useEffect(() => {
    if (open) {
      setSelectedArmId('');
      setError('');
    }
  }, [open]);

  // ── Flatten class + arm into selectable options ────────────
  const armOptions = enrollmentData.flatMap((cls) =>
    (cls.arms || []).map((arm) => ({
      armId: arm.arm_id,
      label: `${cls.class_name} (${cls.total}) — ${arm.arm_name} (${arm.count})`,
      className: cls.class_name,
      classTotal: cls.total,
      armName: arm.arm_name,
      armCount: arm.count,
    }))
  );

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
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Transfer{' '}
            <Typography component="span" color="primary" fontWeight={700}>
              {student?.name}
            </Typography>{' '}
            to a different class arm.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ '& .MuiAlert-icon': { mr: 1 } }}>
              {error}
            </Alert>
          )}

          <FormControl fullWidth size="small">
            <InputLabel>New Class &amp; Arm</InputLabel>
            <Select
              value={selectedArmId}
              label="New Class & Arm"
              onChange={(e) => setSelectedArmId(e.target.value)}
              disabled={loading}
            >
              {loading ? (
                <MenuItem disabled value="">
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Loading classes...
                </MenuItem>
              ) : armOptions.length === 0 ? (
                <MenuItem disabled value="">
                  No classes or arms available
                </MenuItem>
              ) : (
                armOptions.map((opt) => (
                  <MenuItem key={opt.armId} value={opt.armId}>
                    {opt.label}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* {!loading && armOptions.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
              Format: <strong>Class Name (total)</strong> — Arm Name (count)
            </Typography>
          )} */}
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
