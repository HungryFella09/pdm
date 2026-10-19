import axios from 'axios';
import { baseUrl, config, withLogs } from '../core';
import { Preferences } from '@capacitor/preferences';

const authUrl = `http://${baseUrl}/api/auth/login`;
const loginUrl = `http://${baseUrl}/api/auth/login`;

export interface AuthProps {
  token: string;
}

let memoryToken: string | null = null;

export const setMemoryToken = (token: string | null) => {
  memoryToken = token;
};

export const getMemoryToken = () => memoryToken;

export const login: (username?: string, password?: string) => Promise<AuthProps> = async (username, password) => {
  const data = await withLogs(axios.post(authUrl, { username, password }, config), 'login');
  
  if (data && data.token) {
    memoryToken = data.token; 
    await Preferences.set({ key: 'token', value: data.token });
  }
  
  return data;
}


axios.interceptors.request.use(
  async (axiosConfig) => {
    let token = getMemoryToken();

    if (!token) {
      const res = await Preferences.get({ key: 'token' });
      token = res.value || null;
      if (token) {
        memoryToken = token;
      }
    }

    if (token) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }
    return axiosConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);