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
  Container,
  useTheme,
  OutlinedInput,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Grid,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'School' },
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const getStyles = (name, selected, theme) => ({
  fontWeight: selected.includes(name)
    ? theme.typography.fontWeightMedium
    : theme.typography.fontWeightRegular,
});

const filterGroups = [
  { mainLabel: 'Agent', mainOptions: ['Agent A', 'Agent B'] },
  { mainLabel: 'Country', mainOptions: ['Nigeria', 'Ghana'] },
  { mainLabel: 'State', mainOptions: ['Ogun', 'Lagos'] },
  { mainLabel: 'LGA', mainOptions: ['Abeokuta', 'Ijebu-Ode'] },
  // Removed "Name" from this list to handle it separately
];

const SchoolDashboard = () => {
  const theme = useTheme();
  const [filterValues, setFilterValues] = useState({});
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [nameValue, setNameValue] = useState('');

  const handleChange = (key) => (event) => {
    const {
      target: { value },
    } = event;
    setFilterValues((prev) => ({
      ...prev,
      [key]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const schoolSummary = {
    total: 2,
    myRegistered: 2,
    active: 2,
    inactive: 0,
  };

  const tableData = [
    {
      id: 1,
      schoolName: 'Greenwood Elementary',
      schoolUrl: 'greenwood.edu',
      agent: 'Agent A',
      gateway: 'Gateway 1',
      date: '06/15/2025',
      socialLink: 'link1',
      colourScheme: 'Blue',
      status: 'Active',
      action: 'Edit',
    },
    {
      id: 2,
      schoolName: 'Oakridge High',
      schoolUrl: 'oakridge.edu',
      agent: 'Agent B',
      gateway: 'Gateway 2',
      date: '06/10/2025',
      socialLink: 'link2',
      colourScheme: 'Green',
      status: 'Inactive',
      action: 'View',
    },
  ];

  return (
    <Container>
      <Breadcrumb title="School" items={BCrumb} />

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        {[
          { label: 'Total', value: schoolSummary.total },
          { label: 'My Registered', value: schoolSummary.myRegistered },
          { label: 'Active', value: schoolSummary.active },
          { label: 'Inactive', value: schoolSummary.inactive },
        ].map((item) => (
          <Box
            key={item.label}
            sx={{
              bgcolor: '#f8f9fa',
              border: '2px solid #fff',
              borderRadius: 1,
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)',
              p: 3,
              minWidth: '275px',
              height: '120px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                {item.label}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '14px' }}>
                Schools
              </Typography>
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 'bold', fontSize: '48px', color: '#28a745' }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Filter Section */}
      <Box sx={{ mb: 3, bgcolor: '#F5F7FA', p: 2, borderRadius: 1 }}>
        <Grid container spacing={2}>
          {filterGroups.map(({ mainLabel, mainOptions }) => (
            <Grid item size={{ xs: 12, sm: 6, md: 3 }} key={mainLabel}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id={`${mainLabel}-label`}>{mainLabel}</InputLabel>
                <Select
                  labelId={`${mainLabel}-label`}
                  id={`${mainLabel}-select`}
                  multiple
                  value={filterValues[mainLabel] || []}
                  onChange={handleChange(mainLabel)}
                  input={<OutlinedInput label={mainLabel} />}
                  MenuProps={MenuProps}
                  sx={{ bgcolor: 'white' }}
                >
                  {mainOptions.map((option) => (
                    <MenuItem
                      key={option}
                      value={option}
                      style={getStyles(option, filterValues[mainLabel] || [], theme)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}

          {/* Name Filter as Text Input */}
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              sx={{ bgcolor: 'white', mb: 2 }}
            />
          </Grid>

          {/* From Date Picker */}
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <DatePicker
              label="From"
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: { bgcolor: 'white', mb: 2 }
                },
              }}
            />
          </Grid>

          {/* To Date Picker */}
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <DatePicker
              label="To"
              value={toDate}
              onChange={(newValue) => setToDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: { bgcolor: 'white', mb: 2 },
                },
              }}
            />
          </Grid>
        </Grid>
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
  );
};

export default SchoolDashboard;
