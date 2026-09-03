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

import { CURRICULUM_TOUR_KEYS } from './constants/tourKeys';
import { curriculumSetupSteps } from './tours/curriculumSetup.steps';
import { subjectBankSteps } from './tours/subjectBank.steps';
import { classSubjectSteps } from './tours/classSubject.steps';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Curriculum Manager' },
];

const TabPanel = ({ children, value, index }) => {
  return value === index && <Box mt={2}>{children}</Box>;
};

// ── Tour Steps Configuration per Tab ──────────────────────────────────────────

const preventNodeScroll = (step) => ({
  ...step,
  action: (node) => {
    if (node) {
      node.scrollIntoView = () => { };
    }
  },
});

const getStepsForTab = (tabIndex) => {
  let steps;
  switch (tabIndex) {
    case 1:
      steps = subjectBankSteps;
      break;
    case 2:
      steps = classSubjectSteps;
      break;
    case 0:
    default:
      steps = curriculumSetupSteps;
      break;
  }
  return steps.map(preventNodeScroll);
};

// ── Inner Main View ───────────────────────────────────────────────────────────
const CurriculumManagerContent = ({ tab, setTab }) => {
  const { isOpen, setIsOpen, setCurrentStep } = useTour();

  // Temporarily disable scrollIntoView while tour guide is open to prevent @reactour/tour from scrolling
  useEffect(() => {
    if (isOpen) {
      const originalScrollIntoView = Element.prototype.scrollIntoView;
      Element.prototype.scrollIntoView = function () { };
      return () => {
        Element.prototype.scrollIntoView = originalScrollIntoView;
      };
    }
  }, [isOpen]);

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
            <Tab data-tour={CURRICULUM_TOUR_KEYS.TAB_SETUP} label="Curriculum Setup" />
            <Tab data-tour={CURRICULUM_TOUR_KEYS.TAB_SUBJECT_BANK} label="Subject Bank" />
            <Tab data-tour={CURRICULUM_TOUR_KEYS.TAB_CLASS_SUBJECT} label="Class Subject" />
          </Tabs>

          <Tooltip title="Select a tab first, then click to start its guided tour." arrow placement="top">
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
        <Box>
          <TabPanel value={tab} index={0}>
            <CurriculumSetup />
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <SubjectBank />
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <ClassSubject />
          </TabPanel>
        </Box>
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
      disableScroll={true}
      disableSmoothScroll={true}
      scrollSmooth={false}
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
