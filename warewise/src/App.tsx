import React from 'react';
import { WarehouseProvider, useWarehouse } from './context/WarehouseContext';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { AdminLoginModal } from './components/auth/AdminLoginModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function MainLayout() {
  const { activePortal, isAdminLoginModalOpen } = useWarehouse();

  return (
    <main id="main-content" role="main" aria-label="WareWise application workspace" className="min-h-screen">
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
    </main>
  );
}

export default function App() {
  return (
    <ErrorBoundary sectionName="WareWise System Provider">
      <WarehouseProvider>
        <div role="application" aria-label="WareWise enterprise operations platform">
          <MainLayout />
        </div>
      </WarehouseProvider>
    </ErrorBoundary>
  );
}



