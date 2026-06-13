export interface Employee {
  id: string;
  name: string;
  email: string;
  designation: 'IC1' | 'IC2' | 'IC3' | 'IC4' | 'M1' | 'M2';
  department: string;
  calendarId: string;
  avatar?: string;
}

export interface SalaryBand {
  band: Employee['designation'];
  label: string;
  hourlyRate: number;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  attendeeIds: string[];
  startTime: Date;
  durationMinutes: number;
  recurrenceRule?: string;
  source: 'google' | 'outlook';
  rawCalendarData: Record<string, unknown>;
}

export interface Attribution {
  meetingId: string;
  projectId: string | null;
  confidence: number;
  reasoning: string;
  method: 'ai_auto' | 'ai_flagged' | 'human_confirmed' | 'human_corrected' | 'unattributed';
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  monthlyBudget?: number;
  tags: string[];
  autoDetected?: boolean;
  roiScore?: number;
  deliverables?: number;
}

export interface MeetingCost {
  meetingId: string;
  projectId: string | null;
  totalCost: number;
  breakdown: Array<{
    employeeId: string;
    designation: string;
    hourlyRate: number;
    cost: number;
  }>;
}

export interface Anomaly {
  id: string;
  type: 'budget_overrun' | 'unattributed_cluster' | 'employee_overload' | 'new_project_detected' | 'recurring_no_agenda';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  relatedProjectId?: string;
  relatedEmployeeId?: string;
  detectedAt: Date;
  resolved: boolean;
}

export type UserRole = 'admin' | 'finance' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  mfaEnabled?: boolean;
  isTrustedDevice?: boolean;
}

export interface DashboardFilters {
  period: 'last_30d' | 'last_quarter' | 'ytd';
  projectId: string | null;
  departmentId: string | null;
}

// ─── Auth Types ───

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'mfa_required';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

export interface DeviceFingerprint {
  id: string;
  label: string;
  lastUsed: string;
  trusted: boolean;
  expiresAt: number;
}

export interface MFAEnrollment {
  factorId: string;
  qrCode: string;
  secret?: string;
}

export interface RolePermissions {
  canViewSalaryData: boolean;
  canEditAttribution: boolean;
  canManageProjects: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
  canViewAnomalies: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewSalaryData: true,
    canEditAttribution: true,
    canManageProjects: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canExportData: true,
    canViewAnomalies: true,
  },
  finance: {
    canViewSalaryData: true,
    canEditAttribution: true,
    canManageProjects: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canExportData: true,
    canViewAnomalies: true,
  },
  manager: {
    canViewSalaryData: false,
    canEditAttribution: true,
    canManageProjects: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canExportData: false,
    canViewAnomalies: true,
  },
  employee: {
    canViewSalaryData: false,
    canEditAttribution: false,
    canManageProjects: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canExportData: false,
    canViewAnomalies: false,
  },
};

export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/': ['admin', 'finance', 'manager', 'employee'],
  '/attribution': ['admin', 'finance', 'manager', 'employee'],
  '/employees': ['admin', 'finance', 'manager', 'employee'],
  '/anomalies': ['admin', 'finance', 'manager', 'employee'],
  '/settings': ['admin', 'finance', 'manager', 'employee'],
  '/admin': ['admin', 'finance', 'manager', 'employee'],
};
