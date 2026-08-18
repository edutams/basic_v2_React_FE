import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography } from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const QuickActions = ({ onApplyAdmission }) => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: AccountBalanceWalletOutlinedIcon,
      iconColor: '#16a34a',
      iconBg: '#dcfce7',
      title: 'Pay School Fees',
      subtitle: 'Pay for one or more wards',
      onClick: () => navigate('/pay-school-fees'),
    },
    {
      icon: PersonAddOutlinedIcon,
      iconColor: '#7c3aed',
      iconBg: '#f3e8ff',
      title: 'Apply for Admission',
      subtitle: 'Start a new admission',
      onClick: () => (onApplyAdmission ? onApplyAdmission() : navigate('/admission/new-application')),
    },
    {
      icon: ChatBubbleOutlineOutlinedIcon,
      iconColor: '#2563eb',
      iconBg: '#dbeafe',
      title: 'Message Teacher',
      subtitle: 'Chat with teachers/admin',
      onClick: () => navigate('/school-calendar'),
    },
    {
      icon: FileDownloadOutlinedIcon,
      iconColor: '#ea580c',
      iconBg: '#ffedd5',
      title: 'Download Reports',
      subtitle: 'Get ward reports',
      onClick: () => navigate('/dashboard'),
    },
    {
      icon: ReceiptLongOutlinedIcon,
      iconColor: '#0284c7',
      iconBg: '#e0f2fe',
      title: 'View Payment History',
      subtitle: 'See all payments made',
      onClick: () => navigate('/pay-school-fees'),
    },
    {
      icon: NotificationsActiveOutlinedIcon,
      iconColor: '#e11d48',
      iconBg: '#ffe4e6',
      title: 'Attendance Overview',
      subtitle: 'Check attendance summary',
      onClick: () => navigate('/dashboard'),
    },
  ];

  return (
    <Box mb={2.5} height="100%">
      {/* White wrapper card around title + action grid */}
      <Box
        sx={{
          height: '100%',
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          p: 1.5,
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#1e293b', mb: 1.25, letterSpacing: -0.3 }}>
          Quick Actions
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(6, 1fr)',
            },
            gap: 1.25,
          }}
        >
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.title}
              elevation={0}
              onClick={item.onClick}
              sx={{
                p: 1.25,
                borderRadius: '10px',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                  borderColor: item.iconColor,
                  '& .action-arrow': {
                    color: item.iconColor,
                    transform: 'translateX(3px)',
                  },
                },
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: item.iconBg,
                    color: item.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                  }}
                >
                  <Icon sx={{ fontSize: 17 }} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 11.5,
                    color: '#0f172a',
                    lineHeight: 1.2,
                    mb: 0.25,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 9.5,
                    color: '#64748b',
                    lineHeight: 1.2,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.subtitle}
                </Typography>
              </Box>

              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <ArrowForwardIcon
                  className="action-arrow"
                  sx={{
                    fontSize: 13,
                    color: '#94a3b8',
                    transition: 'all 0.2s ease',
                  }}
                />
              </Box>
            </Card>
          );
        })}
        </Box>
      </Box>
    </Box>
  );
};

export default QuickActions;
