export type AdminRole = 'super_admin' | 'staff' | 'instructor';

export interface Admin {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export function getStoredAdmin(): Admin | null {
  if (typeof window === 'undefined') return null;

  const adminStr = localStorage.getItem('admin');
  if (!adminStr) return null;

  try {
    return JSON.parse(adminStr);
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setAuthData(token: string, admin: Admin): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem('token', token);
  localStorage.setItem('admin', JSON.stringify(admin));
}

export function clearAuthData(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('token');
  localStorage.removeItem('admin');
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

export function hasRole(role: AdminRole): boolean {
  const admin = getStoredAdmin();
  return admin?.role === role;
}

export function isSuperAdmin(): boolean {
  return hasRole('super_admin');
}

export function isInstructor(): boolean {
  return hasRole('instructor');
}

export function isAdminUser(): boolean {
  const admin = getStoredAdmin();
  return admin?.role === 'super_admin' || admin?.role === 'staff';
}
