
export enum Permission {
  ManageUsers = 'manage_users',
  ManageRoles = 'manage_roles',
  ManageClients = 'manage_clients',
  ManageServices = 'manage_services',
}

export interface User {
  id: string;
  username: string;
  password?: string; // Optional for safety, never expose in UI or store plaintext
  roleId: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Client {
  id: string;
  nit: string;
  name: string;
  detail: string;
}

export enum ServiceType {
  Consulting = 'Consultoría',
  Development = 'Desarrollo',
  Support = 'Soporte',
  Maintenance = 'Mantenimiento',
  Design = 'Diseño',
}

export interface Service {
  id: string;
  type: ServiceType;
  value: number;
  detail: string;
  imageUrls: string[]; // Base64 or GCS URLs (simulated)
}

export interface AuthContextType {
  currentUser: User | null;
  currentRole: Role | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  loading: boolean;
}
    