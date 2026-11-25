import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, ArrowRight } from 'lucide-react';
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
    <article className="pt-32 pb-24 px-4 sm:px-6 max-w-3xl mx-auto space-y-10">
      
      {/* Back button */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to all articles</span>
      </Link>

      {/* Title & Metadata Header */}
      <header className="space-y-4 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono text-xs">
          {post.category}
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-medium text-white tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-mono text-[10px] text-white">
              {post.author.avatar}
            </div>
            <span>{post.author.name} · {post.author.role}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{post.readTime}</span>
          </div>
        </div>
      </header>

      {/* Article Body */}
      <div className="space-y-5 text-slate-300 text-base leading-relaxed font-body">
        {post.content.map((paragraph, idx) => (
          <p key={idx} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Bottom CTA Box */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5 mt-12">
        <div>
          <h3 className="font-display text-lg font-medium text-white">Want to implement this in your stack?</h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            We scope and build custom applications with fixed-price transparency.
          </p>
        </div>
        <Link
          href="/scoping"
          className="inline-flex items-center gap-1.5 bg-white text-[#07090E] font-medium text-xs sm:text-sm px-5 py-2.5 rounded-full hover:bg-slate-200 transition-colors whitespace-nowrap"
        >
          <span>Scope your project</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </article>
  );
}
