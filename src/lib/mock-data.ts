import type { Employee, SalaryBand, Meeting, Attribution, Project, MeetingCost } from './types';

export const SALARY_BANDS: SalaryBand[] = [
  { band: 'IC1', label: 'Junior Engineer / Analyst', hourlyRate: 55 },
  { band: 'IC2', label: 'Mid-Level Engineer', hourlyRate: 80 },
  { band: 'IC3', label: 'Senior Engineer / Lead', hourlyRate: 110 },
  { band: 'IC4', label: 'Staff / Principal Engineer', hourlyRate: 145 },
  { band: 'M1', label: 'Engineering Manager', hourlyRate: 130 },
  { band: 'M2', label: 'Director / VP', hourlyRate: 160 },
];

export const EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Sarah Chen', email: 'sarah.chen@costiq.ai', designation: 'M2', department: 'Engineering', calendarId: 'sarah.chen@costiq.ai' },
  { id: 'e2', name: 'Marcus Williams', email: 'marcus.w@costiq.ai', designation: 'M1', department: 'Engineering', calendarId: 'marcus.w@costiq.ai' },
  { id: 'e3', name: 'Priya Patel', email: 'priya.p@costiq.ai', designation: 'IC4', department: 'Engineering', calendarId: 'priya.p@costiq.ai' },
  { id: 'e4', name: 'James O\'Brien', email: 'james.ob@costiq.ai', designation: 'IC3', department: 'Engineering', calendarId: 'james.ob@costiq.ai' },
  { id: 'e5', name: 'Aisha Johnson', email: 'aisha.j@costiq.ai', designation: 'IC2', department: 'Product', calendarId: 'aisha.j@costiq.ai' },
  { id: 'e6', name: 'Tomás Rivera', email: 'tomas.r@costiq.ai', designation: 'IC3', department: 'Product', calendarId: 'tomas.r@costiq.ai' },
  { id: 'e7', name: 'Li Wei', email: 'li.wei@costiq.ai', designation: 'IC2', department: 'Design', calendarId: 'li.wei@costiq.ai' },
  { id: 'e8', name: 'Elena Kowalski', email: 'elena.k@costiq.ai', designation: 'IC1', department: 'Engineering', calendarId: 'elena.k@costiq.ai' },
  { id: 'e9', name: 'David Park', email: 'david.p@costiq.ai', designation: 'IC3', department: 'Data', calendarId: 'david.p@costiq.ai' },
  { id: 'e10', name: 'Nina Okafor', email: 'nina.o@costiq.ai', designation: 'M1', department: 'Product', calendarId: 'nina.o@costiq.ai' },
  { id: 'e11', name: 'Ryan Xu', email: 'ryan.x@costiq.ai', designation: 'IC2', department: 'Data', calendarId: 'ryan.x@costiq.ai' },
  { id: 'e12', name: 'Sofia Martinez', email: 'sofia.m@costiq.ai', designation: 'IC3', department: 'Engineering', calendarId: 'sofia.m@costiq.ai' },
];

export const PROJECTS: Project[] = [
  { id: 'p1', name: 'Platform v3', color: '#7c3aed', monthlyBudget: 85000, tags: ['platform', 'v3', 'infrastructure', 'backend', 'api'], roiScore: 82, deliverables: 14 },
  { id: 'p2', name: 'Sales CRM', color: '#0ea5e9', monthlyBudget: 40000, tags: ['crm', 'sales', 'customer', 'revenue', 'pipeline'], roiScore: 91, deliverables: 8 },
  { id: 'p3', name: 'Data Infrastructure', color: '#10b981', monthlyBudget: 55000, tags: ['data', 'infra', 'infrastructure', 'pipeline', 'warehouse', 'analytics'], roiScore: 74, deliverables: 6 },
  { id: 'p4', name: 'Mobile App', color: '#f59e0b', monthlyBudget: 48000, tags: ['mobile', 'ios', 'android', 'app', 'native'], roiScore: 88, deliverables: 11 },
  { id: 'p5', name: 'BI Dashboard', color: '#ef4444', monthlyBudget: 30000, tags: ['bi', 'dashboard', 'business intelligence', 'reporting', 'metrics'], roiScore: 95, deliverables: 9 },
  { id: 'p6', name: 'AI Pilot', color: '#8b5cf6', monthlyBudget: 25000, tags: ['ai', 'pilot', 'ml', 'machine learning', 'llm'], autoDetected: true, roiScore: 67, deliverables: 3 },
];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 8) + 8, [0, 15, 30, 45][Math.floor(Math.random() * 4)], 0, 0);
  return d;
}

