import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Cross, User as UserIcon, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { config } = useClinic();
  const location = useLocation();
  const navigate = useNavigate();

  // If no user, Navbar should technically not be rendered by DashboardLayout, 
  // but as a safety, we return null or a minimal version.
  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const handleDashboardClick = () => {
    switch(user.role) {
      case 'ADMIN': navigate('/admin'); break;
      case 'DOCTOR': navigate('/doctor-dashboard'); break;
      case 'PHARMACIST': navigate('/pharmacy-admin'); break;
      case 'PATIENT': navigate('/patient-portal'); break;
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary-600 p-2 rounded-lg group-hover:bg-primary-700 transition-colors">
                <Cross className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white hidden md:block">
                {config.name}
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/" active={isActive('/')}>Accueil</NavLink>
            <NavLink to="/services" active={isActive('/services')}>Services</NavLink>
            <NavLink to="/doctors" active={isActive('/doctors')}>Médecins</NavLink>
            <NavLink to="/pharmacy" active={isActive('/pharmacy')}>Pharmacie</NavLink>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>

            <button
              onClick={handleDashboardClick}
              className="flex items-center gap-2 bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full font-medium transition-colors hover:bg-primary-100"
            >
              <UserIcon size={18} />
              <span>{user.name}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button onClick={logout} className="text-gray-500 hover:text-red-500" title="Déconnexion">
                <LogOut size={20}/>
            </button>
          </div>

          <div className="md:hidden flex items-center gap-4">
             <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 animate-fade-in-down absolute w-full z-50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <MobileNavLink to="/" onClick={() => setIsOpen(false)}>Accueil</MobileNavLink>
            <MobileNavLink to="/services" onClick={() => setIsOpen(false)}>Services</MobileNavLink>
            <MobileNavLink to="/doctors" onClick={() => setIsOpen(false)}>Médecins</MobileNavLink>
            <MobileNavLink to="/pharmacy" onClick={() => setIsOpen(false)}>Pharmacie</MobileNavLink>
            
            <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
                 <button 
                  onClick={() => { handleDashboardClick(); setIsOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-primary-600 dark:text-primary-400"
                 >
                   Mon Espace ({user.role})
                 </button>
                 <button 
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-red-600"
                 >
                   Déconnexion
                 </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink: React.FC<{ to: string; active: boolean; children: React.ReactNode }> = ({ to, active, children }) => (
  <Link
    to={to}
    className={`${
      active ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
    } transition-colors duration-200`}
  >
    {children}
  </Link>
);

const MobileNavLink: React.FC<{ to: string; onClick: () => void; children: React.ReactNode; isPrimary?: boolean }> = ({ to, onClick, children, isPrimary }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`block px-3 py-2 rounded-md text-base font-medium ${
      isPrimary
        ? 'bg-primary-600 text-white'
        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
    }`}
  >
    {children}
  </Link>
);