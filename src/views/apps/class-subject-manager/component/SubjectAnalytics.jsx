import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import AppCard from 'src/components/shared/AppCard';

const SubjectAnalytics = ({ selectedTab }) => {
  const [categoryData, setCategoryData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);

  // Get localStorage keys based on selected tab
  const getStorageKeys = (tabIndex) => {
    const tabNames = ['Pry', 'JS', 'SS', 'TVET'];
    const currentTab = tabNames[tabIndex];
    return {
      categories: `subject_categories_${currentTab}`,
      subjects: `subjects_${currentTab}`
    };
  };

  const storageKeys = getStorageKeys(selectedTab);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      const savedCategories = localStorage.getItem(storageKeys.categories);
      const savedSubjects = localStorage.getItem(storageKeys.subjects);
      
      if (savedCategories) {
        setCategoryData(JSON.parse(savedCategories));
      } else {
        setCategoryData([]);
      }
      
      if (savedSubjects) {
        setSubjectData(JSON.parse(savedSubjects));
      } else {
        setSubjectData([]);
      }
    };

    // Load data initially
    loadData();

    // Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === storageKeys.categories || e.key === storageKeys.subjects) {
        loadData();
      }
    };

    // Add event listener
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = (event) => {
      if (event.detail.tabIndex === selectedTab) {
        loadData();
      }
    };

    window.addEventListener('localStorageUpdated', handleCustomStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdated', handleCustomStorageChange);
    };
  }, [selectedTab, storageKeys.categories, storageKeys.subjects]); // Re-run when tab changes

  // Calculate dynamic analytics data
  const getAnalyticsData = () => {
    const tabNames = ['Pry', 'JS', 'SS', 'TVET'];
    const currentTab = tabNames[selectedTab];
    
    // Filter subjects based on current tab (you can modify this logic based on your needs)
    // For now, we'll use all subjects, but you can add tab-specific filtering
    const filteredSubjects = subjectData; // Add filtering logic here if needed
    
    // Calculate totals
    const totalSubjects = filteredSubjects.length;
    const compulsorySubjects = filteredSubjects.filter(subject => subject.status === 'COMPULSORY').length;
    const optionalSubjects = filteredSubjects.filter(subject => subject.status === 'OPTIONAL').length;
    const totalCategories = categoryData.filter(category => category.status === 'ACTIVE').length;
    
    return {
      subjectBank: {
        digits: totalSubjects.toString(),
        subtext: 'Subject',
        title: 'Subject Bank'
      },
      compulsory: {
        digits: compulsorySubjects.toString(),
        subtext: 'Compulsory'
      },
      optional: {
        digits: optionalSubjects.toString(),
        subtext: 'Optional'
      },
      general: {
        digits: totalCategories.toString(),
        title: 'General'
      }
    };
  };

  const data = getAnalyticsData();

  return (
    <AppCard>
      <Box sx={{ display: 'flex', width: '50%' }}>
        {/* Subject Bank Section */}
        <Box sx={{ flex: '0 0 60%', p: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '0.875rem',
              mb: 1
            }}
          >
            Subject Bank
          </Typography>
          <Box sx={{ display: 'flex', gap: 0, height: '120px' }}>
            {/* Main Subject Section - Green */}
            <Box 
              sx={{ 
                flex: '0 0 120px',
                backgroundColor: '#90C695',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '8px 0 0 8px'
              }}
            >
              <Typography 
                variant="h1" 
                sx={{ 
                  fontSize: '2.2rem',
                  fontWeight: 'bold',
                  color: '#333',
                  mb: 0.5
                }}
              >
                {data.subjectBank.digits}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 500,
                  color: '#333',
                  fontSize: '0.9rem'
                }}
              >
                {data.subjectBank.subtext}
              </Typography>
            </Box>

            {/* Compulsory and Optional Section - Light Green */}
            <Box 
              sx={{ 
                flex: 1,
                backgroundColor: '#B8E6B8',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                px: 2,
                borderRadius: '0 8px 8px 0'
              }}
            >
              <Box sx={{ mb: 1 }}>
                <Typography 
                  variant="h4" 
                  component="span"
                  sx={{ 
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: '#333',
                    mr: 1
                  }}
                >
                  {data.compulsory.digits}
                </Typography>
                <Typography 
                  variant="body2" 
                  component="span"
                  sx={{ 
                    fontWeight: 500,
                    color: '#333'
                  }}
                >
                  {data.compulsory.subtext}
                </Typography>
              </Box>
              <Box>
                <Typography 
                  variant="h4" 
                  component="span"
                  sx={{ 
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: '#333',
                    mr: 1
                  }}
                >
                  {data.optional.digits}
                </Typography>
                <Typography 
                  variant="body2" 
                  component="span"
                  sx={{ 
                    fontWeight: 500,
                    color: '#333'
                  }}
                >
                  {data.optional.subtext}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* General Section */}
        <Box sx={{ flex: '0 0 40%', p: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '0.875rem',
              mb: 1
            }}
          >
            General
          </Typography>
          <Box 
            sx={{ 
              height: '120px',
              backgroundColor: '#A8B5A8',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '8px'
            }}
          >
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: '2.2rem',
                fontWeight: 'bold',
                color: '#333'
              }}
            >
              {data.general.digits}
            </Typography>
          </Box>
        </Box>
      </Box>
    </AppCard>
  );
};

export default SubjectAnalytics;
