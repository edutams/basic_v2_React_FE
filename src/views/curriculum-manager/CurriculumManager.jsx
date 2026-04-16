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
  fetchClassSubjects,
  addOrUpdateClassSubject,
  fetchClassesByProgramme,
  fetchAvailableCurriculumsForImport,
  importAllCurriculums,
  fetchAvailableSubjectsForClass,
  fetchSubjectsByProgramme,
  fetchSubjectGroups,
  createSubjectGroup,
  updateSubjectGroup,
  deleteSubjectGroup,
} from '../../api/tenantCurriculumApi';
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
  Autocomplete,
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
  const [selectedSubjectBankCurriculum, setSelectedSubjectBankCurriculum] = useState('');

  const [program, setProgram] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);

  // Data states
  const [curriculumData, setCurriculumData] = useState([]);
  const [classData, setClassData] = useState([]);

  // Class Subject tab states
  const [classesForProgram, setClassesForProgram] = useState([]);
  const [classSubjectsList, setClassSubjectsList] = useState([]);
  const [loadingClassSubjects, setLoadingClassSubjects] = useState(false);

  // Add Subject to Class modal
  const [openAddSubjectToClassModal, setOpenAddSubjectToClassModal] = useState(false);
  const [availableSubjectsForClass, setAvailableSubjectsForClass] = useState([]);
  const [loadingAvailableSubjects, setLoadingAvailableSubjects] = useState(false);
  const [addSubjectToClassForm, setAddSubjectToClassForm] = useState({
    subject_id: '',
    programme_id: '',
    programme_subject_id: '',
    status: 'compulsory',
    unit: '',
    pass_mark: '',
  });

  // Edit Class Subject modal
  const [openEditClassSubjectModal, setOpenEditClassSubjectModal] = useState(false);
  const [editClassSubjectForm, setEditClassSubjectForm] = useState({
    class_subject_id: '',
    subject_id: '',
    subject_name: '',
    programme_id: '',
    status: 'compulsory',
    unit: 1,
    pass_mark: 50,
  });

  // Subject Group states
  const [subjectGroupsList, setSubjectGroupsList] = useState([]);
  const [loadingSubjectGroups, setLoadingSubjectGroups] = useState(false);
  const [openSubjectGroupModal, setOpenSubjectGroupModal] = useState(false);
  const [editingSubjectGroup, setEditingSubjectGroup] = useState(null);
  const [subjectGroupForm, setSubjectGroupForm] = useState({
    group_name: '',
    programme_id: '',
    curriculum_id: '',
    unit: '',
    pass_mark: '',
    status: 'active',
    subject_ids: [],
  });
  const [subjectGroupModalSubjects, setSubjectGroupModalSubjects] = useState([]);
  const [loadingModalSubjects, setLoadingModalSubjects] = useState(false);

  // Subject Bank states
  const [subjectsList, setSubjectsList] = useState([]); const [programmesList, setProgrammesList] = useState([]);
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
    pass_mark: 50,
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
  const [openImportModal, setOpenImportModal] = useState(false);

  // Import confirm dialog state
  const [openImportConfirm, setOpenImportConfirm] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);

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

  useEffect(() => {
    if (selectedSubjectBankCurriculum) {
      loadSubjectsList();
    } else {
      setSubjectsList([]);
    }
  }, [selectedSubjectBankCurriculum]);

  const loadProgrammes = async () => {
    try {
      const response = await fetchProgrammes();
      if (response.status) {
        setProgrammesList(response.data);
        // Auto-select first programme
        if (response.data.length > 0) {
          setProgram(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load programmes');
    }
  };

  const loadClassesForProgram = async (programmeId) => {
    try {
      const response = await fetchClassesByProgramme(programmeId);
      if (response.status) {
        setClassesForProgram(response.data);
        // Auto-select first class
        if (response.data.length > 0) {
          setSelectedClass(response.data[0].id);
        }
      }
    } catch (error) {
      showSnackbar('Failed to load classes for programme', 'error');
    }
  };

  const loadClassSubjects = async (classId) => {
    try {
      setLoadingClassSubjects(true);
      const response = await fetchClassSubjects(classId);
      if (response.status) {
        setClassSubjectsList(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to load class subjects', 'error');
    } finally {
      setLoadingClassSubjects(false);
    }
  };

  const loadSubjectsList = async () => {
    try {
      setLoadingSubjects(true);
      const response = await fetchSubjects(selectedSubjectBankCurriculum);
      if (response.status) {
        setSubjectsList(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to load subjects for curriculum', 'error');
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Load class assignments when session or term changes
  useEffect(() => {
    if (selectedSession && selectedTerm) {
      loadClassAssignments();
    }
  }, [selectedSession, selectedTerm]);

  // Load programmes when Class Subject tab is accessed
  useEffect(() => {
    if (tab === 2 && programmesList.length === 0) {
      loadProgrammes();
    }
  }, [tab]);

  // Auto-select first curriculum when Subject Bank tab opens
  useEffect(() => {
    if (tab === 1 && curriculumData.length > 0 && !selectedSubjectBankCurriculum) {
      setSelectedSubjectBankCurriculum(curriculumData[0].id);
    }
  }, [tab, curriculumData]);

  // Load subject groups when programme is set on Class Subject tab
  useEffect(() => {
    if (tab === 2 && program) {
      loadSubjectGroups(program);
    }
  }, [tab, program]);

  // Load classes when program changes
  useEffect(() => {
    if (program) {
      loadClassesForProgram(program);
    }
  }, [program]);

  // Load class subjects when class is selected
  useEffect(() => {
    if (selectedClass) {
      loadClassSubjects(selectedClass);
    }
  }, [selectedClass]);

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
  };

  // Add Subject to Class handlers
  const handleOpenAddSubjectToClass = async () => {
    if (!selectedClass) return;
    try {
      setLoadingAvailableSubjects(true);
      setOpenAddSubjectToClassModal(true);
      const response = await fetchAvailableSubjectsForClass(selectedClass);
      if (response.status) {
        setAvailableSubjectsForClass(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to load available subjects', 'error');
    } finally {
      setLoadingAvailableSubjects(false);
    }
  };

  const handleCloseAddSubjectToClass = () => {
    setOpenAddSubjectToClassModal(false);
    setAvailableSubjectsForClass([]);
    setAddSubjectToClassForm({ subject_id: '', programme_id: '', programme_subject_id: '', status: 'compulsory', unit: 1, pass_mark: 50 });
  };

  const handleSubjectToClassSelect = (subjectId) => {
    const subject = availableSubjectsForClass.find((s) => s.id === subjectId);
    if (subject) {
      setAddSubjectToClassForm({
        subject_id: subject.id,
        programme_id: subject.programme_id,
        programme_subject_id: subject.programme_subject_id,
        status: subject.status || 'compulsory',
        unit: subject.unit || 1,
        pass_mark: subject.pass_mark || 50,
      });
    }
  };

  const handleSaveSubjectToClass = async () => {
    if (!addSubjectToClassForm.subject_id) {
      showSnackbar('Please select a subject', 'error');
      return;
    }
    try {
      setLoading(true);
      const response = await addOrUpdateClassSubject({
        class_id: selectedClass,
        ...addSubjectToClassForm,
      });
      if (response.status) {
        showSnackbar('Subject added to class successfully', 'success');
        handleCloseAddSubjectToClass();
        loadClassSubjects(selectedClass);
      } else {
        showSnackbar(response.message || 'Failed to add subject', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to add subject to class', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditClassSubject = (item) => {
    setEditClassSubjectForm({
      class_subject_id: item.class_subject_id,
      subject_id: item.subject_id,
      subject_name: item.subject_name,
      programme_id: item.programme_id,
      status: item.status,
      unit: item.unit,
      pass_mark: item.pass_mark,
    });
    setOpenEditClassSubjectModal(true);
  };

  const handleCloseEditClassSubject = () => {
    setOpenEditClassSubjectModal(false);
  };

  const handleSaveEditClassSubject = async () => {
    try {
      setLoading(true);
      const response = await addOrUpdateClassSubject({
        class_id: selectedClass,
        subject_id: editClassSubjectForm.subject_id,
        programme_id: editClassSubjectForm.programme_id,
        status: editClassSubjectForm.status,
        unit: editClassSubjectForm.unit,
        pass_mark: editClassSubjectForm.pass_mark,
      });
      if (response.status) {
        showSnackbar('Class subject updated successfully', 'success');
        handleCloseEditClassSubject();
        loadClassSubjects(selectedClass);
      } else {
        showSnackbar(response.message || 'Failed to update', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to update class subject', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Subject Group handlers
  const fetchModalSubjects = async (programmeId, curriculumId) => {
    if (!programmeId || !curriculumId) { setSubjectGroupModalSubjects([]); return; }
    try {
      setLoadingModalSubjects(true);
      const res = await fetchSubjectsByProgramme(programmeId, curriculumId);
      if (res.status) setSubjectGroupModalSubjects(res.data);
    } catch {
      setSubjectGroupModalSubjects([]);
    } finally {
      setLoadingModalSubjects(false);
    }
  };

  const loadSubjectGroups = async (programmeId) => {
    if (!programmeId) return;
    try {
      setLoadingSubjectGroups(true);
      const response = await fetchSubjectGroups(programmeId);
      if (response.status) setSubjectGroupsList(response.data);
    } catch (error) {
      showSnackbar('Failed to load subject groups', 'error');
    } finally {
      setLoadingSubjectGroups(false);
    }
  };

  const handleOpenSubjectGroupModal = async (group = null) => {
    if (group) {
      setEditingSubjectGroup(group);
      setSubjectGroupForm({
        group_name: group.group_name,
        programme_id: group.programme_id,
        curriculum_id: group.curriculum_id || '',
        unit: group.unit,
        pass_mark: group.pass_mark,
        status: group.status,
        subject_ids: group.subjects?.map((s) => s.id) || [],
      });
      await fetchModalSubjects(group.programme_id, group.curriculum_id);
    } else {
      setEditingSubjectGroup(null);
      setSubjectGroupForm({ group_name: '', programme_id: '', curriculum_id: '', unit: '', pass_mark: '', status: 'active', subject_ids: [] });
      setSubjectGroupModalSubjects([]);
    }
    setOpenSubjectGroupModal(true);
    if (programmesList.length === 0) loadProgrammes();
  };

  const handleCloseSubjectGroupModal = () => {
    setOpenSubjectGroupModal(false);
    setEditingSubjectGroup(null);
  };

  const handleSaveSubjectGroup = async () => {
    if (!subjectGroupForm.group_name.trim() || !subjectGroupForm.programme_id) {
      showSnackbar('Group name and programme are required', 'error');
      return;
    }
    try {
      setLoading(true);
      const response = editingSubjectGroup
        ? await updateSubjectGroup(editingSubjectGroup.id, subjectGroupForm)
        : await createSubjectGroup(subjectGroupForm);
      if (response.status) {
        showSnackbar(editingSubjectGroup ? 'Subject group updated' : 'Subject group created', 'success');
        handleCloseSubjectGroupModal();
        loadSubjectGroups(subjectGroupForm.programme_id);
      } else {
        showSnackbar(response.message || 'Failed to save subject group', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to save subject group', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubjectGroup = async (id, programmeId) => {
    try {
      const response = await deleteSubjectGroup(id);
      if (response.status) {
        showSnackbar('Subject group deleted', 'success');
        loadSubjectGroups(programmeId);
      }
    } catch (error) {
      showSnackbar('Failed to delete subject group', 'error');
    }
  };

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

  // Import Curriculum — confirm dialog
  const handleOpenImportModal = () => setOpenImportConfirm(true);

  const handleCloseImportModal = () => setOpenImportConfirm(false);

  const handleImportCurriculum = async () => {
    try {
      setLoadingImport(true);
      const response = await importAllCurriculums();
      if (response.status) {
        showSnackbar(response.message || 'Curriculums imported successfully', 'success');
        handleCloseImportModal();
        loadCurriculums();
      } else {
        showSnackbar(response.message || 'Failed to import curriculums', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to import curriculums', 'error');
    } finally {
      setLoadingImport(false);
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

  // Add Subject Modal Handlers
  const handleOpenAddSubjectModal = () => {
    if (!selectedSubjectBankCurriculum) {
      showSnackbar('Please select a curriculum first', 'error');
      return;
    }
    setSubjectFormData({ subject_name: '', subject_code: '', programme_id: '', unit: '', status: 'compulsory' });
    setOpenAddSubjectModal(true);
    // Fetch programs when modal opens
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
        curriculum_id: selectedSubjectBankCurriculum,
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

  // Edit Subject Handlers
  const handleOpenEditSubjectModal = (subject) => {
    setSelectedSubject(subject);
    setSubjectFormData({
      subject_name: subject.subject_name,
      subject_code: subject.subject_code || '',
      programme_id: subject.programme_id || '',
      unit: subject.unit ?? '',
      pass_mark: subject.pass_mark ?? 50,
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
    setSubjectFormData({ subject_name: '', subject_code: '', programme_id: '', unit: '', pass_mark: 50, status: 'compulsory' });
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

  // Delete Subject Handlers
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

  // Handle class subject updates
  const handleClassSubjectChange = async (subjectId, field, value) => {
    try {
      const subject = classSubjectsList.find(s => s.subject_id === subjectId);
      if (!subject) return;

      const dataToSubmit = {
        class_id: selectedClass,
        subject_id: subjectId,
        programme_id: subject.programme_id,
        status: field === 'status' ? value : subject.status,
        unit: field === 'unit' ? value : subject.unit,
        pass_mark: field === 'pass_mark' ? value : subject.pass_mark,
      };

      const response = await addOrUpdateClassSubject(dataToSubmit);
      if (response.status) {
        // Update local state
        setClassSubjectsList(prev => prev.map(s =>
          s.subject_id === subjectId ? { ...s, [field]: value, is_default: 0 } : s
        ));
        showSnackbar('Subject updated successfully', 'success');
      } else {
        showSnackbar(response.message || 'Failed to update subject', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to update subject', 'error');
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
                        <Button variant="outlined" onClick={handleOpenImportModal}>
                          Import
                        </Button>
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
                            <TableCell sx={{ fontWeight: 'bold', width: '8%' }}>S/N</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>
                              Curriculum Name
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '17%' }}>Imported</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '25%' }}>
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={5} align="center">
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
                                <TableCell
                                  align="center"
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 1, // spacing between icons
                                  }}
                                >
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
              <Box sx={{ flex: { md: 7 }, width: '100%' }}>
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
                          <TableCell sx={{ fontWeight: 'bold', width: '10%' }}></TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '60%' }}>
                            Curriculum Name
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {curriculumData.map((item, i) => (
                          <TableRow key={item.id} hover>
                            <TableCell>
                              <Radio
                                size="small"
                                checked={selectedSubjectBankCurriculum === item.id}
                                onChange={() => setSelectedSubjectBankCurriculum(item.id)}
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
                      <Button variant="contained" onClick={handleOpenAddSubjectModal}>Add Subject</Button>
                    </Box>
                  }
                >
                  <TableContainer>
                    <Table sx={{ tableLayout: 'fixed' }}>
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
                              <TableCell>{item.pass_mark ?? '-'}</TableCell>
                              <TableCell>{item.unit ?? '-'}</TableCell>
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
                          <TableRow><TableCell colSpan={7} align="center"><Typography color="textSecondary">No subjects found. Please select a curriculum or add a subject.</Typography></TableCell></TableRow>
                        )}
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
                      <MenuItem value="" disabled>Select Program</MenuItem>
                      {programmesList.map((prog) => (
                        <MenuItem key={prog.id} value={prog.id}>
                          {prog.programme_title || prog.programme_name}
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
                      <Button variant="contained" disabled={!selectedClass} onClick={handleOpenAddSubjectToClass}>
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
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Passmark</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Unit</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%' }} align="center">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {loadingClassSubjects ? (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                <CircularProgress size={24} />
                              </TableCell>
                            </TableRow>
                          ) : classSubjectsList.length > 0 ? (
                            classSubjectsList.map((item, i) => (
                              <TableRow key={item.subject_id} hover>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>{item.subject_name}</TableCell>
                                <TableCell>{item.pass_mark}</TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={item.status}
                                    size="small"
                                    sx={{
                                      bgcolor: item.status === 'compulsory' ? '#dbeafe' : '#f3f4f6',
                                      color: item.status === 'compulsory' ? '#1e40af' : '#6b7280',
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton size="small" onClick={() => handleOpenEditClassSubject(item)}>
                                    <IconEdit size={16} />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                <Typography color="textSecondary">
                                  {selectedClass ? 'No subjects found for this class' : 'Please select a class to view subjects'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </ParentCard>

                {/* Subject Group Card */}
                <Box sx={{ mt: 3 }}>
                  <ParentCard
                    title={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Subject Group</Typography>
                        <Button variant="contained" size="small" onClick={() => handleOpenSubjectGroupModal()}>
                          Add Subject Group
                        </Button>
                      </Box>
                    }
                  >
                    <TableContainer>
                      <Table sx={{ tableLayout: 'fixed' }}>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#eef2f7' }}>
                            <TableCell width="8%">#</TableCell>
                            <TableCell width="22%">Group Name</TableCell>
                            <TableCell width="30%">Subjects</TableCell>
                            <TableCell width="10%">Unit</TableCell>
                            <TableCell width="12%">Pass Mark</TableCell>
                            <TableCell width="10%">Status</TableCell>
                            <TableCell width="8%" align="center">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {loadingSubjectGroups ? (
                            <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                          ) : subjectGroupsList.length > 0 ? (
                            subjectGroupsList.map((grp, i) => (
                              <TableRow key={grp.id} hover>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>{grp.group_name}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {grp.subjects?.map((s) => (
                                      <Chip key={s.id} label={s.subject_name} size="small" sx={{ bgcolor: '#334155', color: '#fff', fontSize: '0.7rem' }} />
                                    ))}
                                  </Box>
                                </TableCell>
                                <TableCell>{grp.unit}</TableCell>
                                <TableCell>{grp.pass_mark}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={grp.status === 'active' ? 'Active' : 'Inactive'}
                                    size="small"
                                    sx={{
                                      bgcolor: grp.status === 'active' ? '#dcfce7' : '#fee2e2',
                                      color: grp.status === 'active' ? '#166534' : '#991b1b',
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                    <IconButton size="small" onClick={() => handleOpenSubjectGroupModal(grp)}>
                                      <IconEdit size={16} />
                                    </IconButton>
                                    <IconButton size="small" sx={{ color: '#ef4444' }} onClick={() => handleDeleteSubjectGroup(grp.id, grp.programme_id)}>
                                      <IconTrash size={16} />
                                    </IconButton>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow><TableCell colSpan={7} align="center"><Typography color="textSecondary">No subject groups yet</Typography></TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
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
              type="number"
            />

            <TextField
              fullWidth
              label="Pass Mark"
              value={subjectFormData.pass_mark}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, pass_mark: e.target.value })}
              margin="normal"
              type="number"
              inputProps={{ min: 0, max: 100 }}
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
              type="number"
            />

            <TextField
              fullWidth
              label="Pass Mark"
              value={subjectFormData.pass_mark}
              onChange={(e) => setSubjectFormData({ ...subjectFormData, pass_mark: e.target.value })}
              margin="normal"
              type="number"
              inputProps={{ min: 0, max: 100 }}
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

      {/* Add Subject to Class Modal */}
      <Dialog open={openAddSubjectToClassModal} onClose={handleCloseAddSubjectToClass} maxWidth="sm" fullWidth>
        <DialogTitle>Add Subject to Class</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {loadingAvailableSubjects ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <Select
                  fullWidth
                  value={addSubjectToClassForm.subject_id}
                  onChange={(e) => handleSubjectToClassSelect(e.target.value)}
                  displayEmpty
                  size="small"
                >
                  <MenuItem value="" disabled>Select Subject</MenuItem>
                  {availableSubjectsForClass.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.subject_name}{s.subject_code ? ` (${s.subject_code})` : ''}
                    </MenuItem>
                  ))}
                </Select>

                <TextField
                  fullWidth
                  size="small"
                  label="Pass Mark"
                  type="number"
                  value={addSubjectToClassForm.pass_mark}
                  onChange={(e) => setAddSubjectToClassForm((f) => ({ ...f, pass_mark: parseInt(e.target.value) || 0 }))}
                  inputProps={{ min: 0, max: 100 }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Unit"
                  type="number"
                  value={addSubjectToClassForm.unit}
                  onChange={(e) => setAddSubjectToClassForm((f) => ({ ...f, unit: parseInt(e.target.value) || 1 }))}
                  inputProps={{ min: 1 }}
                />

                <Select
                  fullWidth
                  size="small"
                  value={addSubjectToClassForm.status}
                  onChange={(e) => setAddSubjectToClassForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <MenuItem value="compulsory">Compulsory</MenuItem>
                  <MenuItem value="optional">Optional</MenuItem>
                </Select>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddSubjectToClass}>Cancel</Button>
          <Button onClick={handleSaveSubjectToClass} variant="contained" disabled={loading || loadingAvailableSubjects}>
            {loading ? <CircularProgress size={24} /> : 'Add Subject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Class Subject Modal */}
      <Dialog open={openEditClassSubjectModal} onClose={handleCloseEditClassSubject} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Class Subject — {editClassSubjectForm.subject_name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Pass Mark"
              type="number"
              value={editClassSubjectForm.pass_mark}
              onChange={(e) => setEditClassSubjectForm((f) => ({ ...f, pass_mark: parseInt(e.target.value) || 0 }))}
              inputProps={{ min: 0, max: 100 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Unit"
              type="number"
              value={editClassSubjectForm.unit}
              onChange={(e) => setEditClassSubjectForm((f) => ({ ...f, unit: parseInt(e.target.value) || 1 }))}
              inputProps={{ min: 1 }}
            />
            <Select
              fullWidth
              size="small"
              value={editClassSubjectForm.status}
              onChange={(e) => setEditClassSubjectForm((f) => ({ ...f, status: e.target.value }))}
            >
              <MenuItem value="compulsory">Compulsory</MenuItem>
              <MenuItem value="optional">Optional</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditClassSubject}>Cancel</Button>
          <Button onClick={handleSaveEditClassSubject} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subject Group Modal */}
      <Dialog open={openSubjectGroupModal} onClose={handleCloseSubjectGroupModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSubjectGroup ? 'Edit Subject Group' : 'Add Subject Group'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Select
              fullWidth
              size="small"
              value={subjectGroupForm.programme_id}
              onChange={async (e) => {
                const pid = e.target.value;
                setSubjectGroupForm((f) => ({ ...f, programme_id: pid, subject_ids: [] }));
                await fetchModalSubjects(pid, subjectGroupForm.curriculum_id);
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>Select Program</MenuItem>
              {programmesList.map((prog) => (
                <MenuItem key={prog.id} value={prog.id}>{prog.programme_title || prog.programme_name}</MenuItem>
              ))}
            </Select>

            <Select
              fullWidth
              size="small"
              value={subjectGroupForm.curriculum_id}
              onChange={async (e) => {
                const cid = e.target.value;
                setSubjectGroupForm((f) => ({ ...f, curriculum_id: cid, subject_ids: [] }));
                await fetchModalSubjects(subjectGroupForm.programme_id, cid);
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>Select Curriculum</MenuItem>
              {curriculumData.filter((c) => c.status === 'active').map((cur) => (
                <MenuItem key={cur.id} value={cur.id}>{cur.curriculum_name}</MenuItem>
              ))}
            </Select>

            <TextField
              fullWidth
              size="small"
              label="Group Name"
              value={subjectGroupForm.group_name}
              onChange={(e) => setSubjectGroupForm((f) => ({ ...f, group_name: e.target.value }))}
            />

            <TextField
              fullWidth
              size="small"
              label="Unit"
              type="number"
              value={subjectGroupForm.unit}
              onChange={(e) => setSubjectGroupForm((f) => ({ ...f, unit: parseInt(e.target.value) || 1 }))}
              inputProps={{ min: 1 }}
            />

            <TextField
              fullWidth
              size="small"
              label="Pass Mark"
              type="number"
              value={subjectGroupForm.pass_mark}
              onChange={(e) => setSubjectGroupForm((f) => ({ ...f, pass_mark: parseInt(e.target.value) || 0 }))}
              inputProps={{ min: 0, max: 100 }}
            />

            {/* Subject search & selection */}
            <Box sx={{ bgcolor: '#e0f2fe', p: 1.5, borderRadius: 1 }}>
              <Autocomplete
                multiple
                loading={loadingModalSubjects}
                options={subjectGroupModalSubjects}
                getOptionLabel={(s) => `${s.subject_name}${s.subject_code ? ` (${s.subject_code})` : ''}`}
                value={subjectGroupModalSubjects.filter((s) => subjectGroupForm.subject_ids.includes(s.id))}
                onChange={(_, selected) =>
                  setSubjectGroupForm((f) => ({ ...f, subject_ids: selected.map((s) => s.id) }))
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={
                  !subjectGroupForm.programme_id ? 'Select a programme first' :
                    !subjectGroupForm.curriculum_id ? 'Select a curriculum first' :
                      'No subjects found'
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubjectGroupModal}>Cancel</Button>
          <Button onClick={handleSaveSubjectGroup} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Curriculum Confirm Dialog */}      <Dialog open={openImportConfirm} onClose={handleCloseImportModal} maxWidth="sm" fullWidth>
        <DialogTitle>Import Curriculums</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            This will import all available curriculums from the agent system into your school.
            Already imported curriculums will be skipped. Are you sure you want to continue?
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportModal}>Cancel</Button>
          <Button
            onClick={handleImportCurriculum}
            variant="contained"
            disabled={loadingImport}
          >
            {loadingImport ? <CircularProgress size={24} /> : 'Yes, Import All'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default CurriculumManager;
