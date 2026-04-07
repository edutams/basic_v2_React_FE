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
import { useAuth } from '../../../hooks/useAuth';
import { useNotification } from '../../../hooks/useNotification';

const getModalConfig = (actionType) => {
  const configs = {
    create: {
      title: 'Create Organization',
      size: 'extraLarge',
    },
    update: {
      title: 'Update Organization',
      size: 'extraLarge',
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
      title: 'Edit Commission Percentage',
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

const AgentModal = ({ open, onClose, handleRefresh, selectedAgent, actionType = 'create' }) => {
  const notify = useNotification();

  const { user } = useAuth();
  const canSelectColor = user.organization.access_level < 2;

  const shouldPrefillForm = actionType === 'update' || actionType === 'changeColorScheme';
  const modalConfig = getModalConfig(actionType);

  const initialValues = {
    organizationName: shouldPrefillForm ? (selectedAgent?.organizationName || selectedAgent?.organization_name || selectedAgent?.name || '') : '',
    organizationDomain: shouldPrefillForm ? (selectedAgent?.organizationDomain || selectedAgent?.organization_domain || '') : '',
    contactDetails: shouldPrefillForm ? (selectedAgent?.contactDetails || selectedAgent?.organization_email || selectedAgent?.email || '') : '',
    agentPhone: shouldPrefillForm ? (selectedAgent?.phoneNumber || selectedAgent?.agentPhone || selectedAgent?.organization_phone || selectedAgent?.phone || '') : '',
    contactAddress: shouldPrefillForm ? (selectedAgent?.contactAddress || selectedAgent?.organization_address || selectedAgent?.address || '') : '',
    stateFilter: shouldPrefillForm ? (selectedAgent?.state_id || selectedAgent?.stateFilter || '') : '',
    lga: shouldPrefillForm ? (selectedAgent?.lga_id || selectedAgent?.lga || selectedAgent?.state_lga_id || '') : '',
    primaryColor: shouldPrefillForm ? (selectedAgent?.primaryColor || selectedAgent?.primary_color || '') : '',
    fname: shouldPrefillForm ? (selectedAgent?.fname || '') : '',
    lname: shouldPrefillForm ? (selectedAgent?.lname || '') : '',
    mname: shouldPrefillForm ? (selectedAgent?.mname || '') : '',
    email: shouldPrefillForm ? (selectedAgent?.email || '') : '',
    phone: shouldPrefillForm ? (selectedAgent?.phone || '') : '',
    organizationLogo: shouldPrefillForm ? (selectedAgent?.organization_logo || '') : '',
    adminAvatar: shouldPrefillForm ? (selectedAgent?.avatar || '') : '',
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
        organization_name: values.organizationName,
        organization_domain: values.organizationDomain,
        organization_email: values.contactDetails,
        organization_phone: values.agentPhone,
        organization_address: values.contactAddress,
        state_lga_id: values.lga,
        primary_color: values.primaryColor || null,
        fname: values.fname,
        lname: values.lname,
        mname: values.mname,
        email: values.email,
        phone: values.phone,
        organization_logo: values.organizationLogo,
        admin_avatar: values.adminAvatar,
      };


      const response = await agentApi.createAgent(payload);

      if (response.status === true) {
        const newAgent = response.data;
        handleRefresh(newAgent);
        notify.success('Organization created successfully!');
        resetForm();
        onClose();
      } else {
        console.error('Failed to create agent:', response.data?.message);
        notify.error(response?.data?.message || 'Failed to create agent');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      if (error.response && error.response.status === 422) {
        const backendErrors = error.response.data.errors;
        const mappedErrors = {};

        // Map backend fields to formik fields
        if (backendErrors.organization_name) mappedErrors.organizationName = backendErrors.organization_name[0];
        if (backendErrors.organization_domain) mappedErrors.organizationDomain = backendErrors.organization_domain[0];
        if (backendErrors.organization_email) mappedErrors.contactDetails = backendErrors.organization_email[0];
        if (backendErrors.organization_phone) mappedErrors.agentPhone = backendErrors.organization_phone[0];
        if (backendErrors.organization_address) mappedErrors.contactAddress = backendErrors.organization_address[0];
        if (backendErrors.state_lga_id) mappedErrors.lga = backendErrors.state_lga_id[0];
        if (backendErrors.fname) mappedErrors.fname = backendErrors.fname[0];
        if (backendErrors.lname) mappedErrors.lname = backendErrors.lname[0];
        if (backendErrors.mname) mappedErrors.mname = backendErrors.mname[0];
        if (backendErrors.email) mappedErrors.email = backendErrors.email[0];
        if (backendErrors.phone) mappedErrors.phone = backendErrors.phone[0];
        if (backendErrors.organization_logo) mappedErrors.organizationLogo = backendErrors.organization_logo[0];
        if (backendErrors.admin_avatar) mappedErrors.adminAvatar = backendErrors.admin_avatar[0];

        formik.setErrors(mappedErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const payload = {
        organization_name: values.organizationName,
        organization_domain: values.organizationDomain,
        organization_email: values.contactDetails,
        organization_phone: values.agentPhone,
        organization_address: values.contactAddress,
        state_lga_id: values.lga,
        access_level: selectedAgent?.access_level || '2',
        primary_color: values.primaryColor || null,
        status: (selectedAgent?.status === 'Active' || selectedAgent?.status === 'active') ? 'active' : 'inactive',
        mname: values.mname,
        email: values.email,
        phone: values.phone,
        fname: values.fname,
        lname: values.lname,
        organization_logo: values.organizationLogo,
        admin_avatar: values.adminAvatar,
      };

      const agentId = selectedAgent?.id || selectedAgent?.s_n;
      const response = await agentApi.update(agentId, payload);

      if (response.status === true) {
        handleRefresh(response.data);
        notify.success('Organization updated successfully!');
        resetForm();
        onClose();
      } else {
        console.error('Update returned invalid response', response);
        notify.error('Failed to update organization.');
      }
    } catch (error) {
      console.error('Agent update failed:', error);
      if (error.response && error.response.status === 422) {
        const backendErrors = error.response.data.errors;
        const mappedErrors = {};

        if (backendErrors.org_name) mappedErrors.organizationName = backendErrors.org_name[0];
        // if (backendErrors.name) mappedErrors.agentDetails = backendErrors.name[0];
        if (backendErrors.email) mappedErrors.contactDetails = backendErrors.email[0];
        if (backendErrors.phone) mappedErrors.agentPhone = backendErrors.phone[0];
        if (backendErrors.address) mappedErrors.contactAddress = backendErrors.address[0];
        if (backendErrors.state_lga_id) mappedErrors.lga = backendErrors.state_lga_id[0];
        if (backendErrors.fname) mappedErrors.fname = backendErrors.fname[0];
        if (backendErrors.lname) mappedErrors.lname = backendErrors.lname[0];
        if (backendErrors.mname) mappedErrors.mname = backendErrors.mname[0];
        if (backendErrors.email) mappedErrors.email = backendErrors.email[0];
        if (backendErrors.phone) mappedErrors.phone = backendErrors.phone[0];
        if (backendErrors.organization_logo) mappedErrors.organizationLogo = backendErrors.organization_logo[0];
        if (backendErrors.admin_avatar) mappedErrors.adminAvatar = backendErrors.admin_avatar[0];

        formik.setErrors(mappedErrors);
      }
    } finally {
      setLoading(false);
    }
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
            loading={loading}
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
            canSelectColor={canSelectColor}
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
