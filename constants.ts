
import { Permission, Role, ServiceType, User } from './types';

export const LOCAL_STORAGE_KEYS = {
  USERS: 'admin_dashboard_users',
  ROLES: 'admin_dashboard_roles',
  CLIENTS: 'admin_dashboard_clients',
  SERVICES: 'admin_dashboard_services',
  CURRENT_USER_ID: 'admin_dashboard_current_user_id',
};

export const ALL_PERMISSIONS: Permission[] = [
  Permission.ManageUsers,
  Permission.ManageRoles,
  Permission.ManageClients,
  Permission.ManageServices,
];

export const PREDEFINED_ROLES: Role[] = [
  {
    id: 'admin-role-id',
    name: 'Administrator',
    permissions: ALL_PERMISSIONS,
  },
  {
    id: 'editor-role-id',
    name: 'Editor',
    permissions: [
      Permission.ManageClients,
      Permission.ManageServices,
    ],
  },
  {
    id: 'viewer-role-id',
    name: 'Viewer',
    permissions: [],
  },
];

export const DEFAULT_ADMIN_USER: User = {
  id: 'admin-user-id',
  username: 'admin',
  password: 'adminpassword', // In a real app, this would be hashed and not stored here.
  roleId: 'admin-role-id',
};

export const SERVICE_TYPES_LIST: ServiceType[] = [
  ServiceType.Consulting,
  ServiceType.Development,
  ServiceType.Support,
  ServiceType.Maintenance,
  ServiceType.Design,
];

export const GCS_MOCK_NOTICE = `
    NOTE: Image upload to Google Cloud Storage (GCS) requires a backend service to handle authentication, authorization, and the actual file upload.
    This frontend application simulates the process by displaying image previews and storing base64 representations in local storage, or by using placeholder image URLs.
    For a production environment, you would integrate with a backend API (e.g., Node.js, Python, Java) that securely interacts with GCS.
`;
    