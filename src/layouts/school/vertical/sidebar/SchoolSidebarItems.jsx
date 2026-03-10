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
  IconCircle
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
  Circle: IconCircle
};

const SchoolSidebarItems = () => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));

  const { isSidebarHover, isCollapse, isMobileSidebar, setIsMobileSidebar } = useContext(CustomizerContext);

  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? isCollapse == "mini-sidebar" && !isSidebarHover : '';

  const { user } = useAuth();
  const { canAny } = usePermissions();
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await tenantApi.get('/sidebar-modules');
        const modules = response.data.data;
        console.log(modules, 'modules');

        const formattedMenu = modules.map(mod => ({
          id: mod.id,
          title: mod.module_name,
          icon: iconMapper[mod.module_icon] || IconCircle,
          href: mod.module_links?.link || '#',
          permission: mod.module_links?.permission ? [mod.module_links.permission] : null,
          children: mod.sub_modules?.length > 0 ? mod.sub_modules.map(sub => ({
            id: sub.id,
            title: sub.module_name,
            icon: iconMapper[sub.module_icon] || IconPoint,
            href: sub.module_links?.link || '#'
          })) : null
        }));

        setMenuItems([
          {
            navlabel: true,
            subheader: 'School Dashboard',
          },
          ...formattedMenu
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
        {menuItems.filter((item) => {
          if (!item.permission) return true;
          if (user?.is_super_admin) return true;
          return canAny(item.permission);
        }).map((item) => {
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