import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalendarIntelligence from './CalendarIntelligence';

vi.mock('@/api/tenant/holidays/holidayApi', () => ({
  fetchHolidays: vi.fn(() =>
    Promise.resolve({
      data: [{ id: 1, name: 'Mid-Term Break', start_date: '2026-01-12', end_date: '2026-01-16' }],
    }),
  ),
}));

const baseOverview = {
  subscribed_sessions_count: 2,
  subscribed_sessions: [
    { session_id: 1, session_name: '2025/2026', terms_subscribed: 1, statuses: ['active'] },
    { session_id: 2, session_name: '2026/2027', terms_subscribed: 1, statuses: ['pending'] },
  ],
  weeks: { current: 15, previous: 13, delta: 2, delta_label: '+2 weeks vs last term' },
  holidays_count: 3,
  subscription: {
    tier: 'active',
    message: null,
    session_name: '2026/2027',
    term_name: 'First Term',
    week_number: 4,
    session_term_id: 7,
    due_date: null,
  },
};

describe('CalendarIntelligence', () => {
  it('renders skeletons while loading with no data yet', () => {
    const { container } = render(<CalendarIntelligence overview={null} loading />);
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0);
  });

  it('renders nothing when there is no overview and it is not loading', () => {
    const { container } = render(<CalendarIntelligence overview={null} loading={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the stat cards, including the Active Session card sourced from the subscription payload', () => {
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);

    expect(screen.getByText('Sessions Subscribed')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Active Session')).toBeInTheDocument();
    expect(screen.getByText('2026/2027')).toBeInTheDocument();
    expect(screen.getByText('First Term')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('+2 weeks vs last term')).toBeInTheDocument();
    expect(screen.getByText('Holidays Set')).toBeInTheDocument();
    expect(screen.getByText('Subscription Active')).toBeInTheDocument();
  });

  it('no longer shows the old "Active Sections" card', () => {
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);
    expect(screen.queryByText('Active Sections')).not.toBeInTheDocument();
  });

  it('opens the Sessions Subscribed modal with the full list, listing every subscribed session', async () => {
    const user = userEvent.setup();
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);

    await user.click(screen.getByText('Sessions Subscribed'));

    expect(await screen.findByRole('heading', { name: 'Sessions Subscribed' })).toBeInTheDocument();
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByText('2025/2026')).toBeInTheDocument();
    expect(dialog.getByText('2026/2027')).toBeInTheDocument();
    expect(dialog.getByText('active')).toBeInTheDocument();
    expect(dialog.getByText('pending')).toBeInTheDocument();
  });

  it('opens the Active Session modal with the session/term/week detail', async () => {
    const user = userEvent.setup();
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);

    await user.click(screen.getByText('Active Session'));

    expect(await screen.findByRole('heading', { name: 'Active Session' })).toBeInTheDocument();
    expect(screen.getByText('Week 4')).toBeInTheDocument();
  });

  it('opens the Weeks Set modal with current vs previous comparison', async () => {
    const user = userEvent.setup();
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);

    await user.click(screen.getByText('Weeks Set'));

    expect(await screen.findByRole('heading', { name: 'Weeks Set' })).toBeInTheDocument();
    expect(screen.getByText('This Term')).toBeInTheDocument();
    expect(screen.getByText('Previous Term')).toBeInTheDocument();
  });

  it('opens the Holidays Set modal and lazy-loads the holiday list', async () => {
    const user = userEvent.setup();
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);

    await user.click(screen.getByText('Holidays Set'));

    expect(await screen.findByRole('heading', { name: 'Holidays Set' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Mid-Term Break')).toBeInTheDocument());
  });

  it('opens the Subscription modal with the status chip and message', async () => {
    const user = userEvent.setup();
    render(
      <CalendarIntelligence
        overview={{
          ...baseOverview,
          subscription: {
            ...baseOverview.subscription,
            tier: 'grace',
            message: 'Your subscription for 2026/2027 - First Term is due on Jan 30, 2026.',
            due_date: '2026-01-30',
          },
        }}
        loading={false}
      />,
    );

    await user.click(screen.getByText('Free Trial — Subscription Due'));

    expect(await screen.findByRole('heading', { name: 'Subscription' })).toBeInTheDocument();
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByText(/due on Jan 30, 2026/)).toBeInTheDocument();
    expect(dialog.getByText('Due Date')).toBeInTheDocument();
  });

  it('closes the modal via the close button', async () => {
    const user = userEvent.setup();
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);

    await user.click(screen.getByText('Weeks Set'));
    expect(await screen.findByRole('heading', { name: 'Weeks Set' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Weeks Set' })).not.toBeInTheDocument(),
    );
  });

  it('gives every card a tooltip explaining what it counts', () => {
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);

    expect(screen.getByLabelText(/subscribed to since joining the platform/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/actually running the school right now/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/weeks generated for the active term/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/holidays configured for the active term/i)).toBeInTheDocument();
  });
});
