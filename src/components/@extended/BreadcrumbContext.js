import PropTypes from 'prop-types';
import { createContext, useContext, useState } from 'react';

// Create Breadcrumb Context
const BreadcrumbContext = createContext();

// Custom Hook to use the Breadcrumb Context
export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
};


// Breadcrumb Provider Component
export const BreadcrumbProvider = ({ children }) => {
  const [breadcrumbTitle, setBreadcrumbTitle] = useState('');

  return <BreadcrumbContext.Provider value={{ breadcrumbTitle, setBreadcrumbTitle }}>{children}</BreadcrumbContext.Provider>;
};

// Add prop type validation
BreadcrumbProvider.propTypes = {
  children: PropTypes.node.isRequired
};
