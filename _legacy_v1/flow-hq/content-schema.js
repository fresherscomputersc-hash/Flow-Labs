/* The Flow Labs — CMS field registry shared by the admin panel.
   Keys match data-cms attributes in the generated HTML.
   `category` groups the pages in the rail; `group` blocks fields together. */

window.CONTENT_SCHEMA = {
  /* ================= SITE ================= */
  home: {
    category: 'Site',
    label: 'Home',
    path: '/',
    fields: [
      { group: 'Hero', key: 'hero-label', label: 'Eyebrow', type: 'text', default: 'Interfaces · Systems · Intelligence' },
      { group: 'Hero', key: 'hero-title', label: 'Headline', type: 'html', default: 'If it lives on<br>a screen, we<br>build <em>it.</em>' },
      { group: 'Hero', key: 'hero-subtitle', label: 'Standfirst', type: 'longtext', default: 'A founder-led studio that designs the interface, engineers the system, and wires in the intelligence. One team, fixed price, no handoffs.' },

      { group: 'Services', key: 'services-title', label: 'Section heading', type: 'html', default: 'Three layers. <em>One team.</em>' },
      { group: 'Services', key: 'services-subtitle', label: 'Section intro', type: 'longtext', default: 'Open a layer to see what is inside it. Most projects need one. The good ones end up using all three.' },

      { group: 'Team', key: 'team-1-name', label: 'First person — name', type: 'text', default: 'Smruti Ranjan' },
      { group: 'Team', key: 'team-1-role', label: 'First person — role', type: 'text', default: 'Founder' },
      { group: 'Team', key: 'team-1-bio', label: 'First person — bio', type: 'longtext', default: 'Architects the systems and AI infrastructure behind every project.' },
      { group: 'Team', key: 'team-2-name', label: 'Second person — name', type: 'text', default: 'Biswash' },
      { group: 'Team', key: 'team-2-role', label: 'Second person — role', type: 'text', default: 'Co-Founder' },
      { group: 'Team', key: 'team-2-bio', label: 'Second person — bio', type: 'longtext', default: 'Builds the platforms, APIs and backend infrastructure that scale.' },
      { group: 'Team', key: 'team-3-name', label: 'Third person — name', type: 'text', default: 'Arpita' },
      { group: 'Team', key: 'team-3-role', label: 'Third person — role', type: 'text', default: 'Co-Founder' },
      { group: 'Team', key: 'team-3-bio', label: 'Third person — bio', type: 'longtext', default: 'Shapes the interfaces, user experience and visual identity across all products.' },

      { group: 'Closing call to action', key: 'cta-title', label: 'Heading', type: 'html', default: "Have a project in mind?<br>Let's <em>talk.</em>" },
      { group: 'Closing call to action', key: 'cta-subtitle', label: 'Standfirst', type: 'longtext', default: 'No pitch decks required. Tell us what you are building and we will tell you honestly whether we are the right fit.' }
    ]
  },

  about: {
    category: 'Site',
    label: 'About',
    path: '/about/',
    fields: [
      { group: 'Hero', key: 'about-hero-label', label: 'Eyebrow', type: 'text', default: 'Founder-led · In-house' },
      { group: 'Hero', key: 'about-hero-title', label: 'Headline', type: 'html', default: 'Founder-led engineering. <span class="grad">Built in-house.</span>' },
      { group: 'Hero', key: 'about-hero-subtitle', label: 'Standfirst', type: 'longtext', default: 'The Flow Labs is a three-person engineering studio. We design, build and ship interfaces, systems and applied intelligence — and you work with the people writing the code.' },

      { group: 'Story', key: 'about-body-1', label: 'Opening paragraph', type: 'longtext', default: 'The Flow Labs was founded on a straightforward principle: businesses deserve direct access to the engineers building their software. Instead of working through sales representatives and outsourced development teams, our clients collaborate directly with the founders who design and write the code. Droovee, our live chauffeur booking platform, is a product of this hands-on engineering approach.' },
      { group: 'Story', key: 'about-body-2', label: 'Where we work', type: 'longtext', default: 'We work remotely with teams across India and abroad, and meet in person when a project genuinely calls for it. Our studio address is on the contact page.' },
      { group: 'Story', key: 'about-body-3', label: 'How we work', type: 'longtext', default: 'We believe in transparency, rapid execution and technical craft. We agree on fixed pricing before code starts, demonstrate progress through weekly interactive builds, and deliver maintainable software that solves real operational problems.' }
    ]
  },

  contact: {
    category: 'Site',
    label: 'Contact',
    path: '/contact/',
    fields: [
      { group: 'Hero', key: 'contact-hero-label', label: 'Eyebrow', type: 'text', default: 'Direct response within 48 hours' },
      { group: 'Hero', key: 'contact-hero-title', label: 'Headline', type: 'text', default: 'Start a project with The Flow Labs' },
      { group: 'Hero', key: 'contact-hero-subtitle', label: 'Standfirst', type: 'longtext', default: 'Submit your requirements, send an email, or message us directly. We will review your project and reply within 48 hours with scope, timeline, and pricing.' },
      { group: 'Direct contact', key: 'contact-email', label: 'Email address', type: 'text', default: 'hello@theflowlabs.online' }
    ]
  },

  bhubaneswar: {
    category: 'Site',
    label: 'Bhubaneswar Studio',
    path: '/bhubaneswar/',
    fields: [
      { group: 'Hero', key: 'bhubaneswar-hero-label', label: 'Eyebrow', type: 'text', default: 'Bhubaneswar, Odisha · Local Presence' },
      { group: 'Hero', key: 'bhubaneswar-hero-title', label: 'Headline', type: 'html', default: 'Software engineering studio in <span class="grad">Bhubaneswar.</span>' },
      { group: 'Hero', key: 'bhubaneswar-hero-subtitle', label: 'Standfirst', type: 'longtext', default: 'Based in Odisha, building interfaces, platforms and AI systems for founders across India and abroad.' }
    ]
  },

  lab_report: {
    category: 'Site',
    label: 'Lab Report',
    path: '/lab-report/',
    fields: [
      { group: 'Hero', key: 'lab-hero-label', label: 'Eyebrow', type: 'text', default: 'Free performance audit' },
      { group: 'Hero', key: 'lab-hero-title', label: 'Headline', type: 'html', default: 'Free Website <span class="grad">Lab Report.</span>' },
      { group: 'Hero', key: 'lab-hero-subtitle', label: 'Standfirst', type: 'longtext', default: 'Instant check for speed, accessibility, mobile-readiness and technical SEO. No signup required.' }
    ]
  },

  /* ================= SERVICES ================= */
  services: {
    category: 'Services',
    label: 'Services Overview',
    path: '/services/',
    fields: [
      { group: 'Hero', key: 'services-hero-label', label: 'Eyebrow', type: 'text', default: 'Interfaces · Systems · Intelligence' },
      { group: 'Hero', key: 'services-hero-title', label: 'Headline', type: 'html', default: 'Engineering services, <span class="grad">built in-house.</span>' },
      { group: 'Hero', key: 'services-hero-subtitle', label: 'Standfirst', type: 'longtext', default: 'Three layers, one team. Open a layer to see what is actually inside it, what it costs to start, and the problem it is meant to solve.' }
    ]
  },

  services_web_dev: {
    category: 'Services',
    label: 'Web Development',
    path: '/services/web-development/',
    fields: [
      { group: 'Hero', key: 'webdev-hero-pill', label: 'Pill text', type: 'text', default: 'Interfaces · Web development' },
      { group: 'Hero', key: 'webdev-hero-h1', label: 'Headline', type: 'html', default: 'Websites and web apps that <span class="grad">earn their keep.</span>' },
      { group: 'Hero', key: 'webdev-hero-sub', label: 'Standfirst', type: 'longtext', default: 'Fast, polished, phone-first interfaces that turn visitors into enquiries. Built and maintained in-house with a fixed quote.' }
    ]
  },

  services_custom_software: {
    category: 'Services',
    label: 'Custom Software',
    path: '/services/custom-software-development/',
    fields: [
      { group: 'Hero', key: 'customsoft-hero-pill', label: 'Pill text', type: 'text', default: 'Systems · Custom software' },
      { group: 'Hero', key: 'customsoft-hero-h1', label: 'Headline', type: 'html', default: 'Software engineered for your <span class="grad">exact workflow.</span>' },
      { group: 'Hero', key: 'customsoft-hero-sub', label: 'Standfirst', type: 'longtext', default: 'Internal tools, client portals and business platforms designed to replace fragmented spreadsheets and legacy software.' }
    ]
  },

  services_ai_automation: {
    category: 'Services',
    label: 'AI Automation',
    path: '/services/ai-automation/',
    fields: [
      { group: 'Hero', key: 'aiauto-hero-pill', label: 'Pill text', type: 'text', default: 'Intelligence · AI Automation' },
      { group: 'Hero', key: 'aiauto-hero-h1', label: 'Headline', type: 'html', default: 'Automate repetitive workflows with <span class="grad">applied AI.</span>' },
      { group: 'Hero', key: 'aiauto-hero-sub', label: 'Standfirst', type: 'longtext', default: 'Practical AI pipelines that eliminate manual data entry, document triage and customer service bottlenecks.' }
    ]
  },

  services_ai_chatbot: {
    category: 'Services',
    label: 'AI Chatbots',
    path: '/services/ai-chatbot-development/',
    fields: [
      { group: 'Hero', key: 'aichat-hero-pill', label: 'Pill text', type: 'text', default: 'Intelligence · AI Chatbots' },
      { group: 'Hero', key: 'aichat-hero-h1', label: 'Headline', type: 'html', default: 'Intelligent assistants that <span class="grad">know your business.</span>' },
      { group: 'Hero', key: 'aichat-hero-sub', label: 'Standfirst', type: 'longtext', default: 'RAG-powered conversational bots grounded in your documentation, product catalog, and internal data.' }
    ]
  },

  /* ================= WORK ================= */
  work: {
    category: 'Work',
    label: 'Work Overview',
    path: '/work/',
    fields: [
      { group: 'Hero', key: 'work-hero-label', label: 'Eyebrow', type: 'text', default: 'Shipped Products & Case Studies' },
      { group: 'Hero', key: 'work-hero-title', label: 'Headline', type: 'html', default: 'Systems shipped, <span class="grad">problems solved.</span>' },
      { group: 'Hero', key: 'work-hero-subtitle', label: 'Standfirst', type: 'longtext', default: 'Real software built for real businesses. Inspect the architecture, the timeline, and the operational outcome.' }
    ]
  },

  work_droovee: {
    category: 'Work',
    label: 'Droovee',
    path: '/work/droovee/',
    fields: [
      { group: 'Hero', key: 'droovee-hero-pill', label: 'Pill text', type: 'text', default: 'Case study · Live platform' },
      { group: 'Hero', key: 'droovee-hero-h1', label: 'Headline', type: 'html', default: 'Droovee — On-demand <span class="grad">chauffeur platform.</span>' },
      { group: 'Hero', key: 'droovee-hero-sub', label: 'Standfirst', type: 'longtext', default: 'Full-stack booking engine, driver dispatch system and admin control panel shipped in 6 weeks.' }
    ]
  },

  work_bhuverify: {
    category: 'Work',
    label: 'BhuVerify',
    path: '/work/bhuverify/',
    fields: [
      { group: 'Hero', key: 'bhuverify-hero-pill', label: 'Pill text', type: 'text', default: 'Case study · Verification system' },
      { group: 'Hero', key: 'bhuverify-hero-h1', label: 'Headline', type: 'html', default: 'BhuVerify — Digital <span class="grad">document validation.</span>' },
      { group: 'Hero', key: 'bhuverify-hero-sub', label: 'Standfirst', type: 'longtext', default: 'Tamper-evident verification portal using QR cryptography and automated verification workflows.' }
    ]
  },

  work_carbon_coach: {
    category: 'Work',
    label: 'Carbon Coach',
    path: '/work/carbon-coach/',
    fields: [
      { group: 'Hero', key: 'carbon-hero-pill', label: 'Pill text', type: 'text', default: 'Case study · Open Source' },
      { group: 'Hero', key: 'carbon-hero-h1', label: 'Headline', type: 'html', default: 'Carbon Coach — Personal <span class="grad">emissions tracker.</span>' },
      { group: 'Hero', key: 'carbon-hero-sub', label: 'Standfirst', type: 'longtext', default: 'Phone-first carbon footprint calculation engine with actionable lifestyle recommendations.' }
    ]
  },

  work_drishti: {
    category: 'Work',
    label: 'Drishti',
    path: '/work/drishti/',
    fields: [
      { group: 'Hero', key: 'drishti-hero-pill', label: 'Pill text', type: 'text', default: 'Case study · Computer Vision' },
      { group: 'Hero', key: 'drishti-hero-h1', label: 'Headline', type: 'html', default: 'Drishti — Real-time <span class="grad">vision intelligence.</span>' },
      { group: 'Hero', key: 'drishti-hero-sub', label: 'Standfirst', type: 'longtext', default: 'Edge-deployed object detection and anomaly alerting system for industrial facilities.' }
    ]
  },

  work_flowops: {
    category: 'Work',
    label: 'FlowOps',
    path: '/work/flowops/',
    fields: [
      { group: 'Hero', key: 'flowops-hero-pill', label: 'Pill text', type: 'text', default: 'Case study · Internal Tools' },
      { group: 'Hero', key: 'flowops-hero-h1', label: 'Headline', type: 'html', default: 'FlowOps — Developer <span class="grad">operations dashboard.</span>' },
      { group: 'Hero', key: 'flowops-hero-sub', label: 'Standfirst', type: 'longtext', default: 'Single-pane monitoring console unifying staging previews, deploy hooks and database metrics.' }
    ]
  },

  work_interview_copilot: {
    category: 'Work',
    label: 'Interview Copilot',
    path: '/work/interview-copilot/',
    fields: [
      { group: 'Hero', key: 'copilot-hero-pill', label: 'Pill text', type: 'text', default: 'Case study · Applied AI' },
      { group: 'Hero', key: 'copilot-hero-h1', label: 'Headline', type: 'html', default: 'Interview Copilot — AI-assisted <span class="grad">technical screening.</span>' },
      { group: 'Hero', key: 'copilot-hero-sub', label: 'Standfirst', type: 'longtext', default: 'Automated candidate coding assessment with real-time feedback and structured scoring rubrics.' }
    ]
  },

  work_qr_platform: {
    category: 'Work',
    label: 'QR Platform',
    path: '/work/qr-platform/',
    fields: [
      { group: 'Hero', key: 'qr-hero-pill', label: 'Pill text', type: 'text', default: 'Case study · SaaS' },
      { group: 'Hero', key: 'qr-hero-h1', label: 'Headline', type: 'html', default: 'Dynamic QR Engine & <span class="grad">Analytics Portal.</span>' },
      { group: 'Hero', key: 'qr-hero-sub', label: 'Standfirst', type: 'longtext', default: 'Vector QR generator with dynamic redirection endpoints and real-time scan telemetry.' }
    ]
  },

  /* ================= BLOG ================= */
  blog_index: {
    category: 'Blog',
    label: 'Blog Index',
    path: '/blog/',
    fields: [
      { group: 'Hero', key: 'blog-hero-label', label: 'Eyebrow', type: 'text', default: 'Engineering Notes & Field Reports' },
      { group: 'Hero', key: 'blog-hero-title', label: 'Headline', type: 'html', default: 'Writing from the <span class="grad">build trenches.</span>' },
      { group: 'Hero', key: 'blog-hero-subtitle', label: 'Standfirst', type: 'longtext', default: 'Architecture notes, cost breakdowns, and transparent post-mortems from an in-house studio.' }
    ]
  },

  /* ================= LEGAL ================= */
  privacy: {
    category: 'Legal',
    label: 'Privacy Policy',
    path: '/privacy-policy/',
    fields: [
      { group: 'Hero', key: 'privacy-hero-title', label: 'Headline', type: 'text', default: 'Privacy Policy' },
      { group: 'Hero', key: 'privacy-hero-subtitle', label: 'Intro', type: 'longtext', default: 'How The Flow Labs collects, handles and protects visitor and client information.' }
    ]
  },

  terms: {
    category: 'Legal',
    label: 'Terms of Service',
    path: '/terms/',
    fields: [
      { group: 'Hero', key: 'terms-hero-title', label: 'Headline', type: 'text', default: 'Terms of Service' },
      { group: 'Hero', key: 'terms-hero-subtitle', label: 'Intro', type: 'longtext', default: 'Terms governing our software engineering contracts, milestone handovers, and intellectual property.' }
    ]
  }
};

