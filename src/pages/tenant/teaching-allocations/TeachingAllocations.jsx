import React, { useState } from 'react';
import { Box } from '@mui/material';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import TermMigrationModal from '@/components/shared/term-migration/TermMigrationModal';
import {
  migrateClassTeacherAllocations,
  migrateSubjectTeacherAllocations,
} from '@/api/tenant/term-migration/termMigrationApi';
import ClassTeacherAllocation from '@/pages/tenant/staff-manager/ClassTeacherAllocation';
import SubjectTeacherAllocation from '@/pages/tenant/staff-manager/SubjectTeacherAllocation';
import { useSearchParams } from 'react-router-dom';

const BCrumb = [{ to: '/', title: 'Dashboard' }, { title: 'Teaching Allocations' }];

const TeachingAllocations = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() =>
    searchParams.get('sub') === 'subject-teacher' ? 'subject' : 'class',
  );
  const [migrateModalOpen, setMigrateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <PageContainer title="Teaching Allocations" description="Assign class and subject teachers">
      <Breadcrumb title="Teaching Allocations" items={BCrumb} />

      <Box>
        {activeTab === 'class' && (
          <ClassTeacherAllocation
            key={`class-${refreshKey}`}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenMigrate={() => setMigrateModalOpen(true)}
          />
        )}
        {activeTab === 'subject' && (
          <SubjectTeacherAllocation
            key={`subject-${refreshKey}`}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenMigrate={() => setMigrateModalOpen(true)}
          />
        )}
      </Box>

      <TermMigrationModal
        open={migrateModalOpen}
        onClose={() => setMigrateModalOpen(false)}
        title={
          activeTab === 'class'
            ? 'Migrate Class Teacher Allocations'
            : 'Migrate Subject Teacher Allocations'
        }
        description={
          activeTab === 'class'
            ? "Carries every active class-teacher assignment forward from the term you pick into the term you're moving to. Only works within the same session."
            : "Carries every active subject-teacher assignment forward from the term you pick into the term you're moving to. Only works within the same session."
        }
        migrateFn={
          activeTab === 'class' ? migrateClassTeacherAllocations : migrateSubjectTeacherAllocations
        }
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </PageContainer>
  );
};

export default TeachingAllocations;
