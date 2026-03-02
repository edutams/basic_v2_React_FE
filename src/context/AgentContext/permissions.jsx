import { createContext, useContext } from 'react';

const PermissionContext = createContext([]);

export const PermissionProvider = ({ permissions, children }) => {
  return <PermissionContext.Provider value={permissions}>{children}</PermissionContext.Provider>;
};

export const usePermissions = () => {
  const permissions = useContext(PermissionContext);

  const can = (permission) => permissions?.includes(permission);

  const canAny = (permissionArray) => permissionArray.some((p) => permissions?.includes(p));

  const canAll = (permissionArray) => permissionArray.every((p) => permissions?.includes(p));

  return { can, canAny, canAll };
};
