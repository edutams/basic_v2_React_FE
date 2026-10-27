import { useState } from 'react';
import { Box, Paper, Tabs, Tab, useTheme } from '@mui/material';
import { IconMail, IconMessage, IconSend, IconBrandWhatsapp, IconReportMoney } from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import { usePermissions } from '@/context/TenantContext/permissions';
import MailTab from './components/MailTab';
import ChatTab from './components/ChatTab';
import SmsTab from './components/SmsTab';
import WhatsAppTab from './components/WhatsAppTab';
import MessagingTab from '../result/components/MessagingTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Messaging' }];

const SendMessagePanel = () => {
  const { can } = usePermissions();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [];
  if (can('messaging.create_mail')) {
    tabs.push({ label: 'Mail', icon: <IconMail size={16} />, component: <MailTab /> });
  }
  if (can('messaging.view_chat')) {
    tabs.push({ label: 'Chats', icon: <IconMessage size={16} />, component: <ChatTab /> });
  }
  if (can('messaging.create_sms')) {
    tabs.push({ label: 'SMS', icon: <IconSend size={16} />, component: <SmsTab /> });
    tabs.push({ label: 'WhatsApp', icon: <IconBrandWhatsapp size={16} />, component: <WhatsAppTab /> });
  }

  if (tabs.length === 0) {
    return <Box sx={{ p: 2 }}>You do not have permission to access messaging features.</Box>;
  }

  const safeTab = Math.min(activeTab, tabs.length - 1);

  return (
    <Box>
      <Tabs
        value={safeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          px: 2,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', minHeight: 44 },
        }}
      >
        {tabs.map((t) => (
          <Tab key={t.label} label={t.label} icon={t.icon} iconPosition="start" />
        ))}
      </Tabs>
      <Box sx={{ p: 2 }}>{tabs[safeTab]?.component}</Box>
    </Box>
  );
};

const CommunicationsPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { can } = usePermissions();
  const [activeTopTab, setActiveTopTab] = useState(0);

  const canSendMessage =
    can('messaging.create_mail') || can('messaging.view_chat') || can('messaging.create_sms');
  const canResultMessage = can('result.admin.manage_result_messaging');

  const topTabs = [];
  if (canSendMessage) {
    topTabs.push({ label: 'Send Message', icon: <IconSend size={16} />, component: <SendMessagePanel /> });
  }
  if (canResultMessage) {
    topTabs.push({
      label: 'Result Message',
      icon: <IconReportMoney size={16} />,
      component: <MessagingTab />,
    });
  }

  if (topTabs.length === 0) {
    return (
      <PageContainer title="Messaging" description="School messaging">
        <Breadcrumb title="Messaging" subtitle="Send and receive messages" items={BCrumb} />
        <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
          You do not have permission to access messaging features.
        </Paper>
      </PageContainer>
    );
  }

  const safeTopTab = Math.min(activeTopTab, topTabs.length - 1);

  return (
    <PageContainer title="Messaging" description="Mail, chats, SMS, WhatsApp and result messaging">
      <Breadcrumb title="Messaging" subtitle="Send and receive messages for your school" items={BCrumb} />
      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        }}
      >
        <Tabs
          value={safeTopTab}
          onChange={(_, v) => setActiveTopTab(v)}
          sx={{
            px: 2,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', minHeight: 48 },
          }}
        >
          {topTabs.map((t) => (
            <Tab key={t.label} label={t.label} icon={t.icon} iconPosition="start" />
          ))}
        </Tabs>
        <Box sx={{ p: topTabs[safeTopTab]?.label === 'Result Message' ? 2 : 0 }}>
          {topTabs[safeTopTab]?.component}
        </Box>
      </Paper>
    </PageContainer>
  );
};

export default CommunicationsPage;
