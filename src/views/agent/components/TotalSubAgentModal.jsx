import React from 'react';
import {
  Grid,
  Box,
  Typography,
  Stack,
  Select,
  MenuItem,
  Card,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import StandardModal from 'src/components/shared/StandardModal';
import Chart from 'react-apexcharts';
import PrimaryButton from 'src/components/shared/PrimaryButton';
import { IconCash, IconTrendingUp, IconCoins } from '@tabler/icons-react';

const TopCard = ({ label, value, valueColor, iconBg, icon: Icon }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: '12px',
        boxShadow: 'none',
        border: `1px solid ${isDark ? theme.palette.divider : '#f0f0f0'}`,
        bgcolor: isDark ? theme.palette.background.paper : '#fff',
        height: '100%',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '10px',
            bgcolor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={20} color={valueColor} />
        </Box>
        <Box>
          <Typography
            fontWeight={800}
            sx={{ fontSize: '22px', color: valueColor, lineHeight: 1.2 }}
          >
            ₦ {value}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: isDark ? '#aaa' : '#64748B', fontWeight: 500, fontSize: '12px' }}
          >
            {label}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

const SideStatRow = ({ label, value, valueColor, iconBg, icon: Icon }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{
        py: 1.2,
        borderBottom: `1px solid ${isDark ? '#333' : '#f0f0f0'}`,
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          bgcolor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} color={valueColor} />
      </Box>
      <Box>
        <Typography fontWeight={800} sx={{ fontSize: '14px', color: valueColor, lineHeight: 1.2 }}>
          ₦{value}
        </Typography>
        <Typography variant="caption" sx={{ color: isDark ? '#aaa' : '#64748B', fontSize: '11px' }}>
          {label}
        </Typography>
      </Box>
    </Stack>
  );
};

const TotalSubAgentModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const agentData = [
    {
      sn: 1,
      agentName: 'John Doe',
      level: 'Level 1',
      transaction: '₦50,000',
      school: 'ABC School',
    },
    {
      sn: 2,
      agentName: 'Jane Smith',
      level: 'Level 2',
      transaction: '₦75,000',
      school: 'XYZ Academy',
    },
    {
      sn: 3,
      agentName: 'Mike Johnson',
      level: 'Level 1',
      transaction: '₦30,000',
      school: 'DEF High',
    },
    {
      sn: 4,
      agentName: 'Sarah Williams',
      level: 'Level 3',
      transaction: '₦100,000',
      school: 'GHI College',
    },
    {
      sn: 5,
      agentName: 'David Brown',
      level: 'Level 2',
      transaction: '₦45,000',
      school: 'JKL Institute',
    },
  ];

  return (
    <StandardModal
      open={open}
      onClose={onClose}
      title="Total Sub Agents"
      maxWidth="lg"
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
            {agentData.map((agent) => (
              <TableRow key={agent.sn} hover>
                <TableCell>{agent.sn}</TableCell>
                <TableCell>{agent.agentName}</TableCell>
                <TableCell>{agent.level}</TableCell>
                <TableCell>{agent.transaction}</TableCell>
                <TableCell>{agent.school}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </StandardModal>
  );
};

export default TotalSubAgentModal;
