export interface User {
  userId: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
