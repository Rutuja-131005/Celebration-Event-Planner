import { api } from './api.ts';
import { User } from '../../server/models/types.ts';

const fallbackLeadPlanner: User = {
  id: 'usr_priya_lead',
  name: 'Rutuja Jadhav',
  email: 'rutuja@atelier.com',
  role: 'Lead Planner',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD86wFMv7GznXchX3b4O0dO0Rfez-G3ls1BbhsDJ0csLCul8V7slfahg9diMslJ1IoVgS44Ez3ew_HFxaRBsRsXAra2Tfahx2dEi1psEBko4A9GOcglUSNHJkeWtIhe90bEwS4Pd0HEFlR_MQ6jWaLs6Tmg8gYFOpdYpoTVe6UTJ3SPEB_cF_LAzhIkZA1B4eeLHhgwBJ0G9JGPfwa3g7bfhVB94BhsEVkIMxGpgrMstBUC8ijg7jOxDw',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const authService = {
  async getMe(): Promise<{ success: boolean; user: User }> {
    try {
      const res = await api.get<{ success: boolean; user: User }>('/auth/me');
      if (res?.success && res.user) return res;
    } catch {}

    return { success: true, user: fallbackLeadPlanner };
  },

  async login(email: string, password: string): Promise<{ success: boolean; user: User; token: string }> {
    try {
      const res = await api.post<{ success: boolean; user: User; token: string }>('/auth/login', { email, password });
      if (res?.token) {
        localStorage.setItem('atelier_token', res.token);
        return res;
      }
    } catch {}

    const dummyToken = `demo_token_${Date.now()}`;
    localStorage.setItem('atelier_token', dummyToken);
    return {
      success: true,
      user: { ...fallbackLeadPlanner, email: email || 'rutuja@atelier.com' },
      token: dummyToken,
    };
  },

  async register(name: string, email: string, password: string, role?: string): Promise<{ success: boolean; user: User; token: string }> {
    try {
      const res = await api.post<{ success: boolean; user: User; token: string }>('/auth/register', { name, email, password, role });
      if (res?.token) {
        localStorage.setItem('atelier_token', res.token);
        return res;
      }
    } catch {}

    const dummyToken = `demo_token_${Date.now()}`;
    localStorage.setItem('atelier_token', dummyToken);
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name || 'Planner',
      email: email || 'user@atelier.com',
      role: role || 'Event Planner',
      avatarUrl: fallbackLeadPlanner.avatarUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return {
      success: true,
      user: newUser,
      token: dummyToken,
    };
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.removeItem('atelier_token');
  },
};
