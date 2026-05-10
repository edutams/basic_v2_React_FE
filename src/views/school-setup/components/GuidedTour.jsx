import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Portal } from '@mui/material';
import { IconX } from '@tabler/icons-react';

/**
 * GuidedTour
 * Props:
 *  - steps: [{ targetId, title, description, placement? }]
 *    placement: 'top' | 'bottom' | 'left' | 'right' (default 'bottom')
 *  - onFinish: called when the tour ends (last Next or Skip)
 *  - active: boolean — show/hide the tour
 */
const POPOVER_W = 280;
const POPOVER_H = 130; // approx
const GAP = 12;

const GuidedTour = ({ steps = [], onFinish, active = true }) => {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const rafRef = useRef(null);

  const current = steps[step];

  // Track the target element's position (handles scroll/resize)
  useEffect(() => {
    if (!active || !current) return;

    const measure = () => {
      const el = document.getElementById(current.targetId);
      if (el) {
        setRect(el.getBoundingClientRect());
      }
      rafRef.current = requestAnimationFrame(measure);
    };

    rafRef.current = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, step, current]);

  if (!active || !current || !rect) return null;

  const placement = current.placement || 'bottom';

  // ── Popover position ──────────────────────────────────────────────────────
  let popX = 0;
  let popY = 0;
  let arrowStyle = {};

  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  if (placement === 'bottom') {
    popX = Math.max(8, Math.min(cx - POPOVER_W / 2, window.innerWidth - POPOVER_W - 8));
    popY = rect.bottom + GAP;
    arrowStyle = {
      top: -8, left: cx - popX - 8,
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderBottom: '8px solid #fff',
    };
  } else if (placement === 'top') {
    popX = Math.max(8, Math.min(cx - POPOVER_W / 2, window.innerWidth - POPOVER_W - 8));
    popY = rect.top - POPOVER_H - GAP;
    arrowStyle = {
      bottom: -8, left: cx - popX - 8,
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderTop: '8px solid #fff',
    };
  } else if (placement === 'right') {
    popX = rect.right + GAP;
    popY = Math.max(8, cy - POPOVER_H / 2);
    arrowStyle = {
      left: -8, top: cy - popY - 8,
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent',
      borderRight: '8px solid #fff',
    };
  } else if (placement === 'left') {
    popX = rect.left - POPOVER_W - GAP;
    popY = Math.max(8, cy - POPOVER_H / 2);
    arrowStyle = {
      right: -8, top: cy - popY - 8,
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent',
      borderLeft: '8px solid #fff',
    };
  }

  const handleNext = () => {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else onFinish?.();
  };

  const handleSkip = () => onFinish?.();

  const isLast = step === steps.length - 1;

  return (
    <Portal>
      {/* ── Spotlight overlay ── */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1400,
          pointerEvents: 'none',
        }}
      >
        {/* Dark mask with a cut-out hole via box-shadow */}
        <Box
          sx={{
            position: 'absolute',
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
            border: '2px solid',
            borderColor: 'primary.main',
            transition: 'all 0.25s ease',
            pointerEvents: 'none',
          }}
        />
      </Box>

      {/* ── Popover ── */}
      <Box
        sx={{
          position: 'fixed',
          top: popY,
          left: popX,
          width: POPOVER_W,
          zIndex: 1500,
          bgcolor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          p: 2,
          pointerEvents: 'all',
        }}
      >
        {/* Arrow */}
        <Box
          sx={{
            position: 'absolute',
            width: 0,
            height: 0,
            ...arrowStyle,
          }}
        />

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>
                {step + 1}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>
              {current.title}
            </Typography>
          </Box>
          <Box
            onClick={handleSkip}
            sx={{ cursor: 'pointer', opacity: 0.45, '&:hover': { opacity: 1 } }}
          >
            <IconX size={15} />
          </Box>
        </Box>

        {/* Description */}
        <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.6, mb: 1.5 }}>
          {current.description}
        </Typography>

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
            {step + 1} / {steps.length}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" onClick={handleSkip} sx={{ fontSize: 11, color: 'text.secondary', minWidth: 0, px: 1 }}>
              Skip
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleNext}
              sx={{ fontSize: 11, px: 2, borderRadius: '8px', textTransform: 'none' }}
            >
              {isLast ? 'Done' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Portal>
  );
};

export default GuidedTour;
