import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, User, ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/posts';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: 'Article Not Found' };

  return {
    title: `${post.title} | The Flow Labs Engineering Blog`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="pt-36 pb-24 px-4 sm:px-6 max-w-4xl mx-auto space-y-12">
      
      {/* Back button */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-neon-cyan transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Articles</span>
      </Link>

      {/* Title & Metadata Header */}
      <header className="space-y-6 border-b border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan font-mono text-xs font-semibold">
          {post.category}
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-white">
              {post.author.avatar}
            </div>
            <span>{post.author.name} · {post.author.role}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{post.readTime}</span>
          </div>
        </div>
      </header>

      {/* Article Body */}
      <div className="space-y-6 text-slate-300 text-base sm:text-lg leading-relaxed font-body">
        {post.content.map((paragraph, idx) => (
          <p key={idx} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Bottom CTA Box */}
      <div className="p-8 rounded-3xl bg-surface-card border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 mt-16">
        <div>
          <h3 className="font-display text-xl font-bold text-white">Want to implement this in your stack?</h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            We scope and build custom applications with fixed-price transparency.
          </p>
        </div>
        <Link
          href="/scoping"
          className="inline-flex items-center gap-2 bg-white text-[#07090E] font-semibold text-xs sm:text-sm px-6 py-3 rounded-full hover:bg-slate-200 transition-all shadow-[0_4px_15px_rgba(255,255,255,0.2)] whitespace-nowrap"
        >
          <span>Scope Your Project</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </article>
  );
}
