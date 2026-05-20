import React from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Avatar,
  Stack
} from '@mui/material';

const schoolsData = [
  {
    id: 1,
    name: 'Sunnyside International School',
    principal: 'Mrs. Sarah Johnson',
    students: 450,
    revenue: '$12,500',
    status: 'Active',
    logo: '',
  },
  {
    id: 2,
    name: 'Greenwood High',
    principal: 'Mr. David Lee',
    students: 320,
    revenue: '$8,200',
    status: 'Active',
    logo: '',
  },
  {
    id: 3,
    name: 'Oak Ridge Academy',
    principal: 'Ms. Emily Chen',
    students: 180,
    revenue: '$4,500',
    status: 'Pending',
    logo: '',
  },
  {
    id: 4,
    name: 'Maple Leaf Elementary',
    principal: 'Mr. James Wilson',
    students: 550,
    revenue: '$15,100',
    status: 'Active',
    logo: '',
  },
  {
    id: 5,
    name: 'River Valley School',
    principal: 'Mrs. Linda Brown',
    students: 210,
    revenue: '$6,300',
    status: 'Inactive',
    logo: '',
  },
];

const SchoolsTable = () => {
  return (
    <TableContainer component={Paper} elevation={0} variant="outlined">
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2" fontWeight={600}>
                School Name
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight={600}>
                Principal
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight={600}>
                Students
              </Typography>
            </TableCell>
             <TableCell>
              <Typography variant="subtitle2" fontWeight={600}>
                Est. Revenue
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
          {schoolsData.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={row.logo} alt={row.name} variant="rounded" sx={{ width: 40, height: 40 }} />
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                            {row.name}
                        </Typography>
                    </Box>
                </Stack>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                  {row.principal}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                  {row.students}
                </Typography>
              </TableCell>
               <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  {row.revenue}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  sx={{
                    bgcolor:
                      row.status === 'Active'
                        ? (theme) => theme.palette.success.light
                        : row.status === 'Pending'
                        ? (theme) => theme.palette.warning.light
                        : (theme) => theme.palette.error.light,
                    color:
                      row.status === 'Active'
                        ? (theme) => theme.palette.success.main
                        : row.status === 'Pending'
                        ? (theme) => theme.palette.warning.main
                        : (theme) => theme.palette.error.main,
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
    </TableContainer>
  );
};

export default SchoolsTable;
