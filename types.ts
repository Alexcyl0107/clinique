
export type UserRole = 'ADMIN' | 'DOCTOR' | 'PHARMACIST' | 'PATIENT';

export interface ClinicConfig {
  name: string;
  slogan: string;
  phone: string;
  address: string;
  logoUrl?: string;
}

export interface DutyPharmacy {
  id: string;
  name: string;
  location: string;
  phone: string;
  isOpen: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  referenceCode?: string; // Security Code
  // Medical Info for Patients
  height?: number; // cm
  weight?: number; // kg
  bloodGroup?: string;
  phone?: string;
}

export enum AppointmentStatus {
  PENDING_DOCTOR = 'PENDING_DOCTOR', // Patient asked, waiting for doctor to set time
  PENDING_ADMIN = 'PENDING_ADMIN',   // Doctor set time, waiting for admin validation
  SCHEDULED = 'SCHEDULED',           // Confirmed
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  availability: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
  price: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
}

export interface PharmacyProduct {
  id: string;
  name: string;
  category: 'MEDICAMENT' | 'STUPEFIANT' | 'PARAPHARMACIE' | 'VACCIN' | 'MATERIEL'; 
  subCategory?: string; // 'Sirop', 'Comprimé', 'Injection', 'Psychotrope'
  description?: string;
  type: 'TABLET' | 'SYRUP' | 'CREAM' | 'INJECTION' | 'OTHER';
  price: number; 
  purchasePrice: number; 
  stock: number;
  minStockAlert: number;
  expiryDate: string;
  image: string;
  requiresPrescription: boolean;
  supplierId?: string;
  barcode?: string;
  location?: string;
}

export interface PharmacySaleItem {
  product: PharmacyProduct;
  quantity: number;
  subtotal: number;
}

export interface PharmacyOrder {
  id: string;
  patientName: string;
  date: string;
  items: PharmacySaleItem[];
  total: number;
  status: 'PENDING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: 'CASH' | 'FLOOZ' | 'TMONEY' | 'CARD';
  isOnlineOrder: boolean;
}

export interface Appointment {
  id: string;
  patientId?: string; 
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  serviceId?: string;
  serviceName?: string;
  date?: string; // Optional until scheduled
  time?: string; // Optional until scheduled
  symptoms: string; 
  status: AppointmentStatus;
  createdAt: string;
  type: 'IN_PERSON' | 'VIDEO';
  isEmergency: boolean; // URGENT FLAG
  isAcknowledged?: boolean; // If true, alarm stops
}

// DOCTOR PLANNING EVENTS
export interface CalendarEvent {
  id: string;
  doctorId: string;
  day: string; // 'Lundi', 'Mardi'...
  startTime: string; // "09:00"
  duration: number; // minutes
  type: 'CONSULTATION' | 'URGENCY' | 'HOME_VISIT' | 'MEETING' | 'ABSENCE';
  title: string;
  description?: string;
  patientName?: string;
  address?: string; // For home visits
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName?: string;
  date: string;
  medications: { name: string; dosage: string; duration: string }[];
  notes: string;
  imageUrl?: string; 
  status: 'PENDING' | 'PROCESSED';
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  date: string;
  status: 'PENDING' | 'AVAILABLE';
  fileUrl?: string; 
  summary?: string;
}

export interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  todaysRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  lowStockItems: number;
  pendingOrders: number;
  totalProducts: number;
  salesData: { name: string; sales: number }[];
  emergencyCount: number;
  topProducts: { name: string; quantity: number }[];
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  details: string;
  timestamp: string;
}

// INVENTORY SYSTEM
export interface InventorySessionItem {
    productId: string;
    productName: string;
    systemStock: number;
    countedStock: number;
    purchasePrice: number;
    category: string;
    notes?: string; // "Périmé", "Cassé"
}

export interface InventoryReport {
  date: string;
  totalItems: number;
  totalValueSystem: number;
  totalValueReal: number;
  discrepancies: { productName: string; expected: number; found: number; costDiff: number; notes?: string }[];
}
