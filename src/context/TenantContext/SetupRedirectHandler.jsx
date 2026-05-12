import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTenantAuth } from '../../hooks/useTenantAuth';

const SetupRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, tenantInfo } = useTenantAuth();

  useEffect(() => {
    if (!isAuthenticated || !tenantInfo) return;

    const { onboarding_status = 'pending', onboarding_stage = 0 } = tenantInfo;
    const currentPath = location.pathname;

    // ==================== APPROVED SCHOOLS ====================
    if (onboarding_status === 'approved') {
      // Allow them to see the complete-setup page once
      if (currentPath === '/complete-setup') {
        return; // Do nothing - let them see the welcome screen
      }
      // Otherwise, send them to dashboard
      if (currentPath !== '/') {
        navigate('/', { replace: true });
      }
      return;
    }

    // ==================== COMPLETED BUT NOT APPROVED ====================
    if (onboarding_status === 'completed' || onboarding_stage >= 5) {
      if (currentPath !== '/complete-setup') {
        navigate('/complete-setup', { replace: true });
      }
      return;
    }

    // ==================== STILL IN SETUP ====================
    if (onboarding_stage < 5) {
      if (!currentPath.startsWith('/setup-welcome') && !currentPath.startsWith('/school-profile')) {
        navigate('/setup-welcome', { replace: true });
      }
    }
  }, [isAuthenticated, tenantInfo, location.pathname, navigate]);

  return null;
};

export default SetupRedirectHandler;
