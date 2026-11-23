/* The Flow Labs — CMS field registry shared by the admin panel.
   Keys must match data-cms attributes in the generated HTML.
   `group` controls how the Content screen blocks the fields together. */

window.CONTENT_SCHEMA = {
  home: {
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
      { group: 'Team', key: 'team-1-bio', label: 'First person — one line', type: 'longtext', default: 'Architects the systems and AI infrastructure behind every project.' },
      { group: 'Team', key: 'team-2-name', label: 'Second person — name', type: 'text', default: 'Biswash' },
      { group: 'Team', key: 'team-2-role', label: 'Second person — role', type: 'text', default: 'Co-Founder' },
      { group: 'Team', key: 'team-2-bio', label: 'Second person — one line', type: 'longtext', default: 'Builds the platforms, APIs and backend infrastructure that scale.' },
      { group: 'Team', key: 'team-3-name', label: 'Third person — name', type: 'text', default: 'Arpita' },
      { group: 'Team', key: 'team-3-role', label: 'Third person — role', type: 'text', default: 'Co-Founder' },
      { group: 'Team', key: 'team-3-bio', label: 'Third person — one line', type: 'longtext', default: 'Shapes the interfaces, user experience and visual identity across all products.' },

      { group: 'Closing call to action', key: 'cta-title', label: 'Heading', type: 'html', default: "Have a project in mind?<br>Let's <em>talk.</em>" },
      { group: 'Closing call to action', key: 'cta-subtitle', label: 'Standfirst', type: 'longtext', default: 'No pitch decks required. Tell us what you are building and we will tell you honestly whether we are the right fit.' }
    ]
  },
  about: {
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
  services: {
    label: 'Services',
    path: '/services/',
    fields: [
      { group: 'Hero', key: 'services-hero-label', label: 'Eyebrow', type: 'text', default: 'Interfaces · Systems · Intelligence' },
      { group: 'Hero', key: 'services-hero-title', label: 'Headline', type: 'html', default: 'Engineering services, <span class="grad">built in-house.</span>' },
      { group: 'Hero', key: 'services-hero-subtitle', label: 'Standfirst', type: 'longtext', default: 'Three layers, one team. Open a layer to see what is actually inside it, what it costs to start, and the problem it is meant to solve.' }
    ]
  },
  contact: {
    label: 'Contact',
    path: '/contact/',
    fields: [
      { group: 'Hero', key: 'contact-hero-label', label: 'Eyebrow', type: 'text', default: 'Direct response within 48 hours' },
      { group: 'Hero', key: 'contact-hero-title', label: 'Headline', type: 'text', default: 'Start a project with The Flow Labs' },
      { group: 'Hero', key: 'contact-hero-subtitle', label: 'Standfirst', type: 'longtext', default: 'Submit your requirements, send an email, or message us directly. We will review your project and reply within 48 hours with scope, timeline, and pricing.' },

      { group: 'Direct contact', key: 'contact-email', label: 'Email address', type: 'text', default: 'hello@theflowlabs.online' }
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
  seo_title_lab_report: 'Free Website Lab Report — Speed, Accessibility & SEO | The Flow Labs',
  seo_description_lab_report: 'Scan any URL and get a plain-English score for speed, accessibility and search readiness. Free, no signup, no email gate.'
};
