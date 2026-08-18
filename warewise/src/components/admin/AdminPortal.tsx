import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { AdminLayout } from './AdminLayout';
import { AdminLoginView } from './AdminLoginView';
import { AccessDeniedGuard } from './AccessDeniedGuard';
import { ErrorBoundary } from '../common/ErrorBoundary';

// Lazy-loaded heavy dashboard components
const CommandCenter = lazy(() => import('./CommandCenter').then(m => ({ default: m.CommandCenter })));
const InventoryModule = lazy(() => import('./InventoryModule').then(m => ({ default: m.InventoryModule })));
const OrdersModule = lazy(() => import('./OrdersModule').then(m => ({ default: m.OrdersModule })));
const AllocationModule = lazy(() => import('./AllocationModule').then(m => ({ default: m.AllocationModule })));
const PickingModule = lazy(() => import('./PickingModule').then(m => ({ default: m.PickingModule })));
const PackingModule = lazy(() => import('./PackingModule').then(m => ({ default: m.PackingModule })));
const QCModule = lazy(() => import('./QCModule').then(m => ({ default: m.QCModule })));
const DispatchModule = lazy(() => import('./DispatchModule').then(m => ({ default: m.DispatchModule })));
const ExceptionsModule = lazy(() => import('./ExceptionsModule').then(m => ({ default: m.ExceptionsModule })));
const AnalyticsModule = lazy(() => import('./AnalyticsModule').then(m => ({ default: m.AnalyticsModule })));
const AICopilotModule = lazy(() => import('./AICopilotModule').then(m => ({ default: m.AICopilotModule })));
const UsersModule = lazy(() => import('./UsersModule').then(m => ({ default: m.UsersModule })));
const ProductsCatalogModule = lazy(() => import('./ProductsCatalogModule').then(m => ({ default: m.ProductsCatalogModule })));
const WarehouseBinsModule = lazy(() => import('./WarehouseBinsModule').then(m => ({ default: m.WarehouseBinsModule })));
const AuditModule = lazy(() => import('./AuditModule').then(m => ({ default: m.AuditModule })));
const AlertsModule = lazy(() => import('./AlertsModule').then(m => ({ default: m.AlertsModule })));
const ReportsModule = lazy(() => import('./ReportsModule').then(m => ({ default: m.ReportsModule })));
const CommerceSuiteModule = lazy(() => import('./CommerceSuiteModule').then(m => ({ default: m.CommerceSuiteModule })));
const CustomersModule = lazy(() => import('./CustomersModule').then(m => ({ default: m.CustomersModule })));
const DecisionsSimulationModule = lazy(() => import('./DecisionsSimulationModule').then(m => ({ default: m.DecisionsSimulationModule })));
const PlatformSettingsModule = lazy(() => import('./PlatformSettingsModule').then(m => ({ default: m.PlatformSettingsModule })));

// Shimmer skeleton loading fallback
const DashboardModuleSkeleton: React.FC = () => (
  <div
    role="status"
    aria-label="Loading active warehouse module..."
    className="w-full space-y-6 animate-pulse p-1"
  >
    {/* Header Skeleton */}
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="space-y-2 max-w-lg">
        <div className="h-6 w-64 bg-stone-200 dark:bg-stone-800 rounded-md" />
        <div className="h-4 w-96 bg-stone-100 dark:bg-stone-800/60 rounded-md" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-28 bg-stone-200 dark:bg-stone-800 rounded-xl" />
        <div className="h-9 w-32 bg-stone-300 dark:bg-stone-700 rounded-xl" />
      </div>
    </div>

    {/* Metric Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 rounded-2xl space-y-3 shadow-xs">
          <div className="flex justify-between items-center">
            <div className="h-3 w-20 bg-stone-200 dark:bg-stone-800 rounded" />
            <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800" />
          </div>
          <div className="h-7 w-28 bg-stone-300 dark:bg-stone-700 rounded" />
          <div className="h-3 w-36 bg-stone-100 dark:bg-stone-800/80 rounded" />
        </div>
      ))}
    </div>

    {/* Data Table Skeleton */}
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-4">
        <div className="h-5 w-48 bg-stone-200 dark:bg-stone-800 rounded" />
        <div className="h-8 w-64 bg-stone-100 dark:bg-stone-800 rounded-lg" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="h-12 bg-stone-50 dark:bg-stone-800/40 rounded-xl w-full" />
        ))}
      </div>
    </div>
  </div>
);

