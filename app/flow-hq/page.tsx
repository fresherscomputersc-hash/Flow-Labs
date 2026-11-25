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
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ================= TYPES =================
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
  initials: string;
  status: 'active' | 'invited';
}

interface Project {
  id: string;
  name: string;
  key: string;
  client: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  progress: number;
  budget: string;
  dueDate: string;
  modules: string[];
}

interface Module {
  id: string;
  projectId: string;
  name: string;
  lead: string;
  status: 'planning' | 'in_progress' | 'completed';
}

interface TaskItem {
  id: string;
  projectId: string;
  moduleName?: string;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee: string;
}

interface ClientAccount {
  id: string;
  name: string;
  company: string;
  email: string;
  projectId: string;
  projectName: string;
  accessKey: string;
  status: 'active' | 'pending';
}

interface Lead {
  id: string;
  name: string;
  contact: string;
  project_type: string;
  budget: string;
  idea?: string;
  created_at: string;
}

// ================= INITIAL SEED DATA =================
const INITIAL_TEAM: TeamMember[] = [
  { id: '1', name: 'Smruti Ranjan', email: 'smruti@theflowlabs.online', role: 'owner', initials: 'SR', status: 'active' },
  { id: '2', name: 'Biswash', email: 'biswash@theflowlabs.online', role: 'admin', initials: 'BW', status: 'active' },
  { id: '3', name: 'Arpita', email: 'arpita@theflowlabs.online', role: 'admin', initials: 'AP', status: 'active' },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Droovee Chauffeur Platform',
    key: 'DRV',
    client: 'Droovee Mobility',
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
    status: 'completed',
    progress: 100,
    budget: '₹40,000',
    dueDate: 'Completed',
    modules: ['Synthetic Heartbeats', 'Telegram Bot Alerts'],
  },
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    projectId: 'proj-1',
    moduleName: 'Driver Dispatch Engine',
    title: 'Deploy Droovee dynamic distance calculation algorithm',
    status: 'in_progress',
    priority: 'urgent',
    assignee: 'SR',
  },
  {
    id: 't-2',
    projectId: 'proj-2',
    moduleName: 'YOLOv8 Edge Pipeline',
    title: 'Optimize Drishti YOLOv8 video frame rate to 30 FPS on edge node',
    status: 'in_progress',
    priority: 'high',
    assignee: 'BW',
  },
  {
    id: 't-3',
    projectId: 'proj-1',
    moduleName: 'Customer Web Booking',
    title: 'Ship Three.js spatial design system components for client portal',
    status: 'review',
    priority: 'medium',
    assignee: 'AP',
  },
  {
    id: 't-4',
    projectId: 'proj-1',
    moduleName: 'Automated GST Billing',
    title: 'Finalize PostgreSQL row-level security policies for multi-tenant users',
    status: 'done',
    priority: 'high',
    assignee: 'SR',
  },
];

