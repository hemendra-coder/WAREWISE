import React from 'react';
import { WarehouseProvider, useWarehouse } from './context/WarehouseContext';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { AdminLoginModal } from './components/auth/AdminLoginModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function MainLayout() {
  const { activePortal, isAdminLoginModalOpen } = useWarehouse();

  return (
    <ErrorBoundary sectionName="WareWise Main Application Root">
      {activePortal === 'ADMIN' ? (
        <ErrorBoundary sectionName="Admin Operations Portal Framework">
          <AdminPortal />
        </ErrorBoundary>
      ) : (
        <ErrorBoundary sectionName="Customer Storefront Portal Framework">
          <CustomerPortal />
        </ErrorBoundary>
      )}
      {isAdminLoginModalOpen && <AdminLoginModal />}
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ErrorBoundary sectionName="WareWise System Provider">
      <WarehouseProvider>
        <MainLayout />
      </WarehouseProvider>
    </ErrorBoundary>
  );
}



