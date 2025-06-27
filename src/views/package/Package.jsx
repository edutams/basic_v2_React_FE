import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Grid as Grid,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from '../../components/shared/ParentCard';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Package',
  },
];

const Package = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);

  const packages = useMemo(() => [
    { id: 1, name: 'Dashboard', description: 'school portal dashboard', status: 'ACTIVE' },
    { id: 2, name: 'Setup', description: 'package used to setup the school', status: 'ACTIVE' },
    { id: 3, name: 'Admission', description: 'admission package', status: 'ACTIVE' },
    { id: 4, name: 'Digital Class', description: 'digital class package', status: 'ACTIVE' },
    { id: 5, name: 'Forum', description: 'forum (discussion)', status: 'ACTIVE' },
    { id: 6, name: 'Attendance', description: 'attendance package', status: 'ACTIVE' },
    { id: 7, name: 'E-Resources', description: 'e-resource package', status: 'ACTIVE' },
    { id: 8, name: 'Messaging', description: 'messaging package', status: 'ACTIVE' },
    { id: 9, name: 'My Wards', description: 'my ward module', status: 'ACTIVE' },
  ], []);

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg =>
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [packages, searchTerm]);

  const paginatedPackages = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredPackages.slice(start, start + rowsPerPage);
  }, [filteredPackages, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredPackages.length / rowsPerPage);

  return (
    <PageContainer title="Package Page" description="This is the Package page">
      <Box sx={{ mt: 0 }}>
        <Breadcrumb title="Package" items={BCrumb} />
      </Box>
      <Box sx={{ mt: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <ParentCard title="All Packages">
              <TextField 
                label="Name Filter"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              />
              <Paper variant="outlined">
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedPackages.map((pkg, index) => (
                        <TableRow key={pkg.id}>
                          <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                          <TableCell>{pkg.name}</TableCell>
                          <TableCell>{pkg.description}</TableCell>
                          <TableCell>{pkg.status}</TableCell>
                          <TableCell align="center">
                            <IconButton size="small">
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <button onClick={() => setPage(prev => Math.max(prev - 1, 0))} disabled={page === 0}>
                  Previous
                </button>
                <span>{page + 1} of {totalPages}</span>
                <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))} disabled={page === totalPages - 1}>
                  Next
                </button>
              </Box>
            </ParentCard>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ParentCard title="Modules">
              <Box sx={{ p: 2, backgroundColor: '#e3f2fd' }}>
                Here is where you can select, add, edit and manage your package for the existing module of your preference.
              </Box>
            </ParentCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Package;