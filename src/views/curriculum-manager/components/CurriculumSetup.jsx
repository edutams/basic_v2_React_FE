import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import ParentCard from '../../../components/shared/ParentCard';
import {
  fetchCurriculums,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
  importAllCurriculums,
  fetchClassAssignments,
  saveClassAssignments,
  fetchSessions,
  fetchTerms,
  fetchAgentCurriculums,
  fetchCurriculumSubjects,
  importSelectedCurriculums,
} from '../../../api/tenantCurriculumApi';

const SubjectBox = ({ curriculum, subjects, onViewSchemes }) => {
  return (
    <Paper sx={{ mb: 2, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2" fontWeight="bold">
          {curriculum.curriculum_name}
        </Typography>
      </Box>
      <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
        {subjects.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" color="info.main">
              No subjects found for the selected curriculum
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              px: 1,
            }}
          >
            {subjects.map((subject) => (
              <Box
                key={subject.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1,
                  bgcolor: 'background.default',
                  borderRadius: 1
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {subject.subject_name}
                </Typography>

                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={`${subject.schemes ? Object.keys(subject.schemes).length : 0} Schemes`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => onViewSchemes(subject)}
                    disabled={!subject.schemes || Object.keys(subject.schemes).length === 0}
                  >
                    View
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

const CurriculumSetup = () => {
  // Internal state
  const [curriculums, setCurriculums] = useState([]);
  const [loadingCurriculums, setLoadingCurriculums] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);

  // Assign to Classes state
  const [classData, setClassData] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  // Import Curriculum state
  const [agentCurriculums, setAgentCurriculums] = useState([]);
  const [selectedCurriculums, setSelectedCurriculums] = useState([]);
  const [curriculumSubjects, setCurriculumSubjects] = useState({});
  const [loadingAgentCurriculums, setLoadingAgentCurriculums] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [openImportConfirmModal, setOpenImportConfirmModal] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [viewSchemesSubject, setViewSchemesSubject] = useState(null);
  const [curriculumAnchorEl, setCurriculumAnchorEl] = useState(null);
  const [openCurriculumMenu, setOpenCurriculumMenu] = useState(false);
  const [formData, setFormData] = useState({
    curriculum_name: '',
    status: 'active',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [fieldErrors, setFieldErrors] = useState({});

  // Methods
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchCurriculumsData = async () => {
    setLoadingCurriculums(true);
    try {
      const response = await fetchCurriculums();
      if (response.status) {
        setCurriculums(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to fetch curriculums', 'error');
    } finally {
      setLoadingCurriculums(false);
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({ curriculum_name: '', status: 'active' });
    setOpenCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
  };

  const handleOpenEditModal = (event, curriculum) => {
    setSelectedCurriculum(curriculum);
    setFormData({
      curriculum_name: curriculum.curriculum_name || curriculum.name,
      status: curriculum.status,
    });
    setOpenEditModal(true);
    setCurriculumAnchorEl(event?.currentTarget);
    setOpenCurriculumMenu(false);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedCurriculum(null);
  };

  // Sessions and Terms functions
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
      setLoadingAssignments(true);
      const response = await fetchClassAssignments(selectedSession, selectedTerm);
      if (response.status) {
        setClassData(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to load class assignments', 'error');
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleClassCurriculumChange = (classId, curriculumId) => {
    const updated = classData.map((cls) =>
      cls.id === classId ? { ...cls, assigned_curriculum_id: curriculumId } : cls,
    );
    setClassData(updated);
  };

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
      setLoadingSave(true);
      const response = await saveClassAssignments(selectedSession, selectedTerm, assignments);
      if (response.status) {
        showSnackbar('Assignments saved successfully', 'success');
      } else {
        showSnackbar(response.message || 'Failed to save assignments', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to save assignments', 'error');
    } finally {
      setLoadingSave(false);
    }
  };

  const handleOpenDeleteModal = () => {
    setOpenDeleteModal(true);
    setOpenCurriculumMenu(false);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedCurriculum(null);
  };

  const handleCreateCurriculum = async () => {
    setFieldErrors({});

    try {
      const response = await createCurriculum(formData);

      if (response.status) {
        showSnackbar('Curriculum created successfully', 'success');
        handleCloseCreateModal();
        fetchCurriculumsData();
      }
    } catch (error) {
      console.log(error);

      if (error.response?.status === 422) {
        const errors = error.response.data?.errors;

        if (errors) {
          setFieldErrors(errors);
        }

        showSnackbar(
          error.response.data?.message || 'Validation failed',
          'error'
        );

        return;
      }

      showSnackbar(
        error.response?.data?.message || 'Failed to create curriculum',
        'error'
      );
    }
  };

  const handleUpdateCurriculum = async () => {
    setFieldErrors({});

    try {
      const response = await updateCurriculum(selectedCurriculum.id, formData);

      if (response.status) {
        showSnackbar('Curriculum updated successfully', 'success');
        handleCloseEditModal();
        fetchCurriculumsData();
      }
    } catch (error) {
      console.log(error);

      if (error.response?.status === 422) {
        const errors = error.response.data?.errors;

        if (errors) {
          setFieldErrors(errors);
        }

        showSnackbar(
          error.response.data?.message || 'Validation failed',
          'error'
        );

        return;
      }

      showSnackbar(
        error.response?.data?.message || 'Failed to update curriculum',
        'error'
      );
    }
  };

  const handleDeleteCurriculum = async () => {
    try {
      const response = await deleteCurriculum(selectedCurriculum.id);
      if (response.status) {
        showSnackbar('Curriculum deleted successfully', 'success');
        handleCloseDeleteModal();
        fetchCurriculumsData();
      } else {
        showSnackbar(response.message || 'Failed to delete curriculum', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to delete curriculum', 'error');
    }
  };

  const handleOpenImportModal = () => {
    setOpenImportModal(true);
    loadAgentCurriculums();
  };

  const handleCloseImportModal = () => {
    setOpenImportModal(false);
  };


  const handleOpenMenu = (event, curriculum) => {
    setSelectedCurriculum(curriculum);
    setCurriculumAnchorEl(event.currentTarget);
    setOpenCurriculumMenu(true);
  };

  const handleCloseCurriculumMenu = () => {
    setCurriculumAnchorEl(null);
    setOpenCurriculumMenu(false);
  };

  // Import Curriculum functions
  const loadAgentCurriculums = async () => {
    setLoadingAgentCurriculums(true);
    try {
      const response = await fetchAgentCurriculums();
      if (response.status) {
        setAgentCurriculums(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to load agent curriculums', 'error');
    } finally {
      setLoadingAgentCurriculums(false);
    }
  };

  const loadCurriculumSubjects = async (curriculumId) => {
    if (curriculumSubjects[curriculumId]) return; // Already loaded

    setLoadingSubjects(true);
    try {
      const response = await fetchCurriculumSubjects(curriculumId);
      if (response.status) {
        setCurriculumSubjects(prev => ({
          ...prev,
          [curriculumId]: response.data
        }));
        // Initialize selected subjects for this curriculum
        setSelectedSubjects(prev => ({
          ...prev,
          [curriculumId]: []
        }));
      }
    } catch (error) {
      showSnackbar('Failed to load curriculum subjects', 'error');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleCurriculumSelect = (curriculumId, checked) => {
    setSelectedCurriculums(prev => {
      const newSelection = checked
        ? [...prev, curriculumId]
        : prev.filter(id => id !== curriculumId);

      // Load subjects if curriculum is selected
      if (checked && !curriculumSubjects[curriculumId]) {
        loadCurriculumSubjects(curriculumId);
      }

      return newSelection;
    });
  };

  const handleSelectAllCurriculums = (checked) => {
    if (checked) {
      const allIds = agentCurriculums.map(c => c.id);
      setSelectedCurriculums(allIds);
      // Load subjects for all curriculums
      allIds.forEach(id => {
        if (!curriculumSubjects[id]) {
          loadCurriculumSubjects(id);
        }
      });
    } else {
      setSelectedCurriculums([]);
    }
  };

  const handleViewSchemes = (subject) => {
    setViewSchemesSubject(subject);
  };

  const handleCloseViewSchemes = () => {
    setViewSchemesSubject(null);
  };

  const handleImportSelected = async () => {
    if (selectedCurriculums.length === 0) {
      showSnackbar('Please select at least one curriculum', 'error');
      return;
    }

    // Show confirmation dialog
    setOpenImportConfirmModal(true);
  };

  const handleConfirmImport = async () => {
    setLoadingImport(true);
    const importData = selectedCurriculums.map(curriculumId => ({
      curriculum_id: curriculumId,
      subject_ids: (curriculumSubjects[curriculumId] || []).map(s => s.id)
    }));

    try {
      const response = await importSelectedCurriculums(importData);
      if (response.status) {
        showSnackbar('Curriculums imported successfully', 'success');
        setOpenImportConfirmModal(false);
        handleCloseImportModal();
        fetchCurriculumsData();
      } else {
        showSnackbar(response.message || 'Failed to import curriculums', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to import curriculums', 'error');
    } finally {
      setLoadingImport(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchCurriculumsData();
    loadSessionsAndTerms();
  }, []);

  // Load class assignments when session or term changes
  useEffect(() => {
    if (selectedSession && selectedTerm) {
      loadClassAssignments();
    }
  }, [selectedSession, selectedTerm]);
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexDirection: { xs: 'column', md: 'row' },
          width: '100%',
        }}
      >
        {/* LEFT - Curriculum Table */}
        <Box sx={{ flex: { md: 6 }, width: '100%' }}>
          <ParentCard
            title={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Curriculum</Typography>
                <Box display="flex" gap={1}>
                  <Button variant="outlined" onClick={handleOpenImportModal} size="small">
                    Import
                  </Button>
                  <Button variant="contained" onClick={handleOpenCreateModal} size="small">
                    Create Curriculum
                  </Button>
                </Box>
              </Box>
            }
          >
            <Paper variant="outlined">
              <TableContainer>
                <Table sx={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: '8%' }}>S/N</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>
                        Curriculum Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '17%' }}>
                        Imported
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '25%' }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingCurriculums ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <CircularProgress size={24} />
                        </TableCell>
                      </TableRow>
                    ) : curriculums.length > 0 ? (
                      curriculums.map((item, i) => (
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
                          <TableCell>
                            <Chip
                              label={item.agent_curriculum_id ? 'Yes' : 'No'}
                              size="small"
                              sx={{
                                bgcolor: item.agent_curriculum_id ? '#dbeafe' : '#f3f4f6',
                                color: item.agent_curriculum_id ? '#1e40af' : '#6b7280',
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenMenu(e, item)}
                              aria-controls={
                                selectedCurriculum?.id === item.id ? 'curriculum-menu' : undefined
                              }
                              aria-haspopup="true"
                              aria-expanded={selectedCurriculum?.id === item.id ? 'true' : undefined}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="textSecondary">No curriculums found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </ParentCard>
        </Box>

        {/* RIGHT - Assign to Classes */}
        <Box sx={{ flex: { md: 6 }, width: '100%' }}>
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
                    disabled={loadingSave}
                    size="small"
                  >
                    {loadingSave ? <CircularProgress size={24} /> : 'Update'}
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
                      <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Class</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>
                        Curriculum Name
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingAssignments ? (
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
                              {curriculums
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
      </Box>

      {/* Curriculum Action Menu */}
      <Menu
        id="curriculum-menu"
        anchorEl={curriculumAnchorEl}
        open={openCurriculumMenu}
        onClose={handleCloseCurriculumMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleOpenEditModal(null, selectedCurriculum)}>
          <IconEdit size={18} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleOpenDeleteModal} sx={{ color: 'error.main' }}>
          <IconTrash size={18} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Curriculum Modal */}
      <Dialog open={openCreateModal} onClose={handleCloseCreateModal} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Curriculum</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Curriculum Name"
              value={formData.curriculum_name}
              onChange={(e) => setFormData({ ...formData, curriculum_name: e.target.value })}
              margin="normal"
              size='small'
              required
              error={!!fieldErrors.curriculum_name}
              helperText={fieldErrors.curriculum_name?.[0]}
            />
            <FormControl fullWidth margin="normal" size='small'>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size='small' onClick={handleCloseCreateModal}>Cancel</Button>
          <Button variant="contained" size='small' onClick={handleCreateCurriculum}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Curriculum Modal */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Curriculum</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Curriculum Name"
              value={formData.curriculum_name}
              onChange={(e) => setFormData({ ...formData, curriculum_name: e.target.value })}
              margin="normal"
              required
              size='small'
              error={!!fieldErrors.curriculum_name}
              helperText={fieldErrors.curriculum_name?.[0]}
            />
            <FormControl fullWidth margin="normal" size='small'>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size='small' onClick={handleCloseEditModal}>Cancel</Button>
          <Button variant="contained" size='small' onClick={handleUpdateCurriculum}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Curriculum Modal */}
      <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Curriculum</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedCurriculum?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button size='small' onClick={handleCloseDeleteModal}>Cancel</Button>
          <Button variant="contained" color="error" size='small' onClick={handleDeleteCurriculum}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Curriculum Modal */}
      <Dialog
        open={openImportModal}
        onClose={handleCloseImportModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Import Curriculum
        </DialogTitle>

        <DialogContent sx={{ p: 1 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '380px 1fr',
              },
              gap: 2,
              minHeight: 500,
            }}
          >
            {/* LEFT PANEL */}
            <Paper
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                height: 'fit-content',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                }}
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  Curriculums
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Select curriculums to import subjects
                </Typography>
              </Box>

              {/* Content */}
              <Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">

                          <Checkbox
                            size="small"
                            checked={
                              agentCurriculums.length > 0 &&
                              selectedCurriculums.length ===
                              agentCurriculums.length
                            }
                            indeterminate={
                              selectedCurriculums.length > 0 &&
                              selectedCurriculums.length <
                              agentCurriculums.length
                            }
                            onChange={(e) =>
                              handleSelectAllCurriculums(e.target.checked)
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Typography fontWeight={600}>
                            Curriculum Name
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {loadingAgentCurriculums ? (
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            align="center"
                            sx={{ py: 6 }}
                          >
                            <CircularProgress size={24} />
                          </TableCell>
                        </TableRow>
                      ) : agentCurriculums.length > 0 ? (
                        agentCurriculums.map((curriculum) => (
                          <TableRow
                            key={curriculum.id}
                            hover
                            selected={selectedCurriculums.includes(
                              curriculum.id
                            )}
                            // onClick={() =>
                            //   handleCurriculumSelect(
                            //     curriculum.id,
                            //     !selectedCurriculums.includes(curriculum.id)
                            //   )
                            // }
                            sx={{
                              cursor: 'pointer',
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                size="small"
                                checked={selectedCurriculums.includes(
                                  curriculum.id
                                )}
                                onChange={(e) =>
                                  handleCurriculumSelect(
                                    curriculum.id,
                                    e.target.checked
                                  )
                                }
                              />
                            </TableCell>

                            <TableCell>
                              <Typography variant="body2">
                                {curriculum.curriculum_name}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            align="center"
                            sx={{ py: 6 }}
                          >
                            <Typography color="text.secondary">
                              No curriculums available
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>

            {/* RIGHT PANEL */}
            <Paper
              variant="outlined"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 2,
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'background.paper',
                  zIndex: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  Subjects
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Subjects from selected curriculums
                </Typography>
              </Box>

              {/* Body */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                }}
              >
                {selectedCurriculums.length === 0 ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      borderStyle: 'dashed',
                    }}
                  >
                    <Typography color="text.secondary">
                      Select curriculums to view subjects
                    </Typography>
                  </Paper>
                ) : (
                  <Box display="flex" flexDirection="column" gap={2}>
                    {selectedCurriculums.map((curriculumId) => {
                      const curriculum = agentCurriculums.find(
                        (c) => c.id === curriculumId
                      );

                      const subjects =
                        curriculumSubjects[curriculumId] || [];

                      return (
                        <SubjectBox
                          key={curriculumId}
                          curriculum={curriculum}
                          subjects={subjects}
                          onViewSchemes={handleViewSchemes}
                        />
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button size="small" onClick={handleCloseImportModal}>
            Cancel
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={handleImportSelected}
            disabled={selectedCurriculums.length === 0}
          >
            Import ({selectedCurriculums.length})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Confirmation Modal */}
      <Dialog open={openImportConfirmModal} onClose={() => setOpenImportConfirmModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Import</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to import the selected curriculum(s) and subject(s)?
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              This action will import:
            </Typography>
            <Box sx={{ ml: 2 }}>
              {selectedCurriculums.map(curriculumId => {
                const curriculum = agentCurriculums.find(c => c.id === curriculumId);
                const subjectCount = (curriculumSubjects[curriculumId] || []).length;
                return (
                  <Box key={curriculumId} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      • {curriculum?.curriculum_name}
                    </Typography>
                    {subjectCount > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        {subjectCount} subject(s) included
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setOpenImportConfirmModal(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleConfirmImport}
            color="primary"
            disabled={loadingImport}
            startIcon={loadingImport ? <CircularProgress size={16} /> : null}
          >
            {loadingImport ? 'Importing...' : 'Confirm Import'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Schemes Modal */}
      <Dialog open={Boolean(viewSchemesSubject)} onClose={handleCloseViewSchemes} maxWidth="sm" fullWidth>
        <DialogTitle>
          Schemes of Work
          <Typography variant="caption" display="block" color="text.secondary">
            {viewSchemesSubject?.subject_name}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {viewSchemesSubject?.schemes?.length > 0 ? (
            <Box display="flex" flexDirection="column" gap={2}>
              {viewSchemesSubject.schemes.map((scheme, index) => (
                <Paper key={scheme.id || index} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {scheme.term?.term_name || `Term ${scheme.term_id}`} - {scheme.week?.week_name || `Week ${scheme.week_id}`}
                  </Typography>
                  {scheme.learning_objective && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Objective:</strong> {scheme.learning_objective}
                    </Typography>
                  )}
                  {scheme.topics && scheme.topics.length > 0 && (
                    <Box mt={1}>
                      <Typography variant="body2" fontWeight="bold">Topics:</Typography>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {scheme.topics.map(topic => (
                          <li key={topic.id}>
                            <Typography variant="body2" color="text.secondary">
                              {topic.topic_name}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" align="center">
              No schemes of work available.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewSchemes}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CurriculumSetup;
