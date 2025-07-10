import React, { useState, useEffect } from 'react';
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
  Stack,
  TextField,
  IconButton,
  Menu,
  Button,
  TableFooter,
  TablePagination,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';
import { IconSchool, IconUserPlus, IconCheck, IconX } from '@tabler/icons-react';
import ReusableModal from '../../components/shared/ReusableModal';
import RegisterSchoolForm from '../../components/add-school/component/RegisterSchool';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ListIcon from '@mui/icons-material/List';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ManageTenantDomain from '../../components/add-school/component/ManageSchoolDomain';
import ManageSchoolGateway from '../../components/add-school/component/ManageSchoolGateway';
import ChangeAgent from '../../components/add-school/component/ChangeAgent';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import BlankCard from '../../components/shared/BlankCard';
import ChangeColorScheme from '../../components/add-school/component/ChangeColorScheme';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'School' }];
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

const lgaData = {
  Ogun: [
    'Abeokuta North',
    'Abeokuta South',
    'Ado-Odo/Ota',
    'Ewekoro',
    'Ifo',
    'Ijebu East',
    'Ijebu North',
    'Ijebu North East',
    'Ijebu Ode',
    'Ikenne',
    'Imeko Afon',
    'Ipokia',
    'Obafemi Owode',
    'Odeda',
    'Odogbolu',
    'Ogun Waterside',
    'Remo North',
    'Sagamu',
    'Yewa North',
    'Yewa South',
  ],
  Lagos: [
    'Agege',
    'Ajeromi-Ifelodun',
    'Alimosho',
    'Amuwo-Odofin',
    'Apapa',
    'Badagry',
    'Epe',
    'Eti Osa',
    'Ibeju-Lekki',
    'Ifako-Ijaiye',
    'Ikeja',
    'Ikorodu',
    'Kosofe',
    'Lagos Island',
    'Lagos Mainland',
    'Mushin',
    'Ojo',
    'Oshodi-Isolo',
    'Shomolu',
    'Surulere',
  ],
};

