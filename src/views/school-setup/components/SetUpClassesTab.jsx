import { useState, useMemo, useEffect, useLayoutEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import {
  getClassesWithDivisions,
  saveClasses,
} from '../../../context/TenantContext/services/tenant.service';
import ArrowHint from '../../../components/shared/ArrowHint';

const SetUpClassesTab = forwardRef(({ onSaveAndContinue, onClassArmsAdded, onReadyChange }, ref) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [hasChanges, setHasChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // ── Hint positioning 
  const generateBtnRef = useRef(null);
  const cellRef = useRef(null);
  const [hintStyle, setHintStyle] = useState(null);
  const [showEditHint, setShowEditHint] = useState(false);
  const editHintTimerRef = useRef(null);

  useLayoutEffect(() => {
    const btn = generateBtnRef.current;
    const cell = cellRef.current;
    if (!btn || !cell) return;

    const calc = () => {
      const btnRect = btn.getBoundingClientRect();
      const cellRect = cell.getBoundingClientRect();
      setHintStyle({
        // Sit just below the button; anchor to button's left edge so the
        // arrowhead (which exits top-right of the SVG) lands on the button
        top: btnRect.bottom - cellRect.top + 4,
        left: btnRect.left - cellRect.left - 2,
      });
    };

    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(cell);
    return () => ro.disconnect();
  }, [classes.length, loading]);


  const generateDefaultArmNames = (count) => {
    const letters = [];
    for (let i = 0; i < count; i++) {
      let letter = '';
      let num = i;
      while (num >= 0) {
        letter = String.fromCharCode(65 + (num % 26)) + letter;
        num = Math.floor(num / 26) - 1;
      }
      letters.push(letter);
    }
    return letters;
  };

  const fetchClasses = async () => {
    try {
      const data = await getClassesWithDivisions();
      const flatClasses = [];
      (data || []).forEach((division) => {
        (division.programmes || []).forEach((programme) => {
          (programme.classes || []).forEach((cls) => {
            flatClasses.push({
              ...cls,
              unique_key: `${programme.id}_${cls.id}`,
              programme_id: programme.id,
              programme_code: programme.programme_code,
              division_name: division.division_name,
              programme_class_id: cls.pivot?.id ?? null,
              no_of_arms: cls.class_arms?.length || 0,
              arm_names: cls.class_arms?.map((a) => a.arm_names) || [],
              arms: cls.arms || [],
              status: cls.status || 'active',
            });
          });
        });
      });
      setClasses(flatClasses);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchClasses().finally(() => setLoading(false));
  }, []);

  // Notify parent when at least one class has arms generated
  useEffect(() => {
    const isReady = classes.some((c) => c.arm_names?.length > 0);
    onReadyChange?.(isReady);
  }, [classes, onReadyChange]);

  const handleSaveAndContinue = async () => {
    setSaving(true);
    try {
      const classesData = classes.map((cls) => ({
        class_id: cls.id,
        programme_id: cls.programme_id,
        program_class_id: cls.programme_class_id,
        class_name: cls.class_name,
        status: cls.status,
        no_of_arms: cls.no_of_arms || 0,
        arm_names: cls.arm_names || [],
      }));

      await saveClasses(classesData);
      await fetchClasses();
      setHasChanges(false);
      onClassArmsAdded?.();
      setNotification({ open: true, message: 'Classes saved successfully!', severity: 'success' });
      if (onSaveAndContinue) onSaveAndContinue();
    } catch (error) {
      console.error('Failed to save classes:', error);
      alert('Failed to save classes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({
    save: handleSaveAndContinue,
  }));

  const handleChange = () => setHasChanges(true);

  const handleToggleClassStatus = (uniqueKey) => {
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.unique_key === uniqueKey) {
          const newStatus = cls.status === 'active' ? 'inactive' : 'active';
          return { ...cls, status: newStatus };
        }
        return cls;
      }),
    );
    setHasChanges(true);
  };

  const handleNoOfArmsChange = (uniqueKey, value) => {
    const numArms = parseInt(value) || 0;
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.unique_key === uniqueKey) {
          return { ...cls, no_of_arms: numArms };
        }
        return cls;
      }),
    );
    setHasChanges(true);
  };

  const handleGenerateArms = (uniqueKey) => {
    const target = classes.find((cls) => cls.unique_key === uniqueKey);
    if (!target || !target.no_of_arms || target.no_of_arms < 1) {
      setNotification({
        open: true,
        message: 'At least one arm must be set before generating.',
        severity: 'warning',
      });
      return;
    }

    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.unique_key === uniqueKey) {
          const defaultArms = generateDefaultArmNames(cls.no_of_arms || 0);
          return { ...cls, arm_names: defaultArms };
        }
        return cls;
      }),
    );
    setHasChanges(true);
    setNotification({
      open: true,
      message: 'Class arm names generated successfully!',
      severity: 'success',
    });

    // Show edit hint for 3 seconds then auto-hide
    setShowEditHint(true);
    if (editHintTimerRef.current) clearTimeout(editHintTimerRef.current);
    editHintTimerRef.current = setTimeout(() => setShowEditHint(false), 3000);
  };

  const handleArmNameChange = (uniqueKey, armIndex, value) => {
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.unique_key === uniqueKey) {
          const newArmNames = [...cls.arm_names];
          newArmNames[armIndex] = value;
          return { ...cls, arm_names: newArmNames };
        }
        return cls;
      }),
    );
    setHasChanges(true);
  };

  const filteredClasses = useMemo(() => {
    return classes.filter((classItem) => {
      const className = classItem.class_name || '';
      return className.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [classes, searchTerm]);

  const showHint = !classes.some((c) => c.arm_names?.length > 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table
          stickyHeader
          sx={{
            borderCollapse: 'separate',
            borderSpacing: '12px 10px',
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: '25%', bgcolor: '#fff' }}>Classes</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '25%', bgcolor: '#fff' }}>No. of Arms</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '50%', bgcolor: '#fff' }}>Class Arm Names</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredClasses.map((classItem, index) => {
              const isInactive = classItem.status === 'inactive';
              const cellBg = isInactive
                ? isDark ? 'action.disabledBackground' : '#e0e0e0'
                : isDark ? 'action.hover' : '#f6f7f9';

              return (
                <TableRow key={classItem.unique_key || index}>
                  {/* ── Class name cell ── */}
                  <TableCell sx={{ bgcolor: cellBg, borderRadius: 2, p: 1, verticalAlign: 'top' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        disabled
                        defaultValue={`${classItem.programme_code} - ${classItem.class_code}`}
                        onChange={handleChange}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: isInactive
                              ? isDark ? 'action.disabledBackground' : '#e0e0e0'
                              : 'background.paper',
                            borderRadius: '8px',
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'text.disabled' },
                            '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' },
                          },
                        }}
                      />
                    </Box>
                  </TableCell>

                  <TableCell sx={{ bgcolor: cellBg, borderRadius: 2, p: 1, verticalAlign: 'top' }}>
                    <Box
                      ref={index === 0 ? cellRef : null}
                      display="flex"
                      gap={1}
                      justifyContent="center"
                      alignItems="center"
                      width="100%"
                      sx={{ position: 'relative' }}
                    >
                      <TextField
                        size="small"
                        type="number"
                        disabled={isInactive}
                        value={classItem.no_of_arms || 0}
                        onChange={(e) => handleNoOfArmsChange(classItem.unique_key, e.target.value)}
                        slotProps={{ htmlInput: { min: 0 } }}
                        sx={{
                          width: 70,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'background.paper',
                            borderRadius: '8px',
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'text.disabled' },
                            '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' },
                          },
                        }}
                      />

                      <Button
                        ref={index === 0 ? generateBtnRef : null}
                        variant="contained"
                        size="small"
                        disabled={isInactive}
                        onClick={() => handleGenerateArms(classItem.unique_key)}
                      >
                        Generate
                      </Button>

                      {index === 0 && showHint && hintStyle && (
                        <ArrowHint
                          show
                          label="Set no. of arms &amp; click Generate"
                          direction="up-right"
                          mode="persistent"
                          delay="0.6s"
                          position={{
                            position: 'absolute',
                            top: hintStyle.top,
                            left: hintStyle.left,
                            zIndex: 10,
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>

                  <TableCell
                    sx={{ bgcolor: cellBg, borderRadius: 2, p: 1, verticalAlign: 'top', position: 'relative' }}
                  >
                    {index === 0 && showEditHint && (
                      <ArrowHint
                        show
                        label="✏️ You can edit the arm names if you wish"
                        direction="down-left"
                        mode="persistent"
                        delay="0s"
                        position={{ position: 'absolute', top: -70, left: '40%', transform: 'translateX(-50%)', zIndex: 20 }}
                      />
                    )}

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {classItem.arm_names && classItem.arm_names.length > 0 ? (
                        classItem.arm_names.map((armName, i) => (
                          <TextField
                            key={i}
                            size="small"
                            disabled={isInactive}
                            value={armName}
                            onChange={(e) =>
                              handleArmNameChange(classItem.unique_key, i, e.target.value)
                            }
                            sx={{
                              width: 90,
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'background.paper',
                                borderRadius: '8px',
                                '& fieldset': { borderColor: 'divider' },
                                '&:hover fieldset': { borderColor: 'text.disabled' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' },
                              },
                            }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                          Click Generate to create arms
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} sx={{ display: 'none' }}>
        <Button variant="contained" onClick={handleSaveAndContinue} disabled={!hasChanges || saving}>
          {saving ? 'Saving...' : 'Save & Continue'}
        </Button>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

export default SetUpClassesTab;