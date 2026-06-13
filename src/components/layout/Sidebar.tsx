import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Zap, Users, AlertTriangle,
  Settings, Brain, TrendingUp, X, Sparkles,
  LineChart, Bot, User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { to: '/',            label: 'Dashboard',      icon: LayoutDashboard, color: 'text-violet-600' },
  { to: '/attribution', label: 'AI Attribution', icon: Brain,           color: 'text-indigo-600' },
  { to: '/employees',   label: 'Employees',      icon: Users,           color: 'text-sky-600'    },
  { to: '/anomalies',   label: 'Anomalies',      icon: AlertTriangle,   color: 'text-amber-600'  },
  { to: '/insights',    label: 'Exec Insights',  icon: Sparkles,        color: 'text-purple-600' },
  { to: '/forecasting', label: 'Forecasting',    icon: LineChart,       color: 'text-emerald-600'},
  { to: '/ai-assistant',label: 'AI Assistant',   icon: Bot,             color: 'text-rose-600'   },
  { to: '/settings',    label: 'Settings',       icon: Settings,        color: 'text-slate-500'  },
  { to: '/profile',     label: 'Profile',         icon: User,            color: 'text-violet-500' },
];

const sidebarVariants = {
  open: { width: 256 },
  closed: { width: 72 },
};



export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, anomalies } = useApp();
  const criticalCount = anomalies.filter(a => !a.resolved && a.severity === 'critical').length;

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/15 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        variants={sidebarVariants}
        animate={sidebarOpen ? 'open' : 'closed'}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          'fixed top-0 left-0 h-full z-40 flex flex-col overflow-hidden',
          'glass-strong border-r border-white/50',
          'shadow-[4px_0_32px_rgba(0,0,0,0.06)]',
          !sidebarOpen && '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100/80 flex-shrink-0">
          <motion.div
            className="flex-shrink-0 w-9 h-9 rounded-xl gradient-violet flex items-center justify-center shadow-lg shadow-violet-300/40 orb-pulse cursor-pointer"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <TrendingUp className="w-4.5 h-4.5 text-white" size={18} />
          </motion.div>

          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-[15px] tracking-tight">CostIQ</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-violet-600 text-white tracking-wide">AI</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">HR Intelligence</p>
              </motion.div>
            )}
          </AnimatePresence>

          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 lg:hidden ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(({ to, label, icon: Icon, color }, i) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
            >
              {({ isActive }) => (
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer',
                    'transition-colors duration-150 group',
                    isActive
                      ? 'sidebar-active'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <Icon
                      className={cn('transition-all duration-200',
                        isActive ? color : 'text-slate-400 group-hover:text-slate-600'
                      )}
                      size={17}
                    />
                    {/* Anomaly badge */}
                    {to === '/anomalies' && criticalCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                      >
                        {criticalCount}
                      </motion.span>
                    )}
                  </div>

                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.18 }}
                        className={cn(
                          'text-sm font-medium truncate flex-1',
                          isActive ? 'text-violet-700' : ''
                        )}
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active indicator dot */}
                  {isActive && !sidebarOpen && (
                    <motion.div
                      layoutId="active-dot"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-600"
                    />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* AI Status badge */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="mx-3 mb-5 p-3.5 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50/50 border border-violet-200/50"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-lg bg-violet-600 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-bold text-violet-800">Claude AI Active</span>
                <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-violet-600/80 leading-relaxed">
                92.4% attribution accuracy across 65 meetings
              </p>
              <div className="mt-2 h-1 bg-violet-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '92.4%' }}
                  transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
}
