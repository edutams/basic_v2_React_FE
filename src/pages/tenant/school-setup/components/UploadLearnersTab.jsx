import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
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
  Skeleton,
  useTheme,
} from '@mui/material';
import { CloudUpload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import { IconSchool, IconUsers, IconUserCheck, IconUserExclamation } from '@tabler/icons-react';
import ArrowHint from '@/components/shared/ArrowHint';
import {
  getClassesWithDivisions,
  createLearner,
  getStudentCountByClass,
} from '@/api/tenant/set-up/tenant-setup';
import api from '@/api/tenant/tenant_api';
import AddLearnerModal from './AddLearnerModal';
import LearnerListModal from './LearnerListModal';
import UploadLearnerModal from '@/components/tenant/learners/UploadLearnerModal';
import StatCard from '@/components/shared/StatCard';

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
  // Tracks which single row's template download is in flight, so only that
  // row's button shows a spinner rather than every "Download Template"
  // button on the page.
  const [downloadingClassId, setDownloadingClassId] = useState(null);
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
          countsObj[item.programme_class_id] = item.count;
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
          countsObj[item.programme_class_id] = item.count;
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
      countsObj[item.programme_class_id] = item.count;
    });
    setStudentCounts(countsObj);
    onLearnerAdded?.();
    return response.data.message || 'Upload complete';
  };

  const handleDownloadTemplate = async (programmeClassId) => {
    setDownloadingClassId(programmeClassId);
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
    } finally {
      setDownloadingClassId(null);
    }
  };

  // Stat-card row — at-a-glance intelligence for this stage, same reusable
  // StatCard used elsewhere (handles its own skeleton via `loading`).
  const stats = useMemo(() => {
    // "Ready" mirrors the same hasArms check the table itself uses — a
    // class without arms can't actually receive learners yet.
    const readyClasses = classes.filter(
      (c) => Array.isArray(c.class_arms) && c.class_arms.length > 0,
    );
    const counts = Object.values(studentCounts);
    const totalLearners = counts.reduce((sum, c) => sum + (c || 0), 0);
    const classesWithLearners = readyClasses.filter(
      (c) => (studentCounts[c.programme_class_id] || 0) > 0,
    ).length;
    return {
      totalClasses: readyClasses.length,
      totalLearners,
      classesWithLearners,
      classesWithoutLearners: Math.max(0, readyClasses.length - classesWithLearners),
    };
  }, [classes, studentCounts]);

  const statCards = (
    <Grid container spacing={1.5} sx={{ mb: 2, flexShrink: 0 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          count={stats.totalClasses}
          label="Classes Ready"
          icon={IconSchool}
          colorIndex={0}
          loading={loading}
          tooltip="Classes with arms generated, ready to receive learners."
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          count={stats.totalLearners}
          label="Total Learners"
          icon={IconUsers}
          colorIndex={2}
          loading={loading}
          tooltip="Learners added across every class so far."
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          count={stats.classesWithLearners}
          label="Classes With Learners"
          icon={IconUserCheck}
          colorIndex={1}
          loading={loading}
          tooltip="Classes that already have at least one learner."
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          count={stats.classesWithoutLearners}
          label="Still Need Learners"
          icon={IconUserExclamation}
          colorIndex={4}
          loading={loading}
          tooltip="Classes with no learners added yet."
        />
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
        {statCards}
        <TableContainer sx={{ flex: 1 }}>
          <Table sx={{ borderCollapse: 'separate', borderSpacing: '12px 10px' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '25%' }}>Classes</TableCell>
                <TableCell sx={{ width: '10%' }}>No. Uploaded</TableCell>
                <TableCell sx={{ width: '20%' }}>Upload Using Forms</TableCell>
                <TableCell sx={{ width: '45%' }}>Upload Using Excel File</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton variant="rounded" height={40} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rounded" height={40} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rounded" height={40} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rounded" height={40} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', p: 2 }}>
      {statCards}
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
                        {studentCounts[item.programme_class_id] || 0}
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
                          variant="contained"
                          size="small"
                          startIcon={
                            downloadingClassId === item.programme_class_id ? (
                              <CircularProgress size={14} color="inherit" />
                            ) : (
                              <DownloadIcon />
                            )
                          }
                          disabled={downloadingClassId === item.programme_class_id}
                          onClick={() => handleDownloadTemplate(item.programme_class_id)}
                        >
                          {downloadingClassId === item.programme_class_id
                            ? 'Downloading...'
                            : 'Download Template'}
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
        programmeClassId={selectedClass?.programme_class_id}
        className={selectedClass?.class_name}
      />
      <LearnerListModal
        open={learnerListModalOpen}
        onClose={() => setLearnerListModalOpen(false)}
        programmeClassId={selectedClass?.programme_class_id}
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
