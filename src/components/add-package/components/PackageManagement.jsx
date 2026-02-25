import React, { useState, useMemo } from 'react';
import { Box, Grid as Grid } from '@mui/material';
import PageContainer from '../../container/PageContainer';
import Breadcrumb from '../../../layouts/full/shared/breadcrumb/Breadcrumb';
import PackageTable from './PackageTable';
import ModuleManagement from './ModuleManagement';
import PackageModal from './PackageModal';
import ManageModulesModal from './ManageModulesModal';
import PropTypes from 'prop-types';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Packages' },
];

const PackageManagement = ({ 
  packages = [], 
  modules = [],
  onPackageUpdate,
  onModuleUpdate,
  isLoading = false 
}) => {
  const [currentPackage, setCurrentPackage] = useState(null);
  const [packageModules, setPackageModules] = useState([]);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [packageActionType, setPackageActionType] = useState('create');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [manageModulesOpen, setManageModulesOpen] = useState(false);
  const [view, setView] = useState('list'); // 'list' or 'modules'

  const currentPackageModules = useMemo(() => {
    if (!currentPackage) return [];
    return modules.filter(module => module.packageId === currentPackage.id);
  }, [modules, currentPackage]);

  const handlePackageAction = (action, package_ = null) => {
    switch (action) {
      case 'create':
        setPackageActionType('create');
        setSelectedPackage(null);
        setPackageModalOpen(true);
        break;

      case 'update':
        setPackageActionType('update');
        setSelectedPackage(package_);
        setPackageModalOpen(true);
        break;

      case 'activate':
        setPackageActionType('activate');
        setSelectedPackage(package_);
        setPackageModalOpen(true);
        break;

      case 'deactivate':
        setPackageActionType('deactivate');
        setSelectedPackage(package_);
        setPackageModalOpen(true);
        break;

      // case 'viewModules':
      case 'manageModules':
        setCurrentPackage(package_);
        setPackageModules(package_.modules || []);
        setView('modules');
        break;

      // case 'manageModules':
      //   setCurrentPackage(package_);
      //   setManageModulesOpen(true);
      //   break;

      default:
        break;
    }
  };

  const handlePackageUpdate = (packageData, operation) => {
    onPackageUpdate(packageData, operation);
    
    if (currentPackage && packageData.id === currentPackage.id) {
      setCurrentPackage(packageData);
    }
  };

  const handleAttachModule = () => {
    if (currentPackage) {
      setManageModulesOpen(true);
    }
  };

  const handleModuleUpdate = (moduleData, operation) => {
    onModuleUpdate(moduleData, operation);
    
    if (currentPackage) {
      if (operation === 'create') {
        setPackageModules(prev => [...prev, moduleData]);
      } else if (operation === 'update') {
        setPackageModules(prev => 
          prev.map(mod => mod.id === moduleData.id ? moduleData : mod)
        );
      } else if (operation === 'delete') {
        setPackageModules(prev => 
          prev.filter(mod => mod.id !== moduleData.id)
        );
      }
    }
  };

  const handleModuleAssignment = (package_, assignedModules, unassignedModules) => {
    assignedModules.forEach(module => {
      const updatedModule = { ...module, packageId: package_.id };
      onModuleUpdate(updatedModule, 'update');
    });

    unassignedModules.forEach(module => {
      const updatedModule = { ...module, packageId: null };
      onModuleUpdate(updatedModule, 'update');
    });

    if (currentPackage && currentPackage.id === package_.id) {
      setPackageModules(assignedModules);
    }
  };

  return (
    <PageContainer title="Packages" description="Manage packages and their modules">
      <Breadcrumb title="Packages" items={BCrumb} />
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: view === 'modules' ? 7 : 12 }}>
          <PackageTable
            packages={packages}
            onPackageAction={handlePackageAction}
            isLoading={isLoading}
          />
        </Grid>

        {view === 'modules' && (
          <Grid size={{ xs: 12, md: 5 }}>
            <ModuleManagement
              packageModules={packageModules}
              currentPackage={currentPackage}
              onModuleUpdate={handleModuleUpdate}
              onAttachModule={handleAttachModule}
              isLoading={isLoading}
              onBack={() => setView('list')}
            />
          </Grid>
        )}
      </Grid>

      <PackageModal
        open={packageModalOpen}
        onClose={() => setPackageModalOpen(false)}
        actionType={packageActionType}
        selectedPackage={selectedPackage}
        onPackageUpdate={handlePackageUpdate}
        isLoading={isLoading}
      />

      <ManageModulesModal
        open={manageModulesOpen}
        onClose={() => setManageModulesOpen(false)}
        currentPackage={currentPackage}
        allModules={modules}
        packageModules={currentPackageModules}
        onModuleAssignment={handleModuleAssignment}
        isLoading={isLoading}
      />
    </PageContainer>
  );
};

PackageManagement.propTypes = {
  packages: PropTypes.array,
  modules: PropTypes.array,
  onPackageUpdate: PropTypes.func.isRequired,
  onModuleUpdate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default PackageManagement;
