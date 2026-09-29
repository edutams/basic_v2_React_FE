import { useState } from 'react';
import { Box, Paper, Tabs, Tab, useTheme } from '@mui/material';
import { IconMail, IconMessage, IconSend, IconBrandWhatsapp } from '@tabler/icons-react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import { usePermissions } from '@/context/TenantContext/permissions';
import MailTab from './components/MailTab';
import ChatTab from './components/ChatTab';
import SmsTab from './components/SmsTab';
import WhatsAppTab from './components/WhatsAppTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Communication' }, { title: 'Messaging' }];

const CommunicationsPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
    return (
      <PageContainer title="Communication" description="School messaging">
        <Breadcrumb title="Communication" subtitle="Messaging" items={BCrumb} />
        <Paper elevation={0} sx={{ p: 3, borderRadius: '14px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB' }}>
          You do not have permission to access messaging features.
        </Paper>
      </PageContainer>
    );
  }

  const safeTab = Math.min(activeTab, tabs.length - 1);

  return (
    <PageContainer title="Communication" description="Mail, chats, SMS and WhatsApp">
      <Breadcrumb title="Communication" subtitle="Internal messaging for your school" items={BCrumb} />
      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
        }}
      >
        <Tabs
          value={safeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            px: 2,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', minHeight: 48 },
          }}
        >
          {tabs.map((t) => (
            <Tab key={t.label} label={t.label} icon={t.icon} iconPosition="start" />
          ))}
        </Tabs>
        <Box sx={{ p: 2 }}>{tabs[safeTab]?.component}</Box>
      </Paper>
    </PageContainer>
  );
};

export default CommunicationsPage;
