import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from '../../components/shared/ParentCard';
import {
  fetchCurriculums,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
  fetchClassAssignments,
  saveClassAssignments,
  fetchSessions,
  fetchTerms,
  fetchProgrammes,
  fetchSubjects,
  createSubjectRecord,
  updateSubjectRecord,
  deleteSubjectRecord,
} from '../../api/curriculumApi';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Button,
  Chip,
  Select,
  MenuItem,
  Checkbox,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { MoreVert as MoreVertIcon, Subject, Assignment } from '@mui/icons-material';
import { IconEdit, IconTrash } from '@tabler/icons-react';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Agent Dashboard' },
  { title: 'Curriculum Manager' },
];

const TabPanel = ({ children, value, index }) => {
  return value === index && <Box mt={2}>{children}</Box>;
};

const AgentCurriculumManager = () => {
  const [tab, setTab] = useState(0);

  // Radio button selection for curriculum
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);

  // Side panel states
  const [showSubjectBank, setShowSubjectBank] = useState(false);
  const [showAssignToClasses, setShowAssignToClasses] = useState(false);

  // Action menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedCurriculumForAction, setSelectedCurriculumForAction] = useState(null);

  // Data states
  const [curriculumData, setCurriculumData] = useState([]);
  const [classData, setClassData] = useState([]);

  // Subject Bank states
  const [subjectsList, setSubjectsList] = useState([]);
  const [programmesList, setProgrammesList] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [openAddSubjectModal, setOpenAddSubjectModal] = useState(false);
  const [openEditSubjectModal, setOpenEditSubjectModal] = useState(false);
  const [openDeleteSubjectDialog, setOpenDeleteSubjectDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectFormData, setSubjectFormData] = useState({
    subject_name: '',
    subject_code: '',
    programme_id: '',
    unit: '',
    status: 'compulsory',
  });

  // Sessions and Terms
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  // Modal states
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    curriculum_name: '',
    status: 'active',
  });

  // Loading and notification states
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch data on component mount
  useEffect(() => {
    loadCurriculums();
    loadSessionsAndTerms();
  }, []);

  useEffect(() => {
    if (selectedCurriculum) {
      loadSubjectsList();
      setShowSubjectBank(true);
      setShowAssignToClasses(true);
    } else {
      setSubjectsList([]);
      setShowSubjectBank(false);
      setShowAssignToClasses(false);
    }
  }, [selectedCurriculum]);

  // Load class assignments when session or term changes
  useEffect(() => {
    if (selectedSession && selectedTerm) {
      loadClassAssignments();
    }
  }, [selectedSession, selectedTerm]);

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
  };

  // API Functions
  const loadCurriculums = async () => {
    try {
      setLoading(true);
      const response = await fetchCurriculums();
      if (response.status) {
        setCurriculumData(response.data);
        // Auto-select first curriculum
        if (response.data.length > 0 && !selectedCurriculum) {
          setSelectedCurriculum(response.data[0].id);
        }
      }
    } catch (error) {
      showSnackbar('Failed to load curriculums', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionsAndTerms = async () => {
    try {
      const sessionsRes = await fetchSessions();

      if (sessionsRes.status) {
        setSessions(sessionsRes.data);
        if (sessionsRes.data.length > 0) {
          const currentSession =
            sessionsRes.data.find((s) => s.is_current === 'yes') || sessionsRes.data[0];
          setSelectedSession(currentSession.id);

          // Load terms for the initial session
          const termsRes = await fetchTerms(currentSession.id);
          if (termsRes.status) {
            setTerms(termsRes.data);
            if (termsRes.data.length > 0) {
              setSelectedTerm(termsRes.data[0].id);
            }
          }
        }
      }
    } catch (error) {
      showSnackbar('Failed to load sessions and terms', 'error');
    }
  };

  const handleSessionChange = async (sessionId) => {
    setSelectedSession(sessionId);
    try {
      const termsRes = await fetchTerms(sessionId);
      if (termsRes.status) {
        setTerms(termsRes.data);
        if (termsRes.data.length > 0) {
          setSelectedTerm(termsRes.data[0].id);
        } else {
          setSelectedTerm('');
        }
      }
    } catch (error) {
      showSnackbar('Failed to load terms for selected session', 'error');
    }
  };

  const loadClassAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetchClassAssignments(selectedSession, selectedTerm);
      if (response.status) {
        setClassData(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to load class assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadProgrammes = async () => {
    try {
      const response = await fetchProgrammes();
      if (response.status) {
        setProgrammesList(response.data);
      }
    } catch (error) {
      console.error('Failed to load programmes');
    }
  };

  const loadSubjectsList = async () => {
    try {
      setLoadingSubjects(true);
      const response = await fetchSubjects(selectedCurriculum);
      if (response.status) {
        setSubjectsList(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to load subjects for curriculum', 'error');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Create Curriculum
  const handleOpenCreateModal = () => {
    setFormData({ curriculum_name: '', status: 'active' });
    setOpenCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setFormData({ curriculum_name: '', status: 'active' });
  };

  const handleCreateCurriculum = async () => {
    if (!formData.curriculum_name.trim()) {
      showSnackbar('Curriculum name is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await createCurriculum(formData);
      if (response.status) {
        showSnackbar('Curriculum created successfully', 'success');
        handleCloseCreateModal();
        loadCurriculums();
      } else {
        showSnackbar(response.message || 'Failed to create curriculum', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to create curriculum', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Edit Curriculum
  const handleOpenEditModal = (curriculum) => {
    setSelectedCurriculumForAction(curriculum);
    setFormData({
      curriculum_name: curriculum.curriculum_name,
      status: curriculum.status,
    });
    setOpenEditModal(true);
    setActionMenuAnchor(null);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedCurriculumForAction(null);
    setFormData({ curriculum_name: '', status: 'active' });
  };

  const handleUpdateCurriculum = async () => {
    if (!formData.curriculum_name.trim()) {
      showSnackbar('Curriculum name is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await updateCurriculum(selectedCurriculumForAction.id, formData);
      if (response.status) {
        showSnackbar('Curriculum updated successfully', 'success');
        handleCloseEditModal();
        loadCurriculums();
      } else {
        showSnackbar(response.message || 'Failed to update curriculum', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to update curriculum', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete Curriculum
  const handleOpenDeleteDialog = (curriculum) => {
    setSelectedCurriculumForAction(curriculum);
    setOpenDeleteDialog(true);
    setActionMenuAnchor(null);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCurriculumForAction(null);
  };

  const handleDeleteCurriculum = async () => {
    try {
      setLoading(true);
      const response = await deleteCurriculum(selectedCurriculumForAction.id);
      if (response.status) {
        showSnackbar('Curriculum deleted successfully', 'success');
        handleCloseDeleteDialog();
        loadCurriculums();
      } else {
        showSnackbar(response.message || 'Failed to delete curriculum', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to delete curriculum', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Action menu handlers
  const handleActionMenuOpen = (event, curriculum) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedCurriculumForAction(curriculum);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedCurriculumForAction(null);
  };

  const handleManageSubject = () => {
    setSelectedCurriculum(selectedCurriculumForAction.id);
    setShowSubjectBank(true);
    setActionMenuAnchor(null);
  };

  const handleAssignToClasses = () => {
    setSelectedCurriculum(selectedCurriculumForAction.id);
    setShowAssignToClasses(true);
    setActionMenuAnchor(null);
  };

  // Subject handlers (same as tenant version)
  const handleOpenAddSubjectModal = () => {
    if (!selectedCurriculum) {
      showSnackbar('Please select a curriculum first', 'error');
      return;
    }
    setSubjectFormData({ subject_name: '', subject_code: '', programme_id: '', unit: '', status: 'compulsory' });
    setOpenAddSubjectModal(true);
    if (programmesList.length === 0) {
      loadProgrammes();
    }
  };

  const handleCloseAddSubjectModal = () => {
    setOpenAddSubjectModal(false);
  };

  const handleCreateSubject = async () => {
    if (!subjectFormData.subject_name.trim() || !subjectFormData.programme_id) {
      showSnackbar('Subject name and program are required', 'error');
      return;
    }

    try {
      setLoading(true);
      const dataToSubmit = {
        ...subjectFormData,
        curriculum_id: selectedCurriculum,
      };
      const response = await createSubjectRecord(dataToSubmit);
      if (response.status) {
        showSnackbar('Subject created successfully', 'success');
        handleCloseAddSubjectModal();
        loadSubjectsList();
      } else {
        showSnackbar(response.message || 'Failed to create subject', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to create subject', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditSubjectModal = (subject) => {
    setSelectedSubject(subject);
    setSubjectFormData({
      subject_name: subject.subject_name,
      subject_code: subject.subject_code || '',
      programme_id: subject.programme_id || '',
      unit: subject.unit || '',
      status: subject.prog_subject_status || 'compulsory',
    });
    setOpenEditSubjectModal(true);
    if (programmesList.length === 0) {
      loadProgrammes();
    }
  };

  const handleCloseEditSubjectModal = () => {
    setOpenEditSubjectModal(false);
    setSelectedSubject(null);
    setSubjectFormData({ subject_name: '', subject_code: '', programme_id: '', unit: '', status: 'compulsory' });
  };

  const handleUpdateSubject = async () => {
    if (!subjectFormData.subject_name.trim() || !subjectFormData.programme_id) {
      showSnackbar('Subject name and program are required', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await updateSubjectRecord(selectedSubject.id, subjectFormData);
      if (response.status) {
        showSnackbar('Subject updated successfully', 'success');
        handleCloseEditSubjectModal();
        loadSubjectsList();
      } else {
        showSnackbar(response.message || 'Failed to update subject', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to update subject', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteSubjectDialog = (subject) => {
    setSelectedSubject(subject);
    setOpenDeleteSubjectDialog(true);
  };

  const handleCloseDeleteSubjectDialog = () => {
    setOpenDeleteSubjectDialog(false);
    setSelectedSubject(null);
  };

  const handleDeleteSubject = async () => {
    try {
      setLoading(true);
      const response = await deleteSubjectRecord(selectedSubject.id);
      if (response.status) {
        showSnackbar('Subject deleted successfully', 'success');
        handleCloseDeleteSubjectDialog();
        loadSubjectsList();
      } else {
        showSnackbar(response.message || 'Failed to delete subject', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to delete subject', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle class curriculum assignment change
  const handleClassCurriculumChange = (classId, curriculumId) => {
    const updated = classData.map((cls) =>
      cls.id === classId ? { ...cls, assigned_curriculum_id: curriculumId } : cls,
    );
    setClassData(updated);
  };

  // Handle save assignments
  const handleSaveAssignments = async () => {
    if (!selectedSession || !selectedTerm) {
      showSnackbar('Please select session and term', 'error');
      return;
    }

    const assignments = classData
      .filter((cls) => cls.assigned_curriculum_id)
      .map((cls) => ({
        class_id: cls.id,
        curriculum_id: cls.assigned_curriculum_id,
      }));

    if (assignments.length === 0) {
      showSnackbar('Please assign at least one curriculum to a class', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await saveClassAssignments(selectedSession, selectedTerm, assignments);
      if (response.status) {
        showSnackbar('Assignments saved successfully', 'success');
      } else {
        showSnackbar(response.message || 'Failed to save assignments', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to save assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Curriculum Manager">
      <Breadcrumb title="Curriculum Manager" items={BCrumb} />

      <Box>
        {/* TABS */}
        <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={handleTabChange}>
            <Tab label="Curriculum Setup" />
          </Tabs>
        </Box>

        {/* CONTENT */}
        <ParentCard>
          <TabPanel value={tab} index={0}>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexDirection: { xs: 'column', md: 'row' },
                width: '100%',
                mb: 3,
              }}
            >
              {/* LEFT - Curriculum Table */}
              <Box sx={{ flex: { md: 5 }, width: '100%', mb: 5 }}>
                <ParentCard
                  title={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h5">Curriculum</Typography>
                      <Button variant="contained" onClick={handleOpenCreateModal}>
                        Create Curriculum
                      </Button>
                    </Box>
                  }
                  sx={{ mb: 3 }}
                >
                  <Paper variant="outlined">
                    <TableContainer>
                      <Table sx={{ tableLayout: 'fixed' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}></TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>
                              Curriculum Name
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '20%' }}>
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={4} align="center">
                                <CircularProgress size={24} />
                              </TableCell>
                            </TableRow>
                          ) : curriculumData.length > 0 ? (
                            curriculumData.map((item, i) => (
                              <TableRow key={item.id} hover>
                                <TableCell>
                                  <Radio
                                    size="small"
                                    checked={selectedCurriculum === item.id}
                                    onChange={() => setSelectedCurriculum(item.id)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box
                                    sx={{
                                      px: 2,
                                      py: 0.5,
                                      bgcolor: '#f1f5f9',
                                      borderRadius: 2,
                                      display: 'inline-block',
                                    }}
                                  >
                                    {item.curriculum_name}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={item.status}
                                    size="small"
                                    sx={{
                                      bgcolor: item.status === 'active' ? '#dcfce7' : '#fee2e2',
                                      color: item.status === 'active' ? '#166534' : '#991b1b',
                                    }}
                                  />
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleActionMenuOpen(e, item)}
                                  >
                                    <MoreVertIcon size={16} />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} align="center">
                                <Typography color="textSecondary">No curriculums found</Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </ParentCard>

                {/* Assign to Classes Panel */}
                {showAssignToClasses && (
                  <Box sx={{ mt: 3 }}>
                    <ParentCard
                      title={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h5">Assign to Classes</Typography>
                          <Box display="flex" gap={1}>
                            <Select
                              size="small"
                              value={selectedSession}
                              onChange={(e) => handleSessionChange(e.target.value)}
                              displayEmpty
                            >
                              <MenuItem value="" disabled>
                                Select Session
                              </MenuItem>
                              {sessions.map((session) => (
                                <MenuItem key={session.id} value={session.id}>
                                  {session.sesname}
                                </MenuItem>
                              ))}
                            </Select>
                            <Select
                              size="small"
                              value={selectedTerm}
                              onChange={(e) => setSelectedTerm(e.target.value)}
                              displayEmpty
                            >
                              <MenuItem value="" disabled>
                                Select Term
                              </MenuItem>
                              {terms.map((term) => (
                                <MenuItem key={term.id} value={term.id}>
                                  {term.term_name}
                                </MenuItem>
                              ))}
                            </Select>
                            <Button
                              variant="contained"
                              onClick={handleSaveAssignments}
                              disabled={loading}
                            >
                              {loading ? <CircularProgress size={24} /> : 'Update'}
                            </Button>
                          </Box>
                        </Box>
                      }
                    >
                      <Paper variant="outlined">
                        <TableContainer>
                          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>S/N</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Class</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '60%' }}>
                                  Curriculum Name
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {loading ? (
                                <TableRow>
                                  <TableCell colSpan={3} align="center">
                                    <CircularProgress size={24} />
                                  </TableCell>
                                </TableRow>
                              ) : classData.length > 0 ? (
                                classData.map((item, i) => (
                                  <TableRow key={item.id} hover>
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell>
                                      <Box
                                        sx={{
                                          px: 2,
                                          py: 0.5,
                                          bgcolor: '#f1f5f9',
                                          borderRadius: 2,
                                          display: 'inline-block',
                                        }}
                                      >
                                        {item.class_name}
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Select
                                        size="small"
                                        value={item.assigned_curriculum_id || ''}
                                        onChange={(e) =>
                                          handleClassCurriculumChange(item.id, e.target.value)
                                        }
                                        displayEmpty
                                        sx={{
                                          bgcolor: '#f8fafc',
                                          borderRadius: 2,
                                          width: '100%',
                                        }}
                                      >
                                        <MenuItem value="" disabled>
                                          Select Curriculum
                                        </MenuItem>
                                        {curriculumData
                                          .filter((c) => c.status === 'active')
                                          .map((cur) => (
                                            <MenuItem key={cur.id} value={cur.id}>
                                              {cur.curriculum_name}
                                            </MenuItem>
                                          ))}
                                      </Select>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} align="center">
                                    <Typography color="textSecondary">
                                      Select session and term to load classes
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                    </ParentCard>
                  </Box>
                )}
              </Box>

              {/* RIGHT - Side Panels */}
              <Box sx={{ flex: { md: 7 }, width: '100%' }}>
                {/* Subject Bank Panel */}
                {showSubjectBank && (
                  <ParentCard
                    title={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Subject Bank
                        </Typography>
                        <Button variant="contained" onClick={handleOpenAddSubjectModal}>Add Subject</Button>
                      </Box>
                    }
                    sx={{ mb: 2 }}
                  >
                    <TableContainer>
                      <Table sx={{ tableLayout: 'fixed' }}>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#eef2f7' }}>
                            <TableCell width="8%">S/N</TableCell>
                            <TableCell width="25%">Subject</TableCell>
                            <TableCell width="15%">Subject Code</TableCell>
                            <TableCell width="15%">Program</TableCell>
                            <TableCell width="10%">Unit</TableCell>
                            <TableCell width="12%">Status</TableCell>
                            <TableCell width="15%" />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {loadingSubjects ? (
                            <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                          ) : subjectsList.length > 0 ? (
                            subjectsList.map((item, i) => (
                              <TableRow key={item.id} hover>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>
                                  <Box sx={{ px: 2, py: 0.5, bgcolor: '#f5f7fa', borderRadius: 2, display: 'inline-block' }}>{item.subject_name}</Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ px: 2, py: 0.5, bgcolor: '#eef2f7', borderRadius: 2, fontWeight: 600, display: 'inline-block' }}>{item.subject_code || '-'}</Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ px: 2, py: 0.5, bgcolor: '#f5f7fa', borderRadius: 2, display: 'inline-block' }}>{item.program_name}</Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ px: 2, py: 0.5, bgcolor: '#eef2f7', borderRadius: 2, fontWeight: 600, display: 'inline-block' }}>{item.unit || '-'}</Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={item.prog_subject_status || '-'}
                                    size="small"
                                    sx={{
                                      bgcolor: item.prog_subject_status === 'compulsory' ? '#dcfce7' : '#fef3c7',
                                      color: item.prog_subject_status === 'compulsory' ? '#166534' : '#92400e',
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    <IconButton size="small" sx={{ color: '#3b82f6' }} onClick={() => handleOpenEditSubjectModal(item)}>
                                      <IconEdit size={16} />
                                    </IconButton>
                                    <IconButton size="small" sx={{ color: '#ef4444' }} onClick={() => handleOpenDeleteSubjectDialog(item)}>
                                      <IconTrash size={16} />
                                    </IconButton>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow><TableCell colSpan={7} align="center"><Typography color="textSecondary">No subjects found. Please add a subject.</Typography></TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </ParentCard>
                )}
              </Box>
            </Box>
          </TabPanel>
        </ParentCard>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuList>
          <MenuItemComponent onClick={handleOpenEditModal}>
            <ListItemIcon>
              <IconEdit size={16} />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItemComponent>
          <MenuItemComponent onClick={handleManageSubject}>
            <ListItemIcon>
              <Subject fontSize="small" />
            </ListItemIcon>
            <ListItemText>Manage Subject</ListItemText>
          </MenuItemComponent>
          {/* <MenuItemComponent onClick={handleAssignToClasses}>
            <ListItemIcon>
              <Assignment fontSize="small" />
            </ListItemIcon>
            <ListItemText>Assign Curriculum to Class</ListItemText>
          </MenuItemComponent> */}
          <MenuItemComponent onClick={handleOpenDeleteDialog} sx={{ color: '#ef4444' }}>
            <ListItemIcon>
              <IconTrash size={16} style={{ color: '#ef4444' }} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItemComponent>
        </MenuList>
      </Menu>

      {/* Modals and Dialogs */}
      {/* Create Curriculum Modal */}
      <Dialog open={openCreateModal} onClose={handleCloseCreateModal} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Curriculum</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Curriculum Name"
              value={formData.curriculum_name}
              onChange={(e) => setFormData({ ...formData, curriculum_name: e.target.value })}
              margin="normal"
              required
            />
            <Select
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              margin="normal"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateModal}>Cancel</Button>
          <Button onClick={handleCreateCurriculum} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Curriculum Modal */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Curriculum</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Curriculum Name"
              value={formData.curriculum_name}
              onChange={(e) => setFormData({ ...formData, curriculum_name: e.target.value })}
              margin="normal"
              required
            />
            <Select
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              margin="normal"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancel</Button>
          <Button onClick={handleUpdateCurriculum} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Curriculum</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Are you sure you want to delete "{selectedCurriculumForAction?.curriculum_name}"? This action
            cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteCurriculum}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subject Modals */}
      {/* Add Subject Modal */}
      <Dialog open={openAddSubjectModal} onClose={handleCloseAddSubjectModal} maxWidth="sm" fullWidth>
        <DialogTitle>Add Subject</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Subject Name"
              value={subjectFormData.subject_name}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, subject_name: e.target.value })}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Subject Code"
              value={subjectFormData.subject_code}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, subject_code: e.target.value })}
              margin="normal"
            />

            <Select
              fullWidth
              value={subjectFormData.programme_id}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, programme_id: e.target.value })}
              displayEmpty
              margin="normal"
            >
              <MenuItem value="" disabled>Select Program</MenuItem>
              {programmesList.map((prog) => (
                <MenuItem key={prog.id} value={prog.id}>{prog.programme_title || prog.programme_name}</MenuItem>
              ))}
            </Select>

            <TextField
              fullWidth
              label="Unit"
              value={subjectFormData.unit}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, unit: e.target.value })}
              margin="normal"
            />

            <Select
              fullWidth
              value={subjectFormData.status}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, status: e.target.value })}
              margin="normal"
            >
              <MenuItem value="compulsory">Compulsory</MenuItem>
              <MenuItem value="optional">Optional</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddSubjectModal}>Cancel</Button>
          <Button onClick={handleCreateSubject} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save Subject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Subject Modal */}
      <Dialog open={openEditSubjectModal} onClose={handleCloseEditSubjectModal} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Subject</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Subject Name"
              value={subjectFormData.subject_name}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, subject_name: e.target.value })}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Subject Code"
              value={subjectFormData.subject_code}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, subject_code: e.target.value })}
              margin="normal"
            />

            <Select
              fullWidth
              value={subjectFormData.programme_id}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, programme_id: e.target.value })}
              displayEmpty
              margin="normal"
            >
              <MenuItem value="" disabled>Select Program</MenuItem>
              {programmesList.map((prog) => (
                <MenuItem key={prog.id} value={prog.id}>{prog.programme_title || prog.programme_name}</MenuItem>
              ))}
            </Select>

            <TextField
              fullWidth
              label="Unit"
              value={subjectFormData.unit}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, unit: e.target.value })}
              margin="normal"
            />

            <Select
              fullWidth
              value={subjectFormData.status}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, status: e.target.value })}
              margin="normal"
            >
              <MenuItem value="compulsory">Compulsory</MenuItem>
              <MenuItem value="optional">Optional</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditSubjectModal}>Cancel</Button>
          <Button onClick={handleUpdateSubject} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Update Subject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Subject Dialog */}
      <Dialog open={openDeleteSubjectDialog} onClose={handleCloseDeleteSubjectDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Subject</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Are you sure you want to delete "{selectedSubject?.subject_name}"? This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteSubjectDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteSubject}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default AgentCurriculumManager;
