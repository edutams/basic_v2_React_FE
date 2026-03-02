import React, { useState, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';

import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import { useTenantAuth } from 'src/hooks/useTenantAuth';
import useNotification from 'src/hooks/useNotification';
import tenantApi from 'src/api/tenant_api';
import ManageSessions from 'src/components/school/components/ManageSessions';
import ManageWeeks from 'src/components/school/components/ManageWeeks';
import HolidayModal from 'src/components/school/components/HolidayModal';
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog';
import SetSessionTermModal from 'src/components/school/components/SetSessionTermModal';
import HolidayTab from 'src/components/school/components/HolidayTab';

const BCrumb = [
  {
    to: '/',
    title: 'School Dashboard',
  },
  {
    title: 'Session/Term Mapping',
  },
];

const SessionWeekManager = () => {
  const { user } = useTenantAuth();
  const isTenant = !!user;
  const notify = useNotification();

  const [mainTab, setMainTab] = useState(0);
  const [sessionTab, setSessionTab] = useState(isTenant ? 1 : 0);
  const [openModal, setOpenModal] = useState(false);
  const [modalActionType, setModalActionType] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [confirmAction, setConfirmAction] = useState('');
  const [sessionsData, setSessionsData] = useState(null);
  const [addSessionModalOpen, setAddSessionModalOpen] = useState(false);
  const [setSessionTermModalOpen, setSetSessionTermModalOpen] = useState(false);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isTenant) {
      const fetchMappings = async () => {
        setLoading(true);
        try {
          const response = await tenantApi.get('/session-mappings');
          setMappings(response.data);
        } catch (error) {
          console.error('Error fetching mappings:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMappings();
    }
  }, [isTenant]);

  const handleSessionAction = (action, session) => {
    setSelectedSession(session);
    setConfirmAction(action);
    setConfirmDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (selectedSession && confirmAction) {
      try {
        if (confirmAction === 'activate') {
          await tenantApi.post(`/session-mappings/${selectedSession.id}/activate`);
          notify.success('Session mapping activated successfully', 'Success');
        } else if (confirmAction === 'deactivate') {
          await tenantApi.post(`/session-mappings/${selectedSession.id}/deactivate`);
          notify.success('Session mapping deactivated successfully', 'Success');
        } else {
          // Handle other actions (delete, etc.)
          console.log(`Action ${confirmAction} on session ${selectedSession.id}`);
        }
        handleRefresh();
      } catch (error) {
        console.error(`Error performing ${confirmAction} on session:`, error);
        notify.error(`Failed to ${confirmAction} session mapping`, 'Error');
      } finally {
        setConfirmDialogOpen(false);
        setConfirmAction('');
        setSelectedSession(null);
      }
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
    if (isTenant) {
      const fetchMappings = async () => {
        setLoading(true);
        try {
          const response = await tenantApi.get('/session-mappings');
          setMappings(response.data);
        } catch (error) {
          console.error('Error fetching mappings:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMappings();
    }
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
    <PageContainer title="Session/Term Mapping" description="Manage academic sessions and weeks">
      <Breadcrumb title="Session/Term Mapping" items={BCrumb} />

      <Card variant="outlined">
        <CardContent>
          {/* Main Tabs */}
            <Tabs
              value={mainTab}
              onChange={handleMainTabChange}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            >
              <Tab label="Session/Term Mapping" />
              <Tab label="Week Manager" />
              <Tab label="Set Holiday" />
            </Tabs>

          {mainTab === 0 && (
            <Box>
              {loading ? (
                <Box display="flex" justifyContent="center" py={5}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <ManageSessions
                  activeTab={1} // Force Session/Term tab for tenants
                  onSessionAction={handleSessionAction}
                  updatedSession={sessionsData}
                  data={mappings}
                  isReadOnly={false} // Allow actions for tenants now
                />
              )}
            </Box>
          )}

          {mainTab === 1 && (
            <Box>
              <ManageWeeks sessionTermId={mappings.find(m => m.status?.toUpperCase() === 'ACTIVE')?.id} />
            </Box>
          )}

          {mainTab === 2 && <HolidayTab handleRefresh={handleRefresh} />}
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
      <SetSessionTermModal
        open={setSessionTermModalOpen}
        onClose={handleCloseSetSessionTermModal}
        onSubmit={handleSetSessionTermSubmit}
      />
    </PageContainer>
  );
};

export default SessionWeekManager;
