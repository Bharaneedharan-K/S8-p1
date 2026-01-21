import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { PrivateRoute, PublicRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ManageOfficersPage } from './pages/ManageOfficersPage';
import { ManageFarmersPage } from './pages/ManageFarmersPage';
import { FarmerVerificationPage } from './pages/FarmerVerificationPage';
import { OfficerVerificationPage } from './pages/OfficerVerificationPage';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/verify-land" element={<div className="min-h-screen flex items-center justify-center"><h1>🔍 Land Verification Coming Soon</h1></div>} />

          {/* Auth routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          {/* Farmer routes */}
          <Route
            path="/farmer/verify"
            element={
              <PrivateRoute requiredRole="FARMER">
                <FarmerVerificationPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/farmer/profile"
            element={
              <PrivateRoute requiredRole="FARMER">
                <div className="min-h-screen flex items-center justify-center"><h1>👤 Farmer Profile (Phase 2)</h1></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/farmer/lands"
            element={
              <PrivateRoute requiredRole="FARMER">
                <div className="min-h-screen flex items-center justify-center"><h1>🏞️ My Lands (Phase 3)</h1></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/farmer/schemes"
            element={
              <PrivateRoute requiredRole="FARMER">
                <div className="min-h-screen flex items-center justify-center"><h1>💰 Available Schemes (Phase 4)</h1></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/farmer/applications"
            element={
              <PrivateRoute requiredRole="FARMER">
                <div className="min-h-screen flex items-center justify-center"><h1>📊 My Applications (Phase 4)</h1></div>
              </PrivateRoute>
            }
          />

          {/* Officer routes */}
          <Route
            path="/officer/farmers"
            element={
              <PrivateRoute requiredRole="OFFICER">
                <OfficerVerificationPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/officer/add-land"
            element={
              <PrivateRoute requiredRole="OFFICER">
                <div className="min-h-screen flex items-center justify-center"><h1>📋 Add Land Record (Phase 3)</h1></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/officer/lands"
            element={
              <PrivateRoute requiredRole="OFFICER">
                <div className="min-h-screen flex items-center justify-center"><h1>📊 Land Records (Phase 3)</h1></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/officer/profile"
            element={
              <PrivateRoute requiredRole="OFFICER">
                <div className="min-h-screen flex items-center justify-center"><h1>👤 Officer Profile (Phase 1)</h1></div>
              </PrivateRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/officers"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <ManageOfficersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/farmers"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <ManageFarmersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/lands"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <div className="min-h-screen flex items-center justify-center"><h1>📋 Land Approvals (Phase 3)</h1></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/schemes"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <div className="min-h-screen flex items-center justify-center"><h1>💰 Manage Schemes (Phase 4)</h1></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <div className="min-h-screen flex items-center justify-center"><h1>📊 Applications (Phase 4)</h1></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/blockchain"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <div className="min-h-screen flex items-center justify-center"><h1>⛓️ Blockchain Logs (Phase 5)</h1></div>
              </PrivateRoute>
            }
          />

          {/* Error routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
