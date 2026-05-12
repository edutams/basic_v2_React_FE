import React, { useState, useMemo, useEffect, useLayoutEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Button,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { IconDotsVertical } from '@tabler/icons-react';
import {
  getClassesWithDivisions,
  saveClasses,
} from '../../../context/TenantContext/services/tenant.service';

const SetUpClassesTab = forwardRef(({ onSaveAndContinue, onClassArmsAdded }, ref) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;

  const [hasChanges, setHasChanges] = useState(false);
  const [iconHovered, setIconHovered] = useState(null);
  const [iconClicked, setIconClicked] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // ── Hint positioning ──────────────────────────────────────────────────────
  const generateBtnRef = useRef(null);   // ref on the first row's Generate button
  const cellRef = useRef(null);          // ref on the cell wrapping Box (position: relative)
  const armCellRef = useRef(null);       // ref on the first row's arm names cell
  const [hintStyle, setHintStyle] = useState(null);
  const [armHintStyle, setArmHintStyle] = useState(null);
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

  // ── Arm names cell hint position ─────────────────────────────────────────
  useLayoutEffect(() => {
    const armCell = armCellRef.current;
    if (!armCell) return;

    const calc = () => {
      const armRect = armCell.getBoundingClientRect();
      const armCellParent = armCell.offsetParent;
      if (!armCellParent) return;
      const parentRect = armCellParent.getBoundingClientRect();
      setArmHintStyle({
        // Centre of the arm cell, just above its top edge
        top: armRect.top - parentRect.top - 56,
        left: armRect.left - parentRect.left + armRect.width / 2,
      });
    };

    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(armCell);
    return () => ro.disconnect();
  }, [classes.length, loading]);

  // ─────────────────────────────────────────────────────────────────────────

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
              const isHighlighted = iconHovered === index || iconClicked === index;
              const cellBg = isInactive
                ? isDark ? 'action.disabledBackground' : '#e0e0e0'
                : isHighlighted
                  ? isDark ? 'rgba(211,47,47,0.15)' : '#fbe4e4'
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

                  {/* ── No. of Arms + Generate cell ── */}
                  <TableCell sx={{ bgcolor: cellBg, borderRadius: 2, p: 1, verticalAlign: 'top' }}>
                    <Box
                      // cellRef only on the first row — that's where the hint lives
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
                        // generateBtnRef only on the first row
                        ref={index === 0 ? generateBtnRef : null}
                        variant="contained"
                        size="small"
                        disabled={isInactive}
                        onClick={() => handleGenerateArms(classItem.unique_key)}
                      >
                        Generate
                      </Button>

                      {/* ── Hint: first row only, hidden once any arms exist ── */}
                      {index === 0 && showHint && hintStyle && (
                        <Box
                          sx={{
                            '@keyframes fadeUp': {
                              from: { opacity: 0, transform: 'translateY(16px)' },
                              to: { opacity: 1, transform: 'translateY(0)' },
                            },
                            '@keyframes bob': {
                              '0%, 100%': { transform: 'translateY(0)' },
                              '40%': { transform: 'translateY(-6px)' },
                              '60%': { transform: 'translateY(-3px)' },
                            },
                            position: 'absolute',
                            top: hintStyle.top,
                            left: hintStyle.left,
                            // no translateX — left is already anchored to button's left edge
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            pointerEvents: 'none',
                            zIndex: 10,
                            animation:
                              'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.6s both, bob 2.4s ease-in-out 1.6s infinite',
                          }}
                        >
                          {/* Curved arrow — starts bottom-left, arrowhead points up-right into Generate button */}
                          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ alignSelf: 'flex-start' }}>
                            <path
                              d="M6 42 C6 24, 22 14, 38 4"
                              stroke={primary}
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              fill="none"
                            />
                            {/* Arrowhead pointing up-right */}
                            <path
                              d="M26 2 L38 4 L36 16"
                              stroke={primary}
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>

                          {/* Bubble */}
                          <Box
                            sx={{
                              bgcolor: 'background.paper',
                              border: '2px solid',
                              borderColor: 'primary.main',
                              borderRadius: '12px !important',
                              px: 1.5,
                              py: 1,
                              boxShadow: `0 6px 24px ${primary}22`,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: 'primary.main',
                                letterSpacing: 0.2,
                              }}
                            >
                              Set no. of arms &amp; click Generate
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </TableCell>

                  {/* ── Arm names cell ── */}
                  <TableCell
                    ref={index === 0 ? armCellRef : null}
                    sx={{ bgcolor: cellBg, borderRadius: 2, p: 1, verticalAlign: 'top', position: 'relative' }}
                  >
                    {/* Edit hint — shown for 3s after Generate is clicked, first row only */}
                    {index === 0 && showEditHint && armHintStyle && (
                      <Box
                        sx={{
                          '@keyframes fadeInHint': {
                            from: { opacity: 0, transform: 'translateY(8px)' },
                            to: { opacity: 1, transform: 'translateY(0)' },
                          },
                          '@keyframes fadeOutHint': {
                            from: { opacity: 1 },
                            to: { opacity: 0 },
                          },
                          '@keyframes bob': {
                            '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
                            '50%': { transform: 'translateX(-50%) translateY(-5px)' },
                          },
                          position: 'absolute',
                          top: -62,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          zIndex: 20,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          pointerEvents: 'none',
                          animation: 'fadeInHint 0.4s cubic-bezier(0.22,1,0.36,1) both, bob 2s ease-in-out 0.5s infinite',
                        }}
                      >
                        {/* Bubble */}
                        <Box
                          sx={{
                            bgcolor: 'background.paper',
                            border: '2px solid',
                            borderColor: 'primary.main',
                            borderRadius: '12px !important',
                            px: 1.5,
                            py: 1,
                            boxShadow: `0 6px 24px ${primary}22`,
                            whiteSpace: 'nowrap',
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            sx={{ fontSize: 11, fontWeight: 700, color: 'primary.main', letterSpacing: 0.2 }}
                          >
                            ✏️ You can edit the arm names if you wish
                          </Typography>
                        </Box>

                        {/* Curved arrow pointing down-left toward the arm name fields */}
                        <svg width="44" height="40" viewBox="0 0 44 40" fill="none" style={{ alignSelf: 'flex-start', marginLeft: 8 }}>
                          <path
                            d="M38 4 C38 20, 20 28, 6 36"
                            stroke={primary}
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            fill="none"
                          />
                          {/* Arrowhead pointing down-left */}
                          <path
                            d="M16 26 L6 36 L16 38"
                            stroke={primary}
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </svg>
                      </Box>
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

      <Box mt={2} display="flex" justifyContent="flex-end" sx={{ display: 'none' }}>
        <Button
          variant="contained"
          onClick={handleSaveAndContinue}
          disabled={!hasChanges || saving}
        >
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