export const MEETINGS: Meeting[] = [
  // Platform v3 — clear attribution
  { id: 'm1', title: 'Platform v3 Sprint Planning', description: 'Q2 sprint planning for platform v3 roadmap', attendeeIds: ['e1','e2','e3','e4','e12'], startTime: daysAgo(28), durationMinutes: 90, recurrenceRule: 'WEEKLY', source: 'google', rawCalendarData: {} },
  { id: 'm2', title: 'Platform v3 Architecture Review', description: 'Backend API design for v3 migration', attendeeIds: ['e2','e3','e4'], startTime: daysAgo(27), durationMinutes: 60, source: 'google', rawCalendarData: {} },
  { id: 'm3', title: 'Platform v3 Backend Standup', description: 'Daily sync for platform backend team', attendeeIds: ['e3','e4','e12'], startTime: daysAgo(26), durationMinutes: 15, recurrenceRule: 'DAILY', source: 'google', rawCalendarData: {} },
  { id: 'm4', title: 'Platform v3 Sprint Review', description: 'Sprint 14 demo and retrospective', attendeeIds: ['e1','e2','e3','e4','e5','e7','e12'], startTime: daysAgo(14), durationMinutes: 90, source: 'google', rawCalendarData: {} },
  { id: 'm5', title: 'Platform v3 Security Audit Review', description: 'Infrastructure security findings', attendeeIds: ['e1','e2','e3'], startTime: daysAgo(10), durationMinutes: 60, source: 'google', rawCalendarData: {} },
  { id: 'm6', title: 'Platform API Spec Walkthrough', description: 'REST API documentation review', attendeeIds: ['e3','e4','e6','e12'], startTime: daysAgo(8), durationMinutes: 45, source: 'google', rawCalendarData: {} },
  { id: 'm7', title: 'Platform v3 Load Testing Sync', attendeeIds: ['e2','e3','e4'], startTime: daysAgo(5), durationMinutes: 30, source: 'google', rawCalendarData: {} },
  { id: 'm8', title: 'Platform v3 Deployment Runbook Review', attendeeIds: ['e1','e2','e3','e4','e12'], startTime: daysAgo(3), durationMinutes: 60, source: 'google', rawCalendarData: {} },
  { id: 'm9', title: 'Platform v3 Standup', attendeeIds: ['e3','e4','e12'], startTime: daysAgo(25), durationMinutes: 15, recurrenceRule: 'DAILY', source: 'google', rawCalendarData: {} },
  { id: 'm10', title: 'Platform v3 Standup', attendeeIds: ['e3','e4','e12'], startTime: daysAgo(24), durationMinutes: 15, recurrenceRule: 'DAILY', source: 'google', rawCalendarData: {} },
  { id: 'm11', title: 'Platform v3 Standup', attendeeIds: ['e3','e4','e12'], startTime: daysAgo(23), durationMinutes: 15, recurrenceRule: 'DAILY', source: 'google', rawCalendarData: {} },
  { id: 'm12', title: 'Platform v3 Backlog Grooming', attendeeIds: ['e1','e2','e3','e4','e6'], startTime: daysAgo(21), durationMinutes: 60, source: 'google', rawCalendarData: {} },

  // Sales CRM — clear attribution
  { id: 'm13', title: 'CRM Integration Kickoff', description: 'Kicking off Salesforce + CRM integration', attendeeIds: ['e1','e5','e6','e10'], startTime: daysAgo(27), durationMinutes: 60, source: 'outlook', rawCalendarData: {} },
  { id: 'm14', title: 'Sales CRM Feature Review', description: 'Pipeline dashboard features', attendeeIds: ['e5','e6','e10'], startTime: daysAgo(20), durationMinutes: 45, source: 'outlook', rawCalendarData: {} },
  { id: 'm15', title: 'CRM Revenue Pipeline Design', attendeeIds: ['e5','e6','e7','e10'], startTime: daysAgo(18), durationMinutes: 60, source: 'outlook', rawCalendarData: {} },
  { id: 'm16', title: 'Sales CRM Sprint Planning', attendeeIds: ['e5','e6','e10'], startTime: daysAgo(14), durationMinutes: 60, recurrenceRule: 'BIWEEKLY', source: 'outlook', rawCalendarData: {} },
  { id: 'm17', title: 'CRM Customer Onboarding Flow Review', attendeeIds: ['e5','e6','e7','e10'], startTime: daysAgo(10), durationMinutes: 45, source: 'outlook', rawCalendarData: {} },
  { id: 'm18', title: 'Sales CRM QA Handoff', attendeeIds: ['e5','e6','e8'], startTime: daysAgo(7), durationMinutes: 30, source: 'outlook', rawCalendarData: {} },

  // Data Infrastructure — clear attribution
  { id: 'm19', title: 'Data Infra Capacity Review', description: 'Warehouse capacity planning Q2', attendeeIds: ['e1','e9','e11'], startTime: daysAgo(25), durationMinutes: 60, source: 'google', rawCalendarData: {} },
  { id: 'm20', title: 'Data Pipeline Architecture Sync', attendeeIds: ['e9','e11'], startTime: daysAgo(22), durationMinutes: 45, source: 'google', rawCalendarData: {} },
  { id: 'm21', title: 'Data Infrastructure Sprint Review', attendeeIds: ['e1','e9','e11','e2'], startTime: daysAgo(15), durationMinutes: 60, source: 'google', rawCalendarData: {} },
  { id: 'm22', title: 'Analytics Warehouse Migration Planning', description: 'Migrating from Redshift to Snowflake', attendeeIds: ['e9','e11','e3'], startTime: daysAgo(12), durationMinutes: 90, source: 'google', rawCalendarData: {} },
  { id: 'm23', title: 'Data Infra On-Call Handoff', attendeeIds: ['e9','e11'], startTime: daysAgo(8), durationMinutes: 30, recurrenceRule: 'WEEKLY', source: 'google', rawCalendarData: {} },

  // Mobile App — clear attribution
  { id: 'm24', title: 'Mobile App Sprint 7 Planning', attendeeIds: ['e2','e4','e7','e8','e12'], startTime: daysAgo(28), durationMinutes: 90, recurrenceRule: 'BIWEEKLY', source: 'google', rawCalendarData: {} },
  { id: 'm25', title: 'iOS Native Performance Review', attendeeIds: ['e4','e8','e12'], startTime: daysAgo(20), durationMinutes: 60, source: 'google', rawCalendarData: {} },
  { id: 'm26', title: 'Android App UX Review', attendeeIds: ['e7','e8','e12'], startTime: daysAgo(17), durationMinutes: 45, source: 'google', rawCalendarData: {} },
  { id: 'm27', title: 'Mobile App QA Sync', attendeeIds: ['e8','e12','e4'], startTime: daysAgo(13), durationMinutes: 30, source: 'google', rawCalendarData: {} },
  { id: 'm28', title: 'Mobile App Beta Launch Checklist', attendeeIds: ['e1','e2','e4','e7','e8','e10','e12'], startTime: daysAgo(6), durationMinutes: 75, source: 'google', rawCalendarData: {} },

  // BI Dashboard
  { id: 'm29', title: 'BI Dashboard Requirements', description: 'Stakeholder requirements for exec BI', attendeeIds: ['e1','e9','e10','e11'], startTime: daysAgo(26), durationMinutes: 60, source: 'outlook', rawCalendarData: {} },
  { id: 'm30', title: 'BI Dashboard Data Model Design', attendeeIds: ['e9','e11','e3'], startTime: daysAgo(19), durationMinutes: 90, source: 'outlook', rawCalendarData: {} },
  { id: 'm31', title: 'BI Reporting Metrics Review', attendeeIds: ['e9','e10','e11'], startTime: daysAgo(11), durationMinutes: 45, source: 'outlook', rawCalendarData: {} },

  // AI Pilot — auto-detected
  { id: 'm32', title: 'AI Pilot Kickoff', description: 'Exploring LLM integration for internal tools', attendeeIds: ['e1','e2','e3','e9'], startTime: daysAgo(20), durationMinutes: 60, source: 'google', rawCalendarData: {} },
  { id: 'm33', title: 'AI Pilot Weekly Sync', attendeeIds: ['e2','e3','e9'], startTime: daysAgo(13), durationMinutes: 30, recurrenceRule: 'WEEKLY', source: 'google', rawCalendarData: {} },
  { id: 'm34', title: 'AI Pilot Model Evaluation', description: 'Comparing GPT-4 vs Claude for attribution', attendeeIds: ['e3','e9','e11'], startTime: daysAgo(9), durationMinutes: 60, source: 'google', rawCalendarData: {} },
  { id: 'm35', title: 'AI Pilot Budget Review', attendeeIds: ['e1','e2','e9'], startTime: daysAgo(4), durationMinutes: 45, source: 'google', rawCalendarData: {} },

  // AMBIGUOUS — low confidence
  { id: 'm36', title: 'Weekly Sync', description: '', attendeeIds: ['e1','e2','e5','e10'], startTime: daysAgo(28), durationMinutes: 30, recurrenceRule: 'WEEKLY', source: 'google', rawCalendarData: {} },
  { id: 'm37', title: 'Team Standup', attendeeIds: ['e2','e3','e4','e12'], startTime: daysAgo(27), durationMinutes: 15, recurrenceRule: 'DAILY', source: 'google', rawCalendarData: {} },
  { id: 'm38', title: 'Leadership Alignment', attendeeIds: ['e1','e2','e5','e6','e9','e10','e11','e12'], startTime: daysAgo(26), durationMinutes: 120, recurrenceRule: 'WEEKLY', source: 'outlook', rawCalendarData: {} },
  { id: 'm39', title: 'Ad hoc call', attendeeIds: ['e3','e6'], startTime: daysAgo(25), durationMinutes: 30, source: 'google', rawCalendarData: {} },
  { id: 'm40', title: 'Stakeholder Update', attendeeIds: ['e1','e5','e9','e10'], startTime: daysAgo(24), durationMinutes: 60, recurrenceRule: 'WEEKLY', source: 'outlook', rawCalendarData: {} },
  { id: 'm41', title: 'Weekly Sync', attendeeIds: ['e1','e2','e5','e10'], startTime: daysAgo(21), durationMinutes: 30, recurrenceRule: 'WEEKLY', source: 'google', rawCalendarData: {} },
  { id: 'm42', title: 'Team Standup', attendeeIds: ['e2','e3','e4','e12'], startTime: daysAgo(20), durationMinutes: 15, recurrenceRule: 'DAILY', source: 'google', rawCalendarData: {} },
  { id: 'm43', title: 'Leadership Alignment', attendeeIds: ['e1','e2','e5','e6','e9','e10','e11','e12'], startTime: daysAgo(19), durationMinutes: 120, recurrenceRule: 'WEEKLY', source: 'outlook', rawCalendarData: {} },
  { id: 'm44', title: 'Cross-team Sync', attendeeIds: ['e2','e9','e10','e5'], startTime: daysAgo(18), durationMinutes: 45, source: 'google', rawCalendarData: {} },
  { id: 'm45', title: 'Product Review', attendeeIds: ['e5','e6','e7','e10'], startTime: daysAgo(17), durationMinutes: 60, source: 'outlook', rawCalendarData: {} },
  { id: 'm46', title: 'Team Standup', attendeeIds: ['e2','e3','e4','e12'], startTime: daysAgo(16), durationMinutes: 15, recurrenceRule: 'DAILY', source: 'google', rawCalendarData: {} },
  { id: 'm47', title: 'Weekly Sync', attendeeIds: ['e1','e2','e5','e10'], startTime: daysAgo(14), durationMinutes: 30, recurrenceRule: 'WEEKLY', source: 'google', rawCalendarData: {} },
  { id: 'm48', title: 'Leadership Alignment', attendeeIds: ['e1','e2','e5','e6','e9','e10','e11','e12'], startTime: daysAgo(12), durationMinutes: 120, recurrenceRule: 'WEEKLY', source: 'outlook', rawCalendarData: {} },
  { id: 'm49', title: 'Stakeholder Update', attendeeIds: ['e1','e5','e9','e10'], startTime: daysAgo(10), durationMinutes: 60, recurrenceRule: 'WEEKLY', source: 'outlook', rawCalendarData: {} },
  { id: 'm50', title: 'Ad hoc call', attendeeIds: ['e4','e7'], startTime: daysAgo(9), durationMinutes: 30, source: 'google', rawCalendarData: {} },
  { id: 'm51', title: 'Weekly Sync', attendeeIds: ['e1','e2','e5','e10'], startTime: daysAgo(7), durationMinutes: 30, recurrenceRule: 'WEEKLY', source: 'google', rawCalendarData: {} },
  { id: 'm52', title: 'Team Standup', attendeeIds: ['e2','e3','e4','e12'], startTime: daysAgo(6), durationMinutes: 15, recurrenceRule: 'DAILY', source: 'google', rawCalendarData: {} },
  { id: 'm53', title: 'Leadership Alignment', attendeeIds: ['e1','e2','e5','e6','e9','e10','e11','e12'], startTime: daysAgo(5), durationMinutes: 120, recurrenceRule: 'WEEKLY', source: 'outlook', rawCalendarData: {} },
  { id: 'm54', title: 'Product Review', attendeeIds: ['e5','e6','e10'], startTime: daysAgo(4), durationMinutes: 45, source: 'outlook', rawCalendarData: {} },
  { id: 'm55', title: 'Monthly All-Hands', attendeeIds: ['e1','e2','e3','e4','e5','e6','e7','e8','e9','e10','e11','e12'], startTime: daysAgo(15), durationMinutes: 90, source: 'google', rawCalendarData: {} },

  // Additional specific meetings
  { id: 'm56', title: 'Platform v3 Incident Post-Mortem', attendeeIds: ['e1','e2','e3','e4'], startTime: daysAgo(16), durationMinutes: 90, source: 'google', rawCalendarData: {} },
  { id: 'm57', title: 'Sales CRM User Acceptance Testing', attendeeIds: ['e5','e6','e8','e10'], startTime: daysAgo(4), durationMinutes: 120, source: 'outlook', rawCalendarData: {} },
  { id: 'm58', title: 'Data Infra Cost Optimization', attendeeIds: ['e9','e11','e1'], startTime: daysAgo(3), durationMinutes: 60, source: 'google', rawCalendarData: {} },
  { id: 'm59', title: 'Mobile App Store Submission Review', attendeeIds: ['e4','e7','e8','e10'], startTime: daysAgo(2), durationMinutes: 45, source: 'google', rawCalendarData: {} },
  { id: 'm60', title: 'BI Dashboard Stakeholder Demo', attendeeIds: ['e1','e9','e10','e11'], startTime: daysAgo(1), durationMinutes: 60, source: 'outlook', rawCalendarData: {} },
  { id: 'm61', title: 'AI Pilot LLM Cost Analysis', attendeeIds: ['e3','e9','e1'], startTime: daysAgo(1), durationMinutes: 45, source: 'google', rawCalendarData: {} },
  { id: 'm62', title: 'Platform v3 Production Readiness', attendeeIds: ['e1','e2','e3','e4','e12'], startTime: daysAgo(2), durationMinutes: 90, source: 'google', rawCalendarData: {} },
  { id: 'm63', title: 'Weekly Sync', attendeeIds: ['e1','e2','e5','e10'], startTime: daysAgo(1), durationMinutes: 30, recurrenceRule: 'WEEKLY', source: 'google', rawCalendarData: {} },
  { id: 'm64', title: 'Vendor Review Meeting', attendeeIds: ['e1','e2','e10'], startTime: daysAgo(13), durationMinutes: 60, source: 'outlook', rawCalendarData: {} },
  { id: 'm65', title: 'Quarterly Business Review', attendeeIds: ['e1','e2','e5','e9','e10'], startTime: daysAgo(22), durationMinutes: 180, source: 'outlook', rawCalendarData: {} },
];

