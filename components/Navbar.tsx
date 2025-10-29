
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Permission } from '../types';

const Navbar: React.FC = () => {
  const { currentUser, logout, hasPermission } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `block py-2 px-3 rounded md:p-0 hover:text-blue-200 transition-colors ${
      isActive ? 'font-bold text-blue-200' : ''
    }`;

  return (
    <nav className="bg-blue-800 text-white p-4 shadow-md sticky top-0 z-40">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <NavLink to="/dashboard" className="text-2xl font-bold hover:text-blue-200 transition-colors">
          Admin Dashboard
        </NavLink>

        {/* Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          aria-controls="mobile-menu"
          aria-expanded={isMenuOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>

        {/* Navigation Links */}
        <div className={`w-full md:w-auto md:flex md:items-center ${isMenuOpen ? 'block animate-slide-down' : 'hidden'}`} id="mobile-menu">
          <div className="flex flex-col md:flex-row items-center mt-4 md:mt-0 md:space-x-6 space-y-2 md:space-y-0">
            {hasPermission(Permission.ManageUsers) && (
              <NavLink to="/users" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>
                Usuarios
              </NavLink>
            )}
            {hasPermission(Permission.ManageRoles) && (
              <NavLink to="/roles" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>
                Roles
              </NavLink>
            )}
            {hasPermission(Permission.ManageClients) && (
              <NavLink to="/clients" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>
                Clientes
              </NavLink>
            )}
            {hasPermission(Permission.ManageServices) && (
              <NavLink to="/services" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>
                Servicios
              </NavLink>
            )}
            {currentUser && (
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 md:ml-6 border-t md:border-t-0 border-blue-700 pt-4 md:pt-0 mt-4 md:mt-0">
                <span className="text-blue-200 text-sm">
                  Bienvenido, {currentUser.username}
                </span>
                <button
                  onClick={logout}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md transition-colors text-sm w-full md:w-auto"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
