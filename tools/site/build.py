#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""The Flow Labs site page generator (stdlib only).

Single source of truth for every sub-page's metadata, breadcrumbs, JSON-LD,
content and sitemap. Re-run after edits:  python tools/site/build.py
Emits every folder in PAGES plus sitemap.xml and robots.txt.
Style/JS live in assets/site.css and assets/site.js (shared with index.html).
"""
from __future__ import annotations
import io, os, json, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import blog  # noqa: E402  markdown blog pipeline (tools/site/blog.py)

BASE  = "https://www.theflowlabs.online"
OG_IMG = BASE + "/assets/work-droovee.png"
YEAR  = "2026-11-05"

# ------------------------------------------------------------------ helpers -
ORG = {
    "@context": "https://schema.org", "@type": "Organization",
    "name": "The Flow Labs", "url": BASE + "/",
    "logo": BASE + "/assets/icon-180.png",
    "email": "hello@theflowlabs.online", "image": OG_IMG,
    "description": "Founder-led engineering studio building interfaces, systems and applied intelligence for growing businesses. Fixed-price delivery, four builds a month, source code handed over on every project.",
    "address": {"@type": "PostalAddress", "addressLocality": "Bhubaneswar",
                "addressRegion": "Odisha", "addressCountry": "IN"},
    "founder": [{"@type": "Person", "name": "Smruti Ranjan", "jobTitle": "Founder"},
                {"@type": "Person", "name": "Biswash", "jobTitle": "Co-Founder"},
                {"@type": "Person", "name": "Arpita", "jobTitle": "Co-Founder"}],
    "areaServed": [{"@type": "City", "name": "Bhubaneswar"},
                   {"@type": "AdministrativeArea", "name": "Odisha"},
                   {"@type": "Country", "name": "India"}],
    "sameAs": ["https://www.instagram.com/the.flow.labs/"],
}

def org_min():
    return {"@context": "https://schema.org", "@type": "Organization",
            "name": ORG["name"], "url": ORG["url"], "email": ORG["email"], "image": OG_IMG}

def crumb_jsonld(items):
    els = []
    for i, (u, lbl) in enumerate(items):
        el = {"@type": "ListItem", "position": i + 1, "name": lbl}
        if u:
            el["item"] = BASE + u
        els.append(el)
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": els}

def hero(crumbs_items, pill, h1, sub, cms=None):
    c_items = ' <span aria-hidden="true">›</span> '.join(
        f'<a href="{u}">{lbl}</a>' if u else f'<span>{lbl}</span>'
        for u, lbl in crumbs_items)
    crumbs = f'<div class="crumbs">{c_items}</div>\n    '
    cms = cms or {}
    label_attr = f' data-cms="{cms["label"]}"' if cms.get("label") else ""
    title_attr = f' data-cms="{cms["title"]}"' if cms.get("title") else ""
    sub_attr = f' data-cms="{cms["sub"]}"' if cms.get("sub") else ""
    p = f'<span class="pill"><span class="dot"></span> <span{label_attr}>{pill}</span></span>\n    ' if pill else ""
    return (f'<div class="page-hero"><div class="wrap">\n    {crumbs}{p}'
            f'<h1{title_attr}>{h1}</h1>\n'
            f'    <p class="sub"{sub_attr}>{sub}</p>\n  </div>\n</div>')

def faq(qas):
    return ('<section class="page-faq"><div class="wrap">'
            '<div class="section-head reveal">'
            '<div class="eyebrow">FAQ</div>'
            '<h2>Frequently asked questions</h2>'
            '</div>'
            '<div class="faq reveal" style="margin-top:24px">'
            + ''.join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q, a in qas)
            + '</div></div></section>')

def cta(h2, p):
    return ('  <section id="contact" style="padding-top:60px"><div class="wrap">'
            '<div class="cta-box reveal">'
            f'<h2>{h2}</h2><p>{p}</p>'
            '<a href="/contact/" class="btn btn-primary">Start a project</a>'
            '<div class="cta-mail">or email <a href="mailto:hello@theflowlabs.online">hello@theflowlabs.online</a>'
            '&nbsp;·&nbsp; <a href="/lab-report/">run a free Lab Report</a>'
            '</div></div></div></section>')

def minis(items):
    return '<div class="mini-grid reveal">' + ''.join(
        f'<div class="mini"><h4>{h}</h4><p>{p}</p></div>' for h, p in items) + '</div>'

STEPS = [("Discovery", "A 30-minute scoping discussion to understand what your business needs, where the friction lies, and what success looks like."),
         ("Specification & Quote", "We define clear deliverables, milestones, and a fixed price upfront. No ambiguous estimates or creeping scope."),
         ("Iterative Build", "Development begins with structured milestones, live preview builds, and direct founder communication."),
         ("Production & Handover", "Deployment to production infrastructure, complete handover documentation, and post-launch support.")]

def steps():
    return '<div class="steps reveal">' + ''.join(
        f'<div class="step"><span class="num">0{i}</span><h3>{h}</h3><p>{p}</p></div>'
        for i, (h, p) in enumerate(STEPS, 1)) + '</div>'

def where_we_work():
    """Shared national + local signal appended to every service page."""
    return ('<section><div class="wrap"><div class="prose">'
            '<h2>Where we work</h2>'
            '<p>We build for businesses in <a href="/bhubaneswar/">Bhubaneswar and across Odisha</a>, '
            'work with clients throughout India, and run projects remotely with teams internationally. '
            'Distance does not change the process: a written scope, a fixed price before code, weekly demos '
            'on a real build, and the source code handed over at the end.</p>'
            '</div></div></section>')

CONTACT_JS = r"""
<script>
  document.getElementById('year').textContent = new Date().getFullYear();
