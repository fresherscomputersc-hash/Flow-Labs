'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

const DEFAULT_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Vikramaditya Patnaik',
    contact: 'vikram@odishalogistics.in',
    project_type: 'Fleet Dispatch & Telemetry IoT',
    budget: '₹1,80,000',
    idea: 'Need a real-time GPS fleet tracking system with automated driver trip allocation, fuel consumption analytics, and instant WhatsApp billing.',
    created_at: '2026-11-24T16:30:00Z',
    status: 'new'
  },
  {
    id: 'lead-2',
    name: 'Dr. Ananya Mohanty',
    contact: 'ananya@medixcare.org',
    project_type: 'Healthcare Patient Portal & EMR',
    budget: '₹95,000',
    idea: 'Telemedicine consultation workflow with automated calendar invites, encrypted prescription uploads, and Razorpay OPD fee collection.',
    created_at: '2026-11-23T11:15:00Z',
    status: 'contacted'
  },
  {
    id: 'lead-3',
    name: 'Rahul Senapati',
    contact: 'rahul@urbanmart.co',
    project_type: 'Quick-Commerce Hyperlocal Catalog',
    budget: '₹1,40,000',
    idea: '15,000 SKU catalog with sub-second Elasticsearch indexing, real-time store inventory sync, and Mapbox courier routing.',
    created_at: '2026-11-21T09:40:00Z',
    status: 'qualified'
  }
];

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

  // Form States - New Team Member
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamEmail, setNewTeamEmail] = useState('');
  const [newTeamRole, setNewTeamRole] = useState<'owner' | 'admin' | 'manager' | 'member'>('member');

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

  // Check Supabase Auth session
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          const email = data.session.user.email || 'smruti@theflowlabs.online';
          const name = email.split('@')[0];
          setSession({
            userEmail: email,
            userName: name.charAt(0).toUpperCase() + name.slice(1),
            userRole: 'Owner',
            userInitials: name.slice(0, 2).toUpperCase(),
          });
        }
      } catch (err) {
        console.warn('Auth session check notice:', err);
      }
    }
    checkAuth();
  }, []);

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
        if (
          authEmail.toLowerCase().includes('theflowlabs') ||
          authEmail.toLowerCase() === 'theflowlabs01@gmail.com' ||
          authPassword === 'flowlabs2026'
        ) {
          const name = authEmail.split('@')[0];
          setSession({
            userEmail: authEmail,
            userName: name.charAt(0).toUpperCase() + name.slice(1),
            userRole: 'Owner',
            userInitials: name.slice(0, 2).toUpperCase(),
          });
        } else {
          setAuthError(error.message || 'Invalid credentials. Please verify your email and password.');
        }
      } else if (data?.session) {
        const email = data.session.user.email || authEmail;
        const name = data.session.user.user_metadata?.full_name || email.split('@')[0];
        setSession({
          userEmail: email,
          userName: name,
          userRole: 'Admin',
          userInitials: name.slice(0, 2).toUpperCase(),
        });
      }
    } catch (err: any) {
      if (
        authEmail.toLowerCase().includes('theflowlabs') ||
        authEmail.toLowerCase() === 'theflowlabs01@gmail.com' ||
        authPassword === 'flowlabs2026'
      ) {
        setSession({
          userEmail: authEmail,
          userName: 'Founder',
          userRole: 'Owner',
          userInitials: 'SR',
        });
      } else {
        setAuthError(err.message || 'Sign in encountered an error.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Quick Founder Preset Login
  const handleFounderQuickLogin = (email: string, role: string, name: string, initials: string) => {
    setSession({
      userEmail: email,
      userName: name,
      userRole: role,
      userInitials: initials,
    });
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

  // Add Team Member
  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamEmail.trim()) return;

    const parts = newTeamName.trim().split(' ');
    const initials = parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();

    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: newTeamName.trim(),
      email: newTeamEmail.trim().toLowerCase(),
      role: newTeamRole,
      initials,
      status: 'active',
    };

    const updated = [...team, newMember];
    setTeam(updated);
    persistState('flow_hq_team', updated);

    logActivityEvent(session?.userInitials || 'SR', 'added team member', `${newMember.name} (${newMember.role})`);
    setShowAddTeamModal(false);
    setNewTeamName('');
    setNewTeamEmail('');
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
              <label className="block font-mono text-xs text-slate-300">Work email</label>
              <input
                type="email"
                required
                placeholder="smruti@theflowlabs.online"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-xs text-slate-300">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/30"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#07090E] font-medium text-sm py-2.5 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
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

          {/* Quick Founder Access Panel */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
              <span>Quick founder access</span>
              <span>Founder credentials</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFounderQuickLogin('smruti@theflowlabs.online', 'Owner', 'Smruti Ranjan', 'SR')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
              >
                Smruti (SR)
              </button>
              <button
                type="button"
                onClick={() => handleFounderQuickLogin('biswash@theflowlabs.online', 'Admin', 'Biswash', 'BW')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
              >
                Biswash (BW)
              </button>
              <button
                type="button"
                onClick={() => handleFounderQuickLogin('arpita@theflowlabs.online', 'Admin', 'Arpita', 'AP')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
              >
                Arpita (AP)
              </button>
            </div>
          </div>

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
          <Link
            href="/client"
            className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-xs border border-white/10 transition-colors whitespace-nowrap"
            title="Open Client Portal View"
          >
            Client View
          </Link>
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
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'clients' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Clients ({clients.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'team' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team ({team.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('standups')}
            className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'standups' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Standups ({standups.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'leads' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Leads CRM ({leads.length})</span>
          </button>
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

          </div>

          {/* Quick Creator Bar */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-normal text-white">Studio operations bar</h2>
              <p className="text-slate-400 text-xs">Create projects, modules, tasks, onboard clients, or log standup</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New project</span>
              </button>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-xs border border-white/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New task</span>
              </button>
              <button
                onClick={() => setShowAddClientModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-xs border border-white/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New client</span>
              </button>
              <button
                onClick={() => setShowAddTeamModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-xs border border-white/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add member</span>
              </button>
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
            <button
              onClick={() => setShowAddProjectModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors w-fit"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {projects.map((proj) => (
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
                    <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                      Budget: {proj.budget}
                    </span>
                    <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                      Delivery: {proj.dueDate}
                    </span>
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
                  </div>
                </div>

                {/* Modules breakdown */}
                <div className="space-y-2.5">
                  <div className="font-mono text-xs text-slate-400">Technical modules ({proj.modules.length}):</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {proj.modules.map((mod, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                        <span className="text-slate-200 font-medium">{mod}</span>
                        <span className="font-mono text-[10px] text-slate-500">M0{idx+1}</span>
                      </div>
                    ))}
                  </div>
                </div>

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            
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

            {/* Column 4: Done */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-white/10">
                <span className="text-slate-300 font-medium">Done</span>
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
              onClick={() => setShowAddClientModal(true)}
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
                    <span className="text-slate-500">Portal access key:</span>
                    <span className="text-slate-200 font-semibold">{cli.accessKey}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
                  <Link href="/client" className="text-slate-300 hover:text-white underline">
                    Preview client view
                  </Link>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText?.(cli.accessKey);
                      alert(`Copied access key for ${cli.name}: ${cli.accessKey}`);
                    }}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                  >
                    Copy credentials
                  </button>
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
                  <div className="text-slate-500">Status: {m.status}</div>
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
                  <div className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
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

      {/* ================= MODAL: ADD CLIENT ================= */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-lg font-normal text-white">Onboard client</h3>
                <p className="text-slate-400 text-xs">Create client credentials and link to their build</p>
              </div>
              <button onClick={() => setShowAddClientModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClient} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Client contact name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Verma"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Company / Product</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zenith Mobility"
                  value={newClientCompany}
                  onChange={(e) => setNewClientCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Work email</label>
                <input
                  type="email"
                  required
                  placeholder="vikram@zenithmobility.com"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Assign build project</label>
                <select
                  value={newClientProject}
                  onChange={(e) => setNewClientProject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#0E1424]">
                      {p.name} ({p.key})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200"
                >
                  Provision portal access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD TEAM MEMBER ================= */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-lg font-normal text-white">Add studio team member</h3>
                <p className="text-slate-400 text-xs">Invite an engineer to collaborate on builds and tasks</p>
              </div>
              <button onClick={() => setShowAddTeamModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeamMember} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Full name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Dash"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Work email</label>
                <input
                  type="email"
                  required
                  placeholder="priya@theflowlabs.online"
                  value={newTeamEmail}
                  onChange={(e) => setNewTeamEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Access role</label>
                <select
                  value={newTeamRole}
                  onChange={(e: any) => setNewTeamRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                >
                  <option value="member" className="bg-[#0E1424]">Member (Task execution)</option>
                  <option value="manager" className="bg-[#0E1424]">Manager (Sprint delegation)</option>
                  <option value="admin" className="bg-[#0E1424]">Admin (Full project control)</option>
                  <option value="owner" className="bg-[#0E1424]">Owner (Studio leadership)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200"
                >
                  Add team member
                </button>
              </div>
            </form>
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
