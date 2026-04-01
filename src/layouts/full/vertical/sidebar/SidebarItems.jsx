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

        const packageModules = response.data?.data;

        const formattedMenu = [];
        packageModules.forEach((pack, packIndex) => {
          formattedMenu.push({
            navlabel: true,
            subheader: pack.package_name, // For NavGroup
          });

          pack.modules.forEach((mod, modIndex) => {
            const menuItem = {
              id: `${packIndex}-${modIndex}`, // unique id
              title: mod.title,
              href: mod.href || "#",
              icon: iconMapper[mod.icon] || IconCircle,
            };

            if (mod.subModules && mod.subModules.length > 0) {
              menuItem.children = mod.subModules.map((sub, subIndex) => ({
                id: `${packIndex}-${modIndex}-${subIndex}`,
                title: sub.title,
                href: sub.href || "#",
                icon: iconMapper[sub.icon] || IconPoint,
              }));
            }

            formattedMenu.push(menuItem);
          });
        });

        setMenuItems(formattedMenu);
      } catch (error) {
        console.error('Error fetching sidebar modules:', error);
      }
    };

    fetchModules();
  }, []);

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {menuItems.map((item) => {
          if (item.subheader) {
            return <NavGroup item={item} hideMenu={hideMenu} key={item.subheader} />;
          } else if (item.children) {
            return (
              <NavCollapse
                menu={item}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                pathWithoutLastPart={pathWithoutLastPart}
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
