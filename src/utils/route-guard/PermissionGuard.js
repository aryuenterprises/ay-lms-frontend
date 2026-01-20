import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const PermissionGuard = ({ module, children }) => {
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkPermissions = useCallback(async () => {
    try {
      const data = JSON.parse(localStorage.getItem('auth') || '[]');
      const userType = data?.loginType;
      const permissions = data?.user?.permissions || [];
      // If user is super_admin, grant all permissions
      if (userType === 'super_admin' || userType === 'tutor' || userType === 'employer' || userType === 'student') {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      // If user is admin, check specific permissions
      if (userType === 'admin') {
        const hasPermission = permissions.some(
          (permission) => permission.module_name === module && permission.allowed_actions.includes('read')
        );

        setHasAccess(hasPermission);
        setIsLoading(false);
        return;
      }

      // If user type is not recognized
      setHasAccess(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setHasAccess(false);
      setIsLoading(false);
    }
  }, [module]);

  useEffect(() => {
    checkPermissions();
  }, [module, checkPermissions]);

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      navigate('/maintenance/404');
    }
  }, [isLoading, hasAccess, navigate]);

  if (isLoading) {
    return <div>Loading...</div>; // Or your custom loader
  }

  return hasAccess ? <>{children}</> : null;
};

// Prop validation
PermissionGuard.propTypes = {
  module: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};
