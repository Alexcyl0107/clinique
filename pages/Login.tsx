import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Cross, ShieldCheck, AlertTriangle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [refCode, setRefCode] = useState('');
  const [role, setRole] = useState<'PATIENT'|'STAFF'>('PATIENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic Validation
    if (role === 'STAFF' && !refCode) {
        setError("Le Code de Sécurité est obligatoire pour le personnel.");
        setLoading(false);
        return;
    }

    const success = await login(email, password, role === 'STAFF' ? refCode : undefined);
    
    if (success) {
      navigate('/');
    } else {
      setError('Identifiants incorrects ou Code de Sécurité non autorisé.');
    }
    setLoading(false);
  };

  // Raccourci Développeur Caché (Cycle entre les rôles)
  const fillDevCredentials = () => {
      setPassword('123456');
      
      if (email === 'moi@admin.com') {
          // Switch to Doctor
          setEmail('moi@doc.com');
          setRole('STAFF');
          setRefCode('MOI-DEV-KEY');
      } else if (email === 'moi@doc.com') {
          // Switch to Pharmacist
          setEmail('moi@pharma.com');
          setRole('STAFF');
          setRefCode('MOI-DEV-KEY');
      } else if (email === 'moi@pharma.com') {
          // Switch to Patient
          setEmail('moi@patient.com');
          setRole('PATIENT');
          setRefCode('');
      } else {
          // Default to Admin
          setEmail('moi@admin.com');
          setRole('STAFF');
          setRefCode('MOI-DEV-KEY');
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1576091160550-217358c7e618?auto=format&fit=crop&q=80&w=2000')"}}>
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-200 dark:border-gray-700 mx-4">
        
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center p-3 bg-primary-100 dark:bg-primary-900 rounded-full mb-4 cursor-pointer hover:scale-105 transition-transform select-none"
            onDoubleClick={fillDevCredentials}
            title="Double-clic pour changer de compte Test (Admin -> Doc -> Pharma -> Patient)"
          >
            <Cross className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Clinique<span className="text-primary-600">Beta</span>
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 italic">
            "Une équipe médicale mixte et expérimentée à votre service à Lomé"
          </p>
        </div>

        {/* Role Toggles */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
           <button 
             onClick={() => { setRole('PATIENT'); setError(''); }}
             className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${role === 'PATIENT' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Espace Patient
           </button>
           <button 
             onClick={() => { setRole('STAFF'); setError(''); }}
             className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${role === 'STAFF' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Personnel Médical
           </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="votre.email@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          {role === 'STAFF' && (
             <div className="animate-fade-in p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg">
                <label className="block text-sm font-bold text-red-800 dark:text-red-300 flex items-center gap-2 mb-2">
                   <ShieldCheck size={16}/> Code de Sécurité Professionnel
                </label>
                <input
                  type="password"
                  required
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value)}
                  placeholder="Code unique personnel"
                  className="block w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 dark:border-red-900 dark:text-white text-sm"
                />
                <p className="text-[10px] text-red-600 mt-2 flex items-start gap-1">
                    <AlertTriangle size={10} className="mt-0.5"/>
                    Accès strictement réservé. Toute tentative d'intrusion sera signalée.
                </p>
             </div>
          )}

          {error && (
              <div className="text-red-600 text-sm text-center font-bold bg-red-100 dark:bg-red-900/30 p-3 rounded-lg flex items-center justify-center gap-2 animate-pulse">
                  <Lock size={16}/> {error}
              </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white transition-colors ${role === 'STAFF' ? 'bg-red-700 hover:bg-red-800' : 'bg-primary-600 hover:bg-primary-700'}`}
          >
            {loading ? 'Connexion sécurisée...' : `Se Connecter (${role === 'STAFF' ? 'Staff' : 'Patient'})`}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Nouveau patient ?{' '}
            <Link to="/register" className="font-bold text-primary-600 hover:text-primary-500 underline">
              Créer un compte sécurisé
            </Link>
          </p>
        </div>
        
        <div className="mt-4 text-center">
             <p className="text-[10px] text-gray-400">Connexion sécurisée SSL/TLS. IP enregistrée.</p>
        </div>
      </div>
    </div>
  );
};