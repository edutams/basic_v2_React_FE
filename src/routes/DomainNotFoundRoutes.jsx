import DomainNotFound from '../components/shared/DomainNotFound';

// Mounted by Router.jsx when the current hostname matches neither a real
// tenant (school) domain nor a real organization (agent) domain — every
// path shows the same clear "School Not Found" message instead of
// silently falling through to the agent portal under a URL that still
// looks like (a wrong) school address.
const DomainNotFoundRoutes = [
  {
    path: '*',
    element: <DomainNotFound />,
  },
];

export default DomainNotFoundRoutes;
