
import React, { useState, useEffect, useCallback } from 'react';
import { Role, Permission } from '../types';
import {
  getRoles,
  saveRole,
  deleteRole,
} from '../services/localStorageService';
import { ALL_PERMISSIONS } from '../constants';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../components/AuthContext';

const RoleForm: React.FC<{ role?: Role; onClose: () => void; onSave: (role: Role) => void }> =
  ({ role, onClose, onSave }) => {
    const [name, setName] = useState(role?.name || '');
    const [permissions, setPermissions] = useState<Permission[]>(role?.permissions || []);
    const [error, setError] = useState('');

    const handlePermissionChange = (permission: Permission, isChecked: boolean) => {
      setPermissions((prev) =>
        isChecked ? [...prev, permission] : prev.filter((p) => p !== permission)
      );
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!name) {
        setError('El nombre del rol es obligatorio.');
        return;
      }

      const existingRoles = getRoles();
      if (!role && existingRoles.some(r => r.name.toLowerCase() === name.toLowerCase())) {
        setError('Ya existe un rol con este nombre.');
        return;
      }
      if (role && role.name.toLowerCase() !== name.toLowerCase() && existingRoles.some(r => r.name.toLowerCase() === name.toLowerCase())) {
        setError('Ya existe un rol con este nombre.');
        return;
      }

      const roleToSave: Role = {
        ...role,
        id: role?.id || '', // id will be generated if empty
        name,
        permissions,
      };

      onSave(roleToSave);
      onClose();
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div>
          <label htmlFor="roleName" className="block text-sm font-medium text-gray-700">
            Nombre del Rol
          </label>
          <input
            type="text"
            id="roleName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            required
          />
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">Permisos</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ALL_PERMISSIONS.map((perm) => (
              <div key={perm} className="flex items-center">
                <input
                  id={`perm-${perm}`}
                  type="checkbox"
                  checked={permissions.includes(perm)}
                  onChange={(e) => handlePermissionChange(perm, e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`perm-${perm}`} className="ml-2 text-sm text-gray-700">
                  {perm.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </label>
              </div>
            ))}
          </div>
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

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();

  const fetchRoles = useCallback(() => {
    setLoading(true);
    const fetchedRoles = getRoles();
    setRoles(fetchedRoles);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleSaveRole = useCallback((role: Role) => {
    saveRole(role);
    fetchRoles();
  }, [fetchRoles]);

  const handleDeleteRole = useCallback((id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este rol?')) {
      deleteRole(id);
      fetchRoles();
    }
  }, [fetchRoles]);

  const openCreateModal = () => {
    setEditingRole(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  if (!hasPermission(Permission.ManageRoles)) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center text-red-600 font-semibold">
        No tienes permiso para gestionar roles.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-6">Gestión de Roles</h1>
      <div className="flex justify-end mb-6">
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-md transition-colors flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Añadir Rol
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
                    Nombre del Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permisos
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {role.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                          {role.permissions.length > 0
                            ? role.permissions.map(p => (
                              <span key={p} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {p.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                              </span>
                            ))
                            : <span className="text-xs italic">Ninguno</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(role)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                        title="Editar rol"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar rol"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {roles.length === 0 && !loading && (
              <p className="p-4 text-center text-gray-500">No hay roles para mostrar.</p>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
              {roles.map((role) => (
                  <div key={role.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                          <p className="text-lg font-semibold text-blue-700">{role.name}</p>
                          <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                              <button onClick={() => openEditModal(role)} className="text-blue-600 hover:text-blue-900 transition-colors text-sm font-medium">Editar</button>
                              <button onClick={() => handleDeleteRole(role.id)} className="text-red-600 hover:text-red-900 transition-colors text-sm font-medium">Eliminar</button>
                          </div>
                      </div>
                      <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Permisos:</p>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.length > 0
                              ? role.permissions.map(p => (
                                <span key={p} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {p.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </span>
                              ))
                              : <span className="text-xs italic text-gray-500">Ninguno</span>}
                          </div>
                      </div>
                  </div>
              ))}
               {roles.length === 0 && !loading && (
                  <p className="p-4 text-center text-gray-500 bg-white rounded-lg shadow-md">No hay roles para mostrar.</p>
              )}
          </div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? 'Editar Rol' : 'Añadir Nuevo Rol'}
      >
        <RoleForm
          role={editingRole}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveRole}
        />
      </Modal>
    </div>
  );
};

export default RolesPage;
