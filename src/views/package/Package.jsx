import React, { useState } from 'react';
import PackageManagement from '../../components/add-package/components/PackageManagement';
import Swal from 'sweetalert2';

const initialPackages = [
  {
    id: 1,
    pac_name: 'Dashboard',
    pac_description: 'School portal dashboard',
    pac_status: 'active',
    pac_icon: 'fas fa-tachometer-alt',
  },
  {
    id: 2,
    pac_name: 'Setup',
    pac_description: 'Package used to setup the school',
    pac_status: 'active',
    pac_icon: 'fas fa-cogs',
  },
  {
    id: 3,
    pac_name: 'Admission',
    pac_description: 'Admission package',
    pac_status: 'active',
    pac_icon: 'fas fa-user-plus',
  },
  {
    id: 4,
    pac_name: 'Digital Class',
    pac_description: 'Digital class package',
    pac_status: 'active',
    pac_icon: 'fas fa-chalkboard-teacher',
  },
  {
    id: 5,
    pac_name: 'Forum',
    pac_description: 'Forum (discussion)',
    pac_status: 'active',
    pac_icon: 'fas fa-comments',
  },
  {
    id: 6,
    pac_name: 'Attendance',
    pac_description: 'Attendance package',
    pac_status: 'active',
    pac_icon: 'fas fa-calendar-check',
  },
  {
    id: 7,
    pac_name: 'E-Resources',
    pac_description: 'E-resource package',
    pac_status: 'active',
    pac_icon: 'fas fa-book',
  },
  {
    id: 8,
    pac_name: 'Messaging',
    pac_description: 'Messaging package',
    pac_status: 'active',
    pac_icon: 'fas fa-envelope',
  },
  {
    id: 9,
    pac_name: 'My Wards',
    pac_description: 'My ward module',
    pac_status: 'active',
    pac_icon: 'fas fa-users',
  },
  {
    id: 10,
    pac_name: 'Result',
    pac_description: 'My result package',
    pac_status: 'inactive',
    pac_icon: 'fas fa-poll',
  }
];

const initialModules = [
  {
    id: 1,
    mod_name: 'Chart',
    mod_description: 'School portal dashboard chart',
    mod_links: { link: 'home', permission: 'dashboard.view' },
    mod_status: 'active',
    packageId: 1, 
  },
  {
    id: 2,
    mod_name: 'Installation Process',
    mod_description: 'Setup process to complete school installation',
    mod_links: { link: 'setup', permission: 'core.setup' },
    mod_status: 'active',
    packageId: 2, 
  },
  {
    id: 3,
    mod_name: 'Academics',
    mod_description: 'Academics',
    mod_links: { link: 'academics', permission: 'academics.view'},
    mod_status: 'active',
    packageId: 3, 
  },
  {
    id: 4,
    mod_name: 'School Manager',
    mod_description: 'Manage school and sub-school',
    mod_links: { link: 'academics.school', permission: 'setup.academics.school.view' },
    mod_status: 'active',
    packageId: 2, 
  },
  {
    id: 5,
    mod_name: 'Class Manager',
    mod_description: 'Manage classes and class description',
    mod_links: { link: 'academics.class', permission: 'setup.academics.class.view' },
    mod_status: 'active',
    packageId: 4, 
  },
  {
    id: 6,
    mod_name: 'Division/Programme Manager',
    mod_description: 'Manage programme and division',
    mod_links: { link: 'academics.division', permission: 'setup.academics.division.view' },
    mod_status: 'active',
    packageId: 4, 
  },
  {
    id: 7,
    mod_name: 'Session/Weeks Manager',
    mod_description: 'Manage weeks and term/session',
    mod_links: { link: 'academics.session-week-term', permission: 'setup.academics.session-week-term' },
    mod_status: 'active',
    packageId: 3, 
  },
  {
    id: 8,
    mod_name: 'Class Subject Manager',
    mod_description: 'Manage subjects',
    mod_links: { link: 'academics.class-subject-manager', permission: 'setup.academics.class-subject-manager' },
    mod_status: 'active',
    packageId: 4,
  },
  {
    id: 9,
    mod_name: 'Scheme Of Work',
    mod_description: 'Scheme of work management',
    mod_links: { link: 'academics.scheme-of-work', permission: 'setup.academics.scheme-of-work' },
    mod_status: 'active',
    packageId: 4, 
  },
  {
    id: 10,
    mod_name: 'Subscriptions',
    mod_description: 'Subscriptions',
    mod_links: {link: 'subscriptions', permission: 'subscriptions.view' },
    mod_status: 'active',
    packageId: 5, 
  }
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