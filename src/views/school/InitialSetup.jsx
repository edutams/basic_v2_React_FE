import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  useTheme,
  IconButton,
  Collapse,
  Avatar,
} from '@mui/material';
import {
  IconListCheck,
  IconSettings,
  IconUserPlus,
  IconSchool,
  IconBook,
  IconUsers,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconArrowRight,
  IconEdit,
  IconPlus,
} from '@tabler/icons-react';
import PageContainer from '../../components/container/PageContainer';
import Breadcrumb from '../../layouts/full/shared/breadcrumb/Breadcrumb';
import BlankCard from '../../components/shared/BlankCard';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Initial Setup' }];

// Initial setup items based on the UI design
const initialSetupItems = [
  {
    id: 1,
    title: 'School Profile',
    description: 'Complete your school profile information',
    icon: IconSchool,
    items: [
      { id: 11, title: 'School Information', status: 'pending', link: '/pages/account-settings' },
      { id: 12, title: 'Upload Logo', status: 'pending', link: '/pages/account-settings' },
      { id: 13, title: 'School Address', status: 'pending', link: '/pages/account-settings' },
    ],
  },
  {
    id: 2,
    title: 'Academic Setup',
    description: 'Configure academic settings',
    icon: IconBook,
    items: [
      { id: 21, title: 'Session/Term Setup', status: 'pending', link: '/session-week-manager' },
      { id: 22, title: 'Class/Categories', status: 'pending', link: '/classes' },
      { id: 23, title: 'Subject Setup', status: 'pending', link: '/subjects' },
    ],
  },
  {
    id: 3,
    title: 'Staff & Users',
    description: 'Manage staff and user accounts',
    icon: IconUsers,
    items: [
      { id: 31, title: 'Add Administrators', status: 'pending', link: '/teachers' },
      { id: 32, title: 'Add Teachers', status: 'pending', link: '/teachers' },
      { id: 33, title: 'Assign Roles', status: 'pending', link: '/alc-manager' },
    ],
  },
  {
    id: 4,
    title: 'System Configuration',
    description: 'Configure system settings',
    icon: IconSettings,
    items: [
      { id: 41, title: 'Payment Gateway', status: 'pending', link: '/manage-subscription' },
      { id: 42, title: 'SMS Configuration', status: 'pending', link: '/manage-subscription' },
      { id: 43, title: 'Email Settings', status: 'pending', link: '/manage-subscription' },
    ],
  },
];

const InitialSetup = () => {
  const theme = useTheme();
  const [expandedItem, setExpandedItem] = useState(1);
  const [setupProgress, setSetupProgress] = useState(0);
  const [completedItems, setCompletedItems] = useState({});

  // Calculate progress
  useEffect(() => {
    let completed = 0;
    const total = initialSetupItems.reduce((acc, item) => acc + item.items.length, 0);

    Object.values(completedItems).forEach((values) => {
      completed += values.filter((v) => v).length;
    });

    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    setSetupProgress(progress);
  }, [completedItems]);

  const handleToggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const handleMarkComplete = (categoryId, itemId) => {
    setCompletedItems((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [itemId]: true,
      },
    }));
  };

  const handleMarkAllComplete = (categoryId) => {
    const category = initialSetupItems.find((item) => item.id === categoryId);
    if (category) {
      const allItems = {};
      category.items.forEach((item) => {
        allItems[item.id] = true;
      });
      setCompletedItems((prev) => ({
        ...prev,
        [categoryId]: allItems,
      }));
    }
  };

  const getCategoryProgress = (categoryId) => {
    const category = initialSetupItems.find((item) => item.id === categoryId);
    if (!category) return 0;

    const completed = category.items.filter((item) => completedItems[categoryId]?.[item.id]).length;

    return Math.round((completed / category.items.length) * 100);
  };

  return (
    <PageContainer title="Initial Setup" description="Complete your school setup">
      <Breadcrumb title="Initial Setup" items={BCrumb} />

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Welcome to Initial Setup
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete these steps to get your school ready
            </Typography>
          </Box>
          <Chip
            label={`${setupProgress}% Complete`}
            color={setupProgress === 100 ? 'success' : 'primary'}
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={setupProgress}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: theme.palette.grey[200],
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              bgcolor: setupProgress === 100 ? '#2ca87f' : '#3949ab',
            },
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {initialSetupItems.map((category) => {
          const isExpanded = expandedItem === category.id;
          const categoryProgress = getCategoryProgress(category.id);
          const IconComponent = category.icon;

          return (
            <Grid item xs={12} md={6} key={category.id}>
              <BlankCard>
                <CardContent>
                  <Box
                    onClick={() => handleToggleExpand(category.id)}
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: categoryProgress === 100 ? '#2ca87f' : '#e8eaf6',
                          width: 48,
                          height: 48,
                        }}
                      >
                        <IconComponent
                          size={24}
                          color={categoryProgress === 100 ? '#fff' : '#3949ab'}
                        />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {category.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {category.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ minWidth: 60, mr: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={categoryProgress}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              bgcolor: categoryProgress === 100 ? '#2ca87f' : '#3949ab',
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {categoryProgress}%
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
                      </IconButton>
                    </Box>
                  </Box>

                  <Collapse in={isExpanded}>
                    <Box sx={{ mt: 2, pl: 1 }}>
                      {category.items.map((item) => {
                        const isCompleted = completedItems[category.id]?.[item.id];

                        return (
                          <Box
                            key={item.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              py: 1.5,
                              borderBottom: '1px solid',
                              borderColor: theme.palette.divider,
                              '&:last-child': {
                                borderBottom: 'none',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleMarkComplete(category.id, item.id)}
                                sx={{
                                  color: isCompleted ? '#2ca87f' : theme.palette.grey[400],
                                  border: '1px solid',
                                  borderColor: isCompleted ? '#2ca87f' : theme.palette.grey[300],
                                  borderRadius: '50%',
                                  width: 24,
                                  height: 24,
                                  '&:hover': {
                                    bgcolor: isCompleted ? 'transparent' : '#e6f4ee',
                                  },
                                }}
                              >
                                {isCompleted && <IconCheck size={14} />}
                              </IconButton>
                              <Typography
                                variant="body2"
                                sx={{
                                  textDecoration: isCompleted ? 'line-through' : 'none',
                                  color: isCompleted ? 'text.secondary' : 'text.primary',
                                }}
                              >
                                {item.title}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Button
                                size="small"
                                variant={isCompleted ? 'text' : 'outlined'}
                                color={isCompleted ? 'success' : 'primary'}
                                endIcon={
                                  isCompleted ? (
                                    <IconCheck size={16} />
                                  ) : (
                                    <IconArrowRight size={16} />
                                  )
                                }
                                onClick={() => handleMarkComplete(category.id, item.id)}
                                sx={{
                                  textTransform: 'none',
                                  minWidth: 100,
                                }}
                              >
                                {isCompleted ? 'Done' : 'Setup'}
                              </Button>
                            </Box>
                          </Box>
                        );
                      })}

                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="text"
                          color="primary"
                          onClick={() => handleMarkAllComplete(category.id)}
                          startIcon={<IconCheck size={16} />}
                          sx={{ textTransform: 'none' }}
                        >
                          Mark All Complete
                        </Button>
                      </Box>
                    </Box>
                  </Collapse>
                </CardContent>
              </BlankCard>
            </Grid>
          );
        })}
      </Grid>
    </PageContainer>
  );
};

export default InitialSetup;