// Pre-computed attributions
export const ATTRIBUTIONS: Map<string, Attribution> = new Map([
  // Platform v3 — high confidence
  ['m1', { meetingId: 'm1', projectId: 'p1', confidence: 0.97, reasoning: 'Title explicitly contains "Platform v3" and matches project tags', method: 'ai_auto' }],
  ['m2', { meetingId: 'm2', projectId: 'p1', confidence: 0.95, reasoning: 'Architecture review title directly references Platform v3', method: 'ai_auto' }],
  ['m3', { meetingId: 'm3', projectId: 'p1', confidence: 0.93, reasoning: 'Platform v3 Backend Standup — explicit project name in title', method: 'ai_auto' }],
  ['m4', { meetingId: 'm4', projectId: 'p1', confidence: 0.96, reasoning: 'Platform v3 Sprint Review — direct project attribution', method: 'ai_auto' }],
  ['m5', { meetingId: 'm5', projectId: 'p1', confidence: 0.94, reasoning: 'Platform v3 Security Audit — explicit project reference', method: 'ai_auto' }],
  ['m6', { meetingId: 'm6', projectId: 'p1', confidence: 0.88, reasoning: 'Platform API Spec Walkthrough likely belongs to Platform v3', method: 'ai_auto' }],
  ['m7', { meetingId: 'm7', projectId: 'p1', confidence: 0.92, reasoning: 'Platform v3 Load Testing — explicit project name', method: 'ai_auto' }],
  ['m8', { meetingId: 'm8', projectId: 'p1', confidence: 0.94, reasoning: 'Platform v3 Deployment Runbook — direct attribution', method: 'ai_auto' }],
  ['m9', { meetingId: 'm9', projectId: 'p1', confidence: 0.93, reasoning: 'Recurring Platform v3 standup series', method: 'ai_auto' }],
  ['m10', { meetingId: 'm10', projectId: 'p1', confidence: 0.93, reasoning: 'Recurring Platform v3 standup series', method: 'ai_auto' }],
  ['m11', { meetingId: 'm11', projectId: 'p1', confidence: 0.93, reasoning: 'Recurring Platform v3 standup series', method: 'ai_auto' }],
  ['m12', { meetingId: 'm12', projectId: 'p1', confidence: 0.91, reasoning: 'Platform v3 Backlog Grooming — explicit project reference', method: 'ai_auto' }],
  ['m56', { meetingId: 'm56', projectId: 'p1', confidence: 0.95, reasoning: 'Post-mortem explicitly referencing Platform v3', method: 'ai_auto' }],
  ['m62', { meetingId: 'm62', projectId: 'p1', confidence: 0.96, reasoning: 'Platform v3 Production Readiness — direct attribution', method: 'ai_auto' }],

  // Sales CRM
  ['m13', { meetingId: 'm13', projectId: 'p2', confidence: 0.94, reasoning: 'CRM Integration Kickoff — direct reference to CRM project', method: 'ai_auto' }],
  ['m14', { meetingId: 'm14', projectId: 'p2', confidence: 0.93, reasoning: 'Sales CRM Feature Review — explicit project name', method: 'ai_auto' }],
  ['m15', { meetingId: 'm15', projectId: 'p2', confidence: 0.90, reasoning: 'CRM Revenue Pipeline matches Sales CRM tags', method: 'ai_auto' }],
  ['m16', { meetingId: 'm16', projectId: 'p2', confidence: 0.95, reasoning: 'Sales CRM Sprint Planning — explicit project reference', method: 'ai_auto' }],
  ['m17', { meetingId: 'm17', projectId: 'p2', confidence: 0.89, reasoning: 'CRM Customer Onboarding relates to Sales CRM project', method: 'ai_auto' }],
  ['m18', { meetingId: 'm18', projectId: 'p2', confidence: 0.91, reasoning: 'Sales CRM QA Handoff — explicit project name', method: 'ai_auto' }],
  ['m57', { meetingId: 'm57', projectId: 'p2', confidence: 0.93, reasoning: 'Sales CRM UAT — explicit reference to project', method: 'ai_auto' }],

  // Data Infrastructure
  ['m19', { meetingId: 'm19', projectId: 'p3', confidence: 0.95, reasoning: 'Data Infra Capacity Review — direct project reference', method: 'ai_auto' }],
  ['m20', { meetingId: 'm20', projectId: 'p3', confidence: 0.92, reasoning: 'Data Pipeline Architecture aligns with Data Infrastructure', method: 'ai_auto' }],
  ['m21', { meetingId: 'm21', projectId: 'p3', confidence: 0.93, reasoning: 'Data Infrastructure Sprint Review — explicit attribution', method: 'ai_auto' }],
  ['m22', { meetingId: 'm22', projectId: 'p3', confidence: 0.91, reasoning: 'Analytics Warehouse Migration matches Data Infra tags', method: 'ai_auto' }],
  ['m23', { meetingId: 'm23', projectId: 'p3', confidence: 0.90, reasoning: 'Data Infra On-Call Handoff — direct project reference', method: 'ai_auto' }],
  ['m58', { meetingId: 'm58', projectId: 'p3', confidence: 0.92, reasoning: 'Data Infra Cost Optimization — direct project reference', method: 'ai_auto' }],

  // Mobile App
  ['m24', { meetingId: 'm24', projectId: 'p4', confidence: 0.96, reasoning: 'Mobile App Sprint 7 Planning — explicit project name', method: 'ai_auto' }],
  ['m25', { meetingId: 'm25', projectId: 'p4', confidence: 0.94, reasoning: 'iOS Native Performance — directly related to Mobile App', method: 'ai_auto' }],
  ['m26', { meetingId: 'm26', projectId: 'p4', confidence: 0.93, reasoning: 'Android App UX Review — Mobile App project', method: 'ai_auto' }],
  ['m27', { meetingId: 'm27', projectId: 'p4', confidence: 0.91, reasoning: 'Mobile App QA Sync — explicit project reference', method: 'ai_auto' }],
  ['m28', { meetingId: 'm28', projectId: 'p4', confidence: 0.95, reasoning: 'Mobile App Beta Launch — direct attribution', method: 'ai_auto' }],
  ['m59', { meetingId: 'm59', projectId: 'p4', confidence: 0.94, reasoning: 'Mobile App Store Submission — explicit project reference', method: 'ai_auto' }],

  // BI Dashboard
  ['m29', { meetingId: 'm29', projectId: 'p5', confidence: 0.94, reasoning: 'BI Dashboard Requirements — direct project reference', method: 'ai_auto' }],
  ['m30', { meetingId: 'm30', projectId: 'p5', confidence: 0.92, reasoning: 'BI Dashboard Data Model — explicit project name', method: 'ai_auto' }],
  ['m31', { meetingId: 'm31', projectId: 'p5', confidence: 0.90, reasoning: 'BI Reporting Metrics — aligned with BI Dashboard project', method: 'ai_auto' }],
  ['m60', { meetingId: 'm60', projectId: 'p5', confidence: 0.95, reasoning: 'BI Dashboard Stakeholder Demo — explicit project reference', method: 'ai_auto' }],

  // AI Pilot
  ['m32', { meetingId: 'm32', projectId: 'p6', confidence: 0.93, reasoning: 'AI Pilot Kickoff — explicit project reference', method: 'ai_auto' }],
  ['m33', { meetingId: 'm33', projectId: 'p6', confidence: 0.91, reasoning: 'AI Pilot Weekly Sync — direct project attribution', method: 'ai_auto' }],
  ['m34', { meetingId: 'm34', projectId: 'p6', confidence: 0.92, reasoning: 'AI Pilot Model Evaluation — explicit project name', method: 'ai_auto' }],
  ['m35', { meetingId: 'm35', projectId: 'p6', confidence: 0.90, reasoning: 'AI Pilot Budget Review — direct project reference', method: 'ai_auto' }],
  ['m61', { meetingId: 'm61', projectId: 'p6', confidence: 0.93, reasoning: 'AI Pilot LLM Cost Analysis — explicit project reference', method: 'ai_auto' }],

  // Ambiguous — flagged for review (lower confidence)
  ['m36', { meetingId: 'm36', projectId: 'p1', confidence: 0.52, reasoning: 'Weekly Sync with mixed attendees — Platform v3 members dominant but uncertain', method: 'ai_flagged' }],
  ['m37', { meetingId: 'm37', projectId: 'p1', confidence: 0.58, reasoning: 'Team Standup for engineering team — likely Platform v3 but unconfirmed', method: 'ai_flagged' }],
  ['m38', { meetingId: 'm38', projectId: null, confidence: 0.28, reasoning: 'Leadership Alignment with cross-org attendees — cannot attribute to single project', method: 'ai_flagged' }],
  ['m39', { meetingId: 'm39', projectId: 'p1', confidence: 0.45, reasoning: 'Ad hoc call between Platform and Product members — likely Platform v3', method: 'ai_flagged' }],
  ['m40', { meetingId: 'm40', projectId: null, confidence: 0.35, reasoning: 'Stakeholder Update spans multiple projects — no clear attribution', method: 'ai_flagged' }],
  ['m41', { meetingId: 'm41', projectId: 'p2', confidence: 0.48, reasoning: 'Weekly Sync likely related to Sales CRM based on attendees', method: 'ai_flagged' }],
  ['m42', { meetingId: 'm42', projectId: 'p1', confidence: 0.55, reasoning: 'Engineering standup — Platform v3 team most represented', method: 'ai_flagged' }],
  ['m43', { meetingId: 'm43', projectId: null, confidence: 0.22, reasoning: 'Leadership Alignment — org-wide meeting, no single project attribution', method: 'ai_flagged' }],
  ['m44', { meetingId: 'm44', projectId: 'p3', confidence: 0.51, reasoning: 'Cross-team sync with Data members — likely Data Infrastructure', method: 'ai_flagged' }],
  ['m45', { meetingId: 'm45', projectId: 'p2', confidence: 0.60, reasoning: 'Product Review with product team — Sales CRM most active project', method: 'ai_flagged' }],
  ['m46', { meetingId: 'm46', projectId: 'p1', confidence: 0.55, reasoning: 'Engineering standup series — Platform v3 team', method: 'ai_flagged' }],
  ['m47', { meetingId: 'm47', projectId: 'p2', confidence: 0.49, reasoning: 'Weekly Sync with CRM team members', method: 'ai_flagged' }],
  ['m48', { meetingId: 'm48', projectId: null, confidence: 0.20, reasoning: 'Leadership Alignment — org-wide, unattributable', method: 'unattributed' }],
  ['m49', { meetingId: 'm49', projectId: null, confidence: 0.33, reasoning: 'Stakeholder Update — cross-project meeting', method: 'ai_flagged' }],
  ['m50', { meetingId: 'm50', projectId: 'p4', confidence: 0.47, reasoning: 'Ad hoc call between design and engineering — likely Mobile App', method: 'ai_flagged' }],
  ['m51', { meetingId: 'm51', projectId: 'p2', confidence: 0.50, reasoning: 'Weekly Sync — CRM team members', method: 'ai_flagged' }],
  ['m52', { meetingId: 'm52', projectId: 'p1', confidence: 0.55, reasoning: 'Engineering standup — Platform v3 dominant', method: 'ai_flagged' }],
  ['m53', { meetingId: 'm53', projectId: null, confidence: 0.18, reasoning: 'Leadership Alignment — entire org, no attribution possible', method: 'unattributed' }],
  ['m54', { meetingId: 'm54', projectId: 'p2', confidence: 0.58, reasoning: 'Product Review — Sales CRM sprint active', method: 'ai_flagged' }],
  ['m55', { meetingId: 'm55', projectId: null, confidence: 0.12, reasoning: 'Monthly All-Hands — entire company, no project attribution', method: 'unattributed' }],
  ['m63', { meetingId: 'm63', projectId: 'p2', confidence: 0.47, reasoning: 'Weekly sync — CRM team attendance pattern', method: 'ai_flagged' }],
  ['m64', { meetingId: 'm64', projectId: null, confidence: 0.30, reasoning: 'Vendor Review — cross-department, no clear project', method: 'ai_flagged' }],
  ['m65', { meetingId: 'm65', projectId: null, confidence: 0.15, reasoning: 'Quarterly Business Review — company-wide, not project-specific', method: 'unattributed' }],
]);

