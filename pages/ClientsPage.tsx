
import React, { useState, useEffect, useCallback } from 'react';
import { Client, Permission } from '../types';
import {
  getClients,
  saveClient,
  deleteClient,
} from '../services/localStorageService';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../components/AuthContext';

const ClientForm: React.FC<{ client?: Client; onClose: () => void; onSave: (client: Client) => void }> =
  ({ client, onClose, onSave }) => {
    const [nit, setNit] = useState(client?.nit || '');
    const [name, setName] = useState(client?.name || '');
    const [detail, setDetail] = useState(client?.detail || '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!nit || !name || !detail) {
        setError('Todos los campos son obligatorios.');
        return;
      }

      const existingClients = getClients();
      if (!client && existingClients.some(c => c.nit === nit)) {
        setError('Ya existe un cliente con este NIT.');
        return;
      }
      if (client && client.nit !== nit && existingClients.some(c => c.nit === nit)) {
        setError('Ya existe un cliente con este NIT.');
        return;
      }

      const clientToSave: Client = {
        ...client,
        id: client?.id || '', // id will be generated if empty
        nit,
        name,
        detail,
      };

      onSave(clientToSave);
      onClose();
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div>
          <label htmlFor="nit" className="block text-sm font-medium text-gray-700">
            NIT
          </label>
          <input
            type="text"
            id="nit"
            value={nit}
            onChange={(e) => setNit(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="detail" className="block text-sm font-medium text-gray-700">
            Detalle
          </label>
          <textarea
            id="detail"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            required
          ></textarea>
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

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();

  const fetchClients = useCallback(() => {
    setLoading(true);
    const fetchedClients = getClients();
    setClients(fetchedClients);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSaveClient = useCallback((client: Client) => {
    saveClient(client);
    fetchClients();
  }, [fetchClients]);

  const handleDeleteClient = useCallback((id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      deleteClient(id);
      fetchClients();
    }
  }, [fetchClients]);

  const openCreateModal = () => {
    setEditingClient(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  if (!hasPermission(Permission.ManageClients)) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center text-red-600 font-semibold">
        No tienes permiso para gestionar clientes.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-6">Gestión de Clientes</h1>
      <div className="flex justify-end mb-6">
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-md transition-colors flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Añadir Cliente
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
                    NIT
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detalle
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {client.nit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-sm truncate">
                      {client.detail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(client)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                        title="Editar cliente"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar cliente"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {clients.length === 0 && !loading && (
              <p className="p-4 text-center text-gray-500">No hay clientes para mostrar.</p>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-lg font-semibold text-blue-700">{client.name}</p>
                    <p className="text-sm text-gray-500">NIT: {client.nit}</p>
                  </div>
                  <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                    <button
                      onClick={() => openEditModal(client)}
                      className="text-blue-600 hover:text-blue-900 transition-colors text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-red-600 hover:text-red-900 transition-colors text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{client.detail}</p>
              </div>
            ))}
             {clients.length === 0 && !loading && (
              <p className="p-4 text-center text-gray-500 bg-white rounded-lg shadow-md">No hay clientes para mostrar.</p>
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
      >
        <ClientForm
          client={editingClient}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveClient}
        />
      </Modal>
    </div>
  );
};

export default ClientsPage;
