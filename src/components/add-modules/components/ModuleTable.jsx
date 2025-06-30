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
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import ParentCard from '../../shared/ParentCard';
import PropTypes from 'prop-types';

const ModuleTable = ({ 
  modules = [], 
  onModuleAction,
  isLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const matchesSearch = 
        module.mod_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.mod_description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || module.mod_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [modules, searchTerm, statusFilter]);

  const paginatedModules = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredModules.slice(start, start + rowsPerPage);
  }, [filteredModules, page, rowsPerPage]);

  const handleMenuOpen = (event, module) => {
    setAnchorEl(event.currentTarget);
    setSelectedModule(module);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedModule(null);
  };

  const handleAction = (action, module) => {
    onModuleAction(action, module);
    handleMenuClose();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPage(0);
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all';

  return (
    <ParentCard 
      title={
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Available Modules</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onModuleAction('create')}
          >
            Add New Module
          </Button>
        </Box>
      }
    >
      <Box sx={{ p: 0 }}>
        <Box sx={{ mb: 3,
           display: 'flex',
           flexWrap: 'wrap',
           gap: 2,
           alignItems: 'center',
        }}>
          <TextField
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            // sx={{ flexGrow: 1, minWidth: 250 }}
          />

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
              startAdornment={<FilterListIcon sx={{ mr: 1 }} />}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          {hasActiveFilters && (
            <Button
              variant="outlined"
              onClick={clearFilters}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        <Paper variant="outlined">
          <TableContainer>
            <Table sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Module Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Link</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Permission</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography>Loading...</Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedModules.length > 0 ? (
                  paginatedModules.map((module, index) => (
                    <TableRow key={module.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {module.mod_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {module.mod_description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {module.mod_links?.link}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {module.mod_links?.permission}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          sx={{
                            bgcolor: module.mod_status === 'active'
                              ? (theme) => theme.palette.success.light
                              : (theme) => theme.palette.error.light,
                            color: module.mod_status === 'active'
                              ? (theme) => theme.palette.success.main
                              : (theme) => theme.palette.error.main,
                            borderRadius: '8px',
                          }}
                          size="small"
                          label={module.mod_status.toUpperCase()}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, module)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedModule?.id === module.id}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={() => handleAction('update', module)}>
                            Edit Module
                          </MenuItem>
                          <MenuItem 
                            onClick={() => handleAction(
                              module.mod_status === 'active' ? 'deactivate' : 'activate', 
                              module
                            )}
                          >
                            {module.mod_status === 'active' ? 'Deactivate Module' : 'Activate Module'}
                          </MenuItem>
                          <MenuItem onClick={() => handleAction('delete', module)}>
                            Delete Module
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" color="textSecondary">
                        {hasActiveFilters ? 'No modules match your filters' : 'No modules found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    colSpan={7}
                    count={filteredModules.length}
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

ModuleTable.propTypes = {
  modules: PropTypes.array,
  onModuleAction: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default ModuleTable;
