import type { Anomaly, Meeting, MeetingCost, Attribution, Project, Employee } from './types';
import { MEETING_COSTS } from './mock-data';

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.85) return 'text-emerald-600';
  if (confidence >= 0.60) return 'text-amber-600';
  return 'text-rose-500';
}

export function getConfidenceBg(confidence: number): string {
  if (confidence >= 0.85) return 'bg-emerald-500';
  if (confidence >= 0.60) return 'bg-amber-400';
  return 'bg-rose-400';
}

export function getSeverityColor(severity: Anomaly['severity']): string {
  switch (severity) {
    case 'critical': return 'text-rose-600 bg-rose-50 border-rose-200';
    case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'info': return 'text-sky-600 bg-sky-50 border-sky-200';
  }
}

export function getSeverityBorder(severity: Anomaly['severity']): string {
  switch (severity) {
    case 'critical': return 'border-l-rose-500';
    case 'warning': return 'border-l-amber-400';
    case 'info': return 'border-l-sky-400';
  }
}

export function detectAnomalies(
  meetings: Meeting[],
  costs: MeetingCost[],
  attributions: Map<string, Attribution>,
  projects: Project[],
  employees: Employee[],
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const MONTHLY_WORK_HOURS = 160;

  // 1. Budget overruns
  const spendByProject = new Map<string, number>();
  for (const cost of costs) {
    const attr = attributions.get(cost.meetingId);
    const key = attr?.projectId ?? 'unattributed';
    spendByProject.set(key, (spendByProject.get(key) ?? 0) + cost.totalCost);
  }
  for (const project of projects) {
    const spend = spendByProject.get(project.id) ?? 0;
    const budget = project.monthlyBudget ?? 0;
    if (budget && spend > budget * 0.85) {
      anomalies.push({
        id: `overrun-${project.id}`,
        type: 'budget_overrun',
        severity: spend > budget ? 'critical' : 'warning',
        title: `${project.name} ${spend > budget ? 'exceeded' : 'near'} budget`,
        description: `$${Math.round(spend).toLocaleString()} spent vs $${budget.toLocaleString()} budget (${Math.round(spend / budget * 100)}%)`,
        relatedProjectId: project.id,
        detectedAt: new Date(),
        resolved: false,
      });
    }
  }

  // 2. Employee overload
  for (const emp of employees) {
    const empMeetings = meetings.filter(m => m.attendeeIds.includes(emp.id));
    const totalHours = empMeetings.reduce((s, m) => s + m.durationMinutes / 60, 0);
    const utilization = totalHours / MONTHLY_WORK_HOURS;
    if (utilization > 0.75) {
      anomalies.push({
        id: `overload-${emp.id}`,
        type: 'employee_overload',
        severity: utilization > 0.90 ? 'critical' : 'warning',
        title: `${emp.name} is ${Math.round(utilization * 100)}% in meetings`,
        description: `${Math.round(totalHours)}h of ${MONTHLY_WORK_HOURS}h monthly capacity spent in meetings`,
        relatedEmployeeId: emp.id,
        detectedAt: new Date(),
        resolved: false,
      });
    }
  }

  // 3. Unattributed cluster
  const unattributed = Array.from(attributions.values()).filter(a => a.projectId === null);
  if (unattributed.length >= 5) {
    const unattributedCost = costs
      .filter(c => unattributed.some(u => u.meetingId === c.meetingId))
      .reduce((s, c) => s + c.totalCost, 0);
    anomalies.push({
      id: 'unattributed-cluster',
      type: 'unattributed_cluster',
      severity: 'warning',
      title: `${unattributed.length} meetings unattributed`,
      description: `$${Math.round(unattributedCost).toLocaleString()} in HR spend cannot be attributed to any project`,
      detectedAt: new Date(),
      resolved: false,
    });
  }

  // 4. Recurring meetings with no agenda
  const noAgendaRecurring = meetings.filter(m =>
    m.recurrenceRule &&
    (!m.description || m.description.trim().length < 10) &&
    m.durationMinutes >= 60 &&
    m.attendeeIds.length >= 5
  );
  for (const meeting of noAgendaRecurring.slice(0, 2)) {
    const cost = costs.find(c => c.meetingId === meeting.id);
    anomalies.push({
      id: `noagenda-${meeting.id}`,
      type: 'recurring_no_agenda',
      severity: 'info',
      title: `"${meeting.title}" has no agenda`,
      description: `Recurring ${meeting.durationMinutes}-min meeting with ${meeting.attendeeIds.length} attendees, costing ~$${Math.round((cost?.totalCost ?? 0) * 4).toLocaleString()}/month`,
      detectedAt: new Date(),
      resolved: false,
    });
  }

  // 5. Auto-detect new projects
  const projectTags = projects.flatMap(p => p.tags);
  const suspectedProjects = new Map<string, number>();
  for (const meeting of meetings) {
    const matches = meeting.title.match(/[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)+/g) ?? [];
    for (const phrase of matches) {
      if (!projectTags.some(t => phrase.toLowerCase().includes(t))) {
        suspectedProjects.set(phrase, (suspectedProjects.get(phrase) ?? 0) + 1);
      }
    }
  }
  for (const [phrase, count] of suspectedProjects) {
    if (count >= 3 && !projects.some(p => p.name.toLowerCase().includes(phrase.toLowerCase()))) {
      anomalies.push({
        id: `newproject-${phrase.replace(/\s/g, '-').toLowerCase()}`,
        type: 'new_project_detected',
        severity: 'info',
        title: `Possible new project: "${phrase}"`,
        description: `Found in ${count} meeting titles but not in project taxonomy. Add it?`,
        detectedAt: new Date(),
        resolved: false,
      });
    }
  }

  return anomalies;
}

export function computeEmployeeUtilization(employeeId: string, meetings: Meeting[]): number {
  const MONTHLY_WORK_HOURS = 160;
  const empMeetings = meetings.filter(m => m.attendeeIds.includes(employeeId));
  const totalHours = empMeetings.reduce((s, m) => s + m.durationMinutes / 60, 0);
  return Math.min(1, totalHours / MONTHLY_WORK_HOURS);
}

export function getEmployeeMonthlyCost(employeeId: string): number {
  return MEETING_COSTS
    .filter(c => c.breakdown.some(b => b.employeeId === employeeId))
    .reduce((s, c) => {
      const b = c.breakdown.find(b => b.employeeId === employeeId);
      return s + (b?.cost ?? 0);
    }, 0);
}

export function getAttributionStats(attributions: Map<string, Attribution>) {
  const all = Array.from(attributions.values());
  const autoAttributed = all.filter(a => a.method === 'ai_auto').length;
  const needsReview = all.filter(a => a.method === 'ai_flagged').length;
  const unattributed = all.filter(a => a.method === 'unattributed' || a.projectId === null).length;
  const humanConfirmed = all.filter(a => a.method === 'human_confirmed' || a.method === 'human_corrected').length;
  const avgConfidence = all.length > 0
    ? all.filter(a => a.confidence > 0).reduce((s, a) => s + a.confidence, 0) / all.filter(a => a.confidence > 0).length
    : 0;

  return { autoAttributed, needsReview, unattributed, humanConfirmed, avgConfidence, total: all.length };
}
