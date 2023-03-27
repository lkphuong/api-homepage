export interface ProfileResponse {
  user_id: string;
  username?: string;
  email?: string;
  permissions?: PermissionResponse[];
}

export interface PermissionResponse {
  id: string;
  code: string;
  name: string;
}

export interface UserResponse extends ProfileResponse {
  username: string;
}

export interface AuthResponse {
  success: boolean;
  payload: UserResponse | null;
  error?: string;
}

export interface VerifyTokenResponse {
  email: string;
  type: number;
}
