import { Appointment, AppointmentStatus, Doctor, Service, DashboardStats, PharmacyProduct, User, Prescription, LabResult, PharmacyOrder, Supplier, AuditLog, PharmacySaleItem, ClinicConfig, DutyPharmacy, CalendarEvent } from '../types';

// --- SECURITY CODES ---
const SECURITY_CODES = {
  ADMIN: 'ADMIN-SECURE-2025',
  DOCTOR: 'DOC-MED-2025',
  PHARMACIST: 'PHARMA-STOCK-2025',
  DEV: 'MOI-DEV-KEY' // VOTRE CLÉ PERSONNELLE
};

// --- INITIAL MOCK DATA ---
const DEFAULT_CONFIG: ClinicConfig = {
  name: 'CliniqueBeta',
  slogan: 'Une équipe médicale mixte et expérimentée à votre service.',
  phone: '+228 90 00 00 00',
  address: 'Boulevard du 13 Janvier, Lomé',
  logoUrl: ''
};

const MOCK_USERS: User[] = [
  // COMPTES EXISTANTS
  { id: 'u1', name: 'Admin Principal', email: 'admin@clinic.com', role: 'ADMIN', avatar: 'https://ui-avatars.com/api/?name=Admin', phone: '90000000', referenceCode: SECURITY_CODES.ADMIN },
  { id: 'u2', name: 'Dr. Koffi Mensah', email: 'doc@clinic.com', role: 'DOCTOR', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100&h=100', phone: '91000000', referenceCode: SECURITY_CODES.DOCTOR },
  { id: 'u3', name: 'Ph. Akouvi Bates', email: 'pharma@clinic.com', role: 'PHARMACIST', avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=100&h=100', phone: '92000000', referenceCode: SECURITY_CODES.PHARMACIST },
  { id: 'u4', name: 'Jean Dupont', email: 'patient@clinic.com', role: 'PATIENT', avatar: 'https://ui-avatars.com/api/?name=Jean+Dupont', height: 175, weight: 70, bloodGroup: 'O+', phone: '93000000' },

  // --- VOS COMPTES PERSONNELS DE TEST ---
  { id: 'dev1', name: 'MOI (Admin)', email: 'moi@admin.com', role: 'ADMIN', avatar: 'https://ui-avatars.com/api/?name=Moi+Admin&background=0D8ABC&color=fff', phone: '99999999', referenceCode: SECURITY_CODES.DEV },
  { id: 'dev2', name: 'MOI (Docteur)', email: 'moi@doc.com', role: 'DOCTOR', avatar: 'https://ui-avatars.com/api/?name=Moi+Doc&background=6366f1&color=fff', phone: '99999999', referenceCode: SECURITY_CODES.DEV },
  { id: 'dev3', name: 'MOI (Pharma)', email: 'moi@pharma.com', role: 'PHARMACIST', avatar: 'https://ui-avatars.com/api/?name=Moi+Pharma&background=10b981&color=fff', phone: '99999999', referenceCode: SECURITY_CODES.DEV },
  { id: 'dev4', name: 'MOI (Patient)', email: 'moi@patient.com', role: 'PATIENT', avatar: 'https://ui-avatars.com/api/?name=Moi+Patient', height: 180, weight: 75, bloodGroup: 'A+', phone: '99999999' },
];

const MOCK_DOCTORS: Doctor[] = [
  { id: 'u2', name: 'Dr. Koffi Mensah', specialty: 'Médecine Générale', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400', availability: ['Lundi', 'Mardi', 'Jeudi'] },
  { id: 'd2', name: 'Dr. Amina Diallo', specialty: 'Pédiatrie', image: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400&h=400', availability: ['Lundi', 'Mercredi', 'Vendredi'] },
  { id: 'd3', name: 'Dr. Jean-Luc Diop', specialty: 'Cardiologie', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=400', availability: ['Mardi', 'Jeudi', 'Samedi'] },
  { id: 'd4', name: 'Dr. Clarisse Adebayor', specialty: 'Gynécologie', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=400&h=400', availability: ['Lundi', 'Mardi', 'Vendredi'] },
  // Ajout de votre compte docteur dans la liste des médecins affichés
  { id: 'dev2', name: 'Dr. MOI (Test)', specialty: 'Chirurgie (Test)', image: 'https://ui-avatars.com/api/?name=Moi+Doc&size=400', availability: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'] }
];

const MOCK_SERVICES: Service[] = [
  { id: 's1', title: 'Consultation Générale', description: 'Diagnostic et suivi médical complet.', iconName: 'Stethoscope', price: 5000 },
  { id: 's2', title: 'Cardiologie', description: 'Bilan cardiaque et hypertension.', iconName: 'Heart', price: 15000 },
  { id: 's3', title: 'Pédiatrie & Vaccination', description: 'Suivi des nourrissons et enfants.', iconName: 'Baby', price: 7000 },
  { id: 's4', title: 'Laboratoire d\'Analyses', description: 'Paludisme, Typhoïde et bilans sanguins.', iconName: 'Microscope', price: 2000 },
  { id: 's5', title: 'Maternité', description: 'Suivi de grossesse et accouchement.', iconName: 'Activity', price: 10000 },
  { id: 's6', title: 'Urgence', description: 'Prise en charge immédiate 24/7.', iconName: 'Ambulance', price: 20000 },
];

const MOCK_PHARMACY: PharmacyProduct[] = [
  { id: 'p1', name: 'Paracétamol 500mg', category: 'MEDICAMENT', subCategory: 'Antidouleur', type: 'TABLET', price: 500, purchasePrice: 250, stock: 150, minStockAlert: 50, expiryDate: '2025-12-01', requiresPrescription: false, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300&h=300', barcode: '123456789', location: 'Rayon A1' },
  { id: 'p2', name: 'Coartem 80/480', category: 'MEDICAMENT', subCategory: 'Antipaludéen', type: 'TABLET', price: 2500, purchasePrice: 1500, stock: 45, minStockAlert: 50, expiryDate: '2024-10-15', requiresPrescription: true, image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=300&h=300', barcode: '987654321', location: 'Rayon B2' },
  { id: 'p3', name: 'Morphine Sulfate 10mg', category: 'STUPEFIANT', subCategory: 'Analgésique Opioïde', type: 'INJECTION', price: 5000, purchasePrice: 3500, stock: 12, minStockAlert: 10, expiryDate: '2024-08-01', requiresPrescription: true, image: 'https://placehold.co/300x300/red/white?text=MORPHINE', barcode: 'STUP-001', location: 'Coffre Fort' },
  { id: 'p4', name: 'Insuline Lantus', category: 'VACCIN', subCategory: 'Diabète', type: 'INJECTION', price: 8500, purchasePrice: 6000, stock: 8, minStockAlert: 5, expiryDate: '2025-05-20', requiresPrescription: true, image: 'https://placehold.co/300x300/blue/white?text=INSULINE', barcode: 'FROID-001', location: 'Frigo 1' },
  { id: 'p5', name: 'Tensiomètre Omron M3', category: 'MATERIEL', subCategory: 'Cardio', type: 'OTHER', price: 35000, purchasePrice: 25000, stock: 3, minStockAlert: 2, expiryDate: '2030-01-01', requiresPrescription: false, image: 'https://placehold.co/300x300?text=TENSIOMETRE', barcode: 'MAT-001', location: 'Vitrine A' },
  { id: 'p6', name: 'Lait Guigoz 1er Age', category: 'PARAPHARMACIE', subCategory: 'Nutrition Bébé', type: 'OTHER', price: 4500, purchasePrice: 3800, stock: 24, minStockAlert: 10, expiryDate: '2025-09-01', requiresPrescription: false, image: 'https://placehold.co/300x300?text=LAIT+BEBE', barcode: 'PARA-001', location: 'Rayon C1' },
];

const MOCK_DUTY_PHARMACIES: DutyPharmacy[] = [
  { id: 'dp1', name: 'Pharmacie de l\'Espoir', location: 'Tokoin', phone: '90112233', isOpen: true },
  { id: 'dp2', name: 'Pharmacie Grâce', location: 'Bè-Kpota', phone: '91223344', isOpen: true }
];

const MOCK_EVENTS: CalendarEvent[] = [
  { id: 'e1', doctorId: 'u2', day: 'Lundi', startTime: '09:00', duration: 30, type: 'CONSULTATION', title: 'Mme. Lawson', status: 'CONFIRMED', patientName: 'Mme. Lawson', description: 'Suivi tension' },
  { id: 'e2', doctorId: 'u2', day: 'Lundi', startTime: '10:00', duration: 45, type: 'URGENCY', title: 'URGENCE - M. Kossi', status: 'CONFIRMED', patientName: 'M. Kossi', description: 'Crise d\'asthme sévère' },
  { id: 'e3', doctorId: 'u2', day: 'Mardi', startTime: '14:00', duration: 60, type: 'HOME_VISIT', title: 'Visite - Quartier Adidogomé', status: 'PENDING', address: 'Maison 45, Rue des Palmiers, Adidogomé', patientName: 'Vieux Paul' },
  { id: 'e4', doctorId: 'u2', day: 'Mercredi', startTime: '08:00', duration: 60, type: 'MEETING', title: 'Staff Médical', status: 'CONFIRMED', description: 'Réunion hebdomadaire' },
  { id: 'e5', doctorId: 'u2', day: 'Jeudi', startTime: '07:00', duration: 240, type: 'ABSENCE', title: 'Congés Matinée', status: 'CONFIRMED', description: 'Indisponible' },
];

const MOCK_PRESCRIPTIONS: Prescription[] = [
  { id: 'pr1', patientId: 'u4', doctorId: 'd1', date: '2023-10-25', notes: 'Repos recommandé.', medications: [{ name: 'Paracétamol', dosage: '1g 3x/jour', duration: '5 jours' }, { name: 'Vitamine C', dosage: '1000mg matin', duration: '10 jours' }], status: 'PROCESSED' }
];

const MOCK_LAB_RESULTS: LabResult[] = [
  { id: 'lr1', patientId: 'u4', testName: 'Goutte Épaisse (Paludisme)', date: '2023-10-24', status: 'AVAILABLE', summary: 'Négatif', fileUrl: 'mock_result.pdf' },
  { id: 'lr2', patientId: 'u4', testName: 'NFS (Numération Sanguine)', date: '2023-10-24', status: 'PENDING' }
];

const STORAGE_KEYS = {
  CONFIG: 'clinic_config_db',
  APP: 'clinic_appointments_db',
  PRODUCTS: 'clinic_products_db',
  ORDERS: 'clinic_orders_db',
  SUPPLIERS: 'clinic_suppliers_db',
  LOGS: 'clinic_audit_logs',
  USERS: 'clinic_users_db',
  DOCTORS: 'clinic_doctors_db',
  DUTY_PHARMA: 'clinic_duty_pharma_db',
  EVENTS: 'clinic_events_db'
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const save = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));
const load = (key: string, defaultData: any) => {
  const d = localStorage.getItem(key);
  return d ? JSON.parse(d) : defaultData;
};

export const DataService = {
  getConfig: async (): Promise<ClinicConfig> => load(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG),
  saveConfig: async (config: ClinicConfig) => save(STORAGE_KEYS.CONFIG, config),
  
  getDutyPharmacies: async (): Promise<DutyPharmacy[]> => load(STORAGE_KEYS.DUTY_PHARMA, MOCK_DUTY_PHARMACIES),
  saveDutyPharmacy: async (pharma: DutyPharmacy) => {
    const list = load(STORAGE_KEYS.DUTY_PHARMA, MOCK_DUTY_PHARMACIES);
    if(pharma.id) {
       const idx = list.findIndex((p:DutyPharmacy) => p.id === pharma.id);
       if(idx !== -1) list[idx] = pharma;
    } else {
      list.push({ ...pharma, id: Math.random().toString(36).substr(2, 9) });
    }
    save(STORAGE_KEYS.DUTY_PHARMA, list);
  },
  deleteDutyPharmacy: async (id: string) => {
     const list = load(STORAGE_KEYS.DUTY_PHARMA, MOCK_DUTY_PHARMACIES);
     save(STORAGE_KEYS.DUTY_PHARMA, list.filter((p:DutyPharmacy) => p.id !== id));
  },

  login: async (email: string, pass: string, refCode?: string): Promise<User | null> => {
    await delay(600);
    const users = load(STORAGE_KEYS.USERS, MOCK_USERS);
    const user = users.find((u: User) => u.email === email);
    if (!user) return null;
    if (pass !== '123456') return null;
    if (user.role !== 'PATIENT') {
        if (!refCode) return null; 
        if (refCode !== user.referenceCode) return null;
    }
    return user;
  },

  register: async (userData: any): Promise<User> => {
    await delay(800);
    const users = load(STORAGE_KEYS.USERS, MOCK_USERS);
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'PATIENT',
      avatar: `https://ui-avatars.com/api/?name=${userData.name}`,
      ...userData
    };
    users.push(newUser);
    save(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  updateUserProfile: async (userId: string, data: Partial<User>) => {
     const users = load(STORAGE_KEYS.USERS, MOCK_USERS);
     const idx = users.findIndex((u:User) => u.id === userId);
     if (idx !== -1) {
       users[idx] = { ...users[idx], ...data };
       save(STORAGE_KEYS.USERS, users);
       const session = localStorage.getItem('clinic_user_session');
       if(session) {
         const currentUser = JSON.parse(session);
         if(currentUser.id === userId) {
            localStorage.setItem('clinic_user_session', JSON.stringify(users[idx]));
         }
       }
     }
  },

  // --- DOCTOR MANAGEMENT FIXED ---
  getDoctors: async (): Promise<Doctor[]> => { 
    await delay(200); 
    return load(STORAGE_KEYS.DOCTORS, MOCK_DOCTORS); 
  },

  saveDoctor: async (doctor: Doctor) => {
    await delay(300);
    const doctors = load(STORAGE_KEYS.DOCTORS, MOCK_DOCTORS);
    if (doctor.id) {
       const idx = doctors.findIndex((d:Doctor) => d.id === doctor.id);
       if (idx !== -1) doctors[idx] = doctor;
    } else {
      doctors.push({ ...doctor, id: Math.random().toString(36).substr(2, 9) });
    }
    save(STORAGE_KEYS.DOCTORS, doctors);
  },

  deleteDoctor: async (id: string) => {
    await delay(300);
    const doctors = load(STORAGE_KEYS.DOCTORS, MOCK_DOCTORS);
    const filtered = doctors.filter((d:Doctor) => d.id !== id);
    save(STORAGE_KEYS.DOCTORS, filtered);
    return true;
  },

  getServices: async () => { await delay(300); return MOCK_SERVICES; },

  getCalendarEvents: async (doctorId: string): Promise<CalendarEvent[]> => {
    await delay(300);
    const events = load(STORAGE_KEYS.EVENTS, MOCK_EVENTS);
    // Allow seeing own events OR if admin OR if testing with 'dev2'
    return events.filter((e: CalendarEvent) => e.doctorId === doctorId || e.doctorId === 'u2' || doctorId === 'dev2'); 
  },

  saveCalendarEvent: async (event: CalendarEvent) => {
     const events = load(STORAGE_KEYS.EVENTS, MOCK_EVENTS);
     if(event.id) {
         const idx = events.findIndex((e:CalendarEvent) => e.id === event.id);
         if(idx !== -1) events[idx] = event;
     } else {
         events.push({ ...event, id: Math.random().toString(36).substr(2, 9) });
     }
     save(STORAGE_KEYS.EVENTS, events);
  },

  deleteCalendarEvent: async (id: string) => {
      const events = load(STORAGE_KEYS.EVENTS, MOCK_EVENTS);
      save(STORAGE_KEYS.EVENTS, events.filter((e:CalendarEvent) => e.id !== id));
  },

  requestAppointment: async (data: any): Promise<Appointment> => {
    await delay(600);
    const isEmergency = data.serviceId === 's6';
    const newApp: Appointment = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      status: AppointmentStatus.PENDING_DOCTOR,
      createdAt: new Date().toISOString(),
      type: 'IN_PERSON',
      isEmergency: isEmergency,
      isAcknowledged: false
    };
    const current = DataService.getLocalAppointments();
    save(STORAGE_KEYS.APP, [newApp, ...current]);
    return newApp;
  },

  planAppointment: async (id: string, date: string, time: string) => {
      await delay(400);
      const apps = DataService.getLocalAppointments();
      const idx = apps.findIndex(a => a.id === id);
      if(idx !== -1) {
          apps[idx].date = date;
          apps[idx].time = time;
          apps[idx].status = AppointmentStatus.PENDING_ADMIN; 
          save(STORAGE_KEYS.APP, apps);
      }
  },

  validateAppointment: async (id: string) => {
    await delay(400);
    const apps = DataService.getLocalAppointments();
    const idx = apps.findIndex(a => a.id === id);
    if (idx !== -1) {
      apps[idx].status = AppointmentStatus.SCHEDULED; 
      save(STORAGE_KEYS.APP, apps);
    }
  },

  acknowledgeEmergency: async (id: string) => {
      const apps = DataService.getLocalAppointments();
      const idx = apps.findIndex(a => a.id === id);
      if(idx !== -1) {
          apps[idx].isAcknowledged = true;
          save(STORAGE_KEYS.APP, apps);
      }
  },

  getAppointments: async (): Promise<Appointment[]> => {
    await delay(300);
    return DataService.getLocalAppointments();
  },

  getAppointmentsByPatient: async (patientId: string): Promise<Appointment[]> => {
    await delay(300);
    const all = DataService.getLocalAppointments();
    // Allow viewing mocks for test patient
    return all.filter(a => a.patientId === patientId || a.patientEmail === 'patient@clinic.com' || patientId === 'dev4');
  },

  getAppointmentsByDoctor: async (doctorId: string): Promise<Appointment[]> => {
      await delay(300);
      const all = DataService.getLocalAppointments();
      return all.filter(a => a.doctorId === doctorId || !a.doctorId || a.doctorId === "");
  },

  deleteAppointment: async (id: string) => {
    await delay(300);
    const apps = DataService.getLocalAppointments();
    const newApps = apps.filter(a => a.id !== id);
    save(STORAGE_KEYS.APP, newApps);
  },

  getPharmacyProducts: async (): Promise<PharmacyProduct[]> => {
    await delay(300);
    return load(STORAGE_KEYS.PRODUCTS, MOCK_PHARMACY);
  },

  saveProduct: async (product: PharmacyProduct) => {
    await delay(300);
    let products = load(STORAGE_KEYS.PRODUCTS, MOCK_PHARMACY);
    const index = products.findIndex((p: PharmacyProduct) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push({ ...product, id: Math.random().toString(36).substr(2, 9) });
    }
    save(STORAGE_KEYS.PRODUCTS, products);
  },

  deleteProduct: async (id: string) => {
    await delay(300);
    let products = load(STORAGE_KEYS.PRODUCTS, MOCK_PHARMACY);
    products = products.filter((p: PharmacyProduct) => p.id !== id);
    save(STORAGE_KEYS.PRODUCTS, products);
  },

  processSale: async (items: PharmacySaleItem[], paymentMethod: any, patientName = 'Client Comptoir') => {
    await delay(800); 
    let products = load(STORAGE_KEYS.PRODUCTS, MOCK_PHARMACY);
    const orderItems: PharmacySaleItem[] = [];
    let total = 0;
    for (const item of items) {
      const prodIndex = products.findIndex((p: PharmacyProduct) => p.id === item.product.id);
      if (prodIndex >= 0) {
        if (products[prodIndex].stock < item.quantity) {
          throw new Error(`Stock insuffisant pour ${item.product.name}`);
        }
        products[prodIndex].stock -= item.quantity;
        total += item.product.price * item.quantity;
        orderItems.push(item);
      }
    }
    save(STORAGE_KEYS.PRODUCTS, products);
    const newOrder: PharmacyOrder = {
      id: Date.now().toString(),
      patientName,
      date: new Date().toISOString(),
      items: orderItems,
      total,
      status: 'DELIVERED',
      paymentMethod,
      isOnlineOrder: patientName !== 'Client Comptoir'
    };
    const orders = load(STORAGE_KEYS.ORDERS, []);
    save(STORAGE_KEYS.ORDERS, [newOrder, ...orders]);
    return newOrder;
  },

  getOrders: async (): Promise<PharmacyOrder[]> => {
    await delay(300);
    return load(STORAGE_KEYS.ORDERS, []);
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

  getStats: async (): Promise<DashboardStats> => {
    await delay(400);
    const apps = DataService.getLocalAppointments();
    const products = load(STORAGE_KEYS.PRODUCTS, MOCK_PHARMACY);
    const orders = load(STORAGE_KEYS.ORDERS, []) as PharmacyOrder[];

    const today = new Date().toISOString().split('T')[0];
    const todaysOrders = orders.filter((o: PharmacyOrder) => o.date.startsWith(today));
    const todaysRevenue = todaysOrders.reduce((sum: number, o: PharmacyOrder) => sum + o.total, 0);

    const salesData = [
      { name: 'Lun', sales: 120000 },
      { name: 'Mar', sales: 95000 },
      { name: 'Mer', sales: 150000 },
      { name: 'Jeu', sales: 80000 },
      { name: 'Ven', sales: 200000 },
      { name: 'Sam', sales: 110000 },
      { name: 'Dim', sales: todaysRevenue > 0 ? todaysRevenue : 45000 },
    ];

    const productSales: {[key: string]: number} = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            productSales[item.product.name] = (productSales[item.product.name] || 0) + item.quantity;
        });
    });
    const topProducts = Object.entries(productSales)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    return {
      totalAppointments: apps.length,
      pendingAppointments: apps.filter(a => a.status === AppointmentStatus.PENDING_DOCTOR || a.status === AppointmentStatus.PENDING_ADMIN).length,
      confirmedAppointments: apps.filter(a => a.status === AppointmentStatus.SCHEDULED).length,
      todaysRevenue: todaysRevenue, 
      weeklyRevenue: 850000,
      monthlyRevenue: 3200000,
      lowStockItems: products.filter((p: PharmacyProduct) => p.stock <= p.minStockAlert).length,
      pendingOrders: orders.filter((o: PharmacyOrder) => o.status === 'PENDING').length,
      totalProducts: products.length,
      salesData,
      emergencyCount: apps.filter(a => a.isEmergency && a.status !== AppointmentStatus.COMPLETED && a.status !== AppointmentStatus.CANCELLED && !a.isAcknowledged).length,
      topProducts
    };
  },

  getPrescriptions: async (patientId: string) => { await delay(300); return MOCK_PRESCRIPTIONS; },
  getLabResults: async (patientId: string) => { await delay(300); return MOCK_LAB_RESULTS; },
  
  analyzePrescription: async (file: File): Promise<string[]> => {
    await delay(2000); 
    const possibleMeds = ['Amoxicilline', 'Paracétamol', 'Ibuprofène', 'Coartem', 'Vitamine C'];
    const detected = [];
    detected.push(possibleMeds[Math.floor(Math.random() * possibleMeds.length)]);
    detected.push(possibleMeds[Math.floor(Math.random() * possibleMeds.length)]);
    return [...new Set(detected)];
  },

  getLocalAppointments: (): Appointment[] => {
    const data = localStorage.getItem(STORAGE_KEYS.APP);
    return data ? JSON.parse(data) : [];
  }
};