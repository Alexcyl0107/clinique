import React, { useState, useEffect } from 'react';
import { Doctor, Service } from '../types';
import { DataService } from '../services/dataService';
import { GeminiService } from '../services/geminiService';
import { User, Phone, FileText, Check, Stethoscope, AlertTriangle, Sparkles, Activity, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Booking: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  
  // AI Triage State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const { user } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    patientName: user?.name || '',
    patientEmail: user?.email || '',
    patientPhone: user?.phone || '',
    doctorId: '',
    serviceId: '',
    reason: ''
  });

  useEffect(() => {
    DataService.getDoctors().then(setDoctors);
    DataService.getServices().then(setServices);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'serviceId') {
         const service = services.find(s => s.id === value);
         setIsUrgent(value === 's6' || (service ? service.title.toLowerCase().includes('urgence') : false));
    }
  };

  const handleAiTriage = async () => {
      if (!formData.reason || formData.reason.length < 5) return;
      setIsAnalyzing(true);
      
      const triage = await GeminiService.analyzeTriage(formData.reason);
      
      setIsAnalyzing(false);
      setIsUrgent(triage.urgency);
      setAiAdvice(triage.advice);
      
      // Auto-select service if matched by name
      if (triage.service) {
          const matchedService = services.find(s => s.title.toLowerCase().includes(triage.service.toLowerCase()) || triage.service.toLowerCase().includes(s.title.toLowerCase()));
          if (matchedService) {
              setFormData(prev => ({ ...prev, serviceId: matchedService.id }));
          } else if (triage.urgency) {
              const urgencyService = services.find(s => s.title.toLowerCase().includes('urgence'));
              if (urgencyService) setFormData(prev => ({ ...prev, serviceId: urgencyService.id }));
          }
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await DataService.requestAppointment({
          ...formData,
          symptoms: formData.reason,
          patientId: user?.id
      });
      setSuccess(true);
    } catch (error) {
      console.error("Booking failed", error);
      alert("Une erreur est survenue lors de la demande.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Demande envoyée !</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Votre demande a bien été reçue. Un médecin ou administrateur va définir la date et l'heure exacte et vous serez notifié.
          </p>
          <button 
            onClick={() => { setSuccess(false); setFormData({...formData, reason: ''}); setIsUrgent(false); setAiAdvice(null); }}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Nouvelle demande
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className={`${isUrgent ? 'bg-red-600' : 'bg-primary-600'} px-8 py-6 transition-colors duration-300 flex justify-between items-center`}>
          <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Calendar className="h-8 w-8"/> Prise de Rendez-vous
              </h1>
              <p className="text-white/80 mt-2">Gestion intelligente des rendez-vous & Triage Automatique</p>
          </div>
          {isUrgent && <AlertTriangle className="text-white h-12 w-12 animate-pulse" />}
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* SYMPTOM INPUT FIRST FOR AI TRIAGE */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Décrivez vos symptômes / Raison</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                name="reason"
                required
                rows={4}
                value={formData.reason}
                onChange={handleChange}
                onBlur={handleAiTriage} // Trigger AI on blur
                className="pl-10 w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                placeholder="Ex: J'ai une forte fièvre depuis 2 jours et des difficultés respiratoires..."
              />
              <button 
                type="button"
                onClick={handleAiTriage}
                className="absolute right-2 bottom-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-200 transition-colors shadow-sm"
              >
                {isAnalyzing ? <Activity className="animate-spin h-3 w-3"/> : <Sparkles className="h-3 w-3"/>} 
                Analyser avec IA
              </button>
            </div>
            
            {/* AI FEEDBACK AREA */}
            {aiAdvice && (
                <div className={`p-4 rounded-lg flex gap-3 animate-fade-in ${isUrgent ? 'bg-red-50 dark:bg-red-900/20 border border-red-200' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200'}`}>
                    {isUrgent ? <AlertTriangle className="text-red-600 flex-shrink-0"/> : <Sparkles className="text-blue-600 flex-shrink-0" />}
                    <div>
                        <p className={`text-sm font-bold ${isUrgent ? 'text-red-800 dark:text-red-300' : 'text-blue-800 dark:text-blue-300'}`}>
                            {isUrgent ? 'TRIAGE : URGENCE DÉTECTÉE' : 'Analyse Gemini :'}
                        </p>
                        <p className={`text-sm ${isUrgent ? 'text-red-700 dark:text-red-200' : 'text-blue-700 dark:text-blue-200'}`}>
                            {aiAdvice}
                        </p>
                    </div>
                </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Info */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Votre Nom Complet</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="patientName"
                  required
                  value={formData.patientName}
                  onChange={handleChange}
                  className="pl-10 w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="patientPhone"
                  required
                  value={formData.patientPhone}
                  onChange={handleChange}
                  className="pl-10 w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Medical Info */}
             <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service suggéré</label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  name="serviceId"
                  required
                  value={formData.serviceId}
                  onChange={handleChange}
                  className="pl-10 w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                   <option value="">Sélectionnez un service</option>
                   {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Médecin (Optionnel)</label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">Peu importe (L'IA choisira le plus adapté)</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} - {d.specialty}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors ${
                  isUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Envoi...' : isUrgent ? 'CONFIRMER URGENCE' : 'Envoyer la demande'}
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">
                En soumettant ce formulaire, vous acceptez que l'IA analyse vos symptômes pour le triage.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};