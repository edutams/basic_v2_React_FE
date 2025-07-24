import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Divider,
  Card,
  CardContent,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AccountBalance as AccountBalanceIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: theme.palette.text.primary,
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 500,
  padding: theme.spacing(1, 2),
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  '& .MuiCardContent-root': {
    padding: theme.spacing(2),
  },
}));

// Mock data for Subministry
const mockSubministries = [
  {
    id: 1,
    name: 'Lagos State Ministry of Education',
    code: 'LASMOE',
    region: 'Lagos State',
    zone: 'South West',
    totalSchools: 1250,
    totalStudents: 450000,
    status: 'Active',
    contact: 'info@lasmoe.gov.ng',
    createdDate: '2024-01-15',
  },
  {
    id: 2,
    name: 'Kano State Ministry of Education',
    code: 'KANMOE',
    region: 'Kano State',
    zone: 'North West',
    totalSchools: 980,
    totalStudents: 320000,
    status: 'Active',
    contact: 'info@kanmoe.gov.ng',
    createdDate: '2024-01-20',
  },
  {
    id: 3,
    name: 'Rivers State Ministry of Education',
    code: 'RIVMOE',
    region: 'Rivers State',
    zone: 'South South',
    totalSchools: 750,
    totalStudents: 280000,
    status: 'Active',
    contact: 'info@rivmoe.gov.ng',
    createdDate: '2024-02-01',
  },
];

const SubministryTab = () => {
  const [subministries, setSubministries] = useState(mockSubministries);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSubministry, setSelectedSubministry] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    region: '',
    zone: '',
    contact: '',
    status: 'Active',
  });

  const zones = [
    'North Central',
    'North East',
    'North West',
    'South East',
    'South South',
    'South West',
  ];

  const handleMenuClick = (event, subministry) => {
    setAnchorEl(event.currentTarget);
    setSelectedSubministry(subministry);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSubministry(null);
  };

  const handleDialogOpen = (mode, subministry = null) => {
    setDialogMode(mode);
    if (subministry) {
      setFormData({
        name: subministry.name,
        code: subministry.code,
        region: subministry.region,
        zone: subministry.zone,
        contact: subministry.contact,
        status: subministry.status,
      });
      setSelectedSubministry(subministry);
    } else {
      setFormData({
        name: '',
        code: '',
        region: '',
        zone: '',
        contact: '',
        status: 'Active',
      });
    }
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedSubministry(null);
    setFormData({
      name: '',
      code: '',
      region: '',
      zone: '',
      contact: '',
      status: 'Active',
    });
  };

  const handleFormSubmit = () => {
    if (dialogMode === 'create') {
      const newSubministry = {
        id: Date.now(),
        ...formData,
        totalSchools: 0,
        totalStudents: 0,
        createdDate: new Date().toISOString().split('T')[0],
      };
      setSubministries([...subministries, newSubministry]);
    } else if (dialogMode === 'edit') {
      setSubministries(subministries.map(sub => 
        sub.id === selectedSubministry.id 
          ? { ...sub, ...formData }
          : sub
      ));
    }
    handleDialogClose();
  };

  const handleDelete = () => {
    setSubministries(subministries.filter(sub => sub.id !== selectedSubministry.id));
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  // Calculate stats
  const totalSubministries = subministries.length;
  const totalSchools = subministries.reduce((sum, sub) => sum + sub.totalSchools, 0);
  const totalStudents = subministries.reduce((sum, sub) => sum + sub.totalStudents, 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatsCard>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <AccountBalanceIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {totalSubministries}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Subministries
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {totalSchools.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Schools
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <LocationIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {totalStudents.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Students
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Subministry Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage state education ministries and their jurisdictions
          </Typography>
        </Box>
        <ActionButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen('create')}
        >
          Add Subministry
        </ActionButton>
      </Box>

      {/* Table */}
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Ministry Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Region/Zone</TableCell>
                <TableCell>Schools</TableCell>
                <TableCell>Students</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {subministries.map((subministry, index) => (
                <TableRow key={subministry.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {subministry.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {subministry.contact}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={subministry.code} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {subministry.region}
                      </Typography>
                      <Chip 
                        label={subministry.zone} 
                        size="small" 
                        color="primary"
                        variant="filled"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {subministry.totalSchools.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {subministry.totalStudents.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={subministry.status} 
                      size="small" 
                      color={getStatusColor(subministry.status)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, subministry)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleDialogOpen('view', selectedSubministry)}>
          <ViewIcon sx={{ mr: 1, fontSize: 18 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen('edit', selectedSubministry)}>
          <EditIcon sx={{ mr: 1, fontSize: 18 }} />
          Edit Subministry
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' && 'Add New Subministry'}
          {dialogMode === 'edit' && 'Edit Subministry'}
          {dialogMode === 'view' && 'Subministry Details'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ministry Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ministry Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Region/State"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={dialogMode === 'view'}>
                <InputLabel>Zone</InputLabel>
                <Select
                  value={formData.zone}
                  label="Zone"
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                >
                  {zones.map((zone) => (
                    <MenuItem key={zone} value={zone}>{zone}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Email"
                type="email"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={dialogMode === 'view'}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDialogClose}>
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {dialogMode !== 'view' && (
            <Button variant="contained" onClick={handleFormSubmit}>
              {dialogMode === 'create' ? 'Create' : 'Update'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubministryTab;