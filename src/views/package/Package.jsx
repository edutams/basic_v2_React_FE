import React, { useState, useEffect } from 'react';
import PackageManagement from '../../components/add-package/components/PackageManagement';
import { useNotification } from '../../hooks/useNotification';
import eduTierApi from '../../api/eduTierApi';

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
      setPackages(packagesData);
      setModules(modulesData);
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
        notify.success(`Package ${operation === 'create' ? 'created' : 'updated'} successfully`, 'Success');
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
      if (operation === 'create' || operation === 'update') {
        await eduTierApi.saveModule(moduleData);
        notify.success(`Module ${operation === 'create' ? 'created' : 'updated'} successfully`, 'Success');
      } else if (operation === 'delete') {
        await eduTierApi.deleteModule(moduleData.id);
        notify.success('Module deleted successfully', 'Success');
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