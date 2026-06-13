import Anthropic from '@anthropic-ai/sdk';
import type { Meeting, Project, Employee, Attribution } from './types';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY not set');
    client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  }
  return client;
}

export async function attributeMeeting(
  meeting: Meeting,
  projects: Project[],
  employees: Employee[]
): Promise<{ projectId: string | null; confidence: number; reasoning: string }> {
  const attendeeNames = meeting.attendeeIds
    .map(id => employees.find(e => e.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  const projectList = projects
    .map(p => `- ${p.id}: "${p.name}" (tags: ${p.tags.join(', ')})`)
    .join('\n');

  const prompt = `You are an HR cost attribution AI. Given a calendar meeting, determine which project it belongs to.

MEETING:
Title: "${meeting.title}"
Description: "${meeting.description || 'none'}"
Duration: ${meeting.durationMinutes} minutes
Attendees: ${attendeeNames}
Recurrence: ${meeting.recurrenceRule || 'one-off'}

AVAILABLE PROJECTS:
${projectList}

Respond ONLY with valid JSON, no markdown:
{
  "projectId": "<project_id or null if truly unattributable>",
  "confidence": <float 0.0 to 1.0>,
  "reasoning": "<one sentence explaining why>"
}

Rules:
- If title contains a project name, confidence should be 0.90+
- "Standup", "sync", "weekly" alone = low confidence (0.40–0.65)
- Cross-functional meetings = pick most likely, confidence max 0.75
- If no project fits, return null with confidence 0.15
- Never fabricate project IDs not in the list`;

  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    return {
      projectId: parsed.projectId ?? null,
      confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0)),
      reasoning: parsed.reasoning ?? 'No reasoning provided',
    };
  } catch {
    return { projectId: null, confidence: 0, reasoning: 'Attribution failed — API error or key not configured' };
  }
}

export async function attributeAllMeetings(
  meetings: Meeting[],
  projects: Project[],
  employees: Employee[],
  onProgress?: (done: number, total: number) => void
): Promise<Map<string, Attribution>> {
  const results = new Map<string, Attribution>();
  for (let i = 0; i < meetings.length; i++) {
    const meeting = meetings[i];
    const result = await attributeMeeting(meeting, projects, employees);
    results.set(meeting.id, {
      meetingId: meeting.id,
      projectId: result.projectId,
      confidence: result.confidence,
      reasoning: result.reasoning,
      method: result.confidence >= 0.85 ? 'ai_auto' : result.confidence > 0 ? 'ai_flagged' : 'unattributed',
    });
    onProgress?.(i + 1, meetings.length);
    await new Promise(r => setTimeout(r, 300));
  }
  return results;
}

export async function parseDashboardQuery(
  query: string,
  projectNames: string[],
  employeeNames: string[]
): Promise<{
  projectId: string | null;
  period: 'last_30d' | 'last_quarter' | 'ytd' | null;
  groupBy: 'project' | 'role' | 'employee' | null;
  employeeId: string | null;
  summary: string;
}> {
  const prompt = `You are a dashboard query parser for an HR cost analytics tool.

Available projects: ${projectNames.join(', ')}
Available employees: ${employeeNames.join(', ')}

User query: "${query}"

Return ONLY valid JSON:
{
  "projectId": "<exact project name from list or null>",
  "period": "<last_30d|last_quarter|ytd|null>",
  "groupBy": "<project|role|employee|null>",
  "employeeId": "<exact employee name from list or null>",
  "summary": "<one sentence describing what will be shown>"
}`;

  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    return { projectId: null, period: null, groupBy: null, employeeId: null, summary: 'Filters applied', ...parsed };
  } catch {
    return { projectId: null, period: null, groupBy: null, employeeId: null, summary: 'Could not parse query' };
  }
}

export async function estimateMeetingCost(
  description: string,
  salaryInfo: string
): Promise<{ breakdown: string; totalCost: number; insight: string }> {
  const prompt = `You are an HR meeting cost calculator.

Salary reference: ${salaryInfo}

Meeting description: "${description}"

Parse the description and calculate the total cost. Return ONLY valid JSON:
{
  "breakdown": "<formatted breakdown as string, e.g. '8 engineers × $110/hr × 1.5hrs = $1,320'>",
  "totalCost": <number>,
  "insight": "<one actionable insight about this meeting cost>"
}`;

  try {
    const response = await getClient().messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    return { breakdown: 'Unable to parse', totalCost: 0, insight: '', ...parsed };
  } catch {
    return { breakdown: 'API error — check API key', totalCost: 0, insight: '' };
  }
}
