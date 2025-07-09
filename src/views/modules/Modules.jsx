import React, { useState } from 'react';
import ModuleManagement from '../../components/add-modules/components/ModuleManagement';
import { useNotification } from '../../hooks/useNotification';

const initialModules = [
  {
    id: 1,
    mod_name: 'Chart',
    mod_description: 'School portal dashboard chart',
    mod_links: { link: 'home', permission: 'dashboard.view' },
    mod_status: 'active',
  },
  {
    id: 2,
    mod_name: 'Installation Process',
    mod_description: 'Setup process to complete school installation',
    mod_links: { link: 'setup', permission: 'core.setup' },
    mod_status: 'active',
  },
  {
    id: 3,
    mod_name: 'Academics',
    mod_description: 'Academics',
    mod_links: { link: 'academics', permission: 'academics.view'},
    mod_status: 'active',
  },
  {
    id: 4,
    mod_name: 'School Manager',
    mod_description: 'Manage school and sub-school',
    mod_links: { link: 'academics.school', permission: 'setup.academics.school.view' },
    mod_status: 'active',
  },
  {
    id: 5,
    mod_name: 'Class Manager',
    mod_description: 'Manage classes and class description',
    mod_links: { link: 'academics.class', permission: 'setup.academics.class.view' },
    mod_status: 'active',
  },
  {
    id: 6,
    mod_name: 'Division/Programme Manager',
    mod_description: 'Manage programme and division',
    mod_links: { link: 'academics.division', permission: 'setup.academics.division.view' },
    mod_status: 'active',
  },
  
  {
    id: 7,
    mod_name: 'Session/Weeks Manager',
    mod_description: 'Manage weeks and term/session',
    mod_links: { link: 'academics.session-week-term', permission: 'setup.academics.session-week-term' },
    mod_status: 'active',
  },
  {
    id: 8,
    mod_name: 'Class Subject Manager',
    mod_description: 'Manage subjects',
    mod_links: { link: 'academics.class-subject-manager', permission: 'setup.academics.class-subject-manager' },
    mod_status: 'active',
  },
  {
    id: 9,
    mod_name: 'Scheme Of Work',
    mod_description: 'Scheme of work management',
    mod_links: { link: 'academics.scheme-of-work', permission: 'setup.academics.scheme-of-work' },
    mod_status: 'active',
  },
  {
    id: 10,
    mod_name: 'Subscriptions',
    mod_description: 'Subscriptions',
    mod_links: {link: 'subscriptions', permission: 'subscriptions.view' },
    mod_status: 'active',
  }
];

const Modules = () => {
  const [modules, setModules] = useState(initialModules);
  const [isLoading, setIsLoading] = useState(false);
  const notify = useNotification();

  const handleModuleUpdate = (moduleData, operation) => {
    setIsLoading(true);

    setTimeout(() => {
      if (operation === 'create') {
        setModules(prev => [...prev, moduleData]);
        notify.success('Module created successfully', 'Success');
      } else if (operation === 'update') {
        setModules(prev =>
          prev.map(mod => mod.id === moduleData.id ? moduleData : mod)
        );
        notify.success('Module updated successfully', 'Success');
      } else if (operation === 'delete') {
        setModules(prev => prev.filter(mod => mod.id !== moduleData.id));
        notify.success('Module deleted successfully', 'Success');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <ModuleManagement
      modules={modules}
      onModuleUpdate={handleModuleUpdate}
      isLoading={isLoading}
    />
  );
};

export default Modules;
