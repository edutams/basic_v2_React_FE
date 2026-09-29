import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { Group, Description, Article, Folder, PersonAdd, ArrowForward } from '@mui/icons-material';
import { CardShell, GlanceRow } from '../common';
import { BLUE, GREEN, ORANGE, PURPLE, num } from '../constants';

/**
 * At a Glance — right-hand card listing key ratios with tinted rows and a footer link.
 */
const AtAGlance = ({ at_a_glance, onViewFullReports }) => (
  <CardShell sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1.75 }}>
      AT A GLANCE
    </Typography>
    <Stack spacing={1.25}>
      <GlanceRow
        icon={Group}
        color={GREEN}
        label="Acceptance Rate"
        sub="(Admitted → Accepted)"
        value={`${num(at_a_glance.acceptance_rate)}%`}
        valueColor={GREEN}
      />
      <GlanceRow
        icon={Description}
        color={BLUE}
        label="Enrollment Rate"
        sub="(Applicants → Accepted)"
        value={`${num(at_a_glance.enrollment_rate)}%`}
        valueColor={BLUE}
      />
      <GlanceRow
        icon={Article}
        color={ORANGE}
        label="Offers Pending Acceptance"
        value={num(at_a_glance.offers_pending_acceptance).toLocaleString()}
        valueColor={ORANGE}
      />
      <GlanceRow
        icon={Folder}
        color={BLUE}
        label="Forms Today"
        value={num(at_a_glance.forms_today).toLocaleString()}
        valueColor={BLUE}
      />
      <GlanceRow
        icon={PersonAdd}
        color={PURPLE}
        label="New Applicants Today"
        value={num(at_a_glance.new_applicants_today).toLocaleString()}
        valueColor={PURPLE}
      />
    </Stack>

    <Box
      sx={{
        mt: 'auto',
        pt: 1.75,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        color: 'primary.main',
        fontWeight: 700,
        fontSize: 11,
        cursor: 'pointer',
        '&:hover': { gap: 0.75, textDecoration: 'underline' },
        transition: 'all 0.2s ease',
      }}
      onClick={onViewFullReports}
    >
      View Full Reports <ArrowForward sx={{ fontSize: 14 }} />
    </Box>
  </CardShell>
);

export default AtAGlance;
