#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""The Flow Labs site page generator (stdlib only).

Single source of truth for every sub-page's metadata, breadcrumbs, JSON-LD,
content and sitemap. Re-run after edits:  python tools/site/build.py
Emits every folder in PAGES plus sitemap.xml and robots.txt.
Style/JS live in assets/site.css and assets/site.js (shared with index.html).
"""
from __future__ import annotations
import io, os, json

BASE  = "https://the-flow-labs.vercel.app"
OG_IMG = BASE + "/assets/work-droovee.png"
YEAR  = "2026-11-05"

# ------------------------------------------------------------------ helpers -
ORG = {
    "@context": "https://schema.org", "@type": "Organization",
    "name": "The Flow Labs", "url": BASE + "/",
    "email": "theflowlabs01@gmail.com", "image": OG_IMG,
    "description": "Founder-led engineering studio building AI automation, websites, business workflow automation and custom software for growing businesses in Bhubaneswar, Odisha and across India.",
    "areaServed": [{"@type": "City", "name": "Bhubaneswar"},
                   {"@type": "State", "name": "Odisha"},
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

def hero(crumbs_items, pill, h1, sub):
    c = ('<div class="wrap"><div class="crumbs">'
         + ' <span aria-hidden="true">›</span> '.join(
             f'<a href="{u}">{lbl}</a>' if u else f'<span>{lbl}</span>'
             for u, lbl in crumbs_items) + '</div></div>\n    ')
    p = f'<span class="pill"><span class="dot"></span> {pill}</span>\n    ' if pill else ""
    return (f'<div class="page-hero"><div class="wrap">{c}{p}'
            f'\n    <h1>{h1}</h1>\n'
            f'    <p class="sub">{sub}</p>\n  </div>\n</div>')

def faq(qas):
    return ('<section><div class="wrap">'
            '<div class="prose"><h2>Frequently asked</h2></div>'
            '<div class="faq" style="margin-top:20px">'
            + ''.join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q, a in qas)
            + '</div></div></section>')

def cta(h2, p):
    return ('  <section id="contact" style="padding-top:60px"><div class="wrap">'
            '<div class="cta-box reveal">'
            f'<h2>{h2}</h2><p>{p}</p>'
            '<a href="/contact/" class="btn btn-primary">Start a project →</a>'
            '<div class="cta-mail">or <a href="mailto:theflowlabs01@gmail.com">theflowlabs01@gmail.com</a>'
            '&nbsp;·&nbsp; <a href="https://www.instagram.com/the.flow.labs/" target="_blank" rel="noopener">Instagram DM</a>'
            '</div></div></div></section>')

def minis(items):
    return '<div class="mini-grid reveal">' + ''.join(
        f'<div class="mini"><h4>{h}</h4><p>{p}</p></div>' for h, p in items) + '</div>'

STEPS = [("Talk", "A quick call to understand the idea, the users and what “done” looks like."),
         ("Scope", "We turn it into a tight plan with clear deliverables, timeline and price."),
         ("Build", "Weekly progress, early demos, and your feedback baked into every round."),
         ("Ship", "Launch, handover and support, so it keeps working long after go-live.")]

def steps():
    return '<div class="steps reveal">' + ''.join(
        f'<div class="step"><span class="num">0{i}</span><h3>{h}</h3><p>{p}</p></div>'
        for i, (h, p) in enumerate(STEPS, 1)) + '</div>'

CONTACT_JS = """
<script>
  document.getElementById('year').textContent = new Date().getFullYear();
