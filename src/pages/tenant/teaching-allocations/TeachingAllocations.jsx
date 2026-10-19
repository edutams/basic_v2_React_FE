import React, { useState } from 'react';
import { Box, Card, Tabs, Tab, Button } from '@mui/material';
import { SwapHoriz as MigrateIcon } from '@mui/icons-material';
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

      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '15px' } }}
        >
          <Tab label="Class Teacher Allocation" value="class" />
          <Tab label="Subject Teacher Allocation" value="subject" />
        </Tabs>

        <Button
          variant="contained"
          size="small"
          startIcon={<MigrateIcon />}
          onClick={() => setMigrateModalOpen(true)}
          sx={{ whiteSpace: 'nowrap', mb: 1 }}
        >
          Migrate from Previous Term
        </Button>
      </Box>

      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: (theme) =>
            theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid #eee',
          overflow: 'hidden',
          p: 1.5,
        }}
      >
        <Box>
          {activeTab === 'class' && <ClassTeacherAllocation key={`class-${refreshKey}`} />}
          {activeTab === 'subject' && <SubjectTeacherAllocation key={`subject-${refreshKey}`} />}
        </Box>
      </Card>

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
