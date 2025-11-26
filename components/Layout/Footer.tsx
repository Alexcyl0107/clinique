import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 pt-12 pb-8 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">CliniqueBeta</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-6">
              Votre santé au cœur de nos préoccupations. Une référence médicale au Togo alliant expertise et humanité.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<Facebook size={20} />} />
              <SocialIcon icon={<Twitter size={20} />} />
              <SocialIcon icon={<Instagram size={20} />} />
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <MapPin size={20} className="flex-shrink-0 mt-1" />
                <span>Boulevard du 13 Janvier,<br />Kodjoviakopé, Lomé, Togo</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone size={20} className="flex-shrink-0" />
                <span>+228 90 00 00 00</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail size={20} className="flex-shrink-0" />
                <span>contact@cliniquebeta.tg</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Horaires</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex justify-between">
                <span>Lundi - Vendredi</span>
                <span>07:30 - 18:30</span>
              </li>
              <li className="flex justify-between">
                <span>Samedi</span>
                <span>08:00 - 13:00</span>
              </li>
              <li className="flex justify-between">
                <span>Urgences</span>
                <span className="text-primary-600 font-bold">24h/24 7j/7</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} CliniqueBeta Togo. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

const SocialIcon: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
  <a href="#" className="p-2 bg-white dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 shadow-sm transition-colors">
    {icon}
  </a>
);