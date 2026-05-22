import React, { useState, useEffect } from 'react';
import PackageManagement from '../../../../components/landlord/add-package/components/PackageManagement';
import { useNotification } from '@/hooks/useNotification';
import eduTierApi from '@/api/landlord/edutier/eduTierApi';

const Package = () => {
  const [packages, setPackages] = useState([]);
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const notify = useNotification();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [packagesData, modulesData] = await Promise.all([
        eduTierApi.getPackages(),
        eduTierApi.getModules(),
      ]);
      setPackages(packagesData.data);
      // Handle both simple array and paginated response
      const modulesList = Array.isArray(modulesData.data)
        ? modulesData.data
        : modulesData.data?.data || [];
      setModules(modulesList);
    } catch (error) {
      notify.error('Failed to fetch packages or modules', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePackageUpdate = async (packageData, operation) => {
    setIsLoading(true);
    try {
      if (operation === 'create' || operation === 'update') {
        await eduTierApi.savePackage(packageData);
        notify.success(
          `Package ${operation === 'create' ? 'created' : 'updated'} successfully`,
          'Success',
        );
      } else if (operation === 'delete') {
        await eduTierApi.deletePackage(packageData.id);
        notify.success('Package deleted successfully', 'Success');
      }
      fetchData();
    } catch (error) {
      notify.error(`Failed to ${operation} package`, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModuleUpdate = async (moduleData, operation) => {
    setIsLoading(true);
    try {
      if (operation === 'batch_update') {
        // Handle batch updates - update all modules at once
        await eduTierApi.batchUpdateModules(moduleData.packageId, moduleData.modules);
        notify.success('Modules updated successfully', 'Success');
      } else if (operation === 'create' || operation === 'update') {
        await eduTierApi.saveModule(moduleData);
        notify.success(
          `Module ${operation === 'create' ? 'created' : 'updated'} successfully`,
          'Success',
        );
      } else if (operation === 'delete') {
        await eduTierApi.deleteModule(moduleData.id);
        notify.success('Module deleted successfully', 'Success');
      } else if (operation === 'status_change') {
        // Only update module status for tenants under this agent
        // Do NOT update the agent-level module
        const status = moduleData.module_status;
        await eduTierApi.deactivateModuleForTenants(moduleData.id, status);
        notify.success(
          `Module ${status === 'active' ? 'activated' : 'deactivated'} for all tenants`,
          'Success',
        );
      }
      fetchData();
    } catch (error) {
      notify.error(`Failed to ${operation} module`, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PackageManagement
      packages={packages}
      modules={modules}
      onPackageUpdate={handlePackageUpdate}
      onModuleUpdate={handleModuleUpdate}
      isLoading={isLoading}
    />
  );
};

export default Package;
