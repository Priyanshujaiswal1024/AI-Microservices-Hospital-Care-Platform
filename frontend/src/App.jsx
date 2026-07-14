import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// public / auth pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/auth/AuthPage';
import OAuthRedirectHandler from './auth/OAuthRedirectHandler';
import ApiTesterPage from './pages/ApiTesterPage';

// patient pages
import PatientLayout from './pages/patient/PatientLayout';
import PatientProfile from './pages/patient/PatientProfile';
import CreateProfile from './pages/patient/CreateProfile';
import Appointments from './pages/patient/Appointments';
import FindDoctors from './pages/patient/FindDoctors';
import BookAppointment from './pages/patient/BookAppointment';
import Departments from './pages/patient/Departments';
import Prescriptions from './pages/patient/Prescriptions';
import Bills from './pages/patient/Bills';
import Insurance from './pages/patient/Insurance';
import MedicalRecords from './pages/patient/MedicalRecords';
import Medicines from './pages/patient/Medicines';

// doctor pages
import DoctorLayout from './pages/doctor/DoctorLayout';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import SetAvailability from './pages/doctor/SetAvailability';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorMedicalRecords from './pages/doctor/DoctorMedicalRecords';
import DoctorMedicines from './pages/doctor/DoctorMedicines';

// admin page
import AdminDashboard from './pages/admin/AdminDashboard';

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/landing" replace />;
  if (user.role === 'PATIENT') return <Navigate to="/patient/profile" replace />;
  if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/landing" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public / Auth routes */}
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/api-tester" element={<ApiTesterPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/verify-otp" element={<AuthPage />} />
          <Route path="/forgot-password" element={<AuthPage />} />
          <Route path="/oauth/callback" element={<OAuthRedirectHandler />} />

          {/* Patient registration profile (outside sidebar layout) */}
          <Route
            path="/patient/create-profile"
            element={
              <ProtectedRoute allowedRole="PATIENT">
                <CreateProfile />
              </ProtectedRoute>
            }
          />

          {/* Patient routes (with sidebar) */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRole="PATIENT">
                <PatientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="doctors" element={<FindDoctors />} />
            <Route path="doctors/:doctorId/book" element={<BookAppointment />} />
            <Route path="departments" element={<Departments />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="bills" element={<Bills />} />
            <Route path="insurance" element={<Insurance />} />
            <Route path="medical-records" element={<MedicalRecords />} />
            <Route path="medicines" element={<Medicines />} />
          </Route>

          {/* Doctor routes (with sidebar) */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRole="DOCTOR">
                <DoctorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="availability" element={<SetAvailability />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="appointments/:appointmentId/prescribe" element={<DoctorPrescriptions />} />
            <Route path="appointments/:appointmentId/record" element={<DoctorMedicalRecords />} />
            <Route path="medicines" element={<DoctorMedicines />} />
            <Route path="prescriptions" element={<DoctorPrescriptions />} />
            <Route path="records" element={<DoctorMedicalRecords />} />
          </Route>

          {/* Admin routes (without standard sidebar, dashboard holds operations) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
