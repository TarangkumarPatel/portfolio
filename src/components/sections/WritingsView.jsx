"use client";
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowLeft, Clock, ExternalLink } from 'lucide-react';
import { PageTransition, textReveal, fadeUp } from '@/components/ui/SharedUI';
import { renderMarkdown, readingTime } from '@/lib/renderMarkdown';

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const hasBody = (post) => Boolean(post.content?.trim());

const PostMeta = ({ post, className = '' }) => (
  <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono uppercase tracking-wide text-gray-500 ${className}`}>
    <span className="text-orange-400">{post.category}</span>
    <span>·</span>
    <span>{formatDate(post.publishedAt)}</span>
    {hasBody(post) && (
      <>
        <span>·</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {readingTime(post.content)} min read</span>
      </>
    )}
  </div>
);

const Reader = ({ post, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[300] bg-[#050505]/95 backdrop-blur-xl overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={post.title}
    >
      <motion.article
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto px-6 pt-10 pb-32"
      >
        <button onClick={onClose} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to writings
        </button>

        <PostMeta post={post} className="mb-5" />
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-6">{post.title}</h1>
        {post.summary && <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-8">{post.summary}</p>}

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {post.tags.map(t => (
              <span key={t} className="text-[10px] font-mono uppercase tracking-wide px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400">{t}</span>
            ))}
          </div>
        )}

        {post.coverImageUrl && (
          <img src={post.coverImageUrl} alt="" className="w-full aspect-[16/9] object-cover rounded-2xl border border-white/10 mb-10" />
        )}

        <div className="text-base md:text-[17px]">{renderMarkdown(post.content)}</div>

        {post.externalUrl && (
          <a href={post.externalUrl} target="_blank" rel="noreferrer" className="mt-12 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-orange-400 transition-colors">
            Read the original <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </motion.article>
    </motion.div>
  );
};

const WritingsView = ({ blogs = [] }) => {
  const [category, setCategory] = useState('All');
  const [openPost, setOpenPost] = useState(null);

  const published = useMemo(
    () => blogs
      .filter(b => b.status !== 'draft')
      .sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || ''))),
    [blogs]
  );

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(published.map(b => b.category).filter(Boolean)))],
    [published]
  );

  const filtered = category === 'All' ? published : published.filter(b => b.category === category);
  const [featured, ...rest] = filtered;

  const closeReader = useCallback(() => setOpenPost(null), []);

  const openItem = (post) => {
    if (hasBody(post)) setOpenPost(post);
    else if (post.externalUrl) window.open(post.externalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageTransition className="max-w-6xl mx-auto flex-col items-start justify-start w-full">
      <div className="mb-10 md:mb-12 w-full flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="overflow-hidden text-center md:text-left">
          <motion.h2 variants={textReveal} className="font-display text-5xl md:text-7xl font-bold text-white tracking-tight">
            Notes &amp; <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Research.</span>
          </motion.h2>
        </div>
        {categories.length > 2 && (
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center md:justify-end gap-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`relative px-4 py-2 rounded-full text-xs font-medium transition-colors duration-300 ${category === c ? 'text-black' : 'text-gray-400 hover:text-white border border-white/10'}`}
              >
                {category === c && (
                  <motion.span layoutId="writings-filter" className="absolute inset-0 bg-white rounded-full" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                )}
                <span className="relative z-10">{c}</span>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {featured ? (
        <div className="w-full space-y-6">
          <motion.button
            variants={fadeUp}
            key={`featured-${featured.id}`}
            onClick={() => openItem(featured)}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="group w-full text-left grid grid-cols-1 md:grid-cols-5 gap-0 rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02] hover:border-orange-500/40 transition-colors"
          >
            <div className="md:col-span-2 relative aspect-[16/10] md:aspect-auto md:min-h-[300px] bg-gradient-to-br from-orange-500/20 via-zinc-900 to-rose-500/10 overflow-hidden">
              {featured.coverImageUrl ? (
                <img src={featured.coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-[0.16,1,0.3,1]" />
              ) : (
                <span className="absolute bottom-4 left-5 font-display text-7xl font-bold text-white/10 select-none">{featured.category}</span>
              )}
              <span className="absolute top-4 left-4 text-[10px] font-mono uppercase tracking-widest text-orange-300 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">Latest</span>
            </div>
            <div className="md:col-span-3 p-6 md:p-10 flex flex-col justify-center">
              <PostMeta post={featured} className="mb-4" />
              <h3 className="font-display text-2xl md:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-orange-50 transition-colors">{featured.title}</h3>
              {featured.summary && <p className="text-gray-400 text-sm md:text-base leading-relaxed line-clamp-3 mb-6">{featured.summary}</p>}
              <span className="flex items-center gap-2 text-sm font-medium text-white group-hover:text-orange-400 transition-colors">
                {hasBody(featured) ? 'Read' : 'Read externally'} <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>
          </motion.button>

          {rest.length > 0 && (
            <div className="border-t border-white/10">
              {rest.map(post => (
                <motion.button
                  variants={fadeUp}
                  key={post.id}
                  onClick={() => openItem(post)}
                  className="group w-full text-left flex items-start md:items-center gap-4 md:gap-8 py-6 md:py-7 border-b border-white/10 hover:bg-white/[0.02] transition-colors px-1 md:px-4"
                >
                  <span className="hidden md:block w-28 shrink-0 text-xs font-mono text-gray-500">{formatDate(post.publishedAt)}</span>
                  <div className="flex-1 min-w-0">
                    <PostMeta post={post} className="mb-2 md:hidden" />
                    <h4 className="font-display text-lg md:text-xl font-semibold text-white group-hover:text-orange-400 transition-colors">{post.title}</h4>
                    {post.summary && <p className="text-gray-500 text-sm mt-1 line-clamp-2 md:line-clamp-1">{post.summary}</p>}
                  </div>
                  <span className="hidden md:inline text-[10px] font-mono uppercase tracking-wide px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400 shrink-0">{post.category}</span>
                  <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1 md:mt-0" />
                </motion.button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <motion.div variants={fadeUp} className="w-full rounded-3xl border border-dashed border-white/10 py-20 px-6 text-center">
          <p className="text-white/70 font-display text-xl mb-2">Writing in progress.</p>
          <p className="text-gray-500 text-sm">Blogs, research notes and technical write-ups will show up here soon.</p>
        </motion.div>
      )}

      {/* Portaled so the reader escapes the page's transformed, z-indexed container and covers the nav */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {openPost && <Reader key={openPost.id} post={openPost} onClose={closeReader} />}
        </AnimatePresence>,
        document.body
      )}
    </PageTransition>
  );
};

export default WritingsView;
