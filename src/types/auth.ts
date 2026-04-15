export type UserRole = 'admin' | 'neumólogo';

export interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
  // Account linking fields
  authMethods: string[]; // ['password', 'google.com']
  primaryUid: string; // UID principal del usuario
  linkedUids?: string[]; // UIDs adicionales vinculados
}

export interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}
