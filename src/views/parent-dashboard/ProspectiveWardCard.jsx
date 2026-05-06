import React from 'react';
import { Paper, Box, Avatar, Typography, Chip, IconButton, Button } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

const STEPS = ['Applied', 'E-Exam', 'Admitted', 'Enrolled'];

const AdmissionSteps = ({ currentStep }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mt: 1.5, mb: 1 }}>
    {STEPS.map((step, i) => {
      const done = i < currentStep;
      const active = i === currentStep;
      return (
        <React.Fragment key={step}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: done || active ? 'primary.main' : 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {done ? (
                <CheckCircleIcon sx={{ fontSize: 18, color: '#fff' }} />
              ) : (
                <PendingIcon sx={{ fontSize: 18, color: active ? '#fff' : 'grey.400' }} />
              )}
            </Box>
            <Typography
              variant="caption"
              color={done || active ? 'primary.main' : 'text.disabled'}
              mt={0.5}
            >
              {step}
            </Typography>
          </Box>
          {i < STEPS.length - 1 && (
            <Box
              sx={{
                flex: 1,
                height: 2,
                bgcolor: done ? 'primary.main' : 'grey.200',
                mb: 2.5,
              }}
            />
          )}
        </React.Fragment>
      );
    })}
  </Box>
);

const ProspectiveWardCard = ({ ward }) => {
  const [expanded, setExpanded] = React.useState(ward.expanded ?? false);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 1.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          cursor: 'pointer',
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {ward.initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {ward.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {ward.class} · Application #{ward.applicationNo}
          </Typography>
        </Box>

        <Chip
          icon={
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: ward.status === 'Admitted' ? 'success.main' : 'warning.main',
                ml: 0.5,
              }}
            />
          }
          label={ward.status}
          size="small"
          sx={{
            bgcolor: ward.status === 'Admitted' ? '#E8F5E9' : '#FFF4E5',
            color: ward.status === 'Admitted' ? 'success.dark' : 'warning.dark',
            fontWeight: 600,
            fontSize: 11,
          }}
        />
        <IconButton size="small">
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* Expanded detail */}
      {expanded && (
        <Box sx={{ px: 2, pb: 2 }}>
          <AdmissionSteps currentStep={ward.step ?? 2} />
          {ward.actionLabel && (
            <Paper
              sx={{
                mt: 1,
                p: 1.5,
                borderRadius: 2,
                bgcolor: '#FFF8F0',
                border: '1px solid',
                borderColor: '#FFD8AB',
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: '#FFD8AB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WalletIcon sx={{ color: '#EF9146', fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {ward.actionLabel}
                  </Typography>
                  {ward.actionDue && (
                    <Typography variant="caption" color="text.secondary">
                      Due {ward.actionDue}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Button
                variant="contained"
                size="small"
                sx={{ borderRadius: 1, fontWeight: 700 , bgcolor:'#EF9146', fontSize: '0.75rem'}}
              >
                Pay now
              </Button>
            </Paper>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default ProspectiveWardCard;