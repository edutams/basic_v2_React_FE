import React from 'react';
import { useFormik } from 'formik';
import ReusableModal from '../../shared/ReusableModal';
import AgentForm from './AgentForm';
import SchoolsView from './SchoolsView';
import PermissionManager from './PermissionManager';
import SetCommissionModal from './SetCommission';
import ManageReferralModal from './ManageReferral';
import ManageGateway from './ManageGateway';
import ChangeColorScheme from './ChangeColorScheme';
import { agentValidationSchema } from '../validation/agentValidationSchema';
import PropTypes from 'prop-types';
import agentApi from '../../../api/agent';

const getModalConfig = (actionType) => {
  const configs = {
    create: {
      title: 'Create Agent',
      size: 'large',
    },
    update: {
      title: 'Update Agent',
      size: 'large',
    },
    viewSchools: {
      title: 'View Schools',
      size: 'medium',
    },
    managePermissions: {
      title: 'Edit Permissions',
      size: 'large',
    },
    setCommission: {
      title: 'Set Commission',
      size: 'small',
    },
    manageReferral: {
      title: 'Manage Referral',
      size: 'small',
    },
    manageGateway: {
      title: 'Manage Gateway',
      size: 'small',
    },
    changeColorScheme: {
      title: 'Change Color Scheme',
      size: 'large',
    },
  };

  return configs[actionType] || configs.create;
};

const AgentModal = ({ 
  open, 
  onClose, 
  handleRefresh, 
  selectedAgent, 
  actionType = 'create' 
}) => {
  console.log('selectedAgent:', selectedAgent);
  console.log('actionType:', actionType);

  const shouldPrefillForm = actionType === 'update' || actionType === 'changeColorScheme';
  const modalConfig = getModalConfig(actionType);

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

  const [loading, setLoading] = React.useState(false);

  // ... (existing code)

  const handleSaveClick = async (values) => {
    setLoading(true);
    try {
        const payload = {
            org_name: values.organizationName,
            org_title: values.organizationTitle,
            name: values.agentDetails,
            email: values.contactDetails,
            phone: values.agentPhone,
            address: values.contactAddress,
            lga_id: values.lga,
            headcolor: values.headerColor || 'default',
            sidecolor: values.sidebarColor || 'default',
            bodycolor: values.bodyColor || 'default',
        };

        const response = await agentApi.create(payload);

        if(response.success){
            const newAgent = response.data;
            handleRefresh(newAgent); 
            resetForm();
            onClose();
        } else {
            console.error("Failed to create agent:", response.message);
            // Handle specific logic errors if any
        }
    } catch (error) {
        console.error("Error creating agent:", error);
        if (error.response && error.response.status === 422) {
            const backendErrors = error.response.data.errors;
            const mappedErrors = {};
            
            // Map backend fields to formik fields
            if (backendErrors.org_name) mappedErrors.organizationName = backendErrors.org_name[0];
            if (backendErrors.org_title) mappedErrors.organizationTitle = backendErrors.org_title[0];
            if (backendErrors.name) mappedErrors.agentDetails = backendErrors.name[0];
            if (backendErrors.email) mappedErrors.contactDetails = backendErrors.email[0];
            if (backendErrors.phone) mappedErrors.agentPhone = backendErrors.phone[0];
            if (backendErrors.address) mappedErrors.contactAddress = backendErrors.address[0];
            if (backendErrors.lga_id) mappedErrors.lga = backendErrors.lga_id[0];

            formik.setErrors(mappedErrors);
        }
    } finally {
        setLoading(false);
    }
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

  const renderContent = () => {
    switch (actionType) {
      case 'viewSchools':
        return <SchoolsView selectedAgent={selectedAgent} />;
      
      case 'managePermissions':
        return (
          <PermissionManager
            selectedAgent={selectedAgent}
            onSave={handleUpdate}
            onCancel={handleClose}
          />
        );
      
      case 'setCommission':
        return (
          <SetCommissionModal
            selectedAgent={selectedAgent}
            onSave={handleUpdate}
            onClose={handleClose}
          />
        );
      
      case 'manageReferral':
        return (
          <ManageReferralModal
            selectedAgent={selectedAgent}
            onSave={handleUpdate}
            onClose={handleClose}
          />
        );
      
      case 'manageGateway':
        return (
          <ManageGateway
            selectedAgent={selectedAgent}
            onSave={handleUpdate}
            onClose={handleClose}
          />
        );
      
      case 'changeColorScheme':
        return (
          <ChangeColorScheme
            selectedAgent={selectedAgent}
            onSave={handleUpdate}
            onClose={handleClose}
          />
        );
      
      case 'create':
      default:
        return (
          <AgentForm
            formik={formik}
            onCancel={handleClose}
            actionType={actionType}
            loading={loading}
          />
        );
    }
  };

  return (
    <ReusableModal
      open={open}
      onClose={handleClose}
      title={modalConfig.title}
      size={modalConfig.size}
      disableEnforceFocus
      disableAutoFocus
    >
      {renderContent()}
    </ReusableModal>
  );
};

AgentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handleRefresh: PropTypes.func.isRequired,
  selectedAgent: PropTypes.object,
  actionType: PropTypes.oneOf([
    'create',
    'update',
    'viewSchools',
    'managePermissions',
    'setCommission',
    'manageReferral',
    'manageGateway',
    'changeColorScheme',
  ]),
};

export default AgentModal;
