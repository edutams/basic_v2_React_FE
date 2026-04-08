import React from 'react';
import { Box, useTheme, Paper, Typography, Button } from '@mui/material';
import {
  IconCurrencyNaira,
  IconUsers,
  IconCash,
  IconAdjustments,
  IconChartBar,
} from '@tabler/icons-react';
import { color } from 'framer-motion';

const MyCommissionStatCards = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4,1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper
          sx={{
            p: 3,
            borderRadius: '20px',
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
          }}
        >
          {/* Header */}
          <Typography variant="h6" fontWeight={600} mb={2}>
            GUPSA Ogun State
          </Typography>

          {/* Amount */}
          <Box
            sx={{
              background: '#E6F7F1',
              borderRadius: '5px',
              px: 3,
              py: 1,
              display: 'inline-block',
              mb: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: '#2ca87f',
              }}
            >
              ₦7,000,234.00
            </Typography>
          </Box>

          {/* Account Number */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box
              fontWeight="600"
              sx={{
                background: '#DEFEDE',
                color: '#21A943',
                px: 2,
                py: '4px',
                borderRadius: '5px',
                fontSize: 10,
              }}
            >
              Account Number
            </Box>

            <Typography fontSize={15} fontWeight={800}>
              93458438484
            </Typography>
          </Box>

          {/* Bank */}
          <Typography fontWeight="500" sx={{ mb: 1 }}>
            Bank : Globus
          </Typography>

          {/* Actions */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              // mt: 2,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<IconAdjustments size={14} />}
              onClick={() => setIsRegisterModalOpen(true)}
              sx={{
                borderColor: '#2ca87f',
                color: '#2ca87f',
                '&:hover': {
                  borderColor: '#2ca87f',
                  backgroundColor: '#2ca87f',
                },
              }}
            >
              View Details
            </Button>

            <Button
              // variant="contained"
              startIcon={<IconCash size={14} />}
              onClick={() => setIsRegisterModalOpen(true)}
              sx={{
                backgroundColor: '#2ca87f',
                color: '#ffff',
                '&:hover': {
                  borderColor: '#2ca87f',
                  backgroundColor: '#2ca87f',
                },
              }}
            >
              Withdraw
            </Button>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Total Transaction
            </Typography>

            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1,
                background: theme.palette.mode === 'dark' ? '#333' : '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setIsPlanModalOpen(true)}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',

              flex: 1,
              height: '100%',
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ color: '#2ca87f' }}>
                Inflow
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500, color: '#2ca87f' }}>
                {/* {schoolSummary.primary} */} 0
              </Typography>
            </Box>

            <Box
              sx={{
                width: '1px',
                height: 40,
                background: '#E5E7EB',
              }}
            />

            <Box>
              <Typography variant="h6" sx={{ color: '#f59e0b' }}>
                Outflow
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500, color: '#f59e0b' }}>
                {/* {schoolSummary.secondary} */} 0
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Total Sub Agents
            </Typography>

            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1,
                background: theme.palette.mode === 'dark' ? '#333' : '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setIsPlanModalOpen(true)}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>

          <Box
            sx={{
              background: '#FEF3C7',
              borderRadius: 1,
              px: 3,
              py: 1,
              display: 'inline-flex',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: '#f59e0b',
              }}
            >
              {/* {schoolSummary.total} */} 0
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h6" color="text.primary">
                Level 3
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                {/* {schoolSummary.primary} */} 0
              </Typography>
            </Box>

            <Box
              sx={{
                width: '1px',
                height: 40,
                background: '#E5E7EB',
              }}
            />

            <Box>
              <Typography variant="h6" color="text.primary">
                Level 4
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                {/* {schoolSummary.secondary} */} 0
              </Typography>
            </Box>

            <Box
              sx={{
                width: '1px',
                height: 40,
                background: '#E5E7EB',
              }}
            />

            <Box>
              <Typography variant="h6" color="text.primary">
                Level 5
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                {/* {schoolSummary.secondary} */} 0
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Total School
            </Typography>

            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1,
                background: theme.palette.mode === 'dark' ? '#333' : '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setIsPlanModalOpen(true)}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>

          <Box
            sx={{
              background: '#EEF2FF',
              borderRadius: 1,
              px: 3,
              py: 1,
              display: 'inline-flex',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: '#4A3AFF',
              }}
            >
              {/* {schoolSummary.total} */} 0
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h6" color="text.primary">
                Primary School
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                {/* {schoolSummary.primary} */} 0
              </Typography>
            </Box>

            <Box
              sx={{
                width: '1px',
                height: 40,
                background: '#E5E7EB',
              }}
            />

            <Box>
              <Typography variant="h6" color="text.primary">
                Secondary School
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 500 }}>
                {/* {schoolSummary.secondary} */} 0
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default MyCommissionStatCards;
