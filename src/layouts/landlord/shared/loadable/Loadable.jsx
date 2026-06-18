// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { Suspense } from 'react';

// project imports
import Spinner from '@/components/shared/spinner/Spinner';

// ===========================|| LOADABLE - LAZY LOADING ||=========================== //

const Loadable = (Component) => (props) => (
  <Suspense fallback={<Spinner />}>
    <Component {...props} />
  </Suspense>
);

export default Loadable;
