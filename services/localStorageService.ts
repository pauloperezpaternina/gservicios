
import { LOCAL_STORAGE_KEYS, DEFAULT_ADMIN_USER, PREDEFINED_ROLES } from '../constants';
import { User, Role, Client, Service } from '../types';

interface EntityMap<T> {
  [id: string]: T;
}

const initializeLocalStorage = () => {
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.ROLES)) {
    const rolesMap: EntityMap<Role> = {};
    PREDEFINED_ROLES.forEach(role => (rolesMap[role.id] = role));
    localStorage.setItem(LOCAL_STORAGE_KEYS.ROLES, JSON.stringify(rolesMap));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) {
    const usersMap: EntityMap<User> = {};
    usersMap[DEFAULT_ADMIN_USER.id] = DEFAULT_ADMIN_USER;
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(usersMap));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.CLIENTS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CLIENTS, JSON.stringify({}));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.SERVICES)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SERVICES, JSON.stringify({}));
  }
};

initializeLocalStorage();

const getItem = <T>(key: string): EntityMap<T> => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : {};
};

const setItem = <T>(key: string, data: EntityMap<T>): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Users
export const getUsers = (): User[] => {
  return Object.values(getItem<User>(LOCAL_STORAGE_KEYS.USERS));
};

export const getUserById = (id: string): User | undefined => {
  const users = getItem<User>(LOCAL_STORAGE_KEYS.USERS);
  return users[id];
};

export const saveUser = (user: User): User => {
  const users = getItem<User>(LOCAL_STORAGE_KEYS.USERS);
  if (!user.id) {
    user.id = `user-${Date.now()}`;
  }
  users[user.id] = user;
  setItem(LOCAL_STORAGE_KEYS.USERS, users);
  return user;
};

export const deleteUser = (id: string): void => {
  const users = getItem<User>(LOCAL_STORAGE_KEYS.USERS);
  delete users[id];
  setItem(LOCAL_STORAGE_KEYS.USERS, users);
};

export const findUserByCredentials = (username: string, passwordHash: string): User | undefined => {
  const users = getUsers();
  // In a real app, passwordHash would be compared with a hashed password from the database
  return users.find(u => u.username === username && u.password === passwordHash);
};

export const getCurrentUserId = (): string | null => {
  return localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER_ID);
};

export const setCurrentUserId = (userId: string | null): void => {
  if (userId) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER_ID, userId);
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER_ID);
  }
};

// Roles
export const getRoles = (): Role[] => {
  return Object.values(getItem<Role>(LOCAL_STORAGE_KEYS.ROLES));
};

export const getRoleById = (id: string): Role | undefined => {
  const roles = getItem<Role>(LOCAL_STORAGE_KEYS.ROLES);
  return roles[id];
};

export const saveRole = (role: Role): Role => {
  const roles = getItem<Role>(LOCAL_STORAGE_KEYS.ROLES);
  if (!role.id) {
    role.id = `role-${Date.now()}`;
  }
  roles[role.id] = role;
  setItem(LOCAL_STORAGE_KEYS.ROLES, roles);
  return role;
};

export const deleteRole = (id: string): void => {
  const roles = getItem<Role>(LOCAL_STORAGE_KEYS.ROLES);
  delete roles[id];
  setItem(LOCAL_STORAGE_KEYS.ROLES, roles);
};

// Clients
export const getClients = (): Client[] => {
  return Object.values(getItem<Client>(LOCAL_STORAGE_KEYS.CLIENTS));
};

export const getClientById = (id: string): Client | undefined => {
  const clients = getItem<Client>(LOCAL_STORAGE_KEYS.CLIENTS);
  return clients[id];
};

export const saveClient = (client: Client): Client => {
  const clients = getItem<Client>(LOCAL_STORAGE_KEYS.CLIENTS);
  if (!client.id) {
    client.id = `client-${Date.now()}`;
  }
  clients[client.id] = client;
  setItem(LOCAL_STORAGE_KEYS.CLIENTS, clients);
  return client;
};

export const deleteClient = (id: string): void => {
  const clients = getItem<Client>(LOCAL_STORAGE_KEYS.CLIENTS);
  delete clients[id];
  setItem(LOCAL_STORAGE_KEYS.CLIENTS, clients);
};

// Services
export const getServices = (): Service[] => {
  return Object.values(getItem<Service>(LOCAL_STORAGE_KEYS.SERVICES));
};

export const getServiceById = (id: string): Service | undefined => {
  const services = getItem<Service>(LOCAL_STORAGE_KEYS.SERVICES);
  return services[id];
};

export const saveService = (service: Service): Service => {
  const services = getItem<Service>(LOCAL_STORAGE_KEYS.SERVICES);
  if (!service.id) {
    service.id = `service-${Date.now()}`;
  }
  services[service.id] = service;
  setItem(LOCAL_STORAGE_KEYS.SERVICES, services);
  return service;
};

export const deleteService = (id: string): void => {
  const services = getItem<Service>(LOCAL_STORAGE_KEYS.SERVICES);
  delete services[id];
  setItem(LOCAL_STORAGE_KEYS.SERVICES, services);
};
    