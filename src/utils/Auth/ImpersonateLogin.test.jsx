import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ImpersonateLogin from './ImpersonateLogin';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/impersonate-login/:token" element={<ImpersonateLogin />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ImpersonateLogin', () => {
  let hrefSetter;

  beforeEach(() => {
    localStorage.clear();
    hrefSetter = vi.fn();
    delete window.location;
    window.location = {
      get href() {
        return '';
      },
      set href(value) {
        hrefSetter(value);
      },
    };
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stores a plausible JWT and redirects home', async () => {
    const jwt = 'aaaaaaaa.bbbbbbbb.cccccccc';
    renderAt(`/impersonate-login/${jwt}?impersonator_id=42`);

    await waitFor(() => {
      expect(localStorage.getItem('tenant_access_token')).toBe(jwt);
    });
    expect(localStorage.getItem('isImpersonating')).toBe('true');
    expect(localStorage.getItem('impersonator_id')).toBe('42');
    expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/impersonate-login');
    expect(hrefSetter).toHaveBeenCalledWith('/');
  });

  it('rejects a malformed token and redirects to login without storing anything', async () => {
    renderAt('/impersonate-login/not-a-real-jwt');

    await waitFor(() => {
      expect(hrefSetter).toHaveBeenCalledWith('/login');
    });
    expect(localStorage.getItem('tenant_access_token')).toBeNull();
    expect(localStorage.getItem('isImpersonating')).toBeNull();
  });
});
