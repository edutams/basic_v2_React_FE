import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
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
  Card,
  CardContent,
} from '@mui/material';
import { IconSchool } from '@tabler/icons-react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';

import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../components/container/PageContainer';
import ParentCard from '../../components/shared/ParentCard';
import SessionModal from '../../components/school/components/AddSessionModal';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import Term from '../../views/dashboard/Term';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Session' }];

const Session = () => {
  const [mainTab, setMainTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 1, sessionName: '2023-2024', status: 'Active', isCurrent: true },
    { id: 2, sessionName: '2022-2023', status: 'Completed', isCurrent: false },
    { id: 3, sessionName: '2021-2022', status: 'Completed', isCurrent: false },
  ]);
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

  const handleMainTabChange = (event, newValue) => {
    setMainTab(newValue);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
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

  const handleAddSession = (newSession, action) => {
    if (action === 'update' || actionType === 'update') {
      setSessions(sessions.map((s) => (s.id === newSession.id ? newSession : s)));
    } else {
      setSessions([...sessions, newSession]);
    }
    setSnackbarMessage(`Session ${action === 'update' ? 'updated' : 'created'} successfully`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
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

  const filteredSessions = sessions.filter((session) =>
    session.sessionName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const paginatedSession = filteredSessions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  useEffect(() => setPage(0), [searchTerm]);

  return (
    <PageContainer title="Session" description="This is Session page">
      <Breadcrumb title="Calendar" items={BCrumb} />

      <Card variant="outlined">
        <CardContent>
          <Tabs value={mainTab} onChange={handleMainTabChange} sx={{ mb: 3 }}>
            <Tab label="Sessions" />
            <Tab label="Term" />
          </Tabs>

          {mainTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">All Sessions</Typography>
                <Button variant="contained" color="primary" onClick={() => handleOpen('create')}>
                  Add New Session
                </Button>
              </Box>

              <TextField
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1, mb: 2 }}
              />

              <Paper variant="outlined">
                <TableContainer>
                  <Table aria-label="session table" sx={{ whiteSpace: 'nowrap' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>S/N</TableCell>
                        <TableCell>Session Name</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Is Current</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedSession.length > 0 ? (
                        paginatedSession.map((session, index) => (
                          <TableRow key={session.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                            <TableCell>{session.sessionName}</TableCell>
                            <TableCell>
                              <Chip
                                label={session.status}
                                size="small"
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
                              />
                            </TableCell>
                            <TableCell>{session.isCurrent ? 'Yes' : 'No'}</TableCell>
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
                          <TableCell colSpan={5} sx={{ textAlign: 'center', p: 4 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                              }}
                            >
                              <IconSchool width={48} height={48} color="#757575" />
                              <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2 }}>
                                No Session available
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#757575' }}>
                                No session have been registered yet. Click 'Add New Session' to add
                                one.
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

              <SessionModal
                open={open}
                onClose={handleClose}
                actionType={actionType}
                selectedSession={selectedSession}
                onSessionUpdate={handleAddSession}
                isLoading={false}
              />

              <ConfirmationDialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleDeleteSession}
                title="Delete Session"
                message={`Are you sure you want to delete ${sessionToDelete?.sessionName}?`}
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
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
                  {snackbarMessage}
                </Alert>
              </Snackbar>
            </Box>
          )}

          {/* Second Tab */}
          {mainTab === 1 && <Term />}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default Session;
