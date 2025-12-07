import { Appointment, AppointmentStatus, Doctor, Service, DashboardStats, PharmacyProduct, User, Prescription, LabResult, PharmacyOrder, PharmacySaleItem, ClinicConfig, DutyPharmacy, CalendarEvent } from '../types';

// --- CONFIGURATION API ---
// L'URL de votre backend déployé sur Render (à changer une fois déployé)
// Pour le développement local : 'http://localhost:5000/api'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// --- SECURITY CODES (Fallback Local) ---
const SECURITY_CODES = {
  ADMIN: 'ADMIN-SECURE-2025',
  DOCTOR: 'DOC-MED-2025',
  PHARMACIST: 'PHARMA-STOCK-2025',
  DEV: 'MOI-DEV-KEY'
};

// --- MOCK DATA (FALLBACK) ---
// Ces données sont utilisées si le Backend n'est pas accessible.
const MOCK_CONFIG: ClinicConfig = {
  name: 'CliniqueBeta',
  slogan: 'Une équipe médicale mixte et expérimentée à votre service.',
  phone: '+228 90 00 00 00',
  address: 'Boulevard du 13 Janvier, Lomé',
  logoUrl: ''
};

// Helper pour gérer les appels API avec Fallback sur Mock
async function fetchApi<T>(endpoint: string, options: RequestInit = {}, fallbackData?: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    console.warn(`API ${endpoint} non accessible. Utilisation données locales/mock.`, err);
    if (fallbackData !== undefined) return fallbackData;
    throw err;
  }
}

