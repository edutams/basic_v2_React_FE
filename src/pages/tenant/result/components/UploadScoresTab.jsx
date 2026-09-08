import { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Grid, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert,
  IconButton, Menu, ListItemIcon, ListItemText, useTheme, TablePagination, Tooltip, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import {
  IconCloudUpload, IconDownload, IconEye, IconCheck, IconFileSpreadsheet,
  IconUpload, IconEdit, IconTrash, IconSend, IconLayoutGrid, IconList,
  IconFilter,
} from '@tabler/icons-react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

import DownloadSampleDialog from './DownloadSampleDialog';
import DownloadCombinedDialog from './DownloadCombinedDialog';
import UploadResultDialog from './UploadResultDialog';
import UploadCombinedDialog from './UploadCombinedDialog';
import UploadCaExamDialog from './UploadCaExamDialog';
import InputScoreDialog from './InputScoreDialog';
import ScoreUploadAnalytics from './ScoreUploadAnalytics';
import ScoreUploadCard from './ScoreUploadCard';
import ActionSelectionDialog from './ActionSelectionDialog';

const dummySessions = [
  { id: 1, label: '2025/2026 - First Term' },
  { id: 2, label: '2025/2026 - Second Term' },
  { id: 3, label: '2025/2026 - Third Term' },
];

const dummyProgrammes = [
  { id: 1, name: 'Junior Secondary' },
  { id: 2, name: 'Senior Secondary' },
];

const dummyClasses = [
  { id: 1, name: 'JSS 1A', programme_id: 1 },
  { id: 2, name: 'JSS 1B', programme_id: 1 },
  { id: 3, name: 'JSS 2A', programme_id: 1 },
  { id: 4, name: 'JSS 2B', programme_id: 1 },
  { id: 5, name: 'SS 1A', programme_id: 2 },
  { id: 6, name: 'SS 1B', programme_id: 2 },
  { id: 7, name: 'SS 2A', programme_id: 2 },
  { id: 8, name: 'SS 2B', programme_id: 2 },
];

const dummySubjects = [
  { id: 1, name: 'Mathematics' },
  { id: 2, name: 'English Language' },
  { id: 3, name: 'Physics' },
  { id: 4, name: 'Chemistry' },
  { id: 5, name: 'Biology' },
  { id: 6, name: 'Civic Education' },
];

const dummyAllocations = [
  { id: 1, session_term: '2025/2026 - First Term', programme: 'Junior Secondary', className: 'JSS 1A', subject_name: 'Mathematics', total_reg: 42, ca1_count: 42, ca2_count: 40, exam_upload_count: 38, teacher_submit: 'yes', spa_approval: null },
  { id: 2, session_term: '2025/2026 - First Term', programme: 'Junior Secondary', className: 'JSS 1A', subject_name: 'English Language', total_reg: 42, ca1_count: 42, ca2_count: 42, exam_upload_count: 42, teacher_submit: 'yes', spa_approval: { spa_publish: 'no' } },
  { id: 3, session_term: '2025/2026 - First Term', programme: 'Junior Secondary', className: 'JSS 2A', subject_name: 'Physics', total_reg: 38, ca1_count: 35, ca2_count: 30, exam_upload_count: 0, teacher_submit: 'no', spa_approval: null },
  { id: 4, session_term: '2025/2026 - First Term', programme: 'Junior Secondary', className: 'JSS 2A', subject_name: 'Chemistry', total_reg: 38, ca1_count: 38, ca2_count: 0, exam_upload_count: 0, teacher_submit: 'no', spa_approval: null },
  { id: 5, session_term: '2025/2026 - First Term', programme: 'Senior Secondary', className: 'SS 1A', subject_name: 'Biology', total_reg: 35, ca1_count: 35, ca2_count: 35, exam_upload_count: 35, teacher_submit: 'yes', spa_approval: null },
  { id: 6, session_term: '2025/2026 - First Term', programme: 'Senior Secondary', className: 'SS 1A', subject_name: 'Civic Education', total_reg: 35, ca1_count: 30, ca2_count: 0, exam_upload_count: 0, teacher_submit: 'no', spa_approval: null },
  { id: 7, session_term: '2025/2026 - First Term', programme: 'Senior Secondary', className: 'SS 2A', subject_name: 'Mathematics', total_reg: 30, ca1_count: 30, ca2_count: 30, exam_upload_count: 30, teacher_submit: 'yes', spa_approval: { spa_publish: 'yes' } },
];

const UploadScoresTab = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [allocations, setAllocations] = useState(dummyAllocations);
  const [filter, setFilter] = useState({ session_term: '', programme: '', class_id: '', subject_id: '' });
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuRow, setActionMenuRow] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Dialog States
  const [actionSelectionDialog, setActionSelectionDialog] = useState({ open: false, allocation: null });
  const [downloadSampleDialog, setDownloadSampleDialog] = useState({ open: false, allocation: null });
  const [downloadCombinedDialog, setDownloadCombinedDialog] = useState(false);
  const [uploadResultDialog, setUploadResultDialog] = useState({ open: false, allocation: null });
  const [uploadCombinedDialog, setUploadCombinedDialog] = useState(false);
  const [uploadCaExamDialog, setUploadCaExamDialog] = useState({ open: false, allocation: null });
  const [inputScoreDialog, setInputScoreDialog] = useState({ open: false, allocation: null });

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const filteredClasses = filter.programme
    ? dummyClasses.filter(c => c.programme_id === filter.programme)
    : dummyClasses;

  const filteredAllocations = allocations.filter(a => {
    if (filter.session_term && a.session_term !== dummySessions.find(s => s.id === filter.session_term)?.label) return false;
    if (filter.programme && a.programme !== dummyProgrammes.find(p => p.id === filter.programme)?.name) return false;
    if (filter.class_id && a.className !== dummyClasses.find(c => c.id === filter.class_id)?.name) return false;
    if (filter.subject_id && a.subject_name !== dummySubjects.find(s => s.id === filter.subject_id)?.name) return false;
    return true;
  });

  const selectedClassName = useMemo(() => {
    if (!filter.class_id) return '';
    return dummyClasses.find(c => c.id === filter.class_id)?.name || '';
  }, [filter.class_id]);

  const canShowBulkActions = filter.session_term && filter.programme && filter.class_id;
  const canShowSubmitAll = filter.session_term && filter.programme && filter.class_id;

  // Calculate analytics for Analytics Component
  const analyticsData = useMemo(() => {
    const list = filteredAllocations.length > 0 ? filteredAllocations : allocations;
    let caUploaded = 0;
    let caTotal = 0;
    let examUploaded = 0;
    let examTotal = 0;
    let submittedSubjects = 0;

    list.forEach(item => {
      const reg = item.total_reg || 0;
      caUploaded += (item.ca1_count || 0);
      caTotal += reg;
      examUploaded += (item.exam_upload_count || 0);
      examTotal += reg;
      if (item.teacher_submit === 'yes' || item.isSubmitted || item.submissionStatus === 'Submitted') {
        submittedSubjects += 1;
      }
    });

    return {
      ca_scores: {
        uploaded: caUploaded,
        total: caTotal,
        percentage: caTotal > 0 ? Math.round((caUploaded / caTotal) * 100) : 0,
      },
      exam_scores: {
        uploaded: examUploaded,
        total: examTotal,
        percentage: examTotal > 0 ? Math.round((examUploaded / examTotal) * 100) : 0,
      },
      score_submission: {
        submitted: submittedSubjects,
        total: list.length,
        percentage: list.length > 0 ? Math.round((submittedSubjects / list.length) * 100) : 0,
      },
    };
  }, [filteredAllocations, allocations]);

  const openActionMenu = (e, row) => {
    setActionMenuAnchor(e.currentTarget);
    setActionMenuRow(row);
  };

  const closeActionMenu = () => {
    setActionMenuAnchor(null);
    setActionMenuRow(null);
  };

  const handleUploaded = () => {
    showSnackbar('Operation completed successfully!');
  };

  const handleProceedActionSelection = (action, allocation) => {
    setActionSelectionDialog({ open: false, allocation: null });
    if (action === 'download') {
      setDownloadSampleDialog({ open: true, allocation });
    } else if (action === 'upload') {
      setUploadCaExamDialog({ open: true, allocation });
    } else if (action === 'direct') {
      setInputScoreDialog({ open: true, allocation });
    }
  };

  const handleSubmitScore = (allocation) => {
    setAllocations(prev =>
      prev.map(a => (a.id === allocation.id ? { ...a, teacher_submit: 'yes' } : a))
    );
    showSnackbar(`Scores for ${allocation.subject_name} (${allocation.className}) submitted successfully!`);
  };

  const handleSubmitAllScores = () => {
    setAllocations(prev =>
      prev.map(a => {
        if (
          (!filter.session_term || a.session_term === dummySessions.find(s => s.id === filter.session_term)?.label) &&
          (!filter.programme || a.programme === dummyProgrammes.find(p => p.id === filter.programme)?.name) &&
          (!filter.class_id || a.className === dummyClasses.find(c => c.id === filter.class_id)?.name)
        ) {
          return { ...a, teacher_submit: 'yes' };
        }
        return a;
      })
    );
    showSnackbar('All subject scores submitted! Waiting for approval.');
  };

  return (
    <Box>
      {/* ── Top Analytics Summary Header ────────────────────── */}
      <ScoreUploadAnalytics analyticsData={analyticsData} />

      <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
        {/* ── Card Header with Bulk Actions & View Toggle ──────── */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }}>
            Result Score Upload
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {canShowBulkActions && (
              <>
                <Button
                  variant="contained"
                  size="small"
                  color="info"
                  startIcon={<IconDownload size={16} />}
                  onClick={() => setDownloadCombinedDialog(true)}
                  sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
                >
                  Download {selectedClassName ? `(${selectedClassName})` : ''} Scoresheet
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  startIcon={<IconCloudUpload size={16} />}
                  onClick={() => setUploadCombinedDialog(true)}
                  sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
                >
                  Upload {selectedClassName ? `(${selectedClassName})` : ''} Scoresheet
                </Button>
              </>
            )}

            {canShowSubmitAll && (
              <Button
                variant="contained"
                size="small"
                color="warning"
                startIcon={<IconSend size={16} />}
                onClick={handleSubmitAllScores}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
              >
                Submit All Scores
              </Button>
            )}

            {/* View Mode Toggle */}
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              aria-label="view mode"
              sx={{ ml: 0.5 }}
            >
              <ToggleButton value="cards" aria-label="card view" sx={{ p: 0.75 }}>
                <Tooltip title="Card Grid View"><IconLayoutGrid size={16} /></Tooltip>
              </ToggleButton>
              <ToggleButton value="table" aria-label="table view" sx={{ p: 0.75 }}>
                <Tooltip title="Table View"><IconList size={16} /></Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* ── Filters Section ───────────────────────────────── */}
        <Box sx={{ p: 2, borderBottom: viewMode === 'cards' ? 'none' : '1px solid divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Session-Term</InputLabel>
                <Select value={filter.session_term} label="Session-Term" onChange={e => setFilter({ ...filter, session_term: e.target.value })}>
                  <MenuItem value="">-- Choose --</MenuItem>
                  {dummySessions.map(s => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Programme</InputLabel>
                <Select value={filter.programme} label="Programme" onChange={e => setFilter({ ...filter, programme: e.target.value, class_id: '' })}>
                  <MenuItem value="">-- Choose --</MenuItem>
                  {dummyProgrammes.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select value={filter.class_id} label="Class" onChange={e => setFilter({ ...filter, class_id: e.target.value })}>
                  <MenuItem value="">-- Choose --</MenuItem>
                  {filteredClasses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Subject</InputLabel>
                <Select value={filter.subject_id} label="Subject" onChange={e => setFilter({ ...filter, subject_id: e.target.value })}>
                  <MenuItem value="">-- Select Subject --</MenuItem>
                  {dummySubjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 1.5 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => setPage(0)}
                sx={{ fontWeight: 600, height: '40px' }}
              >
                Fetch
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* ── Prompt when filter not selected ─────────────────── */}
        {!filter.programme && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="info" sx={{ borderRadius: '8px', display: 'inline-flex', py: 0.5, px: 2 }}>
              Select a Programme and Class filter above to view subject score upload status.
            </Alert>
          </Box>
        )}

        {/* ── CARD GRID VIEW (Primary Layout matching essential_v2) ──────── */}
        {filter.programme && viewMode === 'cards' && (
          <Box sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
            {filteredAllocations.length > 0 ? (
              <Grid container spacing={2}>
                {filteredAllocations.map((alloc) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={alloc.id}>
                    <ScoreUploadCard
                      allocation={alloc}
                      onUploadScore={(a) => setActionSelectionDialog({ open: true, allocation: a })}
                      onViewScoreSheet={(a) => setInputScoreDialog({ open: true, allocation: a })}
                      onSubmitScore={(a) => handleSubmitScore(a)}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Alert severity="info" sx={{ borderRadius: '8px' }}>
                  No subject allocations found for the selected filters.
                </Alert>
              </Box>
            )}
          </Box>
        )}

        {/* ── TABLE VIEW (Fallback Option) ────────────────────── */}
        {filter.programme && viewMode === 'table' && (
          <Box>
            {filteredAllocations.length > 0 ? (
              <Box sx={{ p: 2 }}>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table stickyHeader sx={{ border: '1px solid', borderColor: 'divider', '& .MuiTableCell-root': { py: 1, px: 1.5, borderRight: '1px solid', borderColor: 'divider' }, whiteSpace: 'nowrap' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, width: '3%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Session-Term</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Programme</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Class</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Subject</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '10%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Total Registered</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '10%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Total CA1</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '10%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Total CA2</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '10%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Total Exam</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '8%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Submission</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '5%', bgcolor: isDark ? 'grey.900' : 'grey.50' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredAllocations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((a, i) => (
                        <TableRow key={a.id} hover>
                          <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                          <TableCell>{a.session_term}</TableCell>
                          <TableCell>{a.programme}</TableCell>
                          <TableCell>{a.className}</TableCell>
                          <TableCell>{a.subject_name}</TableCell>
                          <TableCell>{a.total_reg}</TableCell>
                          <TableCell>{a.ca1_count}</TableCell>
                          <TableCell>{a.ca2_count}</TableCell>
                          <TableCell>{a.exam_upload_count}</TableCell>
                          <TableCell>
                            {a.teacher_submit === 'yes' ? (
                              <Chip icon={<IconCheck size={14} />} label="Submitted" size="small" color="success" />
                            ) : (
                              <Chip label="Pending" size="small" color="warning" />
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={(e) => openActionMenu(e, a)}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={filteredAllocations.length}
                  page={page}
                  onPageChange={(_, p) => setPage(p)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                  rowsPerPageOptions={[5, 10, 25]}
                />
              </Box>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Alert severity="info" sx={{ borderRadius: '8px' }}>
                  No subject allocations found for the selected filters.
                </Alert>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* ── Table Row Action Menu ────────────────────────────── */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={closeActionMenu}
      >
        <MenuItem onClick={() => {
          closeActionMenu();
          setDownloadSampleDialog({ open: true, allocation: actionMenuRow });
        }}>
          <ListItemIcon><IconDownload size={18} /></ListItemIcon>
          <ListItemText>Download Score Sheet</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          closeActionMenu();
          showSnackbar('CA/Exam scoresheet downloaded!');
        }}>
          <ListItemIcon><IconFileSpreadsheet size={18} /></ListItemIcon>
          <ListItemText>CA/Exam Scoresheet</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          closeActionMenu();
          setUploadResultDialog({ open: true, allocation: actionMenuRow });
        }}>
          <ListItemIcon><IconCloudUpload size={18} /></ListItemIcon>
          <ListItemText>Upload Scores</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          closeActionMenu();
          setUploadCaExamDialog({ open: true, allocation: actionMenuRow });
        }}>
          <ListItemIcon><IconUpload size={18} /></ListItemIcon>
          <ListItemText>Upload CA & Exam Scores</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          closeActionMenu();
          setInputScoreDialog({ open: true, allocation: actionMenuRow });
        }}>
          <ListItemIcon><IconEdit size={18} /></ListItemIcon>
          <ListItemText>Input Scores</ListItemText>
        </MenuItem>
        {actionMenuRow?.ca1_count > 0 && (
          <MenuItem onClick={() => {
            closeActionMenu();
            setInputScoreDialog({ open: true, allocation: actionMenuRow });
          }}>
            <ListItemIcon><IconEye size={18} /></ListItemIcon>
            <ListItemText>View Score Sheet</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* ── Dialogs & Modals ───────────────────────────────── */}
      <ActionSelectionDialog
        open={actionSelectionDialog.open}
        allocation={actionSelectionDialog.allocation}
        onClose={() => setActionSelectionDialog({ open: false, allocation: null })}
        onProceed={handleProceedActionSelection}
      />

      <DownloadSampleDialog
        open={downloadSampleDialog.open}
        onClose={() => setDownloadSampleDialog({ open: false, allocation: null })}
        allocation={downloadSampleDialog.allocation}
      />

      <DownloadCombinedDialog
        open={downloadCombinedDialog}
        onClose={() => setDownloadCombinedDialog(false)}
        allocations={filteredAllocations}
      />

      <UploadResultDialog
        open={uploadResultDialog.open}
        onClose={() => setUploadResultDialog({ open: false, allocation: null })}
        allocation={uploadResultDialog.allocation}
        onUploaded={handleUploaded}
      />

      <UploadCombinedDialog
        open={uploadCombinedDialog}
        onClose={() => setUploadCombinedDialog(false)}
        allocations={filteredAllocations}
        onUploaded={handleUploaded}
      />

      <UploadCaExamDialog
        open={uploadCaExamDialog.open}
        onClose={() => setUploadCaExamDialog({ open: false, allocation: null })}
        allocation={uploadCaExamDialog.allocation}
        onUploaded={handleUploaded}
      />

      <InputScoreDialog
        open={inputScoreDialog.open}
        onClose={() => setInputScoreDialog({ open: false, allocation: null })}
        allocation={inputScoreDialog.allocation}
        filter={filter}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadScoresTab;
