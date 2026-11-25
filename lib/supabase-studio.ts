// lib/supabase-studio.ts - Supabase Studio OS Helpers
import { supabase } from './supabase';

export interface StudioProject {
  id: string;
  name: string;
  key: string;
  client: string;
  clientEmail?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  progress: number;
  budget?: string;
  dueDate?: string;
  stagingUrl?: string;
  modules: string[];
  ownerId?: string;
  createdAt: string;
}

export interface StudioTask {
  id: string;
  projectId: string;
  moduleName?: string;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee: string;
  notes?: string;
  createdAt?: string;
}

export interface StudioDailyReport {
  id: string;
  projectId: string;
  projectName?: string;
  authorName: string;
  summary: string;
  blockers: string;
  hours: number;
  reportDate: string;
}

// -------------------------------------------------------------
// Projects
// -------------------------------------------------------------
export async function fetchStudioProjects(): Promise<StudioProject[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, modules(name)')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((p: any) => ({
      id: p.id,
      name: p.name || 'Untitled Project',
      key: p.key || 'FLW',
      client: p.summary || 'Studio Client',
      clientEmail: undefined,
      status: p.status || 'active',
      progress: p.status === 'completed' ? 100 : 65,
      budget: '₹75,000',
      dueDate: p.due_date || '3 Weeks',
      stagingUrl: p.github_repo || 'https://staging.theflowlabs.online',
      modules: Array.isArray(p.modules) && p.modules.length > 0
        ? p.modules.map((m: any) => m.name)
        : ['Core Architecture', 'Frontend Interfaces', 'Database & API'],
      ownerId: p.owner_id,
      createdAt: p.created_at,
    }));
  } catch (err) {
    console.warn('Error fetching studio projects:', err);
    return [];
  }
}

export async function updateStudioProjectStatus(
  projectId: string,
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived'
) {
  return supabase.from('projects').update({ status }).eq('id', projectId);
}

export async function deleteStudioProject(projectId: string) {
  return supabase.from('projects').delete().eq('id', projectId);
}

// -------------------------------------------------------------
// Tasks
// -------------------------------------------------------------
export async function fetchStudioTasks(projectId?: string): Promise<StudioTask[]> {
  try {
    let query = supabase.from('tasks').select('*, modules(name), profiles!tasks_assignee_id_fkey(full_name)');
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) return [];

    return data.map((t: any) => {
      let mappedStatus: 'todo' | 'in_progress' | 'review' | 'done' = 'todo';
      if (t.status === 'done') mappedStatus = 'done';
      else if (t.status === 'review') mappedStatus = 'review';
      else if (t.status === 'in_progress') mappedStatus = 'in_progress';

      return {
        id: t.id,
        projectId: t.project_id,
        moduleName: t.modules?.name || 'Core Module',
        title: t.title,
        status: mappedStatus,
        priority: t.priority || 'medium',
        assignee: t.profiles?.full_name?.slice(0, 2)?.toUpperCase() || 'SR',
        notes: t.description || undefined,
        createdAt: t.created_at,
      };
    });
  } catch (err) {
    console.warn('Error fetching studio tasks:', err);
    return [];
  }
}

export async function updateStudioTaskStatus(
  taskId: string,
  status: 'todo' | 'in_progress' | 'review' | 'done'
) {
  const dbStatus = status === 'in_progress' ? 'in_progress' : status;
  return supabase.from('tasks').update({ status: dbStatus }).eq('id', taskId);
}

// -------------------------------------------------------------
// Daily Reports / Standups
// -------------------------------------------------------------
export async function submitDailyReport(payload: {
  projectId: string;
  authorId?: string;
  summary: string;
  blockers: string;
  hours: number;
}) {
  return supabase.from('daily_reports').insert([{
    project_id: payload.projectId,
    author_id: payload.authorId || null,
    report_date: new Date().toISOString().split('T')[0],
    summary: payload.summary,
    blockers: payload.blockers,
    hours: payload.hours,
  }]);
}
