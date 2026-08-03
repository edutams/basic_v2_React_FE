import { createContext, useContext, useCallback, useEffect } from 'react';
import { TourProvider, useTour } from '@reactour/tour';
import { useTheme, Box, Typography } from '@mui/material';

// ── Context ───────────────────────────────────────────────────────────────────
const AclTourCtx = createContext({ startTour: () => {}, stopTour: () => {} });

export const useAclTour = () => useContext(AclTourCtx);

// ── Step content helper ───────────────────────────────────────────────────────
export const StepContent = ({ title, body }) => (
  <Box sx={{ p: 0.5 }}>
    {title && (
      <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.75, color: 'text.primary' }}>
        {title}
      </Typography>
    )}
    <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>{body}</Typography>
  </Box>
);

// ── Inner provider (needs access to useTour) ──────────────────────────────────
const InnerProvider = ({ autoPlay, children }) => {
  const { setIsOpen, setCurrentStep } = useTour();

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, [setIsOpen, setCurrentStep]);

  const stopTour = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  // Auto-play the tour every time this provider mounts (e.g. page/tab mount)
  useEffect(() => {
    if (!autoPlay) return;

    const timer = setTimeout(() => {
      startTour();
    }, 800);

    return () => clearTimeout(timer);
  }, [autoPlay, startTour]);

  return (
    <AclTourCtx.Provider value={{ startTour, stopTour }}>{children}</AclTourCtx.Provider>
  );
};

// ── Public provider ───────────────────────────────────────────────────────────
export const AclTourProvider = ({ steps, autoPlay = false, children }) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

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
      <InnerProvider autoPlay={autoPlay}>{children}</InnerProvider>
    </TourProvider>
  );
};
