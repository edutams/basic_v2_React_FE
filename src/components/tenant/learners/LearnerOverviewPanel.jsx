import { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Stack,
  Button,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  PersonOutline as PersonOutlineIcon,
  Wc as WcIcon,
  School as SchoolIcon,
  Cake as CakeIcon,
  Badge as BadgeIcon,
  CalendarMonth as CalendarMonthIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  Groups as GroupsIcon,
  LocationOn as LocationOnIcon,
  SwapHoriz as SwapHorizIcon,
  PersonAddAlt as PersonAddAltIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { IconUser, IconTrash } from '@tabler/icons-react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import LearnerAcademicsContent from './LearnerAcademicsContent';
import ViewParentsContent from './ViewParentsContent';
import RecentActivityContent from '@/components/tenant/parents/RecentActivityContent';
import learnerApi from '@/api/tenant/learners/learnerApi';

const classArmLabel = (reg) => {
  const arm = reg?.class_arm;
  const armNames = arm?.class_arm_names;
  const armLabel = Array.isArray(armNames) ? armNames.filter(Boolean).join(', ') : armNames || '';
  const className = arm?.programme_class?.class?.class_name || '';
  return [className, armLabel].filter(Boolean).join(' ') || '—';
};

const statusChipStyle = (status) => {
  if (status === 'student') return { bg: 'success.light', color: 'success.dark' };
  if (status === 'graduate') return { bg: 'info.light', color: 'info.dark' };
  return { bg: 'error.light', color: 'error.dark' };
};

/** A colored icon badge + label + value row, matching the mockup's
 * colorful detail list (each row gets its own hue, not a wall of gray). */
const DetailRow = ({ icon: Icon, color, label, children }) => (
  <Stack direction="row" spacing={1.25} alignItems="flex-start">
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
        mt: 0.25,
      }}
    >
      <Icon sx={{ fontSize: 15 }} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.disabled" display="block">
        {label}
      </Typography>
      {children}
    </Box>
  </Stack>
);

/** One of the 4 colorful Quick Actions buttons — icon-over-label, matching
 * the mockup's Assign Class / Link Parent / View Results / Generate Report
 * grid. */
