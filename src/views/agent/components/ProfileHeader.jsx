import { Card, Box, Typography, Avatar, Button, Stack, Chip, useTheme } from '@mui/material';
import { IconBuildingStore, IconUsers } from '@tabler/icons-react';

const ProfileHeader = ({ profile, onManageSchools, onManageAgent }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Card sx={{
            p: { xs: 3, sm: 3.5 },
            height: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            bgcolor: isDark ? theme.palette.primary.dark : theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: 'none'
        }}>
            {/* Profile info */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'center' },
                textAlign: { xs: 'center', sm: 'left' },
                gap: 2.5,
                mb: 3
            }}>
                <Avatar
                    src={profile.image}
                    sx={{
                        width: { xs: 80, sm: 90 },
                        height: { xs: 80, sm: 90 },
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        flexShrink: 0
                    }}
                />
                <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 0.3, fontSize: { xs: '22px', sm: '26px' }, color: 'white', lineHeight: 1.2 }}>
                        Hi, {profile.name}!
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1.5, fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                        {profile.handle}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                        <Chip
                            label={profile.status || 'Active'}
                            size="small"
                            sx={{
                                bgcolor: '#DEFEDE',
                                color: '#21A943',
                                fontWeight: 600,
                                fontSize: '11px',
                                height: 22,
                                borderRadius: '5px',
                            }}
                        />
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                            {profile.level}
                        </Typography>
                    </Stack>
                </Box>
            </Box>

            {/* Action buttons */}
            <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row' }}>
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={onManageSchools}
                    startIcon={<IconBuildingStore size={18} />}
                    sx={{
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.5)',
                        textTransform: 'none',
                        borderRadius: '10px',
                        fontWeight: 500,
                        fontSize: '13px',
                        py: 1,
                        '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)',
                        }
                    }}
                >
                    Manage Schools
                </Button>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={onManageAgent}
                    startIcon={<IconUsers size={18} />}
                    sx={{
                        bgcolor: 'white',
                        color: theme.palette.primary.main,
                        textTransform: 'none',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '13px',
                        py: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        '&:hover': {
                            bgcolor: theme.palette.primary.light,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        }
                    }}
                >
                    Manage Agent
                </Button>
            </Stack>
        </Card>
    );
};

export default ProfileHeader;
