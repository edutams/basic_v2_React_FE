import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { Box, List, useMediaQuery } from '@mui/material';
import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import NavGroup from './NavGroup/NavGroup';

import { CustomizerContext } from 'src/context/CustomizerContext';
import { useAuth } from 'src/hooks/useAuth';
import api from 'src/api/auth';
import {
  IconChartPie,
  IconCurrencyDollar,
  IconSettings,
  IconCalendarTime,
  IconUserCircle,
  IconHistory,
  IconSchool,
  IconListTree,
  IconMap,
  IconWallet,
  IconMessage2,
  IconMail,
  IconAppWindow,
  IconPoint,
  IconCircle,
  IconShieldLock,
  IconCalendarClock,
  IconArchive,
} from '@tabler/icons-react';
import { useParams } from 'react-router';


const iconMapper = {
  ChartPie: IconChartPie,
  CurrencyDollar: IconCurrencyDollar,
  ShieldX: IconShieldLock,
  CalendarClock: IconCalendarClock,
  UserCircle: IconUserCircle,
  History: IconHistory,
  School: IconSchool,
  ListTree: IconListTree,
  Map: IconMap,
  Wallet: IconWallet,
  AppWindow: IconAppWindow,
  Circle: IconCircle,
  Point: IconPoint,
  Settings: IconSettings,
  Archive: IconArchive,
};

const SidebarItems = () => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));

  const { isSidebarHover, isCollapse, isMobileSidebar, setIsMobileSidebar } =
    useContext(CustomizerContext);

  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? isCollapse == 'mini-sidebar' && !isSidebarHover : '';

  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await api.get('/agent/sidebar-modules');
        const modules = response.data?.data;

        const formattedMenu = modules.map((mod) => ({
          id: mod.id,
          title: mod.module_name,
          icon: iconMapper[mod.module_icon] || IconCircle,
          href: mod.module_links?.link || '#',
          permission: mod.module_links?.permission ? [mod.module_links.permission] : null,
          children:
            mod.sub_modules?.length > 0
              ? mod.sub_modules.map((sub) => ({
                  id: sub.id,
                  title: sub.module_name,
                  icon: iconMapper[sub.module_icon] || IconPoint,
                  href: sub.module_links?.link || '#',
                }))
              : null,
        }));

        setMenuItems([
          {
            navlabel: true,
            subheader: 'Main Navigation',
          },
          ...formattedMenu,
        ]);
      } catch (error) {
        console.error('Error fetching sidebar modules:', error);
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
            const userPermissions = user?.permissions || [];
            return item.permission.some((p) => userPermissions.includes(p));
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
export default SidebarItems;
