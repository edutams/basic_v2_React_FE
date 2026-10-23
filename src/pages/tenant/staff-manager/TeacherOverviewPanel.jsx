import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Skeleton,
  Alert,
  Button,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MessageIcon from '@mui/icons-material/Message';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import DeleteIcon from '@mui/icons-material/Delete';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import EventIcon from '@mui/icons-material/Event';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import HistoryIcon from '@mui/icons-material/History';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import tenantApi from '@/api/tenant/tenant_api';
import timetableApi from '@/api/tenant/timetable/timetableApi';
import aclApi from '@/api/tenant/acl/aclApi';
import staffApi from '@/api/tenant/staffs/staffApi';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import { useNotification } from '@/hooks/useNotification';
import { ActivityLogModal } from './non-teaching-dashboard/components/Activity-log';
import { getSubjectColor } from '@/utils/subjectColor';
import { getSubjectIcon } from '@/utils/subjectIcons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const INFO_ROW_COLORS = { appointment: '#2563EB', address: '#16A34A', emergency: '#DC2626' };

const InfoRow = ({ icon: Icon, color, label, value }) => (
  <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: 1,
        bgcolor: `${color}1A`,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon sx={{ fontSize: 15 }} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value || '—'}
      </Typography>
    </Box>
  </Stack>
);

/**
 * Inline side panel for a selected teacher — sits beside the Teaching
 * Staff table (which shrinks to make room), same established pattern as
 * ParentOverviewPanel.jsx / LearnerOverviewPanel.jsx, not an overlay
 * drawer, so the table stays visible and interactive while a teacher's
 * details are open.
 *
 * Deliberately has no "Department"/"Employment Type"/"Qualifications"
 * fields — none of them have a real concept behind them in this codebase
 * (see GET /school_setup/staff/{id}/profile's own docblock).
 */
