import { uniqueId } from 'lodash';
import {
  IconChartPie,
  IconSchool,
  IconUsers,
  IconUserCircle,
  IconBook,
  IconCalendarTime,
  IconClipboardList,
  IconReportAnalytics,
  IconSettings,
  IconMail,
  IconMessage2,
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
    href: '/school-dashboard/students',
  },
  {
    id: uniqueId(),
    title: 'Addmission',
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