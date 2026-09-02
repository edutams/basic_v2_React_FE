import { Box, Typography, Paper } from '@mui/material';
import { IconLock } from '@tabler/icons-react';

/**
 * Shown in place of a page's real content for non-admin end users (parent/
 * student/teacher) once the school's subscription is locked. Deliberately
 * vague — end users are never told their school owes money, only that the
 * platform is unavailable and to contact the school. Admin-tier users never
 * see this; they get the real page and the backend's specific message when
 * an action actually needs a subscription.
 */
const SubscriptionLockedNotice = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      p: 3,
    }}
  >
    <Paper
      elevation={0}
      sx={{
        p: 4,
        maxWidth: 420,
        textAlign: 'center',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: 'error.light',
          color: 'error.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <IconLock size={28} />
      </Box>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        This platform is temporarily unavailable
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please contact your school for more information.
      </Typography>
    </Paper>
  </Box>
);

export default SubscriptionLockedNotice;
