// hooks/usePermission.js
import { useCallback } from 'react';

export const usePermission = () => {
  const checkPermission = useCallback((module, action) => {
    try {
      const data = JSON.parse(localStorage.getItem('auth') || '[]');
      const userType = data?.loginType;
      const permissions = data?.user?.permissions || [];

      if (userType === 'super_admin') return true;

      if (userType === 'admin') {
        return permissions.some((permission) => permission.module_name === module && permission.allowed_actions.includes(action));
      }

      return false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }, []);

  return { checkPermission };
};
