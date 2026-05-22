import React from 'react';
import { Card, CardContent, Button, Typography, Box, Avatar, Stack, Chip } from '@mui/material';
import { IconArrowUpRight, IconBriefcase, IconPhone, IconMail, IconMapPin } from '@tabler/icons-react';
import imgsvg from '../../assets/images/backgrounds/welcome-bg2-2x-svg.svg';

const AgentWelcomeCard = ({ agent }) => {
  if (!agent) return null;

  return (
    <Card
      elevation={0}
      sx={{
        position: 'relative',
        backgroundColor: (theme) => `${theme.palette.mode === 'dark' ? theme.palette.background.paper : '#eef2ff'}`, // Light indigo bg for contrast
        '&:before': {
          content: `""`,
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `url(${imgsvg})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'right bottom',
          opacity: 0.5,
        },
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: '30px' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" zIndex={1} position="relative">
            <Avatar
                src={agent.image}
                alt={agent.name}
                sx={{ width: 100, height: 100, border: '4px solid white', boxShadow: 2 }}
            />
            <Box flexGrow={1} textAlign={{ xs: 'center', sm: 'left' }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Welcome back, {agent.name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" mb={1}>
                    {agent.org_name} ({agent.org_title})
                </Typography>
                <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }} flexWrap="wrap" useFlexGap>
                     <Chip 
                        icon={<IconBriefcase size={16} />} 
                        label={agent.agent_code || "No Code"} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                    />
                     <Chip 
                        icon={<IconMapPin size={16} />} 
                        label={`${agent.state_lga?.state?.name || ''} - ${agent.state_lga?.name || ''}`}
                        size="small" 
                        variant="outlined" 
                    />
                    <Chip 
                        label={agent.status} 
                        color={agent.status === 'active' ? 'success' : 'error'} 
                        size="small" 
                    />
                </Stack>
            </Box>
            
             <Box textAlign={{ xs: 'center', sm: 'right' }} minWidth="200px">
                <Typography variant="h3" fontWeight={700} color="primary">
                     {agent.tenants_count || 0}
                </Typography>
                 <Typography variant="subtitle2" color="textSecondary">
                    Total Schools Reached
                 </Typography>
                  <Button variant="contained" color="secondary" sx={{ mt: 2 }}>
                    View Performance
                  </Button>
            </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AgentWelcomeCard;
