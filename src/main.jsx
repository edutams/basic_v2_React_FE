import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Spinner from './components/shared/spinner/Spinner';
import './utils/i18n';
import { CustomizerContextProvider } from './context/CustomizerContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { AuthProvider } from './context/AgentContext/auth';
import ErrorBoundary from './ErrorBoundary';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { tenantValidation } from './routes/Router';
import './global.css';

// Only treat as tenant subdomain when validation returns type 'tenant'
// For organization domains (type: 'organization') or unknown domains (status: false),
// the Router.jsx already routes to AgentRoutes — no redirect needed.
const isTenantSubdomain = tenantValidation?.status === true && tenantValidation?.type === 'tenant';

// Lazy import — TenantAuthProvider only loads on tenant subdomains
const TenantAuthProvider = isTenantSubdomain
  ? lazy(() =>
      import('./context/TenantContext/auth').then((m) => ({
        default: ({ children }) => <m.TenantAuthProvider>{children}</m.TenantAuthProvider>,
      })),
    )
  : null;

const RootApp = () => {
  if (isTenantSubdomain && TenantAuthProvider) {
    return (
      <CustomizerContextProvider>
        <SnackbarProvider>
          <Suspense fallback={<Spinner />}>
            <ErrorBoundary>
              <TenantAuthProvider>
                <App />
              </TenantAuthProvider>
            </ErrorBoundary>
          </Suspense>
        </SnackbarProvider>
      </CustomizerContextProvider>
    );
  }

  return (
    <CustomizerContextProvider>
      <SnackbarProvider>
        <Suspense fallback={<Spinner />}>
          <ErrorBoundary>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ErrorBoundary>
        </Suspense>
      </SnackbarProvider>
    </CustomizerContextProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <RootApp />
  </LocalizationProvider>,
);
