import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, LogOut, Settings, Pill, User, FileText, Activity, Calendar, Users, ShoppingBag, Home, Siren, AlertCircle, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { UserRole } from '../../types';
import { Chatbot } from '../Chatbot';
import { DataService } from '../../services/dataService';
import { useClinic } from '../../context/ClinicContext';
import { AudioAlert } from '../AudioAlert';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export const DashboardLayout: React.FC<{ allowedRoles?: UserRole[] }> = ({ allowedRoles }) => {
  const { user, isLoading, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isEmergencyRinging } = useClinic();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center dark:text-white bg-gray-50 dark:bg-gray-900">Chargement...</div>;
  }

  // If no user, send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is defined, check permission
  if (allowedRoles && !allowedRoles.includes(user.role)) {
     return <Navigate to="/" replace />;
  }

  // Define menus based on role
  const getMenus = (): MenuItem[] => {
    const common = [
         { icon: <Home size={20} />, label: 'Accueil Site', path: '/' },
         { icon: <Pill size={20} />, label: 'Pharmacie Publique', path: '/pharmacy' },
    ];

    switch (user.role) {
      case 'ADMIN':
        return [
          { icon: <LayoutDashboard size={20} />, label: 'Vue d\'ensemble', path: '/admin' },
          { icon: <Pill size={20} />, label: 'Gestion Pharmacie', path: '/admin/pharmacy' },
          { icon: <Settings size={20} />, label: 'Configuration', path: '/admin/settings' },
          ...common
        ];
      case 'PATIENT':
        return [
          { icon: <LayoutDashboard size={20} />, label: 'Mon Dossier', path: '/patient-portal' },
          { icon: <Calendar size={20} />, label: 'Prendre RDV', path: '/booking' },
          ...common
        ];
      case 'PHARMACIST':
        return [
          { icon: <LayoutDashboard size={20} />, label: 'Tableau de bord', path: '/pharmacy-admin' },
          { icon: <ShoppingBag size={20} />, label: 'Commandes', path: '/pharmacy-admin/orders' },
          { icon: <Pill size={20} />, label: 'Inventaire', path: '/pharmacy-admin/inventory' },
          ...common
        ];
      case 'DOCTOR':
        return [
          { icon: <Activity size={20} />, label: 'Espace Médecin', path: '/doctor-dashboard' },
          { icon: <Calendar size={20} />, label: 'Mon Planning', path: '/doctor-dashboard/planning' },
          ...common
        ];
      default:
        return common;
    }
  };

  const navItems = getMenus();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900 transition-colors">
      
      {/* AUDIO ALERT COMPONENT (Invisible but functional) */}
      {(user.role === 'DOCTOR' || user.role === 'ADMIN') && <AudioAlert />}

      {/* EMERGENCY BANNER FOR STAFF */}
      {isEmergencyRinging && user.role !== 'PATIENT' && (
          <div className="fixed top-0 left-0 w-full z-50 bg-red-600 text-white p-3 text-center font-bold animate-pulse flex justify-center items-center gap-2 shadow-lg">
              <Siren className="h-6 w-6 animate-bounce" /> 
              CODE BLUE : URGENCE MÉDICALE EN COURS
          </div>
      )}

      {/* MOBILE OVERLAY FOR SIDEBAR */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
        flex flex-col shadow-2xl md:shadow-none transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isEmergencyRinging && user.role !== 'PATIENT' ? 'mt-12' : ''}
      `}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-primary-600 dark:text-primary-400">
                {user.role === 'ADMIN' ? 'Admin Panel' : 
                user.role === 'PATIENT' ? 'Espace Patient' :
                user.role === 'PHARMACIST' ? 'Pharmacie' : 'Médecin'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[150px]">{user.name}</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500"><X/></button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm translate-x-1'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:translate-x-1'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
           <div className="flex items-center justify-between mb-4 px-2">
             <span className="text-sm text-gray-500 dark:text-gray-400">Mode Sombre</span>
             <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-transform active:scale-95">
               {isDark ? <Sun size={18} /> : <Moon size={18} />}
             </button>
           </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors hover:shadow-sm"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden relative ${isEmergencyRinging && user.role !== 'PATIENT' ? 'pt-12' : ''}`}>
         
        {/* Mobile Header (Visible only on small screens) */}
        <header className="md:hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-20 sticky top-0">
            <div className="flex items-center gap-3">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                    <Menu size={24}/>
                </button>
                <span className="font-bold text-lg dark:text-white truncate">CliniqueBeta</span>
            </div>
            <div className="flex gap-2">
               <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">{isDark ? <Sun size={20}/> : <Moon size={20}/>}</button>
            </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
            <Outlet />
        </main>
        
        {/* Chatbot overlay */}
        <Chatbot />
      </div>
    </div>
  );
};