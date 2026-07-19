export interface User {
  id: number;
  name: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  role: string;
  created_at: string;
}

export type UserFilter = Partial<User>;