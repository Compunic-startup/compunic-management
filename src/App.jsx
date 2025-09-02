import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import your page components
import LoginPage from './page/LoginPage';
import AdminDashboard from './page/AdminDashboard';
import DeveloperDashboard from './page/DeveloperDashboard';
import TesterDashboard from './page/TesterDashboard';
import UnauthorizedPage from './page/UnauthorizedPage';
import DashboardRedirect from './page/DashboardRedirect'; // Import the new component
import HrDashboard from './page/HrDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/compunic-management">
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* --- Protected Routes --- */}
          
          {/* The new default route for logged-in users */}
          <Route path="/" element={ <ProtectedRoute allowedRoles={['admin', 'developer', 'tester', 'hr']}> <DashboardRedirect /> </ProtectedRoute> } />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/developer" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'developer']}>
                <DeveloperDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/tester" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'tester']}>
                <TesterDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/hr" element={ <ProtectedRoute allowedRoles={['admin','hr']}> <HrDashboard /> </ProtectedRoute> } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;