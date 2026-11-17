/* The Flow Labs — CMS field registry shared by the admin panel.
   Keys must match data-cms attributes in the generated HTML. */
window.CONTENT_SCHEMA = {
  home: {
    label: 'Home',
    path: '/',
    fields: [
      { key: 'hero-label', label: 'Hero eyebrow', type: 'text', default: 'Interfaces · Systems · Intelligence' },
      { key: 'hero-title', label: 'Hero title (HTML allowed)', type: 'longtext', default: 'If it lives on<br>a screen, we<br>build <em>it.</em>' },
      { key: 'hero-subtitle', label: 'Hero subtitle', type: 'longtext', default: 'A founder-led studio that designs the interface, engineers the system, and wires in the intelligence. One team, fixed price, no handoffs.' },
      { key: 'services-title', label: 'Services title (HTML allowed)', type: 'text', default: 'Three layers. <em>One team.</em>' },
      { key: 'services-subtitle', label: 'Services subtitle', type: 'longtext', default: 'Open a layer to see what is inside it. Most projects need one. The good ones end up using all three.' },
      { key: 'team-1-name', label: 'Team 1 name', type: 'text', default: 'Smruti Ranjan' },
      { key: 'team-1-role', label: 'Team 1 role', type: 'text', default: 'Founder' },
      { key: 'team-1-bio', label: 'Team 1 bio', type: 'longtext', default: 'Architects the systems and AI infrastructure behind every project.' },
      { key: 'team-2-name', label: 'Team 2 name', type: 'text', default: 'Biswash' },
      { key: 'team-2-role', label: 'Team 2 role', type: 'text', default: 'Co-Founder' },
      { key: 'team-2-bio', label: 'Team 2 bio', type: 'longtext', default: 'Builds the platforms, APIs and backend infrastructure that scale.' },
      { key: 'team-3-name', label: 'Team 3 name', type: 'text', default: 'Arpita' },
      { key: 'team-3-role', label: 'Team 3 role', type: 'text', default: 'Co-Founder' },
      { key: 'team-3-bio', label: 'Team 3 bio', type: 'longtext', default: 'Shapes the interfaces, user experience and visual identity across all products.' },
      { key: 'cta-title', label: 'Contact CTA title (HTML allowed)', type: 'longtext', default: "Have a project in mind?<br>Let's <em>talk.</em>" },
      { key: 'cta-subtitle', label: 'Contact CTA subtitle', type: 'longtext', default: "No pitch decks required. Tell us what you are building and we will tell you honestly whether we are the right fit." }
    ]
  },
  about: {
    label: 'About',
    path: '/about/',
    fields: [
      { key: 'about-hero-label', label: 'Hero eyebrow', type: 'text', default: 'Founder-led · In-house' },
      { key: 'about-hero-title', label: 'Hero title (HTML allowed)', type: 'text', default: 'Founder-led engineering. <span class="grad">Built in-house.</span>' },
      { key: 'about-hero-subtitle', label: 'Hero subtitle', type: 'longtext', default: 'The Flow Labs is a three-person engineering studio. We design, build and ship interfaces, systems and applied intelligence — and you work with the people writing the code.' },
      { key: 'about-body-1', label: 'Intro paragraph', type: 'longtext', default: 'The Flow Labs was founded on a straightforward principle: businesses deserve direct access to the engineers building their software. Instead of working through sales representatives and outsourced development teams, our clients collaborate directly with the founders who design and write the code. Droovee, our live chauffeur booking platform, is a product of this hands-on engineering approach.' },
      { key: 'about-body-2', label: 'Location paragraph', type: 'longtext', default: 'We work remotely with teams across India and abroad, and meet in person when a project genuinely calls for it. Our studio address is on the contact page.' },
      { key: 'about-body-3', label: 'Approach paragraph', type: 'longtext', default: 'We believe in transparency, rapid execution and technical craft. We agree on fixed pricing before code starts, demonstrate progress through weekly interactive builds, and deliver maintainable software that solves real operational problems.' }
    ]
  },
  services: {
    label: 'Services',
    path: '/services/',
    fields: [
      { key: 'services-hero-label', label: 'Hero eyebrow', type: 'text', default: 'Interfaces · Systems · Intelligence' },
      { key: 'services-hero-title', label: 'Hero title (HTML allowed)', type: 'text', default: 'Engineering services, <span class="grad">built in-house.</span>' },
      { key: 'services-hero-subtitle', label: 'Hero subtitle', type: 'longtext', default: 'Three layers, one team. Open a layer to see what is actually inside it, what it costs to start, and the problem it is meant to solve.' }
    ]
  },
  contact: {
    label: 'Contact',
    path: '/contact/',
    fields: [
      { key: 'contact-hero-label', label: 'Hero eyebrow', type: 'text', default: 'Direct response within 48 hours' },
      { key: 'contact-hero-title', label: 'Hero title', type: 'text', default: 'Start a project with The Flow Labs' },
      { key: 'contact-hero-subtitle', label: 'Hero subtitle', type: 'longtext', default: 'Submit your requirements, send an email, or message us directly. We will review your project and reply within 48 hours with scope, timeline, and pricing.' },
      { key: 'contact-email', label: 'Contact email', type: 'text', default: 'hello@theflowlabs.online' }
    ]
  }
};

window.SETTINGS_DEFAULTS = {
  accent_color: '#6EA8FF',
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
