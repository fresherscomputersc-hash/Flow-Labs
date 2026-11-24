import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Tag } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/posts';

export const metadata = {
  title: 'Blog — Engineering Perspectives & Code | The Flow Labs',
  description: 'Practical articles on AI automation, software architecture, websites and custom engineering. Written by the founders from production experience.',
};

export default function BlogPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-20">
      
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-neon-cyan font-mono text-xs uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          Engineering Publication
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-bold text-white tracking-tight">
          Practical perspectives.<br />
          <span className="bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
            Straight from production.
          </span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          No generic AI-generated fluff. Practical insights on software architecture, performance optimization, and custom software development written directly by our founders.
        </p>
      </section>

      {/* Articles Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="p-7 rounded-3xl bg-surface-card border border-white/10 backdrop-blur-xl hover:border-white/25 transition-all flex flex-col justify-between space-y-6 group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2.5 py-1 rounded-md bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan font-semibold">
                  {post.category}
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime}
                </span>
              </div>

              <h2 className="font-display text-2xl font-bold text-white group-hover:text-neon-cyan transition-colors leading-snug">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>

              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {post.description}
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-mono text-xs text-white font-bold">
                  {post.author.avatar}
                </div>
                <div>
                  <div className="text-xs font-medium text-white">{post.author.name}</div>
                  <div className="text-[10px] font-mono text-slate-500">{post.date}</div>
                </div>
              </div>

              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-neon-cyan hover:text-white transition-colors"
              >
                <span>Read</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </section>

      {/* Editorial Standard Banner */}
      <section className="p-8 sm:p-12 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <span className="font-mono text-xs text-neon-cyan uppercase tracking-wider font-semibold">Editorial Standard</span>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-1">Reading is nice. Building is better.</h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            When you're ready to turn architecture into production code, tell us what you want to build and we will scope it with upfront fixed pricing.
          </p>
        </div>
        <Link
          href="/scoping"
          className="inline-flex items-center gap-2 bg-white text-[#07090E] font-semibold text-xs sm:text-sm px-6 py-3 rounded-full hover:bg-slate-200 transition-all shadow-[0_4px_15px_rgba(255,255,255,0.2)] whitespace-nowrap"
        >
          <span>Open Scoping Cockpit &rarr;</span>
        </Link>
      </section>

    </div>
  );
}
