import React, { useEffect, useState } from 'react';
import { Service } from '../types';
import { DataService } from '../services/dataService';
import { CheckCircle, ArrowRight, Ambulance, Stethoscope, Heart, Baby, Microscope, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    DataService.getServices().then(setServices);
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Ambulance': return <Ambulance />;
      case 'Stethoscope': return <Stethoscope />;
      case 'Heart': return <Heart />;
      case 'Baby': return <Baby />;
      case 'Microscope': return <Microscope />;
      case 'Activity': return <Activity />;
      default: return <CheckCircle />;
    }
  };

  return (
    <div className="py-12 bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">Nos Services Médicaux</h2>
          <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
            Un plateau technique complet pour votre santé.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.id} className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center mb-6 text-primary-600 dark:text-primary-400">
                 {getIcon(service.iconName)}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{service.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{service.description}</p>
              
              <Link to="/booking" className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700">
                Prendre rendez-vous <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};