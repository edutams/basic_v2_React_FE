import React, { useState } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import { Box, Tabs, Tab, Button } from '@mui/material';
import { SwapHoriz as MigrateIcon } from '@mui/icons-material';
import { usePermissions } from '@/context/TenantContext/permissions';

import SingleArmView from './components/SingleArmView';
import MultipleArmView from './components/MultipleArmView';
import TermMigrationModal from '@/components/shared/term-migration/TermMigrationModal';
import { migrateStudents } from '@/api/tenant/term-migration/termMigrationApi';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Class Manager' },
  { title: 'Class Register' },
];

const ClassRegister = () => {
  const { can } = usePermissions();
  const [activeTab, setActiveTab] = useState(0);
  const [migrateModalOpen, setMigrateModalOpen] = useState(false);

  return (
    <PageContainer
      title="Class Register"
      description="Manage class register and student enrollments"
    >
      <Breadcrumb title="Class Register" items={BCrumb} />

      <ParentCard
        sx={{
          '& .MuiCardHeader-root': { pb: 0.5, pt: 1.5, px: 1.5 },
          '& .MuiCardContent-root': { p: 1.5, '&:last-child': { pb: 1.5 } },
        }}
        title={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider',
              width: '100%',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '15px',
                  py: 1.5,
                },
              }}
            >
              <Tab label="Single Arm View" />
              <Tab label="Multiple Arm View" />
            </Tabs>

            {can('manage.class_manager.class_register.bulk_register') && (
              <Button
                variant="contained"
                startIcon={<MigrateIcon />}
                onClick={() => setMigrateModalOpen(true)}
              >
                Migrate Students from Previous Term
              </Button>
            )}
          </Box>
        }
      >
        {activeTab === 0 && <SingleArmView />}
        {activeTab === 1 && <MultipleArmView onEnrollmentChange={() => {}} />}
      </ParentCard>

      <TermMigrationModal
        open={migrateModalOpen}
        onClose={() => setMigrateModalOpen(false)}
        title="Migrate Students to New Term"
        description="Carries every currently-enrolled student forward from the term you pick into the term you're moving to — same class, curriculum and everything. Only works within the same session; moving into a new session is promotion, handled separately."
        migrateFn={migrateStudents}
        onSuccess={() => {}}
      />
    </PageContainer>
  );
};

export default ClassRegister;
