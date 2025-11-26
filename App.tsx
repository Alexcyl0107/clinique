import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ClinicProvider } from './context/ClinicContext';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { Home } from './pages/Home';
import { Booking } from './pages/Booking';
import { Services } from './pages/Services';
import { Doctors } from './pages/Doctors';
import { Pharmacy } from './pages/Pharmacy';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AdminDashboard } from './pages/AdminDashboard';
import { PatientPortal } from './pages/PatientPortal';
import { PharmacyAdmin } from './pages/PharmacyAdmin';
import { DoctorDashboard } from './pages/DoctorDashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ClinicProvider>
            <HashRouter>
            <Routes>
                {/* Entry Points */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Signup />} />

                {/* Protected Site Structure (Navbar visible ONLY when logged in) */}
                <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Home />} />
                <Route path="booking" element={<Booking />} />
                <Route path="services" element={<Services />} />
                <Route path="doctors" element={<Doctors />} />
                <Route path="pharmacy" element={<Pharmacy />} />
                </Route>

                {/* Role-Specific Routes */}
                <Route path="/admin" element={<DashboardLayout allowedRoles={['ADMIN']} />}>
                <Route index element={<AdminDashboard />} />
                <Route path="doctors" element={<AdminDashboard />} /> 
                <Route path="pharmacy" element={<PharmacyAdmin />} />
                <Route path="settings" element={<AdminDashboard />} />
                </Route>

                <Route path="/patient-portal" element={<DashboardLayout allowedRoles={['PATIENT']} />}>
                <Route index element={<PatientPortal />} />
                <Route path="appointments" element={<PatientPortal />} />
                <Route path="prescriptions" element={<PatientPortal />} />
                <Route path="results" element={<PatientPortal />} />
                </Route>

                <Route path="/pharmacy-admin" element={<DashboardLayout allowedRoles={['PHARMACIST', 'ADMIN']} />}>
                <Route index element={<PharmacyAdmin />} />
                <Route path="orders" element={<PharmacyAdmin />} />
                <Route path="inventory" element={<PharmacyAdmin />} />
                </Route>

                <Route path="/doctor-dashboard" element={<DashboardLayout allowedRoles={['DOCTOR', 'ADMIN']} />}>
                <Route index element={<DoctorDashboard />} />
                <Route path="planning" element={<DoctorDashboard />} />
                </Route>

                {/* Default Catch */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            </HashRouter>
        </ClinicProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;