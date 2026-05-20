import { useState, useMemo, useEffect, useRef } from 'react';
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
  Link,
  Typography,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import { CloudUpload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import ArrowHint from '@/components/shared/ArrowHint';
import {
  getClassesWithDivisions,
  createLearner,
  getStudentCountByClass,
} from '@/context/TenantContext/services/tenant.service';
import api from '@/api/tenant_api';
import AddLearnerModal from './AddLearnerModal';
import LearnerListModal from './LearnerListModal';
import UploadLearnerModal from '@/components/tenant-components/learners/UploadLearnerModal';

const HINTS = ['add', 'download', 'upload'];

const UploadLearnersTab = ({ onLearnerAdded, onReadyChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [studentCounts, setStudentCounts] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [learnerListModalOpen, setLearnerListModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // ── Sequential hints: add → download → upload, 5s each ───────────────────
  const [activeHint, setActiveHint] = useState(null);
  const hintTimerRef = useRef(null);

  useEffect(() => {
    if (loading) return;

    const hasAny = Object.values(studentCounts).some((c) => c > 0);
    if (hasAny) {
      setActiveHint(null);
      return;
    }

    let step = 0;
    const next = () => {
      if (step >= HINTS.length) {
        setActiveHint(null);
        return;
      }
      setActiveHint(HINTS[step]);
      step += 1;
      hintTimerRef.current = setTimeout(next, 5000);
    };
    hintTimerRef.current = setTimeout(next, 800);
    return () => clearTimeout(hintTimerRef.current);
  }, [loading, studentCounts]);

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
        (countsData || []).forEach((item) => {
          countsObj[item.class_id] = item.count;
        });
        setStudentCounts(countsObj);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Notify parent when any learner exists
  useEffect(() => {
    const hasAny = Object.values(studentCounts).some((c) => c > 0);
    onReadyChange?.(hasAny);
  }, [studentCounts, onReadyChange]);

  const filteredClasses = useMemo(
    () =>
      classes.filter(
        (cls) =>
          cls.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cls.programme_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [classes, searchTerm],
  );

  const handleAddNewLearner = (classItem) => {
    setSelectedClass(classItem);
    setModalOpen(true);
  };
  const handleViewLearners = (classItem) => {
    setSelectedClass(classItem);
    setLearnerListModalOpen(true);
  };
  const handleUploadClick = () => setUploadModalOpen(true);

  const handleSaveLearner = async (data) => {
    try {
      const response = await createLearner(data);
      if (response?.status) {
        setNotification({ open: true, message: response.message, severity: 'success' });
        const countsData = await getStudentCountByClass();
        const countsObj = {};
        (countsData || []).forEach((item) => {
          countsObj[item.class_id] = item.count;
        });
        setStudentCounts(countsObj);
        onLearnerAdded?.();
      } else {
        setNotification({
          open: true,
          message: response?.message || 'Something went wrong',
          severity: 'error',
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: error?.message || 'Failed to save learner',
        severity: 'error',
      });
    }
  };

  const handleUploadLearners = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('school_setup/learners', formData);
    if (!response.data.status) throw new Error(response.data.message || 'Upload failed');
    const countsData = await getStudentCountByClass();
    const countsObj = {};
    (countsData || []).forEach((item) => {
      countsObj[item.class_id] = item.count;
    });
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
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `learner_upload_template_${programmeClassId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setNotification({
        open: true,
        message: 'Template downloaded successfully',
        severity: 'success',
      });
    } catch {
      setNotification({ open: true, message: 'Failed to download template', severity: 'error' });
    }
  };

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
          <TableHead
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 20,

              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                backgroundColor: '#fff',
                zIndex: -1,
              },
            }}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: '25%', bgcolor: '#fff' }}>Classes</TableCell>
              <TableCell sx={{ fontWeight: 600, width: '10%', bgcolor: '#fff' }}>
                No. Uploaded
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: '20%', bgcolor: '#fff' }}>
                Upload Using Forms
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: '45%', bgcolor: '#fff' }}>
                Upload Using Excel File
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredClasses.map((item, index) => {
              const cellBg = isDark ? 'action.hover' : '#f6f7f9';
              const hasArms = Array.isArray(item.class_arms) && item.class_arms.length > 0;

              return (
                <TableRow key={item.unique_key || index}>
                  <TableCell sx={{ bgcolor: cellBg, borderRadius: 2, p: 1 }}>
                    <TextField
                      size="small"
                      fullWidth
                      defaultValue={`${item.programme_code} - ${item.class_code}`}
                      disabled
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.paper',
                          borderRadius: '8px',
                          '& fieldset': { borderColor: 'divider' },
                        },
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ bgcolor: cellBg, borderRadius: 2, p: 1 }} align="center">
                    <Typography variant="subtitle2" align="center">
                      <Link sx={{ cursor: 'pointer' }} onClick={() => handleViewLearners(item)}>
                        {studentCounts[item.id] || 0}
                      </Link>
                    </Typography>
                  </TableCell>

                  {hasArms ? (
                    <TableCell
                      sx={{ bgcolor: cellBg, borderRadius: 2, p: 1, position: 'relative' }}
                      align="center"
                    >
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAddNewLearner(item)}
                      >
                        Add New Learner
                      </Button>
                      {index === 0 && activeHint === 'add' && (
                        <ArrowHint
                          show
                          label="👆 Click to add a learner manually"
                          direction="up-right"
                          mode="persistent"
                          delay="0s"
                          position={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 20,
                            mt: 0.5,
                          }}
                        />
                      )}
                    </TableCell>
                  ) : (
                    <TableCell
                      colSpan={2}
                      sx={{ bgcolor: cellBg, borderRadius: 2, p: 1 }}
                      align="center"
                    >
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: 'error.main',
                          fontStyle: 'italic',
                          fontWeight: 500,
                        }}
                      >
                        Go back to generate class arms first to enable adding or uploading learners
                      </Typography>
                    </TableCell>
                  )}

                  {hasArms && (
                    <TableCell
                      sx={{ bgcolor: cellBg, borderRadius: 2, p: 1, position: 'relative' }}
                      align="center"
                    >
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownloadTemplate(item.programme_class_id)}
                        >
                          Download Template
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<UploadIcon />}
                          onClick={handleUploadClick}
                        >
                          Upload Template
                        </Button>
                      </Box>
                      {index === 0 && activeHint === 'download' && (
                        <ArrowHint
                          show
                          label="Download the template first"
                          direction="up-left"
                          mode="persistent"
                          delay="0s"
                          position={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            zIndex: 20,
                            mt: 0.5,
                          }}
                        />
                      )}
                      {index === 0 && activeHint === 'upload' && (
                        <ArrowHint
                          show
                          label="upload your filled template"
                          direction="up-right"
                          mode="persistent"
                          delay="0s"
                          position={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            zIndex: 20,
                            mt: 0.5,
                          }}
                        />
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <UploadLearnerModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
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
