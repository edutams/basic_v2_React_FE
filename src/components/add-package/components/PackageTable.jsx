import React, { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import ParentCard from '../../shared/ParentCard';
import FilterSideDrawer from '../../shared/FilterSideDrawer';
import PropTypes from 'prop-types';
import eduTierApi from '../../../api/eduTierApi';

const PackageTable = ({ packages = [], onPackageAction, isLoading: externalLoading = false }) => {
  const [packagesList, setPackagesList] = useState(packages);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const packageFilterDefs = [
    { key: 'search', label: 'Package Name', type: 'text', placeholder: 'Search by package name…' },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ];

  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await eduTierApi.getPackages({
        page: page + 1,
        per_page: rowsPerPage,
        search: activeFilters.search || '',
        status: activeFilters.status || '',
      });

      // Handle different response structures
      if (response?.data) {
        setPackagesList(response.data);
        setTotalCount(response.total || response.data.length);
      } else if (Array.isArray(response)) {
        setPackagesList(response);
        setTotalCount(response.length);
      } else {
        setPackagesList([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setPackagesList(packages);
      setTotalCount(packages.length);
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage, activeFilters, packages]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleFilterApply = (filterValues) => {
    setActiveFilters(filterValues);
    setPage(0);
  };

  const handleFilterReset = () => {
    setActiveFilters({});
    setPage(0);
  };

  const activeFilterCount = Object.values(activeFilters).filter((v) => v !== '').length;

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
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setFilterDrawerOpen(true)}
            sx={{ minWidth: 140 }}
          >
            Show Filters
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                color="primary"
                sx={{
                  ml: 1,
                  height: 20,
                  minWidth: 20,
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Button>
        </Box>

        {/* Filter Side Drawer */}
        <FilterSideDrawer
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          filters={packageFilterDefs}
          title="Filter Packages"
          onApply={handleFilterApply}
          onReset={handleFilterReset}
        />

        <Paper variant="outlined">
          <TableContainer>
            <Table sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 10 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : packagesList.length > 0 ? (
                  packagesList.map((pkg, index) => (
                    <TableRow key={pkg.id || index} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <i
                            className={pkg.package_icon || pkg.pac_icon}
                            style={{ fontSize: '18px', marginRight: '8px' }}
                          />
                          <Typography variant="body2" fontWeight="medium">
                            {pkg.package_name || pkg.pac_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {pkg.package_description || pkg.pac_description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          sx={{
                            bgcolor:
                              (pkg.package_status || pkg.pac_status) === 'active'
                                ? (theme) => theme.palette.success.light
                                : (theme) => theme.palette.error.light,
                            color:
                              (pkg.package_status || pkg.pac_status) === 'active'
                                ? (theme) => theme.palette.success.main
                                : (theme) => theme.palette.error.main,
                            borderRadius: '8px',
                          }}
                          size="small"
                          label={(pkg.package_status || pkg.pac_status || 'INACTIVE').toUpperCase()}
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
                          {/* <MenuItem onClick={() => handleAction('viewModules', pkg)}>
                            View Modules
                          </MenuItem> */}
                          <MenuItem onClick={() => handleAction('update', pkg)}>
                            Edit Package
                          </MenuItem>
                          <MenuItem onClick={() => handleAction('manageModules', pkg)}>
                            Manage Modules
                          </MenuItem>
                          <MenuItem
                            onClick={() =>
                              handleAction(
                                (pkg.package_status || pkg.pac_status) === 'active'
                                  ? 'deactivate'
                                  : 'activate',
                                pkg,
                              )
                            }
                          >
                            {(pkg.package_status || pkg.pac_status) === 'active'
                              ? 'Deactivate Package'
                              : 'Activate Package'}
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Alert
                        severity="info"
                        sx={{
                          mb: 0,
                          justifyContent: 'center',
                          textAlign: 'center',
                          '& .MuiAlert-icon': {
                            mr: 1.5,
                          },
                        }}
                      >
                        No packages found
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={5}
                    count={totalCount}
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
