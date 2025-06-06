import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Stats from './pages/Stats';
import Reports from './pages/Reports';
import LostItems from './pages/LostItems';
import FoundItems from './pages/FoundItems';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/Stats" element={<Stats />} />
        <Route path="/Reports" element={<Reports />} />
        <Route path="/Reports/LostItems" element={<LostItems />} />
        <Route path="/Reports/FoundItems" element={<FoundItems />} />
        <Route path="/UserProfile" element={<UserProfile />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;