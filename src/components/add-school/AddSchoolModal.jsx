import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import { useFormik } from 'formik';
import RegisterSchoolForm from './component/RegisterSchool';
import { schoolValidationScheme } from './validation/schoolValidationScheme';
import CloseIcon from '@mui/icons-material/Close';

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

// Helper function to generate incremental ID starting from 1
const getNextSchoolId = () => {
  const lastId = parseInt(localStorage.getItem('lastSchoolId')) || 0;
  const newId = lastId + 1;
  localStorage.setItem('lastSchoolId', newId);
  return newId;
};

const AddSchoolModal = ({
  open,
  onClose,
  handleRefresh,
  selectedAgent,
  actionType,
}) => {
  const initialValues = {
    institutionName: selectedAgent?.institutionName || '',
    institutionShortName: selectedAgent?.institutionShortName || '',
    institutionAddress: selectedAgent?.institutionAddress || '',
    administratorFirstName: selectedAgent?.administratorFirstName || '',
    administratorLastName: selectedAgent?.administratorLastName || '',
    administratorEmail: selectedAgent?.administratorEmail || '',
    administratorPhone: selectedAgent?.administratorPhone || '',
    stateFilter: selectedAgent?.stateFilter || '',
    lga: selectedAgent?.lga || '',
    moduleType: selectedAgent?.moduleType || '',
    headerColor: selectedAgent?.headerColor || '',
    sidebarColor: selectedAgent?.sidebarColor || '',
    bodyColor: selectedAgent?.bodyColor || '',
    registerSchool: selectedAgent?.registerSchool || '',
    permissions: selectedAgent?.permissions || [],
  };

  const formik = useFormik({
    initialValues,
    validationSchema: schoolValidationScheme,
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
      id: getNextSchoolId(), // ID starts from 1 and increments
      schoolUrl: `${values.institutionShortName.toLowerCase()}.edu`,
      gateway: 'No Gateway',
      colourScheme: values.bodyColor,
      headerColor: values.headerColor,
      sidebarColor: values.sidebarColor,
      status: 'Inactive',
      action: 'Edit',
      date: new Date().toISOString(),
    };

    handleRefresh(updatedData);  // Push to school list
    resetForm();
    onClose();                   // Close modal
  };

  const handleUpdate = (values) => {
    const updatedData = {
      ...selectedAgent,
      ...values,
      colourScheme: values.bodyColor,
      headerColor: values.headerColor,
      sidebarColor: values.sidebarColor,
    };

    handleRefresh(updatedData);  // Refresh parent table
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      keepMounted
      disableEnforceFocus
      disableAutoFocus
    >
      <Box sx={style}>
        {/* Close icon */}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" mb={2}>
          {actionType === 'update'
            ? 'Update Register School'
            : actionType === 'viewSchools'
            ? 'View Schools'
            : actionType === 'managePermissions'
            ? 'Manage Permissions'
            : 'Register School'}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <RegisterSchoolForm
          formik={formik}
          onCancel={handleClose}
          actionType={actionType}
        />
      </Box>
    </Modal>
  );
};

export default AddSchoolModal;
