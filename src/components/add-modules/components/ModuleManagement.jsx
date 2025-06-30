import React, { useState } from 'react';
import { Box } from '@mui/material';
import PageContainer from '../../container/PageContainer';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import ModuleTable from './ModuleTable';
import ModuleModal from './ModuleModal';
import ConfirmationDialog from '../../shared/ConfirmationDialog';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Modules' },
];

const ModuleManagement = ({ 
  modules = [], 
  onModuleUpdate,
  isLoading = false 
}) => {
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [moduleActionType, setModuleActionType] = useState('create');
  const [selectedModule, setSelectedModule] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState(null);

  const handleModuleAction = (action, module = null) => {
    switch (action) {
      case 'create':
        setModuleActionType('create');
        setSelectedModule(null);
        setModuleModalOpen(true);
        break;

      case 'update':
        setModuleActionType('update');
        setSelectedModule(module);
        setModuleModalOpen(true);
        break;

      case 'activate':
        setModuleActionType('activate');
        setSelectedModule(module);
        setModuleModalOpen(true);
        break;

      case 'deactivate':
        setModuleActionType('deactivate');
        setSelectedModule(module);
        setModuleModalOpen(true);
        break;

      case 'delete':
        setModuleToDelete(module);
        setDeleteDialogOpen(true);
        break;

      default:
        break;
    }
  };

  const handleModuleUpdate = (moduleData, operation) => {
    onModuleUpdate(moduleData, operation);
  };

  const handleConfirmDelete = () => {
    if (moduleToDelete) {
      onModuleUpdate(moduleToDelete, 'delete');
      Swal.fire('Success', 'Module deleted successfully', 'success');
    }
    setDeleteDialogOpen(false);
    setModuleToDelete(null);
  };

  return (
    <PageContainer title="Modules" description="Manage system modules and their configurations">
      <Breadcrumb title="Modules" items={BCrumb} />
      
      <Box sx={{ mt: 2 }}>
        <ModuleTable
          modules={modules}
          onModuleAction={handleModuleAction}
          isLoading={isLoading}
        />
      </Box>

      <ModuleModal
        open={moduleModalOpen}
        onClose={() => setModuleModalOpen(false)}
        actionType={moduleActionType}
        selectedModule={selectedModule}
        onModuleUpdate={handleModuleUpdate}
        isLoading={isLoading}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Module"
        message={`Are you sure you want to delete "${moduleToDelete?.mod_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </PageContainer>
  );
};

ModuleManagement.propTypes = {
  modules: PropTypes.array,
  onModuleUpdate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default ModuleManagement;