// Helper pour simuler un délai (pour le mock)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- SERVICE ---
export const DataService = {
  
  // --- CONFIGURATION ---
  getConfig: async (): Promise<ClinicConfig> => {
    return fetchApi('/config', {}, MOCK_CONFIG);
  },
  
  saveConfig: async (config: ClinicConfig) => {
    return fetchApi('/config', { method: 'POST', body: JSON.stringify(config) }, config);
  },

  getDutyPharmacies: async (): Promise<DutyPharmacy[]> => {
    return fetchApi('/pharmacies/duty', {}, []);
  },

  saveDutyPharmacy: async (pharma: DutyPharmacy) => {
    return fetchApi('/pharmacies/duty', { method: 'POST', body: JSON.stringify(pharma) }, pharma);
  },

  deleteDutyPharmacy: async (id: string) => {
    return fetchApi(`/pharmacies/duty/${id}`, { method: 'DELETE' }, true);
  },

  // --- AUTHENTIFICATION ---
  login: async (email: string, pass: string, refCode?: string): Promise<User | null> => {
    try {
      // Tentative connexion API Réelle
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, refCode })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline, tentative login local (Dev Only)");
    }

    // FALLBACK LOCAL (POUR TESTS SANS BACKEND)
    if (pass === '123456') {
      if (email.includes('admin')) return { id: 'u1', name: 'Admin Local', email, role: 'ADMIN', referenceCode: SECURITY_CODES.ADMIN };
      if (email.includes('doc')) return { id: 'u2', name: 'Dr. Local', email, role: 'DOCTOR', referenceCode: SECURITY_CODES.DOCTOR };
      if (email.includes('pharma')) return { id: 'u3', name: 'Pharma Local', email, role: 'PHARMACIST', referenceCode: SECURITY_CODES.PHARMACIST };
      if (email.includes('patient')) return { id: 'u4', name: 'Patient Local', email, role: 'PATIENT' };
    }
    return null;
  },

  register: async (userData: any): Promise<User> => {
    try {
       const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if(res.ok) return await res.json();
    } catch(e) {}

    // Fallback Mock
    return { id: Math.random().toString(), role: 'PATIENT', ...userData };
  },

  updateUserProfile: async (userId: string, data: Partial<User>) => {
    return fetchApi(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) }, data);
  },

  // --- DOCTEURS & PLANNING ---
  getDoctors: async (): Promise<Doctor[]> => { 
    return fetchApi('/doctors', {}, [
      { id: 'd1', name: 'Dr. Koffi Mensah', specialty: 'Généraliste', image: 'https://ui-avatars.com/api/?name=Koffi', availability: ['Lundi'] }
    ]); 
  },

  saveDoctor: async (doctor: Doctor) => {
    return fetchApi('/doctors', { method: 'POST', body: JSON.stringify(doctor) }, doctor);
  },

  deleteDoctor: async (id: string) => {
    return fetchApi(`/doctors/${id}`, { method: 'DELETE' }, true);
  },

  getServices: async (): Promise<Service[]> => {
    // Services sont souvent statiques, mais on peut les fetcher
    return [
      { id: 's1', title: 'Consultation Générale', description: 'Suivi complet.', iconName: 'Stethoscope', price: 5000 },
      { id: 's2', title: 'Pédiatrie', description: 'Soins enfants.', iconName: 'Baby', price: 7000 },
      { id: 's6', title: 'Urgence', description: 'Prioritaire 24/7.', iconName: 'Ambulance', price: 15000 },
    ];
  },

  getCalendarEvents: async (doctorId: string): Promise<CalendarEvent[]> => {
    return fetchApi(`/calendar/${doctorId}`, {}, []);
  },

  saveCalendarEvent: async (event: CalendarEvent) => {
     return fetchApi('/calendar', { method: 'POST', body: JSON.stringify(event) }, event);
  },

  deleteCalendarEvent: async (id: string) => {
      return fetchApi(`/calendar/${id}`, { method: 'DELETE' }, true);
  },

  // --- RENDEZ-VOUS ---
  requestAppointment: async (data: any): Promise<Appointment> => {
    return fetchApi('/appointments', { method: 'POST', body: JSON.stringify(data) }, {
        ...data, id: Math.random().toString(), status: AppointmentStatus.PENDING_DOCTOR, createdAt: new Date().toISOString()
    });
  },

  planAppointment: async (id: string, date: string, time: string) => {
      return fetchApi(`/appointments/${id}/plan`, { method: 'PUT', body: JSON.stringify({ date, time }) }, true);
  },

  validateAppointment: async (id: string) => {
    return fetchApi(`/appointments/${id}/validate`, { method: 'PUT' }, true);
  },

  acknowledgeEmergency: async (id: string) => {
      return fetchApi(`/appointments/${id}/acknowledge`, { method: 'PUT' }, true);
  },

  getAppointments: async (): Promise<Appointment[]> => {
    return fetchApi('/appointments', {}, []);
  },

  getAppointmentsByPatient: async (patientId: string): Promise<Appointment[]> => {
    return fetchApi(`/appointments?patientId=${patientId}`, {}, []);
  },

  deleteAppointment: async (id: string) => {
    return fetchApi(`/appointments/${id}`, { method: 'DELETE' }, true);
  },

  // --- PHARMACIE & STOCK (MongoDB) ---
  getPharmacyProducts: async (): Promise<PharmacyProduct[]> => {
    return fetchApi('/products', {}, []);
  },

  saveProduct: async (product: PharmacyProduct) => {
    return fetchApi('/products', { method: 'POST', body: JSON.stringify(product) }, product);
  },

  deleteProduct: async (id: string) => {
    return fetchApi(`/products/${id}`, { method: 'DELETE' }, true);
  },

  processSale: async (items: PharmacySaleItem[], paymentMethod: any, patientName = 'Client Comptoir') => {
    const orderData = { items, paymentMethod, patientName, date: new Date().toISOString(), total: items.reduce((a,b)=>a+b.subtotal,0) };
    return fetchApi('/orders', { method: 'POST', body: JSON.stringify(orderData) }, { ...orderData, id: 'mock-id', status: 'DELIVERED', isOnlineOrder: false });
  },

  getOrders: async (): Promise<PharmacyOrder[]> => {
    return fetchApi('/orders', {}, []);
  },

  // --- STATISTIQUES ---
  getStats: async (): Promise<DashboardStats> => {
    return fetchApi('/stats/dashboard', {}, {
      totalAppointments: 0, pendingAppointments: 0, confirmedAppointments: 0,
      todaysRevenue: 0, weeklyRevenue: 0, monthlyRevenue: 0,
      lowStockItems: 0, pendingOrders: 0, totalProducts: 0,
      salesData: [], emergencyCount: 0, topProducts: []
    });
  },

  // --- DOCUMENTS & UTILITAIRES ---
  getPrescriptions: async (patientId: string) => { return fetchApi(`/prescriptions/${patientId}`, {}, []); },
  getLabResults: async (patientId: string) => { return fetchApi(`/lab-results/${patientId}`, {}, []); },

  downloadFile: (fileName: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  },
  
  analyzePrescription: async (file: File): Promise<string[]> => {
    await delay(1500); 
    // Simulation IA Vision pour le moment (nécessite backend lourd pour OCR réel)
    return ['Amoxicilline', 'Paracétamol'];
  }
};
