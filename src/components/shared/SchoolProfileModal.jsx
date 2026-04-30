import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Chip,
  Divider,
  Avatar,
} from '@mui/material';

const SchoolProfileModal = ({ open, onClose, school }) => {
  if (!school) return null;

  // Extract SPA Contact
  const spa = school.administrator_info?.school_spa || {};
  const spaName = `${spa.admin_first_name || ''} ${spa.admin_last_name || ''}`.trim() || '—';
  const spaEmail = spa.admin_email || school.tenant_email || '—';
  const spaPhone = spa.admin_phone || '—';

  // Extract Agent / Organisation
  const org = school.organization || {};
  const agentName = org.organization_name || '—';
  const agentEmail = org.organization_email || '—';

  // School Info
  const schoolName = school.tenant_name || 'Unknown School';
  const schoolLogo = school.school_logo || '';
  const schoolUrl = school.domains?.[0]?.domain ? `https://${school.domains[0].domain}` : '—';

  const status = school.status || 'active';
  const createdDate = school.created_at
    ? new Date(school.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'N/A';

  const field = (label, value) => (
    <Box mb={2}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value || '—'}
      </Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        School Profile
        <Chip
          size="small"
          label={status.toUpperCase()}
          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
          color={status === 'active' ? 'success' : 'default'}
        />
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={3} mb={4}>
          <Avatar src={schoolLogo} sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
            {schoolName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {schoolName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {schoolUrl}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* SPA Contact */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
              School Contact (SPA)
            </Typography>
            {field('Name', spaName)}
            {field('Email', spaEmail)}
            {field('Phone', spaPhone)}
          </Grid>

          {/* Agent / Organisation */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Agent / Organisation
            </Typography>
            {field('Agent Name', agentName)}
            {field('Agent Email', agentEmail)}
          </Grid>

          {/* School Details */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              School Details
            </Typography>
            {field('School Type', school.school_type?.toUpperCase() || '—')}
            {field('Status', status.toUpperCase())}
            {field('Address', school.address || '—')}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Dates
            </Typography>
            {field('Created On', createdDate)}
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SchoolProfileModal;
