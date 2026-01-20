import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Paper,
  TableContainer,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TableFooter,
  TablePagination,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import { IconSchool, IconUserPlus, IconCheck, IconX } from '@tabler/icons-react';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../components/container/PageContainer';
import ParentCard from '../../components/shared/ParentCard';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import ReusableModal from '../../components/shared/ReusableModal';
import RegisterTermForm from '../../components/add-term/component/RegisterTermForm';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const basicsTableData = [
  { id: 1, termName: 'First Term 2023', status: 'Active', isCurrent: true },
  { id: 2, termName: 'Second Term 2023', status: 'Completed', isCurrent: false },
  { id: 3, termName: 'Third Term 2023', status: 'Completed', isCurrent: false },
];

// const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Term' }];

const Term = () => {
  const [open, setOpen] = useState(false);
  const [terms, setTerms] = useState(basicsTableData);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [actionType, setActionType] = useState('create');
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [termToDelete, setTermToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const hasActiveTerm = terms.some((term) => term.status === 'Active');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpen = (type = 'create', term = null) => {
    setActionType(type);
    setSelectedTerm(term);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setActionType('create');
    setSelectedTerm(null);
  };

  const handleAddTerm = (newTerm) => {
    if (actionType === 'update') {
      setTerms(terms.map((term) => (term.id === newTerm.id ? newTerm : term)));
    } else {
      setTerms([...terms, newTerm]);
    }
    handleClose();
  };

  const handleActionClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setActiveRow(id);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setActiveRow(null);
  };

  const handleOpenDeleteDialog = (term) => {
    handleActionClose();
    setTimeout(() => {
      setTermToDelete(term);
      setOpenDeleteDialog(true);
    }, 100);
  };

  const handleDeleteTerm = () => {
    if (termToDelete) {
      setTerms((prev) => prev.filter((t) => t.id !== termToDelete.id));
      setOpenDeleteDialog(false);
      setSnackbarMessage('Term deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  const filteredTerms = terms.filter((term) =>
    term.termName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const paginatedTerms = filteredTerms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Reset page on search term change
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  return (
    <PageContainer title="Term" description="This is Term page">
      {/* <Breadcrumb title="Term" items={BCrumb} /> */}
      <ParentCard
        title={
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Typography variant="h5">All Terms</Typography>
            <Button variant="contained" color="primary" onClick={() => handleOpen('create')}>
              Add New Term
            </Button>
          </Box>
        }
      >
        <TextField
          placeholder="Search terms..."
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
          sx={{ flexGrow: 1, mb: 2 }}
        />
        <Paper variant="outlined">
          <TableContainer>
            <Table aria-label="term table" sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="h6">S/N</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Term Name</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Status</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Is Current</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Action</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTerms.length > 0 ? (
                  paginatedTerms.map((term, index) => (
                    <TableRow
                      key={term.id}
                      sx={{
                        '&:hover': { bgcolor: 'grey.50' },
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2">
                          {page * rowsPerPage + index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" fontWeight="400">
                          {term.termName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          sx={{
                            bgcolor:
                              term.status === 'Active'
                                ? (theme) => theme.palette.success.light
                                : (theme) => theme.palette.primary.light,
                            color:
                              term.status === 'Active'
                                ? (theme) => theme.palette.success.main
                                : (theme) => theme.palette.primary.main,
                            borderRadius: '8px',
                          }}
                          size="small"
                          label={term.status || 'Unknown'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6">{term.isCurrent ? 'Yes' : 'No'}</Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={(e) => handleActionClick(e, term.id)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && activeRow === term.id}
                          onClose={handleActionClose}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                          <MenuItem onClick={() => handleOpen('update', term)}>Edit Term</MenuItem>
                          <MenuItem onClick={() => handleOpenDeleteDialog(term)}>
                            Delete Term
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ textAlign: 'center', padding: '40px 0' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <IconSchool
                          width={48}
                          height={48}
                          color="#757575"
                          sx={{ marginBottom: '16px' }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 'bold', color: '#757575', marginBottom: '8px' }}
                        >
                          No Term available
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#757575', fontSize: '14px' }}>
                          No term have been registered yet. Click 'Register New Term' to add a new
                          term.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={filteredTerms.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Paper>

        <ReusableModal
          open={open}
          onClose={handleClose}
          title={actionType === 'create' ? 'Add New Term' : 'Edit Term'}
          size="medium"
          showDivider={true}
          showCloseButton={true}
        >
          <RegisterTermForm
            actionType={actionType}
            selectedAgent={selectedTerm}
            onSubmit={handleAddTerm}
            onCancel={handleClose}
          />
        </ReusableModal>

        <ConfirmationDialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleDeleteTerm}
          title="Delete Term"
          message={`Are you sure you want to delete ${termToDelete?.termName}? This action is irreversible.`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="error"
          severity="error"
        />

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </ParentCard>
    </PageContainer>
  );
};

export default Term;
