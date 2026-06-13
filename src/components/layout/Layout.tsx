import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useApp } from '../../context/AppContext';
import { BusinessBackground } from '../3d/BusinessBackground';
import { cn } from '../../lib/utils';
import { CostEstimatorWidget } from '../widgets/CostEstimatorWidget';

export function Layout() {
  const { sidebarOpen } = useApp();
  const location = useLocation();

  return (
    <div className="page-3d relative overflow-x-hidden">
      <BusinessBackground variant="dashboard" density="low" />

      {/* Main content layer — above orbs */}
      <div className="relative z-10">
        <Sidebar />
        <div className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-[72px]'
        )}>
          <Topbar />
          <main className="px-6 py-6 min-h-[calc(100vh-64px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Floating widgets */}
      <CostEstimatorWidget />
    </div>
  );
}
