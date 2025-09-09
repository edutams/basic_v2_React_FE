import React, { useState, useEffect } from 'react';
import { Box,
 Typography,
 Grid 
} from '@mui/material';
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
  }, [selectedTab, storageKeys.categories, storageKeys.subjects]); 

  // Calculate dynamic analytics data
  const getAnalyticsData = () => {
    const tabNames = ['Pry', 'JS', 'SS', 'TVET'];
    const currentTab = tabNames[selectedTab];
    
    const filteredSubjects = subjectData;
    
    // Calculate totals
    const totalSubjects = filteredSubjects.length;
    const compulsorySubjects = filteredSubjects.filter(subject => subject.status === 'COMPULSORY').length;
    const optionalSubjects = filteredSubjects.filter(subject => subject.status === 'OPTIONAL').length;
    
    const activeCategories = categoryData.filter(category => category.status === 'ACTIVE');
    
    // Map actual categories with their subject counts
    const displayCategories = activeCategories.map(category => {
      const categorySubjects = filteredSubjects.filter(subject => {
        return subject.category === category.name;
      }).length;
      
      return {
        name: category.name,
        count: categorySubjects,
        id: category.id
      };
    });
    
    return {
      subjectBank: {
        total: totalSubjects,
        compulsory: compulsorySubjects,
        optional: optionalSubjects
      },
      categories: displayCategories
    };
  };

  const data = getAnalyticsData();

  return (
    <AppCard>
      <Box sx={{ 
        display: 'flex', 
        width: '100%', 
        gap: 2, 
        padding: '16px',
        alignItems: 'flex-start',
        flexDirection: { xs: 'column', md: 'row' }, 
        overflowX: { xs: 'hidden', md: 'auto' } 
      }}>
        <Box sx={{ 
          flex: { xs: '1 1 100%', md: '0 0 25%' }, 
          minWidth: 0,
          width: { xs: '100%', md: 'auto' }
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '0.875rem',
              mb: 1,
              textAlign: 'center',
              height: '24px',
              display: 'flex',
              alignItems: 'start',
              justifyContent: 'start'
            }}
          >
            Subject Bank
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 0, 
            height: { xs: '100px', md: '120px' }, 
            flexDirection: { xs: 'row', md: 'row' } 
          }}>
            <Box 
              sx={{ 
                flex: '0 0 40%',
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
                  fontSize: { xs: '1.5rem', md: '2rem' }, 
                  fontWeight: 'bold',
                  color: '#333',
                  mb: 0.5,
                  lineHeight: 1
                }}
              >
                {data.subjectBank.total}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: '#333',
                  fontSize: { xs: '0.7rem', md: '0.8rem' }, 
                  lineHeight: 1
                }}
              >
                Subject
              </Typography>
            </Box>

            <Box 
              sx={{ 
                flex: '0 0 60%',
                backgroundColor: '#B8E6B8',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                px: 1,
                borderRadius: '0 8px 8px 0'
              }}
            >
              <Box sx={{ mb: 1 }}>
                <Typography 
                  variant="h4" 
                  component="span"
                  sx={{ 
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#333',
                    mr: 0.5,
                    lineHeight: 1
                  }}
                >
                  {data.subjectBank.compulsory}
                </Typography>
                <Typography 
                  variant="body2" 
                  component="span"
                  sx={{ 
                    fontWeight: 500,
                    color: '#333',
                    fontSize: '0.75rem',
                    lineHeight: 1
                  }}
                >
                  Compulsory
                </Typography>
              </Box>
              <Box>
                <Typography 
                  variant="h4" 
                  component="span"
                  sx={{ 
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#333',
                    mr: 0.5,
                    lineHeight: 1
                  }}
                >
                  {data.subjectBank.optional}
                </Typography>
                <Typography 
                  variant="body2" 
                  component="span"
                  sx={{ 
                    fontWeight: 500,
                    color: '#333',
                    fontSize: '0.75rem',
                    lineHeight: 1
                  }}
                >
                  Optional
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {data.categories.map((category, index) => (
          <Box key={category.id} sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '0 0 180px' }, 
            minWidth: { xs: '100%', md: '180px' },
            maxWidth: { xs: '100%', md: '180px' }
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                fontSize: { xs: '0.8rem', md: '0.875rem' }, 
                mb: 1,
                textAlign: 'center',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
              title={category.name} 
            >
              {category.name}
            </Typography>
            <Box 
              sx={{ 
                height: { xs: '100px', md: '120px' }, 
                width: '100%',
                backgroundColor: '#A8C4A8',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '8px'
              }}
            >
              <Typography 
                variant="h1" 
                sx={{ 
                  fontSize: { xs: '2rem', md: '2.5rem' }, 
                  fontWeight: 'bold',
                  color: '#333',
                  lineHeight: 1
                }}
              >
                {category.count}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </AppCard>
  );
};

export default SubjectAnalytics;
