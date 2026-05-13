import { Box, Paper, Typography, Button } from '@mui/material';
import {
  Print as PrintIcon,
  HowToReg as EnrollIcon,
  QuestionMark as QuestionIcon,
} from '@mui/icons-material';

const REQUIREMENTS = [
  { icon: PrintIcon,  label: 'Print Application Form', sub: 'Available after admission offer.' },
  { icon: EnrollIcon, label: 'Enrollment Confirmation', sub: 'Final step after fee payment.'   },
];

const TrackerSidebar = () => (
  <Box>
    {/* Upcoming Requirements */}
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, mb: 2 }}>
      <Typography
        variant="caption"
        fontWeight={700}
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
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2,
            bgcolor: 'grey.200',
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
          <Box sx={{ minWidth: 0 }}>
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

    {/* Need Assistance */}
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, bgcolor: 'info.light' }}>
      <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <QuestionIcon sx={{ color: 'primary.main', fontSize: 18 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700}>
            Need Assistance?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our admissions office is available Mon-Fri, 8am-4pm.
          </Typography>
        </Box>
      </Box>

      <Button
        variant="outlined"
        fullWidth
        sx={{
          fontWeight: 600,
          borderRadius: 2,
          borderColor: 'grey.400',
          color: 'text.primary',
          bgcolor: '#fff',
          '&:hover': { borderColor: 'primary.main', bgcolor: '#fff' },
        }}
      >
        Contact Support
      </Button>
    </Paper>
  </Box>
);

export default TrackerSidebar;
