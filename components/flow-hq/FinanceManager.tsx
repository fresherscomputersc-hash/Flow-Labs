'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  RefreshCw,
  Download,
  CreditCard,
  Receipt,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  X,
  Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  project_id: string;
  client_id: string;
  title: string;
  type: 'advance' | 'milestone' | 'final' | 'retainer';
  line_items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_at?: string;
  payment_method?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  reference_id: string;
  status: string;
  paid_at: string;
}

export interface Expense {
  id: string;
  project_id?: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  incurred_date: string;
}

export interface TeamPayout {
  id: string;
  member_id: string;
  project_id?: string;
  hours_logged: number;
  hourly_rate: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'paid';
  period_start?: string;
  period_end?: string;
  created_at: string;
}

interface FinanceManagerProps {
  projects: any[];
  clients: any[];
  team: any[];
}

export default function FinanceManager({ projects, clients, team }: FinanceManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'payments' | 'expenses' | 'payouts'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payouts, setPayouts] = useState<TeamPayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  // Modal states
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  // New Invoice Form
  const [invProject, setInvProject] = useState('');
  const [invClient, setInvClient] = useState('');
  const [invTitle, setInvTitle] = useState('');
  const [invType, setInvType] = useState<Invoice['type']>('milestone');
  const [invCurrency, setInvCurrency] = useState('USD');
  const [invDueDate, setInvDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [invItems, setInvItems] = useState<InvoiceItem[]>([
    { description: 'Sprint Milestone Delivery & Staging Acceptance', quantity: 1, unit_price: 2500, total: 2500 }
  ]);

  // Payment Form
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('card');
  const [payRef, setPayRef] = useState('');

  // Expense Form
  const [expCategory, setExpCategory] = useState('software');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [invRes, payRes, expRes, outRes] = await Promise.all([
        supabase.from('invoices').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('paid_at', { ascending: false }),
        supabase.from('expenses').select('*').order('incurred_date', { ascending: false }),
        supabase.from('team_payouts').select('*').order('created_at', { ascending: false })
      ]);

      if (invRes.data) setInvoices(invRes.data);
      if (payRes.data) setPayments(payRes.data);
      if (expRes.data) setExpenses(expRes.data);
      if (outRes.data) setPayouts(outRes.data);
    } catch (err) {
      console.warn('Finance data load notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  // Aggregations
  const totalInvoiced = invoices.reduce((acc, i) => acc + (Number(i.total_amount) || 0), 0);
  const totalCollected = invoices
    .filter(i => i.status === 'paid')
    .reduce((acc, i) => acc + (Number(i.total_amount) || 0), 0);
  const totalPending = invoices
    .filter(i => i.status === 'sent' || i.status === 'draft')
    .reduce((acc, i) => acc + (Number(i.total_amount) || 0), 0);
  const totalExpensesAmount = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const totalPayoutsAmount = payouts.reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0);
  const netProfit = totalCollected - totalExpensesAmount - totalPayoutsAmount;

  // Invoice Items Helpers
  const handleUpdateInvItem = (index: number, field: keyof InvoiceItem, val: any) => {
    const updated = [...invItems];
    const item = { ...updated[index], [field]: val };
    if (field === 'quantity' || field === 'unit_price') {
      const q = field === 'quantity' ? Number(val) : item.quantity;
      const p = field === 'unit_price' ? Number(val) : item.unit_price;
      item.total = (q || 0) * (p || 0);
    }
    updated[index] = item;
    setInvItems(updated);
  };

  const handleAddInvItem = () => {
    setInvItems([...invItems, { description: 'Additional Engineering Sprint', quantity: 1, unit_price: 1000, total: 1000 }]);
  };

  const handleRemoveInvItem = (index: number) => {
    if (invItems.length === 1) return;
    setInvItems(invItems.filter((_, i) => i !== index));
  };

  const invSubtotal = invItems.reduce((acc, i) => acc + (Number(i.total) || 0), 0);

  // Submit New Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invTitle.trim() || !invProject) {
      alert('Please fill in title and select a project.');
      return;
    }

    try {
      const invNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const { error } = await supabase.from('invoices').insert([
        {
          invoice_number: invNumber,
          project_id: invProject,
          client_id: invClient || null,
          title: invTitle.trim(),
          type: invType,
          line_items: invItems,
          subtotal: invSubtotal,
          tax: 0,
          total_amount: invSubtotal,
          currency: invCurrency,
          status: 'sent',
          due_date: invDueDate
        }
      ]);

      if (error) throw error;
      setNotice(`Invoice ${invNumber} generated and dispatched.`);
      setShowCreateInvoiceModal(false);
      setInvTitle('');
      await fetchFinanceData();
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice.');
    }
  };

  // Submit Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment || !payAmount) return;

    try {
      const res = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_payment',
          invoice_id: selectedInvoiceForPayment.id,
          amount: Number(payAmount),
          payment_method: payMethod,
          reference_id: payRef || `PAY-${Date.now()}`
        })
      });
      const data = await res.json();
      if (data.ok) {
        setNotice('Payment successfully recorded against invoice.');
        setShowPaymentModal(false);
        setSelectedInvoiceForPayment(null);
        await fetchFinanceData();
      } else {
        alert(data.error || 'Failed to record payment.');
      }
    } catch (err: any) {
      alert(err.message || 'Error recording payment.');
    }
  };

  // Submit Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim() || !expAmount) return;

    try {
      const { error } = await supabase.from('expenses').insert([
        {
          category: expCategory,
          description: expDesc.trim(),
          amount: Number(expAmount),
          currency: 'USD',
          incurred_date: expDate
        }
      ]);

      if (error) throw error;
      setNotice('Expense logged successfully.');
      setShowExpenseModal(false);
      setExpDesc('');
      setExpAmount('');
      await fetchFinanceData();
    } catch (err: any) {
      alert(err.message || 'Failed to log expense.');
    }
  };

  // Export CSV
  const exportInvoicesCsv = () => {
    if (invoices.length === 0) return;
    const headers = ['Invoice Number', 'Title', 'Type', 'Amount', 'Currency', 'Status', 'Due Date', 'Paid Date'];
    const rows = invoices.map(i => [
      i.invoice_number,
      `"${i.title.replace(/"/g, '""')}"`,
      i.type,
      i.total_amount,
      i.currency,
      i.status,
      i.due_date,
      i.paid_at || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `flow_labs_invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-7">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="font-display text-xl font-normal text-white">Finance, Invoicing & Payouts</h2>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Studio revenue engine, milestone invoice generation, team payout ledgers, and expense tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCreateInvoiceModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Invoice</span>
          </button>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs border border-white/10 transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Log Expense</span>
          </button>
          <button
            onClick={exportInvoicesCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs border border-white/10 transition-colors"
            title="Export Invoices as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchFinanceData}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Financial Health Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 font-mono">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
          <div className="text-slate-400 text-[11px]">Total Invoiced</div>
          <div className="font-display text-2xl text-white font-normal">${totalInvoiced.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">{invoices.length} invoices generated</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
          <div className="text-slate-400 text-[11px]">Collected Revenue</div>
          <div className="font-display text-2xl text-emerald-400 font-normal">${totalCollected.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-500/80">Paid in full</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
          <div className="text-slate-400 text-[11px]">Pending Receivables</div>
          <div className="font-display text-2xl text-amber-400 font-normal">${totalPending.toLocaleString()}</div>
          <div className="text-[10px] text-amber-500/80">Awaiting client settlement</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
          <div className="text-slate-400 text-[11px]">Studio Expenses</div>
          <div className="font-display text-2xl text-slate-300 font-normal">${totalExpensesAmount.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">{expenses.length} expense items</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
          <div className="text-slate-400 text-[11px]">Net Studio Margin</div>
          <div className={`font-display text-2xl font-normal ${netProfit >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
            ${netProfit.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">Collected less expenses</div>
        </div>
      </div>

      {/* Sub-Tabs Strip */}
      <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveSubTab('invoices')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeSubTab === 'invoices' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveSubTab('payments')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeSubTab === 'payments' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          Payment Receipts ({payments.length})
        </button>
        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeSubTab === 'expenses' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          Expenses ({expenses.length})
        </button>
        <button
          onClick={() => setActiveSubTab('payouts')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeSubTab === 'payouts' ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          Team Payouts ({payouts.length})
        </button>
      </div>

      {/* VIEW 1: INVOICES LIST */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-medium">{inv.invoice_number}</span>
                  <span className="text-white font-medium text-sm">{inv.title}</span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase border ${
                    inv.status === 'paid'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : inv.status === 'sent'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}>
                    {inv.status}
                  </span>
                  <span className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-white/5 text-slate-400">
                    {inv.type}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-500">
                  Due {new Date(inv.due_date).toLocaleDateString()} · {inv.line_items?.length || 1} line item(s)
                  {inv.paid_at && ` · Settled ${new Date(inv.paid_at).toLocaleDateString()}`}
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-center font-mono">
                <div className="text-right">
                  <div className="text-slate-400 text-[10px]">Invoice Total</div>
                  <div className="font-display text-base text-white font-normal">
                    ${Number(inv.total_amount).toLocaleString()} {inv.currency}
                  </div>
                </div>

                {inv.status !== 'paid' && (
                  <button
                    onClick={() => {
                      setSelectedInvoiceForPayment(inv);
                      setPayAmount(String(inv.total_amount));
                      setShowPaymentModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs transition-colors whitespace-nowrap"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Record Payment</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {invoices.length === 0 && (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No invoices created yet. Click &quot;Generate Invoice&quot; to issue your first billing milestone.
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PAYMENTS LIST */}
      {activeSubTab === 'payments' && (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-xs font-mono">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-medium">Verified Payment</span>
                  <span className="text-slate-400">Ref: {p.reference_id}</span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Method: {p.payment_method} · Paid {new Date(p.paid_at).toLocaleString()}
                </div>
              </div>
              <div className="font-display text-base text-emerald-400 font-normal">
                +${Number(p.amount).toLocaleString()}
              </div>
            </div>
          ))}

          {payments.length === 0 && (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No payment transactions recorded yet.
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: EXPENSES LIST */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-3">
          {expenses.map((e) => (
            <div key={e.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-xs font-mono">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{e.description}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-slate-400 border border-white/5 uppercase">
                    {e.category}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px]">Incurred {new Date(e.incurred_date).toLocaleDateString()}</div>
              </div>
              <div className="font-display text-base text-slate-300 font-normal">
                -${Number(e.amount).toLocaleString()}
              </div>
            </div>
          ))}

          {expenses.length === 0 && (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No expenses logged yet. Click &quot;Log Expense&quot; to record studio tooling or contractor costs.
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: TEAM PAYOUTS */}
      {activeSubTab === 'payouts' && (
        <div className="space-y-3">
          {payouts.map((out) => (
            <div key={out.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-xs font-mono">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">Team Member Payout</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${
                    out.status === 'paid'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}>
                    {out.status}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  {out.hours_logged}h logged @ ${out.hourly_rate}/h
                </div>
              </div>
              <div className="font-display text-base text-white font-normal">
                ${Number(out.total_amount).toLocaleString()}
              </div>
            </div>
          ))}

          {payouts.length === 0 && (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No team payout records generated yet. Log hours via Time Tracker to auto-calculate payouts.
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: GENERATE INVOICE ================= */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full p-6 sm:p-7 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-start pb-4 border-b border-white/10">
              <div>
                <h3 className="font-display text-xl font-normal text-white">Generate Studio Invoice</h3>
                <p className="text-slate-400 text-xs mt-1">Create and dispatch advance, milestone, or final invoices</p>
              </div>
              <button onClick={() => setShowCreateInvoiceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Project *</label>
                  <select
                    required
                    value={invProject}
                    onChange={(e) => setInvProject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="" className="bg-[#0E1424]">-- Select Project --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#0E1424]">{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Invoice Type</label>
                  <select
                    value={invType}
                    onChange={(e) => setInvType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="advance" className="bg-[#0E1424]">Advance Deposit (50%)</option>
                    <option value="milestone" className="bg-[#0E1424]">Milestone Release</option>
                    <option value="final" className="bg-[#0E1424]">Final Handover</option>
                    <option value="retainer" className="bg-[#0E1424]">Monthly Retainer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Invoice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Milestone 2: Staging Deployment & API Completion"
                  value={invTitle}
                  onChange={(e) => setInvTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-medium">Line Items</span>
                  <button type="button" onClick={handleAddInvItem} className="text-cyan-400 hover:text-cyan-300 text-xs">
                    + Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {invItems.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center gap-2 text-xs">
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => handleUpdateInvItem(idx, 'description', e.target.value)}
                        placeholder="Description"
                        className="flex-1 w-full px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-white focus:outline-none"
                      />
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateInvItem(idx, 'quantity', Number(e.target.value))}
                          className="w-16 px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white font-mono text-center"
                        />
                        <span className="text-slate-500 font-mono">×</span>
                        <input
                          type="number"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => handleUpdateInvItem(idx, 'unit_price', Number(e.target.value))}
                          className="w-24 px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white font-mono text-center"
                        />
                        <span className="text-slate-500 font-mono">=</span>
                        <div className="w-20 font-mono text-right text-emerald-400 font-medium">
                          ${item.total.toLocaleString()}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveInvItem(idx)}
                          disabled={invItems.length === 1}
                          className="p-1 text-slate-500 hover:text-red-400 disabled:opacity-20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-2 text-xs font-mono">
                  <span className="text-slate-400">Total Invoice Amount:</span>
                  <span className="font-display text-lg text-emerald-400 font-normal">
                    ${invSubtotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Due Date</label>
                  <input
                    type="date"
                    required
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Currency</label>
                  <select
                    value={invCurrency}
                    onChange={(e) => setInvCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200"
                >
                  Create & Dispatch Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD PAYMENT ================= */}
      {showPaymentModal && selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-lg font-normal text-white">Record Invoice Payment</h3>
                <p className="text-slate-400 text-xs">For {selectedInvoiceForPayment.invoice_number}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Amount Received ($)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Payment Rail / Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                >
                  <option value="stripe">Stripe</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="bank_wire">Bank Wire / ACH</option>
                  <option value="card">Credit Card</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Transaction Reference ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ch_3M5qJj2eZvKYlo2C1g"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black font-medium text-xs font-mono hover:bg-emerald-400"
                >
                  Mark Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LOG EXPENSE ================= */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0E1424] border border-white/20 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-lg font-normal text-white">Log Studio Expense</h3>
                <p className="text-slate-400 text-xs">Record tooling, infra, or contractor costs</p>
              </div>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                >
                  <option value="software">Software / SaaS</option>
                  <option value="hosting">Cloud / Hosting / Supabase</option>
                  <option value="contractor">External Specialist</option>
                  <option value="assets">Design Assets / Fonts</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-xs text-slate-300">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OpenAI / Claude LLM API compute credits"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Amount ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="150"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-mono text-xs text-slate-300">Date</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white text-[#07090E] font-medium text-xs font-mono hover:bg-slate-200"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
