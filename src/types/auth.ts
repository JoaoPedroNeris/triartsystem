export type UserRole = "admin" | "produtor" | "visitante";

export interface UserProfile {
  id: number;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
