import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Sidebar from '../layouts/Sidebar';
import '../styles/index.css';
import { Challan } from '../pages/challan';
import { ChallanForm } from '../pages/challan_form';
import PublicRoutes from './publicRoute';
import ProtectedRoute from './protectedRoute';
import '../styles/index.css';
import { ChallanPreview } from '../pages/challan_preview';
import { ChallanEdit } from '../pages/challan_edit';
import DeliveryChallanTable from '../pages/deliveryChallan_table';
import { GenerateChallan } from '../pages/generate_challan';
import HotkeyManager from '../components/hotKeyManager';
import LandingPage from '../pages/landingPage';
import NoRouteMatch from '../layouts/noRouteFound';
export function DeliveryBoyRoutes({
  setIsAuthenticated,
  isAuthenticated,
  isRefresh,
  setIsRefresh,
}) {
  return (
    <Router>
      <HotkeyManager />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={<PublicRoutes setAuth={setIsAuthenticated}></PublicRoutes>}
        />
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="*" element={<LandingPage/>} /> */}

        {/* Protected Routes */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<Dashboard />}
            />
          }
        />
        <Route
          path="/sidebar"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<Sidebar />}
            />
          }
        />

        <Route
          path="/challan"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<Challan />}
            />
          }
        />
        <Route
          path="/generate-challan"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<GenerateChallan />}
            />
          }
        />
        <Route
          path="/add-challan"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<ChallanForm />}
            />
          }
        />

        <Route
          path="/challan-preview"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<ChallanPreview />}
            />
          }
        />
        <Route
          path="/challan-edit"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<ChallanEdit />}
            />
          }
        />

        <Route
          path="/deliverychallan-table"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<DeliveryChallanTable />}
            />
          }
        />

        <Route path="*" element={<NoRouteMatch />} />
      </Routes>
    </Router>
  );
}
