import Link from 'next/link';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/posts';

export const metadata = {
  title: 'Blog — Engineering Perspectives & Code | The Flow Labs',
  description: 'Practical articles on AI automation, software architecture, websites, and custom engineering. Written by the founders from production experience.',
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogPage() {
  return (
    <div className="pt-28 pb-28 px-4 sm:px-6 max-w-6xl mx-auto space-y-24">
      
      {/* Header */}
      <section className="max-w-3xl space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-slate-300 font-mono text-xs">
          <BookOpen className="w-3.5 h-3.5 text-slate-300" />
          <span>Engineering publication</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-normal text-white tracking-tight leading-[1.08]">
          Practical engineering perspectives straight from production.
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl">
          Zero generic marketing copy. Practical analyses on software architecture, performance optimization, and custom software systems written directly by our three founders.
        </p>
      </section>

      {/* Articles Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="p-7 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 text-[11px]">
                  {post.category}
                </span>
                <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
              </div>

              <h2 className="font-display text-xl font-normal text-white leading-snug">
                <Link href={`/blog/${post.slug}`} className="hover:text-slate-200 transition-colors">
                  {post.title}
                </Link>
              </h2>

              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {post.description}
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-[10px] text-slate-300">
                  {post.author.avatar}
                </div>
                <div>
                  <div className="text-xs font-medium text-white">{post.author.name}</div>
                  <div className="text-[10px] font-mono text-slate-500">{post.date}</div>
                </div>
              </div>

              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white transition-colors"
              >
                <span>Read article</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </section>

    </div>
  );
}