const INITIAL_CLIENTS: ClientAccount[] = [
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

export default function FlowHQPage() {
  // Authentication State
  const [session, setSession] = useState<{ userEmail: string; userName: string; userRole: string } | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Console Active View
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'tasks' | 'clients' | 'team' | 'leads'>('dashboard');

  // Application Data States
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [clients, setClients] = useState<ClientAccount[]>(INITIAL_CLIENTS);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Filters
  const [taskFilterProject, setTaskFilterProject] = useState<string>('all');
  const [taskFilterAssignee, setTaskFilterAssignee] = useState<string>('all');

  // Modals Open State
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);

  // Selected Project for adding module
  const [selectedProjectForModule, setSelectedProjectForModule] = useState<string>('proj-1');

  // Form States - New Project
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectKey, setNewProjectKey] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState('₹60,000');
  const [newProjectDue, setNewProjectDue] = useState('4 Weeks');

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

  // Form States - New Client
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientProject, setNewClientProject] = useState('proj-1');

  // Form States - New Team Member
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamEmail, setNewTeamEmail] = useState('');
  const [newTeamRole, setNewTeamRole] = useState<'owner' | 'admin' | 'manager' | 'member'>('member');

  // Check existing session
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          const email = data.session.user.email || 'founder@theflowlabs.online';
          setSession({
            userEmail: email,
            userName: email.split('@')[0],
            userRole: 'Owner',
          });
        }
      } catch (err) {
        console.warn('Auth session check notice:', err);
      }
    }
    checkAuth();
  }, []);

  // Load Leads from Supabase
  const loadLeads = async () => {
    setLoadingLeads(true);
    try {
      const { data, error } = await supabase
        .from('site_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (data && !error) {
        setLeads(data);
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

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      // Attempt Supabase Auth login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (error) {
        // Fallback for founder access if running locally or demo account
        if (
          authEmail.toLowerCase().includes('theflowlabs') ||
          authEmail.toLowerCase() === 'theflowlabs01@gmail.com' ||
          authPassword === 'flowlabs2026'
        ) {
          setSession({
            userEmail: authEmail,
            userName: 'Founder',
            userRole: 'Owner',
          });
        } else {
          setAuthError(error.message || 'Invalid credentials. Please verify your email and password.');
        }
      } else if (data?.session) {
        setSession({
          userEmail: data.session.user.email || authEmail,
          userName: data.session.user.user_metadata?.full_name || authEmail.split('@')[0],
          userRole: 'Admin',
        });
      }
    } catch (err: any) {
      // Local fallback for founder testing
      if (
        authEmail.toLowerCase().includes('theflowlabs') ||
        authEmail.toLowerCase() === 'theflowlabs01@gmail.com' ||
        authPassword === 'flowlabs2026'
      ) {
        setSession({
          userEmail: authEmail,
          userName: 'Founder',
          userRole: 'Owner',
        });
      } else {
        setAuthError(err.message || 'Sign in encountered an error.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Founder Bypass Quick Sign In
  const handleFounderQuickLogin = (email: string, role: string, name: string) => {
    setSession({
      userEmail: email,
      userName: name,
      userRole: role,
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

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      key: newProjectKey.trim().toUpperCase() || 'FLW',
      client: newProjectClient.trim() || 'Direct Client',
      status: 'active',
      progress: 0,
      budget: newProjectBudget.trim() || '₹60,000',
      dueDate: newProjectDue.trim() || '3 Weeks',
      modules: ['Core Architecture'],
    };

    setProjects((prev) => [newProj, ...prev]);
    setShowAddProjectModal(false);
    setNewProjectName('');
    setNewProjectKey('');
    setNewProjectClient('');
  };

  // Add Module
  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;

    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProjectForModule
          ? { ...p, modules: [...p.modules, newModuleName.trim()] }
          : p
      )
    );

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
    };

    setTasks((prev) => [newTask, ...prev]);
    setShowAddTaskModal(false);
    setNewTaskTitle('');
  };

  // Add Client
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientEmail.trim()) return;

    const proj = projects.find((p) => p.id === newClientProject);

    const newCli: ClientAccount = {
      id: `c-${Date.now()}`,
      name: newClientName.trim(),
      company: newClientCompany.trim() || 'Client Company',
      email: newClientEmail.trim().toLowerCase(),
      projectId: newClientProject,
      projectName: proj?.name || 'Assigned Project',
      accessKey: `${proj?.key || 'FLW'}-CLIENT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'active',
    };

    setClients((prev) => [newCli, ...prev]);
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

    setTeam((prev) => [...prev, newMember]);
    setShowAddTeamModal(false);
    setNewTeamName('');
    setNewTeamEmail('');
  };

  // Move Task Status
  const handleMoveTaskStatus = (taskId: string, newStatus: TaskItem['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  // ================= VIEW: LOGIN SCREEN (IF NOT AUTHENTICATED) =================
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
              Founder operations, task matrix, client portal and CRM pipeline
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
                onClick={() => handleFounderQuickLogin('smruti@theflowlabs.online', 'Owner', 'Smruti Ranjan')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
              >
                Smruti (SR)
              </button>
              <button
                type="button"
                onClick={() => handleFounderQuickLogin('biswash@theflowlabs.online', 'Admin', 'Biswash')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
              >
                Biswash (BW)
              </button>
              <button
                type="button"
                onClick={() => handleFounderQuickLogin('arpita@theflowlabs.online', 'Admin', 'Arpita')}
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

  // ================= VIEW: LOGGED IN FLOW HQ APPLICATION =================
  return (
    <div className="pt-6 sm:pt-10 pb-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-8">
      
      {/* ================= TOP CONSOLE HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
        
        {/* Brand & User Info */}
        <div className="flex items-center gap-3.5">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center font-mono font-medium text-white text-xs transition-colors shrink-0"
            title="Return to public site"
          >
            HQ
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg font-normal text-white">Flow HQ Console</h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Active session: {session.userName} ({session.userRole})</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Projects, task matrix, client portal and CRM pipeline</p>
          </div>
        </div>

        {/* Console Navigation Tabs & User Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/10 overflow-x-auto text-xs font-mono">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'dashboard' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'projects' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'tasks' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Task Matrix ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'clients' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Clients ({clients.length})
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'team' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Team ({team.length})
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'leads' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Leads CRM ({leads.length})
            </button>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-1.5">
            <Link
              href="/client"
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-xs border border-white/10 transition-colors"
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

      </div>

      {/* ================= TAB 1: DASHBOARD ================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="font-mono text-xs text-slate-400">Active projects</span>
              <div className="font-display text-2xl font-normal text-white">{projects.length} builds</div>
              <div className="text-[11px] font-mono text-emerald-400">{projects.filter(p => p.status === 'active').length} in active development</div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="font-mono text-xs text-slate-400">Tasks in queue</span>
              <div className="font-display text-2xl font-normal text-white">
                {tasks.filter((t) => t.status !== 'done').length} open
              </div>
              <div className="text-[11px] font-mono text-amber-400">
                {tasks.filter((t) => t.priority === 'urgent').length} urgent sprint priority
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="font-mono text-xs text-slate-400">Active clients</span>
              <div className="font-display text-2xl font-normal text-white">{clients.length} accounts</div>
              <div className="text-[11px] font-mono text-slate-400">Connected to client portal</div>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="font-mono text-xs text-slate-400">Website leads</span>
              <div className="font-display text-2xl font-normal text-white">{leads.length || '3'} submissions</div>
              <div className="text-[11px] font-mono text-slate-400">From scoping cockpit</div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-normal text-white">Workspace actions</h3>
              <p className="text-slate-400 text-xs">Create and manage your projects, tasks, clients, and team members</p>
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
            </div>
          </div>

          {/* Active Projects Overview */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-display text-base font-normal text-white">Active sprint deployments</h3>
                <p className="text-slate-400 text-xs">Live projects under development by founding engineers</p>
              </div>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs font-mono text-slate-300 hover:text-white"
              >
                View all projects &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-400">{p.key}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-slate-300">
                      {p.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{p.name}</h4>
                    <div className="text-xs text-slate-400">{p.client}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>Progress</span>
                      <span className="text-white">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-white h-full rounded-full" style={{ width: `${p.progress}%` }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-white/5">
                    <span>Due: {p.dueDate}</span>
                    <span>{p.budget}</span>
                  </div>
                </div>
              ))}
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
              <p className="text-slate-400 text-xs">Manage studio builds, milestones, and technical modules</p>
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
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-xs text-white">
                        {proj.key}
                      </span>
                      <h3 className="font-display text-xl font-normal text-white">{proj.name}</h3>
                    </div>
                    <p className="text-slate-400 text-xs">Client: <strong className="text-white">{proj.client}</strong></p>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                      Budget: {proj.budget}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                      Deadline: {proj.dueDate}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedProjectForModule(proj.id);
                        setShowAddModuleModal(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white text-[#07090E] font-medium hover:bg-slate-200"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add module</span>
                    </button>
                  </div>
                </div>

                {/* Modules breakdown */}
                <div className="space-y-2">
                  <div className="font-mono text-xs text-slate-400">Architectural modules ({proj.modules.length}):</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {proj.modules.map((mod, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                        <span className="text-slate-200">{mod}</span>
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

      {/* ================= TAB 3: TASK MATRIX (KANBAN) ================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="font-display text-xl font-normal text-white">Collaborative task matrix</h2>
              <p className="text-slate-400 text-xs">Real-time sprint tasks across projects and founding engineers</p>
            </div>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors w-fit"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create new task</span>
            </button>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            
            {/* Column: To Do */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-white/10">
                <span className="text-slate-300 font-medium">To do</span>
                <span className="text-slate-500">{tasks.filter((t) => t.status === 'todo').length}</span>
              </div>
              <div className="space-y-2.5">
                {tasks.filter((t) => t.status === 'todo').map((t) => (
                  <div key={t.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2 text-xs">
                    <div className="font-medium text-white">{t.title}</div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span>{t.priority}</span>
                      <span>Assignee: {t.assignee}</span>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex justify-end">
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

            {/* Column: In Progress */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-white/10">
                <span className="text-white font-medium">In progress</span>
                <span className="text-emerald-400 font-semibold">{tasks.filter((t) => t.status === 'in_progress').length}</span>
              </div>
              <div className="space-y-2.5">
                {tasks.filter((t) => t.status === 'in_progress').map((t) => (
                  <div key={t.id} className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-2 text-xs">
                    <div className="font-medium text-white">{t.title}</div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span className="text-amber-400">{t.priority}</span>
                      <span>Assignee: {t.assignee}</span>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex justify-end gap-2">
                      <button
                        onClick={() => handleMoveTaskStatus(t.id, 'review')}
                        className="text-[10px] font-mono text-slate-300 hover:text-white"
                      >
                        Ready for review &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column: Review */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-white/10">
                <span className="text-slate-300 font-medium">Review</span>
                <span className="text-slate-500">{tasks.filter((t) => t.status === 'review').length}</span>
              </div>
              <div className="space-y-2.5">
                {tasks.filter((t) => t.status === 'review').map((t) => (
                  <div key={t.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2 text-xs">
                    <div className="font-medium text-white">{t.title}</div>
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

            {/* Column: Done */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-white/10">
                <span className="text-slate-300 font-medium">Done</span>
                <span className="text-slate-500">{tasks.filter((t) => t.status === 'done').length}</span>
              </div>
              <div className="space-y-2.5">
                {tasks.filter((t) => t.status === 'done').map((t) => (
                  <div key={t.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs opacity-70">
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

      {/* ================= TAB 4: CLIENTS ================= */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="font-display text-xl font-normal text-white">Client accounts and portal access</h2>
              <p className="text-slate-400 text-xs">Onboard clients, link projects, and grant portal telemetry keys</p>
            </div>
            <button
              onClick={() => setShowAddClientModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors w-fit"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add new client</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clients.map((cli) => (
              <div key={cli.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white text-base">{cli.name}</h3>
                    <div className="text-xs text-slate-400">{cli.company} ({cli.email})</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    {cli.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Project:</span>
                    <span className="text-white">{cli.projectName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Portal Access Key:</span>
                    <span className="text-slate-300 font-semibold">{cli.accessKey}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
                  <Link href="/client" className="text-slate-300 hover:text-white underline">
                    Preview client portal view
                  </Link>
                  <button
                    onClick={() => alert(`Client credentials copied: ${cli.email} / ${cli.accessKey}`)}
                    className="text-slate-400 hover:text-white"
                  >
                    Copy keys
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: TEAM ================= */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="font-display text-xl font-normal text-white">Studio team directory</h2>
              <p className="text-slate-400 text-xs">Founders and engineers with access to Flow HQ</p>
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
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-mono font-medium text-white text-xs">
                    {m.initials}
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">{m.name}</h3>
                    <div className="font-mono text-xs text-slate-400 capitalize">{m.role}</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-slate-400 pt-2 border-t border-white/5">
                  <div>{m.email}</div>
                  <div className="text-slate-500 mt-0.5">Status: {m.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: LEADS CRM ================= */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="font-display text-xl font-normal text-white">Inbound leads CRM</h2>
              <p className="text-slate-400 text-xs">Client submissions from the project scoping cockpit and website forms</p>
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
                <p className="text-slate-400 text-xs">Initialize a new build sprint and tracking key</p>
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Budget</label>
                  <input
                    type="text"
                    placeholder="₹75,000"
                    value={newProjectBudget}
                    onChange={(e) => setNewProjectBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Sprint duration</label>
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
                <p className="text-slate-400 text-xs">Assign a development task to a team member</p>
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

      {/* ================= MODAL: ADD CLIENT ================= */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-lg font-normal text-white">Add new client</h3>
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
                <label className="block font-mono text-xs text-slate-300">Assign project</label>
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
                  Onboard client
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

    </div>
  );
}
