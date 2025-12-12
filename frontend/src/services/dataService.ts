import { Appointment, AppointmentStatus, Doctor, Service, DashboardStats, PharmacyProduct, User, Prescription, LabResult, PharmacyOrder, PharmacySaleItem, ClinicConfig, DutyPharmacy, CalendarEvent } from '../types';

// Grâce au proxy Vite, on peut juste utiliser /api
const API_URL = '/api';

// --- SECURITY CODES ---
const SECURITY_CODES = {
  ADMIN: 'ADMIN-SECURE-2025',
  DOCTOR: 'DOC-MED-2025',
  PHARMACIST: 'PHARMA-STOCK-2025',
  DEV: 'MOI-DEV-KEY'
};

// Helper pour les appels API
const api = {
    get: async (endpoint: string) => {
        const res = await fetch(`${API_URL}${endpoint}`);
        if(!res.ok) throw new Error('API Error');
        return res.json();
    },
    post: async (endpoint: string, data: any) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if(!res.ok) throw new Error('API Error');
        return res.json();
    },
    put: async (endpoint: string, data: any) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        if(!res.ok) throw new Error('API Error');
        return res.json();
    },
    delete: async (endpoint: string) => {
        const res = await fetch(`${API_URL}${endpoint}`, { method: 'DELETE' });
        if(!res.ok) throw new Error('API Error');
        return res.json();
    }
};

