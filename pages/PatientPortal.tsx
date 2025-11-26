import React, { useEffect, useState } from 'react';
import { DataService } from '../services/dataService';
import { Appointment, Prescription, LabResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { Calendar, FileText, Activity, Clock, Download, Upload, ScanLine, Loader, Plus, User, Edit2, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PatientPortal: React.FC = () => {
  const { user, updateUserSession } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Profile Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ height: 0, weight: 0, bloodGroup: '' });
  
  // OCR State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string[] | null>(null);

  useEffect(() => {
    if (user) {
      setEditForm({ 
          height: user.height || 0, 
          weight: user.weight || 0, 
          bloodGroup: user.bloodGroup || '' 
      });

      Promise.all([
        DataService.getAppointmentsByPatient(user.id),
        DataService.getPrescriptions(user.id),
        DataService.getLabResults(user.id)
      ]).then(([apps, prescs, labs]) => {
        setAppointments(apps);
        setPrescriptions(prescs);
        setLabResults(labs);
        setLoading(false);
      });
    }
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAnalyzing(true);
      setAnalysisResult(null);
      const meds = await DataService.analyzePrescription(e.target.files[0]);
      setAnalysisResult(meds);
      setAnalyzing(false);
    }
  };

  const handleSaveProfile = async () => {
     if(user) {
         await DataService.updateUserProfile(user.id, editForm);
         updateUserSession(editForm);
         setIsEditing(false);
     }
  };

  const handleDownload = (type: string, id: string) => {
      DataService.downloadFile(
          `${type}_${id}.pdf`, 
          `CLINIQUE BETA - DOCUMENT OFFICIEL\n\nType: ${type}\nID: ${id}\nDate: ${new Date().toLocaleDateString()}\nPatient: ${user?.name}`
      );
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
         <div className="flex justify-between items-start mb-4">
             <h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><User/> Mon Profil Médical</h2>
             <button onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} className="text-primary-600 hover:bg-primary-50 p-2 rounded">
                {isEditing ? <Save size={20}/> : <Edit2 size={20}/>}
             </button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">Poids (kg)</p>
                {isEditing ? (
                    <input type="number" value={editForm.weight} onChange={e => setEditForm({...editForm, weight: Number(e.target.value)})} className="w-full mt-1 border rounded p-1" />
                ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{user?.weight || '-'} kg</p>
                )}
             </div>
             <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase">Taille (cm)</p>
                {isEditing ? (
                    <input type="number" value={editForm.height} onChange={e => setEditForm({...editForm, height: Number(e.target.value)})} className="w-full mt-1 border rounded p-1" />
                ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{user?.height || '-'} cm</p>
                )}
             </div>
             <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase">Groupe Sanguin</p>
                {isEditing ? (
                    <input type="text" value={editForm.bloodGroup} onChange={e => setEditForm({...editForm, bloodGroup: e.target.value})} className="w-full mt-1 border rounded p-1" />
                ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{user?.bloodGroup || '-'}</p>
                )}
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* OCR Section */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-primary-100 dark:border-primary-900/30">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
            <ScanLine className="text-primary-600"/> Nouvelle Ordonnance
          </h3>
          <div className="flex flex-col md:flex-row gap-6 items-center">
             <div className="flex-1 w-full">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-primary-300 border-dashed rounded-lg cursor-pointer bg-primary-50 dark:bg-gray-700/50 hover:bg-primary-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-primary-500" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Scanner une ordonnance</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
                </label>
             </div>
             
             {analyzing && (
               <div className="flex items-center gap-3 text-primary-600 animate-pulse">
                 <Loader className="animate-spin" /> Analyse intelligente...
               </div>
             )}

             {analysisResult && (
               <div className="flex-1 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 w-full">
                 <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">Détecté :</h4>
                 <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mb-3">
                   {analysisResult.map((m, i) => <li key={i}>{m}</li>)}
                 </ul>
                 <Link to="/pharmacy" className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                   <Plus size={16} /> Acheter
                 </Link>
               </div>
             )}
          </div>
        </div>

        {/* Appointments Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="text-blue-500" /> Mes RDV
            </h3>
            <Link to="/booking" className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">Nouveau</Link>
          </div>
          <div className="space-y-3">
            {appointments.map(app => (
              <div key={app.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between">
                   <span className="font-bold text-sm dark:text-white">{app.status === 'SCHEDULED' ? `${app.date} à ${app.time}` : 'En attente de date'}</span>
                   <span className="text-xs px-2 py-0.5 rounded bg-white">{app.status}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{app.symptoms}</p>
              </div>
            ))}
            {appointments.length === 0 && <p className="text-sm text-gray-500">Aucun rendez-vous.</p>}
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
           <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="text-purple-500" /> Ordonnances
           </h3>
           <div className="space-y-3">
             {prescriptions.map(pres => (
              <div key={pres.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{pres.date}</p>
                  <p className="text-xs text-gray-500">{pres.medications.length} médicaments</p>
                </div>
                <button onClick={() => handleDownload('ORDONNANCE', pres.id)} className="text-primary-600 hover:text-primary-700 p-2 bg-white rounded shadow-sm"><Download size={16}/></button>
              </div>
            ))}
            {prescriptions.length === 0 && <p className="text-sm text-gray-500">Aucune ordonnance.</p>}
          </div>
        </div>

        {/* Lab Results */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
           <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="text-red-500" /> Résultats
           </h3>
           <div className="space-y-3">
            {labResults.map(lab => (
               <div key={lab.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="truncate pr-2">
                  <p className="font-medium text-gray-900 dark:text-white truncate" title={lab.testName}>{lab.testName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{lab.date}</p>
                </div>
                {lab.status === 'AVAILABLE' ? (
                  <button onClick={() => handleDownload('RESULTAT_LABO', lab.id)} className="flex-shrink-0 text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700 flex gap-1">
                    <Download size={12}/> PDF
                  </button>
                ) : (
                  <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">En cours</span>
                )}
              </div>
            ))}
             {labResults.length === 0 && <p className="text-sm text-gray-500">Aucun résultat.</p>}
          </div>
        </div>

      </div>
    </div>
  );
};