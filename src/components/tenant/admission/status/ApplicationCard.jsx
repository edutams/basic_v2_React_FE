import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Person as PersonIcon } from '@mui/icons-material';
import dayjs from 'dayjs';

export const statusChipSx = (status) => {
  if (status === 'Admitted') {
    return {
      bgcolor: 'success.light',
      color: 'success.dark',
    };
  }

  if (status === 'Enrolled') {
    return {
      bgcolor: 'primary.light',
      color: 'primary.dark',
    };
  }

  if (status === 'Exam Scheduled') {
    return {
      bgcolor: 'warning.light',
      color: 'warning.dark',
    };
  }

  if (status === 'Incomplete') {
    return {
      bgcolor: 'error.light',
      color: 'error.dark',
    };
  }

  return {
    bgcolor: 'grey.100',
    color: 'text.secondary',
  };
};

const ApplicationCard = ({ app }) => {
  const navigate = useNavigate();

  const isDraft = app.form_submit_status === 'no';

  const renderAnimatedDot = (themeColor) => (
    <Box
      sx={(theme) => ({
        width: 6,
        height: 6,
        borderRadius: '50%',
        bgcolor: theme.palette[themeColor].main,
        ml: 0.75,
        boxShadow: `0 0 6px ${theme.palette[themeColor].main}`,
        animation: 'pulseGlow 2s infinite',

        '@keyframes pulseGlow': {
          '0%': {
            opacity: 0.6,
            transform: 'scale(0.85)',
          },
          '50%': {
            opacity: 1,
            transform: 'scale(1.15)',
          },
          '100%': {
            opacity: 0.6,
            transform: 'scale(0.85)',
          },
        },
      })}
    />
  );

  const detailRow = (label, value) => (
    <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontSize: { xs: '0.75rem', sm: '0.85rem' },
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={600}
        color="text.primary"
        sx={{
          textAlign: 'right',
          fontSize: { xs: '0.75rem', sm: '0.85rem' },
          wordBreak: 'break-word',
        }}
      >
        {value}
      </Typography>
    </Box>
  );

  return (
    <Paper
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        minHeight: { xs: 'auto', md: 300 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          p: { xs: 1.5, sm: 2 },
          flexGrow: 1,
          cursor: 'pointer',

          '&:hover': {
            bgcolor: 'action.hover',
          },

          transition: 'background 0.15s',
        }}
        onClick={() => {
          if (isDraft) {
            navigate('/admission/new-application', {
              state: {
                ward: app._original || app,
                resumeApplication: true,
              },
            });
          } else {
            navigate(`/application-tracker/${app.id}`, {
              state: {
                admission: app._original || app,
              },
            });
          }
        }}
      >
        {/* Image */}
        <Box
          sx={{
            width: { xs: '100%', sm: 90 },
            height: { xs: 220, sm: 110 },
            flexShrink: 0,
            borderRadius: 2,
            bgcolor: 'primary.light',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {app.image ? (
            <img
              src={app.image}
              alt={app.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <PersonIcon
                sx={{
                  fontSize: { xs: 70, sm: 50 },
                  color: 'primary.main',
                  opacity: 0.6,
                }}
              />
            </Box>
          )}
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            width: '100%',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 0, sm: 1 },
          }}
        >
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            gap={1}
            mb={1.5}
          >
            <Typography
              variant="subtitle1"
              fontWeight={800}
              sx={{
                lineHeight: 1.2,
                fontSize: { xs: '1rem', sm: '1.05rem' },
                wordBreak: 'break-word',
              }}
            >
              {app.surname} {app.first_name}
            </Typography>

            {!isDraft && (
              <Box
                sx={{
                  flexShrink: 0,
                  color: 'text.secondary',
                }}
              >
                <ArrowBackIcon
                  sx={{
                    transform: 'rotate(180deg)',
                    fontSize: 20,
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Details */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.2,
            }}
          >
            {detailRow('Form Number:', app.applicationNo || '—')}

            {detailRow('Session:', app.session || '—')}

            {detailRow('Batch:', app.batch || '—')}

            {detailRow(
              'Gender / DoB:',
              `${app.gender || 'N/A'} / ${app?.dob ? dayjs(app.dob).format('DD MMM YYYY') : 'N/A'}`,
            )}

            {/* Form Submit Status */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                }}
              >
                Form Submit Status:
              </Typography>

              {(() => {
                const submitted = app.form_submit_status === 'yes';

                const label = submitted ? 'Submitted' : 'Incomplete';

                const chipSx = submitted
                  ? {
                      bgcolor: 'success.light',
                      color: 'success.dark',
                    }
                  : {
                      bgcolor: 'error.light',
                      color: 'error.dark',
                    };

                return (
                  <Chip
                    label={label}
                    size="small"
                    icon={renderAnimatedDot(submitted ? 'success' : 'error')}
                    sx={{
                      ...chipSx,
                      fontWeight: 700,
                      fontSize: { xs: 10, sm: 11 },
                      height: { xs: 20, sm: 22 },
                    }}
                  />
                );
              })()}
            </Box>

            {/* Admission Status */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                }}
              >
                Admission Status:
              </Typography>

              {(() => {
                const rawStatus = (app.admission_status || 'pending').toLowerCase();

                const admissionLabel = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

                let chipSx = {
                  bgcolor: 'warning.light',
                  color: 'warning.dark',
                };

                let themeColor = 'warning';

                if (rawStatus === 'admitted') {
                  chipSx = {
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                  };

                  themeColor = 'primary';
                } else if (rawStatus === 'declined') {
                  chipSx = {
                    bgcolor: 'error.light',
                    color: 'error.dark',
                  };

                  themeColor = 'error';
                }

                return (
                  <Chip
                    label={admissionLabel}
                    size="small"
                    icon={renderAnimatedDot(themeColor)}
                    sx={{
                      ...chipSx,
                      fontWeight: 700,
                      fontSize: { xs: 10, sm: 11 },
                      height: { xs: 20, sm: 22 },
                    }}
                  />
                );
              })()}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Continue Application */}
      {isDraft && (
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            pb: { xs: 1.5, sm: 2 },
          }}
        >
          <Button
            size="small"
            fullWidth
            endIcon={
              <ArrowBackIcon
                sx={{
                  transform: 'rotate(180deg)',
                }}
              />
            }
            onClick={() =>
              navigate('/admission/new-application', {
                state: {
                  ward: app._original || app,
                  resumeApplication: true,
                },
              })
            }
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

      {/* Print Admission Letter */}
      {app.admission_status === 'admitted' && (
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            pb: { xs: 1.5, sm: 2 },
          }}
        >
          <Button
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
