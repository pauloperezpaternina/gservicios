
import React, { useState, useEffect, useCallback } from 'react';
import { User, Role, Permission } from '../types';
import {
  getUsers,
  saveUser,
  deleteUser,
  getRoles,
} from '../services/localStorageService';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../components/AuthContext';

const UserForm: React.FC<{ user?: User; roles: Role[]; onClose: () => void; onSave: (user: User) => void }> =
  ({ user, roles, onClose, onSave }) => {
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState(''); // Always start empty for security
    const [roleId, setRoleId] = useState(user?.roleId || '');
    const [error, setError] = useState('');

    useEffect(() => {
      if (!roleId && roles.length > 0) {
        setRoleId(roles[0].id); // Set default role if not already set
      }
    }, [roles, roleId]);


    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!username || !roleId) {
        setError('Todos los campos obligatorios deben ser completados.');
        return;
      }

      if (!user && !password) {
        setError('La contraseña es obligatoria para nuevos usuarios.');
        return;
      }

      const existingUsers = getUsers();
      if (!user && existingUsers.some(u => u.username === username)) {
        setError('El nombre de usuario ya existe. Por favor, elige otro.');
        return;
      }
      if (user && user.username !== username && existingUsers.some(u => u.username === username)) {
        setError('El nombre de usuario ya existe. Por favor, elige otro.');
        return;
      }

      const userToSave: User = {
        ...user,
        id: user?.id || '', // id will be generated if empty
        username,
        roleId,
        password: password || user?.password, // Keep existing password if not changed
      };

      onSave(userToSave);
      onClose();
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Nombre de Usuario
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña {user ? '(dejar vacío para no cambiar)' : ''}
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            placeholder={user ? '********' : ''}
            required={!user}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Rol
          </label>
          <select
            id="role"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            required
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Guardar
          </button>
        </div>
      </form>
    );
  };

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();

  const fetchUsersAndRoles = useCallback(() => {
    setLoading(true);
    const fetchedUsers = getUsers();
    const fetchedRoles = getRoles();
    setUsers(fetchedUsers);
    setRoles(fetchedRoles);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsersAndRoles();
  }, [fetchUsersAndRoles]);

  const handleSaveUser = useCallback((user: User) => {
    saveUser(user);
    fetchUsersAndRoles();
  }, [fetchUsersAndRoles]);

  const handleDeleteUser = useCallback((id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      deleteUser(id);
      fetchUsersAndRoles();
    }
  }, [fetchUsersAndRoles]);

  const openCreateModal = () => {
    setEditingUser(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  if (!hasPermission(Permission.ManageUsers)) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center text-red-600 font-semibold">
        No tienes permiso para gestionar usuarios.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-6">Gestión de Usuarios</h1>
      <div className="flex justify-end mb-6">
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-md transition-colors flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Añadir Usuario
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {roles.find((role) => role.id === user.roleId)?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                        title="Editar usuario"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar usuario"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && !loading && (
              <p className="p-4 text-center text-gray-500">No hay usuarios para mostrar.</p>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
              {users.map((user) => (
                  <div key={user.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="text-lg font-semibold text-blue-700">{user.username}</p>
                              <p className="text-sm text-gray-500">
                                  {roles.find((role) => role.id === user.roleId)?.name || 'N/A'}
                              </p>
                          </div>
                          <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                              <button
                                  onClick={() => openEditModal(user)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors text-sm font-medium"
                                  title="Editar usuario"
                              >
                                  Editar
                              </button>
                              <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-900 transition-colors text-sm font-medium"
                                  title="Eliminar usuario"
                              >
                                  Eliminar
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
              {users.length === 0 && !loading && (
                  <p className="p-4 text-center text-gray-500 bg-white rounded-lg shadow-md">No hay usuarios para mostrar.</p>
              )}
          </div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}
      >
        <UserForm
          user={editingUser}
          roles={roles}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUser}
        />
      </Modal>
    </div>
  );
};

export default UsersPage;
