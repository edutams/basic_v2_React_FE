import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  IconButton,
  Menu,
  MenuItem,
  InputAdornment,
  Button,
  Alert,
  Skeleton,
} from '@mui/material';
import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconRefresh, IconLink, IconCircleCheck, IconCircleX } from '@tabler/icons-react';

import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import MiniStat from '@/components/shared/stats/MiniStat';
import StimulationLinkModal from '@/pages/landlord/phet/stimulation-links/StimulationLinkModal';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import useNotification from '@/hooks/useNotification';
import phetApi from '@/api/landlord/phet/phetApi';

const EMPTY_STATS = { total: 0, active: 0, inactive: 0 };

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
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(false);
  const [searchDraft, setSearchDraft] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const notify = useNotification();

  // Search is sent to the backend, never filtered client-side — `rows` here
  // is already exactly what should render for the current search term.
  const fetchSimulationLinks = useCallback(async (search = '') => {
    try {
      setLoading(true);
      const { data, stats: fetchedStats } = await phetApi.getSimulationLinks({ search });
      setRows(data || []);
      setStats(fetchedStats || EMPTY_STATS);
    } catch (error) {
      // console.error('Error fetching simulation links:', error);
      notify.error('Failed to fetch simulation links');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSimulationLinks(activeSearch);
  }, [fetchSimulationLinks, activeSearch]);

  useEffect(() => {
    setPage(0);
  }, [rows]);

  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleFetch = () => {
    setActiveSearch(searchDraft.trim());
    setPage(0);
  };

  const clearFilters = () => {
    setSearchDraft('');
    setActiveSearch('');
    setPage(0);
  };

  const hasActiveFilters = activeSearch !== '';

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
        await phetApi.createSimulationLink({
          topic_id: data.topic_id,
          sub_topic: data.sub_topic,
          link: data.link,
          status: data.status,
        });
        notify.success('Stimulation link added successfully', 'Success');
      } else if (modalType === 'update') {
        await phetApi.updateSimulationLink(data.id, {
          topic_id: data.topic_id,
          sub_topic: data.sub_topic,
          link: data.link,
          status: data.status,
        });
        notify.success('Stimulation link updated successfully', 'Success');
      }
      // Re-fetch instead of splicing the row in locally — keeps the list in
      // the backend's sort order and the stat cards' totals in sync.
      fetchSimulationLinks(activeSearch);
      setModalOpen(false);
    } catch (error) {
      // console.error('Error submitting simulation link:', error);
      notify.error('Failed to submit simulation link', 'Error');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await phetApi.deleteSimulationLink(rowToDelete.id);
      setConfirmOpen(false);
      setRowToDelete(null);
      fetchSimulationLinks(activeSearch);
      notify.success('Stimulation link deleted successfully', 'Success');
    } catch (error) {
      // console.error('Error deleting simulation link:', error);
      notify.error('Failed to delete simulation link', 'Error');
    }
  };

  return (
    <>
      {/* Page-level stats — sits above the card, same as Gateway/Calendar/Subscriptions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', mb: 2 }}>
        <MiniStat label="Total Links" value={stats.total} loading={loading} icon={IconLink} />
        <MiniStat
          label="Active"
          value={stats.active}
          loading={loading}
          color="success.main"
          icon={IconCircleCheck}
        />
        <MiniStat
          label="Inactive"
          value={stats.inactive}
          loading={loading}
          color="error.main"
          icon={IconCircleX}
        />
      </Box>

      <ParentCard
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Typography variant="h5">Manage Simulation Links</Typography>
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={handleAddClick}
              sx={{ minWidth: 120, fontSize: { xs: '0.95rem', md: '1rem' } }}
            >
              Add New Link
            </Button>
          </Box>
        }
        sx={{ px: 0.5, py: 0, '& .MuiCardContent-root': { p: 0, pt: 0 } }}
      >
        <Box sx={{ p: 0 }}>
          <Box sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search by sub-topic..."
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFetch();
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
              size="small"
              sx={{ width: { xs: '100%', sm: 420 } }}
            />
            <Button variant="outlined" size="small" onClick={handleFetch} startIcon={<IconRefresh size={16} />}>
              Fetch
            </Button>
            {hasActiveFilters && (
              <Button size="small" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </Box>

            <TableContainer>
              <Table size="small" stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap'  }}>
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
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(7)].map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton variant="text" width={j === 0 ? 30 : 80} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : paginatedRows.length > 0 ? (
                    paginatedRows.map((row, index) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{row.sub_topic || '-'}</TableCell>
                        <TableCell>
                          {row.topic?.subject?.subject_name || row.subject?.subject_name || '-'}
                        </TableCell>
                        <TableCell>{row.topic?.topic || row.topic_name || '-'}</TableCell>
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
                        <Alert severity="info" sx={{ justifyContent: 'center', textAlign: 'center' }}>
                          No records found
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      colSpan={7}
                      count={rows.length}
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
        message={`Are you sure you want to delete "${rowToDelete?.sub_topic}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </>
  );
};

export default StimulationLinks;
