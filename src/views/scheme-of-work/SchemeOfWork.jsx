import React, { useMemo, useState, useEffect } from 'react';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import FilterSideDrawer from '../../components/shared/FilterSideDrawer';

import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
  IconArrowRightSquare,
  IconPlus,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { tenantSchemeApi } from '../../api/schemeOfWorkApi';
import { fetchProgrammes, fetchClassesByProgramme, fetchSubjectsByProgramme } from '../../api/tenantCurriculumApi';
import useNotification from '../../hooks/useNotification';
import ReusableModal from '../../components/shared/ReusableModal';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const BCrumb = [
  {
    to: '/',
    title: 'School Dashboard',
  },
  { title: 'Scheme Of Work' },
];

const SchemeOfWork = () => {
  const notify = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState([]);
  const [activeTerm, setActiveTerm] = useState('');
  const [rows, setRows] = useState({});
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
  const [menuType, setMenuType] = useState(null); // 'topic' | 'subtopic' | 'row' | 'objective'
  const [selectedRow, setSelectedRow] = useState(null);

  const [objectiveModalOpen, setObjectiveModalOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);

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

  // Details modal state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    try {
      const [termsRes, progsRes] = await Promise.all([
        tenantSchemeApi.getTerms(),
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
      const data = await tenantSchemeApi.fetchScheme({
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

  const paginatedRows = useMemo(() => {
    let flattened = [];
    Object.keys(rows).forEach(weekName => {
      rows[weekName].forEach(row => {
        flattened.push({ ...row, week: weekName });
      });
    });
    return flattened;
  }, [rows]);

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
    setDetailsOpen(true);
    setDetailsData(null);
    setDetailsLoading(true);
    try {
      const res = await tenantSchemeApi.getDetails(id);
      setDetailsData(res);
    } catch (e) {
      notify.error('Failed to load scheme details.');
      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchAnalytics = async (filters, termId) => {
    try {
      const data = await tenantSchemeApi.getAnalytics({
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

  // ─── Helper: load classes + subjects for a modal ───
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
      const res = await tenantSchemeApi.downloadTemplate({
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
      const res = await tenantSchemeApi.uploadTemplate(fd);
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
      const res = await tenantSchemeApi.downloadSchemeOfWork({
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

  const handleImportFromLandlord = async () => {
    if (!subject || !classLevel || !activeTerm) {
      notify.error('Please select Subject, Class, and Term filters first.');
      return;
    }
    setLoading(true);
    try {
      const res = await tenantSchemeApi.importFromLandlord({
        filters: {
          subject_id: subject,
          class_id: classLevel,
        },
        term_id: activeTerm,
      });
      notify.success(res.message);
      fetchScheme({ subject, classLevel }, activeTerm);
    } catch (error) {
      notify.error(error.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = (weekId) => {
    setSelectedRow({ scheme_of_work_id: weekId });
    setSelectedTopic(null);
    setTopicModalOpen(true);
  };

  const handleEditTopic = (topic) => {
    setSelectedTopic(topic);
    setTopicModalOpen(true);
    handleMenuClose();
  };

  const handleAddSubtopic = (topicId) => {
    setSelectedTopic({ id: topicId });
    setSelectedSubtopic(null);
    setSubtopicModalOpen(true);
  };

  const handleEditSubtopic = (subtopic) => {
    setSelectedSubtopic(subtopic);
    setSubtopicModalOpen(true);
    handleMenuClose();
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
    setDeleteModalOpen(true);
    handleMenuClose();
  };

  const handleSaveTopic = async (topicData) => {
    try {
      if (selectedTopic) {
        await tenantSchemeApi.updateTopic(selectedTopic.id, topicData);
        notify.success('Topic updated successfully');
      } else {
        await tenantSchemeApi.addTopic({ ...topicData, scheme_of_work_id: selectedRow.scheme_of_work_id });
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
      if (selectedSubtopic) {
        await tenantSchemeApi.updateSubtopic(selectedSubtopic.sub_topic_id, subtopicData);
        notify.success('Subtopic updated successfully');
      } else {
        await tenantSchemeApi.addSubtopic({ ...subtopicData, topic_id: selectedTopic.id });
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
        await tenantSchemeApi.updateObjective(selectedObjective.id, objectiveData);
        notify.success('Learning objective updated successfully');
      } else {
        await tenantSchemeApi.addObjective({
          ...objectiveData,
          sub_topic_id: selectedRow.sub_topic_id
        });
        notify.success('Learning objective added successfully');
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
        await tenantSchemeApi.deleteTopic(selectedRow.id);
      } else if (deleteType === 'subtopic') {
        await tenantSchemeApi.deleteSubtopic(selectedRow.id);
      } else if (deleteType === 'objective') {
        await tenantSchemeApi.deleteObjective(selectedRow.id);
      }
      notify.success(`${deleteType} deleted successfully`);
      setDeleteModalOpen(false);
      fetchScheme(activeFilters, activeTerm);
    } catch (error) {
      notify.error('Deletion failed');
    }
  };

  const statCards = [
    { title: 'Topics', value: analytics.total_topics, icon: <IconFolder color="#39b65a" />, bgColor: '#eaf7ee' },
    { title: 'Sub Topics', value: analytics.total_subtopics, icon: <IconFolder color="#39b65a" />, bgColor: '#eaf7ee' },
    { title: 'Lesson Content', value: '0', icon: <IconFileDescription color="#39b65a" />, bgColor: '#eaf7ee' },
    { title: 'Video Content', value: '0', icon: <IconVideo color="#39b65a" />, bgColor: '#eaf7ee' },
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
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: stat.bgColor,
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleImportFromLandlord}
            startIcon={<IconArrowRightSquare size={18} />}
            sx={{ textTransform: 'none', px: 3, borderRadius: 1.5 }}
          >
            Import scheme of Work
          </Button>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', flex: 1 }}>
          <Tabs
            value={activeTerm}
            onChange={(e, newValue) => {
              setActiveTerm(newValue);
              fetchScheme(activeFilters, newValue);
            }}
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '15px' } }}
          >
            {terms.map((term) => (
              <Tab key={term.id} label={term.display_name} value={term.id} />
            ))}
          </Tabs>
        </Box>
        <Button
          variant="outlined"
          startIcon={<IconFilter size={18} />}
          onClick={() => setFilterDrawerOpen(true)}
          sx={{ textTransform: 'none', px: 3, borderRadius: 1.5, borderColor: '#e0e0e0', color: '#333', fontWeight: 600 }}
        >
          Filters
        </Button>
      </Box>

      {/* Main Content Area */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee', overflow: 'hidden' }}>
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

        <Box sx={{ p: 2, px: 3, bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.5, color: '#333' }}>
            MANAGE SCHEME OF WORK
          </Typography>
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
      <ReusableModal open={topicModalOpen} onClose={() => setTopicModalOpen(false)} title={selectedTopic ? 'Edit Topic' : 'Add Topic'}>
        <Box component="form" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSaveTopic({
            topic_name: formData.get('topic_name'),
            topic_description: formData.get('topic_description'),
          });
        }} sx={{ mt: 2 }}>
          <TextField name="topic_name" label="Topic Name" fullWidth defaultValue={selectedTopic?.topic_name || ''} required sx={{ mb: 2 }} />
          <TextField name="topic_description" label="Topic Description" fullWidth multiline rows={2} defaultValue={selectedTopic?.topic_description || ''} sx={{ mb: 2 }} />
          <Button type="submit" variant="contained" fullWidth>Save Topic</Button>
        </Box>
      </ReusableModal>

      {/* Subtopic Modal */}
      <ReusableModal open={subtopicModalOpen} onClose={() => setSubtopicModalOpen(false)} title={selectedSubtopic ? 'Edit Subtopic' : 'Add Subtopic'}>
        <Box component="form" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSaveSubtopic({
            subtopic_name: formData.get('subtopic_name'),
            subtopic_description: formData.get('subtopic_description'),
          });
        }} sx={{ mt: 2 }}>
          <TextField name="subtopic_name" label="Subtopic Name" fullWidth defaultValue={selectedSubtopic?.subtopic_name || ''} required sx={{ mb: 2 }} />
          <TextField name="subtopic_description" label="Subtopic Description" fullWidth multiline rows={2} defaultValue={selectedSubtopic?.subtopic_description || ''} sx={{ mb: 2 }} />
          <Button type="submit" variant="contained" fullWidth>Save Subtopic</Button>
        </Box>
      </ReusableModal>

      {/* Learning Objective Modal */}
      <ReusableModal
        open={objectiveModalOpen}
        onClose={() => setObjectiveModalOpen(false)}
        title={selectedObjective ? 'Edit Learning Objective' : 'Add Learning Objective'}
      >
        <Box component="form" onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSaveObjective({
            learning_objective_details: formData.get('learning_objective_details'),
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
            Select the Programme, Class, and Subject to generate a blank upload template.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField select fullWidth label="Programme" size="small"
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
            <Grid size={{ xs: 12 }}>
              <TextField select fullWidth label="Class" size="small"
                value={dlTemplateFilters.classLevel}
                onChange={e => setDlTemplateFilters(f => ({ ...f, classLevel: e.target.value }))}
              >
                {dlTemplateClasses.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField select fullWidth label="Subject" size="small"
                value={dlTemplateFilters.subject}
                onChange={e => setDlTemplateFilters(f => ({ ...f, subject: e.target.value }))}
              >
                {dlTemplateSubjects.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField select fullWidth label="Term" size="small"
                value={dlTemplateFilters.term || activeTerm}
                onChange={e => setDlTemplateFilters(f => ({ ...f, term: e.target.value }))}
              >
                {terms.map(t => <MenuItem key={t.id} value={t.id}>{t.display_name}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlTemplateOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleDownloadTemplate}
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
            Select the Programme, Class, and Subject this file was generated for, then choose your completed template.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField select fullWidth label="Programme" size="small"
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
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField select fullWidth label="Class" size="small"
                value={uploadFilters.classLevel}
                onChange={e => setUploadFilters(f => ({ ...f, classLevel: e.target.value }))}
              >
                {uploadClasses.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField select fullWidth label="Subject" size="small"
                value={uploadFilters.subject}
                onChange={e => setUploadFilters(f => ({ ...f, subject: e.target.value }))}
              >
                {uploadSubjects.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField select fullWidth label="Term" size="small"
                value={uploadFilters.term || activeTerm}
                onChange={e => setUploadFilters(f => ({ ...f, term: e.target.value }))}
              >
                {terms.map(t => <MenuItem key={t.id} value={t.id}>{t.display_name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
              <Box
                sx={{
                  border: '2px dashed #e0e0e0', borderRadius: 2, p: 2, textAlign: 'center',
                  bgcolor: uploadFile ? '#f1f8e9' : '#fafafa', cursor: 'pointer',
                  '&:hover': { borderColor: '#7cb342' },
                }}
                onClick={() => document.getElementById('sow-tenant-upload-input').click()}
              >
                <input
                  id="sow-tenant-upload-input" type="file" accept=".xlsx,.xls" hidden
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
          <Button variant="contained" onClick={handleUploadTemplate} disabled={uploading}
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
            <Grid size={{ xs: 12 }}>
              <TextField select fullWidth label="Programme" size="small"
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
            <Grid size={{ xs: 12 }}>
              <TextField select fullWidth label="Class" size="small"
                value={dlSchemeFilters.classLevel}
                onChange={e => setDlSchemeFilters(f => ({ ...f, classLevel: e.target.value }))}
              >
                {dlSchemeClasses.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField select fullWidth label="Subject" size="small"
                value={dlSchemeFilters.subject}
                onChange={e => setDlSchemeFilters(f => ({ ...f, subject: e.target.value }))}
              >
                {dlSchemeSubjects.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField select fullWidth label="Term" size="small"
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
          <Button variant="contained" onClick={handleDownloadScheme} disabled={downloading}
            startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <IconDownload size={16} />}
            sx={{ textTransform: 'none', bgcolor: '#7cb342', '&:hover': { bgcolor: '#689f38' } }}
          >
            {downloading ? 'Downloading…' : 'Download'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── View Details Modal ── */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Scheme of Work Details
          <IconButton onClick={() => setDetailsOpen(false)} size="small">
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : detailsData ? (
            <Table>
              <TableBody>
                {[
                  { label: 'Week', value: detailsData.week?.week_name },
                  { label: 'Topic(s)', value: detailsData.topics?.map(t => t.topic_name).join(', ') },
                  { label: 'Sub Topic', value: detailsData.topics?.flatMap(t => t.subtopics?.map(s => s.subtopic_name)).filter(Boolean).join(', ') },
                  {
                    label: 'Learning Objectives',
                    isList: true,
                    value: detailsData.topics?.flatMap(t =>
                      t.subtopics?.flatMap(s =>
                        s.learning_objectives?.map(lo => lo.learning_objective_details)
                      )
                    ).filter(Boolean)
                  },
                  { label: 'Lesson Content', value: detailsData.learning_material },
                  { label: 'Video Content', value: detailsData.resource_links, isLink: true },
                  { label: 'Teacher Activity', value: detailsData.teacher_activity },
                  { label: 'Learner Activity', value: detailsData.learner_activity },
                  { label: 'Starter', value: detailsData.starter },
                  { label: 'Practical Approach', value: detailsData.practical_approach },
                  { label: 'Evaluation', value: detailsData.evaluation },
                  { label: 'Instructional Resources', value: detailsData.instructional_resources },
                  { label: 'Teaching Note', value: detailsData.teaching_note },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell component="th" sx={{ fontWeight: 700, width: '30%', borderBottom: '1px solid #eee' }}>
                      {row.label}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #eee' }}>
                      {row.isList ? (
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                          {row.value?.length > 0 ? (
                            row.value.map((item, idx) => (
                              <Typography component="li" key={idx} variant="body2" sx={{ mb: 0.5 }}>
                                {item}
                              </Typography>
                            ))
                          ) : (
                            <Typography variant="body2" color="textSecondary">Not available</Typography>
                          )}
                        </Box>
                      ) : row.isLink ? (
                        row.value ? (
                          <Typography
                            component="a"
                            href={row.value}
                            target="_blank"
                            variant="body2"
                            color="primary"
                            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                          >
                            {row.value}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="textSecondary">Not available</Typography>
                        )
                      ) : (
                        <Typography variant="body2">
                          {row.value || <Typography component="span" variant="body2" color="textSecondary">Not available</Typography>}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1">Failed to load details.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setDetailsOpen(false)} sx={{ textTransform: 'none', bgcolor: '#d8b4fe', color: '#581c87', '&:hover': { bgcolor: '#c084fc' } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

    </PageContainer>
  );
};

export default SchemeOfWork;
