import React, { useCallback, useEffect, useState } from 'react';
import { getLogger } from '../core';
import { login as loginApi, setMemoryToken } from './authApi';
import { Preferences } from '@capacitor/preferences';

const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;
type LogoutFn = () => void;

export interface AuthState {
  authenticationError: Error | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login?: LoginFn;
  logout?: LogoutFn;
  pendingAuthentication?: boolean;
  username?: string;
  password?: string;
  token: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAuthenticating: false,
  authenticationError: null,
  pendingAuthentication: false,
  token: '',
};

export const AuthContext = React.createContext<AuthState>(initialState);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const [isInitializing, setIsInitializing] = useState<boolean>(true); 
  const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token } = state;
  
  const login = useCallback<LoginFn>(loginCallback, []);
  const logout = useCallback<LogoutFn>(logoutCallback, []);
  
  useEffect(() => {
    loadTokenFromStorage();
  }, []);

  useEffect(authenticationEffect, [pendingAuthentication]);

  async function loadTokenFromStorage() {
    try {
      const res = await Preferences.get({ key: 'token' });
      if (res.value) {
        setMemoryToken(res.value);
        setState(s => ({ ...s, token: res.value!, isAuthenticated: true }));
      }
    } catch (error) {
      log('loadTokenFromStorage failed', error);
    } finally {
      setIsInitializing(false);
    }
  }

  if (isInitializing) {
    return null; 
  }

  const value = { isAuthenticated, login, logout, isAuthenticating, authenticationError, token };
  
  log('render');
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

  function loginCallback(username?: string, password?: string): void {
    log('login');
    setState(s => ({ ...s, pendingAuthentication: true, username, password }));
  }

  async function logoutCallback() {
    log('logout');
    setMemoryToken(null);
    await Preferences.remove({ key: 'token' });
    setState({ ...initialState });
  }

  function authenticationEffect() {
    let canceled = false;
    authenticate();
    return () => { canceled = true; }

    async function authenticate() {
      if (!pendingAuthentication) return;
      try {
        log('authenticate...');
        setState(s => ({ ...s, isAuthenticating: true, authenticationError: null }));
        const { username, password } = state;
        const { token } = await loginApi(username, password);
        if (canceled) return;
        
        setMemoryToken(token);
        await Preferences.set({ key: 'token', value: token });
        log('authenticate succeeded');
        setState(s => ({ ...s, token, pendingAuthentication: false, isAuthenticated: true, isAuthenticating: false }));
      } catch (error) {
        if (canceled) return;
        log('authenticate failed');
        setState(s => ({ ...s, authenticationError: error as Error, pendingAuthentication: false, isAuthenticating: false }));
      }
    }
  }
};