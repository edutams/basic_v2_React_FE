import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import { useFormik } from 'formik';
import AgentForm from './components/AgentForm';
import SchoolsView from './components/SchoolsView';
import PermissionManager from './components/PermissionManager';
import SetCommissionModal from './components/SetCommission';
import ManageReferralModal from './components/ManageReferral';
import ManageGateway from './components/ManageGateway';
import ChangeColorScheme from './components/ChangeColorScheme';
import { agentValidationSchema } from './validation/agentValidationSchema';

import CloseIcon from '@mui/icons-material/Close';

const getModalStyle = (actionType) => {
  const baseStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  if (actionType === 'changeColorScheme') {
    return {
      ...baseStyle,
      width: '90%',
      maxWidth: 850, 
    };
  }

  if (actionType === 'setCommission' || actionType === 'manageReferral' || actionType === 'manageGateway') {
    return {
      ...baseStyle,
      width: '90%',
      maxWidth: 500, 
    };
  }

  return {
    ...baseStyle,
    width: '60%',
    maxWidth: 800, 
  };
};

const AddAgentModal = ({ open, onClose, handleRefresh, selectedAgent, actionType }) => {
  console.log('selectedAgent:', selectedAgent);
  console.log('actionType:', actionType);

  const shouldPrefillForm = actionType === 'update' || actionType === 'changeColorScheme';

  const initialValues = {
    organizationName: shouldPrefillForm ? (selectedAgent?.organizationName || '') : '',
    organizationTitle: shouldPrefillForm ? (selectedAgent?.organizationTitle || '') : '',
    agentDetails: shouldPrefillForm ? (selectedAgent?.agentDetails || '') : '',
    contactDetails: shouldPrefillForm ? (selectedAgent?.contactDetails || '') : '',
    agentPhone: shouldPrefillForm ? (selectedAgent?.phoneNumber || '') : '',
    contactAddress: shouldPrefillForm ? (selectedAgent?.contactAddress || '') : '',
    stateFilter: shouldPrefillForm ? (selectedAgent?.stateFilter || '') : '',
    lga: shouldPrefillForm ? (selectedAgent?.lga || '') : '',
    headerColor: shouldPrefillForm ? (selectedAgent?.headerColor || '') : '',
    sidebarColor: shouldPrefillForm ? (selectedAgent?.sidebarColor || '') : '',
    bodyColor: shouldPrefillForm ? (selectedAgent?.bodyColor || '') : '',
    accessLevel: shouldPrefillForm ? (selectedAgent?.accessLevel || '') : '',
    permissions: shouldPrefillForm ? (selectedAgent?.permissions || []) : [],
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
      <Box sx={getModalStyle(actionType)}>
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        <Typography variant="h6" mb={2}>
          {actionType === 'update'
            ? 'Update Agent'
            : actionType === 'viewSchools'
            ? 'View Schools'
            : actionType === 'managePermissions'
            ? 'Edit Permissions'
            : actionType === 'setCommission'
            ? 'Set Commission'
            : actionType === 'manageReferral'
            ? 'Manage Referral'
            : actionType === 'manageGateway'
            ? 'Manage Gateway'
            : actionType === 'changeColorScheme'
            ? 'Change Color Scheme'
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
        ) : actionType === 'setCommission' ? (
          <SetCommissionModal
            selectedAgent={selectedAgent}
            onSave={handleUpdate}
            onClose={handleClose}
          />
        ) : actionType === 'manageReferral' ? (
          <ManageReferralModal
            selectedAgent={selectedAgent}
            onSave={handleUpdate}
            onClose={handleClose}
          />
        ) : actionType === 'manageGateway' ? (
          <ManageGateway
            selectedAgent={selectedAgent}
            onSave={handleUpdate}
            onClose={handleClose}
          />
        ) : actionType === 'changeColorScheme' ? (
          <ChangeColorScheme
            selectedAgent={selectedAgent}
            onSave={handleUpdate}
            onClose={handleClose}
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
