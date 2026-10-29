import DocsLayout from '@/components/shared/docs/DocsLayout';
import { fetchDocsManifest, fetchDocsPage, fetchDocsImage } from '@/api/tenant/docs/docsApi';

const DocsPage = () => (
  <DocsLayout
    title="User Manual"
    basePath="/docs"
    fetchManifest={fetchDocsManifest}
    fetchPage={fetchDocsPage}
    fetchImage={fetchDocsImage}
  />
);

export default DocsPage;
