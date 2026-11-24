export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  date: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  content: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-plan-a-website-for-a-new-startup',
    title: 'How to Plan a Website for a New Startup',
    description: 'How to plan a startup website that actually gets you customers: primary jobs, must-have pages, conversion copy, budget realities, and common traps.',
    category: 'Web Strategy',
    readTime: '6 min read',
    date: 'November 2026',
    author: {
      name: 'Smruti Ranjan',
      role: 'Founder',
      avatar: 'SR',
    },
    content: [
      'Most startup websites fail not because the code is bad, but because they treat the website like a digital brochure instead of an automated sales pipeline.',
      'The single primary job of a startup homepage is to answer three questions in under 5 seconds: What do you do? Who is it for? And what should I click right now?',
      'Avoid high-concept vague slogans like "Reimagining the future of cloud synergy". Be literal. If you build AI WhatsApp bots for car dealerships, say exactly that.',
      'A successful startup site needs five core pages: Home (value proposition + proof), Services/Product (exact architecture + capabilities), Work/Proof (real case studies with metrics), Pricing/Scoping (fixed expectations), and Contact/Direct Access.',
    ],
  },
  {
    slug: 'custom-software-vs-ready-made-software',
    title: 'Custom Software vs Ready-Made Software: The Reality',
    description: 'Custom software versus off-the-shelf SaaS compared honestly: long-term cost curves, schema ownership, timelines, and the five questions that decide it.',
    category: 'Systems & Architecture',
    readTime: '8 min read',
    date: 'November 2026',
    author: {
      name: 'Biswash',
      role: 'Co-Founder',
      avatar: 'BW',
    },
    content: [
      'Every growing company hits a crossroads: do we keep duct-taping off-the-shelf SaaS tools together with Zapier, or is it time to build our own proprietary platform?',
      'Off-the-shelf SaaS is fast to start, but over 2-3 years, subscription costs compound exponentially. More critically, you do not own your database schema or your user workflow.',
      'When your operational process is your competitive advantage (like proprietary dispatching, custom pricing tiers, or unique inventory flows), ready-made software forces you to work like your competitors.',
      'Custom software with modern stacks (Next.js, Supabase, PostgreSQL) can now be shipped in 3 to 4 weeks at fixed cost, making it viable far earlier in a company’s lifecycle than in the previous decade.',
    ],
  },
  {
    slug: 'ai-automation-for-small-businesses',
    title: 'How Small Businesses Can Actually Use AI Automation',
    description: 'AI automation explained practically: what to automate first, what to leave to humans, and realistic cost benchmarks without AI buzzword hype.',
    category: 'Applied AI',
    readTime: '5 min read',
    date: 'November 2026',
    author: {
      name: 'Arpita',
      role: 'Co-Founder',
      avatar: 'AP',
    },
    content: [
      'Small business owners are bombarded with AI hype, but 90% of it is theoretical. Practical AI is not about replacing your team; it is about eliminating manual data entry, slow customer replies, and lost leads.',
      'The highest ROI AI implementation in 2026 is automated WhatsApp conversation workflows. Connecting official Meta Cloud APIs to local LLMs allows businesses to qualify inbound leads 24/7 without paying an overseas call center.',
      'Another quick win is semantic search across internal manuals or catalog PDFs. Instead of searching exact filenames, your team can query in plain language and get verified citations in 200ms.',
      'Rule of thumb: Never automate the closing call with a high-ticket client. Automate the friction: scheduling, initial qualification, invoice generation, and follow-up reminders.',
    ],
  },
];
