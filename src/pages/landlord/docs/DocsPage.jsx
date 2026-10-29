import DocsLayout from '@/components/shared/docs/DocsLayout';
import { fetchDocsManifest, fetchDocsPage, fetchDocsImage } from '@/api/landlord/docs/docsApi';

const DocsPage = () => (
  <DocsLayout
    title="Agent Manual"
    basePath="/help"
    fetchManifest={fetchDocsManifest}
    fetchPage={fetchDocsPage}
    fetchImage={fetchDocsImage}
  />
);

export default DocsPage;
