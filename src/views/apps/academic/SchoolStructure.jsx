import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Card,
  Paper,
  Typography,
  Badge,
  Fade,
  Grid,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from 'src/components/container/PageContainer';
import CategoryTab from './components/CategoryTab';
import EmisCentralTab from './components/EmisCentralTab';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'School Structure' },
];

// Styled Components
const GradientIconBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
  minWidth: 40,
  minHeight: 40,
}));

const ShadowTabs = styled(Tabs)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  '& .MuiTabs-flexContainer': {
    gap: theme.spacing(1),
    padding: theme.spacing(1),
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  minHeight: 48,
  backgroundColor: 'none',
  borderRadius: theme.shape.borderRadius,
  margin: 0,
  padding: theme.spacing(1, 2),
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: theme.palette.primary.dark,
      borderRadius: '3px 3px 0 0',
    },
  },
}));

const ContentCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  border: 'none',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  '& .MuiCardContent-root': {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0,
    },
  },
}));

const LoadingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 200,
  padding: theme.spacing(4),
}));

const SchoolStructure = () => {
  const [activeTab, setActiveTab] = useState("category");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleTabChange = useCallback((event, newValue) => {
    setLoading(true);
    setActiveTab(newValue);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  }, []);

  const tabConfig = [
    {
      label: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge color="primary" variant="">
            <Typography variant="body2" component="span">1</Typography>
          </Badge>
          <Typography variant="body2" component="span">Category</Typography>
        </Box>
      ),
      component: CategoryTab,
      value: "category",
    },
    {
      label: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge color="primary" variant="">
            <Typography variant="body2" component="span">2</Typography>
          </Badge>
          <Typography variant="body2" component="span">Emis Central</Typography>
        </Box>
      ),
      component: EmisCentralTab,
      value: "emis_central",
    },
  ];

  const ActiveComponent = tabConfig.find(tab => tab.value === activeTab)?.component;

  return (
    <PageContainer title="School Structure" description="Manage School Structure">
      <Breadcrumb title="School Structure" items={BCrumb} />

      <Box sx={{ borderColor: 'divider', marginBottom: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="school structure tabs">
          {tabConfig.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              value={tab.value}
              id={`school-tab-${index}`}
              aria-controls={`school-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Box>

      <Grid container spacing={0}>
        <Grid item size={{ xs: 12, lg: 12 }}>
          <ContentCard>
            <Fade in={!loading} timeout={300}>
              <Box>
                {loading ? (
                  <LoadingBox>
                    <CircularProgress color="primary" size={40} />
                  </LoadingBox>
                ) : (
                  ActiveComponent && <ActiveComponent />
                )}
              </Box>
            </Fade>
          </ContentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default SchoolStructure;