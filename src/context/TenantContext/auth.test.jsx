import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useContext, useState } from 'react';
import { TenantAuthProvider, TenantAuthContext } from './auth';
import { CustomizerContext } from '../CustomizerContext';
import { validateTenantDomain } from '../../api/tenant/set-up/tenant-setup';
import tenantApi from '@/api/tenant/tenant_api';

vi.mock('@/api/tenant/tenant_api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('../../api/tenant/set-up/tenant-setup', () => ({
  validateTenantDomain: vi.fn(),
}));

vi.mock('@/api/tenant/impersonation/impersonationApi', () => ({
  default: {
    impersonateStaff: vi.fn(),
    impersonateStudent: vi.fn(),
    impersonateParent: vi.fn(),
    stopImpersonation: vi.fn(),
  },
}));

vi.mock('@/api/tenant/subscription/subscriptionApi', () => ({
  fetchSubscriptionStatus: vi.fn(),
}));

describe('contextValue stability', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // checkTenantDomain runs unconditionally on mount.
    validateTenantDomain.mockResolvedValue({ status: true, primary_color: null });
    // No stored token, so restoreUser resolves immediately without an /me call.
    tenantApi.get.mockResolvedValue({ data: {} });
  });

  it('keeps handler references stable across an unrelated re-render', async () => {
    const capturedLogins = [];
    // Stable across renders, like the real CustomizerContextProvider's
    // useState setter would be — a fresh mock here would falsely make
    // every useCallback depending on it look unstable too.
    const stableCustomizerValue = { setPrimaryColor: vi.fn() };

    function Capture() {
      const { login } = useContext(TenantAuthContext);
      capturedLogins.push(login);
      return null;
    }

    function Harness() {
      const [count, setCount] = useState(0);
      return (
        <CustomizerContext.Provider value={stableCustomizerValue}>
          <TenantAuthProvider>
            <Capture />
          </TenantAuthProvider>
          <button onClick={() => setCount((c) => c + 1)}>bump {count}</button>
        </CustomizerContext.Provider>
      );
    }

    render(<Harness />);

    await waitFor(() => expect(validateTenantDomain).toHaveBeenCalled());
    const before = capturedLogins[capturedLogins.length - 1];

    fireEvent.click(screen.getByText(/bump/));

    const after = capturedLogins[capturedLogins.length - 1];
    expect(after).toBe(before);
  });
});

describe('tenant_subscription:locked event', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    validateTenantDomain.mockResolvedValue({ status: true, primary_color: null });
    tenantApi.get.mockResolvedValue({ data: {} });
  });

  it('reflects a 402 response immediately as a locked tier', async () => {
    let captured = null;

    function Capture() {
      captured = useContext(TenantAuthContext);
      return null;
    }

    render(
      <CustomizerContext.Provider value={{ setPrimaryColor: vi.fn() }}>
        <TenantAuthProvider>
          <Capture />
        </TenantAuthProvider>
      </CustomizerContext.Provider>,
    );

    await waitFor(() => expect(validateTenantDomain).toHaveBeenCalled());

    expect(captured.subscriptionStatus).toBeNull();

    fireEvent(
      window,
      new CustomEvent('tenant_subscription:locked', {
        detail: {
          message: "Your school's subscription has expired. Please renew to restore full access.",
          due_date: '2026-01-30',
          session_name: '2025/2026',
          term_name: 'First Term',
          audience: 'admin',
        },
      }),
    );

    await waitFor(() => expect(captured.subscriptionStatus?.tier).toBe('locked'));
    expect(captured.subscriptionStatus.due_date).toBe('2026-01-30');
    expect(captured.subscriptionStatus.message).toContain('expired');
  });
});
