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

    const isSetupPage =
      currentPath.startsWith('/setup-welcome') ||
      currentPath.startsWith('/school-profile') ||
      currentPath === '/complete-setup';

    // ==================== APPROVED SCHOOLS ====================
    if (onboarding_status === 'approved') {
      if (isSetupPage) {
        navigate('/', { replace: true });
      }
      return;
    }

    // ── COMPLETED (awaiting approval) → stay on /complete-setup
    if (onboarding_status === 'completed' || onboarding_stage >= 5) {
      if (currentPath !== '/complete-setup') {
        navigate('/complete-setup', { replace: true });
      }
      return;
    }

    // ── STILL SETTING UP → keep on setup pages only
    if (onboarding_stage < 5) {
      if (!isSetupPage) {
        navigate('/setup-welcome', { replace: true });
      }
    }
  }, [isAuthenticated, tenantInfo, location.pathname, navigate]);

  return null;
};

export default SetupRedirectHandler;
