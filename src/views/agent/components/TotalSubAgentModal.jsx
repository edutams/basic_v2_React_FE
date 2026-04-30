import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  Chip,
  useTheme,
} from '@mui/material';
import StandardModal from 'src/components/shared/StandardModal';

const TotalSubAgentModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getLevelColors = (level) => {
    const colors = {
      'Level 1': { bg: '#dcfce7', color: '#166534' },
      'Level 2': { bg: '#dbeafe', color: '#1d4ed8' },
      'Level 3': { bg: '#fef3c7', color: '#92400e' },
      'Level 4': { bg: '#fce7f3', color: '#be185d' },
      'Level 5': { bg: '#e0e7ff', color: '#4338ca' },
    };
    return colors[level] || { bg: '#f3f4f6', color: '#4b5563' };
  };

  const agentData = [
    {
      sn: 1,
      agentName: 'John Doe',
      email: 'john@example.com',
      phone: '08012345678',
      level: 'Level 1',
      transaction: '₦50,000',
      school: '10',
    },
    {
      sn: 2,
      agentName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '08023456789',
      level: 'Level 2',
      transaction: '₦75,000',
      school: '20',
    },
    {
      sn: 3,
      agentName: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '08034567890',
      level: 'Level 1',
      transaction: '₦30,000',
      school: '30',
    },
    {
      sn: 4,
      agentName: 'Sarah Williams',
      email: 'sarah@example.com',
      phone: '08045678901',
      level: 'Level 3',
      transaction: '₦100,000',
      school: '20',
    },
    {
      sn: 5,
      agentName: 'David Brown',
      email: 'david@example.com',
      phone: '08056789012',
      level: 'Level 2',
      transaction: '₦45,000',
      school: '10',
    },
  ];

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      title="Total Sub Agents"
      maxWidth="md"
      padding={3}
      dividers={false}
      headerBg={isDark ? theme.palette.background.paper : '#F8FAFC'}
      sx={{ bgcolor: isDark ? theme.palette.background.default : '#fff' }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>S/N</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Agent Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Level</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Transaction</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>School</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agentData.map((agent) => {
              const levelColors = getLevelColors(agent.level);
              return (
                <TableRow key={agent.sn} hover>
                  <TableCell>{agent.sn}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ width: 36, height: 36, fontSize: '14px' }}>
                        {agent.agentName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={600} fontSize="14px">
                          {agent.agentName}
                        </Typography>
                        <Typography fontSize="12px" color="text.secondary">
                          {agent.email}
                        </Typography>
                        <Typography fontSize="12px" color="text.secondary">
                          {agent.phone}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={agent.level}
                      size="small"
                      sx={{
                        bgcolor: levelColors.bg,
                        color: levelColors.color,
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>{agent.transaction}</TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={0}
                      sx={{
                        borderRadius: '6px',
                        overflow: 'hidden',
                        fontWeight: '800',
                        width: 'fit-content',
                      }}
                    >
                      <Box sx={{ px: 1.5, py: 0.5 }}>
                        <Typography variant="subtitle3" fontWeight="800" color="#333333">
                          School
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: 'primary.main', px: 1.5, py: 0.5 }}>
                        <Typography variant="caption" fontWeight="700" sx={{ color: '#fff' }}>
                          {agent.school ?? 0}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </StandardModal>
  );
};

export default TotalSubAgentModal;
