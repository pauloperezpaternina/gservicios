
import React from 'react';
import { useAuth } from '../components/AuthContext';

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-6">
        Bienvenido al Dashboard, {currentUser?.username}!
      </h1>
      <p className="text-lg text-gray-700 mb-4">
        Utiliza la barra de navegación para gestionar usuarios, roles, clientes y servicios.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-700 mb-3">Gestión de Usuarios</h2>
          <p className="text-gray-600">
            Administra las cuentas de usuario, asigna roles y mantén el control de acceso.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-green-200">
          <h2 className="text-xl font-semibold text-green-700 mb-3">Gestión de Roles</h2>
          <p className="text-gray-600">
            Define y modifica los roles y sus respectivos permisos dentro de la aplicación.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-yellow-200">
          <h2 className="text-xl font-semibold text-yellow-700 mb-3">Gestión de Clientes</h2>
          <p className="text-gray-600">
            Crea, edita y elimina la información de tus clientes.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-purple-200">
          <h2 className="text-xl font-semibold text-purple-700 mb-3">Gestión de Servicios</h2>
          <p className="text-gray-600">
            Administra los servicios ofrecidos, incluyendo detalles e imágenes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
    