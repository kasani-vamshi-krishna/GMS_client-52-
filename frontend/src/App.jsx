

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GuestRegistration from './pages/GuestRegistration';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserHistory from './pages/UserHistory';  
import WatchmanDashboard from './pages/WatchmanDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<GuestRegistration />} />
        <Route path="/login" element={<Login />} />

        
        <Route path="/admin" element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
        } />
        
        
        <Route path="/admin/history" element={
            <ProtectedRoute role="ADMIN">
              <UserHistory />
            </ProtectedRoute>
        } />

        
        <Route path="/watchman" element={
            <ProtectedRoute role="WATCHMAN">
              <WatchmanDashboard />
            </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;