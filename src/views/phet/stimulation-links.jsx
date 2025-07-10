import React, { useState } from 'react';
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

const DUMMY_ROWS = [
  {
    id: 1,
    title: 'The Water Cycle Simulation',
    topic: 'Water Cycle',
    subject: 'Science',
    link: 'https://phet.colorado.edu/en/simulation/water-cycle',
    status: 'inactive',
  },
  {
    id: 2,
    title: 'Basic Algebra Balancing',
    topic: 'Equations',
    subject: 'Mathematics',
    link: 'https://phet.colorado.edu/en/simulation/balancing-equations',
    status: 'active',
  },
  {
    id: 3,
    title: 'Sound Waves Visualizer',
    topic: 'Sound',
    subject: 'Physics',
    link: 'https://phet.colorado.edu/en/simulation/sound',
    status: 'active',
  },
];

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
  const [rows, setRows] = useState(DUMMY_ROWS);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredRows = rows.filter((row) =>
    row.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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

  const handleModalSubmit = (data) => {
    if (modalType === 'create') {
      setRows((prev) => [...prev, { ...data, id: Date.now() }]);
    } else if (modalType === 'update') {
      setRows((prev) => prev.map((row) => (row.id === data.id ? data : row)));
    }
    setModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    setRows((prev) => prev.filter((row) => row.id !== rowToDelete.id));
    setConfirmOpen(false);
    setRowToDelete(null);
  };

  const handleSimulationUpdate = (data, action) => {
    if (action === 'create') {
    } else if (action === 'update') {
    } else if (action === 'delete') {
    }
  };

  return (
    <>
      <ParentCard
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h5">
              Manage Gateways
            </Typography>
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
          <Box sx={{ mb: 3 }}>
            <TextField
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Paper variant="outlined">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Topic</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Link</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{row.title}</TableCell>
                        <TableCell>{row.topic}</TableCell>
                        <TableCell>{row.subject}</TableCell>
                        <TableCell>
                          <a href={row.link} target="_blank" rel="noopener noreferrer">
                            {row.link}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.status.toUpperCase()}
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
