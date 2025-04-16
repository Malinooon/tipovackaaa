import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateLeague from './pages/CreateLeague';
import JoinLeague from './pages/JoinLeague';
import LeagueDetail from './pages/LeagueDetail';
import Predictions from './pages/Predictions';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

// CSS
import './App.css';

function App() {
  const { isAuthenticated, user, loading } = useAuth();

  // Ochrana cest - pouze pro přihlášené uživatele
  const PrivateRoute = ({ children }) => {
    if (loading) return <div>Načítání...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  // Ochrana cest - pouze pro administrátory
  const AdminRoute = ({ children }) => {
    if (loading) return <div>Načítání...</div>;
    return isAuthenticated && user?.isAdmin ? children : <Navigate to="/dashboard" />;
  };

  // Ochrana cest - pouze pro nepřihlášené uživatele
  const PublicRoute = ({ children }) => {
    if (loading) return <div>Načítání...</div>;
    return !isAuthenticated ? children : <Navigate to="/dashboard" />;
  };

  return (
    <Routes>
      {/* Veřejné cesty */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
      </Route>

      {/* Privátní cesty */}
      <Route path="/" element={<MainLayout />}>
        <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="create-league" element={<PrivateRoute><CreateLeague /></PrivateRoute>} />
        <Route path="join-league" element={<PrivateRoute><JoinLeague /></PrivateRoute>} />
        <Route path="leagues/:leagueId" element={<PrivateRoute><LeagueDetail /></PrivateRoute>} />
        <Route path="leagues/:leagueId/predictions" element={<PrivateRoute><Predictions /></PrivateRoute>} />
        <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      </Route>

      {/* 404 stránka */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
