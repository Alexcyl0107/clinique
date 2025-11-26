import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, LogOut, Settings, Pill } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center dark:text-white">Chargement...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/admin-login" replace />;
  }

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Tableau de bord', path: '/admin' },
    { icon: <Users size={20} />, label: 'Médecins', path: '/admin/doctors' },
    { icon: <Pill size={20} />, label: 'Pharmacie', path: '/admin/pharmacy' },
    { icon: <Settings size={20} />, label: 'Paramètres', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-primary-600 dark:text-primary-400">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
           <div className="flex items-center justify-between mb-4 px-4">
             <span className="text-sm text-gray-500">Mode</span>
             <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
               {isDark ? <Sun size={18} /> : <Moon size={18} />}
             </button>
           </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};