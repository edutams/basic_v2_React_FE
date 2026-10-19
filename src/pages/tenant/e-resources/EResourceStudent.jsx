import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { IconExternalLink, IconPlayerPlay, IconSearch } from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import { tenantBrowseApi } from '@/api/tenant/e-resources/browseApi';
import { tenantSchemeApi } from '@/api/tenant/scheme-of-work/schemeOfWorkApi';

const BCrumb = [
  { to: '/', title: 'Dashboard' },
  { to: '/e-resources', title: 'E-Resources' },
  { title: 'My E-Resources' },
];

const isUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value.trim());

const EResourceStudent = () => {
  const [terms, setTerms] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [termId, setTermId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [weekSearch, setWeekSearch] = useState('');

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subjectsError, setSubjectsError] = useState('');
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [termsRes, subjectsRes] = await Promise.all([
          tenantSchemeApi.getTerms(),
          tenantBrowseApi.getStudentSubjects(),
        ]);
        const termRows = Array.isArray(termsRes) ? termsRes : [];
        setTerms(termRows);
        if (termRows.length > 0) setTermId(termRows[0].id);
        const subjectRows = Array.isArray(subjectsRes) ? subjectsRes : [];
        setSubjects(subjectRows);
        if (subjectRows.length > 0) {
          setSubjectId(subjectRows[0].subject_id);
          setClassId(subjectRows[0].class_id);
        }
      } catch {
        setSubjectsError('Failed to load your subjects. Please refresh the page.');
      } finally {
        setSubjectsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!termId || !subjectId) {
      setResources([]);
      return;
    }
    const subject = subjects.find((row) => row.subject_id === subjectId);
    const activeClassId = subject ? subject.class_id : classId;
    if (!activeClassId) {
      setResources([]);
      return;
    }
    let active = true;
    const loadResources = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await tenantBrowseApi.getStudentBrowse({
          class_id: activeClassId,
          term_id: termId,
          subject_id: subjectId,
        });
        if (!active) return;
        setResources(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!active) return;
        if (err.response?.status === 503) {
          setError('E-Resources materials are temporarily unavailable. Please try again shortly.');
        } else {
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              'Failed to load your e-resources. Please try again.',
          );
        }
        setResources([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadResources();
    return () => {
      active = false;
    };
  }, [termId, subjectId, classId, subjects]);

  const weeks = useMemo(() => {
    const grouped = [];
    const indexByWeek = {};
    resources.forEach((row) => {
      const key = row.wk_id ?? row.week_id ?? row.id;
      if (!(key in indexByWeek)) {
        indexByWeek[key] = grouped.length;
        grouped.push({ wkId: key, weekName: row.week_name || 'Unknown week', items: [] });
      }
      grouped[indexByWeek[key]].items.push(row);
    });
    if (!weekSearch.trim()) return grouped;
    const needle = weekSearch.trim().toLowerCase();
    return grouped.filter((week) => week.weekName.toLowerCase().includes(needle));
  }, [resources, weekSearch]);

  const renderMaterial = (item, itemIndex) => {
    const hasVideo = Boolean(item.resource_links && String(item.resource_links).trim());
    const hasMaterial = Boolean(item.learning_material && String(item.learning_material).trim());

    if (!hasVideo && !hasMaterial) {
      return (
        <Stack key={item.id ?? itemIndex} direction="row" alignItems="center" spacing={1} sx={{ py: 0.5 }}>
          <IconPlayerPlay size={18} color="#9e9e9e" />
          <Typography variant="body2" color="textSecondary">
            No Content Added
          </Typography>
        </Stack>
      );
    }

    return (
      <Stack key={item.id ?? itemIndex} spacing={1.5}>
        <Typography variant="body2" fontWeight={600}>
          {item.topic || 'Lesson material'}
        </Typography>
        {hasVideo && (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              pt: '56.25%',
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: 'grey.100',
            }}
          >
            <iframe
              src={item.resource_links}
              title={`Video for ${item.topic || 'lesson'}`}
              frameBorder="0"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            />
          </Box>
        )}
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {hasVideo && isUrl(item.resource_links) && (
            <Chip
              component="a"
              href={item.resource_links}
              target="_blank"
              rel="noopener noreferrer"
              icon={<IconExternalLink size={14} />}
              label="Open video"
              size="small"
              variant="outlined"
              clickable
            />
          )}
          {hasMaterial && (
            <Chip
              component={isUrl(item.learning_material) ? 'a' : 'span'}
              href={isUrl(item.learning_material) ? item.learning_material : undefined}
              target={isUrl(item.learning_material) ? '_blank' : undefined}
              rel={isUrl(item.learning_material) ? 'noopener noreferrer' : undefined}
              icon={<IconExternalLink size={14} />}
              label="Lesson note material"
              size="small"
              color="primary"
              variant="outlined"
              clickable={isUrl(item.learning_material)}
            />
          )}
        </Stack>
      </Stack>
    );
  };

  return (
    <PageContainer title="My E-Resources" description="Access your e-resource materials">
      <Breadcrumb title="My E-Resources" items={BCrumb} />
      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={2} mb={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="student-term-label">Term</InputLabel>
                <Select
                  labelId="student-term-label"
                  label="Term"
                  value={termId}
                  onChange={(e) => setTermId(e.target.value)}
                >
                  {terms.map((term) => (
                    <MenuItem key={term.id} value={term.id}>
                      {term.term_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="student-subject-label">Subject</InputLabel>
                <Select
                  labelId="student-subject-label"
                  label="Subject"
                  value={subjectId}
                  onChange={(e) => {
                    const subject = subjects.find((row) => row.subject_id === e.target.value);
                    setSubjectId(e.target.value);
                    if (subject) setClassId(subject.class_id);
                  }}
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.subject_id} value={subject.subject_id}>
                      {subject.subject_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {subjectsLoading && (
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={40} />
            </Stack>
          )}

          {!subjectsLoading && subjectsError && <Alert severity="error">{subjectsError}</Alert>}

          {!subjectsLoading && !subjectsError && subjects.length === 0 && (
            <Alert severity="info">
              No registered subjects found. Please ensure your registration is complete.
            </Alert>
          )}

          {!subjectsLoading && !subjectsError && subjects.length > 0 && (
            <>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by week"
                value={weekSearch}
                onChange={(e) => setWeekSearch(e.target.value)}
                InputProps={{
                  startAdornment: <IconSearch size={18} style={{ marginRight: 8 }} />,
                }}
                sx={{ mb: 3 }}
              />

              {loading && (
                <Stack spacing={2}>
                  <LinearProgress />
                  <Grid container spacing={2}>
                    {[0, 1, 2, 3].map((skeleton) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={skeleton}>
                        <Skeleton variant="rectangular" height={180} />
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              )}

              {!loading && error && (
                <Alert severity={error.includes('temporarily unavailable') ? 'warning' : 'error'}>
                  {error}
                </Alert>
              )}

              {!loading && !error && (
                <>
                  {weeks.length === 0 ? (
                    <Alert severity="info">
                      {resources.length === 0
                        ? 'No e-resource materials found for the selected term and subject.'
                        : 'No weeks match your search.'}
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {weeks.map((week) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={week.wkId}>
                          <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                              <Stack spacing={2}>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight={700}
                                  textTransform="uppercase"
                                >
                                  {week.weekName}
                                </Typography>
                                {week.items.map((item, itemIndex) =>
                                  renderMaterial(item, `${week.wkId}-${item.id ?? itemIndex}`),
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default EResourceStudent;
