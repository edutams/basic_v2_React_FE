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
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  CancelOutlined as CancelOutlinedIcon,
} from '@mui/icons-material';

const SubjectMatrixTable = ({ subjects, learners, onToggle, onRegisterAll, onUnregisterAll }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
      <Table sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                minWidth: 240,
                fontWeight: 700,
                position: 'sticky',
                left: 0,
                bgcolor: isDark ? '#1e2a3a' : '#f8f9fa',
                zIndex: 2,
                borderRight: '1px solid',
                borderColor: 'divider',
              }}
            >
              Learner's Name
            </TableCell>
            {subjects.map((subj) => (
              <TableCell key={subj.id} align="center" sx={{ minWidth: 140, verticalAlign: 'top', pt: 2 }}>
                <Typography variant="caption" fontWeight={700} sx={{ display: 'block', textTransform: 'uppercase' }}>
                  {subj.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  ({subj.count} learners)
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
                  position: 'sticky',
                  left: 0,
                  bgcolor: 'background.paper',
                  zIndex: 1,
                  borderRight: '1px solid',
                  borderColor: 'divider',
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
