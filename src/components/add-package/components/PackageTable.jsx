import React, { useState } from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import ParentCard from '../../shared/ParentCard';
import PropTypes from 'prop-types';

const PackageTable = ({ 
  packages = [], 
  onPackageAction,
  isLoading = false 
}) => {
  const [pacSearch, setPacSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.pac_name.toLowerCase().includes(pacSearch.toLowerCase()) ||
      pkg.pac_description.toLowerCase().includes(pacSearch.toLowerCase())
  );

  const paginatedPackages = filteredPackages.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleMenuOpen = (event, pkg) => {
    setAnchorEl(event.currentTarget);
    setSelectedPackage(pkg);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPackage(null);
  };

  const handleAction = (action, package_) => {
    onPackageAction(action, package_);
    handleMenuClose();
  };

  return (
    <ParentCard 
      title={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">All Packages</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onPackageAction('create')}
          >
            Add New Package
          </Button>
        </Box>
      }
    >
      <Box sx={{ p: 0 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search packages..."
            value={pacSearch}
            onChange={(e) => setPacSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flexGrow: 1 }}
          />
        </Box>

        <Paper variant="outlined">
          <TableContainer>
            <Table sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography>Loading...</Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedPackages.length > 0 ? (
                  paginatedPackages.map((pkg, index) => (
                    <TableRow key={pkg.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <i className={pkg.pac_icon} style={{ fontSize: '18px', marginRight: '8px' }} />
                          <Typography variant="body2" fontWeight="medium">{pkg.pac_name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">{pkg.pac_description}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          sx={{
                            bgcolor: pkg.pac_status === 'active'
                              ? (theme) => theme.palette.success.light
                              : (theme) => theme.palette.error.light,
                            color: pkg.pac_status === 'active'
                              ? (theme) => theme.palette.success.main
                              : (theme) => theme.palette.error.main,
                            borderRadius: '8px',
                          }}
                          size="small"
                          label={pkg.pac_status.toUpperCase()}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, pkg)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedPackage?.id === pkg.id}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={() => handleAction('viewModules', pkg)}>
                            View Modules
                          </MenuItem>
                          <MenuItem onClick={() => handleAction('update', pkg)}>
                            Edit Package
                          </MenuItem>
                          <MenuItem onClick={() => handleAction('manageModules', pkg)}>
                            Manage Modules
                          </MenuItem>
                          <MenuItem 
                            onClick={() => handleAction(
                              pkg.pac_status === 'active' ? 'deactivate' : 'activate', 
                              pkg
                            )}
                          >
                            {pkg.pac_status === 'active' ? 'Deactivate Package' : 'Activate Package'}
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body1" color="textSecondary">No packages found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={5}
                    count={filteredPackages.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </ParentCard>
  );
};

PackageTable.propTypes = {
  packages: PropTypes.array,
  onPackageAction: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default PackageTable;
