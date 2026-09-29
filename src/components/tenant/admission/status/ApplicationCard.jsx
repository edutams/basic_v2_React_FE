import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Chip, useTheme } from '@mui/material';
import {
  ArrowForwardIos as ArrowForwardIosIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarMonthIcon,
  Groups as GroupsIcon,
  Cake as CakeIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

/**
 * Status → accent color + icon, shared between the left rail, the avatar
 * ring and the "Admission Status" chip so a card reads as one color story
 * at a glance instead of three unrelated ones.
 *
 * Solid hex tokens instead of theme.palette.warning/success/error — the
 * theme's "warning" is a pale gold (#fdc90f) that reads as washed-out for
 * text/icons, so status colors here match the darker, legible set already
 * used across the admin dashboard cards (QuickActions, TopStatCards).
 */
const statusMeta = (rawStatus) => {
  const status = (rawStatus || 'pending').toLowerCase();

  if (status === 'admitted') {
    return { color: '#16a34a', bg: '#dcfce7', label: 'Admitted', icon: CheckCircleIcon };
  }
  if (status === 'declined') {
    return { color: '#dc2626', bg: '#fee2e2', label: 'Declined', icon: CancelIcon };
  }

  return { color: '#d97706', bg: '#fef3c7', label: 'Pending', icon: ScheduleIcon };
};

/**
 * Three-stage progress rail: an application always exists, form submission
 * and the final decision are the two milestones worth surfacing on a card.
 */
const buildStages = (app) => {
  const submitted = app.form_submit_status === 'yes';
  const decided = ['admitted', 'declined'].includes((app.admission_status || '').toLowerCase());

  return [
    { label: 'Application', done: true },
    { label: 'Submitted', done: submitted },
    { label: 'Decision', done: decided },
  ];
};

const InfoRow = ({ icon: Icon, label, value, isDark }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '9px',
        bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
        color: 'text.secondary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon sx={{ fontSize: 16 }} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: 'text.secondary', lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography
        sx={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.3, wordBreak: 'break-word' }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

const StageRail = ({ stages, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5 }}>
    {stages.map((stage, index) => (
      <React.Fragment key={stage.label}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: stage.done ? color : 'action.disabledBackground',
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: stage.done ? color : 'text.disabled',
              whiteSpace: 'nowrap',
            }}
          >
            {stage.label}
          </Typography>
        </Box>
        {index < stages.length - 1 && (
          <Box
            sx={{
              flex: 1,
              height: 2,
              borderRadius: 1,
              bgcolor: stages[index + 1].done ? color : 'action.disabledBackground',
              opacity: stages[index + 1].done ? 0.5 : 1,
              minWidth: 12,
            }}
          />
        )}
      </React.Fragment>
    ))}
  </Box>
);

const ApplicationCard = ({ app }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const isDraft = app.form_submit_status === 'no';
  const meta = statusMeta(app.admission_status);
  const stages = buildStages(app);
  const StatusIcon = meta.icon;

  const goToApplication = () => {
    if (isDraft) {
      navigate('/admission/new-application', {
        state: { ward: app._original || app, resumeApplication: true },
      });
    } else {
      navigate(`/application-tracker/${app.id}`, { state: { admission: app._original || app } });
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
        // Tint the whole card, not just the header, so the details section
        // below doesn't cut abruptly to plain white.
        bgcolor: isDark ? theme.palette.background.paper : `${meta.bg}3D`,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: meta.color,
          boxShadow: '0 10px 24px rgba(15, 23, 42, 0.1)',
        },
      }}
    >
      {/* Status accent rail */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          bgcolor: meta.color,
        }}
      />

      {/* Header — slightly deeper tint than the card body for a touch of depth */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          p: { xs: 2.25, sm: 2.75 },
          pl: { xs: 2.75, sm: 3.25 },
          pb: 2,
          cursor: 'pointer',
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : `${meta.bg}66`,
        }}
        onClick={goToApplication}
      >
        {/* Avatar with status ring */}
        <Box
          sx={{
            width: { xs: 72, sm: 78 },
            height: { xs: 72, sm: 78 },
            flexShrink: 0,
            borderRadius: '50%',
            p: '3px',
            border: '2.5px solid',
            borderColor: meta.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {app.image ? (
              <img
                src={app.image}
                alt={app.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <PersonIcon sx={{ fontSize: 36, color: 'primary.main', opacity: 0.6 }} />
            )}
          </Box>
        </Box>

        {/* Name + status */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                sx={{ lineHeight: 1.25, fontSize: { xs: '1.05rem', sm: '1.15rem' }, wordBreak: 'break-word' }}
              >
                {app.surname} {app.first_name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Form No. {app.applicationNo || '—'}
              </Typography>
            </Box>

            <ArrowForwardIosIcon sx={{ fontSize: 13, color: 'text.disabled', flexShrink: 0, mt: 0.5 }} />
          </Box>

          <Box sx={{ mt: 1 }}>
            <Chip
              icon={<StatusIcon sx={{ fontSize: '14px !important', color: `${meta.color} !important` }} />}
              label={meta.label}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.68rem',
                height: 24,
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                color: meta.color,
                border: '1px solid',
                borderColor: meta.color,
              }}
            />
          </Box>

          <StageRail stages={stages} color={meta.color} />
        </Box>
      </Box>

      {/* Details */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1.75,
          px: { xs: 2.75, sm: 3.25 },
          pb: { xs: 2.25, sm: 2.75 },
          pt: 0.5,
        }}
      >
        <Box sx={{ gridColumn: '1 / -1' }}>
          <InfoRow icon={SchoolIcon} label="INTENDING CLASS" value={app.class || '—'} isDark={isDark} />
        </Box>
        <InfoRow icon={CalendarMonthIcon} label="SESSION" value={app.session || '—'} isDark={isDark} />
        <InfoRow icon={GroupsIcon} label="BATCH" value={app.batch || '—'} isDark={isDark} />
        <Box sx={{ gridColumn: '1 / -1' }}>
          <InfoRow
            icon={CakeIcon}
            label="GENDER / DATE OF BIRTH"
            value={`${app.gender ? app.gender.charAt(0).toUpperCase() + app.gender.slice(1) : 'N/A'} · ${
              app?.dob ? dayjs(app.dob).format('DD MMM YYYY') : 'N/A'
            }`}
            isDark={isDark}
          />
        </Box>
      </Box>

      {/* Continue Application */}
      {isDraft && (
        <Box sx={{ px: { xs: 2.25, sm: 2.75 }, pb: { xs: 2.25, sm: 2.75 } }}>
          <Button
            variant="contained"
            size="small"
            fullWidth
            startIcon={<EditIcon sx={{ fontSize: '16px !important' }} />}
            onClick={(e) => {
              e.stopPropagation();
              navigate('/admission/new-application', {
                state: { ward: app._original || app, resumeApplication: true },
              });
            }}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Continue Application
          </Button>
        </Box>
      )}

      {/* Print Admission Letter */}
      {app.admission_status === 'admitted' && (
        <Box sx={{ px: { xs: 2.25, sm: 2.75 }, pb: { xs: 2.25, sm: 2.75 } }}>
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admission-letter/${app.id}`);
            }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: meta.color,
              '&:hover': { bgcolor: meta.color, opacity: 0.9 },
            }}
          >
            Print Admission Letter
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ApplicationCard;