</script>
<script>
(function () {
  const formView = document.getElementById('formView');
  const ideaForm = document.getElementById('ideaForm');
  const submitBtn = document.getElementById('submitBtn');
  const contactCard = document.querySelector('.contact-card');
  let successView = null;
  let projectType = '';

  const chipElements = document.querySelectorAll('#typeChips .chip-opt');
  chipElements.forEach(chip => {
    const pick = () => {
      chipElements.forEach(c => {
        c.classList.remove('sel'); c.setAttribute('aria-checked', 'false');
      });
      chip.classList.add('sel'); chip.setAttribute('aria-checked', 'true');
      projectType = chip.dataset.val;
      document.getElementById('errType').classList.remove('show');
    };
    chip.addEventListener('click', pick);
    chip.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });

  const validContact = (v) => {
    const s = v.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return true;
    return s.replace(/[^\d]/g, '').length >= 8;
  };
  /* Errors: visible class + aria-invalid on the control that owns them. */
  const showError = (id, show) => {
    const err = document.getElementById(id);
    if (!err) return;
    err.classList.toggle('show', show);
    const field = err.parentElement && err.parentElement.querySelector('input, textarea, select');
    if (field) field.setAttribute('aria-invalid', show ? 'true' : 'false');
  };
  ['fName', 'fIdea'].forEach(id => {
    document.getElementById(id).addEventListener('blur', (e) =>
      showError('err' + id.slice(1), !e.target.value.trim()));
  });
  document.getElementById('fContact').addEventListener('blur', (e) =>
    showError('errContact', !validContact(e.target.value)));

  const cfg = (typeof window !== 'undefined' && window.SITE_CONFIG) || {};
  const supabaseReady = !!(cfg && cfg.supabaseUrl && cfg.supabaseAnonKey &&
    !cfg.supabaseUrl.includes('YOURPROJECT') && !cfg.supabaseUrl.includes('yourproject'));
  const leadSrc = new URLSearchParams(location.search).get('src') || 'site';
  const note = document.getElementById('formNote');

  function mailtoLink(name, cont, type, idea, budget) {
    const body = `Name: ${name}\nContact: ${cont}\nProject Category: ${type}\nEstimated Budget: ${budget || '-'}\nSource: ${leadSrc}\n\nProject Requirements:\n${idea}`;
    return 'mailto:hello@theflowlabs.online?subject=' +
      encodeURIComponent('New project inquiry | The Flow Labs') +
      '&body=' + encodeURIComponent(body);
  }
  async function postLead(payload) {
    const url = cfg.supabaseUrl.replace(/\/+$/, '') + '/rest/v1/site_leads';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': cfg.supabaseAnonKey,
        'Authorization': 'Bearer ' + cfg.supabaseAnonKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    if (res.status !== 201 && res.status !== 200) throw new Error('supabase ' + res.status);
  }
  /* The confirmation panel is not in the initial DOM: it is cloned from a
     <template> on the first successful submit so crawlers and screen readers
     never encounter "Project details received" before a message is sent. */
  function closeSuccess() {
    if (!successView) return;
    successView.remove();
    successView = null;
    formView.hidden = false;
    const nameField = document.getElementById('fName');
    if (nameField) nameField.focus();
  }

  function showSuccess() {
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    if (!successView) {
      const tpl = document.getElementById('successTpl');
      if (tpl && contactCard) {
        contactCard.appendChild(tpl.content.cloneNode(true));
        successView = document.getElementById('successView');
        const closeBtn = document.getElementById('successClose');
        if (closeBtn) closeBtn.addEventListener('click', closeSuccess);
      }
    }
    formView.hidden = true;
    if (successView) successView.classList.add('show');
    ideaForm.reset();
    chipElements.forEach(c => {
      c.classList.remove('sel');
      c.setAttribute('aria-checked', 'false');
    });
    projectType = '';
    note.textContent = 'Direct reply within 48 hours. No spam, guaranteed.';
    const heading = document.getElementById('successHeading');
    if (heading) heading.focus();
  }

  ideaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameC = document.getElementById('fName');
    const contactC = document.getElementById('fContact');
    const ideaC = document.getElementById('fIdea');
    let ok = true;
    const check = (input, errId, valid) => { showError(errId, !valid); if (!valid) ok = false; };
    check(nameC, 'errName', nameC.value.trim().length > 0);
    check(contactC, 'errContact', validContact(contactC.value));
    check(ideaC, 'errIdea', ideaC.value.trim().length > 0);
    showError('errType', !projectType);
    if (!projectType) ok = false;
    if (!ok) {
      const first = document.querySelector('.err.show');
      if (first) {
        const inp = first.previousElementSibling;
        if (inp && inp.focus) inp.focus();
      }
      return;
    }
    if (document.getElementById('fCompany').value.trim()) { showSuccess(); return; } // honeypot

    submitBtn.disabled = true; submitBtn.classList.add('loading');
    const payload = {
      name: nameC.value.trim(), contact: contactC.value.trim(),
      project_type: projectType, idea: ideaC.value.trim(),
      budget: document.getElementById('fBudget').value || null,
      source: leadSrc, user_agent: (navigator.userAgent || '').slice(0, 250)
    };
    try {
      if (supabaseReady) {
        await postLead(payload);
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
        showSuccess();
      } else {
        const a = document.createElement('a');
        a.href = mailtoLink(payload.name, payload.contact, payload.project_type, payload.idea, payload.budget);
        a.click();
        showSuccess();
      }
    } catch (ex) {
      submitBtn.disabled = false; submitBtn.classList.remove('loading');
      note.innerHTML =
        'Direct submission unavailable. <a href="' +
        mailtoLink(payload.name, payload.contact, payload.project_type, payload.idea, payload.budget) +
        '" style="color:var(--accent-amber);">Click here to email us these exact details &rarr;</a>';
    }
  });
})();
</script>
"""

ENQUIRY_FORM = '''
<div class="contact-card reveal">
  <div id="formView">
    <div class="sec-head" style="margin-inline:auto;text-align:center;margin-bottom:32px;">
      <span class="eyebrow">Contact</span>
      <h2>Get in touch.</h2>
      <p>Tell us what you are looking to build. We will review your requirements and respond within 48 hours with scope, timeline, and fixed pricing.</p>
    </div>
    <form id="ideaForm" novalidate>
      <div class="field">
        <label for="fName">Your name <span aria-hidden="true">*</span></label>
        <input id="fName" name="name" type="text" placeholder="Full name or company name" autocomplete="name" required aria-describedby="errName" aria-invalid="false">
        <div class="err" id="errName" role="alert">Please enter your name.</div>
      </div>
      <div class="field">
        <label for="fContact">Email or phone number <span aria-hidden="true">*</span></label>
        <input id="fContact" name="contact" type="text" placeholder="name@company.com or +91..." autocomplete="email" required aria-describedby="errContact" aria-invalid="false">
        <div class="err" id="errContact" role="alert">Please enter a valid email address or phone number.</div>
      </div>
      <div class="field">
        <span class="field-label" id="typeLabel">Project category <span aria-hidden="true">*</span></span>
        <div class="chips-row" id="typeChips" role="radiogroup" aria-labelledby="typeLabel" aria-describedby="errType">
          <span class="chip-opt" data-val="Website" role="radio" aria-checked="false" tabindex="0">Website</span>
          <span class="chip-opt" data-val="AI tool" role="radio" aria-checked="false" tabindex="0">AI tool</span>
          <span class="chip-opt" data-val="Automation" role="radio" aria-checked="false" tabindex="0">Automation</span>
          <span class="chip-opt" data-val="Software" role="radio" aria-checked="false" tabindex="0">Software</span>
          <span class="chip-opt" data-val="Not sure yet" role="radio" aria-checked="false" tabindex="0">Other / Discuss</span>
        </div>
        <div class="err" id="errType" role="alert">Please select a project category.</div>
      </div>
      <div class="field">
        <label for="fIdea">Project requirements <span aria-hidden="true">*</span></label>
        <textarea id="fIdea" name="idea" placeholder="Describe what you want to build, the problems you are solving, or key features needed..." required aria-describedby="errIdea" aria-invalid="false"></textarea>
        <div class="err" id="errIdea" role="alert">Please describe your project or requirements.</div>
      </div>
      <div class="field">
        <label for="fBudget">Estimated budget (₹)</label>
        <select id="fBudget" name="budget">
          <option value="">To be discussed during scoping</option>
          <option value="under25k">Under ₹25,000</option>
          <option value="25k-1L">₹25,000 – ₹1,00,000</option>
          <option value="1L+">₹1,00,000+</option>
          <option value="discuss">Flexible / Phased implementation</option>
        </select>
      </div>
      <div class="field hp" aria-hidden="true">
        <label for="fCompany">Company</label>
        <input id="fCompany" name="company" type="text" tabindex="-1" autocomplete="off">
      </div>
      <div class="field" style="margin-top:24px;">
        <button type="submit" class="submit-btn" id="submitBtn">
          <span class="label">Send project details</span>
          <span class="spin" aria-hidden="true"></span>
        </button>
        <p class="form-note" id="formNote">Direct reply within 48 hours. No spam, guaranteed.</p>
        <p class="form-note">Submitting shares your details so we can reply with scope and pricing. See our <a href="/privacy-policy/">privacy policy</a>.</p>
      </div>
    </form>
  </div>
  <template id="successTpl">
    <div class="success" id="successView" role="status" aria-live="polite">
      <div class="check" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M4 12.5 9.5 18 20 6.5"/></svg>
      </div>
      <h3 id="successHeading" tabindex="-1">Project details received.</h3>
      <p>Thank you for reaching out. We will review your requirements and respond within 48 hours with next steps on scope, timeline, and pricing.</p>
      <button class="btn btn-primary" id="successClose" type="button" style="margin-top:22px;">Send another message</button>
    </div>
  </template>
</div>
'''

SLOT_METER = '''
<div class="slot-meter" data-slots data-month="2026-12" style="margin:0 auto 28px">
  <span class="slot-dot" aria-hidden="true"></span>
  <span class="slot-label">Build slots · <span data-slots-label>December</span></span>
  <span class="slot-count"><b data-slots-taken>2</b> of <span data-slots-total>4</span> taken</span>
  <span class="slot-bars" data-slots-bars aria-hidden="true"></span>
  <span class="slot-note">We take four builds a month. Two December seats are already reserved.</span>
</div>
'''

EMAIL_CARD = '''
<div class="contact-email-card">
  <div>
    <span class="label">Direct email</span>
    <span data-email data-user="hello" data-domain="theflowlabs.online">hello</span>
    <noscript><span>hello [at] theflowlabs [dot] online</span></noscript>
  </div>
  <button class="copy-mail" type="button" data-copy-email data-user="hello" data-domain="theflowlabs.online">Copy address</button>
</div>
'''

CONTACT_OTHER = '''
<section><div class="wrap">
  <div class="prose">
    <h2>Direct channels</h2>
    <p><strong>Email:</strong> <a href="mailto:hello@theflowlabs.online" data-cms="contact-email">hello@theflowlabs.online</a> — include a brief overview of your project and we will take it from there.</p>
    <p><strong>Instagram:</strong> <a href="https://www.instagram.com/the.flow.labs/" target="_blank" rel="noopener">@the.flow.labs</a> for quick questions.</p>
    <p><strong>Studio:</strong> The Flow Labs, Bhubaneswar, Odisha, India. We work remotely with teams across India and abroad, with in-person meetings when they genuinely help. <a href="/bhubaneswar/">More about the studio in Bhubaneswar</a>.</p>
    <p>Ordering a website, a system or an AI workflow? Tell us the problem, not the solution — we will tell you which of the three layers actually fixes it.</p>
  </div>
</div></section>
'''

# ==================================================================== PAGES ==

def services_hub():
    crumb = [("/", "Home"), (None, "Services")]
    h = (crumb, "Interfaces · Systems · Intelligence",
         'Engineering services, <span class="grad">built in-house.</span>',
         "Three layers, one team. Open a layer to see what is actually inside it, what it costs to start, and the problem it is meant to solve.")
    price = lambda p, note: (f'<div class="stack-price">{p}<small>SCOPED PER PROJECT</small></div>'
                             f'<p class="stack-meta" style="margin-top:0.9rem">{note}</p>')
    b = (
        '<section><div class="wrap">'
        '<div class="stack" style="margin-top:0">'

        '<div class="stack-item open">'
        '<button class="stack-head" type="button" aria-expanded="true" aria-controls="s-layer-1">'
        '<span class="stack-num">01</span><span class="stack-name">Interfaces</span>'
        '<span class="stack-promise">The screens your customers actually touch.</span>'
        '<span class="stack-plus" aria-hidden="true">+</span></button>'
        '<div class="stack-body" id="s-layer-1"><div><div class="stack-grid">'
        '<div><h5>Inside the layer</h5><ul>'
        '<li>Business websites and landing pages</li>'
        '<li>Web apps, portals and booking flows</li>'
        '<li>Design systems and component libraries</li>'
        '<li>Performance, SEO foundation and accessibility passes</li>'
        '<li>Maintenance and content updates</li></ul></div>'
        '<div><h5>Signs you need it</h5><ul>'
        '<li>The site is slow on a phone</li>'
        '<li>Visitors arrive but nobody enquires</li>'
        '<li>You need a portal, not a brochure</li>'
        '<li>Nobody on the team can update the site</li></ul></div>'
        '<div>' + price("Custom", "Typical build <b>2–4 weeks</b>. Fixed quote after one call.")
        + '<div class="stack-links"><a href="/services/web-development/">Full Interfaces page →</a></div></div>'
        '</div></div></div></div>'

        '<div class="stack-item">'
        '<button class="stack-head" type="button" aria-expanded="false" aria-controls="s-layer-2">'
        '<span class="stack-num">02</span><span class="stack-name">Systems</span>'
        '<span class="stack-promise">The engine under the interface.</span>'
        '<span class="stack-plus" aria-hidden="true">+</span></button>'
        '<div class="stack-body" id="s-layer-2"><div><div class="stack-grid">'
        '<div><h5>Inside the layer</h5><ul>'
        '<li>Internal tools and operations consoles</li>'
        '<li>Management dashboards and reporting</li>'
        '<li>APIs, integrations and data pipelines</li>'
        '<li>Role-based access and audit trails</li>'
        '<li>Migration off spreadsheets and legacy tools</li></ul></div>'
        '<div><h5>Signs you need it</h5><ul>'
        '<li>Off-the-shelf software fights your process</li>'
        '<li>Three tools hold the same customer record</li>'
        '<li>A weekly report takes a person a full day</li>'
        '<li>Only one person understands the spreadsheet</li></ul></div>'
        '<div>' + price("Custom", "Typical build <b>4–10 weeks</b>, shipped in phases.")
        + '<div class="stack-links"><a href="/services/custom-software-development/">Full Systems page →</a></div></div>'
        '</div></div></div></div>'

        '<div class="stack-item">'
        '<button class="stack-head" type="button" aria-expanded="false" aria-controls="s-layer-3">'
        '<span class="stack-num">03</span><span class="stack-name">Intelligence</span>'
        '<span class="stack-promise">The part that decides, drafts and routes.</span>'
        '<span class="stack-plus" aria-hidden="true">+</span></button>'
        '<div class="stack-body" id="s-layer-3"><div><div class="stack-grid">'
        '<div><h5>Inside the layer</h5><ul>'
        '<li>AI triage, drafting and routing</li>'
        '<li>Assistants grounded in your own documents</li>'
        '<li>Document and data extraction pipelines</li>'
        '<li>Workflow automation across your existing tools</li>'
        '<li>Evaluation, guardrails and cost ceilings</li></ul></div>'
        '<div><h5>Signs you need it</h5><ul>'
        '<li>The same questions get answered daily</li>'
        '<li>Staff copy data between systems</li>'
        '<li>Leads arrive on four channels and nobody owns them</li>'
        '<li>A chatbot made things up and burned your trust</li></ul></div>'
        '<div>' + price("Custom", "Typical build <b>2–6 weeks</b>. Priced per workflow, not per token.")
        + '<div class="stack-links"><a href="/services/ai-automation/">AI automation →</a>'
        '<a href="/services/ai-chatbot-development/">AI assistants →</a></div></div>'
        '</div></div></div></div>'

        '</div>'

        '<button class="compare-toggle" type="button" data-compare aria-expanded="false" aria-controls="compareTable">Compare the three layers <span aria-hidden="true">+</span></button>'
        '<div class="compare-table" id="compareTable"><table>'
        '<thead><tr><th>Question</th><th>Interfaces</th><th>Systems</th><th>Intelligence</th></tr></thead>'
        '<tbody>'
        '<tr><td>What it solves</td><td>How it looks and converts</td><td>How the business runs</td><td>What happens without a human</td></tr>'
        '<tr><td>Starting point</td><td>Custom quote</td><td>Custom quote</td><td>Custom quote</td></tr>'
        '<tr><td>Typical timeline</td><td>2–4 weeks</td><td>4–10 weeks</td><td>2–6 weeks</td></tr>'
        '<tr><td>Best first project</td><td>New site or portal</td><td>Ops tool, CRM, dashboard</td><td>One repetitive workflow</td></tr>'
        '<tr><td>Needs the other layers?</td><td>Not always</td><td>Usually needs an interface</td><td>Almost always needs both</td></tr>'
        '</tbody></table></div>'

        '<div class="chooser" data-chooser style="margin-top:40px">'
        '<p class="chooser-q">Not sure which layer you are actually asking for?</p>'
        '<div class="chooser-opts">'
        '<button type="button" data-layer="interfaces" data-answer="&lt;strong&gt;Start with Interfaces.&lt;/strong&gt; You need something people look at and trust. We scope the pages, write the structure, build it, and hand over a site you can edit.">We need a site or a portal</button>'
        '<button type="button" data-layer="systems" data-answer="&lt;strong&gt;Start with Systems.&lt;/strong&gt; Your process is the product. We map the workflow, replace the spreadsheets, and build the tool your team will actually use.">Our process is held together by spreadsheets</button>'
        '<button type="button" data-layer="intelligence" data-answer="&lt;strong&gt;Start with Intelligence.&lt;/strong&gt; Pick the one workflow that eats the most hours. We automate that, measure it, then expand — instead of rebuilding everything at once.">We answer the same things all day</button>'
        '</div>'
        '<div class="chooser-result" data-chooser-result role="status" aria-live="polite"></div>'
        '</div>'

        '<div class="prose reveal" style="margin-top:48px"><h2>How a project runs</h2></div>'
        + steps() +
        '<div class="prose" style="margin-top:34px">'
        '<h2>What every project includes</h2>'
        '<ul>'
        '<li>A written scope and a fixed price before any code starts.</li>'
        '<li>Weekly demos on a real, clickable build.</li>'
        '<li>Source code, deployment access and documentation handed over at the end.</li>'
        '<li>A post-launch support window for fixes and small refinements.</li>'
        '</ul>'
        '<h2>Four builds a month</h2>'
        '<p>That is the ceiling for a three-person team that does not subcontract. When the month is full we '
        'keep a waiting list instead of quietly spreading thin. Current availability is on the '
        '<a href="/contact/">contact page</a>.</p>'
        '</div></div></section>'
    )
    return dict(path="/services/",
                title="Services — Interfaces, Systems & Intelligence | The Flow Labs",
                og_title="Services: interfaces, systems & intelligence | The Flow Labs",
                description="Websites, custom software and AI automation from one founder-led team. Each project is quoted individually with a fixed price before code, and source is always handed over.",
                crumbs=crumb, hero=h, body=b,
                cms={"label": "services-hero-label", "title": "services-hero-title", "sub": "services-hero-subtitle"})

# Verified outcomes only. A card renders its outcome line only when a client-confirmed
# number exists here. Never add a metric that has not been verified: an honest gap
# beats a number nobody can defend in the sales call.
WORK_OUTCOMES = {
    # "/work/droovee/": "Example format: bookings confirmed without a dispatcher in the loop.",
}


def work_hub():
    crumb = [("/", "Home"), (None, "Work")]
    h = (crumb, None,
         "Built in the lab. <span class=\"grad\">Running in production.</span>",
         "Every project below is either live, running in-house, or open source. No invented metrics — the label on each card is one we can prove.")
    cards = ""
    for path, name, status, cat, desc, tag in [
        ("/work/droovee/", "Droovee", "LIVE", "web software",
         "An on-demand chauffeur booking platform: verified drivers, transparent fares, instant trip requests and a live operations view behind it.", "assets/work-droovee.png"),
        ("/work/qr-platform/", "QR Business Platform", "LIVE", "web software",
         "One stable QR code per business resolves to a fast, always-current mobile page. Centrally managed, tracked per scan. Passcode demo on this site.", "assets/work-qrplatform.svg"),
        ("/work/drishti/", "Drishti", "IN-HOUSE", "software ai",
         "Fleet operations console: live telemetry, demand forecasting and risk scoring for a state transport network.", "assets/work-drishti.png"),
        ("/work/flowops/", "FlowOps", "IN-HOUSE", "ai software",
         "An AI triage layer for support teams: classifies every ticket, drafts the reply, escalates what needs a human.", "assets/work-flowops.png"),
        ("/work/interview-copilot/", "Interview Copilot", "OPEN SOURCE", "ai oss",
         "An AI interview companion: prepare, rehearse and improve with real-time coaching and structured feedback.", "assets/work-interviewcopilot.svg"),
        ("/work/bhuverify/", "BHOOMI", "IN-HOUSE", "software oss",
         "BhumiStack, BHOOMI and Bhuverify: a land-intelligence stack for maps, verification and property workflows.", "assets/work-bhoomi.svg"),
        ("/work/carbon-coach/", "Carbon Coach", "OPEN SOURCE", "web oss",
         "An open-source TypeScript app that tracks and coaches personal carbon footprints.", "assets/work-carboncoach.svg"),
    ]:
        if tag.endswith(".png"):
            dims = ' width="1440" height="900"'
        else:
            dims = ''
        outcome = WORK_OUTCOMES.get(path)
        outcome_html = (f'<p class="woutcome"><span class="wlabel">Outcome</span>{outcome}</p>'
                        if outcome else '')
        cards += (f'<a class="work reveal" href="{path}" data-cat="{cat}">'
                  f'<div class="thumb"><img src="/{tag}" alt="{name} project by The Flow Labs"{dims} loading="lazy" decoding="async"></div>'
                  f'<div class="wbody"><div class="wtop"><h3>{name}</h3><span class="meta">{status}</span></div>'
                  f'<p>{desc}</p>{outcome_html}<div class="wlink">Case study <span aria-hidden="true">→</span></div></div></a>')
    b = ('<section><div class="wrap">'
         '<div class="work-filter" data-work-filter role="group" aria-label="Filter work">'
         '<button type="button" data-filter="all" aria-pressed="true">All</button>'
         '<button type="button" data-filter="web" aria-pressed="false">Interfaces</button>'
         '<button type="button" data-filter="software" aria-pressed="false">Systems</button>'
         '<button type="button" data-filter="ai" aria-pressed="false">Intelligence</button>'
         '<button type="button" data-filter="oss" aria-pressed="false">Open source</button>'
         '</div>'
         '<div class="work-grid" style="margin-top:24px">' + cards + '</div>'
         '<p class="work-note reveal">Every project on this page links to a case study we can point at. '
         'If it is not live, running in-house, or open source, it does not belong here.</p>'
         '</div></section>')
    return dict(path="/work/",
                title="Work — Live, In-House and Open Source | The Flow Labs",
                og_title="Work by The Flow Labs: interfaces, systems, intelligence",
                description="Live products and in-house systems built by The Flow Labs: a chauffeur booking platform, fleet operations AI, support triage, land intelligence and open-source apps.",
                crumbs=crumb, hero=h, body=b)

PAGES = []
PAGES.append(services_hub())
PAGES.append(work_hub())

def page_ai_automation():
    path = "/services/ai-automation/"
    crumb = [("/", "Home"), ("/services/", "Services"), (None, "AI automation")]
    h = (crumb, "Intelligence · AI automation",
         'AI automation that <span class="grad">actually ships.</span>',
         "We connect AI to the repetitive parts of your operation so your team stops being the integration layer. Scoped, built and shipped in-house with a fixed quote.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p>AI automation is not a robot in a suit. It is chat assistants, document processing, ticket triage, '
        'data handover and reporting that quietly do work your team currently does by hand. We build these as '
        'working systems: connected to your tools, running on schedule, logging what they did.</p>'
        '<h2>What this looks like for a business</h2>'
        '<ul>'
        '<li><strong>Customer support automation.</strong> Every incoming question is classified, answered when it is routine, and escalated to a human when it matters. Our own <a href="/work/flowops/">FlowOps console</a> does exactly this for support teams.</li>'
        '<li><strong>Document and data processing.</strong> Quotations, forms, invoices and enquiries arrive as chaos. We build pipelines that read them, extract what matters and file it where your team works.</li>'
        '<li><strong>Workflow automation.</strong> Handovers, follow-up reminders, lead routing and status reporting, compiled into one reliable pipeline instead of a dozen sticky notes.</li>'
        '<li><strong>AI integrations and assistants.</strong> A chat assistant trained on your website and business documentation, handling customer questions 24/7, wired into your site or internal tools.</li>'
        '</ul>'
        '<h2>Problems we hear all the time</h2>'
        '<ul>'
        '<li>The same ten questions eat your front desk hours every single day.</li>'
        '<li>Leads arrive on WhatsApp, Instagram and email, and no single person owns them.</li>'
        '<li>Someone retypes data between two tools that should simply talk to each other.</li>'
        '<li>Nobody can see today’s numbers without asking two departments.</li>'
        '</ul>'
        '<p>If any of that sounds familiar, that is exactly the territory this service covers.</p>'
        '<h2>Who builds it</h2>'
        '<p>No “our implementation team” appears later. The founders who scope your automation write it, '
        'demo it weekly and hand it over with documentation. See the proof in <a href="/work/">our lab</a>: '
        '<a href="/work/drishti/">Drishti</a> for operations intelligence and <a href="/work/bhuverify/">the BHOOMI stack</a> for document and data workflows.</p>'
        '<h2>How a project runs</h2>'
        '</div>' + steps() +
        '<div class="prose" style="margin-top:34px">'
        '<h2>What you receive</h2>'
        '<ul>'
        '<li>A scoped plan: workflows mapped, tools named, price fixed before code starts.</li>'
        '<li>The working automation, connected to your accounts and tested against your real data.</li>'
        '<li>Handover documentation plus a support window after launch for small fixes.</li>'
        '</ul>'
        '<h2>Tools we integrate with</h2>'
        '<p>WhatsApp Business, Google Workspace, Sheets, email, Meta channels, payment links, CRMs, '
        'internal databases and custom APIs. If your stack is unusual, we build the glue layer.</p>'
        '<h2>Where we work</h2>'
        '<p>We work remotely with teams across India and abroad, on weekly video demos and short written '
        'updates. If a project genuinely needs someone on site, we say so before signing anything, not after.</p>'
        '</div></div></section>'
        + faq([
            ("How much does AI automation cost?", "It depends on how many workflows you automate and which tools need connecting. A focused single-workflow build costs less than most websites; multi-system builds are scoped in phases. Either way the price is fixed before code starts."),
            ("Will AI automation replace my staff?", "No. It replaces the boring 60% of people’s day. Your front desk still handles the sensitive conversations; the automation handles the repeated ones."),
            ("What if my data is sensitive?", "We build on your accounts wherever possible, restrict what the AI can access, and keep no customer data in our own systems after handover."),
            ("Do you work remotely?", "Yes. We build for teams across India and abroad, remote-first with weekly video demos and short written updates. Time zone has not been a blocker yet."),
            ("How fast can something go live?", "A single-workflow automation typically ships in days, not months. Bigger builds are phased so you get value early."),
        ])
        + cta("Ready to automate repetitive operations?",
              "Tell us which workflows consume your team's time. We will scope an automated solution with clear milestones and fixed pricing."))
    return dict(path=path,
                title="AI Automation Agency for Growing Businesses | The Flow Labs",
                og_title="AI automation for growing businesses | The Flow Labs",
                description="AI workflow automation, agents, document processing and support triage for growing businesses. Founder-led studio, fixed quote before code, built in-house.",
                service={"name": "AI Automation & Workflow Integration", "serviceType": "AI automation consulting and implementation"},
                crumbs=crumb, hero=h, body=b)

def page_web_dev():
    path = "/services/web-development/"
    crumb = [("/", "Home"), ("/services/", "Services"), (None, "Web development")]
    h = (crumb, "Interfaces · Web development",
         'Websites and web apps that <span class="grad">earn their keep.</span>',
         "Fast, polished, phone-first interfaces that turn visitors into enquiries. Built and maintained in-house with a fixed quote.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p>Your website is the one employee that talks to every customer before you do. It should load fast, '
        'say clearly what you do, and make the next step obvious. That is what we build: clean, responsive '
        'sites and web apps for businesses, clinics, gyms, schools and startups.</p>'
        '<h2>What we build</h2>'
        '<ul>'
        '<li><strong>Business websites.</strong> A fast, credible, mobile-first site for your business with real booking or enquiry paths.</li>'
        '<li><strong>Startup and landing pages.</strong> One page, one job: explain the product and convert the visitor. We ship these in days.</li>'
        '<li><strong>Custom web applications.</strong> Booking flows, client portals, admin panels. See <a href="/work/droovee/">Droovee</a>, our live chauffeur booking platform.</li>'
        '<li><strong>Performance and maintenance.</strong> Speed fixes, bug fixes, content updates and post-launch support.</li>'
        '</ul>'
        '<h2>Why business websites here usually underperform</h2>'
        '<ul>'
        '<li>They are built once and never touched again, on hosting that breaks.</li>'
        '<li>They load on mobile like the designer never saw a phone.</li>'
        '<li>They never say the one thing customers actually want to know: what it costs, how to book, when you are open.</li>'
        '</ul>'
        '<p>We fix exactly those three things: real maintenance, phone-first design, and copy that answers '
        'what the customer is actually asking.</p>'
        '<h2>Stack and capabilities</h2>'
        '<p>Modern HTML/CSS/JS for sites with zero framework bloat, React and Node when the product calls '
        'for it, Supabase or Postgres for data, Vercel for hosting. Every build ships with sensible '
        'metadata, fast image loading and your enquiry form connected to a real backend.</p>'
        '<h2>How a project runs</h2>'
        '</div>' + steps() +
        '<div class="prose" style="margin-top:34px">'
        '<h2>What you receive</h2>'
        '<ul>'
        '<li>A responsive, fast website or web app, tested on real phones.</li>'
        '<li>Connected enquiry or booking flow (we route leads to your inbox or CRM).</li>'
        '<li>Handover with documentation, plus a support window for post-launch fixes.</li>'
        '</ul>'
        '<h2>Where we work</h2>'
        '<p>We build remotely for teams across India and abroad, and meet in person when a project genuinely '
        'calls for it. Related work: <a href="/work/droovee/">Droovee</a> (live booking '
        'platform) and <a href="/work/carbon-coach/">Carbon Coach</a> (open source web app).</p>'
        '</div></div></section>'
        + faq([
            ("What does a website cost?", "Every project is priced individually and quoted as a fixed, all-in number after discovery — before any code is written. There is no rate card, because no two builds are the same: pages, integrations and custom engineering all change the scope. You get an exact fixed quote after the first scoping call."),
            ("How long does it take to build a website?", "A focused business site or landing page typically ships in days. Larger web apps run in phases: first something you can point at, then the full build."),
            ("Will my website show up on Google?", "Being indexable and fast is the entry ticket, and every site we ship passes it (metadata, performance, mobile-first). Ranking takes longer and depends on your market. We set honest expectations instead of fake guarantees."),
            ("Do you maintain the site after launch?", "Yes. Handover includes documentation and a support window; ongoing maintenance is available and priced transparently."),
            ("Can you connect my enquiry form to WhatsApp/email/CRM?", "Yes. Form submissions can reach you by email alert, stored in a database you control, or routed onward. You pick the setup in scoping."),
        ])
        + cta("Ready for a high-performance website?",
              "Tell us what your website needs to achieve. We provide an upfront fixed quote and deliver with weekly progress previews."))
    return dict(path=path,
                title="Web Development for Growing Businesses | The Flow Labs",
                og_title="Web development, built in-house | The Flow Labs",
                description="Fast, responsive websites, landing pages and custom web apps. Phone-first, performance-focused, built and maintained in-house with a fixed quote.",
                service={"name": "Website & Web Application Development", "serviceType": "Web development"},
                crumbs=crumb, hero=h, body=b)

def page_custom_software():
    path = "/services/custom-software-development/"
    crumb = [("/", "Home"), ("/services/", "Services"), (None, "Custom software")]
    h = (crumb, "Systems · Custom software",
         'Software shaped around <span class="grad">how you actually work.</span>',
         "Internal tools, operations consoles and dashboards built around your process instead of a vendor's feature list. Fixed quote per phase, agreed before code.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p>Every business runs its real operations somewhere: a spreadsheet, three WhatsApp groups and one '
        'person’s memory. It works until it does not. We build the software that replaces that fragility: '
        'internal tools, dashboards, booking and management systems built around your process, not around '
        'some vendor’s feature checklist.</p>'
        '<h2>What we build</h2>'
        '<ul>'
        '<li><strong>Internal business tools.</strong> The app your team opens every morning: intake, tracking, job cards, attendance, whatever your process actually is.</li>'
        '<li><strong>Management dashboards.</strong> One screen that shows today’s revenue, pipeline or plant status without assembling it manually. See <a href="/work/drishti/">Drishti</a>, our operations intelligence console.</li>'
        '<li><strong>Property and verification workflows.</strong> See <a href="/work/bhuverify/">the BHOOMI stack</a>: maps, verification and property data systems.</li>'
        '<li><strong>APIs and backend services.</strong> The connecting tissue between tools you already pay for.</li>'
        '</ul>'
        '<h2>Custom vs ready-made, in one honest line</h2>'
        '<p>Buy ready-made when your process is standard. Go custom when your process is your advantage, or '
        'when you are paying five tools to half-do one job. We will tell you when NOT to build custom, '
        'and that honesty is part of the service.</p>'
        '<h2>Stack and capabilities</h2>'
        '<p>React/Node or Python backends, Postgres or Supabase for data, Vercel or cloud servers for '
        'deployment, and role-based access so the right people see the right things. We design the '
        'database first: data models outlive interfaces.</p>'
        '<h2>How a project runs</h2>'
        '</div>' + steps() +
        '<div class="prose" style="margin-top:34px">'
        '<h2>What you receive</h2>'
        '<ul>'
        '<li>A scoped system with a fixed price and phase plan.</li>'
        '<li>The working software, tested against your real process, deployed and monitored.</li>'
        '<li>Data migration from wherever it lives today (usually Excel).</li>'
        '<li>Handover documentation and a support window after go-live.</li>'
        '</ul>'
        '<h2>Where we work</h2>'
        '<p>We work remotely with teams across India and abroad. Related work: '
        '<a href="/work/flowops/">FlowOps</a> (AI workflow console) and '
        '<a href="/work/drishti/">Drishti</a> (fleet operations console), both built by the same founders who '
        'would build yours.</p>'
        '</div></div></section>'
        + faq([
            ("How much does custom software cost?", "It scales with what you are actually building, from focused internal tools to multi-phase products. Small tools sit in the same ballpark as a serious website. You get a fixed price per phase before code starts."),
            ("How long does custom software take?", "Focused tools ship in weeks. Larger systems are phased: first something you can click in weeks, then depth in later phases."),
            ("Can you work with our existing systems?", "Yes. Integrating with what you already run (Excel, Tally, CRMs, custom APIs) is usually the correct first move, not a rebuild from scratch."),
            ("What happens when we want changes after launch?", "Post-launch changes are normal. Handover includes documentation and a support window; changes after that are priced transparently, not by surprise."),
            ("Do we need our own servers?", "Usually no. We deploy on managed cloud (Vercel, Supabase, or a cloud server you own) and hand you full ownership of the code and data."),
        ])
        + cta("Describe the workflow challenge you want to solve.",
              "Schedule an introductory scoping call. If an off-the-shelf product is better suited to your needs, we will tell you directly."))
    return dict(path=path,
                title="Custom Software Development, Fixed Price | The Flow Labs",
                og_title="Custom software development | The Flow Labs",
                description="Custom business software: internal tools, operations dashboards, APIs and data pipelines. Built in-house, owner-managed, fixed quote per phase.",
                service={"name": "Custom Software Development", "serviceType": "Custom software development"},
                crumbs=crumb, hero=h, body=b)

def page_chatbots():
    path = "/services/ai-chatbot-development/"
    crumb = [("/", "Home"), ("/services/", "Services"), (None, "AI chatbot development")]
    h = (crumb, "AI chatbots · Trained on your business",
         'AI chatbot development for your business',
         "Intelligent assistants trained on your documentation and workflows: resolving customer inquiries 24/7 and escalating complex cases to your team.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p>A classic chatbot gives users a dropdown maze and five canned replies. An AI assistant, built on '
        'your actual content, answers the question the customer is really asking. We build the second kind '
        'and connect it where your customers already are.</p>'
        '<h2>AI chatbot vs traditional chatbot</h2>'
        '<table style="width:100%;border-collapse:collapse;color:var(--muted);font-size:.9rem;margin-bottom:20px">'
        '<tr style="text-align:left"><th style="padding:10px 8px;border-bottom:1px solid var(--line);color:var(--text)">Traditional (rule-based)</th><th style="padding:10px 8px;border-bottom:1px solid var(--line);color:var(--text)">AI assistant (what we build)</th></tr>'
        '<tr><td style="padding:9px 8px;border-bottom:1px solid var(--line)">Button menus, canned replies</td><td style="padding:9px 8px;border-bottom:1px solid var(--line)">Understands free text, from your docs</td></tr>'
        '<tr><td style="padding:9px 8px;border-bottom:1px solid var(--line)">Breaks on anything un-scripted</td><td style="padding:9px 8px;border-bottom:1px solid var(--line)">Answers variants of the same question</td></tr>'
        '<tr><td style="padding:9px 8px;border-bottom:1px solid var(--line)">One hour to go stale</td><td style="padding:9px 8px;border-bottom:1px solid var(--line)">Retrained as your content changes</td></tr>'
        '<tr><td style="padding:9px 8px;border-bottom:1px solid var(--line)">Answers only, no routing</td><td style="padding:9px 8px;border-bottom:1px solid var(--line)">Escalates to a human when it matters</td></tr>'
        '</table>'
        '<h2>What we build</h2>'
        '<ul>'
        '<li><strong>Website FAQ assistants.</strong> Trained on your site, docs, price lists and policies. Answers repeat questions around the clock.</li>'
        '<li><strong>Booking and enquiry assistants.</strong> Collect the lead without ever asking the customer to fill “another boring form”: name, service, time window, contact details.</li>'
        '<li><strong>Internal assistants.</strong> For your own team: find SOPs, check process steps, answer “how do we handle X” in one tap.</li>'
        '<li><strong>Multi-channel.</strong> Your website, plus wherever it makes sense of your customer journeys (Instagram, WhatsApp, web widget).</li>'
        '</ul>'
        '<h2>Honest limits</h2>'
        '<p>An AI assistant is only as good as its source content. If your information is wrong or stale, it '
        'will faithfully repeat nonsense. That is why every build includes a content-grounding step: we '
        'assemble the sources first, then wire the assistant. And sensitive cases always route to a human.</p>'
        '<h2>Related work</h2>'
        '<p><a href="/work/flowops/">FlowOps</a> classifies support tickets and drafts replies automatically. '
        '<a href="/work/interview-copilot/">INTERVIEW-COPILOT</a> is an open-source AI assistant that coaches '
        'candidates live. Same foundation, different jobs.</p>'
        '<h2>How a project runs</h2>'
        '</div>' + steps() +
        '<div class="prose" style="margin-top:34px">'
        '<h2>What you receive</h2>'
        '<ul>'
        '<li>An assistant trained on your real content, connected to your chosen channels.</li>'
        '<li>Escalation rules: which conversations reach a human, and how quickly.</li>'
        '<li>Some way to see what customers asked, so you learn what is unclear in your own business.</li>'
        '<li>Retraining support as your content evolves.</li>'
        '</ul>'
        '</div></div></section>'
        + faq([
            ("What is an AI chatbot and how is it different from a normal one?", "A normal chatbot shows predefined options and canned answers. An AI chatbot reads your own documents and past conversations, understands free-form questions, and answers in natural language, escalating to a human when the situation needs one."),
            ("How long does it take to build?", "A basic FAQ assistant can be live in days once your content is gathered. Multi-channel or booking assistants take longer, scoped in phases."),
            ("Will it hallucinate answers?", "Guarded against by design: it is grounded in your sources, says when it does not know, and sensitive questions are routed to a human instead of guessed at."),
            ("Does it work in English and Odia/Hindi?", "Yes, assistants handle multilingual questions. What matters is the quality of your source content, which we help you assemble."),
            ("How much does an AI chatbot cost?", "Depends on channels and the depth of your content. A focused assistant is a small project, priced fixed upfront like everything we do."),
        ])
        + cta("Provide your customers with 24/7 responsiveness.",
              "Tell us which questions your team answers repeatedly. We will build an AI assistant grounded in your verified business data."))
    return dict(path=path,
                title="AI Chatbot Development for Business | The Flow Labs",
                og_title="AI chatbot development for business | The Flow Labs",
                description="AI assistants trained on your business that answer customers at 3AM, capture enquiries and escalate sensitive cases. Built in-house, fixed price.",
                service={"name": "AI Chatbot & Assistant Development", "serviceType": "AI chatbot development and integration"},
                crumbs=crumb, hero=h, body=b)

# --------------------------------------------------------------- WORK pages -
def work_page(path, status, crumb_label, hero_parts, body):
    return dict(path=path, title=None, og_title=None, description=None,
                crumbs=crumb, hero=hero_parts, body=body)

def page_qr_platform():
    crumb = [("/", "Home"), ("/work/", "Work"), (None, "QR Business Platform")]
    h = (crumb, "LIVE PRODUCT · Managed QR pages",
         'QR Business Platform: one scan, one page, every business',
         "A centrally operated multi-business QR platform built by our founders. Each participating business gets a stable QR code and a fast, mobile-friendly digital page that customers reach by scanning. No business-owner dashboard, no customer accounts: our team runs it end to end.")
    b = (
        '<section><div class="wrap">'
        '<div class="prose">'
        '<p><strong>Status:</strong> live product. A passcode-protected demo runs right on this site at '
        '<a href="/qr">www.theflowlabs.online/qr</a> - ask us for the demo passcode and explore the real console. '
        'Demo data is synthetic and resets on boot.</p>'
        '<h2>What it is</h2>'
        '<p>Many small businesses have no usable web presence, or a slow one buried three clicks deep. '
        'The QR Business Platform gives each business one stable printed QR code that resolves to a '
        'lightning-fast mobile page: menu, services, photos, timings, contact and offers. When the content '
        'changes, the QR code does not, so printed materials never go stale.</p>'
        '<h2>The problem</h2>'
        '<ul>'
        '<li>Small businesses print menus and pamphlets that are outdated the week after printing.</li>'
        '<li>Building a real website is too expensive or too slow for many local businesses, so they stay unreachable online.</li>'
        '<li>Owners do not want another dashboard to maintain; they want someone to just keep it current.</li>'
        '</ul>'
        '<h2>How it works</h2>'
        '<p>Our internal team creates and maintains each business page in a central console: businesses, '
        'locations, content sections, media, leads and publish states. Customers scan the stable QR code, '
        'the platform resolves it to the right business page, and every scan, view, click and contact tap '
        'is tracked so the business learns what customers actually look at. Publishing is versioned with '
        'approval, rollback and an audit trail.</p>'
        '<h2>Stack</h2>'
        '<ul><li>Next.js 15 (App Router) with TypeScript</li>'
        '<li>SQLite via better-sqlite3, Postgres-portable schema, zod validation everywhere</li>'
        '<li>Server-side QR artwork generation (SVG/PNG) so codes are stable and printable</li>'
        '<li>Role-based staff auth, scan/view/click analytics, versioned publishing with audit</li>'
        '<li>Deployed on Vercel, served under this website at /qr</li></ul>'
        '<h2>What it proves about us</h2>'
        '<p>We ship complete products, not prototypes: multi-role auth, versioned content, analytics, '
        'an audit log and a verified end-to-end suite. The same engineering goes into a '
        '<a href="/services/custom-software-development/">custom platform</a> we build for you.</p>'
        '</div></div></section>'
        + faq([
            ("Can I see the platform live?", "Yes. The demo runs on this website at /qr and is passcode-protected. Ask us for the demo passcode; you get the real console with synthetic demo data."),
            ("Is this an off-the-shelf SaaS?", "It is our own managed product: we operate the console and keep each business page current. For businesses that want to self-manage, we scope a custom version instead."),
            ("Can you build something similar for my business?", "Yes - multi-location pages, menus, booking pages or private portals are a core service. Tell us the workflow and we scope it fixed-price."),
        ])
        + cta("Want one stable QR page that never goes stale?",
              "Whether it is a managed QR platform or your own custom portal, tell us how your customers find you. We build the system that keeps it current.")
    )
    return dict(path="/work/qr-platform/",
                title="QR Business Platform: Managed QR Pages Case Study | The Flow Labs",
                og_title="QR Business Platform by The Flow Labs",
                description="A multi-business QR platform built by The Flow Labs: one stable QR code per business, fast mobile pages, central management and per-scan analytics. Live demo on this site.",
                crumbs=crumb, hero=h, body=b)


def page_droovee():
    crumb = [("/", "Home"), ("/work/", "Work"), (None, "Droovee")]
    h = (crumb, "LIVE · Chauffeur booking",
         'Droovee: book a chauffeur, drive your own car',
         "A live chauffeur-booking platform built by our founders. On-demand professional drivers: verified profiles, transparent pricing and instant trip requests.")
    b = (
        '<section><div class="wrap">'
        '<div class="prose">'
        '<p><strong>Status:</strong> live product at <a href="https://droovee.vercel.app" target="_blank" rel="noopener">droovee.vercel.app</a>. '
        'Built in-house. [TODO-OWNER: add current launch stage, city coverage, and any real usage numbers you want to make public.]</p>'
        '<h2>What it is</h2>'
        '<p>Droovee lets people book a professional chauffeur to drive them in their own car. Standalone '
        'drivers for a night out, a long trip, or when the boss in you wants to sleep in the back seat. '
        'It was born from a very simple question: why has nobody made this easy yet?</p>'
        '<h2>The problem</h2>'
        '<ul>'
        '<li>Getting a professional driver for your OWN car is a phone-book process in most Indian cities.</li>'
        '<li>Bookings happen over calls, papers and trust-your-uncle networks. Zero reliability, zero records.</li>'
        '<li>Drivers are a safety decision, so users want verified profiles and visible pricing.</li>'
        '</ul>'
        '<h2>How we built it</h2>'
        '<p>Droovee is a full web application: driver profiles with verification states, trip requests with '
        'instant matching, transparent fare display before confirm, and a booking flow that a first-time '
        'user completes without hand-holding. Payments and communication rails are wired into the flow.</p>'
        '<h2>Stack</h2>'
        '<ul><li>Web app: React-based front end, Node/JS services</li>'
        '<li>Booking engine with driver matching states</li>'
        '<li>Payments and pricing display</li>'
        '<li>Deployed on Vercel (droovee.vercel.app)</li></ul>'
        '<h2>What it proves about us</h2>'
        '<p>We do not just mock up nice screens. We ship real products with real booking flows, real users '
        'and real edge cases. That is the same muscle you get when you hire us for a '
        '<a href="/services/web-development/">web application</a> or a '
        '<a href="/services/ai-automation/">workflow platform</a>.</p>'
        '</div></div></section>'
        + faq([
            ("Is Droovee a client project of The Flow Labs?", "No. Droovee is a product built and run by the founders themselves. It is our lab, and a public demonstration of how we build."),
            ("Can I see it live?", "Yes, at droovee.vercel.app."),
            ("Will you build something similar for my business?", "Yes, booking platforms and marketplace-style web apps are a core service. See our web development service page or just tell us the idea."),
        ])
        + cta("Have an idea for a booking platform or marketplace?",
              "If you are planning an on-demand booking platform or multi-sided application, let us know. We build complete, production-ready web products.")
    )
    return dict(path="/work/droovee/",
                title="Droovee Case Study: Chauffeur Booking Platform | The Flow Labs",
                og_title="Droovee: chauffeur booking platform built by The Flow Labs",
                description="Droovee is a live chauffeur-booking platform built by The Flow Labs founders. Verified drivers, transparent pricing, instant trip requests.",
                crumbs=crumb, hero=h, body=b)

def page_drishti():
    crumb = [("/", "Home"), ("/work/", "Work"), (None, "Drishti")]
    h = (crumb, "OPERATIONS AI · Built in-house",
         'Drishti: fleet operations intelligence',
         "An operations console for state transport fleet management: live telemetry, demand forecasting, and risk scoring in one unified interface.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p><strong>Status:</strong> built in-house, production system. [TODO-OWNER: confirm whether this deployment can be publicly named and what usage metrics may be shared.]</p>'
        '<h2>What it is</h2>'
        '<p>Drishti (which literally means “eyes”) is a fleet-operations intelligence console. It pulls live '
        'telemetry, forecasts demand and flags operational risk for a state transport corporation, so the '
        'morning meeting starts from one dashboard instead of five phone calls.</p>'
        '<h2>The problem</h2>'
        '<ul>'
        '<li>Fleet data lived in separate silos: GPS, depot reports, paper registers and one overloaded Excel.</li>'
        '<li>Nobody could see the whole network in real time.</li>'
        '<li>Forecasting demand was a person’s best guess, made every night.</li>'
        '</ul>'
        '<h2>How we approached it</h2>'
        '<p>We designed around the operator, not the data. The screen answers three questions in order: '
        'what is happening now, what will happen next, what needs a decision today. Live telemetry feeds '
        'the now. A demand forecasting layer feeds the next. Risk scoring surfaces the third, quietly.</p>'
        '<h2>Stack</h2>'
        '<ul><li>Operational dashboard UI (real-time data views)</li>'
        '<li>Forecasting layer for demand prediction</li>'
        '<li>Risk scoring module</li>'
        '<li>Python data stack behind the console</li></ul>'
        '<h2>What it proves about us</h2>'
        '<p>Operations AI is not just chatbots. We build the serious side too: data pipelines, forecasting '
        'and dashboards for real operations. If your business has logistics, assets or field teams, start '
        'at our <a href="/services/ai-automation/">AI automation service</a> or the '
        '<a href="/services/custom-software-development/">custom software page</a>.</p>'
        '</div></div></section>'
        + cta("Managing complex operations across disconnected systems?",
              "Tell us about your current operational workflow. We will scope a centralized console tailored to your real-world requirements."))
    return dict(path="/work/drishti/",
                title="Drishti: Fleet Operations Intelligence Console | The Flow Labs",
                og_title="Drishti: fleet operations AI by The Flow Labs",
                description="Drishti is a fleet operations intelligence console built in-house by The Flow Labs: live telemetry, demand forecasting and risk scoring for transport operations.",
                crumbs=crumb, hero=h, body=b)

def page_flowops():
    crumb = [("/", "Home"), ("/work/", "Work"), (None, "FlowOps")]
    h = (crumb, "AUTOMATION · Built in-house",
         'FlowOps: AI triage for support teams',
         "An AI layer that classifies every incoming support ticket, drafts the reply and escalates only what truly needs a human.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p><strong>Status:</strong> built in-house, production system. [TODO-OWNER: add any publicly shareable usage or volume figures.]</p>'
        '<h2>What it is</h2>'
        '<p>FlowOps sits in front of a support team. Every ticket that arrives is classified by intent and '
        'urgency, a reply draft is generated for the routine ones, and sensitive or complex cases get '
        'routed to a human with context already attached.</p>'
        '<h2>The problem</h2>'
        '<ul>'
        '<li>Support agents spend hours on the same five questions, every day.</li>'
        '<li>Urgent cases hide in queues shaped like first-name-alphabetical order.</li>'
        '<li>Nobody knows what customers are actually complaining about, this week, versus last.</li>'
        '</ul>'
        '<h2>Approach</h2>'
        '<ul>'
        '<li><strong>Classification.</strong> Intent, urgency and language detected per ticket.</li>'
        '<li><strong>Drafting.</strong> Routine replies drafted for quick human approval.</li>'
        '<li><strong>Escalation.</strong> Sensitive cases escalate with a summary, so the agent starts warm.</li>'
        '<li><strong>Insight.</strong> Ticket trends surfaced weekly: what is spiking, what is new.</li>'
        '</ul>'
        '<h2>Stack</h2>'
        '<ul><li>AI classification and drafting pipeline</li>'
        '<li>Integration layer for existing support channels</li>'
        '<li>Ops console UI</li></ul>'
        '<h2>What it proves about us</h2>'
        '<p>This is the exact architecture behind our '
        '<a href="/services/ai-automation/">AI automation</a> and '
        '<a href="/services/ai-chatbot-development/">AI chatbot</a> services: classify, draft, escalate. '
        'Built entirely in-house by our engineering team, with full accountability and zero third-party subcontracting.</p>'
        '</div></div></section>'
        + cta("Interested in intelligent support triage?",
              "Tell us how customer support inquiries reach your team. We will scope an AI triage pipeline tailored to your workflow."))
    return dict(path="/work/flowops/",
                title="FlowOps: AI Support Ticket Triage Console | The Flow Labs",
                og_title="FlowOps: AI ticket triage built by The Flow Labs",
                description="FlowOps is an AI triage layer for support teams built in-house by The Flow Labs: classifies tickets, drafts replies, escalates what needs a human.",
                crumbs=crumb, hero=h, body=b)

def page_interview_copilot():
    crumb = [("/", "Home"), ("/work/", "Work"), (None, "INTERVIEW-COPILOT")]
    h = (crumb, "OPEN SOURCE · AI copilot",
         'INTERVIEW-COPILOT: prepare like the real thing',
         "An open-source AI interview companion that helps candidates prepare, rehearse and improve with real-time coaching and structured feedback.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p><strong>Status:</strong> open source, actively built by our founders. [TODO-OWNER: add the GitHub repo link when you want it public.]</p>'
        '<h2>What it is</h2>'
        '<p>Interview prep today is solved by reading blogs and praying. INTERVIEW-COPILOT makes you talk: '
        'it runs a live, AI-led interview session, listens while you answer, and coaches you right after, '
        'with structure: what worked, what rambled, what to sharpen.</p>'
        '<h2>Why we built it</h2>'
        '<p>Because our founders sat on both sides of the table. Candidates prepare content, not delivery. '
        'One practice partner, available at midnight, that is honest in a way friends will not be, that '
        'prep is priceless.</p>'
        '<h2>Features</h2>'
        '<ul>'
        '<li>Role-based interview sessions (technical, behavioural, domain)</li>'
        '<li>Real-time question flow with follow-ups, like a real interviewer</li>'
        '<li>Structured post-session feedback: clarity, structure, confidence</li>'
        '<li>Improvement tracking across sessions</li>'
        '</ul>'
        '<h2>Stack</h2>'
        '<ul><li>Python AI pipeline with speech and LLM layers</li>'
        '<li>Session and feedback data models</li>'
        '<li>Coach UI for interview flow</li></ul>'
        '<h2>What it proves about us</h2>'
        '<p>AI assistants are more than FAQ bots: they can listen, guide and coach. That same technology '
        'backs our <a href="/services/ai-chatbot-development/">AI chatbot development</a> service, just '
        'pointed at your business instead of interviews.</p>'
        '</div></div></section>'
        + cta("Building an AI assistant or copilot?",
              "Tell us what your copilot needs to accomplish. We build conversational and voice-enabled AI systems grounded in verified workflows.")
    )
    return dict(path="/work/interview-copilot/",
                title="INTERVIEW-COPILOT: Open-Source AI Interview Assistant | The Flow Labs",
                og_title="INTERVIEW-COPILOT: AI interview assistant by The Flow Labs",
                description="INTERVIEW-COPILOT is an open-source AI interview companion by The Flow Labs: live mock interviews, real-time coaching and structured feedback.",
                crumbs=crumb, hero=h, body=b)

def page_bhuverify():
    crumb = [("/", "Home"), ("/work/", "Work"), (None, "BHOOMI Series")]
    h = (crumb, "GEO + DATA · Built in-house",
         'BHOOMI: land intelligence, from map to yes-or-no',
         "A land-intelligence stack built in-house: BhumiStack, BHOOMI and Bhuverify. Maps, verification and property-data workflows in one system.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p><strong>Status:</strong> built in-house. Covers the BhumiStack, BHOOMI and Bhuverify projects. '
        '[TODO-OWNER: add which parts of the stack are public, in use, or open source.]</p>'
        '<h2>What it is</h2>'
        '<p>Bhumi means land, and land is where paperwork, trust and money constantly collide. The BHOOMI '
        'series is our land-intelligence stack: three connected pieces for maps, verification and '
        'property-data workflows.</p>'
        '<h2>How the pieces fit</h2>'
        '<ul>'
        '<li><strong>BhumiStack.</strong> The platform layer: property records, geo layers, verification status in one data model.</li>'
        '<li><strong>BHOOMI.</strong> The intelligence layer: map-driven views, records and flags for checking a property.</li>'
        '<li><strong>Bhuverify.</strong> The workflow layer: step-by-step verification journeys for buyers, agents and analysts.</li>'
        '</ul>'
        '<h2>The problem</h2>'
        '<ul>'
        '<li>Property verification in India is a WhatsApp-forward, hearsay and lucky-visit process.</li>'
        '<li>Data exists, scattered across government portals, but nobody assembles it into a usable picture.</li>'
        '<li>Buyers, brokers and analysts all make slower, riskier decisions for it.</li>'
        '</ul>'
        '<h2>Approach</h2>'
        '<p>We built this as data engineering first: models for parcels, owners, documents and flags. Map '
        'visualisations and checks sit on top, and a workflow layer turns it into an actual process '
        'people can follow step by step.</p>'
        '<h2>Stack</h2>'
        '<ul><li>Python data stack, geo processing</li>'
        '<li>Data platform design (BhumiStack)</li>'
        '<li>Map and verification UIs</li></ul>'
        '<h2>What it proves about us</h2>'
        '<p>We handle serious data engineering: records, geo, verification, workflows. If your business has '
        'data that is scattered and slow, start at the '
        '<a href="/services/custom-software-development/">custom software</a> service page.</p>'
        '</div></div></section>'
        + cta("Navigating complex records or geospatial data?",
              "Tell us what your data looks like today. We will scope a structured pipeline to accelerate analysis and decision-making."))
    return dict(path="/work/bhuverify/",
                title="BHOOMI: Land Intelligence Stack (BhumiStack, Bhuverify) | The Flow Labs",
                og_title="BHOOMI land intelligence stack by The Flow Labs",
                description="BHOOMI is a land-intelligence stack built in-house by The Flow Labs: BhumiStack data platform, map views and Bhuverify's step-by-step verification workflows.",
                crumbs=crumb, hero=h, body=b)

def page_carbon_coach():
    crumb = [("/", "Home"), ("/work/", "Work"), (None, "Carbon Coach")]
    h = (crumb, "OPEN SOURCE · Sustainability",
         'Carbon Coach: habits, tracked honestly',
         "An open-source TypeScript app that tracks personal carbon footprints, shows live metrics and nudges weekly progress in a guilt-free tone.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p><strong>Status:</strong> open source, built by our founders. [TODO-OWNER: add the GitHub repo link when you want it public.]</p>'
        '<h2>What it is</h2>'
        '<p>Most carbon apps guilt-trip you into closing them. Carbon Coach does the opposite: it tracks '
        'your footprint in a clean dashboard, shows genuinely alive metrics, and nudges you again next week '
        'with improvements, not lectures.</p>'
        '<h2>Features</h2>'
        '<ul>'
        '<li>Daily footprint tracking across key habits</li>'
        '<li>Live metrics dashboard, no spreadsheet vibes</li>'
        '<li>Weekly progress nudges, framed as encouragement</li>'
        '<li>Progress history, so improvement becomes visible</li>'
        '</ul>'
        '<h2>Why we built it</h2>'
        '<p>Two reasons. First, sustainability tools in India feel imported and detached from local daily '
        'life. Second, it is a compact product that lets us practice the entire loop: fast front end, real '
        'data, and clean feedback UX, without enterprise paperwork.</p>'
        '<h2>Stack</h2>'
        '<ul><li>TypeScript app, component-driven UI</li>'
        '<li>Metric engine with weekly aggregation</li>'
        '<li>Analytics and progress visualisations</li></ul>'
        '<h2>What it proves about us</h2>'
        '<p>Front-end craft and live data handling. The same coding standards go into every '
        '<a href="/services/web-development/">website and web app</a> we build for a business.</p>'
        '</div></div></section>'
        + cta("Need a modern, data-driven web application?",
              "Tell us about your product concept. We deliver responsive, high-performance web applications with fixed pricing and clear timelines."))
    return dict(path="/work/carbon-coach/",
                title="Carbon Coach: Open-Source Footprint Tracker | The Flow Labs",
                og_title="Carbon Coach: sustainability app by The Flow Labs",
                description="Carbon Coach is an open-source TypeScript app by The Flow Labs: personal carbon footprint tracking, live metrics and weekly progress nudges.",
                crumbs=crumb, hero=h, body=b)

def page_about():
    crumb = [("/", "Home"), (None, "About")]
    h = (crumb, "Founder-led · In-house",
         'Founder-led engineering. <span class="grad">Built in-house.</span>',
         "The Flow Labs is a three-person engineering studio. We design, build and ship interfaces, systems and applied intelligence — and you work with the people writing the code.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p data-cms="about-body-1">The Flow Labs was founded on a straightforward principle: businesses deserve direct access to the engineers '
        'building their software. Instead of working through sales representatives and outsourced development teams, '
        'our clients collaborate directly with the founders who design and write the code. Droovee, our live chauffeur '
        'booking platform, is a product of this hands-on engineering approach.</p>'
        '<h2>Who you actually work with</h2>'
        '<ul>'
        '<li><strong>Smruti Ranjan — Founder.</strong> Architects the systems and AI infrastructure behind every project, and leads scoping on every build.</li>'
        '<li><strong>Biswash — Co-Founder.</strong> Builds the platforms, APIs and backend infrastructure that have to hold up under real load.</li>'
        '<li><strong>Arpita — Co-Founder.</strong> Shapes the interfaces, user experience and visual identity across every product we ship.</li>'
        '</ul>'
        '<p>Three people, no account layer. Every project is handled by the same three, which is exactly why we cap '
        'the month at four builds.</p>'
        '<h2>How we work</h2>'
        '<ul>'
        '<li><strong>You talk to the people building it.</strong> No account managers, no handoffs, no “our developer will get back to you”.</li>'
        '<li><strong>Fixed price before code.</strong> Scope, timeline and price agreed first. No surprise invoices mid-project.</li>'
        '<li><strong>Weekly demos.</strong> You watch the product grow in real, clickable versions, not slide decks.</li>'
        '<li><strong>We ship in-house.</strong> Interfaces, systems and AI are built by us. If a task does not fit our skills, we say so instead of subcontracting quietly.</li>'
        '</ul>'
        '<h2>Where we are</h2>'
        '<p data-cms="about-body-2">We work remotely with teams across India and abroad, and meet in person when a project genuinely '
        'calls for it. Our studio address is on the <a href="/contact/">contact page</a>.</p>'
        '<h2>What we will NOT do</h2>'
        '<ul>'
        '<li>Promise rankings and overnight SEO miracles. We set honest expectations instead.</li>'
        '<li>Take a project we are not the right team for. You will get a straight answer in the first call, possibly with a referral.</li>'
        '<li>Inflate our history. What you see in <a href="/work/">our lab</a> is our actual work, labelled honestly by status (live, in-house, open source).</li>'
        '</ul>'
        '<h2>Our approach</h2>'
        '<p data-cms="about-body-3">We believe in transparency, rapid execution and technical craft. We agree on fixed pricing before '
        'code starts, demonstrate progress through weekly interactive builds, and deliver maintainable software that '
        'solves real operational problems.</p>'
        '</div></div></section>'
        + faq([
            ("Who are the founders?", "Smruti Ranjan (Founder), Biswash (Co-Founder) and Arpita (Co-Founder). Three people, no account layer — you work with the same three from first call to handover."),
            ("Is The Flow Labs an agency?", "We are a studio, not an agency: the founders do the work personally, with fixed-price projects and no outsourced middle layer."),
            ("How many projects do you take on?", "Four a month, and no more. That is the honest ceiling for a team that does not subcontract. Current availability is on the contact page."),
        ])
        + cta("Speak directly with the engineering team",
              "The most effective way to start is a scoping conversation. Bring your requirements, and we will provide an honest assessment of scope, timeline, and pricing.")
    )
    return dict(path="/about/",
                title="About — A Three-Person Engineering Studio | The Flow Labs",
                og_title="About The Flow Labs: founder-led engineering",
                description="Meet The Flow Labs: Smruti Ranjan (Founder), Biswash and Arpita (Co-Founders). A three-person studio building interfaces, systems and AI in-house.",
                crumbs=crumb, hero=h, body=b,
                cms={"label": "about-hero-label", "title": "about-hero-title", "sub": "about-hero-subtitle"})

def page_lab_report():
    crumb = [("/", "Home"), (None, "Lab Report")]
    h = (crumb, "Free · No signup · ~10 seconds",
         'The Lab Report: <span class="grad">your site, scored.</span>',
         "Paste any URL and get a plain-English read on speed, accessibility and search readiness. One score, three bars, the three things worth fixing first.")
    b = (
        '<section><div class="wrap">'
        '<div class="lab-form-wrap">'
        '<form class="lab-form" id="labForm" novalidate>'
        '<label for="labUrl" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Website URL</label>'
        '<input id="labUrl" name="url" type="url" inputmode="url" placeholder="yourbusiness.com" autocomplete="url" required>'
        '<button class="btn btn-primary" type="submit">Run the report</button>'
        '</form>'
        '<p class="lab-note">Public data only. We store nothing except the score, cached for 24 hours.</p>'
        '<p class="report-err" id="labError" hidden></p>'
        '<div class="report" id="labReport" aria-live="polite"></div>'
        '</div>'
        '<div class="prose" style="margin-top:48px">'
        '<h2>Why we give this away</h2>'
        '<p>Because most businesses have never actually seen their own site measured. They know it feels slow, '
        'or that enquiries are thin, but nobody has shown them a number. The Lab Report shows the number in ten '
        'seconds, with no form, no email gate and no call booked on the back of it.</p>'
        '<p>If the score is bad and you want it fixed, we do that for a living. If the score is good, you just '
        'learned something free. Either outcome is fine by us.</p>'
        '<h2>What it measures</h2>'
        '<ul>'
        '<li><strong>Performance.</strong> How fast the page actually renders on a mid-range phone, not on a developer laptop.</li>'
        '<li><strong>Accessibility.</strong> Whether the page can be read and used by people with screen readers, low vision or slow connections.</li>'
        '<li><strong>Best practices and SEO.</strong> The fundamentals that decide whether search engines can read and trust the page.</li>'
        '</ul>'
        '<h2>What it does not do</h2>'
        '<ul>'
        '<li>It does not sign you up to anything. There is no email field, because there is nothing to send you.</li>'
        '<li>It does not publish your result. Scans are visible only to the person who ran them.</li>'
        '<li>It does not replace a real audit. It is a fast, honest first look, not a 40-page PDF.</li>'
        '</ul>'
        '<h2>Powered by</h2>'
        '<p>Google PageSpeed Insights, running on free-tier infrastructure. That is why results are cached for '
        '24 hours and rate-limited — if the scanner is busy, try again in a minute.</p>'
        '</div></div></section>'
        + cta("Want the fixes, not just the score?",
              "Send us the URL you just scanned. We will tell you which three changes would move the number most, and what they cost.")
    )
    return dict(path="/lab-report/",
                title="Free Website Lab Report — Speed, Accessibility & SEO | The Flow Labs",
                og_title="Free website Lab Report | The Flow Labs",
                description="Scan any URL and get a plain-English score for speed, accessibility and search readiness. Free, no signup, no email gate, results cached for 24 hours.",
                crumbs=crumb, hero=h, body=b)

def page_contact():
    crumb = [("/", "Home"), (None, "Contact")]
    h = (crumb, "Direct response within 48 hours",
         'Start a project with The Flow Labs',
         "Submit your requirements, send an email, or message us directly. We will review your project and reply within 48 hours with scope, timeline, and pricing.")
    b = (
        '<section id="enquiry" style="padding-top:20px"><div class="wrap">'
        + SLOT_METER + EMAIL_CARD + ENQUIRY_FORM +
        '</div></section>'
        + CONTACT_OTHER
        + cta("Want to explore our work first?",
              "Review our selected <a href='/work/'>case studies</a> and our <a href='/services/'>services overview</a>. We look forward to hearing about your project.")
    )
    return dict(path="/contact/",
                title="Contact — Start a Project | The Flow Labs",
                og_title="Start a project | The Flow Labs",
                description="Tell The Flow Labs what you are building: a website, a system or an AI workflow. Two December build slots open, honest 48-hour reply from the founders.",
                crumbs=crumb, hero=h, body=b,
                footer_note=CONTACT_JS,
                cms={"label": "contact-hero-label", "title": "contact-hero-title", "sub": "contact-hero-subtitle"})

def page_privacy():
    crumb = [("/", "Home"), (None, "Privacy Policy")]
    h = (crumb, "Written in human, not legalese",
         'Privacy policy',
         "What we collect when you enquire, why, how long we keep it and how to make us forget you.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p>Last updated: ' + YEAR + '. This applies to www.theflowlabs.online and every enquiry or Lab Report '
        'you send us from it.</p>'
        '<h2>What we collect</h2>'
        '<ul>'
        '<li><strong>What you type into our forms:</strong> your name, email or phone, project type, project description and budget range.</li>'
        '<li><strong>Technical metadata, automatically:</strong> your browser’s user-agent string and the page source tag (for understanding where enquirers came from).</li>'
        '<li><strong>Anonymous page views:</strong> we count visits to understand which pages are useful. This is cookie-less: no cookies, no localStorage, no fingerprinting, no IP address stored, and no personal data attached.</li>'
        '</ul>'
        '<p>We do not run advertising trackers, third-party analytics, or analytics cookies.</p>'
        '<h2>The Lab Report</h2>'
        '<p>The Lab Report is a free public-URL scanner. It fetches the page you paste and scores it with Google '
        'PageSpeed Insights, then shows you the result. We store the URL you scanned and the returned scores for '
        '24 hours so repeat scans are fast and so we do not hammer the free API. We do not store your IP address '
        'beyond the five-minute rate limit check, and we never attach a scan to an enquiry unless you send one. '
        'Nothing about your site is published.</p>'
        '<h2>Analytics in plain language</h2>'
        '<p>Each page view creates one anonymous row: the path, the referring site’s domain, a coarse device category (mobile, tablet, desktop) and a timestamp. '
        'We cannot identify you from it, and it is never linked to an enquiry you submit. If your browser sends Do Not Track, we skip the count entirely.</p>'
        '<h2>Why we collect it</h2>'
        '<ul>'
        '<li>To reply to your enquiry with scope, timeline and pricing.</li>'
        '<li>To understand which of our services attract interest, in aggregate.</li>'
        '</ul>'
        '<h2>Where it lives and who sees it</h2>'
        '<p>Submissions are stored in a Supabase database controlled by us, and a copy of each new enquiry '
        'reaches our own inbox by email. It is read by The Flow Labs founders only. We do not sell your '
        'data, share it with marketers, or subscribe you to anything.</p>'
        '<h2>How long we keep it</h2>'
        '<p>Active enquiries are kept while the project conversation is alive. If you tell us (or a '
        'reasonable period passes without contact), we delete the enquiry record.</p>'
        '<h2>Your choices</h2>'
        '<ul>'
        '<li>Ask us anything about your data: <a href="mailto:hello@theflowlabs.online">hello@theflowlabs.online</a>.</li>'
        '<li>Ask us to delete your enquiry and we will do it, no interrogation.</li>'
        '<li>Send enquiries without the form: just email or DM us directly.</li>'
        '</ul>'
        '<h2>Changes</h2>'
        '<p>If this policy changes, the updated date at the top changes. That is all the ceremony you '
        'get, because that is all the ceremony exists.</p>'
        '</div></div></section>'
    )
    return dict(path="/privacy-policy/",
                title="Privacy Policy | The Flow Labs",
                og_title="Privacy policy | The Flow Labs",
                description="What The Flow Labs collects when you submit an enquiry, why, where it is stored, how long it is kept and how to have it deleted.",
                crumbs=crumb, hero=h, body=b)


def page_terms():
    crumb = [("/", "Home"), (None, "Terms of Service")]
    h = (crumb, "Plain terms, same as the quote",
         'Terms of service',
         "How we scope, price and hand over work, who owns what, and what happens if something goes wrong. Short, because it should be readable.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p>Last updated: ' + YEAR + '. These terms cover work we do for you through '
        'www.theflowlabs.online. They are written to be read, not skimmed past. If anything here '
        'conflicts with a signed proposal or statement of work, the signed document wins.</p>'

        '<h2>1. Scoping comes before code</h2>'
        '<p>Every project starts with a written scope: what is being built, what is explicitly out of '
        'scope, what you provide, and what "done" means. We do not start build work on a verbal '
        'understanding. If the scope changes after you approve it, we re-quote the delta before doing '
        'the work, in writing, so there is never a surprise invoice at the end.</p>'

        '<h2>2. Fixed price, paid in milestones</h2>'
        '<ul>'
        '<li><strong>The quote is the price</strong> for the agreed scope. It does not move because we '
        'underestimated our own effort.</li>'
        '<li><strong>Payment is split into milestones</strong>, typically a deposit to begin, one or two '
        'payments tied to reviewable stages, and the balance on handover. The split is written into the '
        'proposal before you pay anything.</li>'
        '<li><strong>Invoices are due on the terms stated on the invoice.</strong> Work pauses on overdue '
        'invoices, and resumes when they clear. We would rather tell you that plainly than keep building '
        'and stay quiet about it.</li>'
        '<li><strong>Third-party costs are yours and are passed through at cost</strong> — domains, hosting, '
        'paid APIs, fonts, licences. We tell you which ones a project needs before we start.</li>'
        '</ul>'

        '<h2>3. You own the work on handover</h2>'
        '<p>When the final invoice is paid, you own the deliverables we built for you: the source code, the '
        'design files, the content we wrote for you and the documentation. We hand over the repository and '
        'the credentials, not a locked box.</p>'
        '<p>Two honest exceptions: <strong>third-party components</strong> keep their own licences (open-source '
        'libraries, fonts, stock assets), and <strong>our pre-existing tooling</strong> — internal helpers, '
        'starter templates and patterns we reuse across projects — stays ours, licensed to you for use inside '
        'what we built. We will always say which is which.</p>'
        '<p>Unless you ask us not to, we may show the finished work in our portfolio and describe it in a '
        'case study. We will not publish your metrics, your customers or anything confidential without your '
        'written approval.</p>'

        '<h2>4. What we need from you</h2>'
        '<ul>'
        '<li>One decision-maker who can approve scope, design and final sign-off.</li>'
        '<li>Content, access and feedback in reasonable time. Timelines slip when input stalls; we will flag '
        'it early rather than absorb it silently.</li>'
        '<li>Accurate information about your business, and the right to share any data you give us.</li>'
        '</ul>'

        '<h2>5. Timeline and revisions</h2>'
        '<p>Delivery dates are estimates unless the proposal states a fixed date. Each project includes the '
        'revision rounds listed in the scope; further rounds are quoted separately. Once a stage is approved, '
        'reopening it counts as a scope change.</p>'

        '<h2>6. Support after handover</h2>'
        '<p>Every project includes a warranty window (stated in the proposal) for defects in what we built: '
        'things that do not work as specified. It does not cover new features, third-party outages, or changes '
        'made by someone else. After the window, support is available on a quoted basis, and you are never '
        'locked in — the code is yours.</p>'

        '<h2>7. Limits of liability</h2>'
        '<p>We deliver the work described in the scope, with reasonable skill and care. We are not liable for '
        'indirect or consequential losses, lost profits, or lost data beyond our control. Our total liability '
        'for any project is capped at the fees paid for that project. Keep your own backups; we will help you '
        'set them up.</p>'

        '<h2>8. Cancellation</h2>'
        '<p>Either side can end a project in writing. You pay for the milestones completed and work in '
        'progress up to that point, and you receive what has been paid for. The deposit is not refundable once '
        'build work has started, because it reserves studio time that cannot be resold.</p>'

        '<h2>9. Governing law</h2>'
        '<p>These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction '
        'of the courts at Bhubaneswar, Odisha. Before anything formal, talk to us: every dispute we have had so '
        'far was a conversation.</p>'

        '<h2>10. Changes to these terms</h2>'
        '<p>We may update this page as the studio changes. The date at the top changes with it. The terms that '
        'apply to your project are the ones in effect when you approve the proposal.</p>'

        '<h2>Questions</h2>'
        '<p>Anything unclear, ask before you sign: '
        '<a href="mailto:hello@theflowlabs.online">hello@theflowlabs.online</a>. We would rather spend ten '
        'minutes explaining a clause than have you agree to something you do not understand.</p>'
        '</div></div></section>'
    )
    return dict(path="/terms/",
                title="Terms of Service | The Flow Labs",
                og_title="Terms of service | The Flow Labs",
                description="The Flow Labs terms: how projects are scoped, fixed-price payment milestones, IP ownership on handover, support, cancellation and governing law in India.",
                crumbs=crumb, hero=h, body=b)


def page_bhubaneswar():
    """Local landing page. One substantive page for city intent, not a set of
    thin doorway pages per service: the services are sections that link out."""
    path = "/bhubaneswar/"
    crumb = [("/", "Home"), (None, "Bhubaneswar")]
    h = (crumb, "Bhubaneswar, Odisha",
         'A software studio<br>in <span class="grad">Bhubaneswar.</span>',
         "Three founders, one in-house team. We build websites, custom software and AI automation from Bhubaneswar for businesses in Odisha, across India, and remotely around the world.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p>The Flow Labs is a founder-led engineering studio based in Bhubaneswar, Odisha. We design the interface, '
        'engineer the system behind it, and wire in the AI that removes the repetitive work. Every project is quoted '
        'individually with a fixed price before code starts, and the source code is handed over at the end.</p>'

        '<h2>What we build for businesses in Bhubaneswar</h2>'
        '<ul>'
        '<li><strong>Websites and web apps.</strong> Fast, phone-first sites and product interfaces that load quickly and convert. '
        'See <a href="/services/web-development/">web development</a>.</li>'
        '<li><strong>Custom software.</strong> Internal tools, operations dashboards, APIs and data pipelines built around how your team actually works. '
        'See <a href="/services/custom-software-development/">custom software development</a>.</li>'
        '<li><strong>AI automation.</strong> Ticket triage, document processing, lead routing and reporting that runs on its own schedule. '
        'See <a href="/services/ai-automation/">AI automation</a>.</li>'
        '<li><strong>AI assistants.</strong> A chat assistant trained on your business that answers customers and captures enquiries at any hour. '
        'See <a href="/services/ai-chatbot-development/">AI chatbot development</a>.</li>'
        '</ul>'

        '<h2>Why work with a studio here</h2>'
        '<ul>'
        '<li><strong>You can meet the people doing the work.</strong> For projects in and around Bhubaneswar, we can start '
        'with a face-to-face scoping session instead of a video call.</li>'
        '<li><strong>Same timezone, direct access.</strong> No account managers and no handoffs. You talk to the founders '
        'building your product, on IST, when decisions need to be made.</li>'
        '<li><strong>The work stays yours.</strong> A fixed quote before we start, weekly demos on a real build, and the '
        'repository in your hands at handover.</li>'
        '</ul>'

        '<h2>Working with us across India</h2>'
        '<p>Most of our clients are outside Odisha. The process is the same whether you are in Bengaluru, Mumbai, Delhi or '
        'Bhubaneswar: a written scope, a fixed price before code, a clickable build every week, and a handover that leaves '
        'you independent of us. The <a href="/services/">services overview</a> explains what each engagement includes.</p>'

        '<h2>Working with us internationally</h2>'
        '<p>We also run projects with teams outside India, entirely remotely. Everything is written down, demos are recorded, '
        'and we keep a shared build you can open at any hour. If your team is in another timezone, we agree a short overlap '
        'window for decisions and keep the rest async.</p>'

        '<h2>Who we usually work with</h2>'
        '<p>Founders and small teams with one specific operational problem: a booking flow that leaks enquiries, a back office '
        'held together by spreadsheets, a support inbox nobody can keep up with, or a product idea that needs a real first '
        'version. We are a three-person studio and we take on four builds a month, so the work stays close to the people who '
        'scoped it.</p>'
        '</div></div></section>'
        + faq([
            ("Do you only work with clients in Bhubaneswar?",
             "No. Bhubaneswar is where the studio is based. Most projects run remotely with clients across India and abroad, "
             "and local projects can include in-person sessions when they help."),
            ("Can we meet in person before starting?",
             "If you are in or around Bhubaneswar, yes. We can meet to understand the problem and scope the work before "
             "anything is quoted."),
            ("Do you work with international clients?",
             "Yes. We work remotely with teams outside India, keep decisions in writing and share a clickable build every "
             "week, so time zones rarely slow a project."),
            ("How is pricing decided?",
             "Every project is quoted individually. You get a written scope and a fixed price before code starts, so there "
             "are no hourly surprises."),
            ("How long does a project take?",
             "It depends on scope. The quote includes milestones and a delivery date, and you see progress on a real build "
             "every week."),
        ])
        + cta("Have a project in Bhubaneswar or elsewhere?",
              "Tell us what you are building. We reply within 48 hours with an honest view of scope, timeline and price.")
    )
    schema = {
        "@context": "https://schema.org", "@type": "ProfessionalService",
        "@id": BASE + "/bhubaneswar/#studio",
        "name": "The Flow Labs",
        "url": BASE + "/bhubaneswar/",
        "image": OG_IMG, "logo": BASE + "/assets/icon-180.png",
        "email": "hello@theflowlabs.online",
        "description": "Founder-led web, software and AI studio based in Bhubaneswar, Odisha, working with clients across India and remotely worldwide.",
        "address": {"@type": "PostalAddress", "addressLocality": "Bhubaneswar",
                    "addressRegion": "Odisha", "addressCountry": "IN"},
        "areaServed": [{"@type": "City", "name": "Bhubaneswar"},
                       {"@type": "AdministrativeArea", "name": "Odisha"},
                       {"@type": "Country", "name": "India"}],
        "founder": [{"@type": "Person", "name": "Smruti Ranjan", "jobTitle": "Founder"},
                    {"@type": "Person", "name": "Biswash", "jobTitle": "Co-Founder"},
                    {"@type": "Person", "name": "Arpita", "jobTitle": "Co-Founder"}],
        "sameAs": ["https://www.instagram.com/the.flow.labs/"],
        "availableLanguage": "English",
        "knowsAbout": ["Web development", "Custom software development",
                       "AI automation", "AI chatbot development"],
    }
    return dict(path=path,
                title="Web & Software Studio in Bhubaneswar | The Flow Labs",
                og_title="Software studio in Bhubaneswar | The Flow Labs",
                description="A founder-led web, software and AI studio in Bhubaneswar, Odisha. Fixed price before code and source handed over. Working across India and remotely worldwide.",
                crumbs=crumb, hero=h, body=b,
                jsonld_extra=[schema])


# --------------------------------------------------------------------- blog --
# -------------------------------------------------------------------- blog --
# Posts live in blog-src/*.md — see blog-src/README.md for the format.
# Add or edit a file there, run this script, and the page, the blog index
# card, the sitemap entry and the Article JSON-LD are all generated.
BLOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "blog-src")
POSTS = blog.load_posts(BLOG_DIR, YEAR)

def blog_index():
    crumb = [("/", "Home"), (None, "Blog")]
    h = (crumb, "Practical engineering",
         'The Flow Labs blog', "Practical perspectives on AI automation, web performance, and custom software development. Written by our founders based on production experience.")
    cards = "".join(
        f'<div class="mini reveal"><h4><a href="{p["path"]}" style="color:inherit;text-decoration:none">{p["card"]}</a></h4>'
        f'<p>{p["description"]}</p><p style="margin-top:10px"><a href="{p["path"]}" >Read →</a></p></div>'
        for p in POSTS)
    b = ('<section><div class="wrap"><div class="mini-grid">' + cards + '</div>'
         '<div class="prose reveal" style="margin-top:26px"><p>Every article here has to pass one test: '
         'would this actually help someone running a business? If you want a topic covered, DM us on '
         '<a href="https://www.instagram.com/the.flow.labs/" target="_blank" rel="noopener" >Instagram</a>.</p></div>'
         '</div></section>'
         + cta("Reading is nice. Building is better.",
               "When you are done with the theory, tell us what you want to build and we will scope it honestly."))
    return dict(path="/blog/",
                title="Blog — The Flow Labs",
                og_title="The Flow Labs blog: practical AI and software",
                description="Practical articles on AI automation, chatbots, websites and custom software. Written by the founders from production experience.",
                crumbs=crumb, hero=h, body=b)

# ----------------------------------------------------------------- assemble --
PAGES += [
    page_ai_automation(), page_web_dev(), page_custom_software(), page_chatbots(),
    page_droovee(), page_drishti(), page_flowops(), page_interview_copilot(),
    page_bhuverify(), page_carbon_coach(), page_qr_platform(),
    page_about(), page_contact(), page_privacy(), page_terms(), page_lab_report(),
    page_bhubaneswar(),
    blog_index(), *blog.to_pages(POSTS, cta),
]

SERVICE_META = {
    "/services/ai-automation/": {"name": "AI Automation & Workflow Integration", "serviceType": "AI automation consulting and implementation"},
    "/services/web-development/": {"name": "Website & Web Application Development", "serviceType": "Web development"},
    "/services/custom-software-development/": {"name": "Custom Software Development", "serviceType": "Custom software development"},
    "/services/ai-chatbot-development/": {"name": "AI Chatbot & Assistant Development", "serviceType": "AI chatbot development and integration"},
}

# -------------------------------------------------------------------- emit ---
# The mark: a sheared, heavy "F" for Flow. Stroked paths on a 40×40 grid so the
# same geometry scales from a 16px favicon to a 200px signature. Colour comes
# from `currentColor`, which resolves to --accent (and follows CMS overrides).
LOGO_MARK = (
    '<svg class="logo-mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">'
    '<g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M14.6 6.5 L11.4 33.5"/>'
    '<path d="M14.6 6.5 H29.5"/>'
    '<path d="M13.2 19.8 H24.6"/>'
    '</g></svg>'
)
LOGO_LINK = ('<a href="/" class="nav-logo">' + LOGO_MARK
             + '<span class="nav-word">The Flow Labs<span class="accent-dot">.</span></span></a>')

SITEMAP_ROOT_EXTRA = ["/", "/services/", "/work/", "/blog/", "/about/", "/contact/", "/lab-report/", "/privacy-policy/", "/terms/"]

TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<meta name="description" content="{description}" />
<link rel="canonical" href="{canonical}" />
<meta property="og:title" content="{og_title}" />
<meta property="og:description" content="{description}" />
<meta property="og:url" content="{canonical}" />
<meta property="og:type" content="website" />
<meta property="og:image" content="{og_img}" />
<meta property="og:locale" content="en_IN" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{og_title}" />
<meta name="twitter:description" content="{description}" />
<meta name="twitter:image" content="{og_img}" />
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/assets/icon-180.png" />
<meta name="theme-color" content="#0B0B10" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:ital,wght@400;500;700&display=swap" rel="stylesheet">
<script src="/assets/site.config.js?v=7" defer></script>
<link rel="stylesheet" href="/assets/site.css?v=11">
{jsonld}
</head>
<body data-page="{page_slug}">

<header class="nav" id="nav">
  <div class="container nav-inner">
    {logo_link}
    <div class="nav-links" id="nav-links">
      <a href="/work/">Work</a>
      <a href="/services/">Services</a>
      <a href="/lab-report/">Lab Report</a>
      <a href="/about/">About</a>
      <a href="/blog/">Blog</a>
      <a href="/contact/" class="nav-cta">Start a project</a>
    </div>
    <button class="nav-toggle" id="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<main id="top">
{hero_html}
{body_html}
</main>

<footer class="footer">
  <div class="container">
    <div class="footer-top">
      <div>
        {logo_link}
        <p class="footer-tagline">A founder-led studio building interfaces, systems and applied intelligence. Four builds a month, every layer in-house.</p>
        <p class="clock" style="margin-top:1rem">Studio time <b data-clock>--:--</b> IST</p>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h5>Navigate</h5>
          <a href="/work/">Work</a>
          <a href="/services/">Services</a>
          <a href="/lab-report/">Lab Report</a>
          <a href="/about/">About</a>
          <a href="/blog/">Blog</a>
        </div>
        <div class="footer-col">
          <h5>Connect</h5>
          <a href="/contact/">Start a project</a>
          <a href="https://www.instagram.com/the.flow.labs/" target="_blank" rel="noopener">Instagram</a>
          <a href="/contact/">hello@theflowlabs.online</a>
        </div>
        <div class="footer-col">
          <h5>Studio</h5>
          <a href="/bhubaneswar/">Bhubaneswar studio</a>
          <a href="/services/">What we build</a>
          <a href="/privacy-policy/">Privacy Policy</a>
          <a href="/terms/">Terms of Service</a>
          <a href="/lab-report/">Free site report</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom" style="border-top:1px solid var(--border); margin-top:3rem; padding-top:1.5rem">
      <span>© <span id="year">2026</span> The Flow Labs. All rights reserved.</span>
      <span class="footer-powered">Built and maintained in-house</span>
    </div>
  </div>
</footer>
{footer_note}
<script src="/assets/site.js?v=7"></script>
<script src="/assets/site-cms.js" defer></script>
<script src="/assets/site-track.js" defer></script>
</body>
</html>
'''

SLUGS = {"/": "home", "/about/": "about", "/services/": "services", "/contact/": "contact", "/lab-report/": "lab-report", "/bhubaneswar/": "bhubaneswar"}

def emit():
    url_entries = list(SITEMAP_ROOT_EXTRA)
    written = []
    todo_rx = __import__("re").compile(r"\[TODO-OWNER:([^\]]+)\]")
    for p in PAGES:
        orbzz, pill, h1, sub = p["hero"]
        hero_html = hero(orbzz, pill, h1, sub, p.get("cms"))
        canonical = BASE + p["path"]
        jlds = [org_min(), crumb_jsonld(p["crumbs"])]
        for extra in p.get("jsonld_extra", []):
            jlds.append(extra)
        if p["path"] in SERVICE_META:
            s = SERVICE_META[p["path"]]
            jlds.append({"@context": "https://schema.org", "@type": "Service",
                         "name": s["name"], "description": p["description"],
                         "provider": {"@type": "Organization", "name": "The Flow Labs", "url": BASE + "/", "email": "hello@theflowlabs.online"},
                         "areaServed": [{"@type": "City", "name": "Bhubaneswar"},
                                        {"@type": "AdministrativeArea", "name": "Odisha"},
                                        {"@type": "Country", "name": "India"}],
                         "serviceType": s["serviceType"]})
        if p.get("article"):
            a = p["article"]
            jlds.append({"@context": "https://schema.org", "@type": "Article",
                         "headline": a["headline"], "description": p["description"],
                         "datePublished": a["date"], "dateModified": a["date"],
                         "author": {"@type": "Organization", "name": "The Flow Labs", "url": BASE + "/"},
                         "publisher": {"@type": "Organization", "name": "The Flow Labs", "url": BASE + "/"},
                         "mainEntityOfPage": canonical, "image": OG_IMG})
        jsonld = "\n".join('<script type="application/ld+json">' + json.dumps(j, ensure_ascii=False) + '</script>' for j in jlds)
        body_html = p["body"]
        if p["path"] in SERVICE_META:
            body_html += where_we_work()
        html = TEMPLATE.format(
            title=p["title"], description=p["description"], canonical=canonical,
            og_title=p["og_title"], og_img=OG_IMG,
            jsonld=jsonld, hero_html=hero_html, body_html=body_html,
            footer_note=p.get("footer_note", ""),
            logo_link=LOGO_LINK,
            page_slug=SLUGS.get(p["path"], ""),
        )
        # TODO-OWNER markers stay out of public copy (kept as code comments)
        html = todo_rx.sub(lambda m: "<!-- TODO-OWNER: " + m.group(1).strip() + " -->", html)
        d = os.path.join(os.getcwd(), p["path"].strip("/"))
        os.makedirs(d, exist_ok=True)
        with io.open(os.path.join(d, "index.html"), "w", encoding="utf-8", newline="\n") as f:
            f.write(html)
        written.append(p["path"])
        url_entries.append(p["path"])

    # sitemap (dedupe: root extras and generated pages overlap)
    seen = []
    for u in url_entries:
        if u not in seen:
            seen.append(u)
    urls_xml = "".join(
        f"<url><loc>{BASE}{u if u.endswith('/') else u + '/'}</loc><lastmod>{YEAR}</lastmod></url>"
        for u in seen)
    sitemap = ('<?xml version="1.0" encoding="UTF-8"?>\r\n'
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\r\n' + urls_xml + "\r\n</urlset>\r\n")
    with io.open(os.path.join(os.getcwd(), "sitemap.xml"), "w", encoding="utf-8", newline="") as f:
        f.write(sitemap)

    robots = ("User-agent: *\r\nAllow: /\r\n\r\nSitemap: " + BASE + "/sitemap.xml\r\n")
    with io.open(os.path.join(os.getcwd(), "robots.txt"), "w", encoding="utf-8", newline="") as f:
        f.write(robots)

    print(f"generated {len(written)} pages")
    for w in written:
        print("  ", w)

if __name__ == "__main__":
    os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
    emit()
