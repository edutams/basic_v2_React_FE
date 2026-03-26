import React, { useState } from 'react';
// import * as React from 'react';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';

import { Grid, Paper, Typography, Chip, useTheme } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';

import {
  IconSchool,
  IconCash,
  IconCheck,
  IconX,
  IconSettings,
  IconUsers,
  IconChartBar,
} from '@tabler/icons-react';

// components
import { IconArticle, IconBell, IconLock, IconUserCircle, IconChecklist } from '@tabler/icons';
import BlankCard from '../../components/shared/BlankCard';
import ModulesTab from '../modules/Modules';
import PackageTab from '../package/Package';
import PlanTab from '../plan/Plan';
import MyPlanTab from '../my-plan/MyPlan';

import ReusablePieChart from '../../components/shared/charts/ReusablePieChart';
import PlanDistributionModal from '../dashboard/components/PlanDistributionModal';
import TotalSchoolModal from '../dashboard/components/TotalSchoolModal';
import TotalTransactionModal from './components/TotalTransactionModal';
import useAuth from 'src/hooks/useAuth';

const planSeries = [40, 15, 35, 10];

const planLabels = ['Freemium', 'Basic', 'Basic +', 'Basic ++'];

const planData = [
  { name: 'Freemium', value: 40, color: '#EC468C' },
  { name: 'Basic', value: 15, color: '#7987FF' },
  { name: 'Basic +', value: 35, color: '#FFA5CB' },
  { name: 'Basic ++', value: 10, color: '#8B48E3' },
];

