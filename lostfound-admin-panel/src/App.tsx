import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Import AuthProvider and useAuth
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

import Login from './pages/Login';
import Home from './pages/Home';
import Reports from './pages/Reports';
import AddItem from './pages/AddItem';
import UserProfile from './pages/UserProfile';
import FoundItems from './pages/FoundItems';
import LostItems from './pages/LostItems';
import Stats from './pages/Stats';
import ForgotPassword from './pages/ForgotPassword';
import Archive from './pages/Archive';

import './App.css';

// Helper component to handle redirection if already logged in
const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const { token, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>; // Or some loading indicator
  }
  return token ? <Navigate to="/Home" /> : children;
};


const AppContent: React.FC = () => {
  // useAuth can be used here if AppContent needs auth details,
  // but for routing, ProtectedRoute handles it.
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/Login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/ForgotPassword" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/Home" element={<Home />} />
        <Route path="/Reports" element={<Reports />} />
        <Route path="/AddItem" element={<AddItem />} />
        <Route path="/UserProfile" element={<UserProfile />} />
        <Route path="/FoundItems" element={<FoundItems />} />
        <Route path="/LostItems" element={<LostItems />} />
        <Route path="/Archive" element={<Archive />} />
        <Route path="/Stats" element={<Stats />} />
        {/* Add other protected routes here */}
      </Route>

      {/* Redirect root to Home if logged in, or Login if not */}
      <Route
        path="/"
        element={
          <InitialRedirect />
        }
      />
      {/* Fallback for unmatched routes (optional) */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const InitialRedirect: React.FC = () => {
  const { token, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>; // Or your app's loading component
  }
  return token ? <Navigate to="/Home" replace /> : <Navigate to="/Login" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;