// Compute costs
function getHourlyRate(designation: Employee['designation']): number {
  return SALARY_BANDS.find(b => b.band === designation)?.hourlyRate ?? 80;
}

export function computeMeetingCost(meeting: Meeting): MeetingCost {
  const hours = meeting.durationMinutes / 60;
  const breakdown = meeting.attendeeIds.map(id => {
    const emp = EMPLOYEES.find(e => e.id === id);
    if (!emp) return null;
    const rate = getHourlyRate(emp.designation);
    return { employeeId: id, designation: emp.designation, hourlyRate: rate, cost: Math.round(rate * hours * 100) / 100 };
  }).filter(Boolean) as MeetingCost['breakdown'];

  const attr = ATTRIBUTIONS.get(meeting.id);
  return {
    meetingId: meeting.id,
    projectId: attr?.projectId ?? null,
    totalCost: Math.round(breakdown.reduce((s, b) => s + b.cost, 0) * 100) / 100,
    breakdown,
  };
}

export const MEETING_COSTS: MeetingCost[] = MEETINGS.map(computeMeetingCost);

export function getProjectCostMap(): Map<string, number> {
  const map = new Map<string, number>();
  for (const cost of MEETING_COSTS) {
    const key = cost.projectId ?? 'unattributed';
    map.set(key, (map.get(key) ?? 0) + cost.totalCost);
  }
  return map;
}

export function getWeeklySpend(): Array<{ week: string; spend: number }> {
  const weeks: Record<string, number> = {};
  for (const meeting of MEETINGS) {
    const wk = Math.floor((Date.now() - meeting.startTime.getTime()) / (7 * 24 * 3600 * 1000));
    const label = `W-${wk}`;
    const cost = MEETING_COSTS.find(c => c.meetingId === meeting.id)?.totalCost ?? 0;
    weeks[label] = (weeks[label] ?? 0) + cost;
  }
  return Object.entries(weeks)
    .sort(([a], [b]) => parseInt(b.replace('W-','')) - parseInt(a.replace('W-','')))
    .slice(0, 8)
    .reverse()
    .map(([week, spend]) => ({ week, spend: Math.round(spend) }));
}
