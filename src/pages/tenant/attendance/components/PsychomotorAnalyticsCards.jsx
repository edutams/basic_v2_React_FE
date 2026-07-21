import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Stack,
  Button,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  useTheme,
} from '@mui/material';
import AnalyticsModal from './AnalyticsModal';

const PsychomotorAnalyticsCards = ({ metrics }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [analyticsModal, setAnalyticsModal] = useState({ open: false, title: '', content: null });

  const openCardModal = (cardTitle, modalBody) => {
    setAnalyticsModal({ open: true, title: cardTitle, content: modalBody });
  };

  const cardSx = {
    p: 2.5,
    borderRadius: '16px',
    border: `2px solid ${isDark ? 'rgba(91, 38, 38, 0.08)' : theme.palette.grey[100]}`,
    bgcolor: isDark ? 'background.paper' : '#fff',
    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 0 20px rgba(0,0,0,.10)',
    height: '100%',
  };

  const clickableCardSx = {
    ...cardSx,
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': { transform: 'translateY(-3px)' },
  };

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Card 1: AVG. AFFECTIVE RATING */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={0} sx={cardSx}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">AVG. AFFECTIVE RATING</Typography>
            <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>{metrics.avgAffective}/5</Typography>
            <LinearProgress variant="determinate" value={84} color="success" sx={{ my: 1, height: 4, borderRadius: 2 }} />
            <Typography variant="caption" color="success.main" fontWeight={600}>+0.4 from last term</Typography>
          </Paper>
        </Grid>

        {/* Card 2: AVG. PSYCHOMOTOR RATING */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            onClick={() =>
              openCardModal('Psychomotor Rating Breakdown', (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Average rating distribution per psychomotor skill.
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box><Typography variant="caption" fontWeight={700}>Handwriting: 4.1 / 5</Typography><LinearProgress variant="determinate" value={82} color="primary" sx={{ height: 6, borderRadius: 3 }} /></Box>
                    <Box><Typography variant="caption" fontWeight={700}>Games & Sports: 3.6 / 5</Typography><LinearProgress variant="determinate" value={72} color="primary" sx={{ height: 6, borderRadius: 3 }} /></Box>
                    <Box><Typography variant="caption" fontWeight={700}>Drawing & Painting: 3.7 / 5</Typography><LinearProgress variant="determinate" value={74} color="primary" sx={{ height: 6, borderRadius: 3 }} /></Box>
                  </Stack>
                </Box>
              ))
            }
            sx={clickableCardSx}
          >
            <Typography variant="caption" fontWeight={700} color="text.secondary">AVG. PSYCHOMOTOR RATING</Typography>
            <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>{metrics.avgPsychomotor}/5</Typography>
            <LinearProgress variant="determinate" value={76} color="primary" sx={{ my: 1, height: 4, borderRadius: 2 }} />
            <Typography variant="caption" color="text.secondary">→ Stable performance</Typography>
          </Paper>
        </Grid>

        {/* Card 3: NEEDING SUPPORT */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            onClick={() =>
              openCardModal('Learners Needing Support List', (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Students with rating scores under 3.0 needing targeted support.
                  </Typography>
                  <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow><TableCell>Learner</TableCell><TableCell>Weak Domain</TableCell><TableCell>Score</TableCell></TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow><TableCell>BALOGUN Joseph</TableCell><TableCell>Punctuality</TableCell><TableCell>2 / 5</TableCell></TableRow>
                        <TableRow><TableCell>ADEKUNLE Ibrahim</TableCell><TableCell>Games & Sports</TableCell><TableCell>2 / 5</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))
            }
            sx={clickableCardSx}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="caption" fontWeight={700} color="text.secondary">NEEDING SUPPORT</Typography>
              <Chip label="URGENT" size="small" color="error" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
            </Stack>
            <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ my: 0.5 }}>{metrics.needingSupport}</Typography>
            <Button size="small" variant="outlined" sx={{ mt: 0.5, textTransform: 'none' }}>
              View Details
            </Button>
          </Paper>
        </Grid>

        {/* Card 4: RATING BY GENDER */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            onClick={() =>
              openCardModal('Gender Rating Detailed Comparison', (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Detailed affective vs psychomotor comparison by gender.
                  </Typography>
                  <TableContainer elevation={0} variant="outlined" sx={{ borderRadius: 2, overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow><TableCell>Gender</TableCell><TableCell>Affective Avg</TableCell><TableCell>Psychomotor Avg</TableCell></TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow><TableCell>Male</TableCell><TableCell>4.1 / 5</TableCell><TableCell>3.7 / 5</TableCell></TableRow>
                        <TableRow><TableCell>Female</TableCell><TableCell>4.3 / 5</TableCell><TableCell>3.9 / 5</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))
            }
            sx={clickableCardSx}
          >
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              RATING BY GENDER
            </Typography>
            <Stack spacing={1}>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.25}>
                  <Typography variant="caption" fontWeight={700}>MALE</Typography>
                  <Typography variant="caption" fontWeight={700}>{metrics.maleRating}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={82} color="primary" sx={{ height: 4, borderRadius: 2 }} />
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.25}>
                  <Typography variant="caption" fontWeight={700}>FEMALE</Typography>
                  <Typography variant="caption" fontWeight={700}>{metrics.femaleRating}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={86} color="success" sx={{ height: 4, borderRadius: 2 }} />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <AnalyticsModal
        open={analyticsModal.open}
        onClose={() => setAnalyticsModal({ open: false, title: '', content: null })}
        title={analyticsModal.title}
        content={analyticsModal.content}
      />
    </>
  );
};

export default PsychomotorAnalyticsCards;
