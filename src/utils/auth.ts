export interface UserProfile {
  nik: string;
  name: string;
  nomorPeserta: string;
  email?: string;
  targetInstansi?: string;
  isLoggedIn: boolean;
  loginTime: number;
}

export const AUTH_STORAGE_KEY = 'cat_user_session';

/**
 * Mengambil sesi user dari localStorage
 */
export function getUserSession(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as UserProfile;
    if (user && user.isLoggedIn) {
      return user;
    }
  } catch (e) {
    console.error('Failed reading user session', e);
  }
  return null;
}

/**
 * Menyimpan sesi login user
 */
export function setUserSession(user: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth-state-changed'));
  } catch (e) {
    console.error('Failed saving user session', e);
  }
}

/**
 * Logout user
 */
export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event('auth-state-changed'));
  } catch (e) {
    console.error('Failed clearing user session', e);
  }
}
