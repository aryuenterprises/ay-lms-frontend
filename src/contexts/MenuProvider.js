// MenuProvider.js
import { useContext } from 'react';

export const useMenu = () => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
