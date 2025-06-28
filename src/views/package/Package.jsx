import React, { useState } from 'react';
import PackageManagement from '../../components/add-package/components/PackageManagement';
import Swal from 'sweetalert2';

const initialPackages = [
  {
    id: 1,
    pac_name: 'Basic Package',
    pac_description: 'Basic features for small businesses',
    pac_status: 'active',
    pac_icon: 'fas fa-box',
  },
  {
    id: 2,
    pac_name: 'Pro Package',
    pac_description: 'Advanced features for growing businesses',
    pac_status: 'inactive',
    pac_icon: 'fas fa-rocket',
  },
  {
    id: 3,
    pac_name: 'Enterprise Package',
    pac_description: 'Comprehensive features for enterprises',
    pac_status: 'active',
    pac_icon: 'fas fa-building',
  },
];

const initialModules = [
  {
    id: 1,
    mod_name: 'Analytics',
    mod_description: 'Data analytics module',
    mod_status: 'active',
    mod_links: { link: '/analytics', permission: 'analytics.view' },
    packageId: 1,
  },
  {
    id: 2,
    mod_name: 'Reports',
    mod_description: 'Generate detailed reports',
    mod_status: 'active',
    mod_links: { link: '/reports', permission: 'reports.view' },
    packageId: 1,
  },
  {
    id: 3,
    mod_name: 'CRM',
    mod_description: 'Customer relationship management',
    mod_status: 'active',
    mod_links: { link: '/crm', permission: 'crm.view' },
    packageId: 2,
  },
  {
    id: 4,
    mod_name: 'Inventory',
    mod_description: 'Inventory management system',
    mod_status: 'active',
    mod_links: { link: '/inventory', permission: 'inventory.view' },
    packageId: null, 
  },
];

const Package = () => {
  const [packages, setPackages] = useState(initialPackages);
  const [modules, setModules] = useState(initialModules);
  const [isLoading, setIsLoading] = useState(false);
  const handlePackageUpdate = (packageData, operation) => {
    setIsLoading(true);

    setTimeout(() => {
      if (operation === 'create') {
        setPackages(prev => [...prev, packageData]);
        Swal.fire('Success', 'Package created successfully', 'success');
      } else if (operation === 'update') {
        setPackages(prev =>
          prev.map(pkg => pkg.id === packageData.id ? packageData : pkg)
        );
        Swal.fire('Success', 'Package updated successfully', 'success');
      } else if (operation === 'delete') {
        setPackages(prev => prev.filter(pkg => pkg.id !== packageData.id));
        Swal.fire('Success', 'Package deleted successfully', 'success');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleModuleUpdate = (moduleData, operation) => {
    setIsLoading(true);

    setTimeout(() => {
      if (operation === 'create') {
        setModules(prev => [...prev, moduleData]);
        Swal.fire('Success', 'Module created successfully', 'success');
      } else if (operation === 'update') {
        setModules(prev =>
          prev.map(mod => mod.id === moduleData.id ? moduleData : mod)
        );
        Swal.fire('Success', 'Module updated successfully', 'success');
      } else if (operation === 'delete') {
        setModules(prev => prev.filter(mod => mod.id !== moduleData.id));
        Swal.fire('Success', 'Module deleted successfully', 'success');
      }
      setIsLoading(false);
    }, 500);
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