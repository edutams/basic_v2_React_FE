import { uniqueId } from 'lodash';
import {
  IconChartPie,
  IconUsers,
  IconUserCircle,
  IconBook,
  IconClipboardList,
  IconAppWindow,
  IconPoint,
  IconHistory,
  IconTimeline,
} from '@tabler/icons-react';

const SchoolMenuItems = [
  {
    navlabel: true,
    subheader: 'School Dashboard',
  },
  {
    title: 'Dashboard',
    icon: IconChartPie,
    href: '/',
  },

  {
    navlabel: true,
    subheader: 'Module Navigation',
  },

  {
    id: uniqueId(),
    title: 'ACL Manager',
    icon: IconUsers,
    href: '/alc-manager',
  },
  {
    id: uniqueId(),
    title: 'Setup',
    icon: IconUsers,
    children: [
      {
        id: uniqueId(),
        title: 'Session/Term Mapping',
        icon: IconTimeline,
        href: '/session-week-manager',
      },
      {
        id: uniqueId(),
        title: 'Scheme Of Work',
        icon: IconUsers,
        href: '/scheme-of-work',
      },
    ],
  },

  {
    id: uniqueId(),
    title: 'Subscriptions',
    icon: IconAppWindow,
    href: '/manage-subscription',
  },

  {
    id: uniqueId(),
    title: 'Admission',
    icon: IconUserCircle,
    href: '/teachers',
  },
  {
    id: uniqueId(),
    title: 'Digital Class',
    icon: IconBook,
    href: '/classes',
  },
  {
    id: uniqueId(),
    title: 'Forum',
    icon: IconClipboardList,
    href: '/subjects',
  },
];

export default SchoolMenuItems;
