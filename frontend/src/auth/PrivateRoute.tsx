import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext, AuthState } from './AuthProvider';
import { getLogger } from '../core';

const log = getLogger('PrivateRoute');

interface PrivateRouteProps {
  element: React.ReactElement;
  path: string;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { isAuthenticated } = useContext<AuthState>(AuthContext);
  log('render, isAuthenticated', isAuthenticated);
  
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};