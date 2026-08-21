import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, List, useMediaQuery } from '@mui/material';
import NavItem from '../../../landlord/vertical/sidebar/NavItem';
import NavCollapse from '../../../landlord/vertical/sidebar/NavCollapse';
import NavGroup from '../../../landlord/vertical/sidebar/NavGroup/NavGroup';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { useAuth } from 'src/hooks/useAuth';
import tenantApi from '@/api/tenant/tenant_api';
import { usePermissions } from '@/context/TenantContext/permissions';
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
  IconWallet,
  IconCurrencyDollar,
  IconBuildingBank,
  IconCreditCard,
  IconSchool,
  IconBox,
  // Add more icons as needed
} from '@tabler/icons-react';

const iconMapper = {
  Wallet: IconWallet,
  Cash: IconCurrencyDollar,
  CurrencyDollar: IconCurrencyDollar,
  Settings: IconSettings,
  School: IconSchool,
  Users: IconUsers,
  BuildingBank: IconBuildingBank,
  CreditCard: IconCreditCard,
  ReportAnalytics: IconChartPie,
  ChartBar: IconChartPie,
  ChartPie: IconTimeline,
  FileInvoice: IconClipboardList,
  UsersPay: IconUsers,
  Package: IconBox,
  Report: IconChartPie,
  // Add more mappings here when needed
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

  // Recursive function to handle multiple levels of nesting
  const processNestedModules = (subModules) => {
    if (!subModules || subModules.length === 0) return null;

    return subModules.map((sub) => ({
      id: sub.title,
      title: sub.title,
      icon: iconMapper[sub.icon] || IconPoint,
      href: sub.href || '#',
      children:
        sub.subModules && sub.subModules.length > 0 ? processNestedModules(sub.subModules) : null,
    }));
  };

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await tenantApi.get('/tenant-sidebar-modules');
        const packages = response.data?.data || [];

        const allModules = packages.flatMap((pkg) => pkg.modules);

        const formattedMenu = allModules.map((mod) => ({
          id: mod.title,
          title: mod.title,
          icon: iconMapper[mod.icon] || IconBox,
          href: mod.href || '#',
          children: processNestedModules(mod.subModules),
        }));

        setMenuItems([{ navlabel: true, subheader: 'Modules' }, ...formattedMenu]);
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
            } else if (item.children && item.children.length > 0) {
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
