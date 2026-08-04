import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import CurriculumSetup from './components/CurriculumSetup';
import SubjectBank from './components/SubjectBank';
import ClassSubject from './components/ClassSubject';
import { Box, Tabs, Tab, Button, Typography, useTheme } from '@mui/material';
import { TourProvider, useTour } from '@reactour/tour';
import { IconCompass } from '@tabler/icons-react';

const BCrumb = [
  { to: '/', title: 'Home' },
  // { title: 'Dashboard' },
  { title: 'Curriculum Manager' },
];

const TabPanel = ({ children, value, index }) => {
  return value === index && <Box mt={2}>{children}</Box>;
};

// ── Tour Steps Configuration (Covering headers, tabs, and inner tab content) ────
// ── Tour Steps Configuration per Tab ──────────────────────────────────────────

const tab0Steps = [
  {
    selector: '[data-tour="tab-0"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          1. Curriculum Setup ⚙️
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          First, configure your school's active curriculums and assign classes to them.
        </Typography>
      </Box>
    ),
  },
  {
    selector: '[data-tour="curriculum-setup-panel"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Curriculum List & Import 📋
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          View existing curriculums. Use the <b>Import</b> button to load pre-built national curriculums or <b>Create Curriculum</b> for custom setups.
        </Typography>
      </Box>
    ),
  },
  {
    selector: '[data-tour="curriculum-assign-panel"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Assign Classes to Curriculum 🏫
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Select the active academic session & term, then select which curriculum applies to each class level.
        </Typography>
      </Box>
    ),
  },
];

const tab1Steps = [
  {
    selector: '[data-tour="tab-1"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          2. Subject Bank 📚
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Explore managing subjects and subject groups under each curriculum.
        </Typography>
      </Box>
    ),
  },
  {
    selector: '[data-tour="subject-bank-select-curriculum"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Select Curriculum 👈
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click the radio button next to any curriculum in this list to inspect its subjects and groups.
        </Typography>
      </Box>
    ),
  },
  {
    selector: '[data-tour="subject-bank-subjects-panel"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Subject Bank List & Controls 📖
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Add new subjects, set pass marks and credit units, search subjects, and edit existing subject properties.
        </Typography>
      </Box>
    ),
  },
  {
    selector: '[data-tour="subject-bank-groups-panel"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Subject Groups 📦
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Group multiple subjects together (e.g. Sciences, Trade Subjects) with combined pass mark and unit requirements.
        </Typography>
      </Box>
    ),
  },
];

const tab2Steps = [
  {
    selector: '[data-tour="tab-2"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          3. Class Subject 🏫
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Assign subjects directly to specific class arms and allocate subject teachers.
        </Typography>
      </Box>
    ),
  },
  {
    selector: '[data-tour="class-subject-selector"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Programme & Class Selection 🎯
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Select an academic programme and choose a class arm to view its assigned subjects.
        </Typography>
      </Box>
    ),
  },
  {
    selector: '[data-tour="class-subject-table"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Class Subjects & Teacher Allocation 👩‍🏫
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Add subjects to the selected class and assign subject teachers to each class arm.
        </Typography>
      </Box>
    ),
  },
];

const getStepsForTab = (tabIndex) => {
  switch (tabIndex) {
    case 1:
      return tab1Steps;
    case 2:
      return tab2Steps;
    case 0:
    default:
      return tab0Steps;
  }
};

// ── Inner Main View ───────────────────────────────────────────────────────────
const CurriculumManagerContent = ({ tab, setTab }) => {
  const { setIsOpen, setCurrentStep } = useTour();

  // Auto-start tour on first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('curriculum_manager_tour_seen');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setCurrentStep(0);
        setIsOpen(true);
        localStorage.setItem('curriculum_manager_tour_seen', 'true');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [setCurrentStep, setIsOpen]);

  const handleStartTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  return (
    <PageContainer title="Curriculum Manager">
      {/* HEADER & TAKE TOUR BUTTON */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 2,
        }}
      >
        <Box data-tour="curriculum-manager-header" sx={{ width: '100%' }}>
          <Breadcrumb title="Curriculum Manager" items={BCrumb} />
        </Box>

        <Button
          data-tour="take-tour-btn"
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<IconCompass size={18} />}
          onClick={handleStartTour}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 2,
            // py: 0.8,
            whiteSpace: 'nowrap',
            alignSelf: { xs: 'flex-end', sm: 'center' },
          }}
        >
          Take Tour
        </Button>
      </Box>

      <Box>
        {/* TABS */}
        <Box
          data-tour="curriculum-tabs"
          sx={{
            mb: 2,
            borderBottom: 1,
            borderColor: 'divider',
            overflowX: 'auto',
            '& .MuiTabs-root': {
              minWidth: '300px',
            },
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, val) => setTab(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab data-tour="tab-0" label="Curriculum Setup" />
            <Tab data-tour="tab-1" label="Subject Bank" />
            <Tab data-tour="tab-2" label="Class Subject" />
          </Tabs>
        </Box>

        {/* CONTENT */}
        <ParentCard>
          <TabPanel value={tab} index={0}>
            <CurriculumSetup />
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <SubjectBank />
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <ClassSubject />
          </TabPanel>
        </ParentCard>
      </Box>
    </PageContainer>
  );
};

// ── Root Export Wrapped with TourProvider ─────────────────────────────────────
const CurriculumManager = () => {
  const [tab, setTab] = useState(0);
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const currentSteps = getStepsForTab(tab);

  return (
    <TourProvider
      key={tab}
      steps={currentSteps}
      showBadge={false}
      showDots
      scrollSmooth
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: 14,
          padding: '18px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          maxWidth: 320,
        }),
        dot: (base, { current }) => ({
          ...base,
          background: current ? primary : 'rgba(0,0,0,0.18)',
          width: current ? 20 : 8,
          borderRadius: 4,
          transition: 'all 0.3s ease',
        }),
        controls: (base) => ({ ...base, marginTop: 12 }),
        button: (base) => ({
          ...base,
          background: primary,
          color: '#fff',
          borderRadius: 8,
          padding: '6px 16px',
          fontSize: 13,
          fontWeight: 600,
        }),
        close: (base) => ({ ...base, color: '#999' }),
      }}
      prevButton={({ currentStep, setCurrentStep }) =>
        currentStep > 0 ? (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            style={{
              background: 'transparent',
              border: `1px solid ${primary}`,
              color: primary,
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Back
          </button>
        ) : null
      }
      nextButton={({ currentStep, stepsLength, setCurrentStep, setIsOpen }) => {
        const isLast = currentStep === stepsLength - 1;
        return (
          <button
            onClick={() => {
              if (isLast) {
                setIsOpen(false);
              } else {
                setCurrentStep(currentStep + 1);
              }
            }}
            style={{
              background: primary,
              border: 'none',
              color: '#fff',
              borderRadius: 8,
              padding: '6px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isLast ? 'Done' : 'Next'}
          </button>
        );
      }}
    >
      <CurriculumManagerContent tab={tab} setTab={setTab} />
    </TourProvider>
  );
};

export default CurriculumManager;
