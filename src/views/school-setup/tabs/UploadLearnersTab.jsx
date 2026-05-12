import React, { useState, useMemo, useEffect, useLayoutEffect, useRef } from 'react';
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
  Link,
  Typography,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import {
  getClassesWithDivisions,
  createLearner,
  getStudentCountByClass,
} from '../../../context/TenantContext/services/tenant.service';
import api from '../../../api/tenant_api';
import AddLearnerModal from './AddLearnerModal';
import LearnerListModal from './LearnerListModal';
import UploadLearnerModal from 'src/components/tenant-components/learners/UploadLearnerModal';

// Hints fire in sequence: 0 = Add Learner, 1 = Download Template, 2 = Upload Template
const HINT_SEQUENCE = ['add', 'download', 'upload'];
const HINT_DURATION = 5000; // 5s each

const UploadLearnersTab = ({ onSaveAndContinue, onLearnerAdded }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;

  const [hasChanges, setHasChanges] = useState(false);
  const [iconHovered, setIconHovered] = useState(null);
  const [iconClicked, setIconClicked] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [studentCounts, setStudentCounts] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [learnerListModalOpen, setLearnerListModalOpen] = useState(false);
  const [uploadClassId, setUploadClassId] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // ── Sequential hint state ─────────────────────────────────────────────────
  // activeHint: null | 'add' | 'download' | 'upload'
  const [activeHint, setActiveHint] = useState(null);
  const hintTimerRef = useRef(null);

  // Refs for the three first-row buttons
  const addBtnRef      = useRef(null);
  const downloadBtnRef = useRef(null);
  const uploadBtnRef   = useRef(null);

  // Refs for the cells those buttons sit in (position: relative anchors)
  const addCellRef      = useRef(null);
  const downloadCellRef = useRef(null);
  // upload is in the same TableCell as download — we measure the button
  // against the same downloadCellRef but track it separately

  // Measured positions for each hint
  const [addHintStyle,      setAddHintStyle]      = useState(null);
  const [downloadHintStyle, setDownloadHintStyle] = useState(null);
  const [uploadHintStyle,   setUploadHintStyle]   = useState(null);

  // Generic measure helper: positions hint just below a button, anchored to its left edge
  const measureBelow = (btnRef, cellRef) => {
    const btn  = btnRef.current;
    const cell = cellRef.current;
    if (!btn || !cell) return null;
    const btnRect  = btn.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    return {
      top:  btnRect.bottom - cellRect.top + 6,
      left: btnRect.left   - cellRect.left,
      width: btnRect.width,
    };
  };

  // Recalculate add + download positions whenever layout changes
  useLayoutEffect(() => {
    const calc = () => {
      setAddHintStyle(measureBelow(addBtnRef, addCellRef));
      setDownloadHintStyle(measureBelow(downloadBtnRef, downloadCellRef));
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (addCellRef.current)      ro.observe(addCellRef.current);
    if (downloadCellRef.current) ro.observe(downloadCellRef.current);
    return () => ro.disconnect();
  }, [loading, classes.length]);

  // Recalculate upload hint separately — same cell as download but different button
  useLayoutEffect(() => {
    const btn  = uploadBtnRef.current;
    const cell = downloadCellRef.current; // upload lives inside the download cell
    if (!btn || !cell) return;

    const calcUpload = () => {
      const btnRect  = btn.getBoundingClientRect();
      const cellRect = cell.getBoundingClientRect();
      setUploadHintStyle({
        top:   btnRect.bottom - cellRect.top + 6,
        left:  btnRect.left   - cellRect.left,
        width: btnRect.width,
      });
    };

    calcUpload();
    const ro = new ResizeObserver(calcUpload);
    ro.observe(cell);
    return () => ro.disconnect();
  }, [loading, classes.length]);

  // Start the sequence once data is loaded and first row exists
  useEffect(() => {
    if (loading || classes.length === 0) return;

    let step = 0;

    const next = () => {
      if (step >= HINT_SEQUENCE.length) {
        setActiveHint(null);
        return;
      }
      setActiveHint(HINT_SEQUENCE[step]);
      step += 1;
      hintTimerRef.current = setTimeout(next, HINT_DURATION);
    };

    // Small delay so the layout has settled and refs are measured
    hintTimerRef.current = setTimeout(next, 600);

    return () => clearTimeout(hintTimerRef.current);
  }, [loading, classes.length]);

  // ── Hint renderer ─────────────────────────────────────────────────────────
  const renderHint = (key, hintStyle, label, arrowDir = 'up') => {
    if (activeHint !== key || !hintStyle) return null;

    // Arrow paths: 'up' = curves up from bottom, 'up-left' = curves up-left
    const curvePath =
      arrowDir === 'up-left'
        ? 'M38 38 C38 20, 20 12, 4 4'
        : 'M6 38 C6 20, 22 12, 36 4';

    const arrowHead =
      arrowDir === 'up-left'
        ? 'M14 6 L4 4 L6 14'
        : 'M24 2 L36 4 L34 14';

    return (
      <Box
        sx={{
          '@keyframes fadeInHint': {
            from: { opacity: 0, transform: 'translateY(10px)' },
            to:   { opacity: 1, transform: 'translateY(0)' },
          },
          '@keyframes fadeOutHint': {
            from: { opacity: 1 },
            to:   { opacity: 0 },
          },
          '@keyframes bob': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%':      { transform: 'translateY(-5px)' },
          },
          position:      'absolute',
          top:           hintStyle.top,
          left:          hintStyle.left,
          width:         hintStyle.width,
          zIndex:        20,
          pointerEvents: 'none',
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          animation:
            'fadeInHint 0.4s cubic-bezier(0.22,1,0.36,1) both, bob 2s ease-in-out 0.5s 2, fadeOutHint 0.5s ease-in-out 4.5s both',
        }}
      >
        {/* Curved arrow pointing up to the button */}
        <svg
          width="44"
          height="44"
          viewBox="0 0 44 44"
          fill="none"
          style={{ alignSelf: 'flex-start' }}
        >
          <path
            d={curvePath}
            stroke={primary}
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={arrowHead}
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
            bgcolor:     'background.paper',
            border:      '2px solid',
            borderColor: 'primary.main',
            borderRadius:'12px !important',
            px: 1.5,
            py: 1,
            boxShadow:   `0 6px 24px ${primary}22`,
            whiteSpace:  'nowrap',
          }}
        >
          <Typography
            sx={{ fontSize: 11, fontWeight: 700, color: 'primary.main', letterSpacing: 0.2 }}
          >
            {label}
          </Typography>
        </Box>
      </Box>
    );
  };

  // ── Data handlers ─────────────────────────────────────────────────────────
  const handleAddNewLearner = (classItem) => {
    setSelectedClass(classItem);
    setModalOpen(true);
  };

  const handleSaveLearner = async (data) => {
    try {
      const response = await createLearner(data);
      if (response?.status) {
        setNotification({ open: true, message: response.message, severity: 'success' });
        const countsData = await getStudentCountByClass();
        const countsObj = {};
        (countsData || []).forEach((item) => { countsObj[item.class_id] = item.count; });
        setStudentCounts(countsObj);
        onLearnerAdded?.();
      } else {
        setNotification({ open: true, message: response?.message || 'Something went wrong', severity: 'error' });
      }
    } catch (error) {
      setNotification({ open: true, message: error?.message || 'Failed to save learner', severity: 'error' });
      console.error(error);
    }
  };

  const handleUploadClick = (classId) => {
    setUploadClassId(classId);
    setUploadModalOpen(true);
  };

  const handleUploadLearners = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('school_setup/learners', formData);
    if (!response.data.status) throw new Error(response.data.message || 'Upload failed');
    const countsData = await getStudentCountByClass();
    const countsObj = {};
    (countsData || []).forEach((item) => { countsObj[item.class_id] = item.count; });
    setStudentCounts(countsObj);
    onLearnerAdded?.();
    return response.data.message || 'Upload complete';
  };

  const handleDownloadTemplate = async (programmeClassId) => {
    try {
      const response = await api.get('school_setup/learner_template', {
        params: { programme_class_id: programmeClassId },
        responseType: 'blob',
      });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `learner_upload_template_${programmeClassId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setNotification({ open: true, message: 'Template downloaded successfully', severity: 'success' });
    } catch (error) {
      setNotification({ open: true, message: 'Failed to download template', severity: 'error' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesData, countsData] = await Promise.all([
          getClassesWithDivisions(),
          getStudentCountByClass(),
        ]);
        const flatClasses = [];
        (classesData || []).forEach((division) => {
          (division.programmes || []).forEach((programme) => {
            (programme.classes || []).forEach((cls) => {
              if (cls.status === 'active' && cls.pivot?.status === 'active') {
                flatClasses.push({
                  ...cls,
                  unique_key: `${programme.id}_${cls.id}`,
                  programme_id: programme.id,
                  programme_code: programme.programme_code,
                  division_name: division.division_name,
                  programme_class_id: cls.pivot?.id,
                });
              }
            });
          });
        });
        setClasses(flatClasses);
        const countsObj = {};
        (countsData || []).forEach((item) => { countsObj[item.class_id] = item.count; });
        setStudentCounts(countsObj);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleViewLearners = (classItem) => {
    setSelectedClass(classItem);
    setLearnerListModalOpen(true);
  };

  const filteredClasses = useMemo(() => {
    return classes.filter(
      (cls) =>
        cls.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.programme_name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [classes, searchTerm]);

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
        <Table stickyHeader sx={{ borderCollapse: 'separate', borderSpacing: '12px 10px' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: '25%', bgcolor: '#fff' }}>Classes</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '10%', bgcolor: '#fff' }}>No. Uploaded</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '20%', bgcolor: '#fff' }}>Upload Using Forms</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '45%', bgcolor: '#fff' }}>Upload Using Excel File</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredClasses.map((item, index) => {
              const isHighlighted = iconHovered === index || iconClicked === index;
              const cellBg = isHighlighted
                ? isDark ? 'rgba(211,47,47,0.15)' : '#fbe4e4'
                : isDark ? 'action.hover' : '#f6f7f9';

              return (
                <TableRow key={item.unique_key || index}>
                  {/* ── Class name ── */}
                  <TableCell sx={{ bgcolor: cellBg, borderRadius: 2, p: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        size="small"
                        defaultValue={`${item.programme_code} - ${item.class_code}`}
                        disabled
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'background.paper',
                            borderRadius: '8px',
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'text.disabled' },
                            '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' },
                          },
                        }}
                      />
                    </Box>
                  </TableCell>

                  {/* ── No. uploaded ── */}
                  <TableCell sx={{ bgcolor: cellBg, borderRadius: 2, p: 1 }} align="center">
                    <Typography variant="subtitle2" align="center">
                      <Link sx={{ cursor: 'pointer' }} onClick={() => handleViewLearners(item)}>
                        {studentCounts[item.id] || 0}
                      </Link>
                    </Typography>
                  </TableCell>

                  {/* ── Add New Learner (form) ── */}
                  <TableCell
                    ref={index === 0 ? addCellRef : null}
                    sx={{ bgcolor: cellBg, borderRadius: 2, p: 1, position: 'relative' }}
                    align="center"
                  >
                    <Button size="small"
                      ref={index === 0 ? addBtnRef : null}
                      variant="contained"
                      size="small"
                      // startIcon={<AddIcon />} 
                      onClick={() => handleAddNewLearner(item)}
                    >
                      Add New Learner
                    </Button>

                    {/* Hint 1 — Add Learner */}
                    {index === 0 && renderHint(
                      'add',
                      addHintStyle,
                      '👆 Click to add a learner manually',
                    )}
                  </TableCell>

                  {/* ── Download + Upload Template ── */}
                  <TableCell
                    ref={index === 0 ? downloadCellRef : null}
                    sx={{ bgcolor: cellBg, borderRadius: 2, p: 1, position: 'relative' }}
                    align="center"
                  >
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        ref={index === 0 ? downloadBtnRef : null}
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadTemplate(item.programme_class_id)}
                      >
                        Download Template
                      </Button>
                      <Button
                        ref={index === 0 ? uploadBtnRef : null}
                        variant="contained"
                        size="small"
                        startIcon={<UploadIcon />}
                        onClick={() => handleUploadClick(item.id)}
                      >
                        Upload Template
                      </Button>
                    </Box>

                    {/* Hint 2 — Download Template */}
                    {index === 0 && renderHint(
                      'download',
                      downloadHintStyle,
                      '📥 Download the template first',
                      'up-left',
                    )}

                    {/* Hint 3 — Upload Template */}
                    {index === 0 && renderHint(
                      'upload',
                      uploadHintStyle,
                      '📤 Then upload your filled template',
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <UploadLearnerModal
        open={uploadModalOpen}
        onClose={() => { setUploadModalOpen(false); setUploadClassId(null); }}
        onUpload={handleUploadLearners}
      />

      <AddLearnerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveLearner}
        classId={selectedClass?.id}
        className={selectedClass?.class_name}
      />

      <LearnerListModal
        open={learnerListModalOpen}
        onClose={() => setLearnerListModalOpen(false)}
        classId={selectedClass?.id}
        className={selectedClass?.class_name}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
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
};

export default UploadLearnersTab;