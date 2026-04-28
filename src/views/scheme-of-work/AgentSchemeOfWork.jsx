import React, { useMemo, useState, useEffect, useRef } from 'react';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import FilterSideDrawer from '../../components/shared/FilterSideDrawer';
import { useReactToPrint } from 'react-to-print';

import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Card,
  Grid,
  Checkbox,
  Tabs,
  Tab,
  TextField,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import {
  IconFolder,
  IconFileDescription,
  IconVideo,
  IconDownload,
  IconUpload,
  IconFilter,
  IconBook2,
  IconArrowRightSquare,
  IconPlus,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { landlordSchemeApi } from '../../api/schemeOfWorkApi';
import {
  fetchProgrammes,
  fetchClassesByProgramme,
  fetchSubjectsByProgramme,
} from '../../api/curriculumApi';
import useNotification from '../../hooks/useNotification';
import ReusableModal from '../../components/shared/ReusableModal';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const BCrumb = [
  {
    to: '/agent',
    title: 'Agent Dashboard',
  },
  { title: 'Scheme Of Work' },
];

const AgentSchemeOfWork = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState([]);
  const [activeTerm, setActiveTerm] = useState('');
  const [rows, setRows] = useState([]);
  const [analytics, setAnalytics] = useState({ total_topics: 0, total_subtopics: 0 });

  // Filter options
  const [programmes, setProgrammes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);


  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [subtopicModalOpen, setSubtopicModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(''); // 'topic' | 'subtopic'

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuType, setMenuType] = useState(null); // 'topic' | 'subtopic' | 'row'
  const [selectedRow, setSelectedRow] = useState(null);

  const [objectiveModalOpen, setObjectiveModalOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);

  // View Details Modal
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [viewDetailsData, setViewDetailsData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const printRef = useRef(null);

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Scheme_of_Work_${viewDetailsData?.week?.week_name || 'Details'}`,
  });

  // Inline Filters
  const [programme, setProgramme] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [subject, setSubject] = useState('');

  // Drawer states
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  // Excel modal states
  const [dlTemplateOpen, setDlTemplateOpen] = useState(false);
  const [dlTemplateFilters, setDlTemplateFilters] = useState({ programme: '', classLevel: '', subject: '', term: '' });
  const [dlTemplateClasses, setDlTemplateClasses] = useState([]);
  const [dlTemplateSubjects, setDlTemplateSubjects] = useState([]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFilters, setUploadFilters] = useState({ programme: '', classLevel: '', subject: '', term: '' });
  const [uploadClasses, setUploadClasses] = useState([]);
  const [uploadSubjects, setUploadSubjects] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [dlSchemeOpen, setDlSchemeOpen] = useState(false);
  const [dlSchemeFilters, setDlSchemeFilters] = useState({ programme: '', classLevel: '', subject: '', term: '' });
  const [dlSchemeClasses, setDlSchemeClasses] = useState([]);
  const [dlSchemeSubjects, setDlSchemeSubjects] = useState([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    try {
      const [termsRes, progsRes] = await Promise.all([
        landlordSchemeApi.getTerms(),
        fetchProgrammes(),
      ]);
      setTerms(termsRes);
      if (termsRes.length > 0) setActiveTerm(termsRes[0].id);
      setProgrammes(progsRes.data.map(p => ({ value: p.id, label: p.programme_name })));
    } catch (error) {
      notify.error('Failed to initialize data');
    }
  };

  const handleFilterChange = React.useCallback(async (key, val) => {
    if (key === 'programme') {
      try {
        const classesRes = await fetchClassesByProgramme(val);
        setClasses(classesRes.data.map(c => ({ value: c.id, label: c.class_name })));
        const subjectsRes = await fetchSubjectsByProgramme(val);
        setSubjects(subjectsRes.data.map(s => ({ value: s.id, label: s.subject_name })));
      } catch (error) {
        console.error('Failed to fetch dependent filters', error);
      }
    }
  }, []);

  const handleApplyFilters = async (vals) => {
    setActiveFilters(vals);
    fetchScheme(vals, activeTerm);
  };

  const handleFetch = () => {
    const filters = { ...activeFilters, programme, classLevel, subject };
    setActiveFilters(filters);
    fetchScheme({ subject: filters.subject, classLevel: filters.classLevel }, activeTerm);
  };

  const fetchScheme = async (filters, termId) => {
    if (!filters.subject || !filters.classLevel || !termId) return;
    setLoading(true);
    try {
      const data = await landlordSchemeApi.fetchScheme({
        filters: {
          subject_id: filters.subject,
          class_id: filters.classLevel,
        },
        term_id: termId,
      });
      setRows(data);
      fetchAnalytics(filters, termId);
    } catch (error) {
      notify.error('Failed to fetch scheme of work');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTopic = async (topicData) => {
    try {
      if (selectedTopic && selectedTopic.topic_id) {
        await landlordSchemeApi.updateTopic(selectedTopic.topic_id, topicData);
        notify.success('Topic updated successfully');
      } else {
        await landlordSchemeApi.addTopic({ ...topicData, scheme_of_work_id: selectedRow.scheme_of_work_id });
        notify.success('Topic added successfully');
      }
      setTopicModalOpen(false);
      fetchScheme(activeFilters, activeTerm);
    } catch (error) {
      notify.error('Operation failed');
    }
  };

  const handleSaveSubtopic = async (subtopicData) => {
    try {
      if (selectedSubtopic && selectedSubtopic.sub_topic_id) {
        await landlordSchemeApi.updateSubtopic(selectedSubtopic.sub_topic_id, subtopicData);
        notify.success('Subtopic updated successfully');
      } else {
        await landlordSchemeApi.addSubtopic({ ...subtopicData, topic_id: selectedTopic.topic_id });
        notify.success('Subtopic added successfully');
      }
      setSubtopicModalOpen(false);
      fetchScheme(activeFilters, activeTerm);
    } catch (error) {
      notify.error('Operation failed');
    }
  };

  const handleSaveObjective = async (objectiveData) => {
    try {
      if (selectedObjective) {
        await landlordSchemeApi.updateObjective(selectedObjective.id, {
          learning_objective_details: objectiveData.learning_objective_details,
        });
        notify.success('Learning objective updated successfully');
      } else {
        await landlordSchemeApi.addObjective({
          learning_objective_details: objectiveData.learning_objective_details,
          sub_topic_id: selectedRow.sub_topic_id
        });
        notify.success('Learning objective added successfully');
      }
      
      // Update scheme entry with all additional fields
      if (objectiveData.previous_knowledge || objectiveData.practical_approach || 
          objectiveData.evaluation || objectiveData.instructional_resources || 
          objectiveData.teaching_note || objectiveData.teacher_activity || 
          objectiveData.learner_activity) {
        await landlordSchemeApi.updateSchemeEntry(selectedRow.scheme_of_work_id, {
          previous_knowledge: objectiveData.previous_knowledge,
          practical_approach: objectiveData.practical_approach,
          evaluation: objectiveData.evaluation,
          instructional_resources: objectiveData.instructional_resources,
          teaching_note: objectiveData.teaching_note,
          teacher_activity: objectiveData.teacher_activity,
          learner_activity: objectiveData.learner_activity,
        });
      }
      
      setObjectiveModalOpen(false);
      fetchScheme(activeFilters, activeTerm);
    } catch (error) {
      notify.error('Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteType === 'topic') {
        await landlordSchemeApi.deleteTopic(selectedRow.id);
      } else if (deleteType === 'subtopic') {
        await landlordSchemeApi.deleteSubtopic(selectedRow.id);
      } else if (deleteType === 'objective') {
        await landlordSchemeApi.deleteObjective(selectedRow.id);
      }
      notify.success(`${deleteType} deleted successfully`);
      setDeleteModalOpen(false);
      fetchScheme(activeFilters, activeTerm);
    } catch (error) {
      notify.error('Deletion failed');
    }
  };

  const paginatedRows = useMemo(() => {
    let filtered = [];
    Object.keys(rows).forEach(weekName => {
      rows[weekName].forEach(row => {
        filtered.push({ ...row, week: weekName });
      });
    });

    if (activeFilters.search) {
      filtered = filtered.filter(
        (r) =>
          r.topic_name?.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
          r.subtopic_name?.toLowerCase().includes(activeFilters.search.toLowerCase()),
      );
    }

    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage, activeFilters]);

  const handleMenuOpen = (event, row, type) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
    setMenuType(type);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuType(null);
  };

  const handleViewDetails = async (id) => {
    handleMenuClose();
    setLoadingDetails(true);
    setViewDetailsModalOpen(true);
    try {
      const data = await landlordSchemeApi.getDetails(id);
      setViewDetailsData(data);
    } catch (error) {
      notify.error('Failed to fetch details');
      setViewDetailsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAddTopic = (schemeOfWorkId) => {
    setSelectedTopic(null);
    setSelectedRow({ scheme_of_work_id: schemeOfWorkId });
    setTopicModalOpen(true);
  };

  const handleEditTopic = (topic) => {
    setSelectedTopic(topic);
    handleMenuClose();
    setTopicModalOpen(true);
  };

  const handleAddSubtopic = (topicId) => {
    setSelectedTopic({ topic_id: topicId });
    setSelectedSubtopic(null);
    handleMenuClose();
    setSubtopicModalOpen(true);
  };

  const handleEditSubtopic = (row) => {
    setSelectedSubtopic(row);
    setSelectedTopic({ topic_id: row.topic_id });
    handleMenuClose();
    setSubtopicModalOpen(true);
  };

  const handleAddObjective = (row) => {
    setSelectedRow(row);
    setSelectedObjective(null);
    handleMenuClose();
    setObjectiveModalOpen(true);
  };

  const handleEditObjective = (lo) => {
    setSelectedObjective(lo);
    handleMenuClose();
    setObjectiveModalOpen(true);
  };

  const handleDeleteClick = (type, id) => {
    setDeleteType(type);
    setSelectedRow({ id });
    handleMenuClose();
    setDeleteModalOpen(true);
  };

  const fetchAnalytics = async (filters, termId) => {
    try {
      const data = await landlordSchemeApi.getAnalytics({
        subject_id: filters.subject,
        class_id: filters.classLevel,
        term_id: termId,
      });
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    }
  };

  // ─── Helper: trigger file blob download ───
  const triggerBlobDownload = (response, filename) => {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // ─── Helper: load classes + subjects for a modal's programme selection ───
  const handleModalProgrammeChange = async (prog, setClasses, setSubjects) => {
    if (!prog) return;
    try {
      const [clsRes, subRes] = await Promise.all([
        fetchClassesByProgramme(prog),
        fetchSubjectsByProgramme(prog),
      ]);
      setClasses(clsRes.data.map(c => ({ value: c.id, label: c.class_name })));
      setSubjects(subRes.data.map(s => ({ value: s.id, label: s.subject_name })));
    } catch (e) {
      notify.error('Failed to load filter options');
    }
  };

  // ─── Download Template ───
  const handleDownloadTemplate = async () => {
    const { classLevel, subject, term } = dlTemplateFilters;
    const termId = term || activeTerm;
    if (!classLevel || !subject || !termId) {
      notify.error('Please select Programme, Class, and Subject.');
      return;
    }
    try {
      const res = await landlordSchemeApi.downloadTemplate({
        subject_id: subject,
        class_id: classLevel,
        term_id: termId,
      });
      triggerBlobDownload(res, 'scheme_of_work_template.xlsx');
      setDlTemplateOpen(false);
      notify.success('Template downloaded successfully.');
    } catch (e) {
      notify.error('Failed to download template.');
    }
  };

  // ─── Upload Template ───
  const handleUploadTemplate = async () => {
    const { classLevel, subject, term } = uploadFilters;
    const termId = term || activeTerm;
    if (!classLevel || !subject || !termId || !uploadFile) {
      notify.error('Please select all filters and choose a file.');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('subject_id', subject);
      fd.append('class_id', classLevel);
      fd.append('term_id', termId);
      const res = await landlordSchemeApi.uploadTemplate(fd);
      notify.success(res.message);
      setUploadOpen(false);
      setUploadFile(null);
      fetchScheme(activeFilters, activeTerm);
    } catch (e) {
      notify.error(e.response?.data?.message || 'Upload failed. Check that the file matches the selected filters.');
    } finally {
      setUploading(false);
    }
  };

  // ─── Download Scheme of Work ───
  const handleDownloadScheme = async () => {
    const { classLevel, subject, term } = dlSchemeFilters;
    const termId = term || activeTerm;
    if (!classLevel || !subject || !termId) {
      notify.error('Please select Programme, Class, and Subject.');
      return;
    }
    setDownloading(true);
    try {
      const res = await landlordSchemeApi.downloadSchemeOfWork({
        subject_id: subject,
        class_id: classLevel,
        term_id: termId,
      });
      triggerBlobDownload(res, 'scheme_of_work.xlsx');
      setDlSchemeOpen(false);
      notify.success('Scheme of Work downloaded successfully.');
    } catch (e) {
      notify.error('Failed to download Scheme of Work.');
    } finally {
      setDownloading(false);
    }
  };

  const statCards = [
    { title: 'Topics', value: analytics.total_topics, icon: <IconFolder color="#39b65a" />, bgColor: '#eaf7ee' },
    { title: 'Sub Topics', value: analytics.total_subtopics, icon: <IconFolder color="#39b65a" />, bgColor: '#eaf7ee' },
    {
      title: 'Lesson Content',
      value: '0',
      icon: <IconFileDescription color="#39b65a" />,
      bgColor: '#eaf7ee',
    },
    {
      title: 'Video Content',
      value: '0',
      icon: <IconVideo color="#39b65a" />,
      bgColor: '#eaf7ee',
    },
  ];

  const drawerFilters = [
    { key: 'search', label: 'Search Scheme of Work', type: 'text', placeholder: 'Search...' },
  ];

  return (
    <PageContainer title="Scheme Of Work" description="Manage Scheme of Work">
      <Breadcrumb title="Scheme Of Work" items={BCrumb} />

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid #eee',
                px: 2,
                py: 3,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
              }}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgColor: stat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stat.icon}
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h2" sx={{ fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stat.title}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Action Buttons */}
      <Box
        sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 2, mb: 4 }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<IconDownload size={18} />}
            onClick={() => setDlSchemeOpen(true)}
            sx={{
              textTransform: 'none',
              px: 3,
              borderRadius: 1.5,
              bgcolor: '#7cb342',
              '&:hover': { bgcolor: '#689f38' },
            }}
          >
            Download Scheme of Work
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<IconUpload size={18} />}
            onClick={() => setUploadOpen(true)}
            sx={{
              textTransform: 'none',
              px: 3,
              borderRadius: 1.5,
              bgcolor: '#EAEDF2',
              color: '#333',
              '&:hover': { bgcolor: '#e0e0e0' },
              boxShadow: 'none',
            }}
          >
            Upload Scheme Template
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<IconDownload size={18} />}
            onClick={() => setDlTemplateOpen(true)}
            sx={{
              textTransform: 'none',
              px: 3,
              borderRadius: 1.5,
              bgcolor: '#7cb342',
              '&:hover': { bgcolor: '#689f38' },
            }}
          >
            Download Scheme Template
          </Button>
        </Box>
      </Box>

      {/* Toggles & Filter Action */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', flex: 1 }}>
          <Tabs
            value={activeTerm}
            onChange={(e, newValue) => {
              setActiveTerm(newValue);
              fetchScheme(activeFilters, newValue);
            }}
            aria-label="term tabs"
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '15px' } }}
          >
            {terms.map((term) => (
              <Tab key={term.id} label={term.term_name} value={term.id} />
            ))}
          </Tabs>
        </Box>
        {/* <Button
          variant="outlined"
          startIcon={<IconFilter size={18} />}
          onClick={() => setFilterDrawerOpen(true)}
          sx={{
            textTransform: 'none',
            px: 3,
            borderRadius: 1.5,
            borderColor: '#e0e0e0',
            color: '#333',
            fontWeight: 600,
          }}
        >
          Filters
        </Button> */}
      </Box>

      {/* Main Content Area */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee', overflow: 'hidden' }}>
        <Box sx={{ p: 2, px: 3, bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.5, color: '#333' }}>
            MANAGE {(terms.find(t => t.id === activeTerm)?.term_name || activeTerm || '').toString().toUpperCase()} SCHEME OF WORK
          </Typography>
        </Box>
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid #f0f0f0',
            bgcolor: '#fff',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Programme"
                size="small"
                value={programmes.some(p => p.value === programme) ? programme : ''}
                onChange={(e) => {
                  setProgramme(e.target.value);
                  handleFilterChange('programme', e.target.value);
                }}
              >
                {programmes.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Class"
                size="small"
                value={classes.some(c => c.value === classLevel) ? classLevel : ''}
                onChange={(e) => setClassLevel(e.target.value)}
              >
                {classes.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Subject"
                size="small"
                value={subjects.some(s => s.value === subject) ? subject : ''}
                onChange={(e) => setSubject(e.target.value)}
              >
                {subjects.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleFetch}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Fetch Scheme of Work
              </Button>
            </Grid>
          </Grid>
        </Box>



        <TableContainer>
          <Table stickyHeader sx={{ whiteSpace: 'nowrap', borderCollapse: 'collapse' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 700, width: '8%', border: '1px solid #dee2e6' }}>Week</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '15%', border: '1px solid #dee2e6' }}>Topic</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '20%', border: '1px solid #dee2e6' }}>Sub Topic</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '20%', border: '1px solid #dee2e6' }}>Learning Objectives</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '15%', border: '1px solid #dee2e6' }}>Lesson Content</TableCell>
                <TableCell sx={{ fontWeight: 700, width: '15%', border: '1px solid #dee2e6' }}>Video Content</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, width: '7%', border: '1px solid #dee2e6' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row, idx) => {
                  const isFirstInWeek = idx === 0 || row.week !== paginatedRows[idx - 1].week;
                  const isFirstInTopic = idx === 0 || row.topic_id !== paginatedRows[idx - 1].topic_id || isFirstInWeek;

                  return (
                    <TableRow key={`${row.week}-${row.topic_id}-${row.sub_topic_id}-${idx}`} hover>
                      {/* Week Column */}
                      <TableCell sx={{ verticalAlign: 'top', border: '1px solid #dee2e6', bgcolor: isFirstInWeek ? '#fff' : '#fcfcfc' }}>
                        {isFirstInWeek && (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.week}</Typography>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleAddTopic(row.scheme_of_work_id)}
                              sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main', color: '#fff' }, p: 0.5, borderRadius: 1 }}
                            >
                              <IconPlus size={14} />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>

                      {/* Topic Column */}
                      <TableCell sx={{ verticalAlign: 'top', border: '1px solid #dee2e6' }}>
                        {isFirstInTopic && row.topic_name && (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2">{row.topic_name}</Typography>
                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, row, 'topic')}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>

                      {/* Sub Topic Column */}
                      <TableCell sx={{ border: '1px solid #dee2e6', verticalAlign: 'top' }}>
                        {row.subtopic_name && (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2">{row.subtopic_name}</Typography>
                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, row, 'subtopic')}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>

                      {/* Learning Objectives Column */}
                      <TableCell sx={{ border: '1px solid #dee2e6', whiteSpace: 'normal', minWidth: 200, verticalAlign: 'top' }}>
                        <List size="small" sx={{ p: 0 }}>
                          {row.learningObjectives?.map((lo, lidx) => (
                            <ListItem
                              key={lo.id}
                              sx={{ p: 0, px: 1, py: 0.5, borderBottom: lidx !== row.learningObjectives.length - 1 ? '1px dashed #eee' : 'none' }}
                            >
                              <ListItemText
                                primary={lo.learning_objective_details}
                                primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                              />
                              <IconButton size="small" onClick={(e) => handleMenuOpen(e, { ...row, ...lo, id: lo.id }, 'objective')}>
                                <MoreVertIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </ListItem>
                          ))}
                          {(!row.learningObjectives || row.learningObjectives.length === 0) && (
                            <Typography variant="body2" color="textSecondary">{row.learning_objective}</Typography>
                          )}
                        </List>
                      </TableCell>

                      {/* Lesson Content Status */}
                      <TableCell align="center" sx={{ border: '1px solid #dee2e6' }}>
                        {row.learning_material ? (
                          <IconCheck size={20} color="green" />
                        ) : (
                          <IconX size={20} color="red" />
                        )}
                      </TableCell>

                      {/* Video Content Status */}
                      <TableCell align="center" sx={{ border: '1px solid #dee2e6' }}>
                        {row.resource_links ? (
                          <IconCheck size={20} color="green" />
                        ) : (
                          <IconX size={20} color="red" />
                        )}
                      </TableCell>

                      {/* Action Column */}
                      <TableCell align="center" sx={{ border: '1px solid #dee2e6' }}>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, row, 'row')}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                    <Typography color="textSecondary">
                      {loading ? 'Fetching Scheme of Work...' : 'No records found. Select filters to begin.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, borderTop: '1px solid #eee' }}
        >
          <TablePagination
            component="div"
            count={Object.values(rows).flat().length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
            sx={{ border: 'none' }}
          />
        </Box>
      </Card>

      {/* Filter Drawer */}
      <FilterSideDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onApply={handleApplyFilters}
        onReset={() => setActiveFilters({})}
        filters={drawerFilters}
        title="Scheme of Work Filters"
        anchor="right"
      />

      {/* Topic Modal */}
      <ReusableModal
        open={topicModalOpen}
        onClose={() => setTopicModalOpen(false)}
        title={selectedTopic ? 'Edit Topic' : 'Add Topic'}
      >
        <Box component="form" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSaveTopic({
            topic_name: formData.get('topic_name'),
            topic_description: formData.get('topic_description'),
          });
        }} sx={{ mt: 2 }}>
          <TextField
            name="topic_name"
            label="Topic Name"
            fullWidth
            defaultValue={selectedTopic?.topic_name || ''}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            name="topic_description"
            label="Topic Description"
            fullWidth
            multiline
            rows={2}
            defaultValue={selectedTopic?.topic_description || ''}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" fullWidth>
            Save Topic
          </Button>
        </Box>
      </ReusableModal>

      {/* Subtopic Modal */}
      <ReusableModal
        open={subtopicModalOpen}
        onClose={() => setSubtopicModalOpen(false)}
        title={selectedSubtopic ? 'Edit Subtopic' : 'Add Subtopic'}
      >
        <Box component="form" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSaveSubtopic({
            subtopic_name: formData.get('subtopic_name'),
            subtopic_description: formData.get('subtopic_description'),
          });
        }} sx={{ mt: 2 }}>
          <TextField
            name="subtopic_name"
            label="Subtopic Name"
            fullWidth
            defaultValue={selectedSubtopic?.subtopic_name || ''}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            name="subtopic_description"
            label="Subtopic Description"
            fullWidth
            multiline
            rows={2}
            defaultValue={selectedSubtopic?.subtopic_description || ''}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" fullWidth>
            Save Subtopic
          </Button>
        </Box>
      </ReusableModal>

      {/* Learning Objective Modal */}
      <ReusableModal
        open={objectiveModalOpen}
        onClose={() => setObjectiveModalOpen(false)}
        title={selectedObjective ? 'Edit Learning Objective' : 'Add Learning Objective'}
        size="large"
      >
        <Box component="form" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSaveObjective({
            learning_objective_details: formData.get('learning_objective_details'),
            previous_knowledge: formData.get('previous_knowledge'),
            practical_approach: formData.get('practical_approach'),
            evaluation: formData.get('evaluation'),
            instructional_resources: formData.get('instructional_resources'),
            teaching_note: formData.get('teaching_note'),
            teacher_activity: formData.get('teacher_activity'),
            learner_activity: formData.get('learner_activity'),
          });
        }} sx={{ mt: 2 }}>
          <TextField
            name="learning_objective_details"
            label="Learning Objective Details"
            fullWidth
            multiline
            rows={3}
            defaultValue={selectedObjective?.learning_objective_details || ''}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            name="previous_knowledge"
            label="Previous Knowledge"
            fullWidth
            multiline
            rows={2}
            defaultValue={selectedRow?.previous_knowledge || ''}
            sx={{ mb: 2 }}
          />
          <TextField
            name="practical_approach"
            label="Practical Approach"
            fullWidth
            multiline
            rows={2}
            defaultValue={selectedRow?.practical_approach || ''}
            sx={{ mb: 2 }}
          />
          <TextField
            name="teacher_activity"
            label="Teacher Activity"
            fullWidth
            multiline
            rows={2}
            defaultValue={selectedRow?.teacher_activity || ''}
            sx={{ mb: 2 }}
          />
          <TextField
            name="learner_activity"
            label="Learner Activity"
            fullWidth
            multiline
            rows={2}
            defaultValue={selectedRow?.learner_activity || ''}
            sx={{ mb: 2 }}
          />
          <TextField
            name="evaluation"
            label="Evaluation"
            fullWidth
            multiline
            rows={2}
            defaultValue={selectedRow?.evaluation || ''}
            sx={{ mb: 2 }}
          />
          <TextField
            name="instructional_resources"
            label="Instructional Resources"
            fullWidth
            multiline
            rows={2}
            defaultValue={selectedRow?.instructional_resources || ''}
            sx={{ mb: 2 }}
          />
          <TextField
            name="teaching_note"
            label="Teaching Note"
            fullWidth
            multiline
            rows={2}
            defaultValue={selectedRow?.teaching_note || ''}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" fullWidth>
            Save Objective
          </Button>
        </Box>
      </ReusableModal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`Delete ${deleteType}`}
        message={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
        severity="error"
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {menuType === 'topic' && [
          <MenuItem key="edit" onClick={() => handleEditTopic(selectedRow)}>Edit Topic</MenuItem>,
          <MenuItem key="add-sub" onClick={() => handleAddSubtopic(selectedRow.topic_id)}>Add Subtopic</MenuItem>,
          <MenuItem key="delete" onClick={() => handleDeleteClick('topic', selectedRow.topic_id)} sx={{ color: 'error.main' }}>Delete Topic</MenuItem>
        ]}
        {menuType === 'subtopic' && [
          <MenuItem key="edit" onClick={() => handleEditSubtopic(selectedRow)}>Edit Subtopic</MenuItem>,
          <MenuItem key="add-lo" onClick={() => handleAddObjective(selectedRow)}>Add Learning Objective</MenuItem>,
          <MenuItem key="delete" onClick={() => handleDeleteClick('subtopic', selectedRow.sub_topic_id)} sx={{ color: 'error.main' }}>Delete Subtopic</MenuItem>
        ]}
        {menuType === 'objective' && [
          <MenuItem key="edit" onClick={() => handleEditObjective(selectedRow)}>Edit Objective</MenuItem>,
          <MenuItem key="delete" onClick={() => handleDeleteClick('objective', selectedRow.id)} sx={{ color: 'error.main' }}>Delete Objective</MenuItem>
        ]}
        {menuType === 'row' && [
          <MenuItem key="view" onClick={() => handleViewDetails(selectedRow.scheme_of_work_id)}>View Details</MenuItem>,
        ]}
      </Menu>

      {/* ── Download Template Modal ── */}
      <Dialog open={dlTemplateOpen} onClose={() => setDlTemplateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Download Scheme Template</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Select the Programme, Class, and Subject you want to generate a blank upload template for.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <TextField
                select fullWidth label="Programme" size="small"
                value={dlTemplateFilters.programme}
                onChange={async (e) => {
                  const val = e.target.value;
                  setDlTemplateFilters(f => ({ ...f, programme: val, classLevel: '', subject: '' }));
                  await handleModalProgrammeChange(val, setDlTemplateClasses, setDlTemplateSubjects);
                }}
              >
                {programmes.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <TextField
                select fullWidth label="Class" size="small"
                value={dlTemplateFilters.classLevel}
                onChange={e => setDlTemplateFilters(f => ({ ...f, classLevel: e.target.value }))}
              >
                {dlTemplateClasses.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <TextField
                select fullWidth label="Subject" size="small"
                value={dlTemplateFilters.subject}
                onChange={e => setDlTemplateFilters(f => ({ ...f, subject: e.target.value }))}
              >
                {dlTemplateSubjects.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <TextField
                select fullWidth label="Term" size="small"
                value={dlTemplateFilters.term || activeTerm}
                onChange={e => setDlTemplateFilters(f => ({ ...f, term: e.target.value }))}
              >
                {terms.map(t => <MenuItem key={t.id} value={t.id}>{t.term_name}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlTemplateOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained" onClick={handleDownloadTemplate}
            startIcon={<IconDownload size={16} />}
            sx={{ textTransform: 'none', bgcolor: '#7cb342', '&:hover': { bgcolor: '#689f38' } }}
          >
            Download Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Upload Template Modal ── */}
      <Dialog open={uploadOpen} onClose={() => !uploading && setUploadOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Upload Scheme Template</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Select the Programme, Class, and Subject this file was generated for, then choose your completed template file.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <TextField
                select fullWidth label="Programme" size="small"
                value={uploadFilters.programme}
                onChange={async (e) => {
                  const val = e.target.value;
                  setUploadFilters(f => ({ ...f, programme: val, classLevel: '', subject: '' }));
                  await handleModalProgrammeChange(val, setUploadClasses, setUploadSubjects);
                }}
              >
                {programmes.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <TextField
                select fullWidth label="Class" size="small"
                value={uploadFilters.classLevel}
                onChange={e => setUploadFilters(f => ({ ...f, classLevel: e.target.value }))}
              >
                {uploadClasses.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <TextField
                select fullWidth label="Subject" size="small"
                value={uploadFilters.subject}
                onChange={e => setUploadFilters(f => ({ ...f, subject: e.target.value }))}
              >
                {uploadSubjects.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <TextField
                select fullWidth label="Term" size="small"
                value={uploadFilters.term || activeTerm}
                onChange={e => setUploadFilters(f => ({ ...f, term: e.target.value }))}
              >
                {terms.map(t => <MenuItem key={t.id} value={t.id}>{t.term_name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
              <Box
                sx={{
                  border: '2px dashed #e0e0e0', borderRadius: 2, p: 2, textAlign: 'center',
                  bgcolor: uploadFile ? '#f1f8e9' : '#fafafa', cursor: 'pointer',
                  '&:hover': { borderColor: '#7cb342' },
                }}
                onClick={() => document.getElementById('sow-upload-input').click()}
              >
                <input
                  id="sow-upload-input" type="file" accept=".xlsx,.xls" hidden
                  onChange={e => setUploadFile(e.target.files[0] || null)}
                />
                {uploadFile ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Chip label={uploadFile.name} color="success" onDelete={() => setUploadFile(null)} />
                  </Box>
                ) : (
                  <>
                    <IconUpload size={28} color="#bdbdbd" />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Click to select your completed template (.xlsx)
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUploadOpen(false)} disabled={uploading} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained" onClick={handleUploadTemplate} disabled={uploading}
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <IconUpload size={16} />}
            sx={{ textTransform: 'none' }}
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Download Scheme of Work Modal ── */}
      <Dialog open={dlSchemeOpen} onClose={() => !downloading && setDlSchemeOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Download Scheme of Work</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Select the Programme, Class, Subject, and Term whose uploaded Scheme of Work you want to download.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <TextField
                select fullWidth label="Programme" size="small"
                value={dlSchemeFilters.programme}
                onChange={async (e) => {
                  const val = e.target.value;
                  setDlSchemeFilters(f => ({ ...f, programme: val, classLevel: '', subject: '' }));
                  await handleModalProgrammeChange(val, setDlSchemeClasses, setDlSchemeSubjects);
                }}
              >
                {programmes.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <TextField
                select fullWidth label="Class" size="small"
                value={dlSchemeFilters.classLevel}
                onChange={e => setDlSchemeFilters(f => ({ ...f, classLevel: e.target.value }))}
              >
                {dlSchemeClasses.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <TextField
                select fullWidth label="Subject" size="small"
                value={dlSchemeFilters.subject}
                onChange={e => setDlSchemeFilters(f => ({ ...f, subject: e.target.value }))}
              >
                {dlSchemeSubjects.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <TextField
                select fullWidth label="Term" size="small"
                value={dlSchemeFilters.term || activeTerm}
                onChange={e => setDlSchemeFilters(f => ({ ...f, term: e.target.value }))}
              >
                {terms.map(t => <MenuItem key={t.id} value={t.id}>{t.term_name}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlSchemeOpen(false)} disabled={downloading} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained" onClick={handleDownloadScheme} disabled={downloading}
            startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <IconDownload size={16} />}
            sx={{ textTransform: 'none', bgcolor: '#7cb342', '&:hover': { bgcolor: '#689f38' } }}
          >
            {downloading ? 'Downloading…' : 'Download'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={viewDetailsModalOpen} onClose={() => setViewDetailsModalOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ fontWeight: 700 }}>
            Scheme of Work Details
          </Box>
          <Button 
            variant="outlined" 
            onClick={handlePrint}
            startIcon={<IconDownload size={18} />}
            sx={{ textTransform: 'none' }}
          >
            Print
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          {loadingDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : viewDetailsData ? (
            <Box ref={printRef} sx={{ p: 2 }}>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Scheme of Work
                </Typography>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  {viewDetailsData.week?.week_name} - {viewDetailsData.subject?.subject_name}
                </Typography>
              </Box>
              <Table>
                <TableBody>
                <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell component="th" sx={{ fontWeight: 700, width: '25%', borderBottom: '1px solid #eee', py: 2 }}>Week</TableCell>
                  {/* <TableCell sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <Typography variant="body2">{viewDetailsData.week?.week_name || 'Not available'}</Typography>
                  </TableCell> */}
                </TableRow>
                <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell component="th" sx={{ fontWeight: 700, width: '25%', borderBottom: '1px solid #eee', py: 2 }}>Topic(s)</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <Typography variant="body2">{viewDetailsData.topics?.map(t => t.topic_name).join(', ') || 'Not available'}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell component="th" sx={{ fontWeight: 700, width: '25%', borderBottom: '1px solid #eee', py: 2 }}>Sub Topic(s)</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {viewDetailsData.topics?.flatMap(t => t.subtopics?.map(s => s.subtopic_name)).filter(Boolean).length > 0 ? (
                        viewDetailsData.topics?.flatMap(t => t.subtopics?.map(s => s.subtopic_name)).filter(Boolean).map((item, idx) => (
                          <Typography component="li" key={idx} variant="body2" sx={{ mb: 0.5 }}>{item}</Typography>
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary">Not available</Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell component="th" sx={{ fontWeight: 700, width: '25%', borderBottom: '1px solid #eee', py: 2 }}>Learning Objectives</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {viewDetailsData.topics?.flatMap(t => t.subtopics?.flatMap(s => s.learning_objectives?.map(lo => lo.learning_objective_details))).filter(Boolean).length > 0 ? (
                        viewDetailsData.topics?.flatMap(t => t.subtopics?.flatMap(s => s.learning_objectives?.map(lo => lo.learning_objective_details))).filter(Boolean).map((item, idx) => (
                          <Typography component="li" key={idx} variant="body2" sx={{ mb: 0.5 }}>{item}</Typography>
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary">Not available</Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell component="th" sx={{ fontWeight: 700, width: '25%', borderBottom: '1px solid #eee', py: 2 }}>Lesson Content</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <Typography variant="body2">{viewDetailsData.learning_material || <Typography component="span" variant="body2" color="textSecondary">Not available</Typography>}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell component="th" sx={{ fontWeight: 700, width: '25%', borderBottom: '1px solid #eee', py: 2 }}>Video Content</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    {viewDetailsData.resource_links ? (
                      <Typography component="a" href={viewDetailsData.resource_links} target="_blank" variant="body2" color="primary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        {viewDetailsData.resource_links}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">Not available</Typography>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell component="th" sx={{ fontWeight: 700, width: '25%', borderBottom: '1px solid #eee', py: 2 }}>Practical Approach</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <Typography variant="body2">{viewDetailsData.practical_approach || <Typography component="span" variant="body2" color="textSecondary">Not available</Typography>}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell component="th" sx={{ fontWeight: 700, width: '25%', borderBottom: '1px solid #eee', py: 2 }}>Starter</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <Typography variant="body2">{viewDetailsData.starter || <Typography component="span" variant="body2" color="textSecondary">Not available</Typography>}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell component="th" sx={{ fontWeight: 700, width: '25%', borderBottom: '1px solid #eee', py: 2 }}>Teacher Activity</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <Typography variant="body2">{viewDetailsData.teacher_activity || <Typography component="span" variant="body2" color="textSecondary">Not available</Typography>}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell component="th" sx={{ fontWeight: 700, width: '25%', borderBottom: '1px solid #eee', py: 2 }}>Learner Activity</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <Typography variant="body2">{viewDetailsData.learner_activity || <Typography component="span" variant="body2" color="textSecondary">Not available</Typography>}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell component="th" sx={{ fontWeight: 700, width: '25%', borderBottom: '1px solid #eee', py: 2 }}>Previous Knowledge</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <Typography variant="body2">{viewDetailsData.previous_knowledge || <Typography component="span" variant="body2" color="textSecondary">Not available</Typography>}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell component="th" sx={{ fontWeight: 700, width: '25%', borderBottom: '1px solid #eee', py: 2 }}>Evaluation</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <Typography variant="body2">{viewDetailsData.evaluation || <Typography component="span" variant="body2" color="textSecondary">Not available</Typography>}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell component="th" sx={{ fontWeight: 700, width: '25%', borderBottom: '1px solid #eee', py: 2 }}>Instructional Resources</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <Typography variant="body2">{viewDetailsData.instructional_resources || <Typography component="span" variant="body2" color="textSecondary">Not available</Typography>}</Typography>
                  </TableCell>
                </TableRow>
                <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                  <TableCell component="th" sx={{ fontWeight: 700, width: '25%', borderBottom: '1px solid #eee', py: 2 }}>Teaching Note</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <Typography variant="body2">{viewDetailsData.teaching_note || <Typography component="span" variant="body2" color="textSecondary">Not available</Typography>}</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewDetailsModalOpen(false)} variant="contained" sx={{ textTransform: 'none', bgcolor: '#d8b4fe', color: '#581c87', '&:hover': { bgcolor: '#c084fc' } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

    </PageContainer>
  );
};

export default AgentSchemeOfWork;
