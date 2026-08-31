import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useContext, useState } from 'react';
import { AuthProvider, AuthContext } from './auth';
import { CustomizerContext } from '../CustomizerContext';
import api from '@/api/landlord/landlord_api';

vi.mock('@/api/landlord/landlord_api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

function TestConsumer() {
  const { impersonateAgent, impersonateTenant } = useContext(AuthContext);
  return (
    <>
      <button onClick={() => impersonateAgent('123')}>impersonate</button>
      <button onClick={() => impersonateTenant('456')}>impersonate-tenant</button>
    </>
  );
}

function renderWithProviders() {
  return render(
    <CustomizerContext.Provider value={{ setPrimaryColor: vi.fn() }}>
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    </CustomizerContext.Provider>
  );
}

describe('impersonateAgent', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('stores the freshly-fetched permissions, not an empty array', async () => {
    api.post.mockResolvedValue({
      data: {
        access_token: 'new-token',
        expires_in: 3600,
        user: { id: 1, fname: 'Jane' },
        impersonator_id: 'admin-1',
      },
    });
    api.get.mockResolvedValue({
      data: { permissions: ['schools.view', 'schools.edit'] },
    });

    renderWithProviders();
    fireEvent.click(screen.getByText('impersonate'));

    await waitFor(() => {
      expect(localStorage.getItem('permissions')).toBe(JSON.stringify(['schools.view', 'schools.edit']));
    });
  });
});

describe('impersonateTenant', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(window, 'open').mockImplementation(() => {});
  });

  it('opens a legitimate cross-domain redirect_url', async () => {
    api.post.mockResolvedValue({
      data: { redirect_url: 'https://someschool.example.com/impersonate-login/abc.def.ghi' },
    });

    renderWithProviders();
    fireEvent.click(screen.getByText('impersonate-tenant'));

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        'https://someschool.example.com/impersonate-login/abc.def.ghi',
        '_blank'
      );
    });
  });

  it('refuses to open a dangerous-scheme redirect_url', async () => {
    api.post.mockResolvedValue({
      data: { redirect_url: 'javascript:alert(1)' },
    });

    renderWithProviders();
    fireEvent.click(screen.getByText('impersonate-tenant'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
    expect(window.open).not.toHaveBeenCalled();
  });
});

describe('contextValue stability', () => {
  it('keeps handler references stable across an unrelated re-render', async () => {
    const capturedLogins = [];
    // Stable across renders, like the real CustomizerContextProvider's
    // useState setter would be — a fresh mock here would falsely make
    // every useCallback depending on it look unstable too.
    const stableCustomizerValue = { setPrimaryColor: vi.fn() };

    function Capture() {
      const { login } = useContext(AuthContext);
      capturedLogins.push(login);
      return null;
    }

    function Harness() {
      const [count, setCount] = useState(0);
      return (
        <CustomizerContext.Provider value={stableCustomizerValue}>
          <AuthProvider>
            <Capture />
          </AuthProvider>
          <button onClick={() => setCount((c) => c + 1)}>bump {count}</button>
        </CustomizerContext.Provider>
      );
    }

    render(<Harness />);

    // Let the mount-time restoreUser effect settle before capturing the
    // "before" reference, so we're not conflating it with our own bump.
    await waitFor(() => expect(capturedLogins.length).toBeGreaterThan(0));
    const before = capturedLogins[capturedLogins.length - 1];

    fireEvent.click(screen.getByText(/bump/));

    const after = capturedLogins[capturedLogins.length - 1];
    expect(after).toBe(before);
  });
});
