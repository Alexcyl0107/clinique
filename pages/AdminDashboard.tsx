import React, { useEffect, useState } from 'react';
import { DataService } from '../services/dataService';
import { Appointment, DashboardStats, AppointmentStatus, Doctor, DutyPharmacy } from '../types';
import { Calendar, Users, CheckCircle, Clock, Trash2, XCircle, Check, Pill, Settings, UserPlus, Save, Siren, ShieldCheck, MapPin, Phone, User, Clipboard } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings' | 'validations' | 'duty'>('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [dutyPharmacies, setDutyPharmacies] = useState<DutyPharmacy[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Context
  const { config, updateConfig, isEmergencyRinging, stopRinging } = useClinic();

  // Settings State
  const [configForm, setConfigForm] = useState(config);
  // Doctor Form State
  const [newDoc, setNewDoc] = useState<Partial<Doctor>>({});
  // Duty Pharma Form
  const [newPharma, setNewPharma] = useState<Partial<DutyPharmacy>>({});

  const fetchData = async () => {
    // Keep loading silent if just refreshing after action
    try {
      const [apps, statistics, docList, dutyList] = await Promise.all([
        DataService.getAppointments(),
        DataService.getStats(),
        DataService.getDoctors(),
        DataService.getDutyPharmacies()
      ]);
      setAppointments(apps);
      setStats(statistics);
      setDoctors(docList);
      setDutyPharmacies(dutyList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll for alerts
    return () => clearInterval(interval);
  }, []);

  const handleValidate = async (id: string) => {
      await DataService.validateAppointment(id);
      fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce RDV ?')) {
      await DataService.deleteAppointment(id);
      fetchData();
    }
  };

  // --- ACTIONS ---
  const handleAddDoctor = async () => {
      if(newDoc.name && newDoc.specialty) {
          await DataService.saveDoctor({
              ...newDoc,
              id: '',
              availability: ['Lundi', 'Mardi'],
              image: 'https://ui-avatars.com/api/?name=' + newDoc.name
          } as Doctor);
          setNewDoc({});
          fetchData();
      }
  };
  
  const handleDeleteDoctor = async (id:string) => {
      if (isDeleting) return;
      if(confirm('Supprimer ce médecin définitivement ?')) {
          setIsDeleting(true);
          await DataService.deleteDoctor(id);
          setIsDeleting(false);
          // Manually update local state for instant feedback then fetch
          setDoctors(prev => prev.filter(d => d.id !== id));
          fetchData();
      }
  };

  const handleSaveConfig = () => {
      updateConfig(configForm);
      alert("Configuration mise à jour !");
  };

  const handleAddDutyPharma = async () => {
      if(newPharma.name) {
          await DataService.saveDutyPharmacy({
              ...newPharma,
              id: '',
              isOpen: true
          } as DutyPharmacy);
          setNewPharma({});
          fetchData();
      }
  };

  const handleDeleteDutyPharma = async (id:string) => {
      await DataService.deleteDutyPharmacy(id);
      fetchData();
  }

  if (loading && !stats) return <div className="p-8 text-center dark:text-white animate-pulse">Chargement des données...</div>;

  const pendingValidationApps = appointments.filter(a => a.status === AppointmentStatus.PENDING_ADMIN);
  const emergencies = appointments.filter(a => a.isEmergency && a.status !== AppointmentStatus.COMPLETED);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER WITH ALERTS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
           {isEmergencyRinging && (
               <div className="w-full bg-red-600 text-white p-4 rounded-xl shadow-lg animate-pulse-fast flex items-center justify-between">
                   <div className="flex items-center gap-2 font-bold">
                       <Siren size={24}/>
                       <span>{emergencies.length} URGENCE(S) EN COURS - CODE BLUE</span>
                   </div>
                   <button onClick={stopRinging} className="bg-white text-red-600 px-3 py-1 rounded text-sm font-bold shadow hover:bg-red-50">Arrêter Sonnerie</button>
               </div>
           )}
      </div>

      {/* Header Tabs (Scrollable on mobile) */}
      <div className="bg-white dark:bg-gray-800 p-2 md:p-4 rounded-xl shadow-sm flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide">
        <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="Vue d'ensemble" />
        <TabButton 
            active={activeTab === 'validations'} 
            onClick={() => setActiveTab('validations')} 
            label="Validations" 
            badge={pendingValidationApps.length}
        />
        <TabButton active={activeTab === 'duty'} onClick={() => setActiveTab('duty')} label="Pharmacies Garde" />
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Paramètres" />
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-slide-up">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatCard title="Total RDV" value={stats?.totalAppointments || 0} icon={<Calendar className="text-blue-500" />} />
            <StatCard title="À Valider" value={pendingValidationApps.length} icon={<ShieldCheck className="text-orange-500" />} />
            <StatCard title="Confirmés" value={stats?.confirmedAppointments || 0} icon={<CheckCircle className="text-green-500" />} />
            <StatCard title="Urgences" value={stats?.emergencyCount || 0} icon={<Siren className="text-red-500" />} />
          </div>

          {/* Doctors Management Section (Grid Layout) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300">
               <h2 className="text-lg font-bold mb-4 dark:text-white flex gap-2"><Users size={20}/> Gestion des Médecins</h2>
               
               {/* Add Doctor Form */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                  <input 
                    type="text" 
                    placeholder="Nom Complet (Ex: Dr. Mensah)" 
                    className="border p-2 rounded dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:ring-2 focus:ring-primary-500" 
                    onChange={e => setNewDoc({...newDoc, name: e.target.value})} 
                    value={newDoc.name || ''} 
                  />
                  <input 
                    type="text" 
                    placeholder="Spécialité (Ex: Pédiatrie)" 
                    className="border p-2 rounded dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:ring-2 focus:ring-primary-500" 
                    onChange={e => setNewDoc({...newDoc, specialty: e.target.value})} 
                    value={newDoc.specialty || ''}
                  />
                  <div className="col-span-1 md:col-span-2 flex gap-2">
                       <button onClick={handleAddDoctor} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 flex-1 flex items-center justify-center gap-2 font-medium shadow-sm transition-transform active:scale-95">
                           <UserPlus size={16}/> Ajouter Médecin
                       </button>
                  </div>
               </div>

               {/* Doctors List */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {doctors.map(doc => (
                        <div key={doc.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-center gap-4 border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-primary-200 transition-all group">
                            <img src={doc.image} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-primary-100 dark:border-gray-600" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm dark:text-white truncate">{doc.name}</h4>
                                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium truncate">{doc.specialty}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{doc.availability.length} jours/sem</p>
                            </div>
                            <button 
                                onClick={() => handleDeleteDoctor(doc.id)} 
                                disabled={isDeleting}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                title="Supprimer"
                            >
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    ))}
                    {doctors.length === 0 && <p className="col-span-3 text-center text-gray-400 py-4">Aucun médecin enregistré.</p>}
               </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Derniers Rendez-vous</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date/Heure</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {appointments.slice(0, 5).map((app) => (
                    <tr key={app.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${app.isEmergency ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            {app.isEmergency && <Siren size={16} className="text-red-500 animate-pulse"/>}
                            {app.patientName}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{app.symptoms}</div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                             app.status === AppointmentStatus.SCHEDULED ? 'bg-green-100 text-green-800' :
                             app.status === AppointmentStatus.PENDING_DOCTOR ? 'bg-yellow-100 text-yellow-800' :
                             app.status === AppointmentStatus.PENDING_ADMIN ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                         }`}>
                             {app.status === AppointmentStatus.PENDING_DOCTOR ? 'Attente Méd.' :
                              app.status === AppointmentStatus.PENDING_ADMIN ? 'Attente Valid.' : 
                              app.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {app.date ? `${app.date} à ${app.time}` : <span className="text-gray-400 italic">Non défini</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(app.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-colors"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {appointments.length === 0 && <div className="p-4 text-center text-gray-500">Aucun rendez-vous.</div>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'validations' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-slide-in-right">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white"><ShieldCheck/> Rendez-vous à Valider</h3>
              {pendingValidationApps.length === 0 && (
                  <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <CheckCircle className="mx-auto h-10 w-10 text-green-400 mb-2"/>
                      <p className="text-gray-500">Tout est à jour ! Aucun rendez-vous en attente.</p>
                  </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingValidationApps.map(app => (
                      <div key={app.id} className="border border-blue-200 bg-blue-50 dark:bg-gray-700 dark:border-gray-600 p-4 rounded-xl flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between font-bold dark:text-white items-center">
                              <span className="flex items-center gap-2"><User size={16}/> {app.patientName}</span>
                              <span className="text-blue-600 text-xs bg-white px-2 py-1 rounded border border-blue-100">{app.time}</span>
                          </div>
                          <div className="text-sm bg-white dark:bg-gray-600 p-2 rounded text-gray-600 dark:text-gray-200">
                             <span className="font-bold text-xs block text-gray-400 uppercase">Symptômes</span>
                             {app.symptoms}
                          </div>
                          <div className="text-sm">
                             <span className="font-bold text-xs block text-gray-400 uppercase">Date Proposée</span>
                             <span className="font-medium dark:text-white">{app.date}</span>
                          </div>
                          <div className="mt-3 flex gap-2">
                              <button onClick={() => handleValidate(app.id)} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex justify-center items-center gap-2 font-bold text-sm transition-colors">
                                  <CheckCircle size={16}/> Valider
                              </button>
                              <button onClick={() => handleDelete(app.id)} className="px-3 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                                  <XCircle size={18}/>
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {activeTab === 'duty' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-slide-in-right">
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white"><Pill/> Gestion Pharmacies de Garde</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <input type="text" placeholder="Nom Pharmacie" className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={newPharma.name || ''} onChange={e => setNewPharma({...newPharma, name: e.target.value})} />
                  <input type="text" placeholder="Quartier / Adresse" className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={newPharma.location || ''} onChange={e => setNewPharma({...newPharma, location: e.target.value})} />
                  <input type="text" placeholder="Téléphone" className="border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={newPharma.phone || ''} onChange={e => setNewPharma({...newPharma, phone: e.target.value})} />
                  <button onClick={handleAddDutyPharma} className="bg-primary-600 text-white rounded hover:bg-primary-700 font-medium">Ajouter</button>
               </div>

               <div className="space-y-3">
                   {dutyPharmacies.map(pharma => (
                       <div key={pharma.id} className="flex justify-between items-center bg-white dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                           <div className="flex items-start gap-3">
                               <div className="bg-green-100 p-2 rounded-full text-green-600"><Pill size={18}/></div>
                               <div>
                                   <p className="font-bold dark:text-white text-lg">{pharma.name}</p>
                                   <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                       <span className="flex items-center gap-1"><MapPin size={14}/> {pharma.location}</span>
                                       <span className="flex items-center gap-1"><Phone size={14}/> {pharma.phone}</span>
                                   </div>
                               </div>
                           </div>
                           <button onClick={() => handleDeleteDutyPharma(pharma.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"><Trash2 size={18}/></button>
                       </div>
                   ))}
                   {dutyPharmacies.length === 0 && <p className="text-center text-gray-400 italic">Aucune pharmacie de garde enregistrée.</p>}
               </div>
          </div>
      )}

      {activeTab === 'settings' && (
         <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm animate-slide-in-right">
             <h3 className="text-xl font-bold mb-6 dark:text-white flex gap-2"><Settings/> Configuration Globale</h3>
             <div className="space-y-4 max-w-lg">
                <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nom de la clinique</label>
                   <input type="text" value={configForm.name} onChange={e => setConfigForm({...configForm, name: e.target.value})} className="w-full border p-2 rounded bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Slogan</label>
                   <input type="text" value={configForm.slogan} onChange={e => setConfigForm({...configForm, slogan: e.target.value})} className="w-full border p-2 rounded bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Téléphone Contact</label>
                   <input type="text" value={configForm.phone} onChange={e => setConfigForm({...configForm, phone: e.target.value})} className="w-full border p-2 rounded bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Code Sécurité Admin</label>
                   <div className="flex gap-2">
                       <input type="text" value="ADMIN-SECURE-2025" disabled className="w-full border p-2 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-400 font-mono" />
                       <button className="bg-gray-200 px-3 rounded hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500" title="Copier"><Clipboard size={16}/></button>
                   </div>
                </div>
                <div className="pt-4">
                    <button onClick={handleSaveConfig} className="bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 flex items-center gap-2 shadow-lg transition-transform active:scale-95">
                        <Save size={18} /> Enregistrer les changements
                    </button>
                </div>
             </div>
         </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; badge?: number }> = ({ active, onClick, label, badge }) => (
  <button 
    onClick={onClick}
    className={`relative px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
        active 
        ? 'bg-primary-600 text-white shadow-md transform scale-105' 
        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
    }`}
  >
    {label}
    {badge ? <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">{badge}</span> : null}
  </button>
);

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
    </div>
    <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-700/50 shadow-inner">
      {icon}
    </div>
  </div>
);