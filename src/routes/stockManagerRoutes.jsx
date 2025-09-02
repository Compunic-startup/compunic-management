import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import ProductForm from '../pages/ProductForm';
import Sidebar from '../layouts/Sidebar';
import '../styles/index.css';
import PublicRoutes from './publicRoute';
import ProtectedRoute from './protectedRoute';
import '../styles/index.css';
import { Product_detail } from '../pages/product_detail';
import { Product_edit } from '../pages/product_edit';
import { PurchaseForm } from '../pages/purchaseForm';
import { PurchasePreview } from '../pages/purchasePreview';
import { PurchaseEdit } from '../pages/purchaseEdit';
import HotkeyManager from '../components/hotKeyManager';
import LandingPage from '../pages/landingPage';
import { GeneratePurchase } from '../pages/generatePurchase';
import { Inventory } from '../pages/inventory/inventory';
import NoRouteMatch from '../layouts/noRouteFound';
import PurchaseTable from '../pages/purchaseTable';
export function StockManagerRoutes({setIsAuthenticated,isAuthenticated,isRefresh,setIsRefresh}){
    return(
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
          path="/add-product"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<ProductForm />}
            />
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<Products />}
            />
          }
        />
        <Route
          path="/product_detail_display"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<Product_detail />}
            />
          }
        />
        <Route
          path="/product_detail_edit"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<Product_edit />}
            />
          }
        />
        <Route
          path="/purchaseForm"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<PurchaseForm />}
            />
          }
        />
         <Route
          path="/purchase-table"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<PurchaseTable />}
            />
          }
        />
        <Route
          path="/purchasePreview"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<PurchasePreview />}
            />
          }
        />
        <Route
          path="/purchaseEdit"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<PurchaseEdit />}
            />
          }
        />
        <Route
          path="/generate-purchase"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<GeneratePurchase />}
            />
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<Inventory />}
            />
          }
        />
        <Route
          path="*"
          element={<NoRouteMatch/>}
        />
      </Routes>
    </Router>
    )
}