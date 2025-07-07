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
import RegisterSessionForm from '../../components/add-session/component/RegisterSessionForm';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const basicsTableData = [
  { id: 1, sessionName: '2023-2024', status: 'Active', isCurrent: true },
  { id: 2, sessionName: '2022-2023', status: 'Completed', isCurrent: false },
  { id: 3, sessionName: '2021-2022', status: 'Completed', isCurrent: false },
];

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Session' }];

const Session = () => {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState(basicsTableData);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [actionType, setActionType] = useState('create');
  const [selectedSession, setSelectedSession] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const hasActiveSession = sessions.some((session) => session.status === 'Active');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpen = (type = 'create', session = null) => {
    setActionType(type);
    setSelectedSession(session);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setActionType('create');
    setSelectedSession(null);
  };

  const handleAddSession = (newSession) => {
    if (actionType === 'update') {
      setSessions(sessions.map((session) => (session.id === newSession.id ? newSession : session)));
    } else {
      setSessions([...sessions, newSession]);
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

  const handleOpenDeleteDialog = (session) => {
    handleActionClose();
    setTimeout(() => {
      setSessionToDelete(session);
      setOpenDeleteDialog(true);
    }, 100);
  };

  const handleDeleteSession = () => {
    if (sessionToDelete) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id));
      setOpenDeleteDialog(false);
      setSnackbarMessage('Session deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  // Filter sessions based on searchTerm
  const filteredSessions = sessions.filter((session) =>
    session.sessionName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Paginate the filtered sessions
  const paginatedSession = filteredSessions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  // Reset page on search term change
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  return (
    <PageContainer title="Session" description="This is Session page">
      <Breadcrumb title="Session" items={BCrumb} />
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
            <Typography variant="h6">All Session</Typography>
            <Button variant="contained" color="primary" onClick={() => handleOpen('create')}>
              Add New Session
            </Button>
          </Box>
        }
      >

         <TextField
              placeholder="Search sessions..."
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
           
            <Table aria-label="session table" sx={{ whiteSpace: 'nowrap'}}>
              <TableHead >
                <TableRow>
                  <TableCell>
                    <Typography variant="h6">S/N</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">Session Name</Typography>
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
                {paginatedSession.length > 0 ? (
                  paginatedSession.map((session, index) => (
                    <TableRow
                      key={session.id}
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
                          {session.sessionName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          sx={{
                            bgcolor:
                              session.status === 'Active'
                                ? (theme) => theme.palette.success.light
                                : (theme) => theme.palette.primary.light,
                            color:
                              session.status === 'Active'
                                ? (theme) => theme.palette.success.main
                                : (theme) => theme.palette.primary.main,
                            borderRadius: '8px',
                          }}
                          size="small"
                          label={session.status || 'Unknown'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6">{session.isCurrent ? 'Yes' : 'No'}</Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={(e) => handleActionClick(e, session.id)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && activeRow === session.id}
                          onClose={handleActionClose}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                          <MenuItem onClick={() => handleOpen('update', session)}>
                            Edit Session
                          </MenuItem>
                          <MenuItem onClick={() => handleOpenDeleteDialog(session)}>
                            Delete Session
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
                          No Session available
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#757575', fontSize: '14px' }}>
                          No session have been registered yet. Click 'Register New Session' 
                            to add a new session.
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
                    count={filteredSessions.length}
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
          title={actionType === 'create' ? 'Add New Session' : 'Edit Session'}
          size="medium"
          showDivider={true}
          showCloseButton={true}
        >
          <RegisterSessionForm
            actionType={actionType}
            selectedAgent={selectedSession}
            onSubmit={handleAddSession}
            onCancel={handleClose}
          />
        </ReusableModal>

        <ConfirmationDialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleDeleteSession}
          title="Delete Session"
          message={`Are you sure you want to delete ${sessionToDelete?.sessionName}? This action is irreversible.`}
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

export default Session;
