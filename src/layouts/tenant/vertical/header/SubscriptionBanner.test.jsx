import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { TenantAuthContext } from '@/context/TenantContext/auth';
import SubscriptionBanner from './SubscriptionBanner';

// jsdom doesn't implement matchMedia — MUI's useMediaQuery needs it.
beforeAll(() => {
  window.matchMedia = window.matchMedia || vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

const customizerValue = { isCollapse: 'full-sidebar' };

const renderBanner = (authValue) =>
  render(
    <MemoryRouter>
      <CustomizerContext.Provider value={customizerValue}>
        <TenantAuthContext.Provider value={authValue}>
          <SubscriptionBanner />
        </TenantAuthContext.Provider>
      </CustomizerContext.Provider>
    </MemoryRouter>,
  );

describe('SubscriptionBanner', () => {
  it('renders nothing when the tier is active', () => {
    const { container } = renderBanner({
      subscriptionStatus: { tier: 'active' },
      isImpersonated: false,
      roles: ['school_admin'],
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when there is no subscription status yet', () => {
    const { container } = renderBanner({
      subscriptionStatus: null,
      isImpersonated: false,
      roles: ['school_admin'],
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a due-date reminder during the grace tier for an admin-tier role', () => {
    renderBanner({
      subscriptionStatus: {
        tier: 'grace',
        due_date: '2026-01-30',
        session_name: '2025/2026',
        term_name: 'First Term',
        message: 'Your subscription for 2025/2026 - First Term is due on Jan 30, 2026.',
      },
      isImpersonated: false,
      roles: ['school_admin'],
    });

    expect(screen.getByText(/is due on Jan 30, 2026/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /manage subscription/i })).toBeInTheDocument();
  });

  it('shows an expired notice during the locked tier for an admin-tier role', () => {
    renderBanner({
      subscriptionStatus: {
        tier: 'locked',
        session_name: '2025/2026',
        term_name: 'First Term',
        message: "Your school's subscription for 2025/2026 - First Term (#1) has expired. Please renew to restore full access.",
      },
      isImpersonated: false,
      roles: ['school_owner'],
    });

    expect(screen.getByText(/has expired/)).toBeInTheDocument();
  });

  it.each(['super_admin', 'school_admin', 'school_owner', 'school_head'])(
    'shows the banner for the admin-tier role "%s"',
    (role) => {
      renderBanner({
        subscriptionStatus: { tier: 'grace', message: 'Due soon.' },
        isImpersonated: false,
        roles: [role],
      });

      expect(screen.getByText('Due soon.')).toBeInTheDocument();
    },
  );

  it.each(['parent', 'student', 'class_teacher', 'bursar'])(
    'hides the banner for the non-admin role "%s" — end users must never see billing details',
    (role) => {
      const { container } = renderBanner({
        subscriptionStatus: { tier: 'locked', message: 'Has expired.' },
        isImpersonated: false,
        roles: [role],
      });

      expect(container).toBeEmptyDOMElement();
    },
  );

  it('hides the banner when roles is missing entirely', () => {
    const { container } = renderBanner({
      subscriptionStatus: { tier: 'grace', message: 'Due soon.' },
      isImpersonated: false,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('supports roles as objects with a name field, matching the roles payload shape', () => {
    renderBanner({
      subscriptionStatus: { tier: 'grace', message: 'Due soon.' },
      isImpersonated: false,
      roles: [{ name: 'school_head' }],
    });

    expect(screen.getByText('Due soon.')).toBeInTheDocument();
  });
});
