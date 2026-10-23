import { api } from './api.ts';
import { User } from '../../server/models/types.ts';

export const authService = {
  async getMe(): Promise<{ success: boolean; user: User }> {
    return api.get('/auth/me');
  },

  async login(email: string, password: string): Promise<{ success: boolean; user: User; token: string }> {
    const res = await api.post<{ success: boolean; user: User; token: string }>('/auth/login', { email, password });
    if (res.token) {
      localStorage.setItem('atelier_token', res.token);
    }
    return res;
  },

  async register(name: string, email: string, password: string, role?: string): Promise<{ success: boolean; user: User; token: string }> {
    const res = await api.post<{ success: boolean; user: User; token: string }>('/auth/register', { name, email, password, role });
    if (res.token) {
      localStorage.setItem('atelier_token', res.token);
    }
    return res;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('atelier_token');
  },
};
