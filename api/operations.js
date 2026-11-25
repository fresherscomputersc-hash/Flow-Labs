// ============================================================
// /api/operations - Studio Operations Lifecycle Engine
// Handles:
//   - Accept Proposal -> Auto-create Project, Milestones, Tasks, Checklist, Advance Invoice
//   - Create / Manage Invoices & Record Payments
//   - Submit Tasks for QA Review & Flag Blockers
//   - Close Project with Handover Verification
//   - AI Project Status Summaries
// ============================================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jolcqqwvzrvqydzxpwij.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
  || process.env.SUPABASE_SERVICE_ROLE_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvbGNxcXd2enJ2cXlkenhwd2lqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mzg3NDUyMSwiZXhwIjoyMTA5NDUwNTIxfQ.1fLjVpclKFx2q2CJxBWm8Rjkj7-w9H0Y0FZ2f9tLneE';

const json = (res, status, data) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
};

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
};

const supabaseFetch = async (endpoint, options = {}) => {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: options.prefer || 'return=representation',
    ...(options.headers || {})
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null };
  } catch (e) {
    return { ok: res.ok, status: res.status, data: text };
  }
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  try {
    const body = await readBody(req);
    const { action } = body;

    // ----------------------------------------------------
    // 1. ACCEPT PROPOSAL -> AUTO CREATE PROJECT & CHECKLIST
    // ----------------------------------------------------
    if (action === 'accept_proposal') {
      const { proposal_id, client_id, signature_name } = body;
      if (!proposal_id) {
        return json(res, 400, { ok: false, error: 'proposal_id is required' });
      }

      // Fetch proposal details
      const propRes = await supabaseFetch(`proposals?id=eq.${proposal_id}&select=*`);
      if (!propRes.ok || !propRes.data || propRes.data.length === 0) {
        return json(res, 404, { ok: false, error: 'Proposal not found' });
      }
      const proposal = propRes.data[0];

      // Mark proposal accepted
      await supabaseFetch(`proposals?id=eq.${proposal_id}`, {
        method: 'PATCH',
        body: {
          status: 'accepted',
          accepted_at: new Date().toISOString()
        }
      });

      // If tied to a lead, mark lead won
      if (proposal.lead_id) {
        await supabaseFetch(`site_leads?id=eq.${proposal.lead_id}`, {
          method: 'PATCH',
          body: {
            stage: 'won',
            converted_at: new Date().toISOString(),
            converted_to_client_id: client_id || proposal.client_id
          }
        });
      }

      // Create Project from proposal
      const projRes = await supabaseFetch(`projects`, {
        method: 'POST',
        body: {
          name: proposal.title,
          summary: proposal.scope || `Project created from accepted proposal "${proposal.title}"`,
          status: 'active',
          progress: 10,
          health: 'on_track',
          budget_hours: 80,
          spent_hours: 0,
          target_delivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });

      if (!projRes.ok || !projRes.data || projRes.data.length === 0) {
        return json(res, 500, { ok: false, error: 'Failed to create project', details: projRes.data });
      }
      const project = projRes.data[0];

      // Associate client if provided
      const resolvedClientId = client_id || proposal.client_id;
      if (resolvedClientId) {
        await supabaseFetch(`project_clients`, {
          method: 'POST',
          body: {
            project_id: project.id,
            user_id: resolvedClientId
          }
        });
      }

      // Create Pre-built Milestones
      const milestones = [
        { title: 'Discovery & Architecture', order_index: 1, status: 'in_progress', progress: 50 },
        { title: 'Core Implementation & Integrations', order_index: 2, status: 'pending', progress: 0 },
        { title: 'QA, Client Review & Handover', order_index: 3, status: 'pending', progress: 0 }
      ];

      for (const m of milestones) {
        const modRes = await supabaseFetch(`modules`, {
          method: 'POST',
          body: {
            project_id: project.id,
            title: m.title,
            order_index: m.order_index,
            status: m.status,
            progress: m.progress
          }
        });

        if (modRes.ok && modRes.data && modRes.data.length > 0) {
          const mod = modRes.data[0];
          // Create initial starter task
          await supabaseFetch(`tasks`, {
            method: 'POST',
            body: {
              project_id: project.id,
              module_id: mod.id,
              title: `${m.title} - Scope Setup`,
              status: m.order_index === 1 ? 'in_progress' : 'todo',
              priority: 'high',
              estimated_hours: 8
            }
          });
        }
      }

      // Create Onboarding Checklist
      if (resolvedClientId) {
        await supabaseFetch(`onboarding_checklists`, {
          method: 'POST',
          body: {
            project_id: project.id,
            client_id: resolvedClientId,
            status: 'active',
            items: [
              { id: '1', label: 'Brand Assets & Logo (SVG/PNG vector files)', completed: false },
              { id: '2', label: 'Domain, DNS & Hosting Access Credentials', completed: false },
              { id: '3', label: 'Third-party API Keys (Stripe, AI, Auth)', completed: false },
              { id: '4', label: 'Confirm Primary Stakeholder & Decision Maker', completed: false }
            ]
          }
        });
      }

      // Generate Advance Deposit Invoice (50% or full)
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const totalAmount = Number(proposal.total_amount || 2500);
      const advanceAmount = Math.round(totalAmount * 0.5);

      if (resolvedClientId) {
        await supabaseFetch(`invoices`, {
          method: 'POST',
          body: {
            invoice_number: invoiceNumber,
            project_id: project.id,
            client_id: resolvedClientId,
            title: `Advance Deposit — ${project.name}`,
            type: 'advance',
            subtotal: advanceAmount,
            tax: 0,
            total_amount: advanceAmount,
            currency: proposal.currency || 'INR',
            status: 'sent',
            line_items: [
              { description: `50% Advance Commitment Deposit for ${project.name}`, quantity: 1, unit_price: advanceAmount, total: advanceAmount }
            ]
          }
        });
      }

      // Create Handover Checklist template for the project
      await supabaseFetch(`handover_checklists`, {
        method: 'POST',
        body: {
          project_id: project.id,
          is_completed: false,
          items: [
            { id: 'h1', label: 'Production Deployment & DNS switch completed', category: 'deployment', completed: false },
            { id: 'h2', label: 'Admin credentials & password transfer securely shared', category: 'security', completed: false },
            { id: 'h3', label: 'Code repository ownership transferred / invite accepted', category: 'code', completed: false },
            { id: 'h4', label: 'Walkthrough video & technical documentation shared', category: 'handover', completed: false },
            { id: 'h5', label: 'Final invoice settled and receipt issued', category: 'finance', completed: false }
          ]
        }
      });

      return json(res, 200, {
        ok: true,
        project_id: project.id,
        message: 'Proposal accepted, project provisioned, and onboarding checklist initialized.'
      });
    }

    // ----------------------------------------------------
    // 2. SUBMIT FOR INTERNAL QA REVIEW
    // ----------------------------------------------------
    if (action === 'submit_for_review') {
      const { task_id, reviewer_id, notes, deliverable_url } = body;
      if (!task_id) return json(res, 400, { ok: false, error: 'task_id is required' });

      await supabaseFetch(`tasks?id=eq.${task_id}`, {
        method: 'PATCH',
        body: {
          status: 'active',
          in_review: true,
          reviewer_id: reviewer_id || null
        }
      });

      // Log comment / note on task
      if (notes || deliverable_url) {
        await supabaseFetch(`task_comments`, {
          method: 'POST',
          body: {
            task_id,
            content: `Submitted for QA Review: ${notes || ''} ${deliverable_url ? `[Deliverable Link](${deliverable_url})` : ''}`
          }
        });
      }

      return json(res, 200, { ok: true, message: 'Task submitted for QA review.' });
    }

    // ----------------------------------------------------
    // 3. FLAG BLOCKER
    // ----------------------------------------------------
    if (action === 'flag_blocker') {
      const { task_id, blocker_reason } = body;
      if (!task_id || !blocker_reason) {
        return json(res, 400, { ok: false, error: 'task_id and blocker_reason are required' });
      }

      await supabaseFetch(`tasks?id=eq.${task_id}`, {
        method: 'PATCH',
        body: {
          is_blocked: true,
          blocker_reason
        }
      });

      // Add task comment
      await supabaseFetch(`task_comments`, {
        method: 'POST',
        body: {
          task_id,
          content: `BLOCKER FLAGGED: ${blocker_reason}`
        }
      });

      return json(res, 200, { ok: true, message: 'Blocker flagged and recorded.' });
    }

    // ----------------------------------------------------
    // 4. UNFLAG BLOCKER
    // ----------------------------------------------------
    if (action === 'resolve_blocker') {
      const { task_id } = body;
      if (!task_id) return json(res, 400, { ok: false, error: 'task_id is required' });

      await supabaseFetch(`tasks?id=eq.${task_id}`, {
        method: 'PATCH',
        body: {
          is_blocked: false,
          blocker_reason: null
        }
      });

      return json(res, 200, { ok: true, message: 'Blocker marked resolved.' });
    }

    // ----------------------------------------------------
    // 5. RECORD INVOICE PAYMENT
    // ----------------------------------------------------
    if (action === 'record_payment') {
      const { invoice_id, amount, payment_method = 'card', reference_id } = body;
      if (!invoice_id || !amount) {
        return json(res, 400, { ok: false, error: 'invoice_id and amount are required' });
      }

      // Insert payment record
      await supabaseFetch(`payments`, {
        method: 'POST',
        body: {
          invoice_id,
          amount: Number(amount),
          payment_method,
          reference_id: reference_id || `PAY-${Date.now()}`,
          status: 'completed',
          paid_at: new Date().toISOString()
        }
      });

      // Mark invoice paid
      await supabaseFetch(`invoices?id=eq.${invoice_id}`, {
        method: 'PATCH',
        body: {
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_method
        }
      });

      return json(res, 200, { ok: true, message: 'Payment recorded and invoice marked as paid.' });
    }

    // ----------------------------------------------------
    // 6. VERIFY & COMPLETE HANDOVER
    // ----------------------------------------------------
    if (action === 'complete_handover') {
      const { project_id } = body;
      if (!project_id) return json(res, 400, { ok: false, error: 'project_id is required' });

      // Check checklist items
      const chkRes = await supabaseFetch(`handover_checklists?project_id=eq.${project_id}&select=*`);
      if (chkRes.ok && chkRes.data && chkRes.data.length > 0) {
        const checklist = chkRes.data[0];
        const uncompleted = (checklist.items || []).filter(item => !item.completed);
        if (uncompleted.length > 0) {
          return json(res, 400, {
            ok: false,
            error: `Cannot close project. ${uncompleted.length} handover item(s) remain incomplete: ${uncompleted.map(u => u.label).join(', ')}`
          });
        }

        // Mark checklist completed
        await supabaseFetch(`handover_checklists?id=eq.${checklist.id}`, {
          method: 'PATCH',
          body: {
            is_completed: true,
            completed_at: new Date().toISOString()
          }
        });
      }

      // Mark project completed
      await supabaseFetch(`projects?id=eq.${project_id}`, {
        method: 'PATCH',
        body: {
          status: 'completed',
          progress: 100,
          health: 'on_track'
        }
      });

      return json(res, 200, { ok: true, message: 'Handover verified and project marked completed.' });
    }

    return json(res, 400, { ok: false, error: `Unknown action: ${action}` });
  } catch (err) {
    return json(res, 500, { ok: false, error: err.message || 'Internal server error' });
  }
};
