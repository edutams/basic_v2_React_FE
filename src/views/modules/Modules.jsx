import React, { useState, useEffect } from 'react';
import ModuleManagement from '../../components/add-modules/components/ModuleManagement';
import { useNotification } from '../../hooks/useNotification';
import eduTierApi from '../../api/eduTierApi';

const Modules = () => {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const notify = useNotification();

  const fetchModules = async () => {
    setIsLoading(true);
    try {
      const data = await eduTierApi.getModules();
      setModules(data);
    } catch (error) {
      notify.error('Failed to fetch modules', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

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
      fetchModules();
    } catch (error) {
      notify.error(`Failed to ${operation} module`, 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModuleManagement modules={modules} onModuleUpdate={handleModuleUpdate} isLoading={isLoading} />
  );
};

export default Modules;
