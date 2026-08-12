import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { AppLayout } from './layouts/AppLayout';
import { ChallanDetailPage } from './pages/ChallanDetailPage';
import { ChallanFormPage } from './pages/ChallanFormPage';
import { ChallansPage } from './pages/ChallansPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { CustomersPage } from './pages/CustomersPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { ProductsPage } from './pages/ProductsPage';
import { StockMovementsPage } from './pages/StockMovementsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="stock-movements" element={<StockMovementsPage />} />
              <Route path="challans" element={<ChallansPage />} />
              <Route element={<RequireAuth roles={['ADMIN', 'SALES']} />}>
                <Route path="challans/new" element={<ChallanFormPage />} />
              </Route>
              <Route path="challans/:id" element={<ChallanDetailPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
