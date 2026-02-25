import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Stack,
} from '@mui/material';

import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import ManageSessions from 'src/components/school/components/ManageSessions';
import ManageWeeks from 'src/components/school/components/ManageWeeks';
import HolidayModal from 'src/components/school/components/HolidayModal';
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog';
import AddSessionModal from 'src/components/school/components/AddSessionModal';
import SetSessionTermModal from 'src/components/school/components/SetSessionTermModal';
import HolidayTab from 'src/components/school/components/HolidayTab';

const BCrumb = [
  {
    to: '/',
    title: 'School Dashboard',
  },
  {
    title: 'School Calendar',
  },
];

const SessionWeekManager = () => {
  const [mainTab, setMainTab] = useState(0);
  const [sessionTab, setSessionTab] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [modalActionType, setModalActionType] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [confirmAction, setConfirmAction] = useState('');
  const [sessionsData, setSessionsData] = useState(null);
  const [addSessionModalOpen, setAddSessionModalOpen] = useState(false);
  const [setSessionTermModalOpen, setSetSessionTermModalOpen] = useState(false);

  const handleSessionAction = (action, session) => {
    setSelectedSession(session);
    setConfirmAction(action);
    setConfirmDialogOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (selectedSession && confirmAction) {
      const newStatus = confirmAction === 'activate' ? 'ACTIVE' : 'INACTIVE';

      // Update the session status
      const updatedSession = {
        ...selectedSession,
        status: newStatus,
      };

      console.log(`${confirmAction} session:`, updatedSession);

      // Trigger refresh to update the data
      setSessionsData(updatedSession);

      setConfirmDialogOpen(false);
      setConfirmAction('');
      setSelectedSession(null);
    }
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setConfirmAction('');
    setSelectedSession(null);
  };

  const handleOpenModal = (actionType) => {
    setModalActionType(actionType);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalActionType('');
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleMainTabChange = (event, newValue) => {
    setMainTab(newValue);
  };

  const handleSessionTabChange = (event, newValue) => {
    setSessionTab(newValue);
  };

  const handleAddSessionClick = () => {
    if (sessionTab === 0) {
      setAddSessionModalOpen(true);
    } else {
      setSetSessionTermModalOpen(true);
    }
  };

  const handleAddSessionSubmit = (newSession) => {
    console.log('New session added:', newSession);
    setSessionsData(newSession);
    setAddSessionModalOpen(false);
  };

  const handleSetSessionTermSubmit = (newSessionTerm) => {
    console.log('New session/term set:', newSessionTerm);
    setSessionsData(newSessionTerm);
    setSetSessionTermModalOpen(false);
  };

  const handleCloseAddSessionModal = () => {
    setAddSessionModalOpen(false);
  };

  const handleCloseSetSessionTermModal = () => {
    setSetSessionTermModalOpen(false);
  };

  return (
    <PageContainer title="School Calendar" description="Manage academic sessions and weeks">
      <Breadcrumb title="School Calendar" items={BCrumb} />

      <Card variant="outlined">
        <CardContent>
          {/* Main Tabs */}
          <Tabs value={mainTab} onChange={handleMainTabChange} sx={{ mb: 3 }}>
            <Tab label="Session/Weeks Manager" />
            <Tab label="Set Holiday" />
          </Tabs>

          {mainTab === 0 && (
            <Grid container spacing={3}>
              <Grid item size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h5" fontWeight={600}>
                        Manage Sessions
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleAddSessionClick}
                      >
                        {sessionTab === 0 ? 'Add Session' : 'Set Session/Term'}
                      </Button>
                    </Box>

                    <Tabs value={sessionTab} onChange={handleSessionTabChange} sx={{ mb: 2 }}>
                      <Tab label="All Sessions" />
                      <Tab label="Session/Term" />
                    </Tabs>

                    <ManageSessions
                      activeTab={sessionTab}
                      onSessionAction={handleSessionAction}
                      updatedSession={sessionsData}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h5" fontWeight={600}>
                        Manage Weeks
                      </Typography>
                    </Box>

                    <ManageWeeks />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {mainTab === 1 && <HolidayTab handleRefresh={handleRefresh} />}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmStatusChange}
        title={confirmAction === 'activate' ? 'Activate Session' : 'Deactivate Session'}
        message={`Are you sure you want to ${confirmAction} "${
          selectedSession?.name || selectedSession?.sessionTerm
        }"?`}
        confirmText={confirmAction === 'activate' ? 'Activate' : 'Deactivate'}
        cancelText="Cancel"
        severity={confirmAction === 'activate' ? 'primary' : 'error'}
      />
      <AddSessionModal
        open={addSessionModalOpen}
        onClose={handleCloseAddSessionModal}
        onSubmit={handleAddSessionSubmit}
      />
      <SetSessionTermModal
        open={setSessionTermModalOpen}
        onClose={handleCloseSetSessionTermModal}
        onSubmit={handleSetSessionTermSubmit}
      />
    </PageContainer>
  );
};

export default SessionWeekManager;
