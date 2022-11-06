export interface RbacRole {
  app?: string;
  roles?: [];
}

export interface RbacInfo {
 provider?: string;
 token?: string;
 first_name?: string;
 last_name?: string;
 email?: string;
 roles?: RbacRole;
}