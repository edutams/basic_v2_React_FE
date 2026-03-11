import { Grid, Card, Box, Typography, Avatar, Button, Stack, Chip, useTheme } from '@mui/material';
import { IconAdjustmentsHorizontal, IconCash } from '@tabler/icons-react';
import { useNavigate } from 'react-router';

const ProfileHeader = ({ profile, onAddAgent, onAddSchool }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    return (
        <Card sx={{ 
            p: { xs: 3, sm: 4 }, 
            height: '100%', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            bgcolor: isDarkMode ? theme.palette.primary.dark : '#03A9F4',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: 'none'
        }}>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'center' }, 
                textAlign: { xs: 'center', sm: 'left' },
                gap: 3, 
                mb: 4 
            }}>
                <Avatar 
                    src={profile.image} 
                    sx={{ 
                        width: { xs: 100, sm: 120 }, 
                        height: { xs: 100, sm: 120 }, 
                        border: 'none',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    }} 
                />
                <Box>
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5, fontSize: { xs: '28px', sm: '35px' }, letterSpacing: '-0.02em', color: 'white' }}>
                        Hi, {profile.name}!
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 1, mb: 2, fontSize: { xs: '16px', sm: '18px' }, fontWeight: 400, color: 'white' }}>
                        {profile.handle}
                    </Typography>
                    
                    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                        <Chip 
                            label="Active" 
                            size="small" 
                            sx={{ 
                                bgcolor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : '#E8F5E9', 
                                color: isDarkMode ? '#81C784' : '#4CAF50', 
                                fontWeight: 600, 
                                fontSize: '12px', 
                                height: 28,
                                borderRadius: '6px',
                                px: 1
                            }} 
                        />
                        <Typography variant="h4" fontWeight={600} sx={{ fontSize: '15px', color: 'white' }}>
                            {profile.level}
                        </Typography>
                    </Stack>
                </Box>
            </Box>

            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent={'space-between'}>
                <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={onAddSchool}
                    startIcon={<IconAdjustmentsHorizontal size={24} />} 
                    sx={{ 
                        color: 'white', 
                        borderColor: 'white', 
                        borderWidth: '1px',
                        textTransform: 'none', 
                        borderRadius: '12px',
                        fontWeight: 300,
                        fontSize: '18px',
                        flex: 1,
                        '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: '1px',
                        }
                    }}
                >
                    Add New Schools
                </Button>
                <Button 
                    variant="contained" 
                    fullWidth
                    onClick={onAddAgent}
                    startIcon={<IconCash size={24} />} 
                    sx={{ 
                        bgcolor: 'white', 
                        color: isDarkMode ? theme.palette.primary.dark : '#03A9F4', 
                        textTransform: 'none', 
                        borderRadius: '12px', 
                        fontWeight: 600,
                        fontSize: '18px',
                        flex: 1,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        '&:hover': {
                            bgcolor: isDarkMode ? '#e0e0e0' : '#F5F5F5',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                        }
                    }}
                >
                    Add New Agent
                </Button>
            </Stack>
        </Card>
    );
};

export default ProfileHeader;