const SchoolDashboard = () => {
  const theme = useTheme();
  const [filterValues, setFilterValues] = useState({});
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [nameValue, setNameValue] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [schoolList, setSchoolList] = useState([]);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editSchoolData, setEditSchoolData] = useState(null);
  const [openTenantModal, setOpenTenantModal] = useState(false);
  const [selectedTenantDomain, setSelectedTenantDomain] = useState(null);
  const [openGatewayModal, setOpenGatewayModal] = useState(false);
  const [openAgentModal, setOpenAgentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [agentList] = useState([
    { label: 'Crownbirth - Crownbirth Limited', value: 'crownbirth' },
    { label: 'Agent B', value: 'agentB' },
  ]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [schoolToDeactivate, setSchoolToDeactivate] = useState(null);
  const [openClear2FAConfirm, setOpenClear2FAConfirm] = useState(false);
  const [selectedSchoolFor2FA, setSelectedSchoolFor2FA] = useState(null);
  const [openFixImageConfirm, setOpenFixImageConfirm] = useState(false);
  const [lgaOptions, setLgaOptions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openColorSchemeModal, setOpenColorSchemeModal] = useState(false);
  const [selectedSchoolForColor, setSelectedSchoolForColor] = useState(null);

  const [filterGroups, setFilterGroups] = useState([
    { mainLabel: 'Agent', mainOptions: ['Agent A', 'Agent B'] },
    { mainLabel: 'Country', mainOptions: ['Nigeria', 'Ghana'] },
    { mainLabel: 'State', mainOptions: ['Ogun', 'Lagos'] },
    { mainLabel: 'LGA', mainOptions: [] },
  ]);

  const handleFixImage = () => {
    setOpenFixImageConfirm(false);
  };

  const handleActionClick = (event, rowId) => {
    setActionAnchorEl(event.currentTarget);
    setActiveRow(rowId);
  };

  const handleOpen = () => setOpenRegisterModal(true);
  const handleClose = () => {
    setOpenRegisterModal(false);
    setOpenEditModal(false);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setActiveRow(null);
  };

  const handleDeleteTerm = () => {
    if (termToDelete) {
      setTerms((prev) => prev.filter((t) => t.id !== termToDelete.id));
      setOpenDeleteDialog(false);
      setSnackbarMessage('Term deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    const savedList = localStorage.getItem('schoolList');
    const savedFilters = localStorage.getItem('schoolFilters');
    const savedPage = localStorage.getItem('currentPage');

    if (savedList) {
      setSchoolList(JSON.parse(savedList));
    } else {
      const initialSchools = [
        {
          id: 1,
          institutionName: 'Test School 1',
          schoolUrl: 'test1.com',
          agent: 'Agent A',
          gateway: 'Gateway 1',
          date: '2025-01-01',
          socialLink: 'social1.com',
          colourScheme: 'Blue',
          status: 'Active',
          State: 'Ogun',
          LGA: 'Abeokuta',
        },
        {
          id: 2,
          institutionName: 'Test School 2',
          schoolUrl: 'test2.com',
          agent: 'Agent B',
          gateway: 'Gateway 2',
          date: '2025-02-01',
          socialLink: 'social2.com',
          colourScheme: 'Red',
          status: 'Inactive',
          State: 'Lagos',
          LGA: 'Ikeja',
        },
      ];
      setSchoolList(initialSchools);
      localStorage.setItem('schoolList', JSON.stringify(initialSchools));
    }

    if (savedFilters) {
      const { filterValues, nameValue, fromDate, toDate } = JSON.parse(savedFilters);
      setFilterValues(filterValues || {});
      setNameValue(nameValue || '');
      setFromDate(fromDate ? dayjs(fromDate) : null);
      setToDate(toDate ? dayjs(toDate) : null);
      if (filterValues?.State) {
        setLgaOptions(lgaData[filterValues.State] || []);
      }
    }

    if (savedPage) setPage(parseInt(savedPage, 10));
  }, []);

  useEffect(() => {
    setFilterGroups((prev) =>
      prev.map((group) =>
        group.mainLabel === 'LGA' ? { ...group, mainOptions: lgaOptions } : group,
      ),
    );
  }, [lgaOptions]);

  useEffect(() => {
    localStorage.setItem('schoolList', JSON.stringify(schoolList));
  }, [schoolList]);

  useEffect(() => {
    localStorage.setItem(
      'schoolFilters',
      JSON.stringify({ filterValues, nameValue, fromDate, toDate }),
    );
  }, [filterValues, nameValue, fromDate, toDate]);

  useEffect(() => {
    localStorage.setItem('currentPage', page);
  }, [page]);

  const handleChange = (key) => (event) => {
    const value = event.target.value;

    setFilterValues((prev) => {
      const newFilters = { ...prev, [key]: value };
      if (key === 'State') {
        delete newFilters['LGA'];
        const lgas = lgaData[value] || [];
        setLgaOptions(lgas);
      }
      return newFilters;
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = (newSchool) => {
    setSchoolList((prevList) => {
      const existingIndex = prevList.findIndex((s) => s.id === newSchool.id);
      if (existingIndex !== -1) {
        const updatedList = [...prevList];
        updatedList[existingIndex] = newSchool;
        return updatedList;
      }
      return [...prevList, newSchool];
    });
    handleClose(); // Close the modal after saving
    setSnackbarMessage('School saved successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleDeactivateSchool = (school) => {
    setSchoolList((prevList) =>
      prevList.map((s) => (s.id === school.id ? { ...s, status: 'Inactive' } : s)),
    );
    setOpenDeactivateDialog(false);
  };

  const filteredSchools = schoolList.filter((school) => {
    const matchesName = nameValue
      ? school.institutionName?.toLowerCase().includes(nameValue.toLowerCase())
      : true;

    const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
      return !value || school[key] === value;
    });

    const matchesDateRange =
      (!fromDate || dayjs(school.date).isAfter(fromDate.subtract(1, 'day'))) &&
      (!toDate || dayjs(school.date).isBefore(toDate.add(1, 'day')));

    return matchesName && matchesFilters && matchesDateRange;
  });

  const paginatedSchools = filteredSchools.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const schoolSummary = {
    total: schoolList.length,
    myRegistered: schoolList.length,
    active: schoolList.filter((s) => s.status === 'Active').length,
    inactive: schoolList.filter((s) => s.status === 'Inactive').length,
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Breadcrumb title="School" items={BCrumb} />
       <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  md: 'repeat(4, 1fr)',
                },
                gap: 2,
                width: '100%',
                mb: 3,
              }}
            >
              {[
                {
                  label: 'Total',
                  value: schoolSummary.total,
                  bg: 'primary',
                  icon: <IconSchool width={22} color="#fff" />,
                },
                {
                  label: 'My Registered',
                  value: schoolSummary.myRegistered,
                  bg: 'secondary',
                  icon: <IconUserPlus width={22} color="#fff" />,
                },
                {
                  label: 'Active',
                  value: schoolSummary.active,
                  bg: 'success',
                  icon: <IconCheck width={22} color="#fff" />,
                },
                {
                  label: 'Inactive',
                  value: schoolSummary.inactive,
                  bg: 'warning',
                  icon: <IconX width={22} color="#fff" />,
                },
              ].map((item, index) => (
                <Paper
                  key={index}
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
                    px: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Box
                      width={38}
                      height={38}
                      bgcolor={`${item.bg}.main`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius={1}
                    >
                      {item.icon}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {item.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: '14px', color: 'text.secondary' }}
                      >
                        Schools
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '36px',
                      color: '#28a745',
                      minWidth: 56,
                      textAlign: 'center',
                    }}
                  >
                    {item.value}
                  </Typography>
                </Paper>
              ))}
            </Box>
      <BlankCard>
        <TableContainer>
          <Box sx={{ mb: 3, bgcolor: '#F5F7FA', p: 2, borderRadius: 1 }}>
           

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Typography variant="h5">All School</Typography>
              <Button variant="contained" color="primary" onClick={handleOpen}>
                Register New School
              </Button>
            </Box>

            <Box component="hr" sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              {filterGroups.map(({ mainLabel, mainOptions }) => (
                <Grid item size={{ xs: 12, sm: 6, md: 3 }} key={mainLabel}>
                  <FormControl fullWidth sx={{ mb: 1 }}>
                    <InputLabel id={`${mainLabel}-label`}>{mainLabel}</InputLabel>
                    <Select
                      labelId={`${mainLabel}-label`}
                      id={`${mainLabel}-select`}
                      value={filterValues[mainLabel] || ''}
                      onChange={handleChange(mainLabel)}
                      input={<OutlinedInput label={mainLabel} />}
                      MenuProps={MenuProps}
                      sx={{
                        bgcolor: 'white',
                        height: 56,
                        '& .MuiOutlinedInput-input': {
                          boxSizing: 'border-box',
                          padding: '16.5px 14px',
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {mainOptions.map((option) => (
                        <MenuItem
                          key={option}
                          value={option}
                          style={getStyles(option, [filterValues[mainLabel] || ''], theme)}
                        >
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              ))}

              <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Name"
                  variant="outlined"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  sx={{
                    bgcolor: 'white',
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                      boxSizing: 'border-box',
                    },
                  }}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label="From"
                  value={fromDate}
                  onChange={(newValue) => setFromDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      sx: {
                        bgcolor: 'white',
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          minHeight: 40,
                          height: 40,
                          boxSizing: 'border-box',
                          alignItems: 'center',
                        },
                        '& .MuiInputBase-input': {
                          minHeight: 40,
                          height: 40,
                          padding: '10.5px 14px',
                          boxSizing: 'border-box',
                          display: 'flex',
                          alignItems: 'center',
                        },
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label="To"
                  value={toDate}
                  onChange={(newValue) => setToDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      sx: {
                        bgcolor: 'white',
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          minHeight: 40,
                          height: 40,
                          boxSizing: 'border-box',
                          alignItems: 'center',
                        },
                        '& .MuiInputBase-input': {
                          minHeight: 40,
                          height: 40,
                          padding: '10.5px 14px',
                          boxSizing: 'border-box',
                          display: 'flex',
                          alignItems: 'center',
                        },
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>S/N</TableCell>
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
                  {paginatedSchools.length > 0 ? (
                    paginatedSchools.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.institutionName}</TableCell>
                        <TableCell>{row.schoolUrl || '-'}</TableCell>
                        <TableCell>{row.agent || '-'}</TableCell>
                        <TableCell>{row.gateway}</TableCell>
                        <TableCell>{dayjs(row.date).format('MM/DD/YYYY')}</TableCell>
                        <TableCell>{row.socialLink || '-'}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              width: 40,
                              height: 30,
                              borderRadius: '5px',
                              overflow: 'hidden',
                            }}
                            title={`Header: ${row.headerColor || '#1976d2'} | Sidebar: ${row.sidebarColor || '#2196f3'} | Body: ${row.bodyColor || row.colourScheme || '#f5f5f5'}`}
                          >
                            <Box
                              sx={{
                                width: '100%',
                                height: '30%',
                                backgroundColor: row.headerColor || '#1976d2',
                                borderRadius: 0,
                              }}
                            />
                            <Box sx={{ display: 'flex', height: '70%' }}>
                              <Box
                                sx={{
                                  width: '50%',
                                  height: '100%',
                                  backgroundColor: row.sidebarColor || '#2196f3',
                                  borderRadius: 0,
                                }}
                              />
                              <Box
                                sx={{
                                  width: '50%',
                                  height: '100%',
                                  backgroundColor: row.bodyColor || row.colourScheme || '#f5f5f5',
                                  borderRadius: 0,
                                }}
                              />
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            sx={{
                              bgcolor:
                                row.status === 'Active'
                                  ? (theme) => theme.palette.success.light
                                  : (theme) => theme.palette.primary.light,
                              color:
                                row.status === 'Active'
                                  ? (theme) => theme.palette.success.main
                                  : (theme) => theme.palette.primary.main,
                              borderRadius: '8px',
                            }}
                            size="small"
                            label={row.status || 'Unknown'}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={(e) => handleActionClick(e, row.id)}>
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={actionAnchorEl}
                            open={Boolean(actionAnchorEl) && activeRow === row.id}
                            onClose={handleActionClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            PaperProps={{ sx: { minWidth: 120, boxShadow: 3 } }}
                          >
                            <MenuItem
                              onClick={() => {
                                const selectedSchool = schoolList.find((s) => s.id === row.id);
                                setSelectedTenantDomain(selectedSchool?.schoolUrl || '');
                                setOpenTenantModal(true);
                                handleActionClose();
                              }}
                            >
                              Manage School Domain
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                const selectedSchool = schoolList.find((s) => s.id === row.id);
                                setSelectedTenantDomain(selectedSchool?.schoolUrl || '');
                                setOpenGatewayModal(true);
                                handleActionClose();
                              }}
                            >
                              Manage School Gateway
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setOpenAgentModal(true);
                                handleActionClose();
                              }}
                            >
                              Change Agent
                            </MenuItem>
                            <MenuItem onClick={handleActionClose}>View School</MenuItem>
                            <MenuItem
                              onClick={() => {
                                setSelectedSchoolFor2FA(row);
                                setOpenClear2FAConfirm(true);
                                handleActionClose();
                              }}
                            >
                              Clear 2fa Setting
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setOpenFixImageConfirm(true);
                                handleActionClose();
                              }}
                            >
                              Fix User Images
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setEditSchoolData(row);
                                setOpenEditModal(true);
                                handleActionClose();
                              }}
                            >
                              Edit School Details
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                setSchoolToDeactivate(row);
                                setOpenDeactivateDialog(true);
                                handleActionClose();
                              }}
                            >
                              Deactivate School
                            </MenuItem>
                            <MenuItem onClick={handleActionClose}>Details</MenuItem>
                            <MenuItem
                              onClick={() => {
                                setSelectedSchoolForColor(row);
                                setOpenColorSchemeModal(true);
                                handleActionClose();
                              }}
                            >
                              Change Color School Scheme
                            </MenuItem>
                            <MenuItem onClick={handleActionClose}>Public Analytics</MenuItem>
                            <MenuItem
                              onClick={() => {
                                setSchoolToDelete(row);
                                setOpenDeleteDialog(true);
                                handleActionClose();
                              }}
                            >
                              Delete School
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} sx={{ textAlign: 'center', padding: '40px 0' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <IconSchool
                            width={48}
                            height={48}
                            color="#757575"
                            sx={{ marginBottom: '16px' }}
                          />
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 'bold', color: '#757575', marginBottom: '8px' }}
                          >
                            No schools available
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: '#757575', fontSize: '14px' }}
                          >
                            No schools have been registered yet. Click 'Register New School' to add
                            your first school.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      count={filteredSchools.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>

            <ReusableModal
              open={openRegisterModal || openEditModal}
              onClose={handleClose}
              title={openEditModal ? 'Edit School' : 'Register School'}
              size="large"
              showDivider={true}
              showCloseButton={true}
            >
              <RegisterSchoolForm
                actionType={openEditModal ? 'update' : 'create'}
                selectedAgent={editSchoolData}
                onSubmit={handleRefresh}
                onCancel={handleClose}
              />
            </ReusableModal>

            <ManageTenantDomain
              open={openTenantModal}
              onClose={() => setOpenTenantModal(false)}
              domainData={selectedTenantDomain}
            />
            <ReusableModal
              open={openGatewayModal}
              onClose={() => setOpenGatewayModal(false)}
              title="Manage School Gateway"
              size="small"
              showDivider={true}
              showCloseButton={true}
            >
              <ManageSchoolGateway
                selectedSchool={schoolList.find((s) => s.schoolUrl === selectedTenantDomain) || null}
                onSave={(updatedSchool) => {
                  setSchoolList((prevList) => {
                    const idx = prevList.findIndex((s) => s.id === updatedSchool.id);
                    if (idx !== -1) {
                      const newList = [...prevList];
                      newList[idx] = updatedSchool;
                      return newList;
                    }
                    return prevList;
                  });
                  setOpenGatewayModal(false);
                  setSnackbarMessage('Gateway info saved successfully');
                  setSnackbarSeverity('success');
                  setSnackbarOpen(true);
                }}
                onClose={() => setOpenGatewayModal(false)}
              />
            </ReusableModal>
            <ChangeAgent
              open={openAgentModal}
              onClose={() => setOpenAgentModal(false)}
              selectedAgent={selectedAgent}
              agentList={agentList}
            />
            <ConfirmationDialog
              open={openDeleteDialog}
              onClose={() => setOpenDeleteDialog(false)}
              onConfirm={() => {
                setSchoolList((prev) => prev.filter((s) => s.id !== schoolToDelete.id));
                setOpenDeleteDialog(false);
                setSnackbarMessage('School deleted successfully');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
              }}
              title="Delete School"
              message={`Are you sure you want to delete ${schoolToDelete?.institutionName}? This action is irreversible.`}
              confirmText="Delete"
              cancelText="Cancel"
              confirmColor="error"
              severity="error"
            />
            <ConfirmationDialog
              open={openDeactivateDialog}
              onClose={() => setOpenDeactivateDialog(false)}
              onConfirm={() => handleDeactivateSchool(schoolToDeactivate)}
              title="Deactivate School"
              message={`Are you sure you want to deactivate ${schoolToDeactivate?.institutionName}?`}
              confirmText="Deactivate"
              cancelText="Cancel"
              confirmColor="error"
              severity="error"
            />
            <ConfirmationDialog
              open={openClear2FAConfirm}
              onClose={() => setOpenClear2FAConfirm(false)}
              onConfirm={() => {
                console.log(`2FA settings cleared for ${selectedSchoolFor2FA?.institutionName}`);
                setOpenClear2FAConfirm(false);
              }}
              title="Clear 2FA for Admin Account"
              message={`Are you sure you want to clear 2FA settings for ${selectedSchoolFor2FA?.institutionName}?`}
              confirmText="Clear"
              cancelText="Cancel"
              confirmColor="error"
              severity="error"
            />
            <ConfirmationDialog
              open={openFixImageConfirm}
              onClose={() => setOpenFixImageConfirm(false)}
              onConfirm={handleFixImage}
              title="Fix User Images"
              message={`Are you sure you want to replace user images with new URL? This action is irreversible.`}
              confirmText="Confirm"
              cancelText="Cancel"
              confirmColor="error"
              severity="error"
            />
            <ReusableModal
              open={openColorSchemeModal}
              onClose={() => setOpenColorSchemeModal(false)}
              title="Change School Color Scheme"
              size="large"
              showDivider={true}
              showCloseButton={true}
            >
              <ChangeColorScheme
                selectedSchool={selectedSchoolForColor}
                onSave={(updatedSchool) => {
                  setSchoolList((prevList) => {
                    const idx = prevList.findIndex((s) => s.id === updatedSchool.id);
                    if (idx !== -1) {
                      const newList = [...prevList];
                      newList[idx] = updatedSchool;
                      return newList;
                    }
                    return prevList;
                  });
                  setOpenColorSchemeModal(false);
                  setSnackbarMessage('Color scheme updated successfully');
                  setSnackbarSeverity('success');
                  setSnackbarOpen(true);
                }}
                onClose={() => setOpenColorSchemeModal(false)}
              />
            </ReusableModal>
          </Box>
        </TableContainer>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </BlankCard>
    </LocalizationProvider>
  );
};

export default SchoolDashboard;