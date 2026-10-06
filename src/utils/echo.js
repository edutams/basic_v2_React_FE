import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echo = null;

/**
 * Shared Laravel Echo client for realtime chat.
 *
 * Returns null when the Pusher key is missing from the frontend .env, so the
 * chat keeps working (just without live updates) instead of throwing.
 */
export const getEcho = () => {
  if (echo) return echo;

  const key = import.meta.env.VITE_PUSHER_APP_KEY;
  if (!key) {
    console.warn('[chat] VITE_PUSHER_APP_KEY is not set — realtime updates are disabled');
    return null;
  }

  if (typeof window !== 'undefined') window.Pusher = Pusher;

  echo = new Echo({
    broadcaster: 'pusher',
    key,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1',
    forceTLS: true,
    Pusher,
  });

  return echo;
};

export const leaveChannel = (channelName) => {
  if (echo && channelName) echo.leave(channelName);
};

export default getEcho;