// --- SERVICE HYBRIDE (API + MOCK LOCALSTORAGE SI FAIL) ---
// Pour la démo, on garde le localStorage en fallback si le backend n'est pas lancé
const getLocal = <T>(key: string, defaultVal: T): T => {
  if (typeof window === 'undefined') return defaultVal;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

export const DataService = {
  
  // --- CONFIGURATION ---
  getConfig: async (): Promise<ClinicConfig> => {
    return getLocal('clinique_config', {
      name: 'CliniqueBeta',
      slogan: 'Une équipe médicale mixte et expérimentée à votre service.',
      phone: '+228 90 00 00 00',
      address: 'Boulevard du 13 Janvier, Lomé'
    });
  },
  
  saveConfig: async (config: ClinicConfig) => {
    localStorage.setItem('clinique_config', JSON.stringify(config));
    return config;
  },

  getDutyPharmacies: async (): Promise<DutyPharmacy[]> => {
    return getLocal('clinique_duty_pharma', []);
  },

  saveDutyPharmacy: async (pharma: DutyPharmacy) => {
    const list = getLocal<DutyPharmacy[]>('clinique_duty_pharma', []);
    const newPharma = { ...pharma, id: pharma.id || Math.random().toString(36).substr(2, 9) };
    list.push(newPharma);
    localStorage.setItem('clinique_duty_pharma', JSON.stringify(list));
    return newPharma;
  },

  deleteDutyPharmacy: async (id: string) => {
    let list = getLocal<DutyPharmacy[]>('clinique_duty_pharma', []);
    list = list.filter(p => p.id !== id);
    localStorage.setItem('clinique_duty_pharma', JSON.stringify(list));
    return true;
  },

  // --- AUTHENTIFICATION ---
  login: async (email: string, pass: string, refCode?: string): Promise<User | null> => {
    try {
        // Tentative de connexion via API
        return await api.post('/auth/login', { email, password: pass, refCode });
    } catch (e) {
        console.warn("Backend down, using local auth");
        if (pass === '123456') {
            if (email.includes('admin')) return { id: 'u1', name: 'Admin Local', email, role: 'ADMIN', referenceCode: SECURITY_CODES.ADMIN };
            if (email.includes('doc')) return { id: 'u2', name: 'Dr. Local', email, role: 'DOCTOR', referenceCode: SECURITY_CODES.DOCTOR };
            if (email.includes('pharma')) return { id: 'u3', name: 'Pharma Local', email, role: 'PHARMACIST', referenceCode: SECURITY_CODES.PHARMACIST };
            if (email.includes('patient')) return { id: 'u4', name: 'Patient Local', email, role: 'PATIENT' };
        }
        return null;
    }
  },

  register: async (userData: any): Promise<User> => {
    try {
        return await api.post('/auth/register', userData);
    } catch (e) {
        const users = getLocal<User[]>('clinique_users', []);
        const newUser = { id: Math.random().toString(36).substr(2, 9), role: 'PATIENT', ...userData };
        users.push(newUser);
        localStorage.setItem('clinique_users', JSON.stringify(users));
        return newUser;
    }
  },

  updateUserProfile: async (userId: string, data: Partial<User>) => {
      // Local only for demo profile update
      const users = getLocal<User[]>('clinique_users', []);
      return data;
  },

  // --- DOCTEURS ---
  getDoctors: async (): Promise<Doctor[]> => { 
    return getLocal('clinique_doctors', [
      { id: 'd1', name: 'Dr. Koffi Mensah', specialty: 'Généraliste', image: 'https://ui-avatars.com/api/?name=Koffi+Mensah&background=random', availability: ['Lundi', 'Mardi'] },
      { id: 'd2', name: 'Dr. Sarah Lawson', specialty: 'Pédiatre', image: 'https://ui-avatars.com/api/?name=Sarah+Lawson&background=random', availability: ['Mercredi', 'Jeudi'] }
    ]); 
  },
  
  saveDoctor: async (doctor: Doctor) => {
      const list = getLocal<Doctor[]>('clinique_doctors', []);
      const newDoc = { ...doctor, id: doctor.id || Math.random().toString(36).substr(2, 9) };
      list.push(newDoc);
      localStorage.setItem('clinique_doctors', JSON.stringify(list));
      return newDoc;
  },
  
  deleteDoctor: async (id: string) => {
      let list = getLocal<Doctor[]>('clinique_doctors', []);
      list = list.filter(d => d.id !== id);
      localStorage.setItem('clinique_doctors', JSON.stringify(list));
      return true;
  },

  getServices: async (): Promise<Service[]> => {
    return [
      { id: 's1', title: 'Consultation Générale', description: 'Suivi complet pour toute la famille.', iconName: 'Stethoscope', price: 5000 },
      { id: 's2', title: 'Pédiatrie', description: 'Soins adaptés aux nourrissons et enfants.', iconName: 'Baby', price: 7000 },
      { id: 's3', title: 'Cardiologie', description: 'Suivi cardiaque et tension.', iconName: 'Heart', price: 10000 },
      { id: 's4', title: 'Analyses Labo', description: 'Prises de sang et résultats rapides.', iconName: 'Microscope', price: 3000 },
      { id: 's6', title: 'Urgence', description: 'Prise en charge prioritaire 24/7.', iconName: 'Ambulance', price: 15000 },
    ];
  },

  getCalendarEvents: async (doctorId: string): Promise<CalendarEvent[]> => {
    return getLocal('clinique_calendar', []);
  },

  saveCalendarEvent: async (event: CalendarEvent) => {
     const list = getLocal<CalendarEvent[]>('clinique_calendar', []);
     const newEvent = { ...event, id: Math.random().toString(36).substr(2, 9) };
     list.push(newEvent);
     localStorage.setItem('clinique_calendar', JSON.stringify(list));
     return newEvent;
  },

  deleteCalendarEvent: async (id: string) => {
      let list = getLocal<CalendarEvent[]>('clinique_calendar', []);
      list = list.filter(e => e.id !== id);
      localStorage.setItem('clinique_calendar', JSON.stringify(list));
      return true;
  },

  // --- RENDEZ-VOUS (Connected to Backend) ---
  requestAppointment: async (data: any): Promise<Appointment> => {
    try {
        return await api.post('/appointments', data);
    } catch (e) {
        console.warn("Backend down, local save");
        const apps = getLocal<Appointment[]>('clinique_appointments', []);
        const newApp: Appointment = {
            ...data, 
            id: Math.random().toString(36).substr(2, 9), 
            status: AppointmentStatus.PENDING_DOCTOR, 
            createdAt: new Date().toISOString(),
            isEmergency: data.serviceId === 's6',
            isAcknowledged: false
        };
        apps.push(newApp);
        localStorage.setItem('clinique_appointments', JSON.stringify(apps));
        return newApp;
    }
  },

  planAppointment: async (id: string, date: string, time: string) => {
      try {
          return await api.put(`/appointments/${id}`, { date, time, status: AppointmentStatus.PENDING_ADMIN });
      } catch (e) {
          const apps = getLocal<Appointment[]>('clinique_appointments', []);
          const idx = apps.findIndex(a => a.id === id);
          if (idx >= 0) {
              apps[idx].date = date;
              apps[idx].time = time;
              apps[idx].status = AppointmentStatus.PENDING_ADMIN;
              localStorage.setItem('clinique_appointments', JSON.stringify(apps));
          }
          return true;
      }
  },

  validateAppointment: async (id: string) => {
    try {
        return await api.put(`/appointments/${id}`, { status: AppointmentStatus.SCHEDULED, isAcknowledged: true });
    } catch (e) {
        const apps = getLocal<Appointment[]>('clinique_appointments', []);
        const idx = apps.findIndex(a => a.id === id);
        if (idx >= 0) {
            apps[idx].status = AppointmentStatus.SCHEDULED;
            apps[idx].isAcknowledged = true;
            localStorage.setItem('clinique_appointments', JSON.stringify(apps));
        }
        return true;
    }
  },

  acknowledgeEmergency: async (id: string) => {
      try {
          return await api.put(`/appointments/${id}`, { isAcknowledged: true });
      } catch (e) {
          const apps = getLocal<Appointment[]>('clinique_appointments', []);
          const idx = apps.findIndex(a => a.id === id);
          if (idx >= 0) {
              apps[idx].isAcknowledged = true;
              localStorage.setItem('clinique_appointments', JSON.stringify(apps));
          }
          return true;
      }
  },

  getAppointments: async (): Promise<Appointment[]> => {
    try {
        return await api.get('/appointments');
    } catch (e) {
        return getLocal('clinique_appointments', []);
    }
  },

  getAppointmentsByPatient: async (patientId: string): Promise<Appointment[]> => {
    const apps = await DataService.getAppointments();
    return apps.filter(a => a.patientId === patientId);
  },

  deleteAppointment: async (id: string) => {
    try {
        return await api.delete(`/appointments/${id}`);
    } catch (e) {
        let apps = getLocal<Appointment[]>('clinique_appointments', []);
        apps = apps.filter(a => a.id !== id);
        localStorage.setItem('clinique_appointments', JSON.stringify(apps));
        return true;
    }
  },

  // --- PHARMACIE ---
  getPharmacyProducts: async (): Promise<PharmacyProduct[]> => {
    try {
        return await api.get('/products');
    } catch (e) {
        return getLocal('clinique_products', [
            { id: 'p1', name: 'Doliprane 1000mg', category: 'MEDICAMENT', type: 'TABLET', price: 1500, purchasePrice: 1000, stock: 50, minStockAlert: 10, expiryDate: '2025-12-01', image: 'https://placehold.co/100', requiresPrescription: false },
        ]);
    }
  },

  saveProduct: async (product: PharmacyProduct) => {
    try {
        return await api.post('/products', product);
    } catch (e) {
        const list = getLocal<PharmacyProduct[]>('clinique_products', []);
        if (product.id) {
            const idx = list.findIndex(p => p.id === product.id);
            if (idx >= 0) list[idx] = product;
        } else {
            product.id = Math.random().toString(36).substr(2, 9);
            list.push(product);
        }
        localStorage.setItem('clinique_products', JSON.stringify(list));
        return product;
    }
  },

  processSale: async (items: PharmacySaleItem[], paymentMethod: any, patientName = 'Client Comptoir') => {
    try {
        return await api.post('/orders', {
            patientName,
            items,
            total: items.reduce((a,b)=>a+b.subtotal,0),
            paymentMethod
        });
    } catch (e) {
        const orders = getLocal<PharmacyOrder[]>('clinique_orders', []);
        const newOrder: PharmacyOrder = {
            id: Math.random().toString(36).substr(2, 9),
            patientName,
            date: new Date().toISOString(),
            items,
            total: items.reduce((a,b)=>a+b.subtotal,0),
            status: 'DELIVERED',
            paymentMethod,
            isOnlineOrder: patientName !== 'Client Comptoir'
        };
        orders.push(newOrder);
        localStorage.setItem('clinique_orders', JSON.stringify(orders));
        return newOrder;
    }
  },

  getOrders: async (): Promise<PharmacyOrder[]> => {
    try {
        return await api.get('/orders');
    } catch (e) {
        return getLocal('clinique_orders', []);
    }
  },

  // --- STATS ---
  getStats: async (): Promise<DashboardStats> => {
    try {
        return await api.get('/stats');
    } catch (e) {
        // Fallback calculation locally
        const apps = getLocal<Appointment[]>('clinique_appointments', []);
        const products = getLocal<PharmacyProduct[]>('clinique_products', []);
        return {
            totalAppointments: apps.length,
            pendingAppointments: apps.filter(a => a.status === AppointmentStatus.PENDING_ADMIN).length,
            confirmedAppointments: apps.filter(a => a.status === AppointmentStatus.SCHEDULED).length,
            todaysRevenue: 0,
            weeklyRevenue: 0,
            monthlyRevenue: 0,
            lowStockItems: products.filter(p => p.stock <= p.minStockAlert).length,
            pendingOrders: 0,
            totalProducts: products.length,
            salesData: [],
            emergencyCount: 0,
            unacknowledgedEmergencies: 0,
            topProducts: []
        };
    }
  },

  getPrescriptions: async (patientId: string): Promise<Prescription[]> => { return []; },
  getLabResults: async (patientId: string): Promise<LabResult[]> => { return []; },
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
    return ['Amoxicilline', 'Paracétamol'];
  }
};