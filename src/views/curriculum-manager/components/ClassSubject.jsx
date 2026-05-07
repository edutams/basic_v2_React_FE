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
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import ParentCard from '../../../components/shared/ParentCard';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassSubjects,
  addOrUpdateClassSubject,
  fetchSubjectGroups,
  createSubjectGroup,
  updateSubjectGroup,
  deleteSubjectGroup,
} from '../../../api/tenantCurriculumApi';

const ClassSubject = () => {
  // Internal state
  const [programmesList, setProgrammesList] = useState([]);
  const [program, setProgram] = useState('');
  const [classesForProgram, setClassesForProgram] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classSubjects, setClassSubjects] = useState([]);
  const [loadingClassSubjects, setLoadingClassSubjects] = useState(false);
  const [subjectGroupsList, setSubjectGroupsList] = useState([]);
  const [loadingSubjectGroups, setLoadingSubjectGroups] = useState(false);

  // Modal states for Class Subjects
  const [openAddSubjectToClassModal, setOpenAddSubjectToClassModal] = useState(false);
  const [openEditClassSubjectModal, setOpenEditClassSubjectModal] = useState(false);
  const [openDeleteClassSubjectModal, setOpenDeleteClassSubjectModal] = useState(false);
  const [selectedClassSubject, setSelectedClassSubject] = useState(null);
  const [classSubjectAnchorEl, setClassSubjectAnchorEl] = useState(null);
  const [openClassSubjectMenu, setOpenClassSubjectMenu] = useState(false);
  const [classSubjectFormData, setClassSubjectFormData] = useState({
    subject_id: '',
    pass_mark: '',
    unit: '',
    status: 'active',
  });

  // Modal states for Subject Groups
  const [openCreateSubjectGroupModal, setOpenCreateSubjectGroupModal] = useState(false);
  const [openEditSubjectGroupModal, setOpenEditSubjectGroupModal] = useState(false);
  const [openDeleteSubjectGroupModal, setOpenDeleteSubjectGroupModal] = useState(false);
  const [selectedSubjectGroup, setSelectedSubjectGroup] = useState(null);
  const [subjectGroupAnchorEl, setSubjectGroupAnchorEl] = useState(null);
  const [openSubjectGroupMenu, setOpenSubjectGroupMenu] = useState(false);
  const [subjectGroupFormData, setSubjectGroupFormData] = useState({
    group_name: '',
    unit: '',
    pass_mark: '',
    status: 'active',
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [fieldErrors, setFieldErrors] = useState({});

  // Methods
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchProgrammesData = async () => {
    try {
      const response = await fetchProgrammes();
      if (response.status) {
        setProgrammesList(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to fetch programmes', 'error');
    }
  };

  const fetchClassesData = async (programmeId) => {
    try {
      const response = await fetchClassesByProgramme(programmeId);
      if (response.status) {
        setClassesForProgram(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to fetch classes', 'error');
    }
  };

  const fetchClassSubjectsData = async (classId) => {
    setLoadingClassSubjects(true);
    try {
      const response = await fetchClassSubjects(classId);
      if (response.status) {
        setClassSubjects(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to fetch class subjects', 'error');
    } finally {
      setLoadingClassSubjects(false);
    }
  };

  const fetchSubjectGroupsData = async () => {
    setLoadingSubjectGroups(true);
    try {
      const response = await fetchSubjectGroups();
      if (response.status) {
        setSubjectGroupsList(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to fetch subject groups', 'error');
    } finally {
      setLoadingSubjectGroups(false);
    }
  };

  const handleOpenAddSubjectToClass = () => {
    setClassSubjectFormData({
      subject_id: '',
      pass_mark: '',
      unit: '',
      status: 'active',
    });
    setOpenAddSubjectToClassModal(true);
  };

  const handleCloseAddSubjectToClassModal = () => {
    setOpenAddSubjectToClassModal(false);
  };

  const handleOpenEditClassSubjectModal = (event, subject) => {
    setSelectedClassSubject(subject);
    setClassSubjectFormData({
      subject_id: subject.subject_id,
      pass_mark: subject.pass_mark,
      unit: subject.unit,
      status: subject.status,
    });
    setOpenEditClassSubjectModal(true);
    setClassSubjectAnchorEl(event?.currentTarget);
    setOpenClassSubjectMenu(false);
  };

  const handleCloseEditClassSubjectModal = () => {
    setOpenEditClassSubjectModal(false);
    setSelectedClassSubject(null);
  };

  const handleAddSubjectToClass = async () => {
    setFieldErrors({});

    try {
      const response = await addOrUpdateClassSubject(selectedClass, classSubjectFormData);

      if (response.status) {
        showSnackbar('Subject added to class successfully', 'success');
        handleCloseAddSubjectToClassModal();
        fetchClassSubjectsData(selectedClass);
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
        error.response?.data?.message || 'Failed to add subject to class',
        'error'
      );
    }
  };

  const handleUpdateClassSubject = async () => {
    setFieldErrors({});

    try {
      const response = await addOrUpdateClassSubject(selectedClass, selectedClassSubject.id, classSubjectFormData);

      if (response.status) {
        showSnackbar('Class subject updated successfully', 'success');
        handleCloseEditClassSubjectModal();
        fetchClassSubjectsData(selectedClass);
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
        error.response?.data?.message || 'Failed to update class subject',
        'error'
      );
    }
  };

  // Subject Groups methods
  const handleCreateSubjectGroup = async () => {
    try {
      const response = await createSubjectGroup(subjectGroupFormData);
      if (response.status) {
        showSnackbar('Subject group created successfully', 'success');
        setOpenCreateSubjectGroupModal(false);
        fetchSubjectGroupsData();
      } else {
        showSnackbar(response.message || 'Failed to create subject group', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to create subject group', 'error');
    }
  };

  const handleUpdateSubjectGroup = async () => {
    try {
      const response = await updateSubjectGroup(selectedSubjectGroup.id, subjectGroupFormData);
      if (response.status) {
        showSnackbar('Subject group updated successfully', 'success');
        setOpenEditSubjectGroupModal(false);
        fetchSubjectGroupsData();
      } else {
        showSnackbar(response.message || 'Failed to update subject group', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to update subject group', 'error');
    }
  };

  const handleDeleteSubjectGroup = async () => {
    try {
      const response = await deleteSubjectGroup(selectedSubjectGroup.id);
      if (response.status) {
        showSnackbar('Subject group deleted successfully', 'success');
        setOpenDeleteSubjectGroupModal(false);
        fetchSubjectGroupsData();
      } else {
        showSnackbar(response.message || 'Failed to delete subject group', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to delete subject group', 'error');
    }
  };

  // Menu handlers
  const handleOpenEditModal = (event, subject) => {
    handleOpenEditClassSubjectModal(event, subject);
  };

  const handleOpenDeleteModal = () => {
    setOpenDeleteClassSubjectModal(true);
    setOpenClassSubjectMenu(false);
  };

  const handleOpenSubjectGroupMenu = (event, group) => {
    setSelectedSubjectGroup(group);
    setSubjectGroupAnchorEl(event.currentTarget);
    setOpenSubjectGroupMenu(true);
  };

  const handleCloseClassSubjectMenu = () => {
    setClassSubjectAnchorEl(null);
    setOpenClassSubjectMenu(false);
  };

  const handleCloseSubjectGroupMenu = () => {
    setSubjectGroupAnchorEl(null);
    setOpenSubjectGroupMenu(false);
  };

  // Placeholder methods for modals that aren't fully implemented
  const handleCloseDeleteClassSubjectModal = () => {
    setOpenDeleteClassSubjectModal(false);
    setSelectedClassSubject(null);
  };

  const handleCloseCreateSubjectGroupModal = () => {
    setOpenCreateSubjectGroupModal(false);
  };

  const handleCloseEditSubjectGroupModal = () => {
    setOpenEditSubjectGroupModal(false);
    setSelectedSubjectGroup(null);
  };

  const handleCloseDeleteSubjectGroupModal = () => {
    setOpenDeleteSubjectGroupModal(false);
    setSelectedSubjectGroup(null);
  };

  // Effects
  useEffect(() => {
    fetchProgrammesData();
    fetchSubjectGroupsData();
  }, []);

  useEffect(() => {
    if (program) {
      fetchClassesData(program);
    }
  }, [program]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassSubjectsData(selectedClass);
    }
  }, [selectedClass]);
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        flexDirection: { xs: 'column', md: 'row' },
        width: '100%',
      }}
    >
      {/* LEFT: Program and Classes */}
      <Box sx={{ flex: { md: 4 }, width: '100%' }}>
        <ParentCard
          title={
            <Select
              size="small"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="" disabled>
                Select Program
              </MenuItem>
              {programmesList.map((prog) => (
                <MenuItem key={prog.id} value={prog.id}>
                  {prog.programme_name}
                </MenuItem>
              ))}
            </Select>
          }
        >
          <Box mt={2}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Classes
            </Typography>
            <RadioGroup
              value={selectedClass}
              onChange={(e) => setSelectedClass(Number(e.target.value))}
            >
              {classesForProgram.map((cls) => (
                <Box
                  key={cls.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 1,
                    py: 0.8,
                    borderRadius: 2,
                    bgcolor: selectedClass === cls.id ? '#eef2ff' : 'transparent',
                  }}
                >
                  <FormControlLabel
                    value={cls.id}
                    control={<Radio size="small" />}
                    label={cls.class_name}
                    sx={{ width: '100%' }}
                  />
                </Box>
              ))}
            </RadioGroup>
          </Box>
        </ParentCard>
      </Box>

      {/* RIGHT: Subjects */}
      <Box sx={{ flex: { md: 8 }, width: '100%' }}>
        <ParentCard
          title={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Class Subjects
              </Typography>
              <Button
                variant="contained"
                size='small'
                disabled={!selectedClass}
                onClick={handleOpenAddSubjectToClass}
              >
                Add Subject to Class
              </Button>
            </Box>
          }
        >
          <Paper variant="outlined">
            <TableContainer>
              <Table sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: '5%' }}>S/N</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>
                      Passmark
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Unit</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '10%' }} align="center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingClassSubjects ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : classSubjects.length > 0 ? (
                    classSubjects.map((subject, i) => (
                      <TableRow key={subject.id} hover>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{subject.subject_name}</TableCell>
                        <TableCell>{subject.pass_mark}</TableCell>
                        <TableCell>{subject.unit}</TableCell>
                        <TableCell>
                          <Chip
                            label={subject.status}
                            size="small"
                            sx={{
                              bgcolor: subject.status === 'active' ? '#dcfce7' : '#fee2e2',
                              color: subject.status === 'active' ? '#166534' : '#991b1b',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenEditModal(e, subject)}
                          >
                            <MoreVertIcon size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="textSecondary">
                          {selectedClass ? 'No subjects assigned to this class' : 'Select a class to view subjects'}
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

      {/* Subject Groups Section */}
      <Box sx={{ flex: { md: 12 }, width: '100%' }}>
        <ParentCard
          title={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Subject Groups
              </Typography>
              <Button variant="contained" size='small' onClick={() => setOpenCreateSubjectGroupModal(true)}>
                Create Subject Group
              </Button>
            </Box>
          }
        >
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#eef2f7' }}>
                  <TableCell width="8%">#</TableCell>
                  <TableCell width="22%">Group Name</TableCell>
                  <TableCell width="30%">Subjects</TableCell>
                  <TableCell width="10%">Unit</TableCell>
                  <TableCell width="12%">Pass Mark</TableCell>
                  <TableCell width="20%">Status</TableCell>
                  <TableCell width="8%" align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingSubjectGroups ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : subjectGroupsList.length > 0 ? (
                  subjectGroupsList.map((grp, i) => (
                    <TableRow key={grp.id} hover>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{grp.group_name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {grp.subjects?.map((s) => (
                            <Chip
                              key={s.id}
                              label={s.subject_name}
                              size="small"
                              sx={{
                                bgcolor: '#334155',
                                color: '#fff',
                                fontSize: '0.7rem',
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{grp.unit}</TableCell>
                      <TableCell>{grp.pass_mark}</TableCell>
                      <TableCell>
                        <Chip
                          label={grp.status === 'active' ? 'active' : 'inactive'}
                          size="small"
                          sx={{
                            bgcolor: grp.status === 'active' ? '#dcfce7' : '#fee2e2',
                            color: grp.status === 'active' ? '#166534' : '#991b1b',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenSubjectGroupMenu(e, grp)}
                        >
                          <MoreVertIcon size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="textSecondary">No subject groups yet</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </ParentCard>
      </Box>

      {/* Class Subject Action Menu */}
      <Menu
        id="class-subject-menu"
        anchorEl={classSubjectAnchorEl}
        open={openClassSubjectMenu}
        onClose={handleCloseClassSubjectMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleOpenEditModal(null, selectedClassSubject)}>
          <IconEdit size={18} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
      </Menu>

      {/* Subject Group Action Menu */}
      <Menu
        id="subject-group-menu"
        anchorEl={subjectGroupAnchorEl}
        open={openSubjectGroupMenu}
        onClose={handleCloseSubjectGroupMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleOpenSubjectGroupMenu(null, selectedSubjectGroup)}>
          <IconEdit size={18} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleOpenDeleteModal} sx={{ color: 'error.main' }}>
          <IconTrash size={18} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add Subject to Class Modal */}
      <Dialog open={openAddSubjectToClassModal} onClose={handleCloseAddSubjectToClassModal} maxWidth="md" fullWidth>
        <DialogTitle>Add Subject to Class</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Subject</InputLabel>
              <Select
                value={classSubjectFormData.subject_id}
                onChange={(e) => setClassSubjectFormData({ ...classSubjectFormData, subject_id: e.target.value })}
                label="Subject"
              >
                <MenuItem value="" disabled>Select Subject</MenuItem>
                {/* Subjects will be populated here */}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Pass Mark"
              type="number"
              value={classSubjectFormData.pass_mark}
              onChange={(e) => setClassSubjectFormData({ ...classSubjectFormData, pass_mark: e.target.value })}
              margin="normal"
              required
              error={!!fieldErrors.pass_mark}
              helperText={fieldErrors.pass_mark?.[0]}
            />
            <TextField
              fullWidth
              label="Unit"
              type="number"
              value={classSubjectFormData.unit}
              onChange={(e) => setClassSubjectFormData({ ...classSubjectFormData, unit: e.target.value })}
              margin="normal"
              required
              error={!!fieldErrors.unit}
              helperText={fieldErrors.unit?.[0]}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={classSubjectFormData.status}
                onChange={(e) => setClassSubjectFormData({ ...classSubjectFormData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size='small' onClick={handleCloseAddSubjectToClassModal}>Cancel</Button>
          <Button variant="contained" size='small' onClick={handleAddSubjectToClass}>
            Add Subject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Class Subject Modal */}
      <Dialog open={openEditClassSubjectModal} onClose={handleCloseEditClassSubjectModal} maxWidth="md" fullWidth>
        <DialogTitle>Edit Class Subject</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Pass Mark"
              type="number"
              value={classSubjectFormData.pass_mark}
              onChange={(e) => setClassSubjectFormData({ ...classSubjectFormData, pass_mark: e.target.value })}
              margin="normal"
              required
              error={!!fieldErrors.pass_mark}
              helperText={fieldErrors.pass_mark?.[0]}
            />
            <TextField
              fullWidth
              label="Unit"
              type="number"
              value={classSubjectFormData.unit}
              onChange={(e) => setClassSubjectFormData({ ...classSubjectFormData, unit: e.target.value })}
              margin="normal"
              required
              error={!!fieldErrors.unit}
              helperText={fieldErrors.unit?.[0]}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={classSubjectFormData.status}
                onChange={(e) => setClassSubjectFormData({ ...classSubjectFormData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size='small' onClick={handleCloseEditClassSubjectModal}>Cancel</Button>
          <Button variant="contained" size='small' onClick={handleUpdateClassSubject}>
            Update Subject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Subject Group Modal */}
      <Dialog open={openCreateSubjectGroupModal} onClose={handleCloseCreateSubjectGroupModal} maxWidth="md" fullWidth>
        <DialogTitle>Create Subject Group</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Group Name"
              value={subjectGroupFormData.group_name}
              onChange={(e) => setSubjectGroupFormData({ ...subjectGroupFormData, group_name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Unit"
              type="number"
              value={subjectGroupFormData.unit}
              onChange={(e) => setSubjectGroupFormData({ ...subjectGroupFormData, unit: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Pass Mark"
              type="number"
              value={subjectGroupFormData.pass_mark}
              onChange={(e) => setSubjectGroupFormData({ ...subjectGroupFormData, pass_mark: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={subjectGroupFormData.status}
                onChange={(e) => setSubjectGroupFormData({ ...subjectGroupFormData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size='small' onClick={handleCloseCreateSubjectGroupModal}>Cancel</Button>
          <Button variant="contained" size='small' onClick={handleCreateSubjectGroup}>
            Create Group
          </Button>
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
    </Box>
  );
};

export default ClassSubject;
