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
    if (action === 'create') {
      setSelectedGateway(null);
      setGatewayModalOpen(true);
    } else if (action === 'update') {
      setSelectedGateway(gateway);
      setGatewayModalOpen(true);
    } else if (action === 'delete') {
      setSelectedGateway(gateway);
      setGatewayToDelete(gateway);
      setDeleteDialogOpen(true);
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
    if (operation === 'create') {
      notify.success('Gateway registered successfully', 'Success');
    } else if (operation === 'update') {
      notify.success('Gateway updated successfully', 'Success');
    }
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

export default function GatewayPage() {
  const [gateways, setGateways] = useState([
    { id: 1, gateway_name: 'Auto_credit', gateway_status: 'active' },
  ]);

  const handleGatewayUpdate = (gatewayData, operation) => {
    if (operation === 'create') {
      setGateways((prev) => [...prev, gatewayData]);
    } else if (operation === 'update') {
      setGateways((prev) => prev.map((g) => g.id === gatewayData.id ? gatewayData : g));
    } else if (operation === 'delete') {
      setGateways((prev) => prev.filter((g) => g.id !== gatewayData.id));
    }
  };

  return (
    <GatewayManagement
      gateways={gateways}
      onGatewayUpdate={handleGatewayUpdate}
      isLoading={false}
    />
  );
}
