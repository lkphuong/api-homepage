export interface UserResponse {
  id: string;
  username: string;
  password?: string;
  active: boolean;
  created_at?: Date;
  updated_at?: Date;
  permissions?: PermissionResponse[];
}

export interface PermissionResponse {
  id: string;
  name: string;
}
