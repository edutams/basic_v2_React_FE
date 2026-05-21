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
  Radio,
  Autocomplete,
  Grid,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import ParentCard from '@/components/shared/ParentCard';
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
} from '@/api/tenant/curriculum/tenantCurriculumApi';

const SubjectBank = () => {
  // Internal state
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [programmesList, setProgrammesList] = useState([]);
  const [loadingProgrammes, setLoadingProgrammes] = useState(false);
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

  // Loading states for buttons
  const [loadingCreateSubject, setLoadingCreateSubject] = useState(false);
  const [loadingUpdateSubject, setLoadingUpdateSubject] = useState(false);
  const [loadingDeleteSubject, setLoadingDeleteSubject] = useState(false);
  const [loadingCreateGroup, setLoadingCreateGroup] = useState(false);
  const [loadingUpdateGroup, setLoadingUpdateGroup] = useState(false);
  const [loadingDeleteGroup, setLoadingDeleteGroup] = useState(false);

  // Curriculum state
  const [curriculumData, setCurriculumData] = useState([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
  const [loadingCurriculums, setLoadingCurriculums] = useState(false);

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
    programme_id: '',
    curriculum_id: '',
    subject_ids: [],
  });

  // State for subject group modal
  const [subjectGroupModalSubjects, setSubjectGroupModalSubjects] = useState([]);
  const [loadingModalSubjects, setLoadingModalSubjects] = useState(false);

  // Programme filter state for subject groups
  const [selectedProgrammeForGroups, setSelectedProgrammeForGroups] = useState('');

  // Methods
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchCurriculumData = async () => {
    setLoadingCurriculums(true);
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
    } finally {
      setLoadingCurriculums(false);
    }
  };

  const fetchSubjectsData = async (search = '') => {
    if (!selectedCurriculum) {
      setSubjects([]);
      return;
    }

    setLoadingSubjects(true);
    try {
      const response = await fetchSubjects(selectedCurriculum, search);
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
    setLoadingProgrammes(true);
    try {
      const response = await fetchProgrammes();
      if (response.status) {
        setProgrammesList(response.data);
        // Set default programme for groups if none selected
        if (response.data.length > 0 && !selectedProgrammeForGroups) {
          setSelectedProgrammeForGroups(response.data[0].id);
        }
      }
    } catch (error) {
      showSnackbar('Failed to fetch programmes', 'error');
    } finally {
      setLoadingProgrammes(false);
    }
  };

  const fetchSubjectGroupsData = async (programmeId = selectedProgrammeForGroups) => {
    setLoadingSubjectGroups(true);
    try {
      const response = await fetchSubjectGroups(programmeId);
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
      status: '',
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
      status: subject.prog_subject_status || 'compulsory',
      curriculum_id: selectedCurriculum,
    });
    setOpenEditSubjectModal(true);
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
    setLoadingCreateSubject(true);

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

        showSnackbar(error.response.data?.message || 'Validation failed', 'error');

        return;
      }

      showSnackbar(error.response?.data?.message || 'Failed to create subject', 'error');
    } finally {
      setLoadingCreateSubject(false);
    }
  };

  const handleUpdateSubject = async () => {
    setFieldErrors({});
    setLoadingUpdateSubject(true);

    try {
      const response = await updateSubjectRecord(selectedSubject.id, subjectFormData);

      if (response.status) {
        showSnackbar('Subject updated successfully', 'success');
        handleCloseEditSubjectModal();
        fetchSubjectsData();
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

      showSnackbar(error.response?.data?.message || 'Failed to update subject', 'error');
    } finally {
      setLoadingUpdateSubject(false);
    }
  };

  const handleDeleteSubject = async () => {
    setLoadingDeleteSubject(true);
    try {
      const response = await deleteSubjectRecord(selectedSubject.id);
      if (response.status) {
        showSnackbar('Subject deleted successfully', 'success');
        handleCloseDeleteSubjectModal();
        fetchSubjectsData();
      } else {
        // Display the detailed error message from the backend
        const errorMessage = response.error || response.message || 'Failed to delete subject';
        showSnackbar(errorMessage, 'error');
      }
    } catch (error) {
      // Handle API error responses
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.error || errorData.message || 'Failed to delete subject';
        showSnackbar(errorMessage, 'error');
      } else {
        showSnackbar('Failed to delete subject', 'error');
      }
    } finally {
      setLoadingDeleteSubject(false);
    }
  };

  const handleCloseSubjectMenu = () => {
    setSubjectAnchorEl(null);
    setOpenSubjectMenu(false);
  };

  // Subject Groups methods
  const loadSubjectsForSubjectGroup = async (curriculumId) => {
    if (!curriculumId) {
      setSubjectGroupModalSubjects([]);
      return;
    }

    setLoadingModalSubjects(true);
    try {
      const response = await fetchSubjects(curriculumId, '');
      if (response.status) {
        setSubjectGroupModalSubjects(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to load subjects for curriculum', 'error');
    } finally {
      setLoadingModalSubjects(false);
    }
  };

  const handleOpenCreateSubjectGroupModal = () => {
    setSubjectGroupFormData({
      group_name: '',
      unit: '',
      pass_mark: '',
      status: 'active',
      programme_id: selectedProgrammeForGroups || programmesList[0]?.id || '',
      curriculum_id: selectedCurriculum || '',
      subject_ids: [],
    });
    setSubjectGroupModalSubjects([]);
    if (selectedCurriculum) {
      loadSubjectsForSubjectGroup(selectedCurriculum);
    }
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
      programme_id: group.programme_id || '',
      curriculum_id: group.curriculum_id || '',
      subject_ids: group.subjects?.map((s) => s.id) || [],
    });

    // Load subjects for the group's curriculum
    if (group.curriculum_id) {
      loadSubjectsForSubjectGroup(group.curriculum_id);
    } else {
      setSubjectGroupModalSubjects([]);
    }

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
    setFieldErrors({});
    setLoadingCreateGroup(true);

    try {
      const response = await createSubjectGroup(subjectGroupFormData);
      if (response.status) {
        showSnackbar('Subject group created successfully', 'success');
        handleCloseCreateSubjectGroupModal();
        fetchSubjectGroupsData();
      } else {
        // Display the detailed error message from the backend
        const errorMessage = response.error || response.message || 'Failed to create subject group';
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
          errorData.error || errorData.message || 'Failed to create subject group';
        showSnackbar(errorMessage, 'error');
      } else {
        showSnackbar('Failed to create subject group', 'error');
      }
    } finally {
      setLoadingCreateGroup(false);
    }
  };

  const handleUpdateSubjectGroup = async () => {
    setLoadingUpdateGroup(true);
    try {
      const response = await updateSubjectGroup(selectedSubjectGroup.id, subjectGroupFormData);
      if (response.status) {
        showSnackbar('Subject group updated successfully', 'success');
        handleCloseEditSubjectGroupModal();
        fetchSubjectGroupsData();
      } else {
        // Display the detailed error message from the backend
        const errorMessage = response.error || response.message || 'Failed to update subject group';
        showSnackbar(errorMessage, 'error');
      }
    } catch (error) {
      // Handle API error responses
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage =
          errorData.error || errorData.message || 'Failed to update subject group';
        showSnackbar(errorMessage, 'error');
      } else {
        showSnackbar('Failed to update subject group', 'error');
      }
    } finally {
      setLoadingUpdateGroup(false);
    }
  };

  const handleDeleteSubjectGroup = async () => {
    setLoadingDeleteGroup(true);
    try {
      const response = await deleteSubjectGroup(selectedSubjectGroup.id);
      if (response.status) {
        showSnackbar('Subject group deleted successfully', 'success');
        handleCloseDeleteSubjectGroupModal();
        fetchSubjectGroupsData();
      } else {
        // Display the detailed error message from the backend
        const errorMessage = response.error || response.message || 'Failed to delete subject group';
        showSnackbar(errorMessage, 'error');
      }
    } catch (error) {
      // Handle API error responses
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage =
          errorData.error || errorData.message || 'Failed to delete subject group';
        showSnackbar(errorMessage, 'error');
      } else {
        showSnackbar('Failed to delete subject group', 'error');
      }
    } finally {
      setLoadingDeleteGroup(false);
    }
  };

  const handleOpenSubjectMenu = (event, subject) => {
    setSelectedSubject(subject);
    setSubjectAnchorEl(event.currentTarget);
    setOpenSubjectMenu(true);
  };

  const handleCloseSubjectGroupMenu = () => {
    setSubjectGroupAnchorEl(null);
    setOpenSubjectGroupMenu(false);
  };

  const handleProgrammeFilterChange = (programmeId) => {
    setSelectedProgrammeForGroups(programmeId);
  };

  const handleCurriculumFilterChange = (curriculumId) => {
    setSelectedCurriculum(curriculumId);
    // Reset subjects when curriculum changes
    setSubjects([]);
    setSubjectSearch('');
  };

  // Effects
  useEffect(() => {
    fetchCurriculumData();
    fetchProgrammesData();
  }, []);

  useEffect(() => {
    if (selectedProgrammeForGroups) {
      fetchSubjectGroupsData();
    }
  }, [selectedProgrammeForGroups]);

  useEffect(() => {
    fetchSubjectsData();
  }, [selectedCurriculum]);

  useEffect(() => {
    fetchSubjectsData(subjectSearch);
  }, [subjectSearch]);
  return (
    <>
      <Alert>Select curriculum to upload subjects</Alert>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          width: '100%',
          mt: 2,
          mb: 2,
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
            <ParentCard>
              <TableContainer
                sx={{
                  maxHeight: 600,
                  overflowX: 'auto',
                  minWidth: '100',
                }}
              >
                <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: '10%' }}></TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '60%' }}>
                        Curriculum Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingCurriculums ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
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
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Subject Bank
                </Typography>
              }
            >
              {/* Search and Action Controls Below Title */}
              <Box
                sx={{
                  mb: 2,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: 2,
                }}
              >
                <Box
                  display="flex"
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  gap={2}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  <FormControl size="small" sx={{ width: { xs: '100%', sm: '200px' } }}>
                    <InputLabel>Curriculum</InputLabel>
                    <Select
                      value={selectedCurriculum}
                      onChange={(e) => handleCurriculumFilterChange(e.target.value)}
                      label="Curriculum"
                      disabled
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                        '& .Mui-disabled .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                        '& .MuiSelect-icon': {
                          display: 'none',
                        },
                      }}
                    >
                      {curriculumData.map((curr) => (
                        <MenuItem key={curr.id} value={curr.id}>
                          {curr.curriculum_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    size="small"
                    placeholder="Search subjects..."
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    sx={{ width: { xs: '100%', sm: 200 } }}
                  />
                </Box>

                <Button
                  variant="contained"
                  size="small"
                  onClick={handleOpenAddSubjectModal}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Add Subject
                </Button>
              </Box>

              <TableContainer
                sx={{
                  maxHeight: 600,
                  overflowY: 'auto',
                  width: '100%',
                }}
              >
                <Table stickyHeader sx={{ width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 700, py: 1.5 }}>S/N</TableCell>

                      <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Subject</TableCell>

                      <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Subject Code</TableCell>

                      <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Program</TableCell>

                      <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Pass Mark</TableCell>

                      <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Unit</TableCell>

                      <TableCell align="center" sx={{ fontWeight: 700, py: 1.5 }}>
                        Actions
                      </TableCell>
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
                      subjects.map((subject, i) => (
                        <TableRow key={subject.id} hover>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{subject.subject_name}</TableCell>
                          <TableCell>{subject.subject_code}</TableCell>
                          <TableCell>{subject.program_name}</TableCell>
                          <TableCell>{subject.pass_mark}</TableCell>
                          <TableCell>{subject.unit}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenSubjectMenu(e, subject)}
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
                            {selectedCurriculum
                              ? 'No subjects found for this curriculum'
                              : 'Please select a curriculum to view subjects'}
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
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Subject Groups
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  <FormControl size="small" sx={{ width: { xs: '100%', sm: 150 } }}>
                    <InputLabel>Curriculum</InputLabel>
                    <Select
                      value={selectedCurriculum}
                      onChange={(e) => handleCurriculumFilterChange(e.target.value)}
                      label="Curriculum"
                      disabled
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                        '& .Mui-disabled .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                        '& .MuiSelect-icon': {
                          display: 'none',
                        },
                      }}
                    >
                      {curriculumData.map((curr) => (
                        <MenuItem key={curr.id} value={curr.id}>
                          {curr.curriculum_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ width: { xs: '100%', sm: 200 } }}>
                    <InputLabel>Programme</InputLabel>
                    <Select
                      value={selectedProgrammeForGroups}
                      onChange={(e) => handleProgrammeFilterChange(e.target.value)}
                      label="Programme"
                    >
                      {programmesList.map((prog) => (
                        <MenuItem key={prog.id} value={prog.id}>
                          {prog.programme_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    size="small"
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                    onClick={handleOpenCreateSubjectGroupModal}
                  >
                    Create Group
                  </Button>
                </Box>
              </Box>
            }
          >
            <TableContainer
              sx={{
                maxHeight: 600,
                overflowX: 'auto',
                width: '100%',
              }}
            >
              <Table
                sx={{
                  tableLayout: 'fixed',
                  minWidth: 900,
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 60 }}>#</TableCell>
                    <TableCell sx={{ width: 180 }}>Group Name</TableCell>
                    <TableCell sx={{ width: 260 }}>Subjects</TableCell>
                    <TableCell sx={{ width: 100 }}>Unit</TableCell>
                    <TableCell sx={{ width: 120 }}>Pass Mark</TableCell>
                    <TableCell sx={{ width: 140 }}>Status</TableCell>
                    <TableCell sx={{ width: 80 }} align="center">
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
        <Dialog
          open={openAddSubjectModal}
          onClose={handleCloseAddSubjectModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Subject</DialogTitle>

          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Subject Name"
                    value={subjectFormData.subject_name}
                    onChange={(e) =>
                      setSubjectFormData({
                        ...subjectFormData,
                        subject_name: e.target.value,
                      })
                    }
                    required
                    error={!!fieldErrors.subject_name}
                    helperText={fieldErrors.subject_name?.[0]}
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Subject Code"
                    value={subjectFormData.subject_code}
                    onChange={(e) =>
                      setSubjectFormData({
                        ...subjectFormData,
                        subject_code: e.target.value,
                      })
                    }
                    required
                    error={!!fieldErrors.subject_code}
                    helperText={fieldErrors.subject_code?.[0]}
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small" error={!!fieldErrors.programme_id}>
                    <InputLabel>Program</InputLabel>

                    <Select
                      value={subjectFormData.programme_id}
                      onChange={(e) =>
                        setSubjectFormData({
                          ...subjectFormData,
                          programme_id: e.target.value,
                        })
                      }
                      label="Program"
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
                    {fieldErrors.programme_id && (
                      <FormHelperText>{fieldErrors.programme_id?.[0]}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small" error={!!fieldErrors.status}>
                    <InputLabel>Status</InputLabel>

                    <Select
                      value={subjectFormData.status}
                      onChange={(e) =>
                        setSubjectFormData({
                          ...subjectFormData,
                          status: e.target.value,
                        })
                      }
                      label="Status"
                      name="status"
                    >
                      <MenuItem value="compulsory">Compulsory</MenuItem>

                      <MenuItem value="optional">Optional</MenuItem>
                    </Select>
                    {fieldErrors.status && (
                      <FormHelperText>{fieldErrors.status?.[0]}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Pass Mark"
                    type="number"
                    value={subjectFormData.pass_mark}
                    onChange={(e) =>
                      setSubjectFormData({
                        ...subjectFormData,
                        pass_mark: e.target.value,
                      })
                    }
                    required
                    error={!!fieldErrors.pass_mark}
                    helperText={fieldErrors.pass_mark?.[0]}
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Unit"
                    type="number"
                    value={subjectFormData.unit}
                    onChange={(e) =>
                      setSubjectFormData({
                        ...subjectFormData,
                        unit: e.target.value,
                      })
                    }
                    required
                    error={!!fieldErrors.unit}
                    helperText={fieldErrors.unit?.[0]}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button
              size="small"
              onClick={handleCloseAddSubjectModal}
              disabled={loadingCreateSubject}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              size="small"
              onClick={handleCreateSubject}
              disabled={loadingCreateSubject}
              startIcon={loadingCreateSubject ? <CircularProgress size={16} /> : null}
            >
              {loadingCreateSubject ? 'Adding...' : 'Add Subject'}
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
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Subject Name"
                    value={subjectFormData.subject_name}
                    onChange={(e) =>
                      setSubjectFormData({
                        ...subjectFormData,
                        subject_name: e.target.value,
                      })
                    }
                    required
                    error={!!fieldErrors.subject_name}
                    helperText={fieldErrors.subject_name?.[0]}
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Subject Code"
                    value={subjectFormData.subject_code}
                    onChange={(e) =>
                      setSubjectFormData({
                        ...subjectFormData,
                        subject_code: e.target.value,
                      })
                    }
                    required
                    error={!!fieldErrors.subject_code}
                    helperText={fieldErrors.subject_code?.[0]}
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small" error={!!fieldErrors.programme_id}>
                    <InputLabel>Program</InputLabel>
                    <Select
                      value={subjectFormData.programme_id}
                      onChange={(e) =>
                        setSubjectFormData({
                          ...subjectFormData,
                          programme_id: e.target.value,
                        })
                      }
                      label="Program"
                    >
                      {programmesList.map((prog) => (
                        <MenuItem key={prog.id} value={prog.id}>
                          {prog.programme_name}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.programme_id && (
                      <FormHelperText>{fieldErrors.programme_id?.[0]}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small" error={!!fieldErrors.status}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={subjectFormData.status}
                      onChange={(e) =>
                        setSubjectFormData({
                          ...subjectFormData,
                          status: e.target.value,
                        })
                      }
                      label="Status"
                      name="status"
                    >
                      <MenuItem value="compulsory">Compulsory</MenuItem>
                      <MenuItem value="optional">Optional</MenuItem>
                    </Select>
                    {fieldErrors.status && (
                      <FormHelperText>{fieldErrors.status?.[0]}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Pass Mark"
                    type="number"
                    value={subjectFormData.pass_mark}
                    onChange={(e) =>
                      setSubjectFormData({
                        ...subjectFormData,
                        pass_mark: e.target.value,
                      })
                    }
                    required
                    error={!!fieldErrors.pass_mark}
                    helperText={fieldErrors.pass_mark?.[0]}
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Unit"
                    type="number"
                    value={subjectFormData.unit}
                    onChange={(e) =>
                      setSubjectFormData({
                        ...subjectFormData,
                        unit: e.target.value,
                      })
                    }
                    required
                    error={!!fieldErrors.unit}
                    helperText={fieldErrors.unit?.[0]}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              size="small"
              onClick={handleCloseEditSubjectModal}
              disabled={loadingUpdateSubject}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleUpdateSubject}
              disabled={loadingUpdateSubject}
              startIcon={loadingUpdateSubject ? <CircularProgress size={16} /> : null}
            >
              {loadingUpdateSubject ? 'Updating...' : 'Update Subject'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Subject Modal */}
        <Dialog
          open={openDeleteSubjectModal}
          onClose={handleCloseDeleteSubjectModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Delete Subject</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{selectedSubject?.subject_name}"? This action cannot
              be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              size="small"
              onClick={handleCloseDeleteSubjectModal}
              disabled={loadingDeleteSubject}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleDeleteSubject}
              disabled={loadingDeleteSubject}
              startIcon={loadingDeleteSubject ? <CircularProgress size={16} /> : null}
            >
              {loadingDeleteSubject ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Subject Group Modal */}
        <Dialog
          open={openCreateSubjectGroupModal}
          onClose={handleCloseCreateSubjectGroupModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create Subject Group</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl
                    fullWidth
                    margin="normal"
                    size="small"
                    error={!!fieldErrors.programme_id}
                  >
                    <InputLabel>Programme</InputLabel>
                    <Select
                      value={subjectGroupFormData.programme_id}
                      onChange={(e) =>
                        setSubjectGroupFormData({
                          ...subjectGroupFormData,
                          programme_id: e.target.value,
                        })
                      }
                      label="Programme"
                    >
                      {programmesList.map((prog) => (
                        <MenuItem key={prog.id} value={prog.id}>
                          {prog.programme_name}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.programme_id && (
                      <FormHelperText>{fieldErrors.programme_id?.[0]}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl
                    fullWidth
                    margin="normal"
                    size="small"
                    error={!!fieldErrors.curriculum_id}
                  >
                    <InputLabel>Curriculum</InputLabel>
                    <Select
                      value={subjectGroupFormData.curriculum_id}
                      onChange={(e) => {
                        const newCurriculumId = e.target.value;
                        setSubjectGroupFormData({
                          ...subjectGroupFormData,
                          curriculum_id: newCurriculumId,
                          subject_ids: [],
                        });
                        loadSubjectsForSubjectGroup(newCurriculumId);
                      }}
                      label="Curriculum"
                    >
                      {curriculumData.map((curr) => (
                        <MenuItem key={curr.id} value={curr.id}>
                          {curr.curriculum_name}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.curriculum_id && (
                      <FormHelperText>{fieldErrors.curriculum_id?.[0]}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 12 }}>
                  <TextField
                    fullWidth
                    label="Group Name"
                    value={subjectGroupFormData.group_name}
                    onChange={(e) =>
                      setSubjectGroupFormData({
                        ...subjectGroupFormData,
                        group_name: e.target.value,
                      })
                    }
                    margin="normal"
                    required
                    error={!!fieldErrors.group_name}
                    helperText={fieldErrors.group_name?.[0]}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Unit"
                    type="number"
                    value={subjectGroupFormData.unit}
                    onChange={(e) =>
                      setSubjectGroupFormData({ ...subjectGroupFormData, unit: e.target.value })
                    }
                    margin="normal"
                    required
                    error={!!fieldErrors.unit}
                    helperText={fieldErrors.unit?.[0]}
                    size="small"
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Pass Mark"
                    type="number"
                    value={subjectGroupFormData.pass_mark}
                    onChange={(e) =>
                      setSubjectGroupFormData({
                        ...subjectGroupFormData,
                        pass_mark: e.target.value,
                      })
                    }
                    margin="normal"
                    required
                    error={!!fieldErrors.pass_mark}
                    helperText={fieldErrors.pass_mark?.[0]}
                    size="small"
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth margin="normal" size="small" error={!!fieldErrors.status}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={subjectGroupFormData.status}
                      onChange={(e) =>
                        setSubjectGroupFormData({ ...subjectGroupFormData, status: e.target.value })
                      }
                      label="Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                    {fieldErrors.status && (
                      <FormHelperText>{fieldErrors.status?.[0]}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  {/* Subject search & selection */}
                  <Box sx={{ bgcolor: '#e0f2fe', p: 1.5, borderRadius: 1, mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Select Subjects
                    </Typography>
                    <Autocomplete
                      multiple
                      loading={loadingModalSubjects}
                      options={subjectGroupModalSubjects}
                      getOptionLabel={(s) =>
                        `${s.subject_name}${s.subject_code ? ` (${s.subject_code})` : ''}`
                      }
                      value={
                        subjectGroupFormData.subject_ids
                          ? subjectGroupModalSubjects.filter((s) =>
                              subjectGroupFormData.subject_ids.includes(s.id),
                            )
                          : []
                      }
                      onChange={(_, selected) =>
                        setSubjectGroupFormData((f) => ({
                          ...f,
                          subject_ids: selected.map((s) => s.id),
                        }))
                      }
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      noOptionsText={
                        !subjectGroupFormData.curriculum_id
                          ? 'Select a curriculum first'
                          : 'No subjects found'
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder="Search for subjects..."
                          sx={{ bgcolor: '#fff', borderRadius: 1 }}
                        />
                      )}
                      renderTags={(selected, getTagProps) =>
                        selected.map((s, index) => (
                          <Chip
                            key={s.id}
                            label={s.subject_name}
                            size="small"
                            sx={{ bgcolor: '#334155', color: '#fff' }}
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              size="small"
              onClick={handleCloseCreateSubjectGroupModal}
              disabled={loadingCreateGroup}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleCreateSubjectGroup}
              disabled={loadingCreateGroup || subjectGroupFormData.subject_ids.length < 2}
              startIcon={loadingCreateGroup ? <CircularProgress size={16} /> : null}
            >
              {loadingCreateGroup ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Subject Group Modal */}
        <Dialog
          open={openEditSubjectGroupModal}
          onClose={handleCloseEditSubjectGroupModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Subject Group</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl
                    fullWidth
                    margin="normal"
                    size="small"
                    error={!!fieldErrors.programme_id}
                  >
                    <InputLabel>Programme</InputLabel>
                    <Select
                      value={subjectGroupFormData.programme_id}
                      onChange={(e) =>
                        setSubjectGroupFormData({
                          ...subjectGroupFormData,
                          programme_id: e.target.value,
                        })
                      }
                      label="Programme"
                    >
                      {programmesList.map((prog) => (
                        <MenuItem key={prog.id} value={prog.id}>
                          {prog.programme_name}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.programme_id && (
                      <FormHelperText>{fieldErrors.programme_id?.[0]}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl
                    fullWidth
                    margin="normal"
                    size="small"
                    error={!!fieldErrors.curriculum_id}
                  >
                    <InputLabel>Curriculum</InputLabel>
                    <Select
                      value={subjectGroupFormData.curriculum_id}
                      onChange={(e) => {
                        const newCurriculumId = e.target.value;
                        setSubjectGroupFormData({
                          ...subjectGroupFormData,
                          curriculum_id: newCurriculumId,
                          subject_ids: [],
                        });
                        loadSubjectsForSubjectGroup(newCurriculumId);
                      }}
                      label="Curriculum"
                    >
                      {curriculumData.map((curr) => (
                        <MenuItem key={curr.id} value={curr.id}>
                          {curr.curriculum_name}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.curriculum_id && (
                      <FormHelperText>{fieldErrors.curriculum_id?.[0]}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 12 }}>
                  <TextField
                    fullWidth
                    label="Group Name"
                    value={subjectGroupFormData.group_name}
                    onChange={(e) =>
                      setSubjectGroupFormData({
                        ...subjectGroupFormData,
                        group_name: e.target.value,
                      })
                    }
                    margin="normal"
                    required
                    error={!!fieldErrors.group_name}
                    helperText={fieldErrors.group_name?.[0]}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Unit"
                    type="number"
                    value={subjectGroupFormData.unit}
                    onChange={(e) =>
                      setSubjectGroupFormData({ ...subjectGroupFormData, unit: e.target.value })
                    }
                    margin="normal"
                    required
                    error={!!fieldErrors.unit}
                    helperText={fieldErrors.unit?.[0]}
                    size="small"
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Pass Mark"
                    type="number"
                    value={subjectGroupFormData.pass_mark}
                    onChange={(e) =>
                      setSubjectGroupFormData({
                        ...subjectGroupFormData,
                        pass_mark: e.target.value,
                      })
                    }
                    margin="normal"
                    required
                    error={!!fieldErrors.pass_mark}
                    helperText={fieldErrors.pass_mark?.[0]}
                    size="small"
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth margin="normal" size="small" error={!!fieldErrors.status}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={subjectGroupFormData.status}
                      onChange={(e) =>
                        setSubjectGroupFormData({ ...subjectGroupFormData, status: e.target.value })
                      }
                      label="Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                    {fieldErrors.status && (
                      <FormHelperText>{fieldErrors.status?.[0]}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 12 }}>
                  {/* Subject search & selection */}
                  <Box sx={{ bgcolor: '#e0f2fe', p: 1.5, borderRadius: 1, mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Select Subjects
                    </Typography>
                    <Autocomplete
                      multiple
                      loading={loadingModalSubjects}
                      options={subjectGroupModalSubjects}
                      getOptionLabel={(s) =>
                        `${s.subject_name}${s.subject_code ? ` (${s.subject_code})` : ''}`
                      }
                      value={
                        subjectGroupFormData.subject_ids
                          ? subjectGroupModalSubjects.filter((s) =>
                              subjectGroupFormData.subject_ids.includes(s.id),
                            )
                          : []
                      }
                      onChange={(_, selected) =>
                        setSubjectGroupFormData((f) => ({
                          ...f,
                          subject_ids: selected.map((s) => s.id),
                        }))
                      }
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      noOptionsText={
                        !subjectGroupFormData.curriculum_id
                          ? 'Select a curriculum first'
                          : 'No subjects found'
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder="Search for subjects..."
                          sx={{ bgcolor: '#fff', borderRadius: 1 }}
                        />
                      )}
                      renderTags={(selected, getTagProps) =>
                        selected.map((s, index) => (
                          <Chip
                            key={s.id}
                            label={s.subject_name}
                            size="small"
                            sx={{ bgcolor: '#334155', color: '#fff' }}
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              size="small"
              onClick={handleCloseEditSubjectGroupModal}
              disabled={loadingUpdateGroup}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleUpdateSubjectGroup}
              disabled={loadingUpdateGroup || subjectGroupFormData.subject_ids.length < 2}
              startIcon={loadingUpdateGroup ? <CircularProgress size={16} /> : null}
            >
              {loadingUpdateGroup ? 'Updating...' : 'Update Group'}
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
    </>
  );
};

export default SubjectBank;
