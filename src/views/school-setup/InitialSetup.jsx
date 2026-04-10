import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Grid,
  Typography,
  Button,
  Avatar,
  TextField,
  Stack,
  Divider,
  MenuItem,
  Card,
} from '@mui/material';
import { IconSchool, IconVideo, IconArrowRight } from '@tabler/icons-react';
import tenantApi from 'src/api/tenant_api';

const SchoolInformationPage = () => {
  const navigate = useNavigate();

  // State for school details form
  const [schoolDetails, setSchoolDetails] = useState({
    schoolName: '',
    acronym: '',
    category: '',
    address: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch school details on component mount
  useEffect(() => {
    const fetchSchoolDetails = async () => {
      try {
        setLoading(true);
        // Fetch tenant/school details from root endpoint
        const response = await tenantApi.get('/');

        if (response.data && response.data.status) {
          const data = response.data;
          setSchoolDetails({
            schoolName: data.tenant_name || data.name || '',
            acronym: data.tenant_id || data.short_name || '',
            category: '', // Not in root endpoint, set to empty
            address: '', // Not in root endpoint, set to empty
          });
        }
      } catch (err) {
        console.error('Error fetching school details:', err);
        // Try to get from localStorage as fallback
        const storedSchool = localStorage.getItem('school_details');
        if (storedSchool) {
          const parsed = JSON.parse(storedSchool);
          setSchoolDetails({
            schoolName: parsed.schoolName || parsed.name || parsed.school_name || '',
            acronym: parsed.acronym || parsed.short_name || '',
            category: parsed.category || '',
            address: parsed.address || '',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolDetails();
  }, []);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setSchoolDetails((prev) => {
      const updated = { ...prev, [field]: value };
      // Update localStorage for persistence
      localStorage.setItem('school_details', JSON.stringify(updated));
      return updated;
    });
  };

  const handleBrowseClick = () => {
    document.getElementById('school-logo-input').click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', file.name);
      // Add your upload logic here
    }
  };
  return (
    <>
      {/* PAGE HEADER */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box>
          <Typography fontWeight={700} fontSize={20}>
            School Information
          </Typography>

          <Typography fontSize={13} color="#8A8D91">
            Register your school and set up administrative accounts
          </Typography>
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            boxShadow: '0px 6px 16px rgba(0,0,0,0.08)',
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          }}
        >
          <IconVideo size={20} />
          <Typography fontSize={13} fontWeight={500}>
            How to setup your Profile
          </Typography>
          <IconArrowRight size={16} />
        </Box>
      </Box>

      {/* SCHOOL DETAILS */}
      <Card sx={{ p: 0, mb: 2, borderRadius: 0 }}>
        {/* HEADER */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            bgcolor: '#F9F9F9',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Typography fontWeight={600}>School Details</Typography>
        </Box>

        {/* BODY */}
        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 4,
              }}
            >
              <Typography color="text.secondary">Loading school details...</Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                alignItems: 'flex-start',
              }}
            >
              {/* LOGO */}
              <Box sx={{ width: 140, flexShrink: 0, textAlign: 'center' }}>
                <input
                  type="file"
                  id="school-logo-input"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />

                <Avatar
                  sx={{
                    width: 110,
                    height: 110,
                    bgcolor: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    mx: 'auto',
                  }}
                >
                  <IconSchool size={40} color="#9e9e9e" />
                </Avatar>

                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2, textTransform: 'none' }}
                  onClick={handleBrowseClick}
                  startIcon={<span>↓</span>}
                >
                  Browse
                </Button>
              </Box>

              {/* FORM AREA */}
              <Box sx={{ flex: 1, display: 'flex', gap: 3 }}>
                {/* LEFT */}
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography fontSize={14} mb={0.5}>
                        School Name
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter School Name"
                        value={schoolDetails.schoolName}
                        onChange={(e) => handleInputChange('schoolName', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#1976d2',
                            },
                          },
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography fontSize={14} mb={0.5}>
                        Acronym
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        <TextField
                          fullWidth
                          placeholder="e.g. GSS"
                          value={schoolDetails.acronym}
                          onChange={(e) => handleInputChange('acronym', e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused fieldset': {
                                borderColor: '#1976d2',
                              },
                            },
                          }}
                        />
                        <Button>Check</Button>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>

                {/* RIGHT */}
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography fontSize={14} mb={0.5}>
                        Category
                      </Typography>
                      <TextField
                        fullWidth
                        select
                        value={schoolDetails.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#1976d2',
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select School Category</MenuItem>
                        <MenuItem value="primary">Primary</MenuItem>
                        <MenuItem value="secondary">Secondary</MenuItem>
                      </TextField>
                    </Box>

                    <Box>
                      <Typography fontSize={14} mb={0.5}>
                        Address
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter school address"
                        value={schoolDetails.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#1976d2',
                            },
                          },
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Card>

      {/* ADMINISTRATIVE ACCOUNTS */}
      <Card sx={{ p: 0, borderRadius: 0 }}>
        <Box
          sx={{
            px: 3,
            py: 1.5,
            bgcolor: '#f5f5f5',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Typography fontWeight={600}>Administrative Accounts</Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            {['School Owner Detail', 'School Head Detail', 'Portal Admin'].map((title, index) => (
              <Box
                key={title}
                sx={{
                  flex: '1 1 300px',
                  minWidth: 260,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'white',
                  boxShadow: '0px 6px 16px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0px 10px 20px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <Typography fontWeight={600} mb={1}>
                  {title}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Stack spacing={1.5}>
                  <TextField
                    placeholder="Surname"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                  <TextField
                    placeholder="First Name"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                  <TextField
                    placeholder="Other Name"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                  <TextField
                    placeholder="Phone"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                  <TextField
                    placeholder="Email"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                        },
                      },
                    }}
                  />
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={() => navigate('/complete-setup')}>
          Save & Continue
        </Button>
      </Box>
    </>
  );
};

export default SchoolInformationPage;
