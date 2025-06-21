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
  Stack,
  TextField,
  IconButton,
  Menu,
} from '@mui/material';
// import {
//   IconListDetails,
//   IconShoppingBag,
//   IconTruck,
//   IconSortAscending,
// } from '@tabler/icons-react';
import { IconSchool, IconUserPlus, IconCheck, IconX } from '@tabler/icons-react';
import AddSchoolModal from '../../components/add-school/AddSchoolModal';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import ListIcon from '@mui/icons-material/List';
import AppsIcon from '@mui/icons-material/Apps';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import Pagination from '../../components/pagination/Pagination';
import ManageTenantDomain from '../../components/add-school/component/ManageSchoolDomain';
import ManageSchoolGateway from '../../components/add-school/component/ManageSchoolGateway';
import ChangeAgent from '../../components/add-school/component/ChangeAgent';
import ConfirmDialog from '../../components/add-school/component/ConfirmDialog';
import BlankCard from '../../components/shared/BlankCard';

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

  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const [schoolList, setSchoolList] = useState([]);

  const Shipped = schoolList.filter((s) => s.status === 'Shipped').length;
  const Delivered = schoolList.filter((s) => s.status === 'Delivered').length;
  const Pending = schoolList.filter((s) => s.status === 'Pending').length;

  const handleActionClick = (event, rowId) => {
    setActionAnchorEl(event.currentTarget);
    setActiveRow(rowId);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setActiveRow(null);
  };

  const handleChange = (key) => (event) => {
    const {
      target: { value },
    } = event;
    setFilterValues((prev) => ({
      ...prev,
      [key]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleRefresh = (newSchool) => {
    setSchoolList((prevList) => [...prevList, { id: prevList.length + 1, ...newSchool }]);
  };

  const schoolSummary = {
    total: schoolList.length,
    myRegistered: schoolList.length,
    active: schoolList.filter((s) => s.status === 'Active').length,
    inactive: schoolList.filter((s) => s.status === 'Inactive').length,
  };

  const [openTenantModal, setOpenTenantModal] = useState(false);
  const [selectedTenantDomain, setSelectedTenantDomain] = useState(null);
  const [openGatewayModal, setOpenGatewayModal] = useState(false);
  const [openAgentModal, setOpenAgentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [agentList] = useState([
    { label: 'Crownbirth - Crownbirth Limited', value: 'crownbirth' },
    { label: 'Agent B', value: 'agentB' },
  ]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);

  return (
  <>
  <Breadcrumb title="School" items={BCrumb} />
    <BlankCard>
       
    <TableContainer>

      <Box sx={{ mb: 3, bgcolor: '#F5F7FA', p: 2, borderRadius: 1 }}>
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
              label: 'Total Schools',
              value: schoolSummary.total,
              bg: 'primary',
              icon: <IconSchool width={22} color="#fff" />,
            },
            {
              label: 'My Registered Schools',
              value: schoolSummary.myRegistered,
              bg: 'secondary',
              icon: <IconUserPlus width={22} color="#fff" />,
            },
            {
              label: 'Active Schools',
              value: schoolSummary.active,
              bg: 'success',
              icon: <IconCheck width={22} color="#fff" />,
            },
            {
              label: 'Inactive Schools',
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
                  <Typography variant="body2" sx={{ fontSize: '14px', color: 'text.secondary' }}>
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
      
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ListIcon sx={{ color: '#b76cc2' }} />
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              All Schools
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem
                onClick={() => {
                  setOpenRegisterModal(true);
                  handleMenuClose();
                }}
              >
                <DescriptionOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body1">Register New School</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <Box component="hr" sx={{ mb: 3 }} />

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

          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
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
              {schoolList.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.institutionName}</TableCell>
                  <TableCell>{row.schoolUrl || '-'}</TableCell>
                  <TableCell>{row.agent || '-'}</TableCell>
                  <TableCell>{row.gateway}</TableCell>
                  <TableCell>{dayjs(row.date).format('MM/DD/YYYY')}</TableCell>
                  <TableCell>{row.socialLink || '-'}</TableCell>
                  <TableCell>{row.colourScheme}</TableCell>
                  <TableCell>{row.status}</TableCell>
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

                      <ManageSchoolGateway
                        open={openGatewayModal}
                        onClose={() => setOpenGatewayModal(false)}
                      />

                      <MenuItem
                        onClick={() => {
                          setOpenAgentModal(true);
                          handleActionClose();
                        }}
                      >
                        Change Agent
                      </MenuItem>
                      <MenuItem onClick={handleActionClose}>View School</MenuItem>
                      <MenuItem onClick={handleActionClose}>Clear @fa Setting</MenuItem>
                      <MenuItem onClick={handleActionClose}>Fix User Images</MenuItem>
                      <MenuItem onClick={handleActionClose}>Edit School Details</MenuItem>
                      <MenuItem onClick={handleActionClose}>Deactivate School</MenuItem>
                      <MenuItem onClick={handleActionClose}>Details</MenuItem>
                      <MenuItem onClick={handleActionClose}>Change Color School Scheme</MenuItem>
                      <MenuItem onClick={handleActionClose}>Public Analytics</MenuItem>
                      <MenuItem
                        onClick={() => {
                          setSchoolToDelete(row); // row is your current school
                          setOpenConfirmDialog(true);
                          handleActionClose();
                        }}
                      >
                        Delete School
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box component="hr" sx={{ mt: 6, mb: 3 }} />
        <Pagination totalItems={100} itemsPerPage={10} />

        <AddSchoolModal
          open={openRegisterModal}
          onClose={() => setOpenRegisterModal(false)}
          handleRefresh={handleRefresh}
          selectedAgent={null}
          actionType="create"
        />

        <ManageTenantDomain
          open={openTenantModal}
          onClose={() => setOpenTenantModal(false)}
          domainData={selectedTenantDomain}
        />
        <ManageSchoolGateway open={openGatewayModal} onClose={() => setOpenGatewayModal(false)} />
        <ChangeAgent
          open={openAgentModal}
          onClose={() => setOpenAgentModal(false)}
          selectedAgent={selectedAgent}
          agentList={agentList}
        />
        <ConfirmDialog
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
          onConfirm={() => {
            setSchoolList((prev) => prev.filter((s) => s.id !== schoolToDelete.id));
            setOpenConfirmDialog(false);
          }}
          title="Delete School"
          message={`Are you sure you want to perform this operation?`}
        />
      </Box>
    </TableContainer>
    </BlankCard>
    </>
  );
};

export default SchoolDashboard;
