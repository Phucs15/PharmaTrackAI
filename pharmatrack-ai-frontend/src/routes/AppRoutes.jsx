import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { MANAGEMENT_ROLES, ADMIN_ONLY } from '@/constants/roles';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const MedicineManagementPage = lazy(() => import('@/pages/medicines/MedicineManagementPage'));
const MedicineDetailsPage = lazy(() => import('@/pages/medicines/MedicineDetailsPage'));
const AddEditMedicineWizard = lazy(() => import('@/pages/medicines/AddEditMedicineWizard'));
const BatchManagementPage = lazy(() => import('@/pages/batches/BatchManagementPage'));
const InventoryInPage = lazy(() => import('@/pages/inventory/InventoryInPage'));
const InventoryOutPage = lazy(() => import('@/pages/inventory/InventoryOutPage'));
const ExpiryMonitoringPage = lazy(() => import('@/pages/expiry/ExpiryMonitoringPage'));
const AIForecastPage = lazy(() => import('@/pages/ai-forecast/AIForecastPage'));
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const UserManagementPage = lazy(() => import('@/pages/users/UserManagementPage'));
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function RouteFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/medicines" element={<MedicineManagementPage />}>
              <Route element={<RoleProtectedRoute allowedRoles={MANAGEMENT_ROLES} />}>
                <Route path="new" element={<AddEditMedicineWizard />} />
                <Route path=":id/edit" element={<AddEditMedicineWizard />} />
              </Route>
            </Route>
            <Route path="/medicines/:id" element={<MedicineDetailsPage />} />

            <Route path="/batches" element={<BatchManagementPage />} />
            <Route path="/inventory/in" element={<InventoryInPage />} />
            <Route path="/inventory/out" element={<InventoryOutPage />} />
            <Route path="/expiry-monitoring" element={<ExpiryMonitoringPage />} />

            <Route element={<RoleProtectedRoute allowedRoles={MANAGEMENT_ROLES} />}>
              <Route path="/ai-forecast" element={<AIForecastPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            <Route path="/settings" element={<SettingsPage />} />

            <Route element={<RoleProtectedRoute allowedRoles={ADMIN_ONLY} />}>
              <Route path="/settings/users" element={<UserManagementPage />} />
            </Route>

            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
