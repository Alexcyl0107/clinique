import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

export const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    weight: '',
    height: '',
    bloodGroup: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.');
      setLoading(false);
      return;
    }

    const success = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      height: Number(formData.height),
      weight: Number(formData.weight),
      bloodGroup: formData.bloodGroup
    });

    if (success) {
      navigate('/');
    } else {
      setError("Erreur lors de l'inscription. Réessayez.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl">
        <div className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Créer un compte Patient</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Rejoignez CliniqueBeta pour gérer votre santé.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom Complet</label>
              <input name="name" type="text" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
              <input name="password" type="password" required value={formData.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div className="border-t pt-4 border-gray-200 dark:border-gray-700">
               <h3 className="text-sm font-bold text-gray-500 mb-2">Informations Médicales (Optionnel)</h3>
               <div className="grid grid-cols-3 gap-2">
                 <div>
                    <label className="text-xs">Poids (kg)</label>
                    <input name="weight" type="number" value={formData.weight} onChange={handleChange} className="w-full border rounded p-1 dark:bg-gray-700" />
                 </div>
                 <div>
                    <label className="text-xs">Taille (cm)</label>
                    <input name="height" type="number" value={formData.height} onChange={handleChange} className="w-full border rounded p-1 dark:bg-gray-700" />
                 </div>
                 <div>
                    <label className="text-xs">Groupe Sanguin</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full border rounded p-1 dark:bg-gray-700 dark:text-white">
                      <option value="">-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                 </div>
               </div>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
            {loading ? 'Création...' : "S'inscrire"}
          </button>
        </form>
        
        <div className="text-center">
           <Link to="/login" className="text-primary-600 hover:text-primary-500 text-sm">Déjà un compte ? Se connecter</Link>
        </div>
      </div>
    </div>
  );
};