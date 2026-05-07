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
  CircularProgress,
  Snackbar,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import ParentCard from '../../../components/shared/ParentCard';
import {
  fetchSubjects,
  fetchProgrammes,
  createSubjectRecord,
  updateSubjectRecord,
  deleteSubjectRecord,
  fetchSubjectGroups,
  createSubjectGroup,
  updateSubjectGroup,
  deleteSubjectGroup,
  fetchCurriculums,
} from '../../../api/tenantCurriculumApi';

const SubjectBank = () => {
  // Internal state
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [programmesList, setProgrammesList] = useState([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [openAddSubjectModal, setOpenAddSubjectModal] = useState(false);
  const [openEditSubjectModal, setOpenEditSubjectModal] = useState(false);
  const [openDeleteSubjectModal, setOpenDeleteSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectAnchorEl, setSubjectAnchorEl] = useState(null);
  const [openSubjectMenu, setOpenSubjectMenu] = useState(false);
  const [subjectFormData, setSubjectFormData] = useState({
    subject_name: '',
    subject_code: '',
    programme_id: '',
    pass_mark: '',
    unit: '',
    status: '',
    curriculum_id: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [fieldErrors, setFieldErrors] = useState({});

  // Curriculum state
  const [curriculumData, setCurriculumData] = useState([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState('');

  // Subject Groups state
  const [subjectGroupsList, setSubjectGroupsList] = useState([]);
  const [loadingSubjectGroups, setLoadingSubjectGroups] = useState(false);
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

  // Methods
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchCurriculumData = async () => {
    try {
      const response = await fetchCurriculums();
      if (response.status) {
        setCurriculumData(response.data);
        // Auto-select first curriculum if none selected
        if (response.data.length > 0 && !selectedCurriculum) {
          setSelectedCurriculum(response.data[0].id);
        }
      }
    } catch (error) {
      showSnackbar('Failed to fetch curriculums', 'error');
    }
  };

  const fetchSubjectsData = async () => {
    if (!selectedCurriculum) {
      setSubjects([]);
      return;
    }
    
    setLoadingSubjects(true);
    try {
      const response = await fetchSubjects(selectedCurriculum);
      if (response.status) {
        setSubjects(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to fetch subjects', 'error');
    } finally {
      setLoadingSubjects(false);
    }
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

  const handleOpenAddSubjectModal = () => {
    setSubjectFormData({
      subject_name: '',
      subject_code: '',
      programme_id: '',
      pass_mark: '',
      unit: '',
      curriculum_id: selectedCurriculum,
    });
    setOpenAddSubjectModal(true);
  };

  const handleCloseAddSubjectModal = () => {
    setOpenAddSubjectModal(false);
  };

  const handleOpenEditModal = (event, subject) => {
    setSelectedSubject(subject);
    setSubjectFormData({
      subject_name: subject.subject_name,
      subject_code: subject.subject_code,
      programme_id: subject.programme_id,
      pass_mark: subject.pass_mark,
      unit: subject.unit,
      curriculum_id: selectedCurriculum,
    });
    setOpenEditSubjectModal(true);
    setSubjectAnchorEl(event?.currentTarget);
    setOpenSubjectMenu(false);
  };

  const handleCloseEditSubjectModal = () => {
    setOpenEditSubjectModal(false);
    setSelectedSubject(null);
  };

  const handleOpenDeleteModal = () => {
    setOpenDeleteSubjectModal(true);
    setOpenSubjectMenu(false);
  };

  const handleCloseDeleteSubjectModal = () => {
    setOpenDeleteSubjectModal(false);
    setSelectedSubject(null);
  };

  const handleCreateSubject = async () => {
    setFieldErrors({});

    try {
      const response = await createSubjectRecord(subjectFormData);

      if (response.status) {
        showSnackbar('Subject created successfully', 'success');
        handleCloseAddSubjectModal();
        fetchSubjectsData();
      }
    } catch (error) {

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
        error.response?.data?.message || 'Failed to create subject',
        'error'
      );
    }
  };

  const handleUpdateSubject = async () => {
    setFieldErrors({});

    try {
      const response = await updateSubjectRecord(selectedSubject.id, subjectFormData);

      if (response.status) {
        showSnackbar('Subject updated successfully', 'success');
        handleCloseEditSubjectModal();
        fetchSubjectsData();
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
        error.response?.data?.message || 'Failed to update subject',
        'error'
      );
    }
  };

  const handleDeleteSubject = async () => {
    try {
      const response = await deleteSubjectRecord(selectedSubject.id);
      if (response.status) {
        showSnackbar('Subject deleted successfully', 'success');
        handleCloseDeleteSubjectModal();
        fetchSubjectsData();
      } else {
        showSnackbar(response.message || 'Failed to delete subject', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to delete subject', 'error');
    }
  };

  const handleCloseSubjectMenu = () => {
    setSubjectAnchorEl(null);
    setOpenSubjectMenu(false);
  };

  // Subject Groups methods
  const handleOpenCreateSubjectGroupModal = () => {
    setSubjectGroupFormData({
      group_name: '',
      unit: '',
      pass_mark: '',
      status: 'active',
    });
    setOpenCreateSubjectGroupModal(true);
  };

  const handleCloseCreateSubjectGroupModal = () => {
    setOpenCreateSubjectGroupModal(false);
  };

  const handleOpenEditSubjectGroupModal = (event, group) => {
    setSelectedSubjectGroup(group);
    setSubjectGroupFormData({
      group_name: group.group_name,
      unit: group.unit,
      pass_mark: group.pass_mark,
      status: group.status,
    });
    setOpenEditSubjectGroupModal(true);
    setSubjectGroupAnchorEl(event?.currentTarget);
    setOpenSubjectGroupMenu(false);
  };

  const handleCloseEditSubjectGroupModal = () => {
    setOpenEditSubjectGroupModal(false);
    setSelectedSubjectGroup(null);
  };

  const handleOpenDeleteSubjectGroupModal = () => {
    setOpenDeleteSubjectGroupModal(true);
    setOpenSubjectGroupMenu(false);
  };

  const handleCloseDeleteSubjectGroupModal = () => {
    setOpenDeleteSubjectGroupModal(false);
    setSelectedSubjectGroup(null);
  };

  const handleCreateSubjectGroup = async () => {
    try {
      const response = await createSubjectGroup(subjectGroupFormData);
      if (response.status) {
        showSnackbar('Subject group created successfully', 'success');
        handleCloseCreateSubjectGroupModal();
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
        handleCloseEditSubjectGroupModal();
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
        handleCloseDeleteSubjectGroupModal();
        fetchSubjectGroupsData();
      } else {
        showSnackbar(response.message || 'Failed to delete subject group', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to delete subject group', 'error');
    }
  };

  const handleOpenSubjectGroupMenu = (event, group) => {
    setSelectedSubjectGroup(group);
    setSubjectGroupAnchorEl(event.currentTarget);
    setOpenSubjectGroupMenu(true);
  };

  const handleCloseSubjectGroupMenu = () => {
    setSubjectGroupAnchorEl(null);
    setOpenSubjectGroupMenu(false);
  };

  // Effects
  useEffect(() => {
    fetchCurriculumData();
    fetchProgrammesData();
    fetchSubjectGroupsData();
  }, []);

  useEffect(() => {
    fetchSubjectsData();
  }, [selectedCurriculum]);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        width: '100%',
      }}
    >
      {/* Curriculum and Subject Panels on Same Row */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexDirection: { xs: 'column', md: 'row' },
          width: '100%',
        }}
      >
        {/* LEFT - Curriculum Panel */}
        <Box sx={{ flex: { md: 5 }, width: '100%' }}>
          <ParentCard
            title={
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Curriculum
              </Typography>
            }
          >
            <TableContainer>
              <Table sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#eef2f7' }}>
                    <TableCell sx={{ fontWeight: 'bold', width: '10%' }}></TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '60%' }}>
                      Curriculum Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {curriculumData.length > 0 ? (
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
                              bgcolor: '#f5f7fa',
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
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography color="textSecondary">No curriculums found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </ParentCard>
        </Box>

        {/* RIGHT - Subject Panel */}
        <Box sx={{ flex: { md: 7 }, width: '100%' }}>
          <ParentCard
            title={
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Subject Bank
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    size="small"
                    placeholder="Search subjects..."
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    sx={{ width: 200 }}
                  />
                  <Button variant="contained" size='small' onClick={handleOpenAddSubjectModal}>
                    Add Subject
                  </Button>
                </Box>
              </Box>
            }
          >
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#eef2f7' }}>
                    <TableCell width="8%">S/N</TableCell>
                    <TableCell width="25%">Subject</TableCell>
                    <TableCell width="18%">Subject Code</TableCell>
                    <TableCell width="18%">Program</TableCell>
                    <TableCell width="12%">Passmark</TableCell>
                    <TableCell width="10%">Unit</TableCell>
                    <TableCell width="9%" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingSubjects ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : subjects.length > 0 ? (
                    subjects
                      .filter((subject) =>
                        subject.subject_name?.toLowerCase().includes(subjectSearch.toLowerCase())
                      )
                      .map((subject, i) => (
                        <TableRow key={subject.id} hover>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{subject.subject_name}</TableCell>
                          <TableCell>{subject.subject_code}</TableCell>
                          <TableCell>{subject.programme_name}</TableCell>
                          <TableCell>{subject.pass_mark}</TableCell>
                          <TableCell>{subject.unit}</TableCell>
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
                      <TableCell colSpan={7} align="center">
                        <Typography color="textSecondary">
                          {selectedCurriculum ? 'No subjects found for this curriculum' : 'Please select a curriculum to view subjects'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </ParentCard>
        </Box>
      </Box>

      {/* Subject Group Card Below */}
      <Box sx={{ width: '100%' }}>
        <ParentCard
          title={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Subject Groups
              </Typography>
              <Button variant="contained" size='small' onClick={handleOpenCreateSubjectGroupModal}>
                Create Group
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
                          onClick={(e) => handleOpenEditSubjectGroupModal(e, grp)}
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

      {/* Subject Action Menu */}
      <Menu
        id="subject-menu"
        anchorEl={subjectAnchorEl}
        open={openSubjectMenu}
        onClose={handleCloseSubjectMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleOpenEditModal(null, selectedSubject)}>
          <IconEdit size={18} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleOpenDeleteModal} sx={{ color: 'error.main' }}>
          <IconTrash size={18} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add Subject Modal */}
      <Dialog open={openAddSubjectModal} onClose={handleCloseAddSubjectModal} maxWidth="md" fullWidth>
        <DialogTitle>Add New Subject</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Subject Name"
              value={subjectFormData.subject_name}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, subject_name: e.target.value })}
              margin="normal"
              required
              error={!!fieldErrors.subject_name}
              helperText={fieldErrors.subject_name?.[0]}
            />
            <TextField
              fullWidth
              label="Subject Code"
              value={subjectFormData.subject_code}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, subject_code: e.target.value })}
              margin="normal"
              required
              error={!!fieldErrors.subject_code}
              helperText={fieldErrors.subject_code?.[0]}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Program</InputLabel>
              <Select
                value={subjectFormData.programme_id}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, programme_id: e.target.value })}
                label="Program"
              >
                {programmesList.map((prog) => (
                  <MenuItem key={prog.id} value={prog.id}>
                    {prog.programme_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Pass Mark"
              type="number"
              value={subjectFormData.pass_mark}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, pass_mark: e.target.value })}
              margin="normal"
              required
              error={!!fieldErrors.pass_mark}
              helperText={fieldErrors.pass_mark?.[0]}
            />
            <TextField
              fullWidth
              label="Unit"
              type="number"
              value={subjectFormData.unit}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, unit: e.target.value })}
              margin="normal"
              required
              error={!!fieldErrors.unit}
              helperText={fieldErrors.unit?.[0]}
            />
            <Select
              fullWidth
              label="Status"
              value={subjectFormData.status}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, status: e.target.value })}
              margin="normal"
            >
              <MenuItem value="compulsory">Compulsory</MenuItem>
              <MenuItem value="optional">Optional</MenuItem>
            </Select>
            {/* <TextField
              fullWidth
              type="hidden"
              value={subjectFormData.curriculum_id}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, curriculum_id: e.target.value })}
              margin="normal"
            /> */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size='small' onClick={handleCloseAddSubjectModal}>Cancel</Button>
          <Button variant="contained" size='small' onClick={handleCreateSubject}>
            Add Subject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Subject Modal */}
      <Dialog open={openEditSubjectModal} onClose={handleCloseEditSubjectModal} maxWidth="md" fullWidth>
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
              error={!!fieldErrors.subject_name}
              helperText={fieldErrors.subject_name?.[0]}
            />
            <TextField
              fullWidth
              label="Subject Code"
              value={subjectFormData.subject_code}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, subject_code: e.target.value })}
              margin="normal"
              required
              error={!!fieldErrors.subject_code}
              helperText={fieldErrors.subject_code?.[0]}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Program</InputLabel>
              <Select
                value={subjectFormData.programme_id}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, programme_id: e.target.value })}
                label="Program"
              >
                {programmesList.map((prog) => (
                  <MenuItem key={prog.id} value={prog.id}>
                    {prog.programme_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Pass Mark"
              type="number"
              value={subjectFormData.pass_mark}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, pass_mark: e.target.value })}
              margin="normal"
              required
              error={!!fieldErrors.pass_mark}
              helperText={fieldErrors.pass_mark?.[0]}
            />
            <TextField
              fullWidth
              label="Unit"
              type="number"
              value={subjectFormData.unit}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, unit: e.target.value })}
              margin="normal"
              required
              error={!!fieldErrors.unit}
              helperText={fieldErrors.unit?.[0]}
            />
            <TextField
              fullWidth
              type="hidden"
              value={subjectFormData.curriculum_id}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, curriculum_id: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size='small' onClick={handleCloseEditSubjectModal}>Cancel</Button>
          <Button variant="contained" size='small' onClick={handleUpdateSubject}>
            Update Subject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Subject Modal */}
      <Dialog open={openDeleteSubjectModal} onClose={handleCloseDeleteSubjectModal} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Subject</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedSubject?.subject_name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button size='small' onClick={handleCloseDeleteSubjectModal}>Cancel</Button>
          <Button variant="contained" color="error" size='small' onClick={handleDeleteSubject}>
            Delete
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

export default SubjectBank;
