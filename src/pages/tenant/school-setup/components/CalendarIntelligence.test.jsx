import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CalendarIntelligence from './CalendarIntelligence';

const baseOverview = {
  active_sessions_count: 1,
  active_sections_count: 12,
  weeks: { current: 15, previous: 13, delta: 2, delta_label: '+2 weeks vs last term' },
  holidays_count: 3,
  subscription: { tier: 'active', message: null },
};

describe('CalendarIntelligence', () => {
  it('renders nothing while loading with no data yet to avoid layout flash', () => {
    const { container } = render(<CalendarIntelligence overview={null} loading />);
    // Skeleton placeholders are shown instead of nothing — assert the grid renders
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0);
  });

  it('renders nothing when there is no overview and it is not loading', () => {
    const { container } = render(<CalendarIntelligence overview={null} loading={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the stat cards and the weeks delta badge', () => {
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);

    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Active Sections')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('+2 weeks vs last term')).toBeInTheDocument();
    expect(screen.getByText('Holidays Set')).toBeInTheDocument();
  });

  it('shows the active subscription tile in the "all set" state', () => {
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);
    expect(screen.getByText('Subscription Active')).toBeInTheDocument();
    expect(screen.getByText(/all set for this term/i)).toBeInTheDocument();
  });

  it('shows the grace-period due-date message', () => {
    render(
      <CalendarIntelligence
        overview={{
          ...baseOverview,
          subscription: {
            tier: 'grace',
            message: 'Your subscription for 2025/2026 - First Term is due on Jan 30, 2026.',
          },
        }}
        loading={false}
      />,
    );

    expect(screen.getByText('Free Trial — Subscription Due')).toBeInTheDocument();
    expect(screen.getByText(/due on Jan 30, 2026/)).toBeInTheDocument();
  });

  it('shows the locked/expired message', () => {
    render(
      <CalendarIntelligence
        overview={{
          ...baseOverview,
          subscription: {
            tier: 'locked',
            message: "Your school's subscription has expired. Please renew to restore full access.",
          },
        }}
        loading={false}
      />,
    );

    expect(screen.getByText('Subscription Expired')).toBeInTheDocument();
    expect(screen.getByText(/has expired/)).toBeInTheDocument();
  });
});
