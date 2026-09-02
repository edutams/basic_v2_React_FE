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
    const { container } = renderBanner({ subscriptionStatus: { tier: 'active' }, isImpersonated: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when there is no subscription status yet', () => {
    const { container } = renderBanner({ subscriptionStatus: null, isImpersonated: false });
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a due-date reminder during the grace tier', () => {
    renderBanner({
      subscriptionStatus: {
        tier: 'grace',
        due_date: '2026-01-30',
        session_name: '2025/2026',
        term_name: 'First Term',
        message: 'Your subscription for 2025/2026 - First Term is due on Jan 30, 2026.',
      },
      isImpersonated: false,
    });

    expect(screen.getByText(/is due on Jan 30, 2026/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /manage subscription/i })).toBeInTheDocument();
  });

  it('shows an expired notice during the locked tier', () => {
    renderBanner({
      subscriptionStatus: {
        tier: 'locked',
        session_name: '2025/2026',
        term_name: 'First Term',
        message: "Your school's subscription for 2025/2026 - First Term (#1) has expired. Please renew to restore full access.",
      },
      isImpersonated: false,
    });

    expect(screen.getByText(/has expired/)).toBeInTheDocument();
  });
});
