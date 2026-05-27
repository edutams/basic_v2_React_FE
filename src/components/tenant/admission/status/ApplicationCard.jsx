import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Person as PersonIcon } from '@mui/icons-material';
import dayjs from 'dayjs';


export const statusChipSx = (status) => {
  if (status === 'Admitted') return { bgcolor: 'success.light', color: 'success.dark' };
  if (status === 'Enrolled') return { bgcolor: 'primary.light', color: 'primary.dark' };
  if (status === 'Exam Scheduled') return { bgcolor: 'warning.light', color: 'warning.dark' };
  if (status === 'Incomplete') return { bgcolor: 'error.light', color: 'error.dark' };
  return { bgcolor: 'grey.100', color: 'text.secondary' };
};

const ApplicationCard = ({ app }) => {
  const navigate = useNavigate();

  const isDraft = app.status === 'Incomplete' || app.isDraft;

  const draftStepNames = ['Ward Detail', 'Academic Info', 'Payment', 'Documents', 'Submit'];
  const draftStepName = isDraft ? draftStepNames[app.draftStep ?? 0] : '';

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        height: 300,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          flexGrow: 1,
          gap: 2,
          p: 2,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
          transition: 'background 0.15s',
        }}
        onClick={() => {
          if (isDraft) {
            // Navigate to continue application with resumeApplication flag
            navigate('/admission/new-application', {
              state: { 
                ward: app._original || app,
                resumeApplication: true,
              },
            });
          } else {
            // Navigate to application tracker
            navigate(`/application-tracker/${app.id}`, {
              state: { admission: app._original || app },
            });
          }
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 100,
            flexShrink: 0,
            borderRadius: 2,
            bgcolor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {app.image ? (
            <img
              src={app.image}
              alt={app.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <PersonIcon sx={{ fontSize: 50, color: 'primary.main', opacity: 0.6 }} />
              {/* <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ opacity: 0.7, textAlign: 'center', px: 0.5 }}>
                {app.name?.[0]}
              </Typography> */}
            </Box>
          )}
        </Box>

        {/* Right Side: Details */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            p: 2,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1} mb={1}>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              noWrap
              sx={{ lineHeight: 1.2, fontSize: '1rem' }}
            >
             {app.surname} {app.first_name}
            </Typography>

            <Box sx={{ flexShrink: 0, color: 'text.secondary', mt: -0.5, mr: -0.5 }}>
              {!isDraft && <ArrowBackIcon sx={{ transform: 'rotate(180deg)', fontSize: 20 }} />}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" color="text.secondary">
                Form Number:
              </Typography>
              <Typography
                variant="h6"
                fontWeight={600}
                color="text.primary"
                noWrap
                sx={{ maxWidth: '60%', textAlign: 'right', fontSize: '0.78rem' }}
              >
                {app.applicationNo || '—'}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" color="text.secondary">
                Session:
              </Typography>
              <Typography
                variant="h6"
                fontWeight={600}
                color="text.primary"
                noWrap
                sx={{ maxWidth: '60%', textAlign: 'right', fontSize: '0.78rem' }}
              >
                 {app.session} 
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" color="text.secondary">
                Batch:
              </Typography>
              <Typography
                variant="h6"
                fontWeight={600}
                color="text.primary"
                noWrap
                sx={{ maxWidth: '60%', textAlign: 'right', fontSize: '0.78rem' }}
              >
                {app.batch}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" color="text.secondary">
                Gender / DoB:
              </Typography>
              <Typography
                variant="h6"
                fontWeight={600}
                color="text.primary"
                noWrap
                sx={{ maxWidth: '60%', textAlign: 'right', fontSize: '0.78rem' }}
              >
                {app.gender} / {app?.dob
                              ? dayjs(app.dob).format('DD MMM YYYY')
                              : 'N/A'}
                
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" color="text.secondary">
                Form Submit Status:
              </Typography>
              {(() => {
                const submitted = !isDraft;
                const label = submitted ? 'Submitted' : 'Incomplete';
                const chipSx = submitted
                  ? { bgcolor: 'success.light', color: 'success.dark' }
                  : { bgcolor: 'error.light', color: 'error.dark' };
                return (
                  <Chip
                    label={label}
                    size="small"
                    icon={
                      <Box
                        sx={(theme) => ({
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: submitted
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                          ml: 0.75,
                          boxShadow: `0 0 6px ${submitted ? theme.palette.success.main : theme.palette.error.main}`,
                          animation: 'pulseGlow 2s infinite',
                          '@keyframes pulseGlow': {
                            '0%': { opacity: 0.6, transform: 'scale(0.85)' },
                            '50%': { opacity: 1, transform: 'scale(1.15)' },
                            '100%': { opacity: 0.6, transform: 'scale(0.85)' },
                          },
                        })}
                      />
                    }
                    sx={{ ...chipSx, fontWeight: 700, fontSize: 11, height: 22 }}
                  />
                );
              })()}
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" color="text.secondary">
                Admission Status:
              </Typography>
              {(() => {
                const admissionLabel =
                  app.status === 'Admitted' || app.status === 'Enrolled' ? app.status : 'Pending';
                const isAdmitted = admissionLabel === 'Admitted' || admissionLabel === 'Enrolled';
                const chipSx = isAdmitted
                  ? { bgcolor: 'primary.light', color: 'primary.dark' }
                  : { bgcolor: 'warning.light', color: 'warning.dark' };
                return (
                  <Chip
                    label={admissionLabel}
                    size="small"
                    icon={
                      <Box
                        sx={(theme) => ({
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: isAdmitted
                            ? theme.palette.primary.main
                            : theme.palette.warning.main,
                          ml: 0.75,
                          boxShadow: `0 0 6px ${isAdmitted ? theme.palette.primary.main : theme.palette.warning.main}`,
                          animation: 'pulseGlow 2s infinite',
                          '@keyframes pulseGlow': {
                            '0%': { opacity: 0.6, transform: 'scale(0.85)' },
                            '50%': { opacity: 1, transform: 'scale(1.15)' },
                            '100%': { opacity: 0.6, transform: 'scale(0.85)' },
                          },
                        })}
                      />
                    }
                    sx={{ ...chipSx, fontWeight: 700, fontSize: 11, height: 22 }}
                  />
                );
              })()}
            </Box>
          </Box>
        </Box>
      </Box>

      {isDraft && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            variant="contained"
            size="small"
            fullWidth
            endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Continue Application
          </Button>
        </Box>
      )}

      {(app.status === 'Admitted' || app.status === 'Enrolled') && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();

              // navigate or print logic here
              navigate(`/admission-letter/${app.id}`);
            }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
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
