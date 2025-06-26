import React, { useState } from 'react';
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
} from '@mui/material';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../components/container/PageContainer';
import ParentCard from '../../components/shared/ParentCard';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddSchoolModal from '../../components/add-school/AddSchoolModal';
import RegisterSessionForm from '../../components/add-session/component/RegisterSessionForm';

// Sample data
const basicsTableData = [
  { id: 1, sessionName: '2023-2024', status: 'Active', isCurrent: true },
  { id: 2, sessionName: '2022-2023', status: 'Completed', isCurrent: false },
  { id: 3, sessionName: '2021-2022', status: 'Completed', isCurrent: false },
];

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Session' },
];

const Session = () => {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState(basicsTableData);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [actionType, setActionType] = useState('create');
  const [selectedSession, setSelectedSession] = useState(null);

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
      setSessions([...sessions, { id: newSession.id, ...newSession }]);
    }
    handleClose();
  };

  const handleDeleteSession = (id) => {
    setSessions(sessions.filter((session) => session.id !== id));
    handleActionClose();
  };

  const handleActionClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setActiveRow(id);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setActiveRow(null);
  };

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
        <Paper variant="outlined">
          <TableContainer>
            <Table aria-label="session table" sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="h6">#</Typography>
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
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{session.id}</Typography>
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
                              : session.status === 'Completed'
                              ? (theme) => theme.palette.primary.light
                              : (theme) => theme.palette.error.light,
                          color:
                            session.status === 'Active'
                              ? (theme) => theme.palette.success.main
                              : session.status === 'Completed'
                              ? (theme) => theme.palette.primary.main
                              : (theme) => theme.palette.error.main,
                          borderRadius: '8px',
                        }}
                        size="small"
                        label={session.status || 'Unknown'} // Handle empty status
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
                        <MenuItem onClick={() => handleDeleteSession(session.id)}>
                          Delete Session
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <AddSchoolModal
          open={open}
          onClose={handleClose}
          handleRefresh={handleAddSession}
          actionType={actionType}
          selectedAgent={selectedSession}
          formComponent={RegisterSessionForm}
          isSession={true}
        />
      </ParentCard>
    </PageContainer>
  );
};

export default Session;