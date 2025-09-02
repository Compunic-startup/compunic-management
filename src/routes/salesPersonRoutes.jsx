import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import CustomerForm from '../pages/customerForm';
import CustomerDisplay from '../pages/customerDisplay';
import Dashboard from '../pages/Dashboard';
import Invoices from '../pages/Invoices';
import Payments from '../pages/Payments';
import Products from '../pages/Products';
import ProductForm from '../pages/ProductForm';
import Sidebar from '../layouts/Sidebar';
import InvoiceForm from '../pages/InvoiceForm'; // InvoiceForm import karo
import '../styles/index.css';
import { Challan } from '../pages/challan';
import { ChallanForm } from '../pages/challan_form';
import PublicRoutes from './publicRoute';
import ProtectedRoute from './protectedRoute';
import '../styles/index.css';
import { GenerateInvoice } from '../pages/generateInvoice';
import { GenerateBillComponent } from '../pages/generateBill';
import CustomerFormDetailDisplay from '../pages/cutsomer_form_detail';
import Customer_detail_edit from '../pages/Customer_edit';
import { Product_detail } from '../pages/product_detail';
import { Product_edit } from '../pages/product_edit';
import { QuotationFrom } from '../pages/QuotationForm';
import { ChallanPreview } from '../pages/challan_preview';
import { ChallanEdit } from '../pages/challan_edit';
import { Quotation_edit } from '../pages/quotation_edit';
import DeliveryChallanTable from '../pages/deliveryChallan_table';
import QuotationTable from '../pages/quotation';
import { QuotationPreview } from '../pages/quotation_preview';
import { InvoicePreview } from '../pages/invoice_preview';
import { InvoiceEdit } from '../pages/invoice_edit';
import { GenerateChallan } from '../pages/generate_challan';
import { InvoiceSampleA4 } from '../layouts/a4SizeInvoiceLayout';
import { GenerateQuotationn } from '../pages/generateQuotation';
import HotkeyManager from '../components/hotKeyManager';
import LandingPage from '../pages/landingPage';
import { Inventory } from '../pages/inventory/inventory';
import NoRouteMatch from '../layouts/noRouteFound';
export function SalesPersonRoutes({
  setIsAuthenticated,
  isAuthenticated,
  isRefresh,
  setIsRefresh,
  setUserRoleRoutes
}) {
  return (
    <Router>
      <HotkeyManager />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={<PublicRoutes setUserRoleRoutes={setUserRoleRoutes} setAuth={setIsAuthenticated}></PublicRoutes>}
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
          path="/home"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<CustomerForm />}
            />
          }
        />
        {/* <Route
          path="/add-product"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<ProductForm />}
            />
          }
        /> */}
        <Route
          path="/display"
          element={
            <ProtectedRoute
              setRefresh={isRefresh}
              isAuthenticated={isAuthenticated}
              element={<CustomerDisplay />}
            />
          }
        />

        <Route
          path="/invoices"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<Invoices />}
            />
          }
        />
        <Route
          path="/add-invoice"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<InvoiceForm />}
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
          path="/add-challan"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<ChallanForm />}
            />
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<Payments />}
            />
          }
        />
        {/* <Route
          path="/products"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<Products />}
            />
          }
        /> */}

        <Route
          path="/generate-invoice"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<GenerateInvoice />}
            />
          }
        />
        <Route
          path="/generate-bill"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<GenerateBillComponent />}
            />
          }
        />
        <Route
          path="/customer-detail-display"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<CustomerFormDetailDisplay />}
            />
          }
        />
        <Route
          path="/customer_detail_edit"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<Customer_detail_edit />}
            />
          }
        />
        {/* <Route
          path="/product_detail_display"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<Product_detail />}
            />
          }
        /> */}
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
          path="/quotation"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<QuotationTable />}
            />
          }
        />
        <Route
          path="/add-quotation"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<QuotationFrom />}
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
          path="/quotation-edit"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<Quotation_edit />}
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
        <Route
          path="/quotation-preview"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<QuotationPreview />}
            />
          }
        />
        <Route
          path="/invoice-preview"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<InvoicePreview />}
            />
          }
        />
        <Route
          path="/invoice-edit"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<InvoiceEdit />}
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
          path="/invoiceSampleA4"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<InvoiceSampleA4 />}
            />
          }
        />

        <Route
          path="/generate-quotation"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              element={<GenerateQuotationn />}
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
        <Route path="*" element={<NoRouteMatch />} />
      </Routes>
    </Router>
  );
}