const TeacherOverviewPanel = ({
  staffRow,
  onClose,
  onEdit,
  onSendMessage,
  onImpersonate,
  onUpdatePhoto,
  onResetPassword,
  onUpdateStatus,
  onDelete,
}) => {
  const notify = useNotification();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);

  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const [schedule, setSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [statusHistory, setStatusHistory] = useState(null);
  const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!staffRow?.user_id) return;
    setLoading(true);
    try {
      const res = await tenantApi.get(`/school_setup/staff/${staffRow.user_id}/profile`);
      setProfile(res.data?.data || null);
    } catch {
      notify.error("Failed to load this teacher's profile");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffRow?.user_id]);

  useEffect(() => {
    fetchProfile();
    setTab('overview');
  }, [fetchProfile]);

  // Merges what this teacher did themselves (causer-based) with what was
  // done TO them by someone else, e.g. an admin assigning a subject/class
  // or timetable slot (subject-based) — a causer-only feed would never
  // show those, since the admin, not the teacher, caused them.
  useEffect(() => {
    if (!staffRow?.user_id) return;
    setActivitiesLoading(true);
    Promise.all([
      aclApi.getUserActivityLogs(staffRow.user_id, { limit: 10 }).catch(() => ({ data: [] })),
      aclApi
        .getUserActivityLogsAsSubject(staffRow.user_id, { limit: 10 })
        .catch(() => ({ data: [] })),
    ])
      .then(([caused, about]) => {
        const merged = [...(caused?.data || []), ...(about?.data || [])]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 6);
        setActivities(merged);
      })
      .finally(() => setActivitiesLoading(false));
  }, [staffRow?.user_id]);

  useEffect(() => {
    if (tab !== 'timetable' || !staffRow?.user_id || schedule) return;
    setScheduleLoading(true);
    timetableApi
      .getTeacherScheduleOverview(staffRow.user_id)
      .then((res) => setSchedule(res.data?.data || null))
      .catch(() => notify.error("Failed to load this teacher's timetable"))
      .finally(() => setScheduleLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, staffRow?.user_id]);

  useEffect(() => {
    setSchedule(null);
  }, [staffRow?.user_id]);

  useEffect(() => {
    if (tab !== 'roles' || !staffRow?.user_id || statusHistory) return;
    setStatusHistoryLoading(true);
    staffApi
      .getStatusHistory(staffRow.user_id)
      .then((res) => setStatusHistory(res.data || []))
      .catch(() => setStatusHistory([]))
      .finally(() => setStatusHistoryLoading(false));
  }, [tab, staffRow?.user_id, statusHistory]);

  useEffect(() => {
    setStatusHistory(null);
  }, [staffRow?.user_id]);

  if (!staffRow) return null;

  const fullName =
    profile?.name || `${staffRow.user?.fname || ''} ${staffRow.user?.lname || ''}`.trim();
  const subjects = profile?.subjects || [];
  const classes = profile?.classes || [];
  const emergencyContact = profile?.emergency_contact || {};
  const hasEmergencyContact =
    emergencyContact.name || emergencyContact.phone || emergencyContact.address;
  const isTeaching = profile?.staff_type !== 'non-teaching';

  const todayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
    new Date().getDay()
  ];
  const todaysRows = schedule?.schedule?.[todayKey] || [];

  return (
    <Paper
      elevation={0}
      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 1.5 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Avatar src={profile?.avatar || staffRow.user?.avatar} sx={{ width: 48, height: 48 }}>
            {fullName[0]}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={800} noWrap>
              {fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {!isTeaching
                ? profile?.role || 'Non-Teaching Staff'
                : profile?.is_subject_teacher
                  ? 'Subject Teacher'
                  : profile?.is_class_teacher
                    ? 'Class Teacher'
                    : 'Teacher'}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          {!loading && profile && (
            <Chip
              size="small"
              label={profile.status === 'active' ? 'Active' : profile.status}
              color={profile.status === 'active' ? 'success' : 'default'}
            />
          )}
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {!loading && profile && (
        <Stack spacing={0.5} sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <BadgeIcon sx={{ fontSize: 15, color: '#2563EB' }} />
            <Typography variant="caption" color="text.secondary">
              {profile.staff_id}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <PhoneIcon sx={{ fontSize: 15, color: '#16A34A' }} />
            <Typography variant="caption" color="text.secondary">
              {profile.phone || '—'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <EmailIcon sx={{ fontSize: 15, color: '#D97706' }} />
            <Typography variant="caption" color="text.secondary">
              {profile.email || '—'}
            </Typography>
          </Stack>
        </Stack>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<MessageIcon sx={{ fontSize: 16 }} />}
          onClick={() => onSendMessage?.(staffRow)}
          sx={{
            bgcolor: '#2563EB',
            '&:hover': { bgcolor: '#1D4ED8' },
            fontSize: '0.75rem',
            px: 1.25,
          }}
        >
          Send Message
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<EditIcon sx={{ fontSize: 16 }} />}
          onClick={() => onEdit?.(staffRow)}
          sx={{ fontSize: '0.75rem', px: 1.25 }}
        >
          Edit
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => setMoreAnchorEl(e.currentTarget)}
          sx={{ fontSize: '0.75rem', px: 1 }}
        >
          More <MoreVertIcon sx={{ fontSize: 16 }} />
        </Button>
        <Menu
          anchorEl={moreAnchorEl}
          open={Boolean(moreAnchorEl)}
          onClose={() => setMoreAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              setMoreAnchorEl(null);
              onImpersonate?.(staffRow);
            }}
          >
            <PersonIcon fontSize="small" sx={{ mr: 1, color: '#2563EB' }} />
            Login As Staff
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMoreAnchorEl(null);
              onUpdatePhoto?.(staffRow);
            }}
          >
            <CameraAltIcon fontSize="small" sx={{ mr: 1, color: '#0D9488' }} />
            Update Photo
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMoreAnchorEl(null);
              onResetPassword?.(staffRow);
            }}
          >
            <VpnKeyIcon fontSize="small" sx={{ mr: 1, color: '#0891B2' }} />
            Reset Password
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMoreAnchorEl(null);
              onUpdateStatus?.(staffRow);
            }}
            sx={{ color: profile?.status === 'active' ? 'warning.main' : 'success.main' }}
          >
            <ToggleOnIcon fontSize="small" sx={{ mr: 1 }} />
            {profile?.status === 'active' ? 'Deactivate' : 'Activate'}
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMoreAnchorEl(null);
              onDelete?.(staffRow);
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </Stack>

      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        variant="scrollable"
        scrollButtons={false}
        allowScrollButtonsMobile={false}
        sx={{
          mb: 1.5,
          minHeight: 36,
          '& .MuiTab-root': {
            minHeight: 36,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8rem',
          },
        }}
      >
        <Tab value="overview" label="Overview" />
        {isTeaching && <Tab value="subjects" label={`Subjects (${subjects.length})`} />}
        {isTeaching && <Tab value="classes" label={`Classes (${classes.length})`} />}
        {isTeaching && <Tab value="timetable" label="Timetable" />}
        {!isTeaching && <Tab value="roles" label="Roles & Functions" />}
        {!isTeaching && <Tab value="activity" label="Activity" />}
      </Tabs>

      {loading ? (
        <Stack spacing={1}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={40} />
          ))}
        </Stack>
      ) : !profile ? (
        <Alert severity="error">Failed to load this teacher's profile.</Alert>
      ) : tab === 'overview' ? (
        <Box>
          <InfoRow
            icon={EventIcon}
            color={INFO_ROW_COLORS.appointment}
            label="Date of Appointment"
            value={profile.date_of_appointment}
          />
          <InfoRow
            icon={HomeIcon}
            color={INFO_ROW_COLORS.address}
            label="Address"
            value={profile.address}
          />
          <InfoRow
            icon={ContactEmergencyIcon}
            color={INFO_ROW_COLORS.emergency}
            label="Emergency Contact"
            value={
              hasEmergencyContact
                ? [emergencyContact.name, emergencyContact.relationship, emergencyContact.phone]
                    .filter(Boolean)
                    .join(' · ')
                : null
            }
          />

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 2, mb: 1 }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center">
              <HistoryIcon sx={{ fontSize: 16, color: '#7C3AED' }} />
              <Typography variant="subtitle2" fontWeight={800}>
                Recent Activity
              </Typography>
            </Stack>
            <Button
              size="small"
              onClick={() => setActivityModalOpen(true)}
              sx={{ fontSize: '0.7rem' }}
            >
              View All
            </Button>
          </Stack>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.25 }}>
            {activitiesLoading ? (
              <Stack spacing={1}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={36} />
                ))}
              </Stack>
            ) : activities.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No recent activity yet.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {activities.map((item) => (
                  <Stack key={item.id} direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: '#F3E8FF',
                        color: '#7C3AED',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <HistoryIcon sx={{ fontSize: 15 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2">
                        {item.description || 'Activity logged'}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {item.my_updated_at ||
                          (item.created_at ? dayjs(item.created_at).fromNow() : 'Recently')}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      ) : tab === 'subjects' ? (
        <Stack spacing={1}>
          {subjects.length === 0 ? (
            <Alert severity="info">No subjects assigned this term.</Alert>
          ) : (
            subjects.map((s) => {
              const SubjectIcon = getSubjectIcon(s.subject_name);
              const color = getSubjectColor({ id: s.subject_id });
              return (
                <Stack
                  key={s.id}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
                >
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: 1,
                      bgcolor: color,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <SubjectIcon sx={{ fontSize: 14 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} noWrap>
                      {s.subject_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {s.class_name}
                    </Typography>
                  </Box>
                </Stack>
              );
            })
          )}
        </Stack>
      ) : tab === 'classes' ? (
        <Stack spacing={1}>
          {classes.length === 0 ? (
            <Alert severity="info">Not a class teacher for any arm this term.</Alert>
          ) : (
            classes.map((c) => (
              <Stack
                key={c.id}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
              >
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: 1,
                    bgcolor: '#F3E8FF',
                    color: '#7E22CE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 15 }} />
                </Box>
                <Typography variant="body2" fontWeight={700}>
                  {c.class_name}
                </Typography>
              </Stack>
            ))
          )}
        </Stack>
      ) : tab === 'roles' ? (
        <Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ p: 1.5, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: '#F3E8FF',
                color: '#7E22CE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BadgeIcon sx={{ fontSize: 17 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Role
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
                {profile.role || 'N/A'}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
            <WorkHistoryIcon sx={{ fontSize: 16, color: '#7C3AED' }} />
            <Typography variant="subtitle2" fontWeight={800}>
              Status History
            </Typography>
          </Stack>
          {statusHistoryLoading ? (
            <Stack spacing={1}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={36} />
              ))}
            </Stack>
          ) : !statusHistory || statusHistory.length === 0 ? (
            <Alert severity="info">No status changes recorded yet.</Alert>
          ) : (
            <Stack spacing={1}>
              {statusHistory.map((h) => (
                <Stack
                  key={h.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
                      {h.old_status} → {h.new_status}
                    </Typography>
                    {h.reason && (
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {h.reason}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.disabled">
                    {h.created_at ? dayjs(h.created_at).fromNow() : ''}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </Box>
      ) : tab === 'activity' ? (
        <Stack spacing={1.5}>
          {activitiesLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={36} />
            ))
          ) : activities.length === 0 ? (
            <Alert severity="info">No recent activity yet.</Alert>
          ) : (
            activities.map((item) => (
              <Stack key={item.id} direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: '#F3E8FF',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <HistoryIcon sx={{ fontSize: 15 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2">{item.description || 'Activity logged'}</Typography>
                  <Typography variant="caption" color="text.disabled">
                    {item.my_updated_at ||
                      (item.created_at ? dayjs(item.created_at).fromNow() : 'Recently')}
                  </Typography>
                </Box>
              </Stack>
            ))
          )}
        </Stack>
      ) : scheduleLoading ? (
        <Stack spacing={1}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={40} />
          ))}
        </Stack>
      ) : !schedule ? (
        <Alert severity="info">No timetable data available.</Alert>
      ) : (
        <Box>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <Box sx={{ flex: 1, bgcolor: '#EFF6FF', borderRadius: 1.5, p: 1 }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTimeIcon sx={{ fontSize: 15, color: '#1D4ED8' }} />
                <Typography variant="caption" fontWeight={700} color="#1D4ED8">
                  {schedule.stats?.attendance_rate?.percent ?? 0}% attendance
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ flex: 1, bgcolor: '#F0FDF4', borderRadius: 1.5, p: 1 }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CalendarMonthIcon sx={{ fontSize: 15, color: '#16A34A' }} />
                <Typography variant="caption" fontWeight={700} color="#16A34A">
                  {schedule.stats?.today?.total ?? 0} today
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
            Today's Schedule
          </Typography>
          <Stack spacing={1}>
            {todaysRows.length === 0 ? (
              <Alert severity="info">No classes scheduled today.</Alert>
            ) : (
              todaysRows.map((row) => (
                <Stack
                  key={row.slot_id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      {row.period.start_time?.slice(0, 5)}-{row.period.end_time?.slice(0, 5)}
                    </Typography>
                    <Typography variant="body2" fontWeight={700} noWrap>
                      {row.subject_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {row.class_name}
                    </Typography>
                  </Box>
                </Stack>
              ))
            )}
          </Stack>
        </Box>
      )}

      <ActivityLogModal
        open={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        user={{ user_id: profile?.user_id }}
      />
    </Paper>
  );
};

export default TeacherOverviewPanel;
