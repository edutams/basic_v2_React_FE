import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { Box, List, useMediaQuery } from '@mui/material';
import NavItem from '../../../full/vertical/sidebar/NavItem';
import NavCollapse from '../../../full/vertical/sidebar/NavCollapse';
import NavGroup from '../../../full/vertical/sidebar/NavGroup/NavGroup';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { useAuth } from 'src/hooks/useAuth';
import tenantApi from 'src/api/tenant_api';
import { PermissionProvider, usePermissions } from '../../../../context/TenantContext/permissions';
import {
  IconChartPie,
  IconUsers,
  IconSettings,
  IconTimeline,
  IconAppWindow,
  IconUserCircle,
  IconBook,
  IconClipboardList,
  IconPoint,
  IconCircle,
  IconListCheck,
} from '@tabler/icons-react';

const iconMapper = {
  ChartPie: IconChartPie,
  Users: IconUsers,
  Settings: IconSettings,
  Timeline: IconTimeline,
  AppWindow: IconAppWindow,
  UserCircle: IconUserCircle,
  Book: IconBook,
  ClipboardList: IconClipboardList,
  Point: IconPoint,
  Circle: IconCircle,
  ListCheck: IconListCheck,
};

const SchoolSidebarItems = () => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));

  const { isSidebarHover, isCollapse, isMobileSidebar, setIsMobileSidebar } =
    useContext(CustomizerContext);

  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? isCollapse == 'mini-sidebar' && !isSidebarHover : '';

  const { user } = useAuth();
  const { canAny } = usePermissions();
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await tenantApi.get('/tenant-sidebar-modules');
        const packages = response.data?.data; // array of packages

        // Flatten all modules from all packages into one list
        const allModules = packages.flatMap((pkg) => pkg.modules);

        const formattedMenu = allModules.map((mod) => ({
          id: mod.title, // use title as id since API doesn't return module id
          title: mod.title,
          icon: iconMapper[mod.icon] || IconCircle,
          href: mod.href || '#',
          children:
            mod.subModules?.length > 0
              ? mod.subModules.map((sub) => ({
                  id: sub.title,
                  title: sub.title,
                  icon: IconPoint,
                  href: sub.href || '#',
                }))
              : null,
        }));

        setMenuItems([
          { navlabel: true, subheader: 'School Dashboard' },
          {
            id: 'initial-setup',
            title: 'Initial Setup',
            icon: IconListCheck,
            href: '/initial-setup',
            permission: null,
          },
          {
            id: 'complete-setup',
            title: 'Complete Setup',
            icon: IconListCheck,
            href: '/complete-setup',
            permission: null,
          },
          { navlabel: true, subheader: 'Modules' },
          ...formattedMenu,
        ]);
      } catch (error) {
        console.error('Error fetching school sidebar modules:', error);
      }
    };

    fetchModules();
  }, []);

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {menuItems
          .filter((item) => {
            if (!item.permission) return true;
            if (user?.is_super_admin) return true;
            return canAny(item.permission);
          })
          .map((item) => {
            if (item.subheader) {
              return <NavGroup item={item} hideMenu={hideMenu} key={item.subheader} />;
            } else if (item.children) {
              return (
                <NavCollapse
                  menu={item}
                  pathDirect={pathDirect}
                  hideMenu={hideMenu}
                  pathWithoutLastPart={pathWithoutLastPart}
                  level={1}
                  key={item.id}
                  onClick={() => setIsMobileSidebar(!isMobileSidebar)}
                />
              );
            } else {
              return (
                <NavItem
                  item={item}
                  key={item.id}
                  pathDirect={pathDirect}
                  hideMenu={hideMenu}
                  onClick={() => setIsMobileSidebar(!isMobileSidebar)}
                />
              );
            }
          })}
      </List>
    </Box>
  );
};

export default SchoolSidebarItems;
