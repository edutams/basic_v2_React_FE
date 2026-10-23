import { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, Alert, Stack, Skeleton } from '@mui/material';
import PropTypes from 'prop-types';
import ReusableModal from 'src/components/shared/ReusableModal';
import learnerApi from '@/api/tenant/learners/learnerApi';
import { useNotification } from '@/hooks/useNotification';

/** Reassigns a class/arm for one or more selected learners — only the
 * ones with a current-term registration are eligible (a graduated/
 * withdrawn learner has none to reassign), which this surfaces honestly
 * rather than silently skipping them. */
const AssignClassModal = ({ open, onClose, learners = [], classes = [], onSaved }) => {
  const notify = useNotification();
  const [classId, setClassId] = useState('');
  const [armId, setArmId] = useState('');
  const [arms, setArms] = useState([]);
  const [armsLoading, setArmsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setArms([]);
    // Preselect the learner's current class/arm when reassigning exactly
    // one — nothing to sensibly preselect for a bulk, mixed-class selection.
    if (learners.length === 1 && learners[0]?.current_registration) {
      const reg = learners[0].current_registration;
      setClassId(reg.class_arm?.programme_class?.class?.id ?? '');
      setArmId(reg.class_arm_id ?? '');
    } else {
      setClassId('');
      setArmId('');
    }
  }, [open, learners]);

  useEffect(() => {
    if (!classId) {
      setArms([]);
      return;
    }
    setArmsLoading(true);
    learnerApi
      .getClassArms({ programme_class_id: classId })
      .then((res) => setArms(res?.data?.data ?? []))
      .catch(() => setArms([]))
      .finally(() => setArmsLoading(false));
  }, [classId]);

  const eligible = learners.filter((l) => l.current_registration?.id);
  const ineligible = learners.length - eligible.length;

  const handleSave = async () => {
    if (!armId) return;
    setSaving(true);
    try {
      const outcomes = await Promise.allSettled(
        eligible.map((l) => learnerApi.updateRegistration(l.current_registration.id, { class_arm_id: armId })),
      );
      const failed = outcomes.filter((o) => o.status === 'rejected').length;
      if (failed === 0) {
        notify.success('Class assigned successfully');
      } else {
        notify.error(`${failed} of ${eligible.length} learner(s) could not be updated`);
      }
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const learnerName =
    learners.length === 1 && learners[0]?.user ? `${learners[0].user.fname} ${learners[0].user.lname}` : null;

  return (
    <ReusableModal
      open={open}
      onClose={onClose}
      title="Assign Class"
      subtitle={learnerName ? `For: ${learnerName}` : `For ${learners.length} selected learner(s)`}
      size="small"
    >
      <Stack spacing={2}>
        {ineligible > 0 && (
          <Alert severity="warning">
            {ineligible} selected learner(s) have no current-term registration and will be skipped.
          </Alert>
        )}
        <FormControl fullWidth size="small">
          <InputLabel>Class</InputLabel>
          <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}>
            <MenuItem value="">Select Class</MenuItem>
            {classes.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small" disabled={!classId || armsLoading}>
          <InputLabel>Arm</InputLabel>
          <Select label="Arm" value={armId} onChange={(e) => setArmId(e.target.value)}>
            <MenuItem value="">Select Arm</MenuItem>
            {arms.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {Array.isArray(a.class_arm_names) ? a.class_arm_names.join(', ') : a.class_arm_names}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button variant="contained" color="inherit" size="small" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={handleSave} disabled={!armId || eligible.length === 0 || saving}>
            {saving ? <Skeleton width={60} height={20} animation="wave" /> : 'Save'}
          </Button>
        </Stack>
      </Stack>
    </ReusableModal>
  );
};

AssignClassModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  learners: PropTypes.array,
  classes: PropTypes.array,
  onSaved: PropTypes.func,
};

export default AssignClassModal;
