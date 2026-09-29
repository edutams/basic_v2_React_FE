import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import MessagingTab from './components/MessagingTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Messaging' }];

const MessagingPage = () => (
  <PageContainer title="Result Messaging" description="Send results via SMS, Email or WhatsApp">
    <Breadcrumb title="Result Messaging" subtitle="Send results to students and parents" items={BCrumb} />
    <MessagingTab />
  </PageContainer>
);

export default MessagingPage;
