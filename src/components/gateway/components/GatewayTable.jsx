import React, { useState, useMemo } from 'react';
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
  Button,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import ParentCard from '../../shared/ParentCard';
import PropTypes from 'prop-types';

const GatewayTable = ({
  gateways = [],
  onGatewayAction,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState(null);

  const filteredGateways = useMemo(() => {
    return gateways.filter((gateway) =>
      gateway.gateway_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [gateways, searchTerm]);

  const paginatedGateways = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredGateways.slice(start, start + rowsPerPage);
  }, [filteredGateways, page, rowsPerPage]);

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
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Available Gateways</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onGatewayAction('create')}
          >
            Register Gateway
          </Button>
        </Box>
      }
    >
      <Box sx={{ p: 0 }}>
        <TextField
          placeholder="Search gateways..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Paper variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Gateway Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography>Loading...</Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedGateways.length > 0 ? (
                  paginatedGateways.map((gateway, index) => (
                    <TableRow key={gateway.id}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{gateway.gateway_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={gateway.gateway_status.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor:
                              gateway.gateway_status === 'active'
                                ? (theme) => theme.palette.success.light
                                : (theme) => theme.palette.error.light,
                            color:
                              gateway.gateway_status === 'active'
                                ? (theme) => theme.palette.success.main
                                : (theme) => theme.palette.error.main,
                            borderRadius: '8px',
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
                            Edit Gateway
                          </MenuItem>
                          <MenuItem onClick={() => handleAction('delete', gateway)}>
                            Delete Gateway
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography>No gateways found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={filteredGateways.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    colSpan={4}
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

GatewayTable.propTypes = {
  gateways: PropTypes.array,
  onGatewayAction: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default GatewayTable;
