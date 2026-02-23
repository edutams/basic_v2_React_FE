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

// deferRender().then(() => {
ReactDOM.createRoot(document.getElementById('root')).render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <AuthProvider>
      <TenantAuthProvider>
        <CustomizerContextProvider>
        <SnackbarProvider>
          <Suspense fallback={<Spinner />}>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </Suspense>
        </SnackbarProvider>
      </CustomizerContextProvider>
    </TenantAuthProvider>
  </AuthProvider>
</LocalizationProvider>,
);
// });
