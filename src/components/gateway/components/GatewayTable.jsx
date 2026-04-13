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
  Button,
  Chip,
  Alert,
} from '@mui/material';
import { FilterList as FilterListIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import ParentCard from '../../shared/ParentCard';
import FilterSideDrawer from '../../shared/FilterSideDrawer';
import PropTypes from 'prop-types';
import gatewayApi from '../../../api/gatewayApi';

const GatewayTable = ({ gateways = [], onGatewayAction, isLoading: externalLoading = false }) => {
  const [gatewaysList, setGatewaysList] = useState(gateways);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const gatewayFilterDefs = [
    { key: 'search', label: 'Gateway Name', type: 'text', placeholder: 'Search by gateway name…' },
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

  const fetchGateways = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await gatewayApi.getAll({
        page: page + 1,
        per_page: rowsPerPage,
        search: activeFilters.search || '',
        status: activeFilters.status || '',
      });

      // Handle different response structures
      if (response.data?.data) {
        setGatewaysList(response.data.data);
        setTotalCount(response.data.total || response.data.data.length);
      } else if (Array.isArray(response.data)) {
        setGatewaysList(response.data);
        setTotalCount(response.data.length);
      } else {
        setGatewaysList([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching gateways:', error);
      setGatewaysList(gateways);
      setTotalCount(gateways.length);
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage, activeFilters, gateways]);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  const handleFilterApply = (filterValues) => {
    setActiveFilters(filterValues);
    setPage(0);
  };

  const handleFilterReset = () => {
    setActiveFilters({});
    setPage(0);
  };

  const activeFilterCount = Object.values(activeFilters).filter((v) => v !== '').length;

  const handleMenuOpen = (event, gateway) => {
    setAnchorEl(event.currentTarget);
    setSelectedGateway(gateway);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGateway(null);
  };

  const handleAction = (action, gateway) => {
    onGatewayAction(action, gateway);
    handleMenuClose();
  };

  const hasActiveFilters = Object.values(activeFilters).some((v) => v !== '');

  return (
    <ParentCard
      title={
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Available Gateways</Typography>
          <Button
            variant="contained"
            //  startIcon={<AddIcon />}
            onClick={() => onGatewayAction('create')}
            sx={{
              minWidth: 120,
              fontSize: { xs: '0.95rem', md: '1rem' },
            }}
          >
            Register Gateway
          </Button>
        </Box>
      }
    >
      <Box sx={{ p: 0, display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
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
        filters={gatewayFilterDefs}
        title="Filter Gateways"
        onApply={handleFilterApply}
        onReset={handleFilterReset}
      />

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Gateway Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography>Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : gatewaysList.length > 0 ? (
                gatewaysList.map((gateway, index) => (
                  <TableRow key={gateway.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{gateway.gateway_name}</TableCell>
                    <TableCell>{gateway.code}</TableCell>
                    <TableCell>
                      <Chip
                        label={gateway.status?.toUpperCase() || 'N/A'}
                        size="small"
                        sx={{
                          bgcolor:
                            gateway.status?.toLowerCase() === 'active'
                              ? (theme) => theme.palette.success.light
                              : (theme) => theme.palette.error.light,
                          color:
                            gateway.status?.toLowerCase() === 'active'
                              ? (theme) => theme.palette.success.main
                              : (theme) => theme.palette.error.main,
                          borderRadius: '8px',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleMenuOpen(e, gateway)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && selectedGateway?.id === gateway.id}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={() => handleAction('update', gateway)}>
                          <IconEdit size={16} style={{ marginRight: 8 }} />
                          Edit
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleAction('delete', gateway)}
                          sx={{ color: 'error.main' }}
                        >
                          <IconTrash size={16} style={{ marginRight: 8 }} />
                          Delete
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center' }}>
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
                      <Typography variant="body1" color="textSecondary">
                        No gateways found
                      </Typography>
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  count={totalCount}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  colSpan={5}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </ParentCard>
  );
};

GatewayTable.propTypes = {
  gateways: PropTypes.array,
  onGatewayAction: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default GatewayTable;
