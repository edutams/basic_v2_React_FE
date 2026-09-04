import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalendarIntelligence from './CalendarIntelligence';

const baseOverview = {
  subscribed_sessions_count: 2,
  subscribed_sessions: [
    {
      session_id: 1,
      session_name: '2025/2026',
      terms_subscribed: 1,
      statuses: ['active'],
      terms: [{ term_name: 'First Term', status: 'active' }],
    },
    {
      session_id: 2,
      session_name: '2026/2027',
      terms_subscribed: 1,
      statuses: ['pending'],
      terms: [{ term_name: 'First Term', status: 'pending' }],
    },
  ],
  weeks: { current: 15, previous: 13, delta: 2, delta_label: '+2 weeks vs last term' },
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

  it('shows the three stat cards, Active Session sourced from the subscription payload', () => {
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);

    expect(screen.getByText('Sessions Subscribed')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Active Session')).toBeInTheDocument();
    expect(screen.getByText('2026/2027')).toBeInTheDocument();
    expect(screen.getByText('First Term')).toBeInTheDocument();
    expect(screen.getByText('Subscription Active')).toBeInTheDocument();
  });

  it('no longer shows the old Weeks Set / Holidays Set / Active Sections cards', () => {
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);
    expect(screen.queryByText('Weeks Set')).not.toBeInTheDocument();
    expect(screen.queryByText('Holidays Set')).not.toBeInTheDocument();
    expect(screen.queryByText('Active Sections')).not.toBeInTheDocument();
  });

  it('fills the Sessions Subscribed card with an active/total breakdown', () => {
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);
    expect(screen.getByText('1 of 2 currently active')).toBeInTheDocument();
  });

  it('fills the Active Session card with the current week out of the term total', () => {
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);
    expect(screen.getByText('Week 4 of 15')).toBeInTheDocument();
  });

  it('shows a due-in-N-days chip on the Subscription card during grace', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const dueDate = future.toISOString().slice(0, 10);

    render(
      <CalendarIntelligence
        overview={{
          ...baseOverview,
          subscription: { ...baseOverview.subscription, tier: 'grace', due_date: dueDate },
        }}
        loading={false}
      />,
    );

    expect(screen.getByText('Due in 5 days')).toBeInTheDocument();
  });

  it('shows an "expired" chip, not "overdue", once the subscription is locked', () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);
    const dueDate = past.toISOString().slice(0, 10);

    render(
      <CalendarIntelligence
        overview={{
          ...baseOverview,
          subscription: { ...baseOverview.subscription, tier: 'locked', due_date: dueDate },
        }}
        loading={false}
      />,
    );

    expect(screen.getByText('Expired 3 days ago')).toBeInTheDocument();
  });

  it('opens the Sessions Subscribed modal with the full list, listing every subscribed session', async () => {
    const user = userEvent.setup();
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);

    await user.click(screen.getByText('Sessions Subscribed'));

    expect(await screen.findByRole('heading', { name: 'Sessions Subscribed' })).toBeInTheDocument();
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByText('2025/2026')).toBeInTheDocument();
    expect(dialog.getByText('2026/2027')).toBeInTheDocument();
    // Each term gets its own name, not just a bare status — the whole
    // point of the terms breakdown (see buildSubscribedSessions() on the
    // backend, which is where `terms` comes from).
    expect(dialog.getAllByText('First Term')).toHaveLength(2);
    expect(dialog.getByText('active')).toBeInTheDocument();
    expect(dialog.getByText('pending')).toBeInTheDocument();
  });

  it('opens the Active Session modal with the session/term/week detail', async () => {
    const user = userEvent.setup();
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);

    await user.click(screen.getByText('Active Session'));

    expect(await screen.findByRole('heading', { name: 'Active Session' })).toBeInTheDocument();
    expect(within(screen.getByRole('dialog')).getByText('Week 4')).toBeInTheDocument();
  });

  it('opens the Subscription modal with the status chip, message, and due date', async () => {
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

    await user.click(screen.getByText('Active Session'));
    expect(await screen.findByRole('heading', { name: 'Active Session' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('heading', { name: 'Active Session' })).not.toBeInTheDocument();
  });

  it('gives every card a tooltip explaining what it counts', () => {
    render(<CalendarIntelligence overview={baseOverview} loading={false} />);

    expect(screen.getByLabelText(/subscribed to since joining the platform/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/actually running the school right now/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subscription status for the active term/i)).toBeInTheDocument();
  });

  it('never claims "Subscription Active" when no session-term is configured yet (not_configured tier)', () => {
    render(
      <CalendarIntelligence
        overview={{
          ...baseOverview,
          subscription: {
            tier: 'not_configured',
            message: 'No active session/term is set up yet — subscription status will show here once your calendar is configured.',
            session_name: null,
            term_name: null,
            week_number: null,
            session_term_id: null,
            due_date: null,
          },
        }}
        loading={false}
      />,
    );

    expect(screen.queryByText('Subscription Active')).not.toBeInTheDocument();
    expect(screen.getByText('Not Yet Configured')).toBeInTheDocument();
    expect(screen.getByText(/subscription status will show here/i)).toBeInTheDocument();
  });
});