</script>
<script>
(function () {
  const ideaForm = document.getElementById('ideaForm');
  const note = document.getElementById('formNote');
  const formBtn = document.getElementById('submitBtn');
  let projectType = '';

  document.querySelectorAll('#typeChips .chip-opt').forEach(chip => {
    const pick = () => {
      document.querySelectorAll('#typeChips .chip-opt').forEach(c => {
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
    if (/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(s)) return true;
    return s.replace(/[^\\d]/g, '').length >= 8;
  };
  const showError = (id, show) => document.getElementById(id).classList.toggle('show', show);
  ['fName', 'fIdea'].forEach(id => {
    document.getElementById(id).addEventListener('blur', (e) =>
      showError('err' + id.slice(1), !e.target.value.trim()));
  });
  document.getElementById('fContact').addEventListener('blur', (e) =>
    showError('errContact', !validContact(e.target.value)));

  const cfg = (typeof window !== 'undefined' && window.SITE_CONFIG) || {};
  const supabaseReady = !!(cfg && cfg.supabaseUrl && cfg.supabaseAnonKey);
  const leadSrc = new URLSearchParams(location.search).get('src') || 'site';

  function mailtoLink(name, cont, type, idea, budget) {
    const body = `Name: ${name}\\nContact: ${cont}\\nProject: ${type}\\nBudget: ${budget || '-'}\\nSource: ${leadSrc}\\n\\nIdea:\\n${idea}`;
    return 'mailto:theflowlabs01@gmail.com?subject=' +
      encodeURIComponent('New project idea | The Flow Labs') +
      '&body=' + encodeURIComponent(body);
  }
  async function postLead(payload) {
    const url = cfg.supabaseUrl.replace(/\\/+$/, '') + '/rest/v1/site_leads';
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
  function showSuccess() {
    formBtn.disabled = false;
    formBtn.classList.remove('loading');
    document.getElementById('formWrap').style.display = 'none';
    document.getElementById('successView').style.display = 'block';
    note.textContent = 'No spam. No fake promises. Real reply in 48h.';
  }

  ideaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameC = document.getElementById('fName');
    const contactC = document.getElementById('fContact');
    const ideaC = document.getElementById('fIdea');
    let ok = true;
    const check = (input, errId, valid) => { showError(errId, !valid); if (!valid) ok = false; };
    check(nameC, 'errName', nameC.value.trim());
    check(contactC, 'errContact', validContact(contactC.value));
    check(ideaC, 'errIdea', ideaC.value.trim());
    showError('errType', !projectType);
    if (!projectType) ok = false;
    if (!ok) {
      const first = document.querySelector('.err.show');
      if (first) first.previousElementSibling?.focus?.();
      return;
    }
    if (document.getElementById('fCompany').value.trim()) { showSuccess(); return; } // honeypot

    formBtn.disabled = true; formBtn.classList.add('loading');
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
      formBtn.disabled = false; formBtn.classList.remove('loading');
      note.innerHTML =
        'Auto-send failed. Nothing was lost. <a href="' +
        mailtoLink(payload.name, payload.contact, payload.project_type, payload.idea, payload.budget) +
        '" style="color:#c3b6ff">Tap here to email us this exact idea →</a>';
    }
  });
})();
</script>
"""

ENQUIRY_FORM = '''
<div class="contact-inline reveal">
  <div id="formWrap">
    <h2>Got an idea? Spill it. 🤌</h2>
    <p style="font-size:.85rem;color:#8a9085;margin-bottom:22px">From <b style="color:#A31c1b">“bhai ek idea hai”</b> to shipped product. Tell us what you're cooking.</p>
    <form id="ideaForm" novalidate>
      <div class="field">
        <label for="fName">What do we call you? <span>*</span></label>
        <input id="fName" name="name" type="text" placeholder="Rahul / Rahul-from-the-group-chat" autocomplete="name" required>
        <div class="err" id="errName">Name se bulaoge na? 😅 Enter something.</div>
      </div>
      <div class="field">
        <label for="fContact">Email or phone <span>*</span></label>
        <input id="fContact" name="contact" type="text" placeholder="you@email.com or +91..." autocomplete="email" required>
        <div class="err" id="errContact">Enter a valid email (you@company.com) or phone (+91...). How else do we reply? 📡</div>
      </div>
      <div class="field">
        <label>What are we building? <span>*</span></label>
        <div class="chips-row" id="typeChips" role="radiogroup" aria-label="Project type">
          <span class="chip-opt" data-val="Website" role="radio" aria-checked="false" tabindex="0">Website</span>
          <span class="chip-opt" data-val="AI tool" role="radio" aria-checked="false" tabindex="0">AI tool</span>
          <span class="chip-opt" data-val="Automation" role="radio" aria-checked="false" tabindex="0">Automation</span>
          <span class="chip-opt" data-val="Software" role="radio" aria-checked="false" tabindex="0">Software</span>
          <span class="chip-opt" data-val="Not sure yet" role="radio" aria-checked="false" tabindex="0">Not sure yet 😅</span>
        </div>
        <div class="err" id="errType">Pick one. Even “Not sure yet” counts. 🫠</div>
      </div>
      <div class="field">
        <label for="fIdea">The idea (Hinglish welcome) <span>*</span></label>
        <textarea id="fIdea" name="idea" placeholder="bhai ek app hai jisme user apni photo daale aur AI review de… (yes, write it exactly like that)" required></textarea>
        <div class="err" id="errIdea">Empty idea box? That's just a box. 📦</div>
      </div>
      <div class="field">
        <label for="fBudget">Ballpark budget (₹)</label>
        <select id="fBudget" name="budget">
          <option value="">No clue, shock me</option>
          <option value="under25k">Under 25k</option>
          <option value="25k-1L">25k to 1L</option>
          <option value="1L+">1L+</option>
          <option value="discuss">Let's discuss first</option>
        </select>
      </div>
      <div class="field hp" aria-hidden="true">
        <label for="fCompany">Company</label>
        <input id="fCompany" name="company" type="text" tabindex="-1" autocomplete="off">
      </div>
      <div class="field">
        <button type="submit" class="submit-btn" id="submitBtn">
          <span class="label">Send the idea 🚀</span>
          <span class="spin" aria-hidden="true"></span>
        </button>
        <p class="form-note" id="formNote">No spam. No “we'll get back in 3 weeks”. Reply in 48h, promise.</p>
        <p class="form-note">Submitting shares your name, contact and idea with us so we can reply. See our <a href="/privacy-policy/" style="color:#8a9085">privacy policy</a>.</p>
      </div>
    </form>
  </div>
  <div class="success" id="successView" style="display:none">
    <div class="check" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M4 12.5 9.5 18 20 6.5"/></svg>
    </div>
    <h3>Idea received. 🎉</h3>
    <p>We'll slide into your inbox within 48 hours with honest next steps: scope, timeline, price.</p>
    <p class="meme-line">Meanwhile: <b>go grab a chai</b>, your idea just got a whole lot more real. ☕</p>
    <a class="btn" href="/work/">See our work meanwhile →</a>
  </div>
</div>
'''

CONTACT_OTHER = '''
<section><div class="wrap">
  <div class="prose">
    <h2>Other ways to reach us</h2>
    <p><strong>Email:</strong> <a href="mailto:theflowlabs01@gmail.com">theflowlabs01@gmail.com</a> (mention your project in one line, we take it from there)</p>
    <p><strong>Instagram:</strong> <a href="https://www.instagram.com/the.flow.labs/" target="_blank" rel="noopener">DM @the.flow.labs</a> (fastest for quick questions)</p>
    <p>Based in <strong>Bhubaneswar, Odisha</strong>, working with teams across India. Remote-first, in-person when the project calls for it.</p>
  </div>
</div></section>
'''

# ==================================================================== PAGES ==

def services_hub():
    crumb = [("/", "Home"), (None, "Services")]
    h = (crumb, None,
         "Services, minus the jargon.",
         "Four things we are genuinely good at. Each page below tells you what you get, how projects run and what it costs you in surprises: nothing.")
    b = (
        '<section><div class="wrap">'
        '<div class="mini-grid reveal">'
        '<div class="mini"><h4>AI automation</h4><p>Workflows, agents and document pipelines that quietly remove the boring 60% of your team’s day.</p><p style="margin-top:10px"><a href="/services/ai-automation-bhubaneswar/" style="color:#c3b6ff">AI automation in Bhubaneswar →</a></p></div>'
        '<div class="mini"><h4>AI chatbot development</h4><p>Assistants trained on your business that answer customers at 3AM without a salary negotiation.</p><p style="margin-top:10px"><a href="/services/ai-chatbot-development/" style="color:#c3b6ff">AI chatbot development →</a></p></div>'
        '<div class="mini"><h4>Web development</h4><p>Fast, responsive websites and web apps for businesses and startups. Looks sharp. Loads faster.</p><p style="margin-top:10px"><a href="/services/web-development-bhubaneswar/" style="color:#c3b6ff">Web development →</a></p></div>'
        '<div class="mini"><h4>Custom software</h4><p>Internal tools, dashboards and management systems built around how your business actually works.</p><p style="margin-top:10px"><a href="/services/custom-software-development-bhubaneswar/" style="color:#c3b6ff">Custom software →</a></p></div>'
        '</div>'
        '<div class="prose reveal" style="margin-top:30px"><h2>Not sure which fits?</h2>'
        '<p>Rough guide: if your problem is <b>repetition</b>, it is automation. If it is <b>visibility</b>, it is a website. If it is <b>an internal process held together by Excel</b>, it is custom software. If you have no idea, that is fine. Send us the mess and we will name it together.</p></div>'
        '</div></section>')
    return dict(path="/services/",
                title="AI, Web & Software Development Services | The Flow Labs",
                og_title="Services: AI automation, web development & custom software | The Flow Labs",
                description="What The Flow Labs builds: AI automation and chatbots, responsive websites, custom software. For businesses in Bhubaneswar and across India. Fixed price, built in-house.",
                crumbs=crumb, hero=h, body=b)

def work_hub():
    crumb = [("/", "Home"), (None, "Work")]
    h = (crumb, None,
         "Built in the lab. Shipped for real.",
         "Every product here started life as a 2AM “bhai ek idea hai”. Each page tells the story the short card couldn't: problem, approach, stack, and what status it holds today.")
    cards = ""
    for path, name, status, desc, tag in [
        ("/work/droovee/", "Droovee", "LIVE PRODUCT",
         "Chauffeur booking platform for Bhubaneswar. Verified drivers, transparent pricing, instant trip requests.", "assets/work-droovee.png"),
        ("/work/drishti/", "Drishti", "OPERATIONS AI",
         "Fleet operations console for a state transport corporation: live telemetry, demand forecasting and risk scoring.", "assets/work-drishti.png"),
        ("/work/flowops/", "FlowOps", "AUTOMATION",
         "An AI triage layer for support teams: classifies every ticket, drafts the reply, escalates what needs a human.", "assets/work-flowops.png"),
        ("/work/interview-copilot/", "INTERVIEW-COPILOT", "AI COPILOT",
         "An open-source AI interview companion: prepare, rehearse and improve with real-time coaching.", "assets/work-interviewcopilot.svg"),
        ("/work/bhuverify/", "BHOOMI Series", "GEO + DATA",
         "BhumiStack, BHOOMI and Bhuverify: a land-intelligence stack for maps, verification and property workflows.", "assets/work-bhoomi.svg"),
        ("/work/carbon-coach/", "Carbon Coach", "SUSTAINABILITY",
         "An open-source TypeScript app that tracks and coaches personal carbon footprints.", "assets/work-carboncoach.svg"),
    ]:
        if tag.endswith(".png"):
            dims = ' width="1440" height="900"'
        else:
            dims = ''
        cards += (f'<a class="work reveal" href="{path}">'
                  f'<div class="thumb"><img src="/{tag}" alt="{name} project by The Flow Labs"{dims} loading="lazy" decoding="async"></div>'
                  f'<div class="wbody"><div class="wtop"><h3>{name}</h3><span class="meta">{status}</span></div>'
                  f'<p>{desc}</p><div class="wlink">Case study <span>→</span></div></div></a>')
    b = ('<section><div class="wrap"><div class="work-grid">' + cards + '</div>'
         '<div class="ai-lab reveal" style="margin-top:34px"><p>Also in the lab</p>'
         '<div class="ai-lab-chips"><span class="ai-chip"><span class="live"></span>CivicPulseAI</span>'
         '<span class="ai-chip"><span class="live"></span>ML-MLOps</span>'
         '<span class="ai-chip"><span class="live"></span>btc-sentiment-analysis</span></div></div>'
         '</div></section>')
    return dict(path="/work/",
                title="Our Work: AI Platforms, Web Apps & Case Studies | The Flow Labs",
                og_title="Work by The Flow Labs: AI, web apps & case studies",
                description="Real projects by The Flow Labs: a live chauffeur booking platform, fleet operations AI, support automation, land intelligence and open-source apps.",
                crumbs=crumb, hero=h, body=b)

PAGES = []
PAGES.append(services_hub())
PAGES.append(work_hub())

def page_ai_automation():
    path = "/services/ai-automation-bhubaneswar/"
    crumb = [("/", "Home"), ("/services/", "Services"), (None, "AI automation")]
    h = (crumb, "AI automation · Bhubaneswar + remote teams",
         'AI automation for businesses in <span class="grad">Bhubaneswar</span>',
         "We connect AI to the boring, repetitive parts of your business so your team gets evenings back. Scoped, built and shipped by the founders who quoted it.")
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
        '<li><strong>AI integrations and assistants.</strong> A chat assistant trained on your own website and documents (including 2AM questions), wired into your site or internal tools.</li>'
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
        '<p>Home base is Bhubaneswar, Odisha. Teams across Odisha and the rest of India get the same '
        'founder-led build, mostly remote, with in-person visits when the project genuinely needs them.</p>'
        '</div></div></section>'
        + faq([
            ("How much does AI automation cost?", "It depends on how many workflows you automate and which tools need connecting. A focused single-workflow build costs less than most websites; multi-system builds are scoped in phases. Either way the price is fixed before code starts."),
            ("Will AI automation replace my staff?", "No. It replaces the boring 60% of people’s day. Your front desk still handles the sensitive conversations; the automation handles the repeated ones."),
            ("What if my data is sensitive?", "We build on your accounts wherever possible, restrict what the AI can access, and keep no customer data in our own systems after handover."),
            ("Do you work with businesses outside Bhubaneswar?", "Yes. Bhubaneswar is home, but we build for teams across Odisha and all of India, remote with weekly video demos."),
            ("How fast can something go live?", "A single-workflow automation typically ships in days, not months. Bigger builds are phased so you get value early."),
        ])
        + cta("Got a repetitive process? Let’s chain it up.",
              "Tell us what eats your team’s hours. We scope an automation around it, honestly priced, built by the founders you talked to."))
    return dict(path=path,
                title="AI Automation Agency in Bhubaneswar | The Flow Labs",
                og_title="AI automation for businesses in Bhubaneswar | The Flow Labs",
                description="AI workflow automation, AI agents, document processing and support automation for businesses in Bhubaneswar and Odisha. Founder-led studio, fixed price, built in-house.",
                service={"name": "AI Automation & Workflow Integration", "serviceType": "AI automation consulting and implementation"},
                crumbs=crumb, hero=h, body=b)

def page_web_dev():
    path = "/services/web-development-bhubaneswar/"
    crumb = [("/", "Home"), ("/services/", "Services"), (None, "Web development")]
    h = (crumb, "Web development · Bhubaneswar + remote teams",
         'Web development for businesses in <span class="grad">Bhubaneswar</span>',
         "Websites and web apps that load before the user blinks and look sharp enough that your competitor screenshots them. Built and maintained in-house.")
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
        '<h2>Serving Bhubaneswar and beyond</h2>'
        '<p>Founder-led studio, Bhubaneswar based. We build remotely for teams anywhere in India, and meet '
        'locally when it makes sense. Related work: <a href="/work/droovee/">Droovee</a> (live booking '
        'platform) and <a href="/work/carbon-coach/">Carbon Coach</a> (open source web app).</p>'
        '</div></div></section>'
        + faq([
            ("How much does a website cost in Bhubaneswar?", "Simple business sites and landing pages sit at the lower end of a rough ₹25k to ₹1L range. Custom web apps cost more because they involve real product engineering. You get an exact fixed quote after the first scoping call."),
            ("How long does it take to build a website?", "A focused business site or landing page typically ships in days. Larger web apps run in phases: first something you can point at, then the full build."),
            ("Will my website show up on Google?", "Being indexable and fast is the entry ticket, and every site we ship passes it (metadata, performance, mobile-first). Ranking takes longer and depends on your market. We set honest expectations instead of fake guarantees."),
            ("Do you maintain the site after launch?", "Yes. Handover includes documentation and a support window; ongoing maintenance is available and priced transparently."),
            ("Can you connect my enquiry form to WhatsApp/email/CRM?", "Yes. Form submissions can reach you by email alert, stored in a database you control, or routed onward. You pick the setup in scoping."),
        ])
        + cta("Want a site your competitors screenshot?",
              "Tell us what the site needs to do for the business. Fixed price before code, shipped by the founders."))
    return dict(path=path,
                title="Web Development Company in Bhubaneswar | The Flow Labs",
                og_title="Web development company in Bhubaneswar | The Flow Labs",
                description="Fast, responsive websites, landing pages and custom web apps for businesses in Bhubaneswar and across India. Phone-first, performance-focused, built in-house.",
                service={"name": "Website & Web Application Development", "serviceType": "Web development"},
                crumbs=crumb, hero=h, body=b)

def page_custom_software():
    path = "/services/custom-software-development-bhubaneswar/"
    crumb = [("/", "Home"), ("/services/", "Services"), (None, "Custom software")]
    h = (crumb, "Custom software · Bhubaneswar + remote teams",
         'Custom software development in <span class="grad">Bhubaneswar</span>',
         "Internal tools, dashboards and management systems shaped around how your business actually works. Not another license sitting in the corner.")
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
        '<li><strong>APIs and-backend services.</strong> The connecting tissue between tools you already pay for.</li>'
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
        '<h2>Serving Bhubaneswar and beyond</h2>'
        '<p>Bhubaneswar is home base; we take projects across Odisha and India. Related work: '
        '<a href="/work/flowops/">FlowOps</a> (AI workflow console) built in-house by the same founders who '
        'would build yours.</p>'
        '</div></div></section>'
        + faq([
            ("How much does custom software cost?", "It scales with what you are actually building, from focused internal tools to multi-phase products. Small tools sit in the same ballpark as a serious website. You get a fixed price per phase before code starts."),
            ("How long does custom software take?", "Focused tools ship in weeks. Larger systems are phased: first something you can click in weeks, then depth in later phases."),
            ("Can you work with our existing systems?", "Yes. Integrating with what you already run (Excel, Tally, CRMs, custom APIs) is usually the correct first move, not a rebuild from scratch."),
            ("What happens when we want changes after launch?", "Post-launch changes are normal. Handover includes documentation and a support window; changes after that are priced transparently, not by surprise."),
            ("Do we need our own servers?", "Usually no. We deploy on managed cloud (Vercel, Supabase, or a cloud server you own) and hand you full ownership of the code and data."),
        ])
        + cta("Describe the process that hurts, get a straight answer.",
              "You bring the mess, we bring the honest scoping call. If custom is not right for you, we will say so first."))
    return dict(path=path,
                title="Custom Software Development Company in Bhubaneswar | The Flow Labs",
                og_title="Custom software development company in Bhubaneswar | The Flow Labs",
                description="Custom business software: internal tools, management dashboards, APIs and dashboards for teams in Bhubaneswar and across India. Built in-house, owner-managed, fixed price.",
                service={"name": "Custom Software Development", "serviceType": "Custom software development"},
                crumbs=crumb, hero=h, body=b)

def page_chatbots():
    path = "/services/ai-chatbot-development/"
    crumb = [("/", "Home"), ("/services/", "Services"), (None, "AI chatbot development")]
    h = (crumb, "AI chatbots · trained on YOUR business",
         'AI chatbot development for your business',
         "Assistants that know your website, your documents and your pricing, answer customers in seconds (yes, at 3AM) and pass the real stuff to a human.")
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
        + cta("Give your customers a 3AM front desk.",
              "Tell us what your customers keep asking. We ground an assistant in your real content and connect it where they already are."))
    return dict(path=path,
                title="AI Chatbot Development for Business | The Flow Labs",
                og_title="AI chatbot development for business | The Flow Labs",
                description="AI assistants trained on your business that answer customers at 3AM, book enquiries and escalate sensitive cases. For businesses in Bhubaneswar and across India.",
                service={"name": "AI Chatbot & Assistant Development", "serviceType": "AI chatbot development and integration"},
                crumbs=crumb, hero=h, body=b)

# --------------------------------------------------------------- WORK pages -
def work_page(path, status, crumb_label, hero_parts, body):
    return dict(path=path, title=None, og_title=None, description=None,
                crumbs=crumb, hero=hero_parts, body=body)

def page_droovee():
    crumb = [("/", "Home"), ("/work/", "Work"), (None, "Droovee")]
    h = (crumb, "LIVE PRODUCT · Bhubaneswar",
         'Droovee: book a chauffeur, drive your own car',
         "A live chauffeur-booking platform for Bhubaneswar, created by our founders. Transport you can own: verified drivers, transparent pricing, instant trip requests.")
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
        '<a href="/services/web-development-bhubaneswar/">web application</a> or a '
        '<a href="/services/ai-automation-bhubaneswar/">workflow platform</a>.</p>'
        '</div></div></section>'
        + faq([
            ("Is Droovee a client project of The Flow Labs?", "No. Droovee is a product built and run by the founders themselves. It is our lab, and a public demonstration of how we build."),
            ("Can I see it live?", "Yes, at droovee.vercel.app."),
            ("Will you build something similar for my business?", "Yes, booking platforms and marketplace-style web apps are a core service. See our web development service page or just tell us the idea."),
        ])
        + cta("Got an idea like Droovee?",
              "If a booking platform or marketplace app is in your head, tell us. We build these as products, not mockups.")
    )
    return dict(path="/work/droovee/",
                title="Droovee Case Study: Chauffeur Booking Platform | The Flow Labs",
                og_title="Droovee: chauffeur booking platform built by The Flow Labs",
                description="Droovee is a live chauffeur-booking platform for Bhubaneswar built by The Flow Labs founders. Verified drivers, transparent pricing, instant trip requests.",
                crumbs=crumb, hero=h, body=b)

def page_drishti():
    crumb = [("/", "Home"), ("/work/", "Work"), (None, "Drishti")]
    h = (crumb, "OPERATIONS AI · Built in-house",
         'Drishti: fleet operations intelligence',
         "An operations console for a state transport corporation: live telemetry, demand forecasting and risk scoring on one screen instead of five tools.")
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
        'at our <a href="/services/ai-automation-bhubaneswar/">AI automation service</a> or the '
        '<a href="/services/custom-software-development-bhubaneswar/">custom software page</a>.</p>'
        '</div></div></section>'
        + cta("Running something complicated on spreadsheets?",
              "Tell us what your operations look like today. We will scope a console around reality, not around a slide deck."))
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
        '<a href="/services/ai-automation-bhubaneswar/">AI automation</a> and '
        '<a href="/services/ai-chatbot-development/">AI chatbot</a> services: classify, draft, escalate. '
        'Built by us, NOT outsourced to someone’s “jiju ka team”.</p>'
        '</div></div></section>'
        + cta("Want this sitting in front of your support inbox?",
              "Tell us where tickets come from today. We will scope a triage layer around your reality."))
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
        + cta("Building an AI copilot for your users or team?",
              "Tell us what your copilot should do. We build assistants that listen and coach, not just chatboxes.")
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
        '<a href="/services/custom-software-development-bhubaneswar/">custom software</a> service page.</p>'
        '</div></div></section>'
        + cta("Drowning in land, property or records data?",
              "Tell us what the data looks like today. We will scope the version that makes decisions faster."))
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
        '<a href="/services/web-development-bhubaneswar/">website and web app</a> we build for a business.</p>'
        '</div></div></section>'
        + cta("Want a web app built to this standard?",
              "Tell us what it should do for your users. Fixed price, built by the founders."))
    return dict(path="/work/carbon-coach/",
                title="Carbon Coach: Open-Source Footprint Tracker | The Flow Labs",
                og_title="Carbon Coach: sustainability app by The Flow Labs",
                description="Carbon Coach is an open-source TypeScript app by The Flow Labs: personal carbon footprint tracking, live metrics and weekly progress nudges.",
                crumbs=crumb, hero=h, body=b)

def page_about():
    crumb = [("/", "Home"), (None, "About")]
    h = (crumb, "Founder-led · Bhubaneswar",
         'Two founders. One stack. Zero outsourcing.',
         "The Flow Labs is a small, founder-led engineering studio in Bhubaneswar. This page is the honest version of who you are hiring.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p>[TODO-OWNER: add founder names, short bios and a proper logo/face photo here. Honest identities beat anonymity for trust.]</p>'
        '<p>The Flow Labs started the way most real products do: somebody said “bhai ek idea hai” at 2AM, '
        'and instead of quoting an agency, the founders built it themselves. Droovee, our live chauffeur '
        'booking platform, is a direct result.</p>'
        '<h2>How we work</h2>'
        '<ul>'
        '<li><strong>You talk to the people building it.</strong> No account managers, no handoffs, no “our developer will get back to you”.</li>'
        '<li><strong>Fixed price before code.</strong> Scope, timeline and price agreed first. No surprise invoices mid-project.</li>'
        '<li><strong>Weekly demos.</strong> You watch the product grow in real, clickable versions, not slide decks.</li>'
        '<li><strong>We ship in-house.</strong> AI, web, automation and software are built by us. If a task does not fit our skills, we say so instead of subcontracting quietly.</li>'
        '</ul>'
        '<h2>Where we are</h2>'
        '<p>Based in Bhubaneswar, Odisha, India. Local in presence, serious in ambition: we take projects '
        'across India, remotely, and meet in person around Bhubaneswar when the project calls for it.</p>'
        '<h2>What we will NOT do</h2>'
        '<ul>'
        '<li>Promise rankings and overnight SEO miracles. We set honest expectations instead.</li>'
        '<li>Take a project we are not the right team for. You will get a straight answer in the first call, possibly with a referral.</li>'
        '<li>Inflate our history. What you see in <a href="/work/">our lab</a> is our actual work, labelled honestly by status (live, in-house, open source).</li>'
        '</ul>'
        '<h2>Why the meme energy</h2>'
        '<p>Because engineering is serious and agencies are boring. You heard us joke about Excel’s funeral; '
        'watch our weekly demos and you will see why the work is anything but a joke.</p>'
        '</div></div></section>'
        + faq([
            ("Who are the founders?", "A two-founder engineering team based in Bhubaneswar. [TODO: names and short bios pending owner input.]"),
            ("Is The Flow Labs an agency?", "We are a studio, not an agency: the founders do the work personally, with fixed-price projects and no outsourced middle layer."),
            ("Can we visit or work locally in Bhubaneswar?", "Yes, we take local meetings. Most projects run remote-first with weekly video demos."),
        ])
        + cta("Meet the founders behind the lab",
              "The fastest introduction is a project call. Bring one idea, we bring honest scoping.")
    )
    return dict(path="/about/",
                title="About The Flow Labs: Founder-Led Engineering Studio | Bhubaneswar",
                og_title="About The Flow Labs: founder-led engineering, Bhubaneswar",
                description="Meet The Flow Labs: a two-founder engineering studio in Bhubaneswar building AI, web and custom software in-house. Fixed price, weekly demos, honest scoping.",
                crumbs=crumb, hero=h, body=b)

def page_contact():
    crumb = [("/", "Home"), (None, "Contact")]
    h = (crumb, "Reply in 48h · no drama",
         'Start a project. Bhai, ek idea hai?',
         "Fill the form, DM us, or email. Tell us what you are building and you will get honest next steps: scope, timeline, price.")
    b = (
        '<section id="enquiry" style="padding-top:20px"><div class="wrap">'
        + ENQUIRY_FORM +
        '</div></section>'
        + CONTACT_OTHER
        + cta("Prefer to look around first?",
              "No pressure. Start with our <a href='/work/' style='color:#c3b6ff'>work</a> and the "
              "<a href='/services/' style='color:#c3b6ff'>services</a> page. The form will still be here.")
    )
    return dict(path="/contact/",
                title="Start a Project: Contact The Flow Labs (Bhubaneswar)",
                og_title="Start a project | The Flow Labs",
                description="Tell The Flow Labs what you are building: websites, AI, automation or custom software. Enquiry form with an honest 48h reply from the founders.",
                crumbs=crumb, hero=h, body=b,
                footer_note=CONTACT_JS)

def page_privacy():
    crumb = [("/", "Home"), (None, "Privacy Policy")]
    h = (crumb, "Written in human, not legalese",
         'Privacy policy',
         "What we collect when you enquire, why, how long we keep it and how to make us forget you.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p>Last updated: ' + YEAR + '. This applies to the-flow-labs.vercel.app and every enquiry you '
        'send us from it.</p>'
        '<h2>What we collect</h2>'
        '<ul>'
        '<li><strong>What you type into our forms:</strong> your name, email or phone, project type, project description and budget range.</li>'
        '<li><strong>Technical metadata, automatically:</strong> your browser’s user-agent string and the page source tag (for understanding where enquirers came from).</li>'
        '</ul>'
        '<p>We do not run advertising trackers or analytics cookies today.</p>'
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
        '<li>Ask us anything about your data: <a href="mailto:theflowlabs01@gmail.com">theflowlabs01@gmail.com</a>.</li>'
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

# --------------------------------------------------------------------- blog --
BLOG_META = [
    ("/blog/ai-automation-for-bhubaneswar-businesses/",
     "How Businesses in Bhubaneswar Can Use AI Automation | The Flow Labs",
     "AI automation for Bhubaneswar businesses explained practically: what to automate first, what it costs, and what to expect. No hype, founder-written."),
    ("/blog/custom-software-vs-ready-made-software/",
     "Custom Software vs Ready-Made: A Business Decision Guide | The Flow Labs",
     "Custom software vs ready-made software compared honestly: cost, control, timelines and the five questions that actually decide which one you need."),
    ("/blog/how-to-plan-a-website-for-a-new-startup/",
     "How to Plan a Website for a New Startup | The Flow Labs",
     "How to plan a startup website that actually gets you customers: goals, must-have pages, copy, budget and common traps. Practical, founder-written."),
]

def blog_index():
    crumb = [("/", "Home"), (None, "Blog")]
    h = (crumb, "Practical, not platitudes",
         'The Flow Labs blog', "Straight answers on AI, automation, websites and software for businesses. Written by the founders, from real projects, minus the buzzwords.")
    cards = "".join(
        f'<div class="mini reveal"><h4><a href="{u}" style="color:inherit;text-decoration:none">{t.split(" | ")[0]}</a></h4>'
        f'<p>{d}</p><p style="margin-top:10px"><a href="{u}" style="color:#c3b6ff">Read →</a></p></div>'
        for (u, t, d) in BLOG_META)
    b = ('<section><div class="wrap"><div class="mini-grid">' + cards + '</div>'
         '<div class="prose reveal" style="margin-top:26px"><p>Every article here has to pass one test: '
         'would this actually help someone running a business? If you want a topic covered, DM us on '
         '<a href="https://www.instagram.com/the.flow.labs/" target="_blank" rel="noopener" style="color:#c3b6ff">Instagram</a>.</p></div>'
         '</div></section>'
         + cta("Reading is nice. Building is better.",
               "When you are done with the theory, tell us what you want to build and we will scope it honestly."))
    return dict(path="/blog/",
                title="The Flow Labs Blog: Practical AI, Websites & Software",
                og_title="The Flow Labs blog: practical AI and software",
                description="Practical articles on AI automation, chatbots, websites and custom software for businesses in Bhubaneswar and India. Written by the founders.",
                crumbs=crumb, hero=h, body=b)

def article1():
    path = BLOG_META[0][0]
    crumb = [("/", "Home"), ("/blog/", "Blog"), (None, "AI automation for Bhubaneswar businesses")]
    h = (crumb, "Founder-written · " + YEAR,
         'How businesses in Bhubaneswar can use AI automation',
         "A practical walkthrough of what to automate first, what to leave alone, and what it actually costs to get moving. Written for local business owners, not tech conferences.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p><em>Author: The Flow Labs (founder-written). Last updated: ' + YEAR + '.</em></p>'
        '<p>Walk into most businesses in Bhubaneswar and ask where the chaos lives… you will get the same '
        'answer: WhatsApp, calls and “ask Vishal, uska Excel hai sab data”. AI automation sounds expensive '
        'and imported as a solution. It is neither, if you start with the right problem. This guide walks '
        'through it from the perspective of what we have actually shipped: a live booking platform '
        '(Droovee), an AI support triage console (FlowOps) and a fleet intelligence console (Drishti).</p>'
        '<h2>Start here: the processes worth automating first</h2>'
        '<ul>'
        '<li><strong>The same question, asked a hundred times.</strong> Prices, timings, “are you available on Ganesh Puja”, capture on your site or Instagram and answer automatically. This is the classic first automation because it is concentrated pain.</li>'
        '<li><strong>Data re-typing between two systems.</strong> Enquiry form → spreadsheet → follow-up task requires a human relaying it every single time. Crack it and speed changes immediately.</li>'
        '<li><strong>Follow-up reminders.</strong> Most local businesses lose revenue not on leads but on the follow-up that never came.</li>'
        '<li><strong>Daily reporting.</strong> Assembling yesterday’s numbers should be a file or dashboard you open, not a phone call tour.</li>'
        '</ul>'
        '<h2>What not to automate (yet)</h2>'
        '<ul>'
        '<li><strong>The sensitive conversations.</strong> Price negotiation with a big client, an unhappy customer, a health or safety question. Hand those to a person. Every time.</li>'
        '<li><strong>The process nobody can explain.</strong> If your own team cannot describe a workflow clearly, automating it will simply automate the confusion. Fix the process first.</li>'
        '</ul>'
        '<h2>What it costs, honestly</h2>'
        '<p>Prices vary by scope, but honest rules of thumb: a focused single-flow automation (capturing enquiries and answering FAQs) costs less than what most businesses spend renovating their shop; '
        'multi-system builds are phased. Our advice is always: <strong>fix the price before code starts</strong>, '
        'and start with the leak that hurts the most.</p>'
        '<h2>What it costs you in effort, honestly</h2>'
        '<p>The founder does the scoping; your team does the testing with a real day’s data. If somebody '
        'promises you AI with zero involvement from your side, they are selling you a demo, not a system.</p>'
        '<h2>A 30-day starting plan</h2>'
        '<ul>'
        '<li>Week 1: list every repetitive thing your team did this week. Even 10 minutes matters.</li>'
        '<li>Week 2: pick ONE. The one that repeats the most and hurts most often.</li>'
        '<li>Week 3: get it scoped with a fixed quote. Ask what happens when the automation meets an edge case.</li>'
        '<li>Week 4: ship it for one team, one week, then decide on the next. The goal is not a revolution; it is a chain.</li>'
        '</ul>'
        '<h2>Local advantage you should not ignore</h2>'
        '<p>Bhubaneswar’s market rewards speed: customers switch to the business that responds while the '
        'others sleep. AI automation is equally about responsiveness. That is the practical, 2 chai ko '
        'paer ne answer to “should I care?”: your competitor is probably not doing this stuff yet. '
        'For now.</p>'
        '<p>Want to scope your first automation without jargon? '
        '<a href="/services/ai-automation-bhubaneswar/">Here is how we handle it</a>, or call us directly: '
        '<a href="mailto:theflowlabs01@gmail.com">theflowlabs01@gmail.com</a>.</p>'
        '</div></div></section>'
        + cta("Ready to automate one thing?",
              "Bring the repetitive thing that annoys you most. We will scope it honestly, no buzzwords attached."))
    return dict(path=path, title=BLOG_META[0][1], og_title="AI automation for Bhubaneswar businesses",
                description=BLOG_META[0][2],
                crumbs=crumb, hero=h, body=b,
                article={"headline": "How Businesses in Bhubaneswar Can Use AI Automation", "date": YEAR})

def article2():
    path = BLOG_META[1][0]
    crumb = [("/", "Home"), ("/blog/", "Blog"), (None, "Custom software vs ready-made")]
    h = (crumb, "Founder-written · " + YEAR,
         'Custom software vs ready-made software',
         "The five questions that genuinely decide between a SaaS subscription and custom-built software. A decision guide for businesses, written from both sides of the table.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p><em>Author: The Flow Labs (founder-written). Last updated: ' + YEAR + '.</em></p>'
        '<p>Somewhere between a spreadsheet and a fully custom system lives every real business decision. '
        'You can subscribe to ready-made software and be up tomorrow, or get something built to match your '
        'exact process. Here is the version of that conversation without the sales agenda.</p>'
        '<h2>The five questions that actually decide it</h2>'
        '<ol>'
        '<li><strong>Is your process standard?</strong> Invoicing, payroll, basic CRM: standard everywhere. Buy. The more local, cultural or unique flavor is in your process, the more custom makes sense.</li>'
        '<li><strong>Will the process be your competitive advantage?</strong> If your edge is HOW you do things, mandatory “adjusting” to vendor rules can destroy that edge.</li>'
        '<li><strong>What is actually your volume?</strong> Five bills a month: ready-made. Five thousand records a day across fields: build.</li>'
        '<li><strong>Do you need the data?</strong> Custom software gives you schema-level control. Many vendors give you reports, not data.</li>'
        '<li><strong>Who maintains it?</strong> With SaaS, the vendor does. With custom, maintenance is a real line item. Decide consciously, not by glance.</li>'
        '</ol>'
        '<h2>Costs compared, with a straight face</h2>'
        '<p>Ready-made is cheaper for the first year and then quietly charges you per seat, forever. '
        'Custom looks expensive up front and usually saves money around year two or three, IF scope is '
        'actually controlled. The number one mistake on both sides is custom that tries to become a '
        'general-purpose ERP: now THAT is a money-eater.</p>'
        '<p>Sharp tip: build the boring 90% with proven tools, and spend the custom budget on the special '
        '10% that makes your business YOURS. This is exactly how we approach scoping on '
        '<a href="/services/custom-software-development-bhubaneswar/">our custom software service</a>.</p>'
        '<h2>A hybrid: practice what you preach</h2>'
        '<ul>'
        '<li>Internal tools built custom, glued to your existing systems with APIs, NOT a full platform rebuild.</li>'
        '<li>Landing pages plus dashboards as phase one, depth later. You see ROI before the big spend.</li>'
        '<li>Sub-process automation on top of tools you already pay for.</li>'
        '</ul>'
        '<h2>Our honest bias</h2>'
        '<p>Yes, we build software, so read this with that in mind. But note, we advise multiple clients AWAY '
        'from custom every quarter. The deciding factor above should always be a straight answer in a '
        'scoping call, before you commit to any bill from anyone.</p>'
        '<p>If you want the straight answer on your specific case, bring your process (yes, even screenshots '
        'of the Excel), and we will tell you plainly.</p>'
        '</div></div></section>'
        + cta("Still torn? Bring your process.",
              "One scoping call, zero pressure. If ready-made wins, we will say so and tell you which one to try first."))
    return dict(path=path, title=BLOG_META[1][1], og_title="Custom software vs ready-made software",
                description=BLOG_META[1][2],
                crumbs=crumb, hero=h, body=b,
                article={"headline": "Custom Software vs Ready-Made Software: A Business Decision Guide", "date": YEAR})

def article3():
    path = BLOG_META[2][0]
    crumb = [("/", "Home"), ("/blog/", "Blog"), (None, "Planning a startup website")]
    h = (crumb, "Founder-written · " + YEAR,
         'How to plan a website for a new startup',
         "Goals, pages, copy, budget and the classic traps startups fall into with their first website. A practical plan you can actually follow this week.")
    b = (
        '<section><div class="wrap"><div class="prose">'
        '<p><em>Author: The Flow Labs (founder-written). Last updated: ' + YEAR + '.</em></p>'
        '<p>Most startup websites fail before a single line of code is written, because nobody decided '
        'what the website is actually FOR. Not the, all-hands-will-love-it decisions. The practical ones. '
        'Here is the plan we wish every founder would walk in with.</p>'
        '<h2>Step 1: choose ONE primary job</h2>'
        '<p>A website can pull off multiple jobs. It is way stronger when one job is primary:</p>'
        '<ul>'
        '<li><strong>Collect qualified leads</strong> (most service businesses),</li>'
        '<li><strong>Convince investors/biz-dev visitors</strong> (fundraising context),</li>'
        '<li><strong>Convert signups</strong> (product stage startups),</li>'
        '<li><strong>Just exist credibly</strong> when someone Googles your name after meeting you.</li>'
        '</ul>'
        '<p>Choosing primary changes everything downstream: copy, structure, even speed budget.</p>'
        '<h2>Step 2: the pages you actually need</h2>'
        '<ul>'
        '<li><strong>Home:</strong> what you do, for whom, and one obvious next step. If a visitor cannot answer “what does this thing do” in 5 seconds, nothing else matters.</li>'
        '<li><strong>Proof:</strong> portfolio, case studies, or honest early-stage framing. Proof beats promises. (See how our <a href="/work/">work page</a> labels status honestly.)</li>'
        '<li><strong>Services/product:</strong> concrete offer, not a vibe.</li>'
        '<li><strong>Contact/enquiry:</strong> a form you will actually see. Test it yourself before launch, twice.</li>'
        '</ul>'
        '<p>Nine-page menus and 3-layer dropdowns are decoration. One page, one job.</p>'
        '<h2>Step 3: write for the customer, not for the founder</h2>'
        '<p>Common trap: pages that describe what the founder finds interesting and what the customer needs '
        'to know, in the reverse of that order. Every sentence either helps a visitor decide, or gets cut. '
        'One test: have a friend read the homepage for 8 seconds and say what you do. Whatever they say, '
        'is the truth.</p>'
        '<h2>Step 4: budget in honesty ranges</h2>'
        '<p>DIY builders: cheap and slow-loading, or clunky. Agencies: fine, sometimes generic. '
        'Founder-built (ours): fixed price, shipped fast, real engineering underneath. Do not blow the '
        'budget on art direction before copy exists. Copy is the product on a website.</p>'
        '<h2>Step 5: check before launch</h2>'
        '<ul>'
        '<li>Loads fast on a real budget phone with weak signal.</li>'
        '<li>Form works, reply arrives, and auto-confirmation reads like a human wrote it.</li>'
        '<li>Google can index it (title, description, sitemap are not blocked).</li>'
        '<li>Every button and link works on mobile.</li>'
        '<li>You are proud to read the copy aloud.</li>'
        '</ul>'
        '<p>When you ship it, submit to Google Search Console and move on to actual marketing. A website '
        'is a stage, not the show.</p>'
        '<p>Want this planned with you directly? <a href="/services/web-development-bhubaneswar/">Here is our '
        'web development service</a>, or start a conversation at '
        '<a href="mailto:theflowlabs01@gmail.com">theflowlabs01@gmail.com</a>.</p>'
        '</div></div></section>'
        + cta("Planning your startup's website?",
              "Tell us the job you need it to do. We will tell you what to build, what to skip, and ship it fast."))
    return dict(path=path, title=BLOG_META[2][1], og_title="How to plan a website for a new startup",
                description=BLOG_META[2][2],
                crumbs=crumb, hero=h, body=b,
                article={"headline": "How to Plan a Website for a New Startup", "date": YEAR})

# ----------------------------------------------------------------- assemble --
PAGES += [
    page_ai_automation(), page_web_dev(), page_custom_software(), page_chatbots(),
    page_droovee(), page_drishti(), page_flowops(), page_interview_copilot(),
    page_bhuverify(), page_carbon_coach(),
    page_about(), page_contact(), page_privacy(),
    blog_index(), article1(), article2(), article3(),
]

SERVICE_META = {
    "/services/ai-automation-bhubaneswar/": {"name": "AI Automation & Workflow Integration", "serviceType": "AI automation consulting and implementation"},
    "/services/web-development-bhubaneswar/": {"name": "Website & Web Application Development", "serviceType": "Web development"},
    "/services/custom-software-development-bhubaneswar/": {"name": "Custom Software Development", "serviceType": "Custom software development"},
    "/services/ai-chatbot-development/": {"name": "AI Chatbot & Assistant Development", "serviceType": "AI chatbot development and integration"},
}

# -------------------------------------------------------------------- emit ---
SITEMAP_ROOT_EXTRA = ["/", "/services/", "/work/", "/blog/", "/about/", "/contact/", "/privacy-policy/"]

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
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='9' fill='%237c5cff'/%3E%3Ctext x='16' y='22' font-family='Arial,sans-serif' font-size='15' font-weight='bold' fill='%23fff' text-anchor='middle'%3EFL%3C/text%3E%3C/svg%3E" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="/assets/site.config.js"></script>
<link rel="stylesheet" href="/assets/site.css">
{jsonld}
</head>
<body>

<div class="glow"></div>
<div class="grid-fade"></div>

<header id="header">
  <div class="wrap">
    <nav>
      <a href="/" class="logo"><span class="mark">FL</span> The Flow Labs</a>
      <div class="nav-links" id="navLinks">
        <a href="/work/">Work</a>
        <a href="/services/">Services</a>
        <a href="/about/">About</a>
        <a href="/blog/">Blog</a>
        <a href="/contact/">Contact</a>
      </div>
      <button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <a href="/contact/" class="btn btn-primary btn-sm">Start a project</a>
    </nav>
  </div>
</header>

<main id="top">
{hero_html}
{body_html}
</main>

<footer>
  <div class="wrap foot">
    <div class="logo" style="font-size:.95rem"><span class="mark">FL</span> The Flow Labs</div>
    <small>© <span id="year"></span> The Flow Labs. Built by us, obviously.</small>
    <div class="socials">
      <a href="/work/">Work</a>
      <a href="/services/">Services</a>
      <a href="/about/">About</a>
      <a href="/blog/">Blog</a>
      <a href="/privacy-policy/">Privacy</a>
      <a href="/contact/">Contact</a>
      <a href="mailto:theflowlabs01@gmail.com">Email</a>
    </div>
  </div>
</footer>
{footer_note}
<script src="/assets/site.js"></script>
</body>
</html>
'''

def emit():
    url_entries = ["/", "/services/", "/work/", "/blog/", "/about/", "/contact/", "/privacy-policy/"]
    written = []
    todo_rx = __import__("re").compile(r"\[TODO-OWNER:([^\]]+)\]")
    for p in PAGES:
        orbzz, pill, h1, sub = p["hero"]
        hero_html = hero(orbzz, pill, h1, sub)
        canonical = BASE + p["path"]
        jlds = [org_min(), crumb_jsonld(p["crumbs"])]
        if p["path"] in SERVICE_META:
            s = SERVICE_META[p["path"]]
            jlds.append({"@context": "https://schema.org", "@type": "Service",
                         "name": s["name"], "description": p["description"],
                         "provider": {"@type": "Organization", "name": "The Flow Labs", "url": BASE + "/", "email": "theflowlabs01@gmail.com"},
                         "areaServed": [{"@type": "City", "name": "Bhubaneswar"},
                                        {"@type": "State", "name": "Odisha"},
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
        html = TEMPLATE.format(
            title=p["title"], description=p["description"], canonical=canonical,
            og_title=p["og_title"], og_img=OG_IMG,
            jsonld=jsonld, hero_html=hero_html, body_html=p["body"],
            footer_note=p.get("footer_note", ""),
        )
        # TODO-OWNER markers stay out of public copy (kept as code comments)
        html = todo_rx.sub(lambda m: "<!-- TODO-OWNER: " + m.group(1).strip() + " -->", html)
        d = os.path.join(os.getcwd(), p["path"].strip("/"))
        os.makedirs(d, exist_ok=True)
        with io.open(os.path.join(d, "index.html"), "w", encoding="utf-8", newline="\n") as f:
            f.write(html)
        written.append(p["path"])
        url_entries.append(p["path"])

    # sitemap
    urls_xml = "".join(
        f"<url><loc>{BASE}{u if u.endswith('/') else u + '/'}</loc><lastmod>{YEAR}</lastmod></url>"
        for u in url_entries)
    sitemap = ('<?xml version="1.0" encoding="UTF-8"?>\n'
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls_xml + "\n</urlset>\n")
    with io.open(os.path.join(os.getcwd(), "sitemap.xml"), "w", encoding="utf-8", newline="\n") as f:
        f.write(sitemap)

    robots = ("User-agent: *\nAllow: /\n\nSitemap: " + BASE + "/sitemap.xml\n")
    with io.open(os.path.join(os.getcwd(), "robots.txt"), "w", encoding="utf-8", newline="\n") as f:
        f.write(robots)

    print(f"generated {len(written)} pages")
    for w in written:
        print("  ", w)

if __name__ == "__main__":
    os.chdir(os.path.join(os.path.dirname(__file__), "..", ".."))
    emit()
