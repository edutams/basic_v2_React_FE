import React, { useState } from 'react';
import { Box } from '@mui/material';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import GatewayTable from '../../components/gateway/components/GatewayTable';
import GatewayModal from '../../components/gateway/components/GatewayModal';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import PropTypes from 'prop-types';
import { useNotification } from '../../hooks/useNotification';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Gateways' },
];

const GatewayManagement = ({
  gateways = [],
  onGatewayUpdate,
  isLoading = false,
}) => {
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [actionType, setActionType] = useState('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gatewayToDelete, setGatewayToDelete] = useState(null);
  const notify = useNotification();

  const handleGatewayAction = (action, gateway = null) => {
    setActionType(action);
    setSelectedGateway(gateway);

    if (action === 'delete') {
      setGatewayToDelete(gateway);
      setDeleteDialogOpen(true);
    } else {
      setGatewayModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (gatewayToDelete) {
      onGatewayUpdate(gatewayToDelete, 'delete');
      notify.success('Gateway deleted successfully', 'Success');
    }
    setDeleteDialogOpen(false);
    setGatewayToDelete(null);
  };

  const handleGatewayUpdate = (gatewayData, operation) => {
    onGatewayUpdate(gatewayData, operation);
  };

  return (
    <PageContainer title="Gateways" description="Manage payment gateways">
      <Breadcrumb title="Gateways" items={BCrumb} />

      <Box sx={{ mt: 2 }}>
        <GatewayTable
          gateways={gateways}
          onGatewayAction={handleGatewayAction}
          isLoading={isLoading}
        />
      </Box>

      <GatewayModal
        open={gatewayModalOpen}
        onClose={() => setGatewayModalOpen(false)}
        actionType={actionType}
        selectedGateway={selectedGateway}
        onGatewayUpdate={handleGatewayUpdate}
        isLoading={isLoading}
      />

      {gatewayToDelete && (
        <ConfirmationDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Gateway"
          message={`Are you sure you want to delete "${gatewayToDelete.gateway_name}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          severity="error"
        />
      )}
    </PageContainer>
  );
};

GatewayManagement.propTypes = {
  gateways: PropTypes.array,
  onGatewayUpdate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default GatewayManagement;
