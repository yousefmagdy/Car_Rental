import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Cars from './pages/Cars';
import Employees from './pages/Employees';
import Clients from './pages/Clients';
import Rentals from './pages/Rentals';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/cars" replace />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/rentals" element={<Rentals />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

