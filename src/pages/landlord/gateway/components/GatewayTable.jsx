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
  TextField,
  InputAdornment,
  Chip,
  Alert,
  Skeleton,
} from '@mui/material';
import { MoreVert as MoreVertIcon, Search as SearchIcon } from '@mui/icons-material';
import { IconFilter, IconEdit, IconTrash } from '@tabler/icons-react';
import ParentCard from '@/components/shared/ParentCard';
import PropTypes from 'prop-types';
import gatewayApi from '@/api/landlord/gateway/gatewayApi';

const EMPTY_FILTERS = { search: '', status: '' };

const GatewayTable = ({ gateways = [], onGatewayAction, isLoading: externalLoading = false }) => {
  const [gatewaysList, setGatewaysList] = useState(gateways);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [filterDraft, setFilterDraft] = useState(EMPTY_FILTERS);
  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchGateways = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await gatewayApi.getAll({
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
  }, [activeFilters, gateways]);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  const handleFilterApply = () => {
    setActiveFilters(filterDraft);
    setPage(0);
  };

  const handleFilterReset = () => {
    setFilterDraft(EMPTY_FILTERS);
    setActiveFilters(EMPTY_FILTERS);
    setPage(0);
  };

  const hasActiveFilters = Object.values(activeFilters).some(Boolean);

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

  return (
    <ParentCard
      title={
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1.5}
        >
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            <TextField
              placeholder="Search by gateway name…"
              size="small"
              value={filterDraft.search}
              onChange={(e) => setFilterDraft((p) => ({ ...p, search: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFilterApply();
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 220 }}
            />
            <TextField
              select
              label="Status"
              size="small"
              value={filterDraft.status}
              onChange={(e) => setFilterDraft((p) => ({ ...p, status: e.target.value }))}
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            <Button variant="contained" size="small" startIcon={<IconFilter size={16} />} onClick={handleFilterApply}>
              Filter
            </Button>
            {hasActiveFilters && (
              <Button size="small" onClick={handleFilterReset}>
                Reset
              </Button>
            )}
          </Box>
          <Button
            variant="contained"
            size="small"
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
      sx={{ px: 0.5, py: 0, '& .MuiCardContent-root': { p: 0, pt: 0 } }}
    >
      <Box>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 } }}>
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
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(5)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton variant="text" width={j === 0 ? 30 : j === 4 ? 50 : 100} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : gatewaysList.length > 0 ? (
                gatewaysList.map((gateway, index) => (
                  <TableRow key={gateway.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{gateway.gateway_name}</TableCell>
                    <TableCell>{gateway.gateway_code}</TableCell>
                    <TableCell>
                      <Chip
                        label={gateway.gateway_status}
                        size="small"
                        sx={{
                          bgcolor:
                            gateway.gateway_status?.toLowerCase() === 'active'
                              ? (theme) => theme.palette.success.light
                              : (theme) => theme.palette.error.light,
                          color:
                            gateway.gateway_status?.toLowerCase() === 'active'
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
      </Box>
    </ParentCard>
  );
};

GatewayTable.propTypes = {
  gateways: PropTypes.array,
  onGatewayAction: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default GatewayTable;
