'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Auth check helper: verifies Supabase session and profile status
// for Flow HQ access. Replaces the missing checkAuth() call.
const checkAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    // No session - user not logged in; redirect to login
    // Note: redirect cannot be done in client component without next/router
    // The caller should handle redirect or auth state
    return false;
  }
  // Check that the user has an active profile (SEC-013 hardening)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', session.user.id)
    .single();
  if (error || !profile || profile.status !== 'active') {
    // Profile not active - user should not have access
    return false;
  }
  return true;
};
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Target,
  FileText,
  Activity,
  Plus,
  RefreshCw,
  Send,
  MessageSquare,
  ArrowRightLeft,
  Shield,
  Clock,
  Briefcase,
  Layers,
  Building,
  Key,
  LogOut,
  LogIn,
  Lock,
  X,
  Check,
  Calendar,
  AlertCircle,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ================= DATA MODELS =================
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
  initials: string;
  status: 'active' | 'invited';
}

export interface Project {
  id: string;
  name: string;
  key: string;
  client: string;
  clientEmail?: string;
  summary?: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  progress: number;
  budget: string;
  dueDate: string;
  modules: string[];
}

export interface TaskItem {
  id: string;
  projectId: string;
  moduleName?: string;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee: string;
  notes?: string;
}

export interface ClientAccount {
  id: string;
  name: string;
  company: string;
  email: string;
  projectId: string;
  projectName: string;
  accessKey: string;
  status: 'active' | 'pending';
}

export interface ActivityLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
}

export interface Lead {
  id: string;
  name: string;
  contact: string;
  project_type: string;
  budget: string;
  idea?: string;
  created_at: string;
  status?: string;
}

export interface DailyStandup {
  id: string;
  engineer: string;
  project: string;
  shipped: string;
  blockers: string;
  hours: number;
  date: string;
}

// ================= INITIAL DATA =================
const DEFAULT_TEAM: TeamMember[] = [
  { id: 'tm-1', name: 'Smruti Ranjan', email: 'smruti@theflowlabs.online', role: 'owner', initials: 'SR', status: 'active' },
  { id: 'tm-2', name: 'Biswash', email: 'biswash@theflowlabs.online', role: 'admin', initials: 'BW', status: 'active' },
  { id: 'tm-3', name: 'Arpita', email: 'arpita@theflowlabs.online', role: 'admin', initials: 'AP', status: 'active' },
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Droovee Chauffeur Platform',
    key: 'DRV',
    client: 'Droovee Mobility',
    clientEmail: 'rohan@droovee.in',
    status: 'active',
    progress: 75,
    budget: '₹1,20,000',
    dueDate: '15 Dec 2026',
    modules: ['Customer Web Booking', 'Driver Dispatch Engine', 'Automated GST Billing'],
  },
  {
    id: 'proj-2',
    name: 'Drishti Edge Vision AI',
    key: 'DSH',
    client: 'In-House Laboratory',
    clientEmail: 'lab@theflowlabs.online',
    status: 'active',
    progress: 90,
    budget: '₹85,000',
    dueDate: '20 Dec 2026',
    modules: ['YOLOv8 Edge Pipeline', 'WebRTC Video Stream', 'Alert Webhook'],
  },
  {
    id: 'proj-3',
    name: 'FlowOps Studio Monitor',
    key: 'OPS',
    client: 'Internal Tooling',
    clientEmail: 'ops@theflowlabs.online',
    status: 'completed',
    progress: 100,
    budget: '₹40,000',
    dueDate: 'Completed',
    modules: ['Synthetic Heartbeats', 'Telegram Bot Alerts'],
  },
];

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 't-1',
    projectId: 'proj-1',
    moduleName: 'Driver Dispatch Engine',
    title: 'Deploy Droovee dynamic distance calculation algorithm',
    status: 'in_progress',
    priority: 'urgent',
    assignee: 'SR',
    notes: 'Testing road distances with Mapbox matrix APIs.',
  },
  {
    id: 't-2',
    projectId: 'proj-2',
    moduleName: 'YOLOv8 Edge Pipeline',
    title: 'Optimize Drishti YOLOv8 video frame rate to 30 FPS on edge node',
    status: 'in_progress',
    priority: 'high',
    assignee: 'BW',
    notes: 'Quantizing weights to ONNX format.',
  },
  {
    id: 't-3',
    projectId: 'proj-1',
    moduleName: 'Customer Web Booking',
    title: 'Ship Three.js spatial design system components for client portal',
    status: 'review',
    priority: 'medium',
    assignee: 'AP',
    notes: 'Accessible keyboard navigation verified.',
  },
  {
    id: 't-4',
    projectId: 'proj-1',
    moduleName: 'Automated GST Billing',
    title: 'Finalize PostgreSQL row-level security policies for multi-tenant users',
    status: 'done',
    priority: 'high',
    assignee: 'SR',
    notes: 'Migration 0002_work.sql policies verified.',
  },
];

const DEFAULT_CLIENTS: ClientAccount[] = [
  {
    id: 'c-1',
    name: 'Rohan Sharma',
    company: 'Droovee Mobility',
    email: 'rohan@droovee.in',
    projectId: 'proj-1',
    projectName: 'Droovee Chauffeur Platform',
    accessKey: 'DRV-CLIENT-9842',
    status: 'active',
  },
];

const DEFAULT_ACTIVITY: ActivityLog[] = [
  { id: 'act-1', actor: 'SR', action: 'moved task to Review', target: 'FLW-04 PostgreSQL RLS Policies', time: '10m ago' },
  { id: 'act-2', actor: 'BW', action: 'deployed edge container', target: 'Drishti 30 FPS Node', time: '45m ago' },
  { id: 'act-3', actor: 'AP', action: 'updated design tokens', target: 'Spatial Obsidian Kit', time: '2h ago' },
  { id: 'act-4', actor: 'SR', action: 'issued portal access', target: 'Rohan Sharma (Droovee)', time: '4h ago' },
];

const DEFAULT_LEADS: Lead[] = [];

