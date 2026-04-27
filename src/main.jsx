import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Spinner from './views/spinner/Spinner';
import './utils/i18n';
import { CustomizerContextProvider } from './context/CustomizerContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { AuthProvider } from './context/AgentContext/auth';
import ErrorBoundary from './ErrorBoundary';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { tenantValidation } from './routes/Router';

const isTenantSubdomain = tenantValidation?.status === true;

if (tenantValidation?.status === false && window.location.pathname !== '/school-not-found') {
  window.location.replace('/school-not-found');
}

// ✅ Lazy import — TenantAuthProvider only loads on tenant subdomains
const TenantAuthProvider = isTenantSubdomain
  ? lazy(() =>
      import('./context/TenantContext/auth').then((m) => ({
        default: ({ children }) => <m.TenantAuthProvider>{children}</m.TenantAuthProvider>,
      })),
    )
  : null;

const RootApp = () => {
  const content = (
    <CustomizerContextProvider>
      <SnackbarProvider>
        <Suspense fallback={<Spinner />}>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </Suspense>
      </SnackbarProvider>
    </CustomizerContextProvider>
  );

  if (isTenantSubdomain && TenantAuthProvider) {
    return (
      <Suspense fallback={<Spinner />}>
        <TenantAuthProvider>{content}</TenantAuthProvider>
      </Suspense>
    );
  }

  return <AuthProvider>{content}</AuthProvider>;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <RootApp />
  </LocalizationProvider>,
);
