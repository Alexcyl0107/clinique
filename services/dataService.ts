
import { Appointment, AppointmentStatus, Doctor, Service, DashboardStats, PharmacyProduct, User, Prescription, LabResult, PharmacyOrder, PharmacySaleItem, ClinicConfig, DutyPharmacy, CalendarEvent } from '../types';

// --- CONFIGURATION API ---
// L'URL de votre backend déployé sur Render (à changer une fois déployé)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// --- SECURITY CODES ---
const SECURITY_CODES = {
  ADMIN: 'ADMIN-SECURE-2025',
  DOCTOR: 'DOC-MED-2025',
  PHARMACIST: 'PHARMA-STOCK-2025',
  DEV: 'MOI-DEV-KEY'
};

// --- LOCAL STORAGE KEYS ---
const KEYS = {
  APPS: 'clinique_appointments',
  DOCS: 'clinique_doctors',
  PRODUCTS: 'clinique_products',
  ORDERS: 'clinique_orders',
  CONFIG: 'clinique_config',
  DUTY: 'clinique_duty_pharma',
  CALENDAR: 'clinique_calendar',
  USERS: 'clinique_users'
};

// --- HELPER FUNCTIONS ---
const getLocal = <T>(key: string, defaultVal: T): T => {
  if (typeof window === 'undefined') return defaultVal;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const setLocal = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Helper pour simuler un délai
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- SERVICE ---
export const DataService = {
  
  // --- CONFIGURATION ---
  getConfig: async (): Promise<ClinicConfig> => {
    return getLocal<ClinicConfig>(KEYS.CONFIG, {
      name: 'CliniqueBeta',
      slogan: 'Une équipe médicale mixte et expérimentée à votre service.',
      phone: '+228 90 00 00 00',
      address: 'Boulevard du 13 Janvier, Lomé',
      logoUrl: ''
    });
  },
  
  saveConfig: async (config: ClinicConfig) => {
    setLocal(KEYS.CONFIG, config);
    return config;
  },

  getDutyPharmacies: async (): Promise<DutyPharmacy[]> => {
    return getLocal<DutyPharmacy[]>(KEYS.DUTY, []);
  },

  saveDutyPharmacy: async (pharma: DutyPharmacy) => {
    const list = getLocal<DutyPharmacy[]>(KEYS.DUTY, []);
    const newPharma = { ...pharma, id: pharma.id || Math.random().toString(36).substr(2, 9) };
    list.push(newPharma);
    setLocal(KEYS.DUTY, list);
    return newPharma;
  },

  deleteDutyPharmacy: async (id: string) => {
    let list = getLocal<DutyPharmacy[]>(KEYS.DUTY, []);
    list = list.filter(p => p.id !== id);
    setLocal(KEYS.DUTY, list);
    return true;
  },

  // --- AUTHENTIFICATION ---
  login: async (email: string, pass: string, refCode?: string): Promise<User | null> => {
    // 1. Check Mock Users first
    if (pass === '123456') {
      if (email.includes('admin')) return { id: 'u1', name: 'Admin Local', email, role: 'ADMIN', referenceCode: SECURITY_CODES.ADMIN };
      if (email.includes('doc')) return { id: 'u2', name: 'Dr. Local', email, role: 'DOCTOR', referenceCode: SECURITY_CODES.DOCTOR };
      if (email.includes('pharma')) return { id: 'u3', name: 'Pharma Local', email, role: 'PHARMACIST', referenceCode: SECURITY_CODES.PHARMACIST };
      if (email.includes('patient')) return { id: 'u4', name: 'Patient Local', email, role: 'PATIENT' };
    }
    
    // 2. Check Registered Users in LocalStorage
    const users = getLocal<User[]>(KEYS.USERS, []);
    const found = users.find(u => u.email === email); // In real app, check password hash
    if (found) return found;

    return null;
  },

  register: async (userData: any): Promise<User> => {
    const users = getLocal<User[]>(KEYS.USERS, []);
    const newUser = { id: Math.random().toString(36).substr(2, 9), role: 'PATIENT', ...userData };
    users.push(newUser);
    setLocal(KEYS.USERS, users);
    return newUser;
  },

  updateUserProfile: async (userId: string, data: Partial<User>) => {
    const users = getLocal<User[]>(KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...data };
      setLocal(KEYS.USERS, users);
    }
    return data;
  },

  // --- DOCTEURS & PLANNING ---
  getDoctors: async (): Promise<Doctor[]> => { 
    return getLocal<Doctor[]>(KEYS.DOCS, [
      { id: 'd1', name: 'Dr. Koffi Mensah', specialty: 'Généraliste', image: 'https://ui-avatars.com/api/?name=Koffi+Mensah&background=random', availability: ['Lundi', 'Mardi'] },
      { id: 'd2', name: 'Dr. Sarah Lawson', specialty: 'Pédiatre', image: 'https://ui-avatars.com/api/?name=Sarah+Lawson&background=random', availability: ['Mercredi', 'Jeudi'] }
    ]); 
  },

  saveDoctor: async (doctor: Doctor) => {
    const list = getLocal<Doctor[]>(KEYS.DOCS, []);
    const newDoc = { ...doctor, id: doctor.id || Math.random().toString(36).substr(2, 9) };
    list.push(newDoc);
    setLocal(KEYS.DOCS, list);
    return newDoc;
  },

  deleteDoctor: async (id: string) => {
    let list = getLocal<Doctor[]>(KEYS.DOCS, []);
    list = list.filter(d => d.id !== id);
    setLocal(KEYS.DOCS, list);
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
    const allEvents = getLocal<CalendarEvent[]>(KEYS.CALENDAR, []);
    // In a real app we filter by doctorId, but for demo we might return all or filter
    return allEvents.filter(e => e.doctorId === doctorId || !e.doctorId); 
  },

  saveCalendarEvent: async (event: CalendarEvent) => {
     const list = getLocal<CalendarEvent[]>(KEYS.CALENDAR, []);
     const newEvent = { ...event, id: Math.random().toString(36).substr(2, 9) };
     list.push(newEvent);
     setLocal(KEYS.CALENDAR, list);
     return newEvent;
  },

  deleteCalendarEvent: async (id: string) => {
      let list = getLocal<CalendarEvent[]>(KEYS.CALENDAR, []);
      list = list.filter(e => e.id !== id);
      setLocal(KEYS.CALENDAR, list);
      return true;
  },

  // --- RENDEZ-VOUS (CORE FIX) ---
  requestAppointment: async (data: any): Promise<Appointment> => {
    const apps = getLocal<Appointment[]>(KEYS.APPS, []);
    const newApp: Appointment = {
        ...data, 
        id: Math.random().toString(36).substr(2, 9), 
        status: AppointmentStatus.PENDING_DOCTOR, 
        createdAt: new Date().toISOString(),
        isEmergency: data.serviceId === 's6', // Basic logic
        isAcknowledged: false // Default to unacknowledged
    };
    apps.push(newApp);
    setLocal(KEYS.APPS, apps);
    return newApp;
  },

  planAppointment: async (id: string, date: string, time: string) => {
      const apps = getLocal<Appointment[]>(KEYS.APPS, []);
      const idx = apps.findIndex(a => a.id === id);
      if (idx >= 0) {
          apps[idx].date = date;
          apps[idx].time = time;
          apps[idx].status = AppointmentStatus.PENDING_ADMIN; // Doctor planned it, now Admin validates
          setLocal(KEYS.APPS, apps);
      }
      return true;
  },

  validateAppointment: async (id: string) => {
    const apps = getLocal<Appointment[]>(KEYS.APPS, []);
    const idx = apps.findIndex(a => a.id === id);
    if (idx >= 0) {
        apps[idx].status = AppointmentStatus.SCHEDULED;
        apps[idx].isAcknowledged = true; // VALIDATION STOPS THE ALARM
        setLocal(KEYS.APPS, apps);
    }
    return true;
  },

  acknowledgeEmergency: async (id: string) => {
      const apps = getLocal<Appointment[]>(KEYS.APPS, []);
      const idx = apps.findIndex(a => a.id === id);
      if (idx >= 0) {
          apps[idx].isAcknowledged = true;
          setLocal(KEYS.APPS, apps);
      }
      return true;
  },

  getAppointments: async (): Promise<Appointment[]> => {
    return getLocal<Appointment[]>(KEYS.APPS, []);
  },

  getAppointmentsByPatient: async (patientId: string): Promise<Appointment[]> => {
    const apps = getLocal<Appointment[]>(KEYS.APPS, []);
    return apps.filter(a => a.patientId === patientId);
  },

  deleteAppointment: async (id: string) => {
    let apps = getLocal<Appointment[]>(KEYS.APPS, []);
    apps = apps.filter(a => a.id !== id);
    setLocal(KEYS.APPS, apps);
    return true;
  },

  // --- PHARMACIE & STOCK ---
  getPharmacyProducts: async (): Promise<PharmacyProduct[]> => {
    return getLocal<PharmacyProduct[]>(KEYS.PRODUCTS, [
        { id: 'p1', name: 'Doliprane 1000mg', category: 'MEDICAMENT', type: 'TABLET', price: 1500, purchasePrice: 1000, stock: 50, minStockAlert: 10, expiryDate: '2025-12-01', image: 'https://placehold.co/100', requiresPrescription: false },
        { id: 'p2', name: 'Amoxicilline 500mg', category: 'MEDICAMENT', type: 'TABLET', price: 2500, purchasePrice: 1800, stock: 30, minStockAlert: 5, expiryDate: '2024-10-01', image: 'https://placehold.co/100', requiresPrescription: true },
        { id: 'p3', name: 'Sirop Toux Sèche', category: 'MEDICAMENT', type: 'SYRUP', price: 3000, purchasePrice: 2000, stock: 15, minStockAlert: 5, expiryDate: '2025-06-01', image: 'https://placehold.co/100', requiresPrescription: false },
        { id: 'p4', name: 'Coartem (Antipalu)', category: 'MEDICAMENT', type: 'TABLET', price: 1200, purchasePrice: 800, stock: 100, minStockAlert: 20, expiryDate: '2026-01-01', image: 'https://placehold.co/100', requiresPrescription: false },
    ]);
  },

  saveProduct: async (product: PharmacyProduct) => {
    const list = getLocal<PharmacyProduct[]>(KEYS.PRODUCTS, []);
    if (product.id) {
        const idx = list.findIndex(p => p.id === product.id);
        if (idx >= 0) list[idx] = product;
        else list.push(product);
    } else {
        product.id = Math.random().toString(36).substr(2, 9);
        list.push(product);
    }
    setLocal(KEYS.PRODUCTS, list);
    return product;
  },

  deleteProduct: async (id: string) => {
    let list = getLocal<PharmacyProduct[]>(KEYS.PRODUCTS, []);
    list = list.filter(p => p.id !== id);
    setLocal(KEYS.PRODUCTS, list);
    return true;
  },

  processSale: async (items: PharmacySaleItem[], paymentMethod: any, patientName = 'Client Comptoir') => {
    // 1. Create Order
    const orders = getLocal<PharmacyOrder[]>(KEYS.ORDERS, []);
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
    setLocal(KEYS.ORDERS, orders);

    // 2. Decrement Stock
    const products = getLocal<PharmacyProduct[]>(KEYS.PRODUCTS, []);
    items.forEach(item => {
        const idx = products.findIndex(p => p.id === item.product.id);
        if (idx >= 0) {
            products[idx].stock = Math.max(0, products[idx].stock - item.quantity);
        }
    });
    setLocal(KEYS.PRODUCTS, products);

    return newOrder;
  },

  getOrders: async (): Promise<PharmacyOrder[]> => {
    return getLocal<PharmacyOrder[]>(KEYS.ORDERS, []);
  },

  // --- STATISTIQUES ---
  getStats: async (): Promise<DashboardStats> => {
    const apps = getLocal<Appointment[]>(KEYS.APPS, []);
    const products = getLocal<PharmacyProduct[]>(KEYS.PRODUCTS, []);
    const orders = getLocal<PharmacyOrder[]>(KEYS.ORDERS, []);
    
    // Basic calculation logic
    const today = new Date().toDateString();
    const todaysOrders = orders.filter(o => new Date(o.date).toDateString() === today);
    const todaysRevenue = todaysOrders.reduce((acc, curr) => acc + curr.total, 0);

    // Group sales by product for graph
    const salesMap: {[key:string]: number} = {};
    orders.forEach(o => {
        o.items.forEach(i => {
            salesMap[i.product.name] = (salesMap[i.product.name] || 0) + i.quantity;
        });
    });
    const topProducts = Object.entries(salesMap)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    const activeEmergencies = apps.filter(a => a.isEmergency && a.status !== AppointmentStatus.COMPLETED);

    return {
      totalAppointments: apps.length,
      pendingAppointments: apps.filter(a => a.status === AppointmentStatus.PENDING_ADMIN).length,
      confirmedAppointments: apps.filter(a => a.status === AppointmentStatus.SCHEDULED).length,
      todaysRevenue,
      weeklyRevenue: orders.reduce((acc, curr) => acc + curr.total, 0), // Simplification: Total Global pour la demo
      monthlyRevenue: orders.reduce((acc, curr) => acc + curr.total, 0),
      lowStockItems: products.filter(p => p.stock <= p.minStockAlert).length,
      pendingOrders: 0,
      totalProducts: products.length,
      salesData: topProducts.map(p => ({ name: p.name, sales: p.quantity * 1000 })), // Mock sales value for graph
      emergencyCount: activeEmergencies.length, // All active emergencies (for display)
      unacknowledgedEmergencies: activeEmergencies.filter(a => !a.isAcknowledged).length, // Only ringing ones
      topProducts
    };
  },

  // --- DOCUMENTS ---
  getPrescriptions: async (patientId: string): Promise<Prescription[]> => { 
     // Mock data based on appointments for now
     const apps = await DataService.getAppointmentsByPatient(patientId);
     return apps.filter(a => a.status === AppointmentStatus.COMPLETED).map(a => ({
         id: a.id,
         patientId,
         doctorId: a.doctorId,
         date: a.date || '',
         medications: [{name: 'Doliprane', dosage: '1000mg', duration: '5 jours'}],
         notes: 'Repos',
         status: 'PROCESSED'
     }));
  },
  
  getLabResults: async (patientId: string): Promise<LabResult[]> => { 
     return []; 
  },

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
    return ['Amoxicilline', 'Paracétamol'];
  }
};
