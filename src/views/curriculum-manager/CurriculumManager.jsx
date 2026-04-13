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
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconEdit, IconTrash } from '@tabler/icons-react';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'School Dashboard' },
  { title: 'Curriculum Manager' },
];

const TabPanel = ({ children, value, index }) => {
  return value === index && <Box mt={2}>{children}</Box>;
};

const CurriculumManager = () => {
  const [tab, setTab] = useState(0);

  // Checkbox state for second tab
  const [checkedCurriculum, setCheckedCurriculum] = useState([]);
  const [selectAllCurriculum, setSelectAllCurriculum] = useState(false);

  const [program, setProgram] = useState('Junior Secondary');
  const [selectedClass, setSelectedClass] = useState(3);

  // Data states
  const [curriculumData, setCurriculumData] = useState([]);
  const [classData, setClassData] = useState([]);
  const [subjectData] = useState([
    { id: 1, name: 'Mathematics', code: 'Math3023', program: 'JSS' },
    { id: 2, name: 'English Language', code: 'Eng1023', program: 'JSS' },
    { id: 3, name: 'Science', code: 'Sci2023', program: 'JSS' },
  ]);

  // Sessions and Terms
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  // Modal states
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    curriculum_name: '',
    status: 'active',
  });

  // Loading and notification states
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Static data for other tabs
  const classes = [
    { id: 1, name: 'JSS1' },
    { id: 2, name: 'JSS2' },
    { id: 3, name: 'JSS3' },
  ];

  const [subjects] = useState([
    { id: 1, name: 'Mathematics', passmark: 50, unit: 2, status: 'Compulsory' },
    { id: 2, name: 'English Language', passmark: 50, unit: 2, status: 'Compulsory' },
    { id: 3, name: 'Science', passmark: 50, unit: 2, status: 'Compulsory' },
    { id: 4, name: 'Biology', passmark: 50, unit: 2, status: 'Optional' },
  ]);

  const [subjectGroups] = useState([
    { id: 1, groupName: 'Sciences', subject: 'Biology', passmark: 50, status: 'Compulsory' },
    { id: 2, groupName: 'Languages', subject: 'English', passmark: 50, status: 'Optional' },
  ]);

  // Fetch data on component mount
  useEffect(() => {
    loadCurriculums();
    loadSessionsAndTerms();
  }, []);

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
      }
    } catch (error) {
      showSnackbar('Failed to load curriculums', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionsAndTerms = async () => {
    try {
      const [sessionsRes, termsRes] = await Promise.all([fetchSessions(), fetchTerms()]);

      if (sessionsRes.status) {
        setSessions(sessionsRes.data);
        if (sessionsRes.data.length > 0) {
          const currentSession =
            sessionsRes.data.find((s) => s.is_current === 'yes') || sessionsRes.data[0];
          setSelectedSession(currentSession.id);
        }
      }

      if (termsRes.status) {
        setTerms(termsRes.data);
        if (termsRes.data.length > 0) {
          setSelectedTerm(termsRes.data[0].id);
        }
      }
    } catch (error) {
      showSnackbar('Failed to load sessions and terms', 'error');
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
    setSelectedCurriculum(curriculum);
    setFormData({
      curriculum_name: curriculum.curriculum_name,
      status: curriculum.status,
    });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedCurriculum(null);
    setFormData({ curriculum_name: '', status: 'active' });
  };

  const handleUpdateCurriculum = async () => {
    if (!formData.curriculum_name.trim()) {
      showSnackbar('Curriculum name is required', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await updateCurriculum(selectedCurriculum.id, formData);
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
    setSelectedCurriculum(curriculum);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCurriculum(null);
  };

  const handleDeleteCurriculum = async () => {
    try {
      setLoading(true);
      const response = await deleteCurriculum(selectedCurriculum.id);
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

  // Handle checkbox functions
  const handleCurriculumCheck = (id) => {
    const newChecked = checkedCurriculum.includes(id)
      ? checkedCurriculum.filter((itemId) => itemId !== id)
      : [...checkedCurriculum, id];
    setCheckedCurriculum(newChecked);
    setSelectAllCurriculum(newChecked.length === curriculumData.length);
  };

  const handleSelectAllCurriculum = () => {
    if (selectAllCurriculum) {
      setCheckedCurriculum([]);
    } else {
      setCheckedCurriculum(curriculumData.map((item) => item.id));
    }
    setSelectAllCurriculum(!selectAllCurriculum);
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
            <Tab label="Subject Bank" />
            <Tab label="Class Subject" />
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
              }}
            >
              {/* LEFT - Curriculum Table */}
              <Box sx={{ flex: { md: 5 }, width: '100%' }}>
                <ParentCard
                  title={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h5">Curriculum</Typography>
                      <Box display="flex" gap={1}>
                        <Button variant="outlined">Import</Button>
                        <Button variant="contained" onClick={handleOpenCreateModal}>
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
                            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>S/N</TableCell>
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
                                <TableCell align="center">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenEditModal(item)}
                                  >
                                    <IconEdit size={16} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDeleteDialog(item)}
                                  >
                                    <IconTrash size={16} />
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

              {/* RIGHT - Assign to Classes */}
              <Box sx={{ flex: { md: 7 }, width: '100%' }}>
                <ParentCard
                  title={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h5">Assign to Classes</Typography>
                      <Box display="flex" gap={1}>
                        <Select
                          size="small"
                          value={selectedSession}
                          onChange={(e) => setSelectedSession(e.target.value)}
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
            </Box>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexDirection: { xs: 'column', md: 'row' },
                width: '100%',
              }}
            >
              <Box sx={{ flex: { md: 5 }, width: '100%' }}>
                <ParentCard>
                  <TableContainer>
                    <Table sx={{ tableLayout: 'fixed' }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#eef2f7' }}>
                          <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>
                            <Checkbox
                              checked={selectAllCurriculum}
                              onChange={handleSelectAllCurriculum}
                            />
                          </TableCell>
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
                        {curriculumData.map((item, i) => (
                          <TableRow key={item.id} hover>
                            <TableCell>
                              <Checkbox
                                size="small"
                                checked={checkedCurriculum.includes(item.id)}
                                onChange={() => handleCurriculumCheck(item.id)}
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
                            <TableCell align="center">
                              <IconButton size="small">
                                <MoreVertIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </ParentCard>
              </Box>
              <Box sx={{ flex: { md: 7 }, width: '100%' }}>
                <ParentCard
                  title={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Subject Bank
                      </Typography>
                      <Button variant="contained">Add Subject</Button>
                    </Box>
                  }
                >
                  <TableContainer>
                    <Table sx={{ tableLayout: 'fixed' }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#eef2f7' }}>
                          <TableCell width="10%">S/N</TableCell>
                          <TableCell width="30%">Subject</TableCell>
                          <TableCell width="25%">Subject Code</TableCell>
                          <TableCell width="20%">Program</TableCell>
                          <TableCell width="15%" />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {subjectData.map((item, i) => (
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
                                {item.name}
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
                                {item.code}
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
                                {item.program}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'flex-end',
                                  gap: 1,
                                }}
                              >
                                <IconButton size="small" sx={{ color: '#3b82f6' }}>
                                  ✏️
                                </IconButton>
                                <IconButton size="small" sx={{ color: '#ef4444' }}>
                                  🗑️
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </ParentCard>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexDirection: { xs: 'column', md: 'row' },
                width: '100%',
              }}
            >
              {/* LEFT: Classes */}
              <Box sx={{ flex: { md: 4 }, width: '100%' }}>
                <ParentCard
                  title={
                    <Select
                      size="small"
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      fullWidth
                    >
                      <MenuItem value="Junior Secondary">Junior Secondary</MenuItem>
                      <MenuItem value="Senior Secondary">Senior Secondary</MenuItem>
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
                      {classes.map((cls) => (
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
                            label={cls.name}
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
                      <Box display="flex" gap={1}>
                        <TextField size="small" placeholder="Search" />
                        <Select size="small" defaultValue="Curriculum">
                          <MenuItem value="Curriculum">Curriculum</MenuItem>
                        </Select>
                        <Select size="small" defaultValue="Term">
                          <MenuItem value="Term">Term</MenuItem>
                        </Select>
                      </Box>
                      <Button variant="contained">Add Subject to Class</Button>
                    </Box>
                  }
                >
                  <Paper variant="outlined">
                    <TableContainer>
                      <Table sx={{ tableLayout: 'fixed' }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '5%' }}>S/N</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Subject</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>
                              Passmark
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Unit</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }} align="center">
                              Action
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {subjects.map((item, i) => (
                            <TableRow key={item.id} hover>
                              <TableCell>{i + 1}</TableCell>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>
                                <TextField size="small" value={item.passmark} />
                              </TableCell>
                              <TableCell>
                                <TextField size="small" value={item.unit} />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={item.status}
                                  size="small"
                                  sx={{
                                    bgcolor: item.status === 'Compulsory' ? '#dcfce7' : '#fef3c7',
                                    color: item.status === 'Compulsory' ? '#166534' : '#92400e',
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <IconButton size="small">
                                  <MoreVertIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </ParentCard>

                {/* SUBJECT GROUP */}
                <Box mt={3}>
                  <ParentCard
                    title={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <TextField size="small" placeholder="Search" />
                        <Button variant="contained">Add Subject Group</Button>
                      </Box>
                    }
                  >
                    <Paper variant="outlined">
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Group Name</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Passmark</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                Action
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {subjectGroups.map((item, i) => (
                              <TableRow key={item.id} hover>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>{item.groupName}</TableCell>
                                <TableCell>{item.subject}</TableCell>
                                <TableCell>{item.passmark}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={item.status}
                                    size="small"
                                    sx={{
                                      bgcolor: item.status === 'Compulsory' ? '#dcfce7' : '#fef3c7',
                                      color: item.status === 'Compulsory' ? '#166534' : '#92400e',
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton size="small">
                                    <MoreVertIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </ParentCard>
                </Box>
              </Box>
            </Box>
          </TabPanel>
        </ParentCard>
      </Box>

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
            Are you sure you want to delete "{selectedCurriculum?.curriculum_name}"? This action
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

export default CurriculumManager;
