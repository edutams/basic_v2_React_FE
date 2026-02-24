import { uniqueId } from 'lodash';
import {
  IconChartPie,
  IconCalendarWeek,
  IconUsers,
  IconUserCircle,
  IconBook,
  IconClipboardList,
  IconAppWindow,
  IconPoint,
} from '@tabler/icons-react';

const SchoolMenuItems = [
  {
    navlabel: true,
    subheader: 'School Dashboard',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconChartPie,
    href: '/school-dashboard',
  },

  {
    navlabel: true,
    subheader: 'Module Navigation',
  },

  {
    id: uniqueId(),
    title: 'ALC Manager',
    icon: IconUsers,
    href: '/school-dashboard/alc-manager',
  },

  {
    id: uniqueId(),
    title: 'Setup',
    icon: IconUsers,
    children: [
      {
        id: uniqueId(),
        title: 'School Calendar',
        icon: IconUsers,
        href: '/school-dashboard/session-week-manager',
      },
      {
        id: uniqueId(),
        title: 'Scheme Of Work',
        icon: IconUsers,
        href: '/school-dashboard/scheme-of-work',
      },
    ],
  },

  {
    id: uniqueId(),
    title: 'Subcriptions',
    icon: IconAppWindow,
    children: [
      {
        id: uniqueId(),
        title: 'Manage Subcription',
        icon: IconPoint,
        href: '/school-dashboard/manage-subcription',
        // href: '/subcriptions/manage-subcription',
      },
      {
        id: uniqueId(),
        title: 'Subcription History',
        icon: IconPoint,
        href: '/school-dashboard/subscription-history',
        // href: '/subcriptions/manage-subcription',
      },
    ],
  },

  {
    id: uniqueId(),
    title: 'Admission',
    icon: IconUserCircle,
    href: '/school-dashboard/teachers',
  },
  {
    id: uniqueId(),
    title: 'Digital Class',
    icon: IconBook,
    href: '/school-dashboard/classes',
  },
  {
    id: uniqueId(),
    title: 'Forum',
    icon: IconClipboardList,
    href: '/school-dashboard/subjects',
  },
];

export default SchoolMenuItems;
