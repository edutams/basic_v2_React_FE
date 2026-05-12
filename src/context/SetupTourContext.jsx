import { createContext, useContext, useState, useCallback } from 'react';
import { TourProvider, useTour } from '@reactour/tour';
import { useTheme, Box, Typography } from '@mui/material';

// ── Context ───────────────────────────────────────────────────────────────────
const SetupTourCtx = createContext({ startTour: () => {}, stopTour: () => {} });

export const useSetupTour = () => useContext(SetupTourCtx);

// ── Step content helper ───────────────────────────────────────────────────────
const StepContent = ({ title, body }) => (
  <Box sx={{ p: 0.5 }}>
    {title && (
      <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.75, color: 'text.primary' }}>
        {title}
      </Typography>
    )}
    <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
      {body}
    </Typography>
  </Box>
);

// ── Tour steps (data-tour selectors) ─────────────────────────────────────────
const buildSteps = () => [
  // ── Welcome page ──────────────────────────────────────────────────────────
  {
    selector: '[data-tour="welcome-heading"]',
    content: (
      <StepContent
        title="Welcome Aboard! 🚀"
        body="A few quick steps and your digital school experience will be ready to go."

        
      />
    ),
  },
  {
    selector: '[data-tour="welcome-help"]',
    content: (
      <StepContent
        title="Need help?"
        body="Click 'Get Help' or watch the setup video at any time if you get stuck."
      />
    ),
  },
  {
    selector: '[data-tour="welcome-start"]',
    content: (
      <StepContent
        title="Let's go!"
        body="Click 'Start Setup' to begin configuring your school profile."
      />
    ),
  },

  // ── Stage 1 – School Profile ───────────────────────────────────────────────
  {
    selector: '[data-tour="stage1-logo"]',
    content: (
      <StepContent
        title="Upload your school logo"
        body="Click the logo area or the Browse button to upload your school's logo."
      />
    ),
  },
  {
    selector: '[data-tour="stage1-details"]',
    content: (
      <StepContent
        title="Confirm school details"
        body="Review your school name, acronym, type and address. If anything is wrong, use 'Get Help'."
      />
    ),
  },
  {
    selector: '[data-tour="stage1-admins"]',
    content: (
      <StepContent
        title="Admin information"
        body="Verify the school owner, school head and portal admin details before continuing."
      />
    ),
  },
  {
    selector: '[data-tour="shell-save-continue"]',
    content: (
      <StepContent
        title="Save & Continue"
        body="When you're happy with the details, click 'Save & Continue' to move to the next step."
      />
    ),
  },

  // ── Stage 2 – Manage Sessions ──────────────────────────────────────────────
  {
    selector: '[data-tour="stage2-heading"]',
    content: (
      <StepContent
        title="Manage Sessions"
        body="Select the current academic session and subscribe to activate your school calendar."
      />
    ),
  },

  // ── Stage 3 – Class Arms ───────────────────────────────────────────────────
  {
    selector: '[data-tour="stage3-heading"]',
    content: (
      <StepContent
        title="Create Class Arms"
        body="Set up your class arms here. Deactivate any classes your school doesn't currently run."
      />
    ),
  },

  // ── Stage 4 – Add Learners ─────────────────────────────────────────────────
  {
    selector: '[data-tour="stage4-heading"]',
    content: (
      <StepContent
        title="Add Learners"
        body="Upload a spreadsheet or manually add learners and assign them to their classes."
      />
    ),
  },

  // ── Stage 5 – Add Teachers ─────────────────────────────────────────────────
  {
    selector: '[data-tour="stage5-heading"]',
    content: (
      <StepContent
        title="Add Teachers"
        body="Onboard your teaching and non-teaching staff to the portal."
      />
    ),
  },
  {
    selector: '[data-tour="shell-save-continue"]',
    content: (
      <StepContent
        title="Almost done!"
        body="Click 'Save & Continue' to finish the setup and head to the completion screen."
      />
    ),
  },

  // ── Complete Setup ─────────────────────────────────────────────────────────
  {
    selector: '[data-tour="complete-cta"]',
    content: (
      <StepContent
        title="You're all set! 🎉"
        body="Your school setup is complete. Click 'Continue to Dashboard' to start using EduTAMS."
      />
    ),
  },
];

// ── Inner provider (needs access to useTour) ──────────────────────────────────
const InnerProvider = ({ children }) => {
  const { setIsOpen, setCurrentStep } = useTour();

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, [setIsOpen, setCurrentStep]);

  const stopTour = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <SetupTourCtx.Provider value={{ startTour, stopTour }}>
      {children}
    </SetupTourCtx.Provider>
  );
};

// ── Public provider ───────────────────────────────────────────────────────────
export const SetupTourProvider = ({ children }) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const steps = buildSteps();

  return (
    <TourProvider
      steps={steps}
      showBadge={false}
      showDots
      scrollSmooth
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: 14,
          padding: '18px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          maxWidth: 300,
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
      <InnerProvider>{children}</InnerProvider>
    </TourProvider>
  );
};
