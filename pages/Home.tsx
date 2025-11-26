import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Award, Shield } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white dark:bg-gray-900 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Excellence médicale</span>{' '}
                  <span className="block text-primary-600">au cœur de Lomé</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Bienvenue à la Clinique Espoir. Nous combinons expertise locale, technologies modernes et une équipe dévouée pour le bien-être de toutes les familles togolaises.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                  <div className="rounded-md shadow">
                    <Link
                      to="/booking"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-transform active:scale-95"
                    >
                      Prendre Rendez-vous
                    </Link>
                  </div>
                   <div className="rounded-md shadow">
                    <Link
                      to="/pharmacy"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10 dark:bg-gray-800 dark:text-primary-400 dark:hover:bg-gray-700"
                    >
                      Pharmacie
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          {/* Image contextuelle africaine */}
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1600&h=900"
            alt="Équipe médicale diversifiée"
          />
        </div>
      </section>

      {/* Features Grid - Why Choose Us */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Pourquoi nous choisir ?</h2>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">Des soins de qualité internationale à votre portée.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Clock className="h-8 w-8 text-primary-600" />}
              title="Urgences 24h/24"
              desc="Un service de garde disponible jour et nuit pour toutes vos urgences médicales."
            />
            <FeatureCard 
              icon={<Award className="h-8 w-8 text-primary-600" />}
              title="Spécialistes Reconnus"
              desc="Nos médecins sont diplômés des meilleures universités et expérimentés."
            />
            <FeatureCard 
              icon={<Shield className="h-8 w-8 text-primary-600" />}
              title="Plateau Technique"
              desc="Laboratoire d'analyse moderne et imagerie médicale sur place."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex items-start p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
    <div className="flex-shrink-0 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
      {icon}
    </div>
    <div className="ml-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-base text-gray-500 dark:text-gray-400">{desc}</p>
    </div>
  </div>
);