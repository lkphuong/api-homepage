export interface RegisterResponse {
  id: string;
  username: string;
  password?: string;
  active: boolean;
  permissions: PermissionResponse[];
}

export interface PermissionResponse {
  id: string;
  code: string;
  name: string;
}
