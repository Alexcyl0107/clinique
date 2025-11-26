import React, { useEffect, useState } from 'react';
import { Doctor } from '../types';
import { DataService } from '../services/dataService';
import { Link } from 'react-router-dom';

export const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    DataService.getDoctors().then(setDoctors);
  }, []);

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">Nos Spécialistes</h2>
          <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
            Une équipe médicale mixte et expérimentée à votre service à Lomé.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700 flex flex-col">
              <img className="h-64 w-full object-cover object-top" src={doctor.image} alt={doctor.name} />
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{doctor.name}</h3>
                <p className="text-primary-600 dark:text-primary-400 mb-4 font-medium">{doctor.specialty}</p>
                
                <div className="mt-auto">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Disponibilités :</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {doctor.availability.map((day) => (
                      <span key={day} className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                        {day}
                      </span>
                    ))}
                  </div>
                  <Link 
                    to="/booking"
                    className="block w-full text-center px-4 py-2 border border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400 rounded hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Prendre RDV
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};