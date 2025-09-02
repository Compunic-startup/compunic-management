import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import PublicRoutes from './publicRoutes';
import ProtectedRoute from './protectedRoutes';
import DashboardView from '../page/dashboard';
import AdminPanel from '../page/adminPanel';
import ManagerPanel from '../page/managerPanel';
export function AdminRoutes({setIsAuthenticated,isAuthenticated,isRefresh,setIsRefresh,setUserRoleRoutes}){
    return(
        <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={<PublicRoutes setUserRoleRoutes={setUserRoleRoutes} setAuth={setIsAuthenticated}></PublicRoutes>}
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<DashboardView />}
            />
          }
        />
        <Route
          path="/adminPanel"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<AdminPanel />}
            />
          }
          
        />
        <Route
          path="/managerView"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<ManagerPanel />}
            />
          }
          
        />
        {/* <Route
          path="*"
          element={<NoRouteMatch/>}
        /> */}
      </Routes>
    </Router>
    )
}