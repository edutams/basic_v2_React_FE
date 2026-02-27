import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Spinner from './views/spinner/Spinner';
import './utils/i18n';
import { CustomizerContextProvider } from './context/CustomizerContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { AuthProvider } from './context/AgentContext/auth';
import { TenantAuthProvider } from './context/TenantContext/auth';
import ErrorBoundary from './ErrorBoundary';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// async function deferRender() {
//   const { worker } = await import("./api/mocks/browser");
//   return worker.start({
//     onUnhandledRequest: 'bypass',
//   });
// }

const hostname = window.location.hostname;
const centralHost = import.meta.env.VITE_API_BASE_URL
  ? new URL(import.meta.env.VITE_API_BASE_URL).hostname
  : 'basic_v2.test';

const isTenantSubdomain =
  hostname !== centralHost && hostname !== 'localhost' && hostname !== '127.0.0.1';

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

  if (isTenantSubdomain) {
    return <TenantAuthProvider>{content}</TenantAuthProvider>;
  }

  return <AuthProvider>{content}</AuthProvider>;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <RootApp />
  </LocalizationProvider>,
);

