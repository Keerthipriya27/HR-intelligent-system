import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, UserRole, DashboardFilters, Project, Attribution } from '../lib/types';
import { MEETINGS, MEETING_COSTS, ATTRIBUTIONS, PROJECTS } from '../lib/mock-data';
import { detectAnomalies } from '../lib/utils';
import type { Anomaly } from '../lib/types';
import { EMPLOYEES } from '../lib/mock-data';
import { useAuth } from '../auth/useAuth';

interface AppContextType {
  currentUser: User;
  setRole: (role: UserRole) => void;
  filters: DashboardFilters;
  setFilters: (f: Partial<DashboardFilters>) => void;
  attributions: Map<string, Attribution>;
  updateAttribution: (meetingId: string, attr: Partial<Attribution>) => void;
  projects: Project[];
  addProject: (project: Project) => void;
  anomalies: Anomaly[];
  resolveAnomaly: (id: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  nlQueryResult: string | null;
  setNlQueryResult: (v: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const DEMO_USERS: Record<UserRole, User> = {
  admin: { id: 'u1', name: 'Sarah Chen', email: 'sarah.chen@costiq.ai', role: 'admin', department: 'Engineering' },
  finance: { id: 'u2', name: 'Marcus Williams', email: 'marcus.w@costiq.ai', role: 'finance', department: 'Engineering' },
  manager: { id: 'u3', name: 'Priya Patel', email: 'priya.p@costiq.ai', role: 'manager', department: 'Engineering' },
  employee: { id: 'u4', name: 'Elena Kowalski', email: 'elena.k@costiq.ai', role: 'employee', department: 'Engineering' },
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, isAuthenticated } = useAuth();
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (authUser && isAuthenticated) {
      return authUser;
    }
    return DEMO_USERS.admin;
  });

  // Sync auth user into app context when authentication state changes
  useEffect(() => {
    if (authUser && isAuthenticated) {
      setCurrentUser(authUser);
    }
  }, [authUser, isAuthenticated]);
  const [filters, setFiltersState] = useState<DashboardFilters>({ period: 'last_30d', projectId: null, departmentId: null });
  const [attributions, setAttributions] = useState<Map<string, Attribution>>(new Map(ATTRIBUTIONS));
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [anomalyResolved, setAnomalyResolved] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [nlQueryResult, setNlQueryResult] = useState<string | null>(null);

  const setRole = useCallback((role: UserRole) => {
    // When switching roles for demo, preserve the actual user's name but use demo role
    const demoUser = DEMO_USERS[role];
    setCurrentUser(prev => ({
      ...prev,
      role: demoUser.role,
      // Keep the actual user's name if authenticated, otherwise use demo name
      name: isAuthenticated && authUser ? authUser.name : demoUser.name,
      email: isAuthenticated && authUser ? authUser.email : demoUser.email,
    }));
  }, [authUser, isAuthenticated]);

  const setFilters = useCallback((f: Partial<DashboardFilters>) => {
    setFiltersState(prev => ({ ...prev, ...f }));
  }, []);

  const updateAttribution = useCallback((meetingId: string, update: Partial<Attribution>) => {
    setAttributions(prev => {
      const next = new Map(prev);
      const existing = next.get(meetingId);
      if (existing) next.set(meetingId, { ...existing, ...update });
      return next;
    });
  }, []);

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [...prev, project]);
  }, []);

  const rawAnomalies = detectAnomalies(MEETINGS, MEETING_COSTS, attributions, projects, EMPLOYEES);
  const anomalies = rawAnomalies.map(a => ({ ...a, resolved: anomalyResolved.has(a.id) }));

  const resolveAnomaly = useCallback((id: string) => {
    setAnomalyResolved(prev => new Set([...prev, id]));
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, setRole, filters, setFilters,
      attributions, updateAttribution,
      projects, addProject,
      anomalies, resolveAnomaly,
      sidebarOpen, setSidebarOpen,
      nlQueryResult, setNlQueryResult,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
