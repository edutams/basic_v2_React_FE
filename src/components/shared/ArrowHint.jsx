import { Box, Typography, useTheme } from '@mui/material';

/**
 * ArrowHint — reusable animated arrow + bubble hint component.
 *
 * Props:
 *  show        {boolean}  — controls visibility; parent owns the condition
 *  label       {string}   — text inside the bubble
 *  direction   {string}   — arrow direction: 'up-right' | 'up-left' | 'down-right' | 'down-left' | 'up'
 *  mode        {string}   — 'persistent' (bounce forever) | 'timed' (fadeIn → bob × 2 → fadeOut after ~4.5s)
 *  position    {object}   — sx position overrides, e.g. { position:'absolute', top:110, right:40 }
 *                           omit for inline flow
 *  delay       {string}   — CSS animation delay for the entrance, e.g. '0.6s'
 *  color       {string}   — override primary color (defaults to theme.palette.primary.main)
 *  sx          {object}   — extra sx on the root Box
 */

//  SVG paths for each direction 
const ARROW_PATHS = {
  'up-right': {
    curve:     'M6 42 C6 24, 22 14, 38 4',
    arrowhead: 'M26 2 L38 4 L36 14',
    align:     'flex-start',   // arrow aligns left, bubble right
    order:     'arrow-first',  // arrow on top, bubble below
  },
  'up-left': {
    curve:     'M38 42 C38 24, 22 14, 6 4',
    arrowhead: 'M18 2 L6 4 L8 14',
    align:     'flex-end',
    order:     'arrow-first',
  },
  'up': {
    curve:     'M22 42 L22 6',
    arrowhead: 'M14 14 L22 4 L30 14',
    align:     'center',
    order:     'arrow-first',
  },
  'down-right': {
    curve:     'M6 4 C4 22, 20 36, 40 46',
    arrowhead: 'M30 44 L40 46 L36 36',
    align:     'flex-start',
    order:     'bubble-first', // bubble on top, arrow below
  },
  'down-left': {
    curve:     'M40 4 C42 22, 26 36, 6 46',
    arrowhead: 'M16 44 L6 46 L10 36',
    align:     'flex-end',
    order:     'bubble-first',
  },
};

//  Keyframe definitions (injected once via sx spread)
const KEYFRAMES = {
  '@keyframes _hint_fadeUp': {
    from: { opacity: 0, transform: 'translateY(16px)' },
    to:   { opacity: 1, transform: 'translateY(0)' },
  },
  '@keyframes _hint_fadeIn': {
    from: { opacity: 0 },
    to:   { opacity: 1 },
  },
  '@keyframes _hint_fadeOut': {
    from: { opacity: 1 },
    to:   { opacity: 0 },
  },
  '@keyframes _hint_bounce': {
    '0%, 100%': { transform: 'translateY(0)' },
    '40%':      { transform: 'translateY(-6px)' },
    '60%':      { transform: 'translateY(-3px)' },
  },
  '@keyframes _hint_bob': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%':      { transform: 'translateY(-5px)' },
  },
};

const ArrowHint = ({
  show = true,
  label,
  direction = 'up-right',
  mode = 'persistent',
  position,
  delay = '0.6s',
  color,
  sx = {},
}) => {
  const theme = useTheme();
  const primary = color || theme.palette.primary.main;

  if (!show) return null;

  const paths = ARROW_PATHS[direction] || ARROW_PATHS['up-right'];

  const animation =
    mode === 'timed'
      ? `_hint_fadeIn 0.4s cubic-bezier(0.22,1,0.36,1) ${delay} both, _hint_bob 2s ease-in-out calc(${delay} + 0.5s) 2, _hint_fadeOut 0.5s ease-in-out calc(${delay} + 4.5s) both`
      : `_hint_fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) ${delay} both, _hint_bounce 2.4s ease-in-out calc(${delay} + 1s) infinite`;

  const arrowSvg = (
    <svg
      width="44"
      height="48"
      viewBox="0 0 44 48"
      fill="none"
      style={{ alignSelf: paths.align, flexShrink: 0 }}
    >
      <path
        d={paths.curve}
        stroke={primary}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={paths.arrowhead}
        stroke={primary}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );

  const bubble = (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '2px solid',
        borderColor: primary,
        borderRadius: '14px !important',
        px: 2,
        py: 1.25,
        boxShadow: `0 6px 24px ${primary}22`,
        whiteSpace: 'nowrap',
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          color: primary,
          letterSpacing: 0.2,
          lineHeight: 1.4,
        }}
      >
        {label}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        ...KEYFRAMES,
        display: 'flex',
        flexDirection: 'column',
        alignItems: paths.align,
        gap: 0.5,
        pointerEvents: 'none',
        animation,
        ...(position || {}),
        ...sx,
      }}
    >
      {paths.order === 'arrow-first' ? (
        <>
          {arrowSvg}
          {bubble}
        </>
      ) : (
        <>
          {bubble}
          {arrowSvg}
        </>
      )}
    </Box>
  );
};

export default ArrowHint;
