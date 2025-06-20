import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import AgentForm from './components/AgentForm';
import SchoolsView from './components/SchoolsView';
import PermissionManager from './components/PermissionManager';
import { agentValidationSchema } from './validation/agentValidationSchema';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '60%',
  maxWidth: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const AddAgentModal = ({ open, onClose, handleRefresh, selectedAgent, actionType }) => {
  console.log('selectedAgent:', selectedAgent);
  const initialValues = {
    organizationName: selectedAgent?.organizationName || '',
    organizationTitle: selectedAgent?.organizationTitle || '',
    agentDetails: selectedAgent?.agentDetails || '',
    contactDetails: selectedAgent?.contactDetails || '',
    agentPhone: selectedAgent?.phoneNumber || '',
    contactAddress: selectedAgent?.contactAddress || '',
    stateFilter: selectedAgent?.stateFilter || '',
    lga: selectedAgent?.lga || '',
    level: selectedAgent?.level || '',
    headerColor: selectedAgent?.headerColor || '',
    sidebarColor: selectedAgent?.sidebarColor || '',
    bodyColor: selectedAgent?.bodyColor || '',
    accessLevel: selectedAgent?.accessLevel || '', 
    permissions: selectedAgent?.permissions || [],
  };
  console.log('initialValues:', initialValues);


  const formik = useFormik({
    initialValues,
    validationSchema: agentValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (actionType === 'update') {
        handleUpdate(values);
      } else {
        handleSaveClick(values);
      }
    },
  });

  const resetForm = () => {
    formik.resetForm();
  };

  const handleSaveClick = (values) => {
    const updatedData = {
      ...values,
      s_n: Date.now(),
      phoneNumber: values.agentPhone,
      performance: 'School: 0',
      gateway: 'No Gateway',
      colourScheme: formik.values.bodyColor,
      headerColor: formik.values.headerColor,
      sidebarColor: formik.values.sidebarColor,
      status: 'Inactive',
      action: 'Edit',
    };

    handleRefresh(updatedData);
    resetForm();
    onClose();
  };

  const handleUpdate = (values) => {
    const updatedData = {
      ...selectedAgent,
      ...values,
      phoneNumber: values.agentPhone,
      colourScheme: formik.values.bodyColor,
      headerColor: formik.values.headerColor,
      sidebarColor: formik.values.sidebarColor,
    };

    handleRefresh(updatedData);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} keepMounted
    disableEnforceFocus
    disableAutoFocus
  >
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          {actionType === 'update'
            ? 'Update Agent'
            : actionType === 'viewSchools'
            ? 'View Schools'
            : actionType === 'managePermissions'
            ? 'Manage Permissions'
            : 'Create Agent'}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {actionType === 'viewSchools' ? (
          <SchoolsView selectedAgent={selectedAgent} />
        ) : actionType === 'managePermissions' ? (
          <PermissionManager
            selectedAgent={selectedAgent}
            onSave={handleUpdate}
            onCancel={handleClose}
          />
        ) : (
          <AgentForm
            formik={formik}
            onCancel={handleClose}
            actionType={actionType}
          />
        )}
      </Box>
    </Modal>
  );
};

export default AddAgentModal;
