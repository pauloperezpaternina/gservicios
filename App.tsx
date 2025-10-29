
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import ClientsPage from './pages/ClientsPage';
import ServicesPage from './pages/ServicesPage';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<NavbarWrapper><DashboardPage /></NavbarWrapper>} />
              <Route path="/dashboard" element={<NavbarWrapper><DashboardPage /></NavbarWrapper>} />
              <Route path="/users" element={<NavbarWrapper><UsersPage /></NavbarWrapper>} />
              <Route path="/roles" element={<NavbarWrapper><RolesPage /></NavbarWrapper>} />
              <Route path="/clients" element={<NavbarWrapper><ClientsPage /></NavbarWrapper>} />
              <Route path="/services" element={<NavbarWrapper><ServicesPage /></NavbarWrapper>} />
            </Route>
            {/* Redirect any unmatched routes to the dashboard or login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

// Wrapper component to include Navbar on protected routes
const NavbarWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
  </>
);

export default App;
    