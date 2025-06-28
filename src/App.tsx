import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Header } from './components/layout/Header';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { SuccessPage } from './pages/SuccessPage';
import { LoginPage } from './pages/admin/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { MenuManagementPage } from './pages/admin/MenuManagementPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public routes with customer header */}
            <Route path="/menu" element={
              <>
                <Header />
                <MenuPage />
              </>
            } />
            <Route path="/menu/cart" element={
              <>
                <Header />
                <CartPage />
              </>
            } />
            <Route path="/menu/success" element={
              <>
                <Header />
                <SuccessPage />
              </>
            } />

            {/* Admin login */}
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Protected admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="menu" element={<MenuManagementPage />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/menu" />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;