export const AdminPortal: React.FC = () => {
  const {
    isAdminLoggedIn,
    activeAdminModule,
    setActiveAdminModule,
    hasPermission,
    activeAdminRole,
  } = useWarehouse();

  const [prevRole, setPrevRole] = useState(activeAdminRole);

  // Auto-redirect to primary authorized module for the new role if current is forbidden when role changes
  useEffect(() => {
    if (prevRole !== activeAdminRole) {
      setPrevRole(activeAdminRole);

      if (!hasPermission(activeAdminModule)) {
        switch (activeAdminRole) {
          case 'PICKER':
            setActiveAdminModule('05_PICKING');
            break;
          case 'PACKER':
            setActiveAdminModule('06_PACKING');
            break;
          case 'DISPATCHER':
          case 'DISPATCH_OPERATOR':
            setActiveAdminModule('08_DISPATCH');
            break;
          case 'INVENTORY_MANAGER':
            setActiveAdminModule('02_INVENTORY');
            break;
          case 'ORDER_MANAGER':
            setActiveAdminModule('03_ORDERS');
            break;
          case 'OFFICIAL':
            setActiveAdminModule('10_ANALYTICS');
            break;
          default:
            setActiveAdminModule('01_COMMAND');
            break;
        }
      }
    }
  }, [activeAdminRole, activeAdminModule, hasPermission, prevRole, setActiveAdminModule]);

  // If administrator is not logged in, render full-screen Admin Security Login Page
  if (!isAdminLoggedIn) {
    return <AdminLoginView />;
  }

  // Check if current operational role has permission for active module
  const canAccess = hasPermission(activeAdminModule);

  const renderModule = () => {
    if (!canAccess) {
      return <AccessDeniedGuard activeRole={activeAdminRole} moduleKey={activeAdminModule} />;
    }

    switch (activeAdminModule) {
      case '01_COMMAND':
        return <CommandCenter />;
      case '02_INVENTORY':
        return <InventoryModule />;
      case '03_ORDERS':
        return <OrdersModule />;
      case '04_ALLOCATION':
        return <AllocationModule />;
      case '05_PICKING':
        return <PickingModule />;
      case '06_PACKING':
        return <PackingModule />;
      case '07_QC':
        return <QCModule />;
      case '08_DISPATCH':
        return <DispatchModule />;
      case '09_EXCEPTIONS':
        return <ExceptionsModule />;
      case '10_ANALYTICS':
        return <AnalyticsModule />;
      case '11_COPILOT':
        return <AICopilotModule />;
      case '12_USERS':
        return <UsersModule />;
      case '13_PRODUCTS':
        return <ProductsCatalogModule />;
      case '14_BINS':
        return <WarehouseBinsModule />;
      case '15_AUDIT':
        return <AuditModule />;
      case '16_ALERTS':
        return <AlertsModule />;
      case '17_REPORTS':
        return <ReportsModule />;
      case '18_COMMERCE_SUITE':
        return <CommerceSuiteModule />;
      case '19_CUSTOMERS':
        return <CustomersModule />;
      case '20_INTELLIGENCE_SIM':
        return <DecisionsSimulationModule />;
      case '21_PLATFORM_SETTINGS':
        return <PlatformSettingsModule />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <AdminLayout>
      <ErrorBoundary key={activeAdminModule} sectionName={`Module Workspace (${activeAdminModule})`}>
        <Suspense fallback={<DashboardModuleSkeleton />}>
          {renderModule()}
        </Suspense>
      </ErrorBoundary>
    </AdminLayout>
  );
};

