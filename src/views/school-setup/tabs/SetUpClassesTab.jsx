import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  TextField,
  IconButton,
  Button,
  Typography,
  Chip,
  Skeleton,
  Alert,
  Divider,
  Tooltip,
} from '@mui/material';
import { IconRefresh } from '@tabler/icons-react';
import { getClasses, saveClasses } from '../../../context/TenantContext/services/tenant.service';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate default arm names based on count.
 * First 5 use Greek alphabet, rest use "Arm N".
 */
const generateArmNames = (count) => {
  const defaults = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
  return Array.from({ length: count }, (_, i) =>
    i < defaults.length ? defaults[i] : `Arm ${i + 1}`,
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: single class row
// ─────────────────────────────────────────────────────────────────────────────

const ClassRow = ({ classItem, onChange }) => {
  const [armCount, setArmCount] = useState(classItem.arms.length || '');
  const [hovered, setHovered] = useState(false);

  const isDeactivated = !classItem.is_active;
  const rowBg = isDeactivated ? '#fbe4e4' : hovered ? '#f0f4ff' : '#f6f7f9';

  const handleGenerate = () => {
    const count = parseInt(armCount, 10);
    if (!count || count < 1 || count > 20) return;

    // If arms already exist and count matches, keep existing names
    // otherwise generate fresh default names
    const newArms = classItem.arms.length === count ? classItem.arms : generateArmNames(count);

    onChange(classItem.id, { arms: newArms });
  };

  const handleArmNameChange = (index, value) => {
    const updated = [...classItem.arms];
    updated[index] = value;
    onChange(classItem.id, { arms: updated });
  };

  const handleClassNameChange = (value) => {
    onChange(classItem.id, { class_name: value });
  };

  const handleToggleActive = () => {
    onChange(classItem.id, { is_active: !classItem.is_active });
  };

  return (
    <TableRow>
      {/* Class Name */}
      <TableCell
        sx={{ bgcolor: rowBg, borderRadius: 2, p: 1, transition: 'background 0.2s' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={isDeactivated ? 'Re-enable class' : 'Deactivate class'}>
            <IconButton
              size="small"
              color={isDeactivated ? 'default' : 'error'}
              onClick={handleToggleActive}
              sx={{ fontSize: 13, fontWeight: 700 }}
            >
              {isDeactivated ? '↩' : '✕'}
            </IconButton>
          </Tooltip>

          <TextField
            size="small"
            fullWidth
            value={classItem.class_name}
            onChange={(e) => handleClassNameChange(e.target.value)}
            disabled={isDeactivated}
            sx={inputSx}
          />
        </Box>
      </TableCell>

      {/* Number of Arms + Generate */}
      <TableCell sx={{ bgcolor: rowBg, borderRadius: 2, p: 1 }}>
        <Box display="flex" gap={1} justifyContent="center" alignItems="center">
          <TextField
            size="small"
            type="number"
            value={armCount}
            disabled={isDeactivated}
            onChange={(e) => setArmCount(e.target.value)}
            inputProps={{ min: 1, max: 20 }}
            sx={{ width: 70, ...inputSx }}
          />
          <Button
            variant="contained"
            size="small"
            disabled={isDeactivated || !armCount || parseInt(armCount) < 1}
            onClick={handleGenerate}
            startIcon={<IconRefresh size={14} />}
          >
            Generate
          </Button>
        </Box>
      </TableCell>

      {/* Arm Name Inputs */}
      <TableCell sx={{ bgcolor: rowBg, borderRadius: 2, p: 1 }}>
        {isDeactivated ? (
          <Typography fontSize={12} color="text.disabled" fontStyle="italic">
            Class deactivated
          </Typography>
        ) : classItem.arms.length === 0 ? (
          <Typography fontSize={12} color="text.secondary" fontStyle="italic">
            Enter number of arms and click Generate
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {classItem.arms.map((armName, i) => (
              <TextField
                key={i}
                size="small"
                value={armName}
                onChange={(e) => handleArmNameChange(i, e.target.value)}
                placeholder={`Arm ${i + 1}`}
                sx={{ width: 90, ...inputSx }}
              />
            ))}
          </Box>
        )}
      </TableCell>
    </TableRow>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const SetUpClassesTab = ({ onSaveAndContinue, onStatsRefresh }) => {
  const [classes, setClasses] = useState([]); // raw data from API
  const [classMap, setClassMap] = useState({}); // { classId: classData } — our working state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // ── Fetch on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClasses();
      setClasses(data);

      // Build classMap: { [classId]: classData }
      const map = {};
      classes.forEach((cls) => {
        map[cls.id] = {
          ...cls,
          arms: cls.arms.map((a) => a.arm_name), // flatten to string[]
        };
      });
      setClassMap(map);
    } catch (err) {
      setError('Failed to load classes. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Handle changes from ClassRow ──────────────────────────────────────────
  const handleClassChange = useCallback((classId, changes) => {
    setClassMap((prev) => ({
      ...prev,
      [classId]: { ...prev[classId], ...changes },
    }));
    setHasChanges(true);
  }, []);

  // ── Validate before save ──────────────────────────────────────────────────
  const validate = () => {
    const activeClasses = Object.values(classMap).filter((c) => c.is_active);

    // At least one active class must have at least one arm
    const anyArms = activeClasses.some((c) => c.arms.length > 0);
    if (!anyArms) {
      return 'Please generate and name at least one arm for at least one class.';
    }

    // Check that no arm name is blank for active classes with arms
    for (const cls of activeClasses) {
      if (cls.arms.length > 0) {
        const hasBlank = cls.arms.some((a) => !a.trim());
        if (hasBlank) {
          return `Please fill in all arm names for "${cls.class_name}". Remove blank entries or fill them in.`;
        }
      }
    }

    return null;
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const payload = Object.values(classMap).map((cls) => ({
        class_id: cls.id,
        class_name: cls.class_name,
        is_active: cls.is_active,
        arms: cls.arms,
      }));

      await saveClasses(payload);

      setHasChanges(false);

      // Refresh stats cards on parent
      if (onStatsRefresh) onStatsRefresh();

      // Move to next tab
      onSaveAndContinue();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save classes. Please try again.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box p={3}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={52} sx={{ mb: 1, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {classes.map((division) => (
        <Box key={division.id} sx={{ mb: 1 }}>
          {/* Division header */}
          <Box
            sx={{
              px: 3,
              py: 1,
              bgcolor: '#EEF2FF',
              borderBottom: '1px solid #C7D2FE',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography fontWeight={700} fontSize={13} color="#3730A3">
              {division.div_name}
            </Typography>
            <Chip
              label={division.div_title}
              size="small"
              sx={{ bgcolor: '#C7D2FE', color: '#3730A3', fontWeight: 700, fontSize: 11 }}
            />
            <Typography fontSize={12} color="#6B7280" ml="auto">
              {division.classes.length} classes
            </Typography>
          </Box>

          {/* Classes table */}
          <TableContainer>
            <Table sx={{ borderCollapse: 'separate', borderSpacing: '12px 8px' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6B7280', pb: 0 }}>
                    Class Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6B7280', pb: 0 }}>
                    No. of Arms
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#6B7280', pb: 0 }}>
                    Arm Names
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes.map((cls) =>
                  classMap[cls.id] ? (
                    <ClassRow
                      key={cls.id}
                      classItem={classMap[cls.id]}
                      onChange={handleClassChange}
                    />
                  ) : null,
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ mt: 1 }} />
        </Box>
      ))}

      {/* Footer actions */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography fontSize={12} color="text.secondary">
          {hasChanges ? '● Unsaved changes' : classes.length > 0 ? '✓ All changes saved' : ''}
        </Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" size="small" onClick={fetchClasses} disabled={saving}>
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!hasChanges || saving}
            sx={{ minWidth: 140 }}
          >
            {saving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// ── Shared input styles ───────────────────────────────────────────────────────
const inputSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#fff',
    borderRadius: '8px',
    '& fieldset': { borderColor: '#e5e7eb' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused fieldset': { borderColor: '#1976d2', borderWidth: '2px' },
  },
};

export default SetUpClassesTab;
