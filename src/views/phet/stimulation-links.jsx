import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  InputAdornment,
  Button,
} from '@mui/material';
import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';

import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import ParentCard from 'src/components/shared/ParentCard';
import StimulationLinkModal from '../../components/phet/stimulation-links/StimulationLinkModal';
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog';
import useNotification from 'src/hooks/useNotification';
import phetApi from 'src/api/phet/phetApi';

const StimulationLinks = () => {
  return (
    <Box>
      <Breadcrumb
        title="Stimulation Links"
        items={[
          { title: 'Home', to: '/' },
          { title: 'PHET Stimulation' },
          { title: 'Stimulation Links' },
        ]}
      />
      <ManagePhETLinks />
    </Box>
  );
};

const ManagePhETLinks = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const notify = useNotification();

  // Fetch simulation links from API
  const fetchSimulationLinks = async () => {
    try {
      setLoading(true);
      const data = await phetApi.getSimulationLinks({ search: searchTerm });
      setRows(data);
    } catch (error) {
      console.error('Error fetching simulation links:', error);
      notify.error('Failed to fetch simulation links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulationLinks();
  }, [searchTerm]);

  const filteredRows = rows.filter((row) =>
    (row.title || '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const clearFilters = () => {
    setSearchTerm('');
    setPage(0);
  };

  const hasActiveFilters = searchTerm !== '';

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleAddClick = () => {
    setSelectedRow(null);
    setModalType('create');
    setModalOpen(true);
  };

  const handleEditClick = (row) => {
    setSelectedRow(row);
    setModalType('update');
    setModalOpen(true);
  };

  const handleDeleteClick = (row) => {
    setRowToDelete(row);
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleModalSubmit = async (data) => {
    try {
      if (modalType === 'create') {
        const newLink = await phetApi.createSimulationLink({
          topic_id: data.topic_id,
          title: data.title,
          link: data.link,
          status: data.status,
        });
        setRows((prev) => [newLink, ...prev]);
        notify.success('Stimulation link added successfully', 'Success');
      } else if (modalType === 'update') {
        const updatedLink = await phetApi.updateSimulationLink(data.id, {
          topic_id: data.topic_id,
          title: data.title,
          link: data.link,
          status: data.status,
        });
        setRows((prev) => prev.map((row) => (row.id === data.id ? updatedLink : row)));
        notify.success('Stimulation link updated successfully', 'Success');
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error submitting simulation link:', error);
      notify.error('Failed to submit simulation link', 'Error');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await phetApi.deleteSimulationLink(rowToDelete.id);
      setRows((prev) => prev.filter((row) => row.id !== rowToDelete.id));
      setConfirmOpen(false);
      setRowToDelete(null);
      notify.success('Stimulation link deleted successfully', 'Success');
    } catch (error) {
      console.error('Error deleting simulation link:', error);
      notify.error('Failed to delete simulation link', 'Error');
    }
  };

  return (
    <>
      <ParentCard
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5">Manage Simulation Links</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddClick}
              sx={{
                minWidth: 120,
                fontSize: { xs: '0.95rem', md: '1rem' },
              }}
            >
              Add New Link
            </Button>
          </Box>
        }
      >
        <Box sx={{ p: 0 }}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
              // sx={{ flexGrow: 1, minWidth: 200 }}
            />
            {hasActiveFilters && (
              <Button variant="outlined" onClick={clearFilters} sx={{ height: 'fit-content' }}>
                Clear Filters
              </Button>
            )}
          </Box>

          <Paper variant="outlined">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Topic</TableCell>
                    <TableCell>Link</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2">Loading...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : paginatedRows.length > 0 ? (
                    paginatedRows.map((row, index) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{row.title || '-'}</TableCell>
                        <TableCell>{row.subject_name || '-'}</TableCell>
                        <TableCell>{row.topic_name || '-'}</TableCell>
                        <TableCell>
                          <a href={row.link || '#'} target="_blank" rel="noopener noreferrer">
                            {row.link || '-'}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={(row.status || 'inactive').toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor:
                                row.status === 'active'
                                  ? (theme) => theme.palette.success.light
                                  : (theme) => theme.palette.error.light,
                              color:
                                row.status === 'active'
                                  ? (theme) => theme.palette.success.main
                                  : (theme) => theme.palette.error.main,
                              borderRadius: '8px',
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedRow?.id === row.id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={() => handleEditClick(row)}>Edit</MenuItem>
                            <MenuItem onClick={() => handleDeleteClick(row)}>Delete</MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="textSecondary">
                          No records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      colSpan={7}
                      count={filteredRows.length}
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
      <StimulationLinkModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        actionType={modalType}
        selectedSimulation={selectedRow}
        onSimulationUpdate={handleModalSubmit}
      />
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Simulation Link"
        message={`Are you sure you want to delete "${rowToDelete?.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </>
  );
};

export default StimulationLinks;
