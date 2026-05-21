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
  Grid,
  FormHelperText,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import ParentCard from '@/components/shared/ParentCard';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchClassSubjects,
  addOrUpdateClassSubject,
  fetchSubjects,
  fetchSubjectsByProgramme,
} from '@/api/tenant/curriculum/tenantCurriculumApi';

const ClassSubject = () => {
  // Internal state
  const [programmesList, setProgrammesList] = useState([]);
  const [loadingProgrammes, setLoadingProgrammes] = useState(false);
  const [program, setProgram] = useState('');
  const [classesForProgram, setClassesForProgram] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classSubjects, setClassSubjects] = useState([]);
  const [loadingClassSubjects, setLoadingClassSubjects] = useState(false);

  // State for available subjects
  const [availableSubjectsForClass, setAvailableSubjectsForClass] = useState([]);
  const [loadingAvailableSubjects, setLoadingAvailableSubjects] = useState(false);

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
    status: 'compulsory',
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

  // Loading states for buttons
  const [loadingAddSubject, setLoadingAddSubject] = useState(false);
  const [loadingUpdateSubject, setLoadingUpdateSubject] = useState(false);

  // Methods
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchProgrammesData = async () => {
    setLoadingProgrammes(true);
    try {
      const response = await fetchProgrammes();
      if (response.status) {
        setProgrammesList(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to fetch programmes', 'error');
    } finally {
      setLoadingProgrammes(false);
    }
  };

  const fetchClassesData = async (programmeId) => {
    setLoadingClasses(true);
    try {
      const response = await fetchClassesByProgramme(programmeId);
      if (response.status) {
        setClassesForProgram(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to fetch classes', 'error');
    } finally {
      setLoadingClasses(false);
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

  const fetchAvailableSubjectsForClass = async () => {
    setLoadingAvailableSubjects(true);
    try {
      let response;
      if (program) {
        // Fetch subjects by programme if program is selected
        response = await fetchSubjectsByProgramme(program);
      } else {
        // Otherwise fetch all subjects (you might want to adjust this based on your needs)
        response = await fetchSubjects('');
      }

      if (response.status) {
        setAvailableSubjectsForClass(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to fetch available subjects', 'error');
    } finally {
      setLoadingAvailableSubjects(false);
    }
  };

  const handleOpenAddSubjectToClass = () => {
    setClassSubjectFormData({
      subject_id: '',
      pass_mark: '',
      unit: '',
      status: 'compulsory',
    });
    fetchAvailableSubjectsForClass();
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
      status: subject.status || 'compulsory',
    });
    // Ensure available subjects are loaded for display
    if (availableSubjectsForClass.length === 0) {
      fetchAvailableSubjectsForClass();
    }
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
    setLoadingAddSubject(true);

    // Validate required fields before submission
    const validationErrors = {};
    if (!selectedClass) validationErrors.class_id = ['Please select a class'];
    if (!program) validationErrors.programme_id = ['Please select a programme'];
    if (!classSubjectFormData.subject_id) validationErrors.subject_id = ['Please select a subject'];
    if (!classSubjectFormData.pass_mark) validationErrors.pass_mark = ['Pass mark is required'];
    if (!classSubjectFormData.unit) validationErrors.unit = ['Unit is required'];
    if (!classSubjectFormData.status) validationErrors.status = ['Status is required'];

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setLoadingAddSubject(false);
      return;
    }

    try {
      // Prepare payload with all required fields
      const payload = {
        class_id: selectedClass,
        programme_id: program,
        subject_id: classSubjectFormData.subject_id,
        pass_mark: classSubjectFormData.pass_mark,
        unit: classSubjectFormData.unit,
        status: classSubjectFormData.status,
      };

      const response = await addOrUpdateClassSubject(payload);

      if (response.status) {
        showSnackbar('Subject added to class successfully', 'success');
        handleCloseAddSubjectToClassModal();
        fetchClassSubjectsData(selectedClass);
      } else {
        // Display the detailed error message from the backend
        const errorMessage = response.error || response.message || 'Failed to add subject to class';
        showSnackbar(errorMessage, 'error');
      }
    } catch (error) {
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors;

        if (errors) {
          setFieldErrors(errors);
        }

        showSnackbar(error.response.data?.message || 'Validation failed', 'error');

        return;
      }

      // Handle other API error responses
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage =
          errorData.error || errorData.message || 'Failed to add subject to class';
        showSnackbar(errorMessage, 'error');
      } else {
        showSnackbar('Failed to add subject to class', 'error');
      }
    } finally {
      setLoadingAddSubject(false);
    }
  };

  const handleUpdateClassSubject = async () => {
    setFieldErrors({});
    setLoadingUpdateSubject(true);

    // Validate required fields before submission
    const validationErrors = {};
    if (!selectedClass) validationErrors.class_id = ['Please select a class'];
    if (!program) validationErrors.programme_id = ['Please select a programme'];
    if (!classSubjectFormData.subject_id) validationErrors.subject_id = ['Please select a subject'];
    if (!classSubjectFormData.pass_mark) validationErrors.pass_mark = ['Pass mark is required'];
    if (!classSubjectFormData.unit) validationErrors.unit = ['Unit is required'];
    if (!classSubjectFormData.status) validationErrors.status = ['Status is required'];

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setLoadingUpdateSubject(false);
      return;
    }

    try {
      // Prepare payload with all required fields
      const payload = {
        class_id: selectedClass,
        programme_id: program,
        subject_id: classSubjectFormData.subject_id,
        pass_mark: classSubjectFormData.pass_mark,
        unit: classSubjectFormData.unit,
        status: classSubjectFormData.status,
      };

      const response = await addOrUpdateClassSubject(payload);

      if (response.status) {
        showSnackbar('Class subject updated successfully', 'success');
        handleCloseEditClassSubjectModal();
        fetchClassSubjectsData(selectedClass);
      } else {
        // Display the detailed error message from the backend
        const errorMessage = response.error || response.message || 'Failed to update class subject';
        showSnackbar(errorMessage, 'error');
      }
    } catch (error) {
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors;

        if (errors) {
          setFieldErrors(errors);
        }

        showSnackbar(error.response.data?.message || 'Validation failed', 'error');

        return;
      }

      // Handle other API error responses
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage =
          errorData.error || errorData.message || 'Failed to update class subject';
        showSnackbar(errorMessage, 'error');
      } else {
        showSnackbar('Failed to update class subject', 'error');
      }
    } finally {
      setLoadingUpdateSubject(false);
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
  }, []);

  useEffect(() => {
    if (program) {
      fetchAvailableSubjectsForClass();
    }
  }, [program]);

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
              disabled={loadingProgrammes}
            >
              <MenuItem value="" disabled>
                {loadingProgrammes ? 'Loading programmes...' : 'Select Program'}
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
            {loadingClasses ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <RadioGroup
                value={selectedClass}
                onChange={(e) => setSelectedClass(Number(e.target.value))}
              >
                {classesForProgram.length > 0 ? (
                  classesForProgram.map((cls) => (
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
                  ))
                ) : program ? (
                  <Typography color="textSecondary" align="center" py={2}>
                    No classes found for this programme
                  </Typography>
                ) : (
                  <Typography color="textSecondary" align="center" py={2}>
                    Select a programme to view classes
                  </Typography>
                )}
              </RadioGroup>
            )}
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
                size="small"
                disabled={!selectedClass}
                onClick={handleOpenAddSubjectToClass}
              >
                Add Subject to Class
              </Button>
            </Box>
          }
        >
          <Paper variant="outlined">
            <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
              <Table sx={{ minWidth: 700 }} size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: '5%' }}>S/N</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Passmark</TableCell>
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
                          <IconButton size="small" onClick={(e) => handleOpenEditModal(e, subject)}>
                            <MoreVertIcon size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="textSecondary">
                          {selectedClass
                            ? 'No subjects assigned to this class'
                            : 'Select a class to view subjects'}
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
      <Dialog
        open={openAddSubjectToClassModal}
        onClose={handleCloseAddSubjectToClassModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Subject to Class</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              {/* Subject */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small" error={!!fieldErrors.subject_id}>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={classSubjectFormData.subject_id}
                    onChange={(e) =>
                      setClassSubjectFormData({
                        ...classSubjectFormData,
                        subject_id: e.target.value,
                      })
                    }
                    label="Subject"
                    disabled={loadingAvailableSubjects}
                  >
                    <MenuItem value="" disabled>
                      {loadingAvailableSubjects ? 'Loading subjects...' : 'Select Subject'}
                    </MenuItem>
                    {availableSubjectsForClass.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.subject_name}
                        {s.subject_code ? ` (${s.subject_code})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.subject_id && (
                    <FormHelperText>{fieldErrors.subject_id?.[0]}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Pass Mark */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Pass Mark"
                  type="number"
                  value={classSubjectFormData.pass_mark}
                  onChange={(e) =>
                    setClassSubjectFormData({
                      ...classSubjectFormData,
                      pass_mark: e.target.value,
                    })
                  }
                  required
                  error={!!fieldErrors.pass_mark}
                  helperText={fieldErrors.pass_mark?.[0]}
                  size="small"
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>

              {/* Unit */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Unit"
                  type="number"
                  value={classSubjectFormData.unit}
                  onChange={(e) =>
                    setClassSubjectFormData({
                      ...classSubjectFormData,
                      unit: e.target.value,
                    })
                  }
                  required
                  error={!!fieldErrors.unit}
                  helperText={fieldErrors.unit?.[0]}
                  size="small"
                  inputProps={{ min: 1 }}
                />
              </Grid>

              {/* Status */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small" error={!!fieldErrors.status}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={classSubjectFormData.status}
                    onChange={(e) =>
                      setClassSubjectFormData({
                        ...classSubjectFormData,
                        status: e.target.value,
                      })
                    }
                    label="Status"
                  >
                    <MenuItem value="compulsory">Compulsory</MenuItem>
                    <MenuItem value="optional">Optional</MenuItem>
                  </Select>
                  {fieldErrors.status && <FormHelperText>{fieldErrors.status?.[0]}</FormHelperText>}
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            onClick={handleCloseAddSubjectToClassModal}
            disabled={loadingAddSubject}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleAddSubjectToClass}
            disabled={loadingAddSubject || loadingAvailableSubjects}
            startIcon={loadingAddSubject ? <CircularProgress size={16} /> : null}
          >
            {loadingAddSubject
              ? 'Adding...'
              : loadingAvailableSubjects
                ? 'Loading...'
                : 'Add Subject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Class Subject Modal */}
      <Dialog
        open={openEditClassSubjectModal}
        onClose={handleCloseEditClassSubjectModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Class Subject</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small" margin="normal">
                  <InputLabel>Subject</InputLabel>
                  <Select value={classSubjectFormData.subject_id} disabled label="Subject">
                    <MenuItem value={classSubjectFormData.subject_id}>
                      {/* Subject name will be loaded from available subjects */}
                      {availableSubjectsForClass.find(
                        (s) => s.id === classSubjectFormData.subject_id,
                      )?.subject_name || 'Selected Subject'}
                      {availableSubjectsForClass.find(
                        (s) => s.id === classSubjectFormData.subject_id,
                      )?.subject_code
                        ? ` (${availableSubjectsForClass.find((s) => s.id === classSubjectFormData.subject_id)?.subject_code})`
                        : ''}
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Pass Mark"
                  type="number"
                  value={classSubjectFormData.pass_mark}
                  onChange={(e) =>
                    setClassSubjectFormData({
                      ...classSubjectFormData,
                      pass_mark: e.target.value,
                    })
                  }
                  margin="normal"
                  required
                  error={!!fieldErrors.pass_mark}
                  helperText={fieldErrors.pass_mark?.[0]}
                  size="small"
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Unit"
                  type="number"
                  value={classSubjectFormData.unit}
                  onChange={(e) =>
                    setClassSubjectFormData({
                      ...classSubjectFormData,
                      unit: e.target.value,
                    })
                  }
                  margin="normal"
                  required
                  error={!!fieldErrors.unit}
                  helperText={fieldErrors.unit?.[0]}
                  size="small"
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small" margin="normal" error={!!fieldErrors.status}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={classSubjectFormData.status}
                    onChange={(e) =>
                      setClassSubjectFormData({
                        ...classSubjectFormData,
                        status: e.target.value,
                      })
                    }
                    label="Status"
                  >
                    <MenuItem value="compulsory">Compulsory</MenuItem>
                    <MenuItem value="optional">Optional</MenuItem>
                  </Select>
                  {fieldErrors.status && <FormHelperText>{fieldErrors.status?.[0]}</FormHelperText>}
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            onClick={handleCloseEditClassSubjectModal}
            disabled={loadingUpdateSubject}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleUpdateClassSubject}
            disabled={loadingUpdateSubject}
            startIcon={loadingUpdateSubject ? <CircularProgress size={16} /> : null}
          >
            {loadingUpdateSubject ? 'Updating...' : 'Update Subject'}
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
