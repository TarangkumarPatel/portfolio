"use client";
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { PageTransition, textReveal, fadeUp } from '@/components/ui/SharedUI';

const LinkedinIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.44-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
  </svg>
);

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

const TestimonialCard = ({ t }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showAvatar = t.avatarUrl && !imgFailed;

  return (
    <motion.div variants={fadeUp} className="group relative rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 p-6 md:p-8 flex flex-col">
      <p className="text-gray-200 text-sm md:text-base leading-relaxed flex-1 mb-6">
        &ldquo;{t.message}&rdquo;
      </p>
      <div className="flex items-center gap-4 pt-4 border-t border-white/5">
        {showAvatar ? (
          <img
            src={t.avatarUrl}
            alt={t.name}
            onError={() => setImgFailed(true)}
            className="w-12 h-12 rounded-full object-cover shrink-0 border border-white/10"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-300 font-semibold text-sm shrink-0">
            {initials(t.name) || '?'}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-white font-semibold text-sm">{t.name}</h4>
            {t.linkedinUrl && (
              <a href={t.linkedinUrl} target="_blank" rel="noreferrer" aria-label={`${t.name} on LinkedIn`} className="text-gray-500 hover:text-orange-400 transition-colors shrink-0">
                <LinkedinIcon className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <p className="text-gray-400 text-xs truncate">{t.title}{t.organization ? ` · ${t.organization}` : ''}</p>
          {t.email && (
            <a href={`mailto:${t.email}`} className="text-gray-400 text-xs hover:text-orange-400 transition-colors block mt-0.5">
              {t.email}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const TestimonialsView = ({ testimonials = [] }) => {
  const approved = useMemo(
    () => testimonials
      .filter(t => t.status === 'approved')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || new Date(a.createdAt) - new Date(b.createdAt)),
    [testimonials]
  );

  return (
    <PageTransition className="max-w-7xl mx-auto flex-col items-start justify-start w-full">
      <div className="mb-10 md:mb-12 w-full flex flex-col md:flex-row md:items-end md:justify-between gap-6 text-center md:text-left">
        <motion.h2 variants={textReveal} className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight">
          Words from <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">the People I&apos;ve Worked With.</span>
        </motion.h2>
        <motion.div variants={fadeUp}>
          <Link
            href="/testimonials/submit"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-orange-500/50 rounded-full px-5 py-2.5 transition-all shrink-0"
          >
            Give a testimonial <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {approved.map((t) => <TestimonialCard key={t.id} t={t} />)}
        {approved.length === 0 && (
          <div className="text-white/50 text-center py-20 col-span-full">No testimonials published yet.</div>
        )}
      </div>
    </PageTransition>
  );
};

export default TestimonialsView;
