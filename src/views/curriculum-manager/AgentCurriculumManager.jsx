import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from '../../components/shared/ParentCard';
import {
  fetchCurriculums,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
  fetchProgrammes,
  fetchSubjects,
  createSubjectRecord,
  updateSubjectRecord,
  deleteSubjectRecord,
} from '../../api/curriculumApi';
import AgentSchemeOfWork from '../scheme-of-work/AgentSchemeOfWork';
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
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { MoreVert as MoreVertIcon, Subject } from '@mui/icons-material';
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

  // Action menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedCurriculumForAction, setSelectedCurriculumForAction] = useState(null);

  // Subject Bank Action Menu State
  const [subjectMenuAnchor, setSubjectMenuAnchor] = useState(null);
  const [selectedSubjectForMenu, setSelectedSubjectForMenu] = useState(null);

  // Data states
  const [curriculumData, setCurriculumData] = useState([]);

  // Subject Bank states
  const [subjectsList, setSubjectsList] = useState([]);
  const [programmesList, setProgrammesList] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState('');
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
  const [subjectErrors, setSubjectErrors] = useState({});

  // Modal states
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [curriculumToDelete, setCurriculumToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    curriculum_name: '',
    status: 'active',
  });

  // Per-card loading states
  const [loadingCurriculums, setLoadingCurriculums] = useState(false);
  const [loadingMutation, setLoadingMutation] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch data on component mount
  useEffect(() => {
    loadCurriculums();
  }, []);

  useEffect(() => {
    if (selectedCurriculum) {
      loadSubjectsList();
      setShowSubjectBank(true);
    } else {
      setSubjectsList([]);
      setShowSubjectBank(false);
    }
  }, [selectedCurriculum, subjectSearch]);

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
  };

  // API Functions
  const loadCurriculums = async () => {
    try {
      setLoadingCurriculums(true);
      const response = await fetchCurriculums();
      if (response.status) {
        setCurriculumData(response.data);
        if (response.data.length > 0 && !selectedCurriculum) {
          setSelectedCurriculum(response.data[0].id);
        }
      }
    } catch (error) {
      showSnackbar('Failed to load curriculums', 'error');
    } finally {
      setLoadingCurriculums(false);
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
      const response = await fetchSubjects(selectedCurriculum, subjectSearch);
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
      setLoadingMutation(true);
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
      setLoadingMutation(false);
    }
  };

  // Edit Curriculum
  const handleOpenEditModal = (curriculum) => {
    setSelectedCurriculumForAction(curriculum);
    setFormData({
      curriculum_name: curriculum?.curriculum_name,
      status: curriculum?.status,
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
      setLoadingMutation(true);
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
      setLoadingMutation(false);
    }
  };

  // Delete Curriculum
  const handleOpenDeleteDialog = (curriculum) => {
    setCurriculumToDelete(curriculum);
    setOpenDeleteDialog(true);
    setActionMenuAnchor(null);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurriculumToDelete(null);
  };

  const handleDeleteCurriculum = async () => {
    try {
      setLoadingMutation(true);
      const response = await deleteCurriculum(curriculumToDelete.id);
      if (response.status) {
        showSnackbar('Curriculum deleted successfully', 'success');
        handleCloseDeleteDialog();
        loadCurriculums();
      } else {
        showSnackbar(response.message || 'Failed to delete curriculum', 'error');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to delete curriculum';
      showSnackbar(msg, 'error');
    } finally {
      setLoadingMutation(false);
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

  // Subject Bank Menu Handlers
  const handleOpenSubjectMenu = (event, subject) => {
    setSubjectMenuAnchor(event.currentTarget);
    setSelectedSubjectForMenu(subject);
  };

  const handleCloseSubjectMenu = () => {
    setSubjectMenuAnchor(null);
    setSelectedSubjectForMenu(null);
  };

  const handleSubjectMenuEdit = () => {
    if (selectedSubjectForMenu) {
      handleOpenEditSubjectModal(selectedSubjectForMenu);
    }
    handleCloseSubjectMenu();
  };

  const handleSubjectMenuDelete = () => {
    if (selectedSubjectForMenu) {
      handleOpenDeleteSubjectDialog(selectedSubjectForMenu);
    }
    handleCloseSubjectMenu();
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
    setSubjectFormData({
      subject_name: '',
      subject_code: '',
      programme_id: '',
      unit: '',
      status: 'compulsory',
    });
    setOpenAddSubjectModal(true);
    if (programmesList.length === 0) {
      loadProgrammes();
    }
  };

  const handleCloseAddSubjectModal = () => {
    setOpenAddSubjectModal(false);
    setSubjectFormData({
      subject_name: '',
      subject_code: '',
      programme_id: '',
      unit: '',
      status: 'compulsory',
    });
    setSubjectErrors({});
  };

  const validateSubject = () => {
    const errs = {};
    if (!subjectFormData.subject_name?.trim()) errs.subject_name = 'Subject name is required';
    if (!subjectFormData.subject_code?.trim()) errs.subject_code = 'Subject code is required';
    if (!subjectFormData.programme_id) errs.programme_id = 'Please select a program';
    setSubjectErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBackendErrors = (errs) => {
    if (!errs) return;
    const mapped = {};
    Object.keys(errs).forEach((key) => {
      mapped[key] = Array.isArray(errs[key]) ? errs[key][0] : errs[key];
    });
    setSubjectErrors(mapped);
  };

  const handleCreateSubject = async () => {
    if (!validateSubject()) return;
    try {
      setLoadingMutation(true);
      const dataToSubmit = { ...subjectFormData, curriculum_id: selectedCurriculum };
      const response = await createSubjectRecord(dataToSubmit);
      if (response.status) {
        showSnackbar('Subject created successfully', 'success');
        handleCloseAddSubjectModal();
        loadSubjectsList();
      } else {
        if (response.errors) handleBackendErrors(response.errors);
        showSnackbar(response.message || 'Failed to create subject', 'error');
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        handleBackendErrors(error.response.data.errors);
      }
      showSnackbar(error.response?.data?.message || 'Failed to create subject', 'error');
    } finally {
      setLoadingMutation(false);
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
    setSubjectFormData({
      subject_name: '',
      subject_code: '',
      programme_id: '',
      unit: '',
      status: 'compulsory',
    });
    setSubjectErrors({});
  };

  const handleUpdateSubject = async () => {
    if (!validateSubject()) return;
    try {
      setLoadingMutation(true);
      const response = await updateSubjectRecord(selectedSubject.id, subjectFormData);
      if (response.status) {
        showSnackbar('Subject updated successfully', 'success');
        handleCloseEditSubjectModal();
        loadSubjectsList();
      } else {
        if (response.errors) handleBackendErrors(response.errors);
        showSnackbar(response.message || 'Failed to update subject', 'error');
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        handleBackendErrors(error.response.data.errors);
      }
      showSnackbar(error.response?.data?.message || 'Failed to update subject', 'error');
    } finally {
      setLoadingMutation(false);
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
      setLoadingMutation(true);
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
      setLoadingMutation(false);
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
            <Tab label="Scheme of Work" />
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
                          {loadingCurriculums ? (
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
                                    <MoreVertIcon fontSize="small" />
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
              </Box>

              {/* RIGHT - Side Panels */}
              <Box sx={{ flex: { md: 7 }, width: '100%' }}>
                {/* Subject Bank Panel */}
                {showSubjectBank && (
                  <ParentCard
                    title={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Subject Bank for{' '}
                          <strong>
                            {curriculumData.find((c) => c.id === selectedCurriculum)
                              ?.curriculum_name || 'Selected Curriculum'}
                          </strong>
                        </Typography>

                        <Button variant="contained" onClick={handleOpenAddSubjectModal}>
                          Add Subject
                        </Button>

                      </Box>
                    }
                    sx={{ mb: 2 }}
                  >
                    <TableContainer sx={{ maxHeight: 600 }}>
                      <TextField
                        size="small"
                        placeholder="Search subjects..."
                        value={subjectSearch}
                        onChange={(e) => setSubjectSearch(e.target.value)}
                        sx={{ width: 200 }}
                      />
                      <Table sx={{ tableLayout: 'fixed' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell width="5%">S/N</TableCell>
                            <TableCell width="10%">Subject</TableCell>
                            <TableCell width="7%">Code</TableCell>
                            <TableCell width="15%">Program</TableCell>
                            <TableCell width="5%">Unit</TableCell>
                            <TableCell width="12%">Status</TableCell>
                            <TableCell width="5%">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {loadingSubjects ? (
                            <TableRow>
                              <TableCell colSpan={7} align="center">
                                <CircularProgress size={24} />
                              </TableCell>
                            </TableRow>
                          ) : subjectsList.length > 0 ? (
                            subjectsList.map((item, i) => (
                              <TableRow key={item.id} hover>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>
                                  <Box
                                    sx={{
                                      px: 2,
                                      py: 0.5,
                                      bgcolor: '#f5f7fa',
                                      borderRadius: 2,
                                      display: 'inline-block',
                                    }}
                                  >
                                    {item.subject_name}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box
                                    sx={{
                                      px: 2,
                                      py: 0.5,
                                      bgcolor: '#eef2f7',
                                      borderRadius: 2,
                                      fontWeight: 600,
                                      display: 'inline-block',
                                    }}
                                  >
                                    {item.subject_code || '-'}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box
                                    sx={{
                                      px: 2,
                                      py: 0.5,
                                      bgcolor: '#f5f7fa',
                                      borderRadius: 2,
                                      display: 'inline-block',
                                    }}
                                  >
                                    {item.program_name}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box
                                    sx={{
                                      px: 2,
                                      py: 0.5,
                                      bgcolor: '#eef2f7',
                                      borderRadius: 2,
                                      fontWeight: 600,
                                      display: 'inline-block',
                                    }}
                                  >
                                    {item.unit || '-'}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={item.prog_subject_status || '-'}
                                    size="small"
                                    sx={{
                                      bgcolor:
                                        item.prog_subject_status === 'compulsory'
                                          ? '#dcfce7'
                                          : '#fef3c7',
                                      color:
                                        item.prog_subject_status === 'compulsory'
                                          ? '#166534'
                                          : '#92400e',
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleOpenSubjectMenu(e, item)}
                                    aria-controls={
                                      Boolean(subjectMenuAnchor) ? 'subject-menu' : undefined
                                    }
                                    aria-haspopup="true"
                                    aria-expanded={Boolean(subjectMenuAnchor) ? 'true' : undefined}
                                  >
                                    <MoreVertIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} align="center">
                                <Typography color="textSecondary">
                                  No subjects found. Please add a subject.
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </ParentCard>
                )}
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <AgentSchemeOfWork isTab={true} />
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
          <MenuItemComponent onClick={() => handleOpenEditModal(selectedCurriculumForAction)}>
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
          <MenuItemComponent onClick={() => handleOpenDeleteDialog(selectedCurriculumForAction)} sx={{ color: '#ef4444' }}>
            <ListItemIcon>
              <IconTrash size={16} style={{ color: '#ef4444' }} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItemComponent>
        </MenuList>
      </Menu>

      {/* Subject Bank Action Menu */}
      <Menu
        id="subject-menu"
        anchorEl={subjectMenuAnchor}
        open={Boolean(subjectMenuAnchor)}
        onClose={handleCloseSubjectMenu}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItemComponent onClick={handleSubjectMenuEdit}>
          <ListItemIcon>
            <IconEdit size={18} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItemComponent>

        <MenuItemComponent onClick={handleSubjectMenuDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <IconTrash size={18} style={{ color: '#ef4444' }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItemComponent>
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
          <Button onClick={handleCreateCurriculum} variant="contained" disabled={loadingMutation}>
            {loadingMutation ? <CircularProgress size={24} /> : 'Create'}
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
          <Button onClick={handleUpdateCurriculum} variant="contained" disabled={loadingMutation}>
            {loadingMutation ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Curriculum</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 2 }}>
            Are you sure you want to delete "{curriculumToDelete?.curriculum_name}"? This
            action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteCurriculum}
            variant="contained"
            color="error"
            disabled={loadingMutation}
          >
            {loadingMutation ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subject Modals */}
      {/* Add Subject Modal */}
      <Dialog
        open={openAddSubjectModal}
        onClose={handleCloseAddSubjectModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Subject</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Subject Name" error={!!subjectErrors.subject_name} helperText={subjectErrors.subject_name}
              value={subjectFormData.subject_name}
              onChange={(e) => {
                setSubjectErrors((p) => ({ ...p, subject_name: undefined }));
                setSubjectFormData({ ...subjectFormData, subject_name: e.target.value });
              }}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Subject Code" error={!!subjectErrors.subject_code} helperText={subjectErrors.subject_code} required
              value={subjectFormData.subject_code}
              onChange={(e) => {
                setSubjectErrors((p) => ({ ...p, subject_code: undefined }));
                setSubjectFormData({ ...subjectFormData, subject_code: e.target.value });
              }}
              margin="normal"
            />

            <FormControl fullWidth margin="normal" error={!!subjectErrors.programme_id}>
              <InputLabel id="program-select-label">Select Program</InputLabel>
              <Select
                labelId="program-select-label"
                label="Select Program"
                value={subjectFormData.programme_id}
                onChange={(e) => {
                  setSubjectErrors((p) => ({ ...p, programme_id: undefined }));
                  setSubjectFormData({ ...subjectFormData, programme_id: e.target.value });
                }}
              >
                {programmesList.map((prog) => (
                  <MenuItem key={prog.id} value={prog.id}>
                    {prog.programme_name}
                  </MenuItem>
                ))}
              </Select>
              {subjectErrors.programme_id && (
                <FormHelperText>{subjectErrors.programme_id}</FormHelperText>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Unit"
              value={subjectFormData.unit}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, unit: e.target.value })}
              margin="normal"
              type="number"
              inputProps={{ min: 0 }}
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
          <Button onClick={handleCreateSubject} variant="contained" disabled={loadingMutation}>
            {loadingMutation ? <CircularProgress size={24} /> : 'Save Subject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Subject Modal */}
      <Dialog
        open={openEditSubjectModal}
        onClose={handleCloseEditSubjectModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Subject</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Subject Name" error={!!subjectErrors.subject_name} helperText={subjectErrors.subject_name}
              value={subjectFormData.subject_name}
              onChange={(e) => {
                setSubjectErrors((p) => ({ ...p, subject_name: undefined }));
                setSubjectFormData({ ...subjectFormData, subject_name: e.target.value });
              }}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Subject Code" error={!!subjectErrors.subject_code} helperText={subjectErrors.subject_code} required
              value={subjectFormData.subject_code}
              onChange={(e) => {
                setSubjectErrors((p) => ({ ...p, subject_code: undefined }));
                setSubjectFormData({ ...subjectFormData, subject_code: e.target.value });
              }}
              margin="normal"
            />

            <FormControl fullWidth margin="normal" error={!!subjectErrors.programme_id}>
              <InputLabel id="edit-program-select-label">Select Program</InputLabel>
              <Select
                labelId="edit-program-select-label"
                label="Select Program"
                value={subjectFormData.programme_id}
                onChange={(e) => {
                  setSubjectErrors((p) => ({ ...p, programme_id: undefined }));
                  setSubjectFormData({ ...subjectFormData, programme_id: e.target.value });
                }}
              >
                {programmesList.map((prog) => (
                  <MenuItem key={prog.id} value={prog.id}>
                    {prog.programme_name}
                  </MenuItem>
                ))}
              </Select>
              {subjectErrors.programme_id && (
                <FormHelperText>{subjectErrors.programme_id}</FormHelperText>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Unit"
              value={subjectFormData.unit}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, unit: e.target.value })}
              margin="normal"
              type="number"
              inputProps={{ min: 0 }}
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
          <Button onClick={handleUpdateSubject} variant="contained" disabled={loadingMutation}>
            {loadingMutation ? <CircularProgress size={24} /> : 'Update Subject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Subject Dialog */}
      <Dialog
        open={openDeleteSubjectDialog}
        onClose={handleCloseDeleteSubjectDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Subject</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 2 }}>
            Are you sure you want to delete "{selectedSubject?.subject_name}"? This action cannot be
            undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteSubjectDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteSubject}
            variant="contained"
            color="error"
            disabled={loadingMutation}
          >
            {loadingMutation ? <CircularProgress size={24} /> : 'Delete'}
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
