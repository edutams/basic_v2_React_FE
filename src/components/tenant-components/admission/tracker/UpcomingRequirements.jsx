import { Box, Paper, Typography } from '@mui/material';
import { Print as PrintIcon, HowToReg as EnrollIcon } from '@mui/icons-material';

const REQUIREMENTS = [
  {
    icon: PrintIcon,
    label: 'Print Application Form',
    sub: 'Available after admission offer.',
  },
  {
    icon: EnrollIcon,
    label: 'Enrollment Confirmation',
    sub: 'Final step after fee payment.',
  },
];

const UpcomingRequirements = () => (
  <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, mb: 2 }}>
    <Typography
      variant="caption"
      fontWeight={700}
      color="text.secondary"
      sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
      display="block"
      mb={1.5}
    >
      Upcoming Requirements
    </Typography>

    {REQUIREMENTS.map(({ icon: Icon, label, sub }) => (
      <Box
        key={label}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          p: 1.5,
          borderRadius: 2,
          bgcolor: 'grey.50',
          mb: 1,
          '&:last-child': { mb: 0 },
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ color: 'text.disabled', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            {label}
          </Typography>
          <Typography variant="caption" color="text.disabled" fontStyle="italic">
            {sub}
          </Typography>
        </Box>
      </Box>
    ))}
  </Paper>
);

export default UpcomingRequirements;
