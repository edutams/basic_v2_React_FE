import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  IconChecks,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconEye,
  IconFileText,
  IconFilter,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import StatCard from '@/components/shared/StatCard';
import useNotification from '@/hooks/useNotification';
import { fetchActiveTenantSessionTerm, fetchSessionTerms } from '@/api/tenant/session-term/sessionTermApi';
import { tenantApprovalApi } from '@/api/tenant/e-resources/lessonNoteApi';
import { RichContentView, apiErrorMessage, firstFileUrl, getYouTubeId, toAbsoluteUrl } from '../teacher/lessonNoteShared';

const BCrumb = [
  { to: '/', title: 'Dashboard' },
  { to: '/e-resources', title: 'E-Resources' },
  { title: 'Approvals' },
];

const CATEGORIES = [
  { value: 'lesson_note', label: 'Lesson Notes' },
  { value: 'lesson_plan', label: 'Lesson Plans' },
  { value: 'lesson_video', label: 'Lesson Videos' },
];

const parseMaybeJson = (value) => {
  if (typeof value !== 'string') return value;
  const text = value.trim();
  if (!text.startsWith('[') && !text.startsWith('{')) return text;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const statusChip = (status) => {
  if (status === 'approved') return <Chip size="small" color="success" label="Approved" />;
  if (status === 'rejected') return <Chip size="small" color="error" label="Rejected" />;
  if (status === 'inactive' || status === 'pending') return <Chip size="small" color="warning" label="Pending" />;
  return <Chip size="small" variant="outlined" label={status || 'Pending'} />;
};

const ApprovalContent = ({ value, category }) => {
  const parsed = parseMaybeJson(value);

  if (!parsed) {
    return (
      <Alert severity="info" sx={{ width: '100%' }}>
        No content available.
      </Alert>
    );
  }

  if (category === 'lesson_video') {
    const url = typeof parsed === 'string' ? parsed : firstFileUrl(parsed);
    if (!url) {
      return (
        <Alert severity="info" sx={{ width: '100%' }}>
          No video content available.
        </Alert>
      );
    }
    const youtubeId = getYouTubeId(url);
    if (youtubeId) {
      return (
        <Box sx={{ position: 'relative', pt: '56.25%', borderRadius: 1, overflow: 'hidden' }}>
          <iframe
            title="approval-video"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Box>
      );
    }
    return (
      <Button variant="outlined" href={toAbsoluteUrl(url)} target="_blank" rel="noopener noreferrer" fullWidth>
        Open video file
      </Button>
    );
  }

  // Plan/note payloads are either plain text/HTML or {"word":["<url>"]}.
  const text = typeof parsed === 'string' ? parsed : (firstFileUrl(parsed) || '');
  return <RichContentView content={text} />;
};

const LessonNoteApproval = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const notify = useNotification();

  const [sessionTerms, setSessionTerms] = useState([]);
  const [selectedSesTerm, setSelectedSesTerm] = useState('');
  const [category, setCategory] = useState('lesson_note');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [queueError, setQueueError] = useState('');
  // Term-wide totals from the API — `rows` only ever holds one page, so the
  // cards cannot be counted from it.
  const [queueStats, setQueueStats] = useState(null);

  const [selectedRow, setSelectedRow] = useState(null);
  const [action, setAction] = useState(null);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetchSessionTerms();
        const list = res?.data ?? [];
        setSessionTerms(list);
        let activeId = null;
        try {
          const active = await fetchActiveTenantSessionTerm();
          activeId = active?.data?.id ?? active?.id ?? null;
        } catch {
          activeId = null;
        }
        setSelectedSesTerm(activeId ?? list.find((row) => row.status === 'active')?.id ?? list[0]?.id ?? '');
      } catch (err) {
        notify.error(apiErrorMessage(err, 'Failed to load session terms'));
      }
    };
    init();
  }, [notify]);

  const loadQueue = useCallback(
    async (customTerm, customCategory) => {
      const termToUse = customTerm !== undefined ? customTerm : selectedSesTerm;
      const catToUse = customCategory !== undefined ? customCategory : category;
      if (!termToUse) return;

      setLoading(true);
      setQueueError('');
      try {
        const res = await tenantApprovalApi.getLessonApprovalContent(
          {
            category: catToUse,
            selectedSesTerm: termToUse,
            selectedTermId: termToUse,
            session_term_id: termToUse,
            per_page: perPage,
          },
          { page: page + 1 },
        );

        let list = [];
        let totalCount = 0;

        if (Array.isArray(res?.data?.data)) {
          list = res.data.data;
          totalCount = Number(res.data.total) || list.length;
        } else if (Array.isArray(res?.data)) {
          list = res.data;
          totalCount = Number(res.total) || list.length;
        } else if (Array.isArray(res)) {
          list = res;
          totalCount = list.length;
        } else if (res?.data && typeof res.data === 'object' && Array.isArray(res.data.items)) {
          list = res.data.items;
          totalCount = Number(res.data.total) || list.length;
        }

        setRows(list);
        setTotal(totalCount);
      } catch (err) {
        setRows([]);
        setTotal(0);
        setQueueError(apiErrorMessage(err, 'Failed to load the approval queue'));
      } finally {
        setLoading(false);
      }
    },
    [category, page, perPage, selectedSesTerm],
  );

  useEffect(() => {
    if (!selectedSesTerm) return;
    loadQueue();
  }, [loadQueue, selectedSesTerm]);

  const loadStats = useCallback(async () => {
    if (!selectedSesTerm) return;
    // Drop the previous term's figures rather than showing them against the
    // new one while this is in flight.
    setQueueStats(null);
    try {
      const res = await tenantApprovalApi.getLessonApprovalStats({
        category,
        selectedSesTerm,
        selectedTermId: selectedSesTerm,
        session_term_id: selectedSesTerm,
      });
      setQueueStats({
        total: Number(res?.total ?? 0),
        pending: Number(res?.pending ?? 0),
        approved: Number(res?.approved ?? 0),
        rejected: Number(res?.rejected ?? 0),
      });
    } catch {
      // The cards fall back to counting the loaded page in `stats` below.
      setQueueStats(null);
    }
  }, [category, selectedSesTerm]);

  useEffect(() => {
    if (!selectedSesTerm) return;
    loadStats();
  }, [loadStats, selectedSesTerm]);

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(0);
    setSelectedRow(null);
    loadQueue(selectedSesTerm, value);
  };

  const handleTermChange = (value) => {
    setSelectedSesTerm(value);
    setPage(0);
    setSelectedRow(null);
    loadQueue(value, category);
  };

  const openDetail = (row) => {
    setSelectedRow(row);
    setAction(null);
    setComment('');
  };

  const processAction = async () => {
    if (!selectedRow || !action) return;
    setProcessing(true);
    try {
      const res = await tenantApprovalApi.approveLessonContent({
        approval_id: selectedRow.approval_id,
        category: selectedRow.category,
        action,
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      });
      notify.success(res?.message || (action === 'approve' ? 'Content approved' : 'Content rejected'));
      setSelectedRow(null);
      setAction(null);
      setComment('');
      await loadQueue();
      await loadStats();
    } catch (err) {
      notify.error(apiErrorMessage(err, 'Failed to process the approval'));
    } finally {
      setProcessing(false);
    }
  };

  const approvedInfo = useMemo(() => {
    const info = selectedRow?.lesson_approval;
    if (!info?.approved_by_name) return null;
    return `${info.approved_by_name}${info.approved_at ? ` on ${info.approved_at}` : ''}`;
  }, [selectedRow]);

  const stats = useMemo(() => {
    // Normal case: counts for the whole term and category, counted in SQL.
    if (queueStats) return queueStats;

    // Fallback when the stats endpoint can't be reached — this only ever
    // describes the page of rows that happens to be loaded.
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    rows.forEach((r) => {
      const st = (r.approval_status || '').toLowerCase();
      if (st === 'approved') approved += 1;
      else if (st === 'rejected') rejected += 1;
      else pending += 1;
    });
    return {
      total: total || rows.length,
      pending,
      approved,
      rejected,
    };
  }, [queueStats, rows, total]);

  const filteredRows = useMemo(() => {
    let list = rows;
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((r) => {
        const st = (r.approval_status || '').toLowerCase();
        if (statusFilter === 'pending') return st === 'pending' || st === 'inactive' || !st;
        return st === statusFilter;
      });
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((r) =>
        [r.subtopic, r.created_by_teacher, r.topic, r.category].some((field) =>
          field ? String(field).toLowerCase().includes(q) : false,
        ),
      );
    }
    return list;
  }, [rows, statusFilter, searchQuery]);

  return (
    <PageContainer title="Lesson Approvals" description="Review and approve lesson notes, plans and videos">
      <Breadcrumb title="Lesson Approvals" items={BCrumb} />

      {/* ── Stat Cards Intelligence ────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            count={stats.total}
            label="Total In Queue"
            subtitle="Current term items"
            icon={IconFileText}
            colorIndex={0}
            loading={loading}
            onClick={() => setStatusFilter('all')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            count={stats.pending}
            label="Pending Review"
            subtitle="Awaiting moderation"
            icon={IconClock}
            colorIndex={3}
            loading={loading}
            onClick={() => setStatusFilter('pending')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            count={stats.approved}
            label="Approved Content"
            subtitle="Verified & active"
            icon={IconCircleCheck}
            colorIndex={1}
            loading={loading}
            onClick={() => setStatusFilter('approved')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            count={stats.rejected}
            label="Needs Revision"
            subtitle="Returned to teacher"
            icon={IconCircleX}
            colorIndex={4}
            loading={loading}
            onClick={() => setStatusFilter('rejected')}
          />
        </Grid>
      </Grid>

      {/* ── Filters + Content Card ───────────────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="term-select-label">Session Term</InputLabel>
              <Select
                labelId="term-select-label"
                label="Session Term"
                value={selectedSesTerm}
                onChange={(e) => handleTermChange(e.target.value)}
              >
                {sessionTerms.map((term) => (
                  <MenuItem key={term.id} value={term.id}>
                    {term.session?.session_name || term.session?.sesname || 'Session'} -{' '}
                    {term.term?.term_name || term.term_name || 'Term'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-select-label">Content Type</InputLabel>
              <Select
                labelId="category-select-label"
                label="Content Type"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.8 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search teacher, subtopic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <IconSearch size={16} style={{ marginRight: 6, color: '#94a3b8' }} />,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={loading ? null : <IconFilter size={16} />}
                onClick={() => loadQueue()}
                disabled={loading || !selectedSesTerm}
                sx={{ fontWeight: 600, height: '40px' }}
              >
                {loading ? <CircularProgress size={18} color="inherit" /> : 'Fetch'}
              </Button>
              <Tooltip title="Refresh queue">
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => loadQueue()}
                  disabled={loading}
                  sx={{ minWidth: 40, px: 1, height: '40px' }}
                >
                  <IconRefresh size={18} />
                </Button>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {queueError && (
          <Alert severity="error" sx={{ mb: 2.5 }} action={<Button color="inherit" size="small" onClick={() => loadQueue()}>Retry</Button>}>
            {queueError}
          </Alert>
        )}

          {loading ? (
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={48} />
              <Skeleton variant="rounded" height={52} />
              <Skeleton variant="rounded" height={52} />
              <Skeleton variant="rounded" height={52} />
            </Stack>
          ) : filteredRows.length === 0 ? (
            <Alert severity="info">
              {rows.length === 0
                ? `No ${CATEGORIES.find((item) => item.value === category)?.label.toLowerCase()} found for the selected term.`
                : 'No submissions match your active status or search filter.'}
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Subtopic / Topic</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Teacher</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Submitted Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRows.map((row) => (
                      <TableRow key={row.composite_id || row.id || row.approval_id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {row.subtopic || row.topic || '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {CATEGORIES.find((item) => item.value === row.category)?.label ?? row.category}
                          </Typography>
                        </TableCell>
                        <TableCell>{row.created_by_teacher || row.teacher_name || 'Unknown'}</TableCell>
                        <TableCell>{row.created_at || '—'}</TableCell>
                        <TableCell>{statusChip(row.approval_status)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="View and moderate">
                            <IconButton
                              size="small"
                              onClick={() => openDetail(row)}
                              aria-label="View submission"
                              sx={{
                                color: 'primary.main',
                                bgcolor: isDark ? 'rgba(37,99,235,0.1)' : '#eff6ff',
                                '&:hover': { bgcolor: isDark ? 'rgba(37,99,235,0.2)' : '#dbeafe' },
                              }}
                            >
                              <IconEye size={17} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={total || rows.length}
                page={page}
                onPageChange={(_, nextPage) => setPage(nextPage)}
                rowsPerPage={perPage}
                onRowsPerPageChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 20, 50]}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedRow)} onClose={() => setSelectedRow(null)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Box>
              <Typography variant="h6">Review Submission</Typography>
              <Typography variant="body2" color="text.secondary">
                {[selectedRow?.subtopic, selectedRow?.created_by_teacher].filter(Boolean).join(' • ')}
              </Typography>
            </Box>
            <IconButton onClick={() => setSelectedRow(null)} aria-label="Close">
              <IconX size={18} />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <Typography variant="subtitle2">Original</Typography>
                {selectedRow?.original_source && (
                  <Chip size="small" variant="outlined" label={selectedRow.original_source === 'ai' ? 'AI' : 'Manual'} />
                )}
              </Stack>
              <Box sx={{ maxHeight: 480, overflowY: 'auto' }}>
                <ApprovalContent value={selectedRow?.original} category={selectedRow?.category} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <Typography variant="subtitle2">Updated</Typography>
                {selectedRow?.updated_source && (
                  <Chip size="small" variant="outlined" label={selectedRow.updated_source === 'ai' ? 'AI' : 'Manual'} />
                )}
              </Stack>
              <Box sx={{ maxHeight: 480, overflowY: 'auto' }}>
                <ApprovalContent value={selectedRow?.updated} category={selectedRow?.category} />
              </Box>
            </Grid>
          </Grid>

          {approvedInfo && (
            <>
              <Divider sx={{ my: 2 }} />
              <Alert severity="success">Already processed by {approvedInfo}</Alert>
            </>
          )}

          {selectedRow?.approval_status === 'pending' || selectedRow?.approval_status === 'inactive' ? (
            <Box mt={2}>
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={2}
                label="Comment (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a note about this decision..."
              />
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRow(null)} disabled={processing}>
            Close
          </Button>
          {(selectedRow?.approval_status === 'pending' || selectedRow?.approval_status === 'inactive') && (
            <>
              <Button
                color="error"
                variant="outlined"
                disabled={processing}
                onClick={() => setAction('reject')}
                startIcon={<IconTrash size={15} />}
              >
                Reject
              </Button>
              <Button
                color="success"
                variant="contained"
                disabled={processing}
                onClick={() => setAction('approve')}
                startIcon={<IconChecks size={15} />}
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(action)} onClose={() => setAction(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {action === 'approve' ? 'Approve this content?' : 'Reject this content?'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {action === 'approve'
              ? 'The approved content will become visible to students for this lesson.'
              : 'The submission will be marked as rejected and returned to the teacher.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAction(null)} disabled={processing}>
            Cancel
          </Button>
          <Button
            color={action === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={processing}
            onClick={processAction}
            startIcon={processing ? <CircularProgress size={14} color="inherit" /> : action === 'approve' ? <IconChecks size={15} /> : <IconTrash size={15} />}
          >
            {action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default LessonNoteApproval;
