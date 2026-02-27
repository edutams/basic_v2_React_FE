import React from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import DashboardCard from '../../components/shared/DashboardCard';

const transactions = [
  {
    id: 1,
    time: '09:30 AM',
    message: 'New School "Sunnyside Int." added',
    status: 'Success',
    color: 'success'
  },
  {
    id: 2,
    time: '11:00 AM',
    message: 'Message from Agent Michael: "Support needed"',
    status: 'Pending',
    color: 'warning'
  },
  {
    id: 3,
    time: '01:15 PM',
    message: 'Commission Payout Processed',
    status: 'Success',
    color: 'success'
  },
  {
    id: 4,
    time: '03:45 PM',
    message: 'New Downline Registered: Sarah Jenkins',
    status: 'Info',
    color: 'primary'
  },
    {
    id: 5,
    time: '05:00 PM',
    message: 'Weekly Performance Report Generated',
    status: 'Info',
    color: 'primary'
  },
];

const RecentTransactions = () => {
  return (
    <DashboardCard title="Recent Activity & Messages">
        <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
            <Table
            aria-label="simple table"
            sx={{
                whiteSpace: "nowrap",
                mt: 2
            }}
            >
            <TableHead>
                <TableRow>
                <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                    Time
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                    Activity / Message
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                    Status
                    </Typography>
                </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {transactions.map((row) => (
                <TableRow key={row.id}>
                    <TableCell>
                    <Typography
                        variant="subtitle2"
                        fontWeight={400}
                        color="textSecondary"
                    >
                        {row.time}
                    </Typography>
                    </TableCell>
                    <TableCell>
                    <Typography
                        variant="subtitle2"
                        fontWeight={600}
                    >
                        {row.message}
                    </Typography>
                    </TableCell>
                    <TableCell>
                    <Chip
                        sx={{
                        bgcolor: (theme) => theme.palette[row.color].light,
                        color: (theme) => theme.palette[row.color].main,
                        borderRadius: '8px',
                        }}
                        size="small"
                        label={row.status}
                    />
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </Box>
    </DashboardCard>
  );
};

export default RecentTransactions;
