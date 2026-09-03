import React from 'react';
import {
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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelOutlinedIcon,
} from '@mui/icons-material';

const SubjectMatrixTable = ({ subjects, learners, onToggle, onRegisterAll, onUnregisterAll }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const registeredCount = React.useMemo(() => {
    const counts = {};
    subjects.forEach((subj) => {
      counts[subj.id] = learners.filter((l) => l.registered[subj.id]).length;
    });
    return counts;
  }, [subjects, learners]);

  return (
    <TableContainer elevation={0} variant="outlined" sx={{
      borderRadius: 2, overflowX: 'auto', border: (theme) =>
        theme.palette.mode === 'dark'
          ? '1.5px solid rgba(255, 255, 255, 0.15)'
          : '1.5px solid #cbd5e1',
      boxShadow: (theme) =>
        theme.palette.mode === 'dark'
          ? '0 4px 16px rgba(0, 0, 0, 0.35)'
          : '0 4px 16px rgba(15, 23, 42, 0.05)',
    }}>
      <Table sx={{ minWidth: 900 }} stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                minWidth: 240,
                fontWeight: 700,
                ...(!isMobile && { position: 'sticky', left: 0 }),
                // bgcolor: isDark ? '#1e2a3a' : '#f8f9fa',
                ...(!isMobile && { zIndex: 2 }),
                borderBottom: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '2px solid rgba(255, 255, 255, 0.12)'
                    : '2px solid #e2e8f0',

                borderRight: '1px solid',
                borderRight: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '2px solid rgba(255, 255, 255, 0.2)'
                    : '2px solid #cbd5e1',
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
                ...(!isMobile && { position: 'sticky', left: 240 }),
                // bgcolor: isDark ? '#1e2a3a' : '#f8f9fa',
                bgcolor: isDark ? '#1e293b' : '#f8fafc',

                ...(!isMobile && { zIndex: 2 }),
                borderBottom: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '2px solid rgba(255, 255, 255, 0.12)'
                    : '2px solid #e2e8f0',
                borderRight: '1px solid',
                borderColor: 'divider',
              }}
            >
              Registered
            </TableCell>
            {subjects.map((subj) => (
              <TableCell key={subj.id} align="center" sx={{
                minWidth: 140, verticalAlign: 'top', pt: 2,
                bgcolor: isDark ? '#1e293b' : '#f8fafc',
                borderBottom: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '2px solid rgba(255, 255, 255, 0.12)'
                    : '2px solid #e2e8f0',
                borderLeft: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '2px solid rgba(255, 255, 255, 0.2)'
                    : '2px solid #cbd5e1',
              }}>
                <Typography variant="caption" fontWeight={700} sx={{ display: 'block', textTransform: 'uppercase' }}>
                  {subj.subject_name || subj.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  {registeredCount[subj.id]} learner{registeredCount[subj.id] !== 1 ? 's' : ''}
                </Typography>
                <Stack direction="row" spacing={0.5} justifyContent="center">
                  <Tooltip title={`Register all for ${subj.name}`}>
                    <IconButton size="small" onClick={() => onRegisterAll?.(subj.id)}>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`Unregister all for ${subj.name}`}>
                    <IconButton size="small" onClick={() => onUnregisterAll?.(subj.id)}>
                      <CancelOutlinedIcon color="error" fontSize="small" />
                    </IconButton>
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
                  ...(!isMobile && { position: 'sticky', left: 0 }),
                  // bgcolor: 'background.paper',
                  bgcolor: `${isDark ? '#1e293b' : '#f1f4f6'} !important`,
                  ...(!isMobile && { zIndex: 1 }),
                  borderRight: '1px solid',
                  borderRight: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '2px solid rgba(255, 255, 255, 0.2)'
                      : '2px solid #cbd5e1',
                  // borderColor: 'divider',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700, bgcolor: 'primary.main' }}>
                    {idx + 1}
                  </Avatar>
                  <Typography variant="body2" fontWeight={600}>
                    {learner.name}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  ...(!isMobile && { position: 'sticky', left: 240 }),
                  bgcolor: 'background.paper',
                  ...(!isMobile && { zIndex: 1 }),
                  borderRight: '1px solid',
                  borderRight: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '2px solid rgba(255, 255, 255, 0.2)'
                      : '2px solid #cbd5e1',
                  // borderColor: 'divider',
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {Object.keys(learner.registered).filter((k) => learner.registered[k]).length}
                </Typography>
              </TableCell>
              {subjects.map((subj) => (
                <TableCell key={subj.id} align="center">
                  <IconButton size="small" onClick={() => onToggle(learner.id, subj.id)}>
                    {learner.registered[subj.id] ? (
                      <CheckCircleIcon color="success" fontSize="medium" />
                    ) : (
                      <CancelOutlinedIcon color="error" fontSize="medium" />
                    )}
                  </IconButton>
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
