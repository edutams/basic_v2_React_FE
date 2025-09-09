import { uniqueId } from 'lodash';
import {
  IconChartPie,
  IconCalendarWeek,
  IconUsers,
  IconUserCircle,
  IconBook,
  IconClipboardList,
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
      // {
      //   id: uniqueId(),
      //   title: 'Stimulation Links',
      //   icon: IconPoint,
      //   href: '/phet/stimulation-links',
      // },
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