/* Homepage blocks that can be switched off from Settings. */
window.SECTION_LABELS = {
  section_home_work: {
    label: 'Selected work',
    note: 'The client work grid with project previews.'
  },
  section_home_process: {
    label: 'Process',
    note: 'The step-by-step build sequence.'
  },
  section_home_faq: {
    label: 'FAQ',
    note: 'Questions with expandable answers.'
  },
  section_home_team: {
    label: 'Team',
    note: 'The three founder cards.'
  },
  section_home_testimonials: {
    label: 'Testimonials',
    note: 'Client quotes.'
  },
  section_home_cta: {
    label: 'Closing call to action',
    note: 'The final contact prompt before the footer.'
  }
};

window.SETTINGS_DEFAULTS = {
  accent_color: '#3B82F6',
  section_home_work: 'on',
  section_home_process: 'on',
  section_home_faq: 'on',
  section_home_team: 'on',
  section_home_testimonials: 'on',
  section_home_cta: 'on',
  slot_month: '2026-12',
  slot_total: '4',
  slot_taken: '2',
  seo_title_home: 'The Flow Labs — Interfaces, Systems & Intelligence',
  seo_description_home: 'A founder-led engineering studio building interfaces, systems and intelligence for growing businesses. Fixed price before code. Four builds a month.',
  seo_title_about: 'About — A Three-Person Engineering Studio | The Flow Labs',
  seo_description_about: 'Meet The Flow Labs: Smruti Ranjan (Founder), Biswash and Arpita (Co-Founders). A three-person studio building interfaces, systems and AI in-house.',
  seo_title_services: 'Services — Interfaces, Systems & Intelligence | The Flow Labs',
  seo_description_services: 'Websites, custom software and AI automation from one founder-led team — each project priced individually with a fixed quote before code.',
  seo_title_contact: 'Contact — Start a Project | The Flow Labs',
  seo_description_contact: 'Tell The Flow Labs what you are building: a website, a system or an AI workflow. Two December build slots open, honest 48-hour reply from the founders.',
  seo_title_bhubaneswar: 'Bhubaneswar Studio — Web & Custom Software | The Flow Labs',
  seo_description_bhubaneswar: 'Engineering studio in Bhubaneswar, Odisha. We design and build websites, platforms and AI systems for founders across India and abroad.',
  seo_title_lab_report: 'Free Website Lab Report — Speed, Accessibility & SEO | The Flow Labs',
  seo_description_lab_report: 'Scan any URL and get a plain-English score for speed, accessibility and search readiness. Free, no signup, no email gate.',
  seo_title_work: 'Selected Work & Case Studies | The Flow Labs',
  seo_description_work: 'Inspect real platforms, systems and AI workflows engineered and shipped by The Flow Labs.',
  seo_title_blog: 'Engineering Notes & Field Reports | The Flow Labs',
  seo_description_blog: 'Notes on software craft, system architecture, and AI integration from the founders of The Flow Labs.',
  seo_title_privacy: 'Privacy Policy | The Flow Labs',
  seo_description_privacy: 'Plain-English privacy policy for The Flow Labs visitors and clients.',
  seo_title_terms: 'Terms of Service | The Flow Labs',
  seo_description_terms: 'Terms of service, milestone agreements and intellectual property handover policies.'
};
