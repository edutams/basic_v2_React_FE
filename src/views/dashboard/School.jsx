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
  IconButton,
  Menu,
} from '@mui/material';
import AddSchoolModal from '../../components/add-school/AddSchool';  

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';

import ListIcon from '@mui/icons-material/List';
import AppsIcon from '@mui/icons-material/Apps';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import Pagination from '../../components/pagination/Pagination';



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
];

const SchoolDashboard = () => {
  const theme = useTheme();
  const [filterValues, setFilterValues] = useState({});
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [nameValue, setNameValue] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);


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
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          width: '100%',
          mb: 3,
        }}
      >
        {[
          { label: 'Total', value: schoolSummary.total },
          { label: 'My Registered', value: schoolSummary.myRegistered },
          { label: 'Active', value: schoolSummary.active },
          { label: 'Inactive', value: schoolSummary.inactive },
        ].map((item) => (
          <Paper
            key={item.label}
            elevation={2}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 120,
              height: '100%',
              width: '100%',
              borderRadius: 2,
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
              gap: 2,
            }}
          >
            
            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2 }}>
              <Typography variant="body2" sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                {item.label}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '14px', color: 'text.secondary' }}>
                Schools
              </Typography>
            </Box>
            <Typography
              variant="h2"
              sx={{ fontWeight: 'bold', fontSize: '36px', color: '#28a745', minWidth: 56, textAlign: 'center' }}
            >
              {item.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Filter Section */}
      <Box sx={{ mb: 3, bgcolor: '#F5F7FA', p: 2, borderRadius: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ListIcon sx={{ color: '#b76cc2' }} />
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              All Schools
            </Typography>
          </Box>

          {/* Right dropdown */}
          <Box sx={{ display: 'flex', alignItems: 'center'  }}>
            <IconButton onClick={handleMenuOpen}>
              <AppsIcon sx={{  '&:hover': {
                    bgcolor: '#d1ffe3',
                  }, }} />
              <ArrowDropDownIcon sx={{
                 '&:hover': {
                    bgcolor: '#d1ffe3',
                  },
               }} />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  p: 1,
                  mt: 1,
                  boxShadow: 3,
                  minWidth: 200,
                },
              }}
            >
              <MenuItem
  onClick={() => {
    setOpenRegisterModal(true);
    handleMenuClose();
  }}
  sx={{
    bgcolor: '#e8fff1',
    borderRadius: 1,
    px: 2,
    py: 1.5,
    '&:hover': {
      bgcolor: '#d1ffe3',
    },
  }}
>
  <DescriptionOutlinedIcon fontSize="small" sx={{ mr: 1, color: '#000' }} />
  <Typography variant="body1" sx={{ color: '#000', fontWeight: 500 }}>
    Register New School
  </Typography>
</MenuItem>

            </Menu>
          </Box>
        </Box>

        <Box component="hr" sx={{ mb: 3 }} />

        {/* Filters */}
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

          {/* Name */}
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

          {/* Dates */}
          <Grid itemsize={{ xs: 12, sm: 6, md: 3 }}>
            <DatePicker
              label="From"
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: { bgcolor: 'white', mb: 2 },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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

        {/* Table */}
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

        <Box component="hr" sx={{ mt: 6, mb: 3 }} />
        <Pagination totalItems={100} itemsPerPage={10} />

<AddSchoolModal open={openRegisterModal} onClose={() => setOpenRegisterModal(false)} />

        
      </Box>
    </Container>
  );
};

export default SchoolDashboard;
