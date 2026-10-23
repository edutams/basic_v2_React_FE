import React from 'react';
import { Box, Stack, Typography, Paper, Button, LinearProgress, Divider, Skeleton, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

/**
 * The stat-card building blocks shared by every Timetable page (Generate
 * Timetable, My Timetable, Teacher View) — white/bordered card with a
 * small colored icon chip, never a fully-tinted card background. Extracted
 * from GenerateTimetable.jsx so every timetable stat card stays visually
 * identical instead of drifting into its own one-off style per page.
 */
export const LegendDot = ({ color, label }) => (
  <Stack direction="row" spacing={0.5} alignItems="center">
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
    <Typography variant="caption" fontWeight={800} color="text.primary">
      {label}
    </Typography>
  </Stack>
);

export const DividedStat = ({ value1, label1, color1, value2, label2, color2 }) => (
  <Stack direction="row" alignItems="center" spacing={1.5} divider={<Divider orientation="vertical" flexItem />}>
    <Box>
      <Typography variant="h6" fontWeight={800} lineHeight={1.2} color={color1}>
        {value1}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label1}
      </Typography>
    </Box>
    <Box>
      <Typography variant="h6" fontWeight={800} lineHeight={1.2} color={color2}>
        {value2}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label2}
      </Typography>
    </Box>
  </Stack>
);

export const BarWithPct = ({ value, mainLabel, subLabel, barColor, legend }) => (
  <>
    <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
      {mainLabel}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
      {subLabel}
    </Typography>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          flex: 1,
          height: 6,
          borderRadius: 3,
          bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 3 },
        }}
      />
      <Typography variant="caption" fontWeight={800} sx={{ flexShrink: 0 }}>
        {value}%
      </Typography>
    </Stack>
    {legend && (
      <Stack direction="row" spacing={1.5}>
        {legend}
      </Stack>
    )}
  </>
);

export const StatCardShell = ({ icon: Icon, iconColor, title, tooltip, loading, children, linkText, linkIcon: LinkIcon, onLinkClick, accent }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 2,
      p: 1.25,
      border: '1px solid',
      borderColor: accent ? `${accent}40` : 'divider',
      bgcolor: accent ? `${accent}0D` : 'background.paper',
      minWidth: 0,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 0.75, flexShrink: 0 }}>
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 1.25,
          bgcolor: `${iconColor}1A`,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {loading ? <Skeleton variant="circular" width={16} height={16} /> : <Icon sx={{ fontSize: 17 }} />}
      </Box>
      <Typography variant="body2" fontWeight={700} sx={{ flex: 1, fontSize: '0.8rem', lineHeight: 1.25 }}>
        {title}
      </Typography>
      {tooltip && (
        <Tooltip title={tooltip}>
          <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0, mt: 0.25 }} />
        </Tooltip>
      )}
    </Stack>
    {loading ? (
      <Skeleton variant="text" width="70%" height={30} />
    ) : (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>{children}</Box>
    )}
    {linkText && (
      <Button
        size="small"
        onClick={onLinkClick}
        startIcon={LinkIcon ? <LinkIcon sx={{ fontSize: 13 }} /> : null}
        endIcon={<ChevronRightIcon sx={{ fontSize: 13 }} />}
        sx={{ mt: 0.75, fontSize: '0.68rem', p: 0, minWidth: 0, color: accent || 'primary.main', justifyContent: 'flex-start', flexShrink: 0 }}
      >
        {linkText}
      </Button>
    )}
  </Paper>
);