const QuickActionButton = ({ icon: Icon, color, label, onClick, disabled }) => (
  <Stack
    component="button"
    type="button"
    onClick={onClick}
    disabled={disabled}
    alignItems="center"
    spacing={0.5}
    sx={{
      border: 'none',
      bgcolor: 'transparent',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      p: 0.5,
      flex: 1,
    }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '10px',
        bgcolor: `${color}1A`,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon fontSize="small" />
    </Box>
    <Typography variant="caption" fontWeight={600} sx={{ textAlign: 'center' }}>
      {label}
    </Typography>
  </Stack>
);

const QUICK_ACTION_COLOR = { assignClass: '#2563EB', linkParent: '#16A34A', viewResults: '#9333EA', generateReport: '#D97706' };

/** Inline side panel (not an overlay drawer) — sits beside the Learner
 * Manager table, which shrinks to make room for it. Mirrors
 * ParentOverviewPanel's structure/behavior. */
const LearnerOverviewPanel = ({
  onClose,
  learner,
  onEdit,
  onLinkParent,
  onAssignClass,
  onGenerateReport,
  onToggleStatus,
  onDelete,
  onImpersonate,
}) => {
  const [tab, setTab] = useState(0);
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const [primaryGuardian, setPrimaryGuardian] = useState(null);

  useEffect(() => {
    if (!learner?.user_id) return;
    learnerApi
      .getParents(learner.user_id)
      .then((res) => setPrimaryGuardian(res?.data?.data?.[0] ?? null))
      .catch(() => setPrimaryGuardian(null));
  }, [learner?.user_id]);

  if (!learner) return null;

  const user = learner.user;
  const fullName = user ? `${user.fname} ${user.lname}` : 'Learner';
  const initials = user ? `${user.fname?.[0] || ''}${user.lname?.[0] || ''}`.toUpperCase() : '?';
  const statusStyle = statusChipStyle(learner.status);
  const legacyLearner = { users: { id: learner.user_id, fname: user?.fname, lname: user?.lname } };
  const age = user?.dob ? dayjs().diff(dayjs(user.dob), 'year') : null;

  const handleMoreAction = (action) => {
    setMoreAnchorEl(null);
    action(learner);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content',
        maxHeight: 'calc(100vh - 200px)',
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h6" fontWeight={700}>
          Learner Overview
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'error.main' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5, flexShrink: 0 }}>
        <Avatar src={user?.avatar} sx={{ width: 56, height: 56 }}>
          {initials || <PersonOutlineIcon />}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {fullName}
            </Typography>
            <Chip
              label={learner.status}
              size="small"
              sx={{ height: 18, fontSize: '0.65rem', textTransform: 'capitalize', bgcolor: statusStyle.bg, color: statusStyle.color }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {user?.user_id}
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={0.5} sx={{ mb: 2, flexShrink: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <WcIcon sx={{ fontSize: 16, color: '#9333EA' }} />
          <Typography variant="body2">
            {user?.sex ? user.sex.charAt(0).toUpperCase() + user.sex.slice(1) : '—'}
            {age !== null ? ` · ${age} years` : ''}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <SchoolIcon sx={{ fontSize: 16, color: '#2563EB' }} />
          <Typography variant="body2">{classArmLabel(learner.current_registration)}</Typography>
        </Stack>
        {user?.dob && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CakeIcon sx={{ fontSize: 16, color: '#D97706' }} />
            <Typography variant="body2">Date of Birth: {dayjs(user.dob).format('D MMM YYYY')}</Typography>
          </Stack>
        )}
      </Stack>

      <Stack direction="row" spacing={0.75} sx={{ mb: 2, flexShrink: 0 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<IconUser size={14} />}
          onClick={() => onImpersonate(learner)}
          sx={{ flex: 1, fontSize: '0.7rem', py: 0.4, px: 1, minWidth: 0 }}
        >
          Login
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<EditIcon sx={{ fontSize: 14 }} />}
          onClick={() => onEdit(learner)}
          sx={{ flex: 1, fontSize: '0.7rem', py: 0.4, px: 1, minWidth: 0 }}
        >
          Edit
        </Button>
        <Button
          size="small"
          variant="outlined"
          endIcon={<MoreVertIcon sx={{ fontSize: 14 }} />}
          onClick={(e) => setMoreAnchorEl(e.currentTarget)}
          sx={{ fontSize: '0.7rem', py: 0.4, px: 1, minWidth: 0 }}
        >
          More
        </Button>
        <Menu anchorEl={moreAnchorEl} open={Boolean(moreAnchorEl)} onClose={() => setMoreAnchorEl(null)}>
          <MenuItem onClick={() => handleMoreAction(onToggleStatus)}>
            <BadgeIcon fontSize="small" style={{ marginRight: 8 }} />
            {(learner.user?.status ?? 'active') === 'active' ? 'Deactivate Account' : 'Activate Account'}
          </MenuItem>
          <MenuItem onClick={() => handleMoreAction(onDelete)} sx={{ color: 'error.main' }}>
            <IconTrash size={18} style={{ marginRight: 8 }} />
            Delete
          </MenuItem>
        </Menu>
      </Stack>

      <Divider sx={{ flexShrink: 0 }} />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 1.5, minHeight: 36, flexShrink: 0, '& .MuiTab-root': { minHeight: 36, minWidth: 'auto', px: 1.25, fontSize: '0.78rem', whiteSpace: 'nowrap' } }}
      >
        <Tab label="Overview" />
        <Tab label="Academics" />
        <Tab label={`Parent/Guardian (${learner.guardians_count ?? 0})`} />
        <Tab label="Activity" />
      </Tabs>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {tab === 0 && (
          <Stack spacing={1.5}>
            <DetailRow icon={ConfirmationNumberIcon} color="#2563EB" label="Admission Number">
              <Typography variant="body2">{user?.user_id || '—'}</Typography>
            </DetailRow>
            <DetailRow icon={SchoolIcon} color="#16A34A" label="Class / Arm">
              <Typography variant="body2">{classArmLabel(learner.current_registration)}</Typography>
            </DetailRow>
            <DetailRow icon={WcIcon} color="#9333EA" label="Gender">
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {user?.sex || '—'}
              </Typography>
            </DetailRow>
            <DetailRow icon={CalendarMonthIcon} color="#2563EB" label="Enrolment Status">
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {learner.status}
              </Typography>
            </DetailRow>
            {learner.current_registration?.created_at && (
              <DetailRow icon={CalendarMonthIcon} color="#D97706" label="Date of Admission (this term)">
                <Typography variant="body2">{dayjs(learner.current_registration.created_at).format('D MMM YYYY')}</Typography>
              </DetailRow>
            )}
            <DetailRow icon={GroupsIcon} color="#EA580C" label="Parent / Guardian">
              {primaryGuardian ? (
                <>
                  <Typography variant="body2">
                    {primaryGuardian.user?.fname} {primaryGuardian.user?.lname}{' '}
                    {primaryGuardian.relationship && `(${primaryGuardian.relationship.charAt(0).toUpperCase()}${primaryGuardian.relationship.slice(1)})`}
                  </Typography>
                  {primaryGuardian.user?.phone && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <PhoneIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.secondary">{primaryGuardian.user.phone}</Typography>
                    </Stack>
                  )}
                  {primaryGuardian.user?.email && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <EmailIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.secondary">{primaryGuardian.user.email}</Typography>
                    </Stack>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">No parent/guardian linked yet.</Typography>
              )}
            </DetailRow>
            <DetailRow icon={LocationOnIcon} color="#64748B" label="Address">
              <Typography variant="body2">{user?.address || '—'}</Typography>
            </DetailRow>

            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" fontWeight={700}>
              Quick Actions
            </Typography>
            <Stack direction="row" spacing={1}>
              <QuickActionButton icon={SwapHorizIcon} color={QUICK_ACTION_COLOR.assignClass} label="Assign Class" onClick={() => onAssignClass(learner)} disabled={!learner.current_registration} />
              <QuickActionButton icon={PersonAddAltIcon} color={QUICK_ACTION_COLOR.linkParent} label="Link Parent" onClick={() => onLinkParent(learner)} />
              <QuickActionButton icon={AssessmentIcon} color={QUICK_ACTION_COLOR.viewResults} label="View Results" onClick={() => setTab(1)} />
              <QuickActionButton icon={DescriptionIcon} color={QUICK_ACTION_COLOR.generateReport} label="Generate Report" onClick={() => onGenerateReport(learner)} />
            </Stack>
          </Stack>
        )}
        {tab === 1 && <LearnerAcademicsContent learner={learner} />}
        {tab === 2 && (
          <Box>
            <ViewParentsContent learner={legacyLearner} onClose={() => {}} />
            <Button fullWidth size="small" variant="contained" sx={{ mt: 1 }} onClick={() => onLinkParent(learner)}>
              + Link Another Parent
            </Button>
          </Box>
        )}
        {tab === 3 && <RecentActivityContent person={{ user_id: learner.user_id }} />}
      </Box>
    </Paper>
  );
};

LearnerOverviewPanel.propTypes = {
  onClose: PropTypes.func.isRequired,
  learner: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  onLinkParent: PropTypes.func.isRequired,
  onAssignClass: PropTypes.func.isRequired,
  onGenerateReport: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onImpersonate: PropTypes.func.isRequired,
};

export default LearnerOverviewPanel;
