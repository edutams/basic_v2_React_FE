import { useEffect } from 'react';
import { fetchSupportWidgetConfig } from '@/api/tenant/support/supportApi';

const WIDGET_CONTAINER_ID = 'edutams-support-chat';

/**
 * The exact same "edutams-support-chat" widget V1 renders on every
 * authenticated page (basic/resources/views/app.blade.php) — same support
 * app, same credentials, same signed-payload contract. V1 could sign the
 * payload straight in its Blade view since that renders server-side per
 * request; here the signature is computed by the backend
 * (SupportWidgetController) and just consumed as-is, so the signing secret
 * never reaches the browser.
 *
 * Mounted once in SchoolLayout (every authenticated tenant page), not per
 * page — it builds its own DOM node directly (same shape V1's markup used:
 * a div carrying data-payload/data-origin/data-env, then the support app's
 * own script tag) rather than rendering JSX, since the external script is
 * what actually reads those attributes and mounts the chat bubble itself.
 */
const SupportChatWidget = () => {
  useEffect(() => {
    // `cancelled` is per-effect-run (not a ref) deliberately — React 18
    // StrictMode's dev-only double-invoke runs this effect, its cleanup,
    // then this effect again, each with its own closure. The container-
    // already-exists check below is what actually prevents a duplicate
    // widget; this flag only stops a reply landing after THIS run's own
    // unmount, same as any other cancelled-fetch-on-unmount pattern.
    let cancelled = false;

    fetchSupportWidgetConfig()
      .then((res) => {
        if (cancelled || !res?.status || document.getElementById(WIDGET_CONTAINER_ID)) {
          return;
        }

        const { payload, origin, env } = res.data || {};

        if (!payload || !origin) {
          return;
        }

        const container = document.createElement('div');
        container.id = WIDGET_CONTAINER_ID;
        container.dataset.payload = payload;
        container.dataset.origin = origin;
        container.dataset.env = env || '';
        document.body.appendChild(container);

        const script = document.createElement('script');
        script.src = `${origin}/inline_script/edu_support.js`;
        script.async = true;
        document.body.appendChild(script);
      })
      .catch(() => {
        // Support chat is a convenience, not a core flow — nothing here
        // should ever block or surface an error over the rest of the app.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
};

export default SupportChatWidget;