export default function FlowHQPage() {
  // Session State
  const [session, setSession] = useState<{ userEmail: string; userName: string; userRole: string; userInitials: string } | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'tasks' | 'clients' | 'team' | 'leads' | 'standups'>('dashboard');

  // Application Data with Local Storage Persistence
  const [team, setTeam] = useState<TeamMember[]>(DEFAULT_TEAM);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [tasks, setTasks] = useState<TaskItem[]>(DEFAULT_TASKS);
  const [clients, setClients] = useState<ClientAccount[]>(DEFAULT_CLIENTS);
  const [activity, setActivity] = useState<ActivityLog[]>(DEFAULT_ACTIVITY);
  const [standups, setStandups] = useState<DailyStandup[]>([]);
  const [leads, setLeads] = useState<Lead[]>(DEFAULT_LEADS);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // View Filter: "All Studio Tasks" vs "My Work"
  const [filterMyWorkOnly, setFilterMyWorkOnly] = useState<boolean>(false);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');

  // Modals Open State
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [showStandupModal, setShowStandupModal] = useState(false);

  // Context for targeted modals
  const [targetProjectForModule, setTargetProjectForModule] = useState<string>('proj-1');
  const [targetTaskForHandoff, setTargetTaskForHandoff] = useState<TaskItem | null>(null);
  const [handoffTargetUser, setHandoffTargetUser] = useState<string>('BW');
  const [handoffNotes, setHandoffNotes] = useState<string>('');

  // Form States - New Project
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectKey, setNewProjectKey] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectClientEmail, setNewProjectClientEmail] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState('₹75,000');
  const [newProjectDue, setNewProjectDue] = useState('3 Weeks');

  // Form States - New Module
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleLead, setNewModuleLead] = useState('SR');

  // Form States - New Task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('proj-1');
  const [newTaskModule, setNewTaskModule] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('SR');
  const [newTaskPriority, setNewTaskPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [newTaskStatus, setNewTaskStatus] = useState<'todo' | 'in_progress' | 'review' | 'done'>('todo');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Form States - New Client
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientProject, setNewClientProject] = useState('proj-1');

  // Form States - New Team Member & Client Onboarding
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamEmail, setNewTeamEmail] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [newTeamRole, setNewTeamRole] = useState<'owner' | 'admin' | 'manager' | 'member' | 'client'>('member');
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [onboardSuccessMsg, setOnboardSuccessMsg] = useState('');
  const [onboardErrorMsg, setOnboardErrorMsg] = useState('');

  // Project Filtering (Active vs Completed vs All)
  const [projectFilterTab, setProjectFilterTab] = useState<'active' | 'completed' | 'all'>('active');

  // Project Actions: Manage & Delete
  const [projectToManage, setProjectToManage] = useState<Project | null>(null);
  const [manageName, setManageName] = useState('');
  const [manageSummary, setManageSummary] = useState('');
  const [manageBudget, setManageBudget] = useState('');
  const [manageDue, setManageDue] = useState('');
  const [manageStatus, setManageStatus] = useState<string>('active');
  const [manageClient, setManageClient] = useState('');
  const [manageClientEmail, setManageClientEmail] = useState('');
  const [manageModules, setManageModules] = useState<string[]>([]);
  const [newModuleInput, setNewModuleInput] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Team Member Management: Edit & Delete
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberRole, setEditMemberRole] = useState<'owner' | 'admin' | 'manager' | 'member'>('member');
  const [editMemberStatus, setEditMemberStatus] = useState<string>('active');
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  // Client Management: Delete
  const [clientToDelete, setClientToDelete] = useState<ClientAccount | null>(null);

  // Task Scope Filter ('active' sprint tasks vs 'all' vs 'done')
  const [taskScopeFilter, setTaskScopeFilter] = useState<'active' | 'all' | 'done'>('active');

  // Form States - Daily Standup
  const [standupProject, setStandupProject] = useState('proj-1');
  const [standupShipped, setStandupShipped] = useState('');
  const [standupBlockers, setStandupBlockers] = useState('None');
  const [standupHours, setStandupHours] = useState('6');

  // Initialize and load saved state from localStorage
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('flow_hq_projects');
      if (savedProjects) setProjects(JSON.parse(savedProjects));

      const savedTasks = localStorage.getItem('flow_hq_tasks');
      if (savedTasks) setTasks(JSON.parse(savedTasks));

      const savedClients = localStorage.getItem('flow_hq_clients');
      if (savedClients) setClients(JSON.parse(savedClients));

      const savedTeam = localStorage.getItem('flow_hq_team');
      if (savedTeam) setTeam(JSON.parse(savedTeam));

      const savedStandups = localStorage.getItem('flow_hq_standups');
      if (savedStandups) setStandups(JSON.parse(savedStandups));

      const savedLeads = localStorage.getItem('flow_hq_leads');
      if (savedLeads) setLeads(JSON.parse(savedLeads));
    } catch (err) {
      console.warn('LocalStorage load notice:', err);
    }
  }, []);

  // Save state updates to localStorage
  const persistState = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      // ignore
    }
  };

  // Check Supabase Auth session; support both Founders and Team Members
  const checkAuth = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const email = data.session.user.email || '';
        const name = email.split('@')[0];
        let role = 'member';
        try {
          const { data: prof } = await supabase
            .from('profiles')
            .select('role, status')
            .eq('id', data.session.user.id)
            .single();
          if (prof?.status === 'active') {
            role = prof.role || 'member';
          }
        } catch {}

        if (role === 'owner' || role === 'admin' || role === 'manager' || role === 'member') {
          setSession({
            userEmail: email,
            userName: name.charAt(0).toUpperCase() + name.slice(1),
            userRole: role as any,
            userInitials: name.slice(0, 2).toUpperCase(),
          });
        } else if (role === 'client') {
          setAuthError('You are registered as a Client. Please sign in to the Client Portal at /client');
        } else {
          setAuthError('You do not have active studio access.');
        }
      }
    } catch (err) {
      console.warn('Auth session check notice:', err);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Load live projects from Supabase
  const loadLiveProjects = async () => {
    try {
      const { data: dbProjs } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbProjs && dbProjs.length > 0) {
        const mapped: Project[] = dbProjs.map((p: any) => ({
          id: p.id,
          name: p.name || 'Studio Project',
          key: p.key || 'FLW',
          client: p.summary || 'Client Build',
          status: p.status === 'completed' ? 'completed' : 'active',
          progress: p.status === 'completed' ? 100 : 70,
          budget: '₹75,000',
          dueDate: p.due_date || '3 Weeks',
          modules: ['Core Architecture', 'Frontend Interface', 'API & Database'],
        }));
        setProjects(mapped);
        persistState('flow_hq_projects', mapped);
      }
    } catch (e) {
      console.warn('Live projects load notice:', e);
    }
  };

  useEffect(() => {
    if (session) {
      loadLiveProjects();
      loadLeads();
    }
  }, [session]);

  // Load Inbound Leads from Supabase
  const loadLeads = async () => {
    setLoadingLeads(true);
    try {
      const { data, error } = await supabase
        .from('site_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (data && !error && data.length > 0) {
        setLeads(data);
        persistState('flow_hq_leads', data);
      }
    } catch (err) {
      console.warn('Leads fetch error:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadLeads();
    }
  }, [session]);

  // Log activity event
  const logActivityEvent = (actor: string, action: string, target: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      actor,
      action,
      target,
      time: 'Just now',
    };
    setActivity((prev) => [newLog, ...prev.slice(0, 9)]);
  };

  // Handle Sign In
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (error) {
        setAuthError(error.message || 'Invalid credentials. Please verify your email and password.');
      } else if (data?.session) {
        await checkAuth();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Sign in encountered an error.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    setSession(null);
  };

  // Add Project
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newKey = newProjectKey.trim().toUpperCase() || 'FLW';
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      key: newKey,
      client: newProjectClient.trim() || 'Direct Client',
      clientEmail: newProjectClientEmail.trim() || undefined,
      status: 'active',
      progress: 0,
      budget: newProjectBudget.trim() || '₹75,000',
      dueDate: newProjectDue.trim() || '3 Weeks',
      modules: ['Core Architecture', 'Frontend Interface', 'Cloud API'],
    };

    const updated = [newProj, ...projects];
    setProjects(updated);
    persistState('flow_hq_projects', updated);

    // If client email was provided, auto-create client portal account
    if (newProjectClientEmail.trim()) {
      const newCli: ClientAccount = {
        id: `c-${Date.now()}`,
        name: newProjectClient.trim() || 'Client Lead',
        company: newProjectClient.trim(),
        email: newProjectClientEmail.trim().toLowerCase(),
        projectId: newProj.id,
        projectName: newProj.name,
        accessKey: `${newKey}-CLIENT-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'active',
      };
      const updatedClients = [newCli, ...clients];
      setClients(updatedClients);
      persistState('flow_hq_clients', updatedClients);
    }

    logActivityEvent(session?.userInitials || 'SR', 'created new project', `${newProj.name} (${newKey})`);
    setShowAddProjectModal(false);
    setNewProjectName('');
    setNewProjectKey('');
    setNewProjectClient('');
    setNewProjectClientEmail('');
  };

  // Add Module
  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;

    const updated = projects.map((p) =>
      p.id === targetProjectForModule
        ? { ...p, modules: [...p.modules, newModuleName.trim()] }
        : p
    );
    setProjects(updated);
    persistState('flow_hq_projects', updated);

    logActivityEvent(session?.userInitials || 'SR', 'added module', `${newModuleName.trim()}`);
    setShowAddModuleModal(false);
    setNewModuleName('');
  };

  // Add Task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const proj = projects.find((p) => p.id === newTaskProject);

    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      projectId: newTaskProject,
      moduleName: newTaskModule || (proj?.modules[0] ?? 'Core'),
      title: newTaskTitle.trim(),
      status: newTaskStatus,
      priority: newTaskPriority,
      assignee: newTaskAssignee,
      notes: newTaskNotes.trim() || undefined,
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    persistState('flow_hq_tasks', updated);

    logActivityEvent(session?.userInitials || 'SR', 'created task', `${newTask.title} &rarr; ${newTask.assignee}`);
    setShowAddTaskModal(false);
    setNewTaskTitle('');
    setNewTaskNotes('');
  };

  // Move Task Status
  const handleMoveTaskStatus = (taskId: string, newStatus: TaskItem['status']) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
    setTasks(updated);
    persistState('flow_hq_tasks', updated);

    const target = tasks.find((t) => t.id === taskId);
    if (target) {
      logActivityEvent(session?.userInitials || 'SR', `moved task to ${newStatus}`, target.title);
    }
  };

  // Task Handoff
  const handleExecuteHandoff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTaskForHandoff) return;

    const updated = tasks.map((t) =>
      t.id === targetTaskForHandoff.id
        ? {
            ...t,
            assignee: handoffTargetUser,
            notes: handoffNotes.trim()
              ? `${t.notes ? t.notes + ' | ' : ''}Handoff Note: ${handoffNotes.trim()}`
              : t.notes,
          }
        : t
    );
    setTasks(updated);
    persistState('flow_hq_tasks', updated);

    logActivityEvent(
      session?.userInitials || 'SR',
      `handed off task to ${handoffTargetUser}`,
      targetTaskForHandoff.title
    );

    setShowHandoffModal(false);
    setTargetTaskForHandoff(null);
    setHandoffNotes('');
  };

  // Add Client
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientEmail.trim()) return;

    const proj = projects.find((p) => p.id === newClientProject);
    const projKey = proj?.key || 'FLW';

    const newCli: ClientAccount = {
      id: `c-${Date.now()}`,
      name: newClientName.trim(),
      company: newClientCompany.trim() || 'Client Organization',
      email: newClientEmail.trim().toLowerCase(),
      projectId: newClientProject,
      projectName: proj?.name || 'Assigned Build',
      accessKey: `${projKey}-CLIENT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'active',
    };

    const updated = [newCli, ...clients];
    setClients(updated);
    persistState('flow_hq_clients', updated);

    logActivityEvent(session?.userInitials || 'SR', 'provisioned client portal', `${newCli.name} (${newCli.accessKey})`);
    setShowAddClientModal(false);
    setNewClientName('');
    setNewClientCompany('');
    setNewClientEmail('');
  };

  // Complete Project Action
  const handleCompleteProject = async (projId: string) => {
    const updated = projects.map((p) =>
      p.id === projId ? { ...p, status: 'completed' as const, progress: 100 } : p
    );
    setProjects(updated);
    persistState('flow_hq_projects', updated);

    if (/^[0-9a-f-]{36}$/i.test(projId)) {
      try {
        await supabase.from('projects').update({ status: 'completed' }).eq('id', projId);
      } catch (e) {
        console.warn('Project complete notice:', e);
      }
    }
    const targetProj = projects.find((p) => p.id === projId);
    logActivityEvent(session?.userInitials || 'SR', 'completed project build', targetProj?.name || projId);
  };

  // Manage Project
  const openManageModal = (proj: Project) => {
    setProjectToManage(proj);
    setManageName(proj.name);
    setManageSummary(proj.summary || '');
    setManageBudget(proj.budget);
    setManageDue(proj.dueDate);
    setManageStatus(proj.status);
    setManageClient(proj.client);
    setManageClientEmail(proj.clientEmail || '');
    setManageModules([...proj.modules]);
    setNewModuleInput('');
  };

  const handleAddModuleToManage = () => {
    if (!newModuleInput.trim()) return;
    setManageModules((prev) => [...prev, newModuleInput.trim()]);
    setNewModuleInput('');
  };

  const handleRemoveModule = (idx: number) => {
    setManageModules((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleEditModuleTitle = (idx: number, newTitle: string) => {
    setManageModules((prev) => prev.map((m, i) => (i === idx ? newTitle : m)));
  };

  const saveManageProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToManage) return;

    const updated = projects.map((p) =>
      p.id === projectToManage.id
        ? {
            ...p,
            name: manageName.trim() || p.name,
            summary: manageSummary.trim() || p.summary,
            budget: manageBudget.trim() || p.budget,
            dueDate: manageDue.trim() || p.dueDate,
            status: manageStatus as any,
            client: manageClient.trim() || p.client,
            clientEmail: manageClientEmail.trim() || p.clientEmail,
            modules: manageModules,
            progress: manageStatus === 'completed' ? 100 : p.progress,
          }
        : p
    );
    setProjects(updated);
    persistState('flow_hq_projects', updated);

    if (/^[0-9a-f-]{36}$/i.test(projectToManage.id)) {
      try {
        await supabase
          .from('projects')
          .update({
            name: manageName.trim() || projectToManage.name,
            summary: manageSummary.trim() || manageClient.trim(),
            status: manageStatus,
            due_date: manageDue.trim() || null,
          })
          .eq('id', projectToManage.id);
      } catch (e) {
        console.warn('Project manage update notice:', e);
      }
    }

    logActivityEvent(session?.userInitials || 'SR', 'updated project settings', manageName || projectToManage.name);
    setProjectToManage(null);
  };

  // Delete Project with Confirmation
  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    const projId = projectToDelete.id;

    const updatedProjs = projects.filter((p) => p.id !== projId);
    const updatedTasks = tasks.filter((t) => t.projectId !== projId);
    setProjects(updatedProjs);
    setTasks(updatedTasks);
    persistState('flow_hq_projects', updatedProjs);
    persistState('flow_hq_tasks', updatedTasks);

    if (/^[0-9a-f-]{36}$/i.test(projId)) {
      try {
        await supabase.from('projects').delete().eq('id', projId);
      } catch (e) {
        console.warn('Project delete notice:', e);
      }
    }

    logActivityEvent(session?.userInitials || 'SR', 'deleted project', projectToDelete.name);
    setProjectToDelete(null);
    setDeleteConfirmText('');
  };

  // Edit Team Member
  const openEditMemberModal = (member: TeamMember) => {
    setMemberToEdit(member);
    setEditMemberName(member.name);
    setEditMemberRole(member.role);
    setEditMemberStatus(member.status || 'active');
  };

  const handleSaveEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberToEdit) return;

    const updated = team.map((m) =>
      m.id === memberToEdit.id
        ? {
            ...m,
            name: editMemberName.trim() || m.name,
            role: editMemberRole,
            status: editMemberStatus as any,
          }
        : m
    );
    setTeam(updated);
    persistState('flow_hq_team', updated);

    if (/^[0-9a-f-]{36}$/i.test(memberToEdit.id)) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        await fetch(`/api/platform/team/${memberToEdit.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            full_name: editMemberName.trim(),
            role: editMemberRole,
            status: editMemberStatus,
          }),
        });
      } catch (e) {
        console.warn('Team member update notice:', e);
      }
    }

    logActivityEvent(session?.userInitials || 'SR', 'updated team member', `${editMemberName} (${editMemberRole})`);
    setMemberToEdit(null);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;
    const memberId = memberToDelete.id;

    const updated = team.filter((m) => m.id !== memberId);
    setTeam(updated);
    persistState('flow_hq_team', updated);

    if (/^[0-9a-f-]{36}$/i.test(memberId)) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        await fetch(`/api/platform/team/${memberId}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } catch (e) {
        console.warn('Team member delete notice:', e);
      }
    }

    logActivityEvent(session?.userInitials || 'SR', 'removed team member', memberToDelete.name);
    setMemberToDelete(null);
  };

  // Delete Client
  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    const clientId = clientToDelete.id;

    const updated = clients.filter((c) => c.id !== clientId);
    setClients(updated);
    persistState('flow_hq_clients', updated);

    if (/^[0-9a-f-]{36}$/i.test(clientId)) {
      try {
        await supabase.from('project_clients').delete().eq('user_id', clientId);
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        await fetch(`/api/platform/team/${clientId}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } catch (e) {
        console.warn('Client delete notice:', e);
      }
    }

    logActivityEvent(session?.userInitials || 'SR', 'removed client account', clientToDelete.name);
    setClientToDelete(null);
  };

  // Provision User / Onboard Client with ID + Password
  const handleProvisionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamEmail.trim() || !newMemberPassword.trim()) {
      setOnboardErrorMsg('Full name, email (login ID), and password are required.');
      return;
    }

    setOnboardLoading(true);
    setOnboardErrorMsg('');
    setOnboardSuccessMsg('');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch('/api/platform/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: newTeamEmail.trim().toLowerCase(),
          full_name: newTeamName.trim(),
          password: newMemberPassword.trim(),
          role: newTeamRole,
          project_ids: newClientProject ? [newClientProject] : [],
        }),
      });

      let resData: any = {};
      const resText = await res.text();
      try {
        resData = JSON.parse(resText);
      } catch {
        throw new Error(resText.slice(0, 100) || 'Server returned an invalid response.');
      }

      if (!res.ok) {
        throw new Error(resData.error || resData.message || 'Failed to provision account.');
      }

      setOnboardSuccessMsg(`Account created for ${newTeamEmail}! Welcome email dispatched.`);

      const parts = newTeamName.trim().split(' ');
      const initials = parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();

      const newMember: TeamMember = {
        id: resData.user_id || `tm-${Date.now()}`,
        name: newTeamName.trim(),
        email: newTeamEmail.trim().toLowerCase(),
        role: newTeamRole === 'client' ? 'member' : newTeamRole,
        initials,
        status: 'active',
      };
      setTeam((prev) => [...prev, newMember]);

      if (newTeamRole === 'client') {
        const proj = projects.find((p) => p.id === newClientProject);
        const newCli: ClientAccount = {
          id: resData.user_id || `c-${Date.now()}`,
          name: newTeamName.trim(),
          company: newClientCompany.trim() || proj?.name || 'Client Org',
          email: newTeamEmail.trim().toLowerCase(),
          projectId: newClientProject || projects[0]?.id || 'proj-1',
          projectName: proj?.name || 'Studio Project',
          accessKey: 'PASSWORD-ENABLED',
          status: 'active',
        };
        const updatedClients = [newCli, ...clients];
        setClients(updatedClients);
        persistState('flow_hq_clients', updatedClients);
      }

      logActivityEvent(session?.userInitials || 'SR', 'provisioned account', `${newTeamName} (${newTeamRole})`);

      setTimeout(() => {
        setShowAddTeamModal(false);
        setNewTeamName('');
        setNewTeamEmail('');
        setNewMemberPassword('');
        setOnboardSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      setOnboardErrorMsg(err.message || 'Error provisioning account.');
    } finally {
      setOnboardLoading(false);
    }
  };

  // Quick Task Status Update (for Kanban & Team Workspace)
  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskItem['status']) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
    setTasks(updated);
    persistState('flow_hq_tasks', updated);

    if (/^[0-9a-f-]{36}$/i.test(taskId)) {
      try {
        await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      } catch (e) {
        console.warn('Task status update notice:', e);
      }
    }
  };

  // Submit Daily Standup
  const handleSubmitStandup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!standupShipped.trim()) return;

    const proj = projects.find((p) => p.id === standupProject);
    const newEntry: DailyStandup = {
      id: `std-${Date.now()}`,
      engineer: session?.userName || 'Founder',
      project: proj?.name || 'Studio Architecture',
      shipped: standupShipped.trim(),
      blockers: standupBlockers.trim() || 'None',
      hours: Number(standupHours) || 6,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    };

    const updated = [newEntry, ...standups];
    setStandups(updated);
    persistState('flow_hq_standups', updated);

    logActivityEvent(session?.userInitials || 'SR', 'logged daily standup', `${newEntry.hours}h on ${newEntry.project}`);
    setShowStandupModal(false);
    setStandupShipped('');
    setStandupBlockers('None');
  };

  // Filtered Tasks for current view
  const currentFilteredTasks = tasks.filter((t) => {
    if (filterMyWorkOnly && session?.userInitials) {
      if (t.assignee !== session.userInitials) return false;
    }
    if (selectedProjectFilter !== 'all') {
      if (t.projectId !== selectedProjectFilter) return false;
    }
    return true;
  });

  // Calculate Totals
  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;
  const openTasksCount = tasks.filter((t) => t.status !== 'done').length;
  const urgentTasksCount = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done').length;

  // ================= 1. VIEW: LOGIN SCREEN (UNAUTHENTICATED) =================
  if (!session) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-mono font-medium text-white text-sm mx-auto">
              HQ
            </div>
            <h1 className="font-display text-2xl font-normal text-white">Flow HQ Console</h1>
            <p className="text-slate-400 text-xs">
              Founder operations, task matrix, client portal, and CRM pipeline
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="hq-email" className="block font-mono text-xs text-slate-300">
                Work email <span className="text-rose-400">*</span>
              </label>
              <input
                id="hq-email"
                type="email"
                required
                placeholder="smruti@theflowlabs.online"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="hq-password" className="block font-mono text-xs text-slate-300">
                Password <span className="text-rose-400">*</span>
              </label>
              <input
                id="hq-password"
                type="password"
                required
                placeholder="••••••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#07090E] font-medium text-sm py-2.5 rounded-lg hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors disabled:opacity-50"
            >
              {authLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign in to console</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="font-mono text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              &larr; Exit to public website
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // ================= 2. VIEW: AUTHENTICATED STUDIO OS APPLICATION =================
  const isFounder = session.userRole === 'owner' || session.userRole === 'admin';

  return (
    <div className="pt-6 sm:pt-8 pb-28 px-4 sm:px-6 max-w-6xl mx-auto space-y-8">
      
      {/* ================= TOP CONSOLE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
        
        {/* Brand & User Active Context */}
        <div className="flex items-center gap-3.5">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center font-mono font-medium text-white text-xs transition-colors shrink-0"
            title="Return to public site"
          >
            HQ
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-lg font-normal text-white whitespace-nowrap">Flow HQ Studio OS</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{session.userName} ({session.userRole})</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Projects, task matrix, client portal, and CRM pipeline</p>
          </div>
        </div>

        {/* Global Quick Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-400 border border-white/10 transition-colors"
            title="Sign out of Flow HQ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ================= DEDICATED WORKSPACE TAB STRIP ================= */}
      <div className="p-1.5 rounded-2xl bg-white/[0.02] border border-white/10 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max text-xs font-mono">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'dashboard' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'projects' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Projects ({projects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'tasks' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks ({tasks.length})</span>
          </button>
          {isFounder && (
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'clients' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Clients ({clients.length})</span>
            </button>
          )}
          {isFounder && (
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'team' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team ({team.length})</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('standups')}
            className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'standups' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Standups ({standups.length})</span>
          </button>
          {isFounder && (
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'leads' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Leads CRM ({leads.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= TAB 1: EXECUTIVE DASHBOARD ================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-7">
          
          {/* Key Studio Telemetry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                <span>Active sprint capacity</span>
                <span className="text-emerald-400">{activeProjectsCount} / 4 slots</span>
              </div>
              <div className="font-display text-3xl font-normal text-white">
                {activeProjectsCount} Builds
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Fixed monthly intake ceiling
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                <span>Open task queue</span>
                <span className="text-amber-400">{urgentTasksCount} urgent</span>
              </div>
              <div className="font-display text-3xl font-normal text-white">
                {openTasksCount} Tasks
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Across {projects.length} studio builds
              </div>
            </div>

            {isFounder ? (
              <>
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                    <span>Active clients</span>
                    <span className="text-emerald-400">Active SLA</span>
                  </div>
                  <div className="font-display text-3xl font-normal text-white">
                    {clients.length} Accounts
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Provisioned portal access
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                    <span>Inbound leads</span>
                    <span className="text-white font-medium">{leads.length} new</span>
                  </div>
                  <div className="font-display text-3xl font-normal text-white">
                    {leads.length} Inquiries
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    From project scoping cockpit
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                    <span>My assigned tasks</span>
                    <span className="text-cyan-400 font-mono">Assigned</span>
                  </div>
                  <div className="font-display text-3xl font-normal text-white">
                    {tasks.filter((t) => t.assignee === session.userInitials && t.status !== 'done').length} Active
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Sprint work queue
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                    <span>Daily standups</span>
                    <span className="text-emerald-400 font-mono">Verified</span>
                  </div>
                  <div className="font-display text-3xl font-normal text-white">
                    {standups.filter((s) => s.engineer === session.userName).length} Logged
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Your sprint check-ins
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Quick Creator Bar */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-normal text-white">Studio operations bar</h2>
              <p className="text-slate-400 text-xs">Create projects, modules, tasks, onboard clients, or log standup</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {isFounder && (
                <button
                  onClick={() => setShowAddProjectModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New project</span>
                </button>
              )}
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-xs border border-white/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New task</span>
              </button>
              {isFounder && (
                <button
                  onClick={() => {
                    setNewTeamRole('client');
                    setNewMemberPassword(`Flow${Math.floor(1000 + Math.random() * 9000)}!`);
                    setShowAddTeamModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-xs border border-white/10 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New client</span>
                </button>
              )}
              {isFounder && (
                <button
                  onClick={() => {
                    setNewTeamRole('member');
                    setNewMemberPassword(`Flow${Math.floor(1000 + Math.random() * 9000)}!`);
                    setShowAddTeamModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-xs border border-white/10 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add member</span>
                </button>
              )}
              <button
                onClick={() => setShowStandupModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-mono text-xs border border-emerald-500/20 transition-colors"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Log standup</span>
              </button>
            </div>
          </div>

          {/* Active Builds & Recent Activity Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Active Projects (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-display text-base font-normal text-white">Active sprint deployments</h3>
                  <p className="text-slate-400 text-xs">Direct builds running under founder supervision</p>
                </div>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="text-xs font-mono text-slate-300 hover:text-white"
                >
                  View all &rarr;
                </button>
              </div>

              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-white px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          {p.key}
                        </span>
                        <h4 className="font-medium text-white text-sm">{p.name}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-slate-300">
                        {p.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span>Sprint milestone progress</span>
                        <span className="text-white font-medium">{p.progress}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-white h-full rounded-full" style={{ width: `${p.progress}%` }}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                      <span>Client: {p.client}</span>
                      <span>Target: {p.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Studio Activity Feed (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-display text-base font-normal text-white">Live studio audit feed</h3>
                </div>
                <span className="font-mono text-[10px] text-slate-500">Realtime</span>
              </div>

              <div className="space-y-3">
                {activity.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-medium text-white">{act.actor}</span>
                      <span className="font-mono text-[10px] text-slate-500">{act.time}</span>
                    </div>
                    <p className="text-slate-300 text-xs">
                      {act.action}: <strong className="text-white font-normal">{act.target}</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ================= TAB 2: PROJECTS & MODULES ================= */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="font-display text-xl font-normal text-white">Projects and architectural modules</h2>
              <p className="text-slate-400 text-xs">Studio sprint builds, milestone roadmaps, and technical modules</p>
            </div>
            {isFounder && (
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors w-fit"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create project</span>
              </button>
            )}
          </div>

          {/* Project View Filter Strip (Active vs Completed) */}
          <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto scrollbar-none pb-1">
            <button
              onClick={() => setProjectFilterTab('active')}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                projectFilterTab === 'active'
                  ? 'bg-white/10 border-white/20 text-white font-medium'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Active Builds ({projects.filter((p) => p.status !== 'completed').length})
            </button>
            <button
              onClick={() => setProjectFilterTab('completed')}
              className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                projectFilterTab === 'completed'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-medium'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Completed Projects ({projects.filter((p) => p.status === 'completed').length})</span>
            </button>
            <button
              onClick={() => setProjectFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                projectFilterTab === 'all'
                  ? 'bg-white/10 border-white/20 text-white font-medium'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              All Builds ({projects.length})
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {projects
              .filter((p) => {
                if (projectFilterTab === 'active') return p.status !== 'completed';
                if (projectFilterTab === 'completed') return p.status === 'completed';
                return true;
              })
              .map((proj) => (
              <div key={proj.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-5">
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-xs text-white">
                        {proj.key}
                      </span>
                      <h3 className="font-display text-xl font-normal text-white">{proj.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        {proj.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">
                      Client: <strong className="text-white">{proj.client}</strong>
                      {proj.clientEmail && ` (${proj.clientEmail})`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    {isFounder && (
                      <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                        Budget: {proj.budget}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                      Delivery: {proj.dueDate}
                    </span>

                    {/* Complete Project Button */}
                    {isFounder && (
                      proj.status !== 'completed' ? (
                        <button
                          onClick={() => handleCompleteProject(proj.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                          title="Mark Project Complete"
                        >
                          <Check className="w-3 h-3" />
                          <span>Complete</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[11px]">
                          ✓ Shipped
                        </span>
                      )
                    )}

                    {/* Manage Project Drawer */}
                    {isFounder && (
                      <button
                        onClick={() => openManageModal(proj)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>Manage</span>
                      </button>
                    )}

                    {/* Add Module */}
                    <button
                      onClick={() => {
                        setTargetProjectForModule(proj.id);
                        setShowAddModuleModal(true);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded bg-white text-[#07090E] font-medium hover:bg-slate-200 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add module</span>
                    </button>

                    {/* Delete Project */}
                    {isFounder && (
                      <button
                        onClick={() => setProjectToDelete(proj)}
                        className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        title="Delete project"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Modules breakdown */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between font-mono text-xs text-slate-400">
                    <span>Technical modules ({proj.modules.length}):</span>
                    {isFounder && (
                      <button
                        onClick={() => openManageModal(proj)}
                        className="text-slate-400 hover:text-white underline text-[11px]"
                      >
                        Manage &amp; reorder modules
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {proj.modules.map((mod, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs group">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-500">M0{idx+1}</span>
                          <span className="text-slate-200 font-medium">{mod}</span>
                        </div>
                        {isFounder && (
                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openManageModal(proj)}
                              className="p-1 rounded text-slate-400 hover:text-white"
                              title="Edit module"
                            >
                              <SlidersHorizontal className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                const updatedModules = proj.modules.filter((_, i) => i !== idx);
                                const updatedProjs = projects.map((p) => p.id === proj.id ? { ...p, modules: updatedModules } : p);
                                setProjects(updatedProjs);
                                persistState('flow_hq_projects', updatedProjs);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-400"
                              title="Delete module"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completed Project Delivered Tasks & Artifacts */}
                {proj.status === 'completed' && (
                  <div className="p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-3">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>Completed Project Tasks ({tasks.filter((t) => t.projectId === proj.id && t.status === 'done').length})</span>
                      </span>
                      <span className="text-slate-400">Shipped &amp; Archived</span>
                    </div>

                    <div className="space-y-1.5">
                      {tasks.filter((t) => t.projectId === proj.id && t.status === 'done').length > 0 ? (
                        tasks.filter((t) => t.projectId === proj.id && t.status === 'done').map((t) => (
                          <div key={t.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/[0.02] border border-white/5 font-mono">
                            <span className="text-slate-200">✓ {t.title}</span>
                            <span className="text-slate-500 text-[11px]">{t.assignee}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-500 text-xs font-mono py-1">
                          All project tasks and modules shipped.
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: TASK MATRIX & MY WORK (KANBAN) ================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          
          {/* Header & Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="font-display text-xl font-normal text-white">Collaborative task matrix</h2>
              <p className="text-slate-400 text-xs">Sprint tasks with role delegation, priority tags, and status transitions</p>
            </div>

            {/* Filter Controls & Create Button */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
              
              {/* Task Scope: Active vs All */}
              <div className="flex items-center gap-1 font-mono text-xs">
                <button
                  onClick={() => setTaskScopeFilter('active')}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    taskScopeFilter === 'active'
                      ? 'bg-white/10 border-white/20 text-white font-medium'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                  title="Show active sprint tasks only (Done tasks are in Completed Projects)"
                >
                  Active Sprint ({currentFilteredTasks.filter((t) => t.status !== 'done').length})
                </button>
                <button
                  onClick={() => setTaskScopeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    taskScopeFilter === 'all'
                      ? 'bg-white/10 border-white/20 text-white font-medium'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                  title="Show all status columns including Done"
                >
                  All Columns ({currentFilteredTasks.length})
                </button>
              </div>

              {/* My Work Toggle */}
              <button
                onClick={() => setFilterMyWorkOnly(!filterMyWorkOnly)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  filterMyWorkOnly
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-medium'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {filterMyWorkOnly ? 'Showing: My Work Only' : 'Filter: My Work'}
              </button>

              {/* Project Filter */}
              <select
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
              >
                <option value="all" className="bg-[#0E1424]">All projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0E1424]">
                    {p.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowAddTaskModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create task</span>
              </button>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className={`grid grid-cols-1 ${taskScopeFilter === 'all' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 items-start`}>
            
            {/* Column 1: To Do */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-white/10">
                <span className="text-slate-300 font-medium">To do</span>
                <span className="text-slate-500">{currentFilteredTasks.filter((t) => t.status === 'todo').length}</span>
              </div>
              <div className="space-y-2.5">
                {currentFilteredTasks.filter((t) => t.status === 'todo').map((t) => (
                  <div key={t.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2 text-xs">
                    <div className="font-medium text-white">{t.title}</div>
                    {t.notes && <p className="text-slate-400 text-[11px] leading-relaxed">{t.notes}</p>}
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span className={t.priority === 'urgent' ? 'text-amber-400 font-semibold' : ''}>{t.priority}</span>
                      <span>Assignee: {t.assignee}</span>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                      <button
                        onClick={() => {
                          setTargetTaskForHandoff(t);
                          setShowHandoffModal(true);
                        }}
                        className="text-[10px] font-mono text-slate-400 hover:text-white"
                      >
                        Hand off
                      </button>
                      <button
                        onClick={() => handleMoveTaskStatus(t.id, 'in_progress')}
                        className="text-[10px] font-mono text-slate-300 hover:text-white"
                      >
                        Start &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-white/10">
                <span className="text-white font-medium">In progress</span>
                <span className="text-emerald-400 font-semibold">{currentFilteredTasks.filter((t) => t.status === 'in_progress').length}</span>
              </div>
              <div className="space-y-2.5">
                {currentFilteredTasks.filter((t) => t.status === 'in_progress').map((t) => (
                  <div key={t.id} className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-2 text-xs">
                    <div className="font-medium text-white">{t.title}</div>
                    {t.notes && <p className="text-slate-400 text-[11px] leading-relaxed">{t.notes}</p>}
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span className="text-amber-400">{t.priority}</span>
                      <span>Assignee: {t.assignee}</span>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                      <button
                        onClick={() => {
                          setTargetTaskForHandoff(t);
                          setShowHandoffModal(true);
                        }}
                        className="text-[10px] font-mono text-slate-400 hover:text-white"
                      >
                        Hand off
                      </button>
                      <button
                        onClick={() => handleMoveTaskStatus(t.id, 'review')}
                        className="text-[10px] font-mono text-slate-300 hover:text-white"
                      >
                        Review &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Review */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-white/10">
                <span className="text-slate-300 font-medium">Review</span>
                <span className="text-slate-500">{currentFilteredTasks.filter((t) => t.status === 'review').length}</span>
              </div>
              <div className="space-y-2.5">
                {currentFilteredTasks.filter((t) => t.status === 'review').map((t) => (
                  <div key={t.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2 text-xs">
                    <div className="font-medium text-white">{t.title}</div>
                    {t.notes && <p className="text-slate-400 text-[11px] leading-relaxed">{t.notes}</p>}
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span>{t.priority}</span>
                      <span>Assignee: {t.assignee}</span>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => handleMoveTaskStatus(t.id, 'done')}
                        className="text-[10px] font-mono text-emerald-400 hover:underline"
                      >
                        Approve &amp; merge &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 4: Done (Archived to Completed Projects in default sprint mode) */}
            {taskScopeFilter === 'all' && (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-white/10">
                  <span className="text-slate-300 font-medium">Done (Shipped)</span>
                  <span className="text-slate-500">{currentFilteredTasks.filter((t) => t.status === 'done').length}</span>
                </div>
                <div className="space-y-2.5">
                  {currentFilteredTasks.filter((t) => t.status === 'done').map((t) => (
                    <div key={t.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs opacity-75">
                      <div className="font-medium text-slate-300 line-through">{t.title}</div>
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                        <span>Shipped</span>
                        <span>{t.assignee}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ================= TAB 4: CLIENTS & PORTAL MANAGEMENT ================= */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="font-display text-xl font-normal text-white">Client accounts and portal access</h2>
              <p className="text-slate-400 text-xs">Onboard clients, link builds, and issue unique portal telemetry keys</p>
            </div>
            <button
              onClick={() => {
                setNewTeamRole('client');
                setNewMemberPassword(`Flow${Math.floor(1000 + Math.random() * 9000)}!`);
                setShowAddTeamModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors w-fit"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Onboard client</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clients.map((cli) => (
              <div key={cli.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white text-base">{cli.name}</h3>
                    <div className="text-xs text-slate-400">{cli.company} ({cli.email})</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    {cli.status}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned build:</span>
                    <span className="text-white font-medium">{cli.projectName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Auth Method:</span>
                    <span className="text-emerald-400 font-semibold">Email & Password</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Client Login ID:</span>
                    <span className="text-slate-200 font-semibold">{cli.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
                  <button
                    onClick={() => {
                      const creds = `Login ID: ${cli.email} | Portal: https://www.theflowlabs.online/client`;
                      navigator.clipboard?.writeText?.(creds);
                      alert(`Copied login details for ${cli.name}:\n${creds}`);
                    }}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                  >
                    Copy credentials
                  </button>
                  {isFounder && (
                    <button
                      onClick={() => setClientToDelete(cli)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                      title="Delete client account"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: STUDIO TEAM DIRECTORY ================= */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="font-display text-xl font-normal text-white">Studio team directory</h2>
              <p className="text-slate-400 text-xs">Founders, partners, and engineers authoring client systems</p>
            </div>
            <button
              onClick={() => setShowAddTeamModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors w-fit"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add team member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {team.map((m) => (
              <div key={m.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-mono font-medium text-white text-xs">
                    {m.initials}
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-base">{m.name}</h3>
                    <div className="font-mono text-xs text-slate-400 capitalize">{m.role}</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-slate-400 pt-2 border-t border-white/5 space-y-1">
                  <div>{m.email}</div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500">Status: {m.status}</span>
                    {isFounder && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditMemberModal(m)}
                          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setMemberToDelete(m)}
                          className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                          title="Remove member"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: DAILY STANDUPS ================= */}
      {activeTab === 'standups' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="font-display text-xl font-normal text-white">Daily sprint standups</h2>
              <p className="text-slate-400 text-xs">End-of-day commits, blockers, and hours logged per build</p>
            </div>
            <button
              onClick={() => setShowStandupModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors w-fit"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log daily standup</span>
            </button>
          </div>

          <div className="space-y-3">
            {standups.length > 0 ? (
              standups.map((std) => (
                <div key={std.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <strong className="text-white font-medium">{std.engineer}</strong>
                      <span className="text-slate-500 font-mono">on {std.project}</span>
                    </div>
                    <span className="font-mono text-slate-400">{std.date} · {std.hours}h logged</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    <strong className="text-slate-400">Shipped:</strong> {std.shipped}
                  </p>
                  {std.blockers !== 'None' && (
                    <p className="text-amber-400/90 leading-relaxed">
                      <strong>Blocker:</strong> {std.blockers}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 text-center text-xs font-mono text-slate-500">
                No daily standup logs yet. Click &quot;Log daily standup&quot; to submit today&apos;s sprint progress.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 7: LEADS CRM ================= */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="font-display text-xl font-normal text-white">Inbound leads CRM</h2>
              <p className="text-slate-400 text-xs">Direct submissions from the scoping cockpit and website intake</p>
            </div>
            <button
              onClick={loadLeads}
              disabled={loadingLeads}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs border border-white/10 transition-colors w-fit"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? 'animate-spin' : ''}`} />
              <span>Refresh leads</span>
            </button>
          </div>

          <div className="space-y-3">
            {leads.length > 0 ? (
              leads.map((lead) => (
                <div key={lead.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">{lead.name}</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-slate-300">
                        {lead.project_type}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-slate-400">
                      Contact: <strong className="text-white">{lead.contact}</strong> · Budget: <strong className="text-emerald-400">{lead.budget}</strong>
                    </div>
                    {lead.idea && (
                      <p className="text-slate-400 text-xs mt-1 max-w-2xl">{lead.idea}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <button
                      onClick={() => {
                        setNewTeamName(lead.name);
                        setNewTeamEmail(lead.contact);
                        setNewTeamRole('client');
                        setNewClientCompany(lead.name + ' Org');
                        setNewMemberPassword(`Flow${Math.floor(1000 + Math.random() * 9000)}!`);
                        setShowAddTeamModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-mono text-xs transition-colors whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Onboard Customer</span>
                    </button>
                    <div className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 text-center text-xs font-mono text-slate-500">
                No recent leads captured yet. Submissions from /scoping will automatically appear here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD PROJECT ================= */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-lg font-normal text-white">Create new project</h3>
                <p className="text-slate-400 text-xs">Initialize sprint build and tracking key</p>
              </div>
              <button onClick={() => setShowAddProjectModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Project name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NextGen Telehealth App"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Project key</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="e.g. MED"
                    value={newProjectKey}
                    onChange={(e) => setNewProjectKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-white/30 uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Client organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MedCare Inc"
                    value={newProjectClient}
                    onChange={(e) => setNewProjectClient(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Client email (Optional - auto creates portal account)</label>
                <input
                  type="email"
                  placeholder="e.g. client@medcare.com"
                  value={newProjectClientEmail}
                  onChange={(e) => setNewProjectClientEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Budget</label>
                  <input
                    type="text"
                    placeholder="₹85,000"
                    value={newProjectBudget}
                    onChange={(e) => setNewProjectBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Duration</label>
                  <input
                    type="text"
                    placeholder="3 Weeks"
                    value={newProjectDue}
                    onChange={(e) => setNewProjectDue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200"
                >
                  Create project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD MODULE ================= */}
      {showAddModuleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-lg font-normal text-white">Add architecture module</h3>
                <p className="text-slate-400 text-xs">Define a core technical layer under this project</p>
              </div>
              <button onClick={() => setShowAddModuleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddModule} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Module title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supabase RLS & Auth Isolation"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Lead engineer</label>
                <select
                  value={newModuleLead}
                  onChange={(e) => setNewModuleLead(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                >
                  {team.map((m) => (
                    <option key={m.id} value={m.initials} className="bg-[#0E1424]">
                      {m.name} ({m.initials})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200"
                >
                  Add module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD TASK ================= */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-lg font-normal text-white">Create new task</h3>
                <p className="text-slate-400 text-xs">Assign development task to a team member</p>
              </div>
              <button onClick={() => setShowAddTaskModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Task title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement edge token validation"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Technical notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Key endpoints, PR targets or architecture guidelines"
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Project</label>
                  <select
                    value={newTaskProject}
                    onChange={(e) => setNewTaskProject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#0E1424]">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                  >
                    {team.map((m) => (
                      <option key={m.id} value={m.initials} className="bg-[#0E1424]">
                        {m.name} ({m.initials})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e: any) => setNewTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="urgent" className="bg-[#0E1424]">Urgent</option>
                    <option value="high" className="bg-[#0E1424]">High</option>
                    <option value="medium" className="bg-[#0E1424]">Medium</option>
                    <option value="low" className="bg-[#0E1424]">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Initial status</label>
                  <select
                    value={newTaskStatus}
                    onChange={(e: any) => setNewTaskStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="todo" className="bg-[#0E1424]">To do</option>
                    <option value="in_progress" className="bg-[#0E1424]">In progress</option>
                    <option value="review" className="bg-[#0E1424]">Review</option>
                    <option value="done" className="bg-[#0E1424]">Done</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200"
                >
                  Create task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TASK HANDOFF ================= */}
      {showHandoffModal && targetTaskForHandoff && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-lg font-normal text-white">Hand off sprint task</h3>
                <p className="text-slate-400 text-xs">{targetTaskForHandoff.title}</p>
              </div>
              <button onClick={() => setShowHandoffModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteHandoff} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Delegate to engineer</label>
                <select
                  value={handoffTargetUser}
                  onChange={(e) => setHandoffTargetUser(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                >
                  {team.map((m) => (
                    <option key={m.id} value={m.initials} className="bg-[#0E1424]">
                      {m.name} ({m.initials} - {m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Context notes for handoff</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Migration script tested on local, needs edge deployment and index check."
                  value={handoffNotes}
                  onChange={(e) => setHandoffNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowHandoffModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200"
                >
                  Confirm handoff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PROVISION USER / ONBOARD CLIENT ================= */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-lg font-normal text-white">
                  {newTeamRole === 'client' ? 'Onboard Client & Provision Portal' : 'Add Studio Team Member'}
                </h3>
                <p className="text-slate-400 text-xs">
                  {newTeamRole === 'client'
                    ? 'Creates client ID & password and dispatches automated welcome email'
                    : 'Provisions engineer credentials with direct password login'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddTeamModal(false);
                  setOnboardErrorMsg('');
                  setOnboardSuccessMsg('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {onboardSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{onboardSuccessMsg}</span>
              </div>
            )}

            {onboardErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{onboardErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleProvisionUser} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">
                  {newTeamRole === 'client' ? 'Client Contact Name' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={newTeamRole === 'client' ? 'e.g. Vikram Verma' : 'e.g. Priya Dash'}
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              {newTeamRole === 'client' && (
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Company / Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zenith Mobility"
                    value={newClientCompany}
                    onChange={(e) => setNewClientCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Work Email (Login ID)</label>
                <input
                  type="email"
                  required
                  placeholder={newTeamRole === 'client' ? 'client@company.com' : 'engineer@theflowlabs.online'}
                  value={newTeamEmail}
                  onChange={(e) => setNewTeamEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Initial Password</label>
                <input
                  type="text"
                  required
                  placeholder="Set initial password..."
                  value={newMemberPassword}
                  onChange={(e) => setNewMemberPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-white/30"
                />
                <p className="text-[10px] text-slate-400">User will use this password to sign in directly.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Access Role</label>
                  <select
                    value={newTeamRole}
                    onChange={(e: any) => setNewTeamRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="client" className="bg-[#0E1424]">Client (Portal)</option>
                    <option value="member" className="bg-[#0E1424]">Member (Engineer)</option>
                    <option value="manager" className="bg-[#0E1424]">Manager (Lead)</option>
                    <option value="admin" className="bg-[#0E1424]">Admin (Full)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Assigned Project</label>
                  <select
                    value={newClientProject}
                    onChange={(e) => setNewClientProject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#0E1424]">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTeamModal(false);
                    setOnboardErrorMsg('');
                    setOnboardSuccessMsg('');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={onboardLoading}
                  className="px-4 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  {onboardLoading ? 'Provisioning...' : 'Provision User & Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: MANAGE & EDIT PROJECT ================= */}
      {projectToManage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full p-6 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-lg font-normal text-white">Edit Project &amp; Modules</h3>
                <p className="text-slate-400 text-xs">{projectToManage.key} · Architectural specifications</p>
              </div>
              <button onClick={() => setProjectToManage(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveManageProject} className="space-y-4">
              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Project Name</label>
                <input
                  type="text"
                  required
                  value={manageName}
                  onChange={(e) => setManageName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Project Status</label>
                  <select
                    value={manageStatus}
                    onChange={(e) => setManageStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="active" className="bg-[#0E1424]">Active (In Sprint)</option>
                    <option value="planning" className="bg-[#0E1424]">Planning (Scoping)</option>
                    <option value="completed" className="bg-[#0E1424]">Completed (Shipped)</option>
                    <option value="on_hold" className="bg-[#0E1424]">On Hold</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Delivery Due Date</label>
                  <input
                    type="text"
                    value={manageDue}
                    onChange={(e) => setManageDue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Client Organization</label>
                  <input
                    type="text"
                    value={manageClient}
                    onChange={(e) => setManageClient(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Budget / Value</label>
                  <input
                    type="text"
                    value={manageBudget}
                    onChange={(e) => setManageBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Client Work Email</label>
                <input
                  type="email"
                  value={manageClientEmail}
                  onChange={(e) => setManageClientEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Project Architecture Summary</label>
                <textarea
                  rows={2}
                  value={manageSummary}
                  onChange={(e) => setManageSummary(e.target.value)}
                  placeholder="Key architecture components and delivery milestones"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30 resize-none"
                />
              </div>

              {/* Technical Modules Manager */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-300">Technical Modules ({manageModules.length})</span>
                  <span className="text-slate-500 text-[11px]">Edit or remove</span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {manageModules.map((mod, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500 w-7 shrink-0">M0{idx + 1}</span>
                      <input
                        type="text"
                        value={mod}
                        onChange={(e) => handleEditModuleTitle(idx, e.target.value)}
                        className="flex-1 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-white/30"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveModule(idx)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Remove module"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new module input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newModuleInput}
                    onChange={(e) => setNewModuleInput(e.target.value)}
                    placeholder="New module title (e.g. Stripe Billing Engine)"
                    className="flex-1 px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-white/30"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddModuleToManage();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddModuleToManage}
                    className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white font-mono text-xs border border-white/10 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setProjectToManage(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE PROJECT CONFIRMATION ================= */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-rose-500/30 shadow-2xl space-y-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-normal text-white">Delete Project</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Are you sure you want to permanently delete <strong className="text-white">{projectToDelete.name}</strong>?
                  This will remove all associated tasks, modules, and unlink connected clients.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProject}
                className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs font-mono transition-colors"
              >
                Yes, Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CLIENT CONFIRMATION ================= */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-rose-500/30 shadow-2xl space-y-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-normal text-white">Delete Client Account</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Are you sure you want to delete <strong className="text-white">{clientToDelete.name}</strong> ({clientToDelete.company})?
                  This will revoke their portal access and unlink them from {clientToDelete.projectName}.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteClient}
                className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs font-mono transition-colors"
              >
                Yes, Delete Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT TEAM MEMBER ================= */}
      {memberToEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-lg font-normal text-white">Edit Team Member</h3>
                <p className="text-slate-400 text-xs">{memberToEdit.email}</p>
              </div>
              <button onClick={() => setMemberToEdit(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMember} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={editMemberName}
                  onChange={(e) => setEditMemberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Access Role</label>
                <select
                  value={editMemberRole}
                  onChange={(e: any) => setEditMemberRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                >
                  <option value="member" className="bg-[#0E1424]">Member (Task execution)</option>
                  <option value="manager" className="bg-[#0E1424]">Manager (Sprint delegation)</option>
                  <option value="admin" className="bg-[#0E1424]">Admin (Full control)</option>
                  <option value="owner" className="bg-[#0E1424]">Owner (Studio leadership)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Status</label>
                <select
                  value={editMemberStatus}
                  onChange={(e) => setEditMemberStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                >
                  <option value="active" className="bg-[#0E1424]">Active</option>
                  <option value="suspended" className="bg-[#0E1424]">Suspended</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setMemberToEdit(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE TEAM MEMBER CONFIRMATION ================= */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-rose-500/30 shadow-2xl space-y-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-normal text-white">Remove Team Member</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Are you sure you want to remove <strong className="text-white">{memberToDelete.name}</strong> ({memberToDelete.email})?
                  They will lose access to Flow HQ.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMember}
                className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs font-mono transition-colors"
              >
                Yes, Remove Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: LOG DAILY STANDUP ================= */}
      {showStandupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-lg font-normal text-white">Log daily standup</h3>
                <p className="text-slate-400 text-xs">Record today&apos;s delivered code, blockers, and hours</p>
              </div>
              <button onClick={() => setShowStandupModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitStandup} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Active project</label>
                <select
                  value={standupProject}
                  onChange={(e) => setStandupProject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#0E1424]">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Shipped code / progress today</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Shipped Next.js 15 client dashboard, wired Supabase Realtime channel, tested latency."
                  value={standupShipped}
                  onChange={(e) => setStandupShipped(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Blockers (if any)</label>
                  <input
                    type="text"
                    placeholder="e.g. None or waiting for API keys"
                    value={standupBlockers}
                    onChange={(e) => setStandupBlockers(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Hours logged</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={standupHours}
                    onChange={(e) => setStandupHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowStandupModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200"
                >
                  Submit standup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
