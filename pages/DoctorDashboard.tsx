
import React, { useEffect, useState } from 'react';
import { DataService } from '../services/dataService';
import { GeminiService } from '../services/geminiService';
import { Appointment, AppointmentStatus, CalendarEvent } from '../types';
import { Calendar as CalIcon, CheckCircle, Clock, User, AlertCircle, Siren, VolumeX, Plus, X, MapPin, Sparkles, FileText, BrainCircuit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useClinic } from '../context/ClinicContext';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isEmergencyRinging, stopRinging } = useClinic();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [planningId, setPlanningId] = useState<string | null>(null);
  const [planData, setPlanData] = useState({ date: '', time: '' });
  
  // AI Clinical Assistant
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiContextPatient, setAiContextPatient] = useState<Appointment | null>(null);
  const [aiOutput, setAiOutput] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Calendar State
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{day: string, time: string} | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const fetchData = async () => {
     if(user) {
         const allApps = await DataService.getAppointments();
         const docApps = allApps.filter(a => 
             a.status === AppointmentStatus.PENDING_DOCTOR || 
             a.doctorId === user.id || 
             (a.isEmergency && a.status !== AppointmentStatus.COMPLETED)
         );
         setAppointments(docApps);

         const calEvents = await DataService.getCalendarEvents(user.id);
         setEvents(calEvents);
     }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, [user]);

  const handlePlanSubmit = async () => {
     if (planningId && planData.date && planData.time) {
         await DataService.planAppointment(planningId, planData.date, planData.time);
         setPlanningId(null);
         fetchData();
         alert("RDV planifié ! En attente de validation Admin.");
     }
  };

  const handleTakeCharge = async (id: string) => {
      stopRinging();
      await DataService.acknowledgeEmergency(id);
      setPlanningId(id);
      fetchData();
  };

  // --- AI ACTIONS ---
  const handleAiAction = async (action: 'REPORT' | 'DIAGNOSTIC' | 'OPTIMIZE') => {
      setLoadingAi(true);
      if (action === 'REPORT' && aiContextPatient) {
          const res = await GeminiService.generateMedicalReport(aiContextPatient.symptoms, `${aiContextPatient.patientName}, ${aiContextPatient.patientPhone}`);
          setAiOutput(res);
      } else if (action === 'DIAGNOSTIC' && aiContextPatient) {
          const res = await GeminiService.chat(user!, `Suggère un diagnostic différentiel pour : ${aiContextPatient.symptoms}`, "", "/doctor-dashboard");
          setAiOutput(res);
      } else if (action === 'OPTIMIZE') {
          const res = await GeminiService.optimizeSchedule(appointments);
          setAiOutput(res);
      }
      setLoadingAi(false);
  };

  // --- CALENDAR HELPERS ---
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const hours = Array.from({length: 12}, (_, i) => i + 7); // 7h to 18h

  const getEventForSlot = (day: string, hour: number) => {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      return events.find(e => e.day === day && e.startTime.startsWith(hour.toString().padStart(2, '0')));
  };

  const handleSlotClick = (day: string, hour: number) => {
      const existing = getEventForSlot(day, hour);
      if (existing) {
          setSelectedEvent(existing);
      } else {
          setSelectedSlot({ day, time: `${hour.toString().padStart(2, '0')}:00` });
          setShowEventModal(true);
      }
  };

  const handleSaveEvent = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // Mock saving event logic
      setShowEventModal(false);
      fetchData();
  };

  const handleDeleteEvent = async (id: string) => {
      if(confirm('Supprimer cet événement ?')) {
          await DataService.deleteCalendarEvent(id);
          setSelectedEvent(null);
          fetchData();
      }
  }

  const pendingApps = appointments.filter(a => a.status === AppointmentStatus.PENDING_DOCTOR);

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                <User className="text-primary-600"/> Planning & Consultations
            </h1>
            <button 
                onClick={() => { setAiOutput(''); setAiContextPatient(null); setShowAiModal(true); handleAiAction('OPTIMIZE'); }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 shadow-sm"
            >
                <BrainCircuit size={18}/> Optimiser Planning (IA)
            </button>
        </div>

        {/* URGENCY SECTION */}
        {appointments.some(a => a.isEmergency && !a.isAcknowledged) && (
             <div className="bg-red-600 text-white border-l-8 border-white p-6 rounded shadow-xl animate-pulse">
                 <h2 className="font-bold flex items-center gap-2 mb-2 text-2xl">
                     <Siren className="animate-spin" size={32}/> ALERTE CODE BLUE - INTERVENTION REQUISE
                 </h2>
                 <p className="mb-4">Un patient nécessite une prise en charge immédiate. Cliquez ci-dessous pour acquitter l'alarme.</p>
                 <div className="space-y-2">
                     {appointments.filter(a => a.isEmergency && !a.isAcknowledged).map(app => (
                         <div key={app.id} className="bg-white text-black p-4 rounded flex justify-between items-center shadow-lg">
                             <div>
                                 <span className="font-bold text-red-600 text-lg">PATIENT: {app.patientName}</span>
                                 <p className="text-sm font-bold">{app.symptoms}</p>
                             </div>
                             <button 
                                onClick={() => handleTakeCharge(app.id)} 
                                className="bg-red-600 text-white px-6 py-3 rounded font-bold text-lg hover:bg-red-700 flex items-center gap-2 shadow-lg"
                             >
                                <VolumeX size={24}/> PRENDRE EN CHARGE
                             </button>
                         </div>
                     ))}
                 </div>
             </div>
        )}

        {/* WEEKLY CALENDAR */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
             <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                 <h2 className="font-bold text-lg dark:text-white flex items-center gap-2"><CalIcon/> Planning Hebdomadaire</h2>
                 <div className="flex gap-2 text-xs">
                     <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 rounded"></div> Consult</span>
                     <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 rounded"></div> Urgence</span>
                 </div>
             </div>
             
             <div className="overflow-x-auto">
                 <div className="min-w-[800px] grid grid-cols-7 border-b dark:border-gray-700">
                     <div className="p-2 border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-center font-bold text-gray-500 text-sm">Heure</div>
                     {days.map(d => (
                         <div key={d} className="p-2 border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-center font-bold dark:text-white text-sm">{d}</div>
                     ))}
                 </div>
                 {hours.map(hour => (
                     <div key={hour} className="min-w-[800px] grid grid-cols-7 border-b dark:border-gray-700">
                         <div className="p-2 border-r dark:border-gray-700 text-center text-xs text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                             {hour}:00
                         </div>
                         {days.map(day => {
                             const event = getEventForSlot(day, hour);
                             let bgClass = "hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer";
                             if(event) {
                                 switch(event.type) {
                                     case 'URGENCY': bgClass = "bg-red-100 dark:bg-red-900/40 border-l-4 border-red-500 animate-pulse"; break;
                                     case 'HOME_VISIT': bgClass = "bg-green-100 dark:bg-green-900/40 border-l-4 border-green-500"; break;
                                     case 'MEETING': bgClass = "bg-purple-100 dark:bg-purple-900/40 border-l-4 border-purple-500"; break;
                                     case 'ABSENCE': bgClass = "bg-gray-100 dark:bg-gray-800 border-l-4 border-gray-400 opacity-70"; break;
                                     default: bgClass = "bg-blue-100 dark:bg-blue-900/40 border-l-4 border-blue-500"; break;
                                 }
                             }

                             return (
                                 <div 
                                    key={day} 
                                    onClick={() => handleSlotClick(day, hour)}
                                    className={`p-1 border-r dark:border-gray-700 h-20 transition-colors relative ${bgClass}`}
                                 >
                                     {event && (
                                         <div className="p-1 h-full overflow-hidden">
                                             <p className="font-bold text-xs truncate dark:text-white">{event.title}</p>
                                             <p className="text-[10px] text-gray-600 dark:text-gray-300 truncate">{event.patientName}</p>
                                             {event.type === 'HOME_VISIT' && <MapPin size={10} className="absolute bottom-1 right-1 text-green-600"/>}
                                         </div>
                                     )}
                                 </div>
                             );
                         })}
                     </div>
                 ))}
             </div>
        </div>

        {/* PENDING REQUESTS */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                    <Clock className="text-yellow-500"/> Demandes de RDV ({pendingApps.length})
                </h2>
                <p className="text-sm text-gray-500">Assignez une date et une heure aux patients.</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingApps.length === 0 && <p className="text-gray-500 text-sm">Aucune demande en attente.</p>}
                {pendingApps.map(app => (
                    <div key={app.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow relative">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold dark:text-white">{app.patientName}</span>
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{app.patientPhone}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-gray-900 p-2 rounded italic">"{app.symptoms}"</p>
                        
                        {/* AI ASSIST BUTTON */}
                        <div className="flex gap-2 mb-3">
                             <button 
                                onClick={() => { setAiContextPatient(app); setShowAiModal(true); setAiOutput(''); handleAiAction('DIAGNOSTIC'); }}
                                className="flex-1 text-xs bg-purple-50 text-purple-600 border border-purple-200 rounded py-1 hover:bg-purple-100 flex items-center justify-center gap-1"
                             >
                                 <BrainCircuit size={12}/> Aide Diag
                             </button>
                             <button 
                                onClick={() => { setAiContextPatient(app); setShowAiModal(true); setAiOutput(''); handleAiAction('REPORT'); }}
                                className="flex-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded py-1 hover:bg-blue-100 flex items-center justify-center gap-1"
                             >
                                 <FileText size={12}/> Rapport
                             </button>
                        </div>

                        {planningId === app.id ? (
                            <div className="space-y-2 mt-2 bg-blue-50 dark:bg-gray-700 p-2 rounded">
                                <label className="text-xs font-bold block">Date proposée</label>
                                <input type="date" className="w-full text-sm border rounded p-1" onChange={e => setPlanData({...planData, date: e.target.value})}/>
                                <label className="text-xs font-bold block">Heure</label>
                                <input type="time" className="w-full text-sm border rounded p-1" onChange={e => setPlanData({...planData, time: e.target.value})}/>
                                <div className="flex gap-2 mt-2">
                                    <button onClick={handlePlanSubmit} className="flex-1 bg-green-600 text-white text-xs py-1 rounded">Valider</button>
                                    <button onClick={() => setPlanningId(null)} className="flex-1 bg-gray-300 text-gray-800 text-xs py-1 rounded">Annuler</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setPlanningId(app.id)} className="w-full bg-primary-600 text-white py-2 rounded text-sm hover:bg-primary-700">
                                Planifier
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* --- AI MODAL --- */}
        {showAiModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl p-6 relative">
                    <button onClick={() => setShowAiModal(false)} className="absolute top-4 right-4"><X/></button>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-100 rounded-full text-purple-600"><Sparkles size={24}/></div>
                        <div>
                            <h3 className="text-xl font-bold dark:text-white">Assistant Clinique IA</h3>
                            <p className="text-sm text-gray-500">
                                {aiContextPatient ? `Patient: ${aiContextPatient.patientName}` : 'Optimisation Globale'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-[200px] border border-gray-200 dark:border-gray-700">
                         {loadingAi ? (
                             <div className="flex items-center justify-center h-full gap-2 text-gray-500">
                                 <Sparkles className="animate-spin"/> Analyse Gemini en cours...
                             </div>
                         ) : (
                             <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                                 {aiOutput || "Sélectionnez une action..."}
                             </div>
                         )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setShowAiModal(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">Fermer</button>
                        <button className="px-4 py-2 bg-primary-600 text-white rounded flex items-center gap-2"><CheckCircle size={16}/> Copier le résultat</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- EVENT MODAL --- */}
        {showEventModal && selectedSlot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
                    <h3 className="text-lg font-bold mb-4 dark:text-white">Ajouter au planning : {selectedSlot.day} {selectedSlot.time}</h3>
                    <form onSubmit={handleSaveEvent} className="space-y-4">
                        <input type="text" name="title" placeholder="Titre (ex: Consultation Mme X)" className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white" required/>
                        <select name="type" className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white">
                            <option value="CONSULTATION">Consultation</option>
                            <option value="URGENCY">Urgence</option>
                            <option value="HOME_VISIT">Visite à Domicile</option>
                        </select>
                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={() => setShowEventModal(false)} className="px-4 py-2 border rounded">Annuler</button>
                            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Enregistrer</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};
