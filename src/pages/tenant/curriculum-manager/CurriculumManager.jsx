import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/container/PageContainer';
import Breadcrumb from '@/layouts/landlord/shared/breadcrumb/Breadcrumb';
import ParentCard from '@/components/shared/ParentCard';
import CurriculumSetup from './components/CurriculumSetup';
import SubjectBank from './components/SubjectBank';
import ClassSubject from './components/ClassSubject';
import { Box, Tabs, Tab, Button, Typography, Tooltip, useTheme } from '@mui/material';
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
          Welcome to Curriculum Setup! Configure your school's active curriculums and map them to class levels.
        </Typography>
      </Box>
    ),
  },
  {
    selector: '[data-tour="curriculum-import-btn"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Import Curriculums 📥
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click <b>Import</b> to pull pre-built national curriculums (with pre-configured subject structures) directly into your school.
        </Typography>
      </Box>
    ),
  },
  {
    selector: '[data-tour="curriculum-create-btn"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Create Custom Curriculum ➕
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click <b>Create Curriculum</b> to build a brand-new custom curriculum tailored to your institution.
        </Typography>
      </Box>
    ),
  },
  {
    selector: '[data-tour="curriculum-action-btn"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Edit & Delete Curriculums ✏️🗑️
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click the <b>3-dots action menu</b> on any curriculum row to edit curriculum details or remove custom curriculums.
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
          Select the active Academic Session & Term, then map each class level to its active curriculum.
        </Typography>
      </Box>
    ),
  },
  {
    selector: '[data-tour="curriculum-assign-update-btn"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Save Class Assignments 💾
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click <b>Update</b> to save your class-to-curriculum mappings for the chosen session and term.
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
          Manage all subjects and subject groups offered under each active curriculum.
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
    selector: '[data-tour="subject-create-group-btn"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Create Subject Group 📦
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click <b>Create Group</b> to bundle multiple subjects (e.g. Sciences, Trade Subjects) with combined pass marks and credit units.
        </Typography>
      </Box>
    ),
  },
  {
    selector: '[data-tour="subject-group-action-btn"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Subject Group Actions 🛠️
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click the <b>action button</b> on any group row to edit group details, update subject memberships, or delete the group.
        </Typography>
      </Box>
    ),
  },
  {
    selector: '[data-tour="subject-add-btn"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Add New Subject ➕
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click <b>Add Subject</b> to create new subjects with subject codes, pass marks, credit units, and status (compulsory/optional/trade).
        </Typography>
      </Box>
    ),
  },
  {
    selector: '[data-tour="subject-action-btn"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Edit & Delete Subjects ✏️🗑️
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click the <b>3-dots action menu</b> on any subject to edit subject settings or remove it from the subject bank.
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
          Assign subjects directly to specific class arms and manage teacher allocations.
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
    selector: '[data-tour="class-add-subject-btn"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Add Subject to Class ➕
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click <b>Add Subject to Class</b> to assign new subjects to the selected class arm.
        </Typography>
      </Box>
    ),
  },
  {
    selector: '[data-tour="class-subject-action-btn"]',
    content: (
      <Box sx={{ p: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75, color: 'primary.main' }}>
          Edit & Delete Class Subjects ✏️🗑️
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
          Click the <b>3-dots action menu</b> on any class subject row to edit pass mark/units or unassign the subject from the class.
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
      {/* HEADER */}
      <Box data-tour="curriculum-manager-header" sx={{ mb: 2 }}>
        <Breadcrumb title="Curriculum Manager" items={BCrumb} />
      </Box>

      <Box>
        {/* TABS & TAKE TOUR BUTTON */}
        <Box
          data-tour="curriculum-tabs"
          sx={{
            mb: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
            pb: 0.5,
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, val) => setTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minWidth: '300px',
            }}
          >
            <Tab data-tour="tab-0" label="Curriculum Setup" />
            <Tab data-tour="tab-1" label="Subject Bank" />
            <Tab data-tour="tab-2" label="Class Subject" />
          </Tabs>

          <Tooltip title="Select any tab to view its specific guided tour" arrow placement="top">
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
                whiteSpace: 'nowrap',
                mb: 0.5,
              }}
            >
              Take Tour
            </Button>
          </Tooltip>
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
