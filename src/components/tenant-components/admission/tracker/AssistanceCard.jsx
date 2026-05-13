import { Box, Paper, Typography, Button } from '@mui/material';
import { QuestionMark as QuestionIcon } from '@mui/icons-material';

const AssistanceCard = () => (
  <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5, bgcolor: '#EEF2FF' }}>
    <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: '#C7D2FE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <QuestionIcon sx={{ color: '#3730A3', fontSize: 18 }} />
      </Box>
      <Box>
        <Typography variant="body2" fontWeight={700}>
          Need Assistance?
        </Typography>
        <Typography variant="caption" color="text.secondary">
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
);

export default AssistanceCard;
