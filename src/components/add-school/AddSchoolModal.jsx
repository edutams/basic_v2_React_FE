import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import { useFormik } from 'formik';
import { schoolValidationScheme } from './validation/schoolValidationScheme'; // Keep this import for school validation
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';

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

// Generate incremental ID starting from 1
const getNextId = (type) => {
  const key = type === 'session' ? 'lastSessionId' : 'lastSchoolId';
  const lastId = parseInt(localStorage.getItem(key)) || 0;
  const newId = lastId + 1;
  localStorage.setItem(key, newId);
  return newId;
};

const AddSchoolModal = ({
  open,
  onClose,
  handleRefresh,
  selectedAgent,
  actionType,
  formComponent: FormComponent,
  isSession = false,
}) => {
  const initialValues = isSession
    ? {
        sessionName: selectedAgent?.sessionName || '',
        status: selectedAgent?.status || 'Active',
        isCurrent: selectedAgent?.isCurrent || false,
      }
    : {
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
        headerColor: selectedAgent?.headerColor || '#ffffff',
        sidebarColor: selectedAgent?.sidebarColor || '#ffffff',
        bodyColor: selectedAgent?.bodyColor || '#ffffff',
        registerSchool: selectedAgent?.registerSchool || '',
        permissions: selectedAgent?.permissions || [],
      };

  const formik = useFormik({
    initialValues,
    validationSchema: isSession ? undefined : schoolValidationScheme,
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
    const updatedData = isSession
      ? {
          ...values,
          id: getNextId('session'),
          sessionName: values.sessionName || 'Unnamed Session',
          status: values.status || 'Pending',
          isCurrent: values.isCurrent ?? false,
        }
      : {
          ...values,
          id: getNextId('school'),
          schoolUrl: `${values.institutionShortName.toLowerCase()}.edu`,
          gateway: 'No Gateway',
          colourScheme: values.bodyColor,
          headerColor: values.headerColor,
          sidebarColor: values.sidebarColor,
          status: 'Inactive',
          action: 'Edit',
          date: new Date().toISOString(),
        };

    handleRefresh(updatedData);
    resetForm();
    onClose();
  };

  const handleUpdate = (values) => {
    const updatedData = isSession
      ? {
          ...selectedAgent,
          ...values,
          sessionName: values.sessionName || 'Unnamed Session',
          status: values.status || 'Pending',
          isCurrent: values.isCurrent ?? false,
        }
      : {
          ...selectedAgent,
          ...values,
          schoolUrl: `${values.institutionShortName.toLowerCase()}.edu`,
          colourScheme: values.bodyColor,
          headerColor: values.headerColor,
          sidebarColor: values.sidebarColor,
          date: new Date().toISOString(),
        };

    handleRefresh(updatedData);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getTitle = () => {
    if (isSession) {
      switch (actionType) {
        case 'update':
          return 'Edit Session';
        case 'view':
          return 'View Session';
        default:
          return 'Add New Session';
      }
    }
    switch (actionType) {
      case 'update':
        return 'Edit School';
      case 'viewSchools':
        return 'View Schools';
      case 'managePermissions':
        return 'Manage Permissions';
      default:
        return 'Register School';
    }
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
          {getTitle()}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <FormComponent
          formik={formik}
          onCancel={handleClose}
          actionType={actionType}
        />
      </Box>
    </Modal>
  );
};

AddSchoolModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handleRefresh: PropTypes.func.isRequired,
  selectedAgent: PropTypes.object,
  actionType: PropTypes.oneOf(['create', 'update', 'viewSchools', 'managePermissions', 'view']),
  formComponent: PropTypes.elementType.isRequired,
  isSession: PropTypes.bool,
};

export default AddSchoolModal;