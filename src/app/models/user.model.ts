export interface CreateUserRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
}