const planColors = planData.map((p) => p.color);

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'EduTier',
  },
];

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const EduTier = () => {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const [openPlanDistributionModal, setOpenPlanDistributionModal] = useState(false);
  const [openTotalSchoolModal, setOpenTotalSchoolModal] = useState(false);
  const [openTotalTransactionModal, setOpenTotalTransactionModal] = useState(false);
  const { user: currentUser } = useAuth();
  const currentUserLevel = currentUser?.access_level;

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <PageContainer title="Subscription" description="this is Subscription page">
      <Breadcrumb title="Manage Subscription" items={BCrumb} />

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
              Total Payment
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
              onClick={() => setOpenTotalTransactionModal(true)}
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
              {/* {schoolSummary.total} */}0
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
                Commission
              </Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 500 }}>
                {/* {schoolSummary.primary} */}100,000,000
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
                Volume
              </Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 500 }}>
                {/* {schoolSummary.secondary} */} 304,043,000
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* <Paper
          sx={{
            px: 3,
            py: 2,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Typography variant="h5" color="text.secondary">
            Payment
          </Typography>
          <Box
            mb={3}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: 60,
            }}
          ></Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <IconCash size={50} color={theme.palette.mode === 'dark' ? '#1DA1F2' : '#1DA1F2'} />

            <Box textAlign="right">
              <Typography
                sx={{
                  fontSize: 40,
                  fontWeight: 'bold',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#1E3A5F',
                  lineHeight: 1,
                }}
              >
           0
              </Typography>

              <Typography variant="h5" color="text.primary">
                Total Payment
              </Typography>
            </Box>
          </Box>
        </Paper> */}

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
              Subscriptions
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
              // onClick={() => setOpenTotalSchoolModal(true)}
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
              {/* {schoolSummary.total} */}0
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
                {/* {schoolSummary.secondary} */}0
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* <Paper
          sx={{
            px: 3,
            py: 2,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box
            mb={3}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5" color="text.secondary">
              Subscriptions
            </Typography>

            <Box
              sx={{
                width: 30,
                height: 30,
                background: theme.palette.mode === 'dark' ? '#333' : '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setOpenTotalSchoolModal(true)}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <IconSchool size={50} color={theme.palette.mode === 'dark' ? '#1DA1F2' : '#1DA1F2'} />

            <Box textAlign="right">
              <Typography
                sx={{
                  fontSize: 40,
                  fontWeight: 'bold',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#1E3A5F',
                  lineHeight: 1,
                }}
              >
                0
              </Typography>
              <Typography variant="h5" color="text.primary">
                Total School
              </Typography>
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography sx={{ color: '#52932E', fontSize: 13, fontWeight: 'bold' }}>
              Primary School
            </Typography>

            <Chip
              label={0}
              size="small"
              sx={{
                background: '#52932E',
                color: '#FFFFFF',
                fontWeight: 'bold',
                borderRadius: '20px',
                px: 4,
              }}
            />
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography sx={{ color: '#52932E', fontSize: 13, fontWeight: 'bold' }}>
              Senior School
            </Typography>

            <Chip
              label={0}
              size="small"
              sx={{
                background: '#52932E',
                color: '#FFFFFF',
                fontWeight: 'bold',
                borderRadius: '20px',
                px: 4,
              }}
            />
          </Box>
        </Paper> */}
        <Paper
          sx={{
            p: 2,
            // py: 2,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
            border: theme.palette.mode === 'dark' ? '1px solid #333' : 'none',
          }}
        >
          <Box
            // mb={1}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5" color="text.primary">
              Plan Distribution
            </Typography>

            <Box
              sx={{
                width: 30,
                height: 30,
                background: theme.palette.mode === 'dark' ? '#333' : '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setOpenPlanDistributionModal(true)}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>

          <Box>
            <Box
              sx={{
                height: 170,
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <ReusablePieChart
                series={planSeries}
                colors={planColors}
                labels={planLabels}
                height={180}
                hideCard
              />
            </Box>
          </Box>
        </Paper>

        {/* SUB AGENTS */}
        {/* <Paper
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            background: '#FFFFFF',
          }}
        >
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#5C5C5C',
              bgcolor: '#F8F8F8',
              borderRadius: '8px 8px 0 0',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: '#5E5E5E',
              }}
            >
              Login Activities
            </Typography>

            <Box
              sx={{
                width: 30,
                height: 30,
                background: '#5C5C5C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconChartBar size={22} color="#FFFFFF" />
            </Box>
          </Box>

          <Divider />

          <Box sx={{ px: 2, py: 3 }}>
            {[
              { label: 'Teacher:', value: 0 },
              { label: 'SPA', value: 0 },
              { label: 'Student', value: 0 },
              { label: 'Parent', value: 0 },
            ].map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="h5" color="text.primary">
                  {item.label}
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    color: '#E10600',
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper> */}
      </Box>

      <Grid container spacing={3}>
        <Grid size={12}>
          <BlankCard>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <Tabs
                value={value}
                onChange={handleChange}
                scrollButtons="auto"
                variant="scrollable"
                aria-label="basic tabs example"
              >
                <Tab
                  iconPosition="start"
                  icon={<IconUserCircle size="22" />}
                  label="Modules"
                  {...a11yProps(0)}
                />
                <Tab
                  iconPosition="start"
                  icon={<IconBell size="22" />}
                  label="Packages"
                  {...a11yProps(1)}
                />
                <Tab
                  iconPosition="start"
                  icon={<IconArticle size="22" />}
                  label="Plan"
                  {...a11yProps(2)}
                />
                {currentUserLevel !== 1 && (
                  <Tab
                    iconPosition="start"
                    icon={<IconChecklist size="22" />}
                    label="My Plan"
                    {...a11yProps(3)}
                  />
                )}
              </Tabs>
            </Box>
            <Divider />
            <CardContent>
              <TabPanel value={value} index={0}>
                <ModulesTab />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <PackageTab />
              </TabPanel>
              <TabPanel value={value} index={2}>
                <PlanTab />
              </TabPanel>
              {currentUserLevel !== 1 && (
                <TabPanel value={value} index={3}>
                  <MyPlanTab />
                </TabPanel>
              )}
            </CardContent>
          </BlankCard>
        </Grid>
      </Grid>

      <PlanDistributionModal
        open={openPlanDistributionModal}
        onClose={() => setOpenPlanDistributionModal(false)}
      />

      <TotalSchoolModal
        open={openTotalSchoolModal}
        onClose={() => setOpenTotalSchoolModal(false)}
      />

      <TotalTransactionModal
        open={openTotalTransactionModal}
        onClose={() => setOpenTotalTransactionModal(false)}
      />
    </PageContainer>
  );
};

export default EduTier;
