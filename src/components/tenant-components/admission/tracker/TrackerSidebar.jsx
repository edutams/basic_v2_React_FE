import { Box, Paper, Typography, Button } from '@mui/material';
import {
  Print as PrintIcon,
  HowToReg as EnrollIcon,
  QuestionMark as QuestionIcon,
} from '@mui/icons-material';

const TrackerSidebar = () => (
  <Box>
    {/* Upcoming Requirements */}
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, mb: 2 }}>
      <Typography
        variant="caption"
        fontWeight={700}
        sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
        display="block"
        mb={1.5}
      >
        Upcoming Requirements
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          p: 2,
          borderRadius: 2,
          bgcolor: 'grey.200',
          mb: 1,
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
          <PrintIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
        </Box>

        <Box>
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            Print Application Form
          </Typography>

          <Typography variant="h6" color="text.disabled" fontStyle="italic">
            Available after admission offer.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          p: 2,
          borderRadius: 2,
          bgcolor: 'grey.200',
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
          <EnrollIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
        </Box>

        <Box>
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            Enrollment Confirmation
          </Typography>

          <Typography variant="h6" color="text.disabled" fontStyle="italic">
            Final step after fee payment.
          </Typography>
        </Box>
      </Box>
    </Paper>

    {/* Need Assistance */}
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 4, bgcolor: 'info.light' }}>
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
        <Box>
          <Typography variant="body2" fontWeight={700}>
            Need Assistance?
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Our admissions office is available Mon-Fri, 8am-4pm.
          </Typography>
        </Box>
      </Box>
      <Button
        variant="outlined"
        fullWidth
        sx={{
          fontWeight: 600,
          borderColor: 'grey.400',
          // color: 'primary.main',
          color: 'text.primary',
          bgcolor: '#fff',
        }}
      >
        Contact Support
      </Button>
    </Paper>
  </Box>
);

export default TrackerSidebar;
