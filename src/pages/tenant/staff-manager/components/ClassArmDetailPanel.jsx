import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Tooltip,
  Divider,
  Stack,
} from '@mui/material';
import {
  IconX,
  IconRefresh,
  IconUserPlus,
  IconSchool,
  IconLayoutDashboard,
  IconUsers,
  IconBook2,
  IconUserExclamation,
  IconId,
  IconArmchair,
} from '@tabler/icons-react';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import allocationApi from '@/api/tenant/allocations/allocationApi';
import useNotification from '@/hooks/useNotification';

const initials = (name) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

const InfoRow = ({ icon: Icon, color, label, value }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: '8px',
        bgcolor: `${color}1A`,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={14} />
    </Box>
    <Typography variant="body2">
      <strong>{label}:</strong> {value}
    </Typography>
  </Stack>
);

/**
 * Right-side detail panel for a single class arm row on the Class Teacher
 * Allocation page — Overview (+ Quick Actions + Suggested Teachers),
 * Students, Subjects. History is deliberately left out for now: it would
 * need class-arm-level activity logging that doesn't exist yet.
 */
const ClassArmDetailPanel = ({
  arm,
  programmeId,
  sessionTermId,
  onClose,
  onAssignTeacher,
  onRemoved,
}) => {
  const notify = useNotification();
  const [tab, setTab] = useState('overview');

  const [suggested, setSuggested] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  const [assigningId, setAssigningId] = useState(null);

  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const fetchSuggested = async () => {
    setSuggestedLoading(true);
    try {
      const res = await allocationApi.getSuggestedClassTeachers({
        session_term_id: sessionTermId,
        excluding_user_id: arm.teacher_id || undefined,
        limit: 5,
      });
      setSuggested(res.data || []);
    } catch (error) {
      notify.error('Failed to fetch suggested teachers');
    } finally {
      setSuggestedLoading(false);
    }
  };

  // Fetched eagerly (not lazily on tab click) so the Students/Subjects tab
  // labels can show a real "(N)" count as soon as the panel opens.
  useEffect(() => {
    setTab('overview');
    fetchSuggested();

    setRosterLoading(true);
    allocationApi
      .getClassArmRoster(arm.class_arm_id, { session_term_id: sessionTermId })
      .then((res) => setRoster(res.data || []))
      .catch(() => notify.error('Failed to fetch students for this class arm'))
      .finally(() => setRosterLoading(false));

    if (programmeId) {
      setSubjectsLoading(true);
      allocationApi
        .getSubjectTeacherAllocations({
          programme_id: programmeId,
          session_term_id: sessionTermId,
          class_arm_id: arm.class_arm_id,
        })
        .then((res) => setSubjects(res.data || []))
        .catch(() => notify.error('Failed to fetch subjects for this class arm'))
        .finally(() => setSubjectsLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arm.class_arm_id]);

  const handleAssign = async (candidate) => {
    setAssigningId(candidate.user_id);
    try {
      await onAssignTeacher(candidate.user_id, candidate.name);
      fetchSuggested();
    } finally {
      setAssigningId(null);
    }
  };

  const handleRemoveTeacher = async () => {
    if (!arm.allocation_id) return;
    setRemoving(true);
    try {
      await allocationApi.removeClassTeacherAllocation(arm.allocation_id);
      notify.success('Class teacher allocation removed');
      onRemoved?.();
    } catch (error) {
      notify.error('Failed to remove allocation');
    } finally {
      setRemoving(false);
      setRemoveConfirmOpen(false);
    }
  };

  return (
    <Paper
      variant="contained"
      sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper', width: '100%' }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#2563EB', width: 42, height: 42 }}>
              <IconSchool size={22} />
            </Avatar>
            <Box>
              <Typography fontWeight={700}>{arm.full_class_name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {arm.programme_name}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <IconX size={18} />
          </IconButton>
        </Box>

        <Box sx={{ mt: 1.5 }}>
          {arm.teacher_id ? (
            <Chip
              avatar={<Avatar sx={{ bgcolor: '#16A34A' }}>{initials(arm.teacher_name)}</Avatar>}
              label={`Class Teacher: ${arm.teacher_name}`}
              size="small"
              sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 600 }}
            />
          ) : (
            <Chip
              icon={<IconUserExclamation size={14} />}
              label="No class teacher assigned"
              size="small"
              color="warning"
            />
          )}
        </Box>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth">
        <Tab
          value="overview"
          icon={<IconLayoutDashboard size={16} />}
          iconPosition="start"
          label="Overview"
        />
        <Tab
          value="students"
          icon={<IconUsers size={16} />}
          iconPosition="start"
          label={rosterLoading ? 'Students' : `Students (${roster.length})`}
        />
        <Tab
          value="subjects"
          icon={<IconBook2 size={16} />}
          iconPosition="start"
          label={subjectsLoading ? 'Subjects' : `Subjects (${subjects.length})`}
        />
      </Tabs>

      <Box sx={{ p: 2, maxHeight: 560, overflowY: 'auto' }}>
        {tab === 'overview' && (
          <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <InfoRow icon={IconSchool} color="#2563EB" label="Class" value={arm.class_name} />
              <InfoRow icon={IconArmchair} color="#9333EA" label="Arm" value={arm.arm_name} />
              <InfoRow
                icon={IconId}
                color="#D97706"
                label="Class Teacher"
                value={
                  arm.teacher_name
                    ? `${arm.teacher_name}${arm.staff_id ? ` (${arm.staff_id})` : ''}`
                    : 'Unassigned'
                }
              />
            </Box>

            {/* Quick Actions */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<IconUsers size={14} />}
                onClick={() => setTab('students')}
                sx={{ color: '#2563EB', borderColor: '#2563EB' }}
              >
                View Students
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<IconBook2 size={14} />}
                onClick={() => setTab('subjects')}
                sx={{ color: '#9333EA', borderColor: '#9333EA' }}
              >
                View Subjects
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<IconRefresh size={14} />}
                onClick={fetchSuggested}
                disabled={suggestedLoading}
                sx={{ color: '#D97706', borderColor: '#D97706' }}
              >
                Refresh Suggestions
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<IconUserExclamation size={14} />}
                onClick={() => setRemoveConfirmOpen(true)}
                disabled={!arm.teacher_id}
              >
                Remove Class Teacher
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                Suggested Teachers
              </Typography>
              <Tooltip title="Ranked by lightest current teaching load this term">
                <IconButton size="small" onClick={fetchSuggested} disabled={suggestedLoading}>
                  <IconRefresh size={16} />
                </IconButton>
              </Tooltip>
            </Box>

            {suggestedLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={48} />
                ))}
              </Box>
            ) : suggested.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No available teaching staff to suggest.
              </Typography>
            ) : (
              <List dense disablePadding>
                {suggested.map((candidate) => (
                  <ListItem
                    key={candidate.user_id}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.75,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                    secondaryAction={
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<IconUserPlus size={14} />}
                        disabled={assigningId === candidate.user_id}
                        onClick={() => handleAssign(candidate)}
                        sx={{ fontSize: '0.7rem', px: 1 }}
                      >
                        {assigningId === candidate.user_id ? 'Assigning...' : 'Assign'}
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={candidate.avatar}
                        sx={{ width: 32, height: 32, fontSize: 12, bgcolor: '#16A34A' }}
                      >
                        {initials(candidate.name)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={candidate.name}
                      secondary={`${candidate.total_load} active assignment${candidate.total_load !== 1 ? 's' : ''} this term`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {tab === 'students' && (
          <Box>
            {rosterLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={40} />
                ))}
              </Box>
            ) : roster.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No students registered in this class arm yet.
              </Typography>
            ) : (
              <List dense disablePadding>
                {roster.map((student) => (
                  <ListItem key={student.user_id} divider>
                    <ListItemAvatar>
                      <Avatar
                        src={student.avatar}
                        sx={{ width: 30, height: 30, fontSize: 11, bgcolor: '#2563EB' }}
                      >
                        {initials(student.name)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={student.name}
                      secondary={student.learner_id}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {tab === 'subjects' && (
          <Box>
            {subjectsLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={40} />
                ))}
              </Box>
            ) : subjects.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No subjects found for this class arm.
              </Typography>
            ) : (
              <List dense disablePadding>
                {subjects.map((subject) => (
                  <ListItem key={subject.subject_id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 30, height: 30, bgcolor: '#9333EA' }}>
                        <IconBook2 size={15} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={subject.subject_name}
                      secondary={subject.teacher_name || 'No subject teacher assigned'}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        color: subject.teacher_name ? 'text.secondary' : 'warning.main',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </Box>

      <ConfirmationDialog
        open={removeConfirmOpen}
        onClose={() => setRemoveConfirmOpen(false)}
        onConfirm={handleRemoveTeacher}
        title="Remove Class Teacher"
        message={`Remove ${arm.teacher_name} as the class teacher for ${arm.full_class_name}?`}
        severity="error"
        confirmText={removing ? 'Removing…' : 'Remove'}
      />
    </Paper>
  );
};

export default ClassArmDetailPanel;
