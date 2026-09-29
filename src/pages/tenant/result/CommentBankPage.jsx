import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import CommentBankTab from './components/CommentBankTab';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Result Manager' }, { title: 'Comment Bank' }];

const CommentBankPage = () => (
  <PageContainer title="Comment Bank" description="Manage teacher and admin comments for report cards">
    <Breadcrumb title="Comment Bank" subtitle="Add and manage result comments" items={BCrumb} />
    <CommentBankTab />
  </PageContainer>
);

export default CommentBankPage;
