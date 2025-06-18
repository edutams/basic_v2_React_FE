import React, { useState } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Stack,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Container,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const SchoolDashboard = () => {
  // Hardcoded school summary data
  const schoolSummary = {
    total: 2,
    myRegistered: 2,
    active: 2,
    inactive: 0
  };

  // State for filter inputs
  const [filters, setFilters] = useState({
    agent: '',
    country: '',
    state: '',
    lga: '',
    name: '',
    dateFrom: null,
    dateTo: null,
  });

  // Hardcoded table data (example)
  const tableData = [
    { id: 1, schoolName: 'Greenwood Elementary', schoolUrl: 'greenwood.edu', agent: 'Agent A', gateway: 'Gateway 1', date: '06/15/2025', socialLink: 'link1', colourScheme: 'Blue', status: 'Active', action: 'Edit' },
    { id: 2, schoolName: 'Oakridge High', schoolUrl: 'oakridge.edu', agent: 'Agent B', gateway: 'Gateway 2', date: '06/10/2025', socialLink: 'link2', colourScheme: 'Green', status: 'Inactive', action: 'View' },
  ];

  // Handle filter changes
  const handleFilterChange = (field) => (event) => {
    setFilters({ ...filters, [field]: event.target.value });
  };

  const handleDateChange = (field) => (date) => {
    setFilters({ ...filters, [field]: date });
  };

  return (
    <>
    <Container>
      {/* School Summary Section */}
      <Box sx={{ width: '100%', display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{
          bgcolor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: 2,
          p: 3,
          minWidth: '200px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '120px'
        }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px', fontWeight: 500 }}>
              Total
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>
              Schools
            </Typography>
          </Box>
          <Typography variant="h2" sx={{ color: '#28a745', fontWeight: 'bold', fontSize: '48px' }}>
            {schoolSummary.total}
          </Typography>
        </Box>

        <Box sx={{
          bgcolor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: 2,
          p: 3,
          minWidth: '200px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '120px'
        }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px', fontWeight: 500 }}>
              My Registered
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>
              Schools
            </Typography>
          </Box>
          <Typography variant="h2" sx={{ color: '#28a745', fontWeight: 'bold', fontSize: '48px' }}>
            {schoolSummary.myRegistered}
          </Typography>
        </Box>

        <Box sx={{
          bgcolor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: 2,
          p: 3,
          minWidth: '200px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '120px'
        }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px', fontWeight: 500 }}>
              Active
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>
              Schools
            </Typography>
          </Box>
          <Typography variant="h2" sx={{ color: '#28a745', fontWeight: 'bold', fontSize: '48px' }}>
            {schoolSummary.active}
          </Typography>
        </Box>

        <Box sx={{
          bgcolor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: 2,
          p: 3,
          minWidth: '200px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '120px'
        }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px', fontWeight: 500 }}>
              Inactive
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>
              Schools
            </Typography>
          </Box>
          <Typography variant="h2" sx={{ color: '#28a745', fontWeight: 'bold', fontSize: '48px' }}>
            {schoolSummary.inactive}
          </Typography>
        </Box>
      </Box>

      {/* Filter Section */}
      <Box sx={{ mb: 3, bgcolor: '#F5F7FA', p: 2, borderRadius: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Typography variant="h6" color="text.secondary">All Schools</Typography>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Select
            value={filters.agent}
            onChange={handleFilterChange('agent')}
            displayEmpty
            renderValue={(value) => value || 'Agent'}
            sx={{ minWidth: 120, bgcolor: 'white' }}
          >
            <MenuItem value="">
              <span style={{ display: 'block', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}>All Agents</span>
            </MenuItem>
            <MenuItem value="Agent A">
              <span style={{ display: 'block', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}>Agent A</span>
            </MenuItem>
            <MenuItem value="Agent B">
              <span style={{ display: 'block', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}>Agent B</span>
            </MenuItem>
          </Select>
          <Select
            value={filters.country}
            onChange={handleFilterChange('country')}
            displayEmpty
            renderValue={(value) => value || 'Country'}
            sx={{ minWidth: 120, bgcolor: 'white' }}
          >
            <MenuItem value="">
              <span style={{ display: 'block', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}>All Countries</span>
            </MenuItem>
            <MenuItem value="USA">
              <span style={{ display: 'block', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}>USA</span>
            </MenuItem>
            <MenuItem value="UK">
              <span style={{ display: 'block', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}>UK</span>
            </MenuItem>
          </Select>
          <Select
            value={filters.state}
            onChange={handleFilterChange('state')}
            displayEmpty
            renderValue={(value) => value || 'State'}
            sx={{ minWidth: 120, bgcolor: 'white' }}
          >
            <MenuItem value="">
              <span style={{ display: 'block', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}>All States</span>
            </MenuItem>
            <MenuItem value="California">
              <span style={{ display: 'block', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}>California</span>
            </MenuItem>
            <MenuItem value="Texas">
              <span style={{ display: 'block', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}>Texas</span>
            </MenuItem>
          </Select>
          <Select
            value={filters.lga}
            onChange={handleFilterChange('lga')}
            displayEmpty
            renderValue={(value) => value || 'Lga'}
            sx={{ minWidth: 120, bgcolor: 'white' }}
          >
            <MenuItem value="">
              <span style={{ display: 'block', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}>All LGAs</span>
            </MenuItem>
            <MenuItem value="LGA1">
              <span style={{ display: 'block', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}>LGA1</span>
            </MenuItem>
            <MenuItem value="LGA2">
              <span style={{ display: 'block', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}>LGA2</span>
            </MenuItem>
          </Select>
          <TextField
            value={filters.name}
            onChange={handleFilterChange('name')}
            placeholder="Name"
            variant="outlined"
            sx={{ minWidth: 200, bgcolor: 'white' }}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={filters.dateFrom}
              onChange={handleDateChange('dateFrom')}
              renderInput={(params) => <TextField {...params} placeholder="From mm/dd/yyyy" sx={{ minWidth: 150, bgcolor: 'white' }} />}
            />
            <DatePicker
              value={filters.dateTo}
              onChange={handleDateChange('dateTo')}
              renderInput={(params) => <TextField {...params} placeholder="To mm/dd/yyyy" sx={{ minWidth: 150, bgcolor: 'white' }} />}
            />
          </LocalizationProvider>
        </Stack>
      </Box>

      {/* Table Section */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>School Name</TableCell>
              <TableCell>School Url</TableCell>
              <TableCell>Agent</TableCell>
              <TableCell>Gateway</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Social Link</TableCell>
              <TableCell>Colour Scheme</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.schoolName}</TableCell>
                <TableCell>{row.schoolUrl}</TableCell>
                <TableCell>{row.agent}</TableCell>
                <TableCell>{row.gateway}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.socialLink}</TableCell>
                <TableCell>{row.colourScheme}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.action}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </Container>
    </>
  );
};

export default SchoolDashboard;