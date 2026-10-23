import React from 'react';
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Stack,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Checkbox,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelOutlinedIcon,
} from '@mui/icons-material';

// API sends gender lowercase ('male'/'female') — case-insensitive check so
// this doesn't silently mis-render if that ever changes casing.
const isMaleGender = (gender) => String(gender || '').toLowerCase() === 'male';

const SubjectMatrixTable = ({
  subjects,
  learners,
  // Per-subject registered-learner counts, keyed by subject id. Passed down
  // from the parent tab and computed over the FULL roster — `learners` here
  // is whatever the search/status filter narrowed down to for the visible
  // rows, so computing counts from it would make each subject's "N
  // learner(s)" caption silently shrink while a filter is active instead of
  // always showing the real total.
  registeredCount,
  // Which subject ids count toward a learner's "Complete"/"Incomplete"
  // Status — the required set (compulsory subjects for the merged Core tab,
  // every listed subject for the Trade tab, since there's no optional
  // concept there).
  requiredSubjectIds = [],
  onToggle,
  onRegisterAll,
  onUnregisterAll,
  onRegisterAllForLearner,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <TableContainer
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflowX: 'auto',
        border: (theme) =>
          theme.palette.mode === 'dark'
            ? '1.5px solid rgba(255, 255, 255, 0.15)'
            : '1.5px solid #cbd5e1',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 4px 16px rgba(0, 0, 0, 0.35)'
            : '0 4px 16px rgba(15, 23, 42, 0.05)',
      }}
    >
      <Table sx={{ minWidth: 900 }} stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                minWidth: 240,
                fontWeight: 700,
                py: 0.5,
                ...(!isMobile && { position: 'sticky', left: 0 }),
                // bgcolor: isDark ? '#1e2a3a' : '#f8f9fa',
                ...(!isMobile && { zIndex: 2 }),
                borderBottom: '2px solid',
                borderRight: '2px solid',

                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
                // borderColor: 'divider',
              }}
            >
              Learner's Name
            </TableCell>
            <TableCell
              align="center"
              sx={{
                minWidth: 100,
                fontWeight: 700,
                py: 0.5,
                ...(!isMobile && { position: 'sticky', left: 240 }),
                // bgcolor: isDark ? '#1e2a3a' : '#f8f9fa',
                bgcolor: isDark ? '#1e293b' : '#f8fafc',

                ...(!isMobile && { zIndex: 2 }),

                borderBottom: '2px solid',
                borderRight: '2px solid',

                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
              }}
            >
              Subjects Registered
            </TableCell>
            <TableCell
              align="center"
              sx={{
                minWidth: 110,
                fontWeight: 700,
                py: 0.5,
                bgcolor: isDark ? '#1e293b' : '#f8fafc',
                borderBottom: '2px solid',
                borderRight: '2px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
              }}
            >
              Status
            </TableCell>
            {subjects.map((subj) => (
              <TableCell
                key={subj.id}
                align="center"
                sx={{
                  minWidth: 140,
                  verticalAlign: 'top',
                  pt: 1.25,
                  pb: 0.5,
                  bgcolor: isDark ? '#1e293b' : '#f8fafc',

                  borderBottom: '2px solid',
                  borderLeft: '1px solid',

                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{ display: 'block', textTransform: 'uppercase' }}
                >
                  {subj.subject_name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.5 }}
                >
                  {registeredCount?.[subj.id] ?? 0} learner{(registeredCount?.[subj.id] ?? 0) !== 1 ? 's' : ''}
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Tooltip title={`Register all learners for ${subj.subject_name}`}>
                    <Stack
                      alignItems="center"
                      spacing={0}
                      onClick={() => onRegisterAll?.(subj.id)}
                      sx={{
                        cursor: 'pointer',
                        px: 0.5,
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <IconButton size="small" sx={{ p: 0.25 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: '0.6rem', lineHeight: 1, color: 'success.main' }}
                      >
                        All
                      </Typography>
                    </Stack>
                  </Tooltip>
                  <Tooltip title={`Unregister all learners from ${subj.subject_name}`}>
                    <Stack
                      alignItems="center"
                      spacing={0}
                      onClick={() => onUnregisterAll?.(subj.id)}
                      sx={{
                        cursor: 'pointer',
                        px: 0.5,
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <IconButton size="small" sx={{ p: 0.25 }}>
                        <CancelOutlinedIcon color="error" fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: '0.6rem', lineHeight: 1, color: 'error.main' }}
                      >
                        None
                      </Typography>
                    </Stack>
                  </Tooltip>
                </Stack>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {learners.map((learner, idx) => (
            <TableRow key={learner.id} hover>
              <TableCell
                sx={{
                  py: 0.5,
                  ...(!isMobile && { position: 'sticky', left: 0 }),
                  // bgcolor: 'background.paper',
                  bgcolor: `${isDark ? '#1e293b' : '#f1f4f6'} !important`,
                  ...(!isMobile && { zIndex: 1 }),
                  borderRight: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '2px solid rgba(255, 255, 255, 0.2)'
                      : '2px solid #e2e8f0',
                  // borderColor: 'divider',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ width: 18, flexShrink: 0, textAlign: 'right' }}
                  >
                    {idx + 1}
                  </Typography>
                  <Avatar
                    src={learner.avatar || undefined}
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: 13,
                      fontWeight: 700,
                      bgcolor: 'primary.main',
                    }}
                  >
                    {(learner.name || '?').charAt(0)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {learner.name}
                      </Typography>
                      {learner.gender && (
                        <Box
                          title={learner.gender}
                          sx={{
                            width: 18,
                            height: 18,
                            borderRadius: '5px',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 700,
                            bgcolor: alpha(
                              isMaleGender(learner.gender)
                                ? theme.palette.primary.main
                                : theme.palette.success.main,
                              isDark ? 0.28 : 0.14,
                            ),
                            color: isMaleGender(learner.gender)
                              ? theme.palette.primary.main
                              : theme.palette.success.main,
                          }}
                        >
                          {isMaleGender(learner.gender) ? 'M' : 'F'}
                        </Box>
                      )}
                    </Stack>
                    {learner.admissionNo && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {learner.admissionNo}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  py: 0.5,
                  ...(!isMobile && { position: 'sticky', left: 240 }),
                  bgcolor: 'background.paper',
                  ...(!isMobile && { zIndex: 1 }),
                  borderRight: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '2px solid rgba(255, 255, 255, 0.2)'
                      : '2px solid #e2e8f0',
                  // borderColor: 'divider',
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {Object.keys(learner.registered).filter((k) => learner.registered[k]).length}/
                  {subjects.length}
                </Typography>
                <Tooltip title={`Register ${learner.name} for every eligible subject`}>
                  <IconButton
                    size="small"
                    sx={{ p: 0.25, mt: 0.25 }}
                    onClick={() => onRegisterAllForLearner?.(learner.id)}
                  >
                    <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  py: 0.5,
                  borderRight: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '2px solid rgba(255, 255, 255, 0.2)'
                      : '2px solid #e2e8f0',
                }}
              >
                {(() => {
                  const isComplete =
                    requiredSubjectIds.length > 0 &&
                    requiredSubjectIds.every((id) => learner.registered[id]);
                  return (
                    <Chip
                      label={isComplete ? 'Complete' : 'Incomplete'}
                      size="small"
                      color={isComplete ? 'success' : 'warning'}
                      sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                    />
                  );
                })()}
              </TableCell>
              {subjects.map((subj) => (
                <TableCell key={subj.id} align="center" sx={{ py: 0.25 }}>
                  <Checkbox
                    size="small"
                    checked={!!learner.registered[subj.id]}
                    onChange={() => onToggle(learner.id, subj.id)}
                    color="success"
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SubjectMatrixTable;
