"use client";
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageTransition, textReveal, fadeUp } from '@/components/ui/SharedUI';

const GithubIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const getTech = (p) => p.tech || p.techStack || [];

const ProjectsView = ({ projects }) => {
  const [hovered, setHovered] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const trackRef = useRef(null);
  const cardRefs = useRef({});

  const scrollByCard = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('[data-carousel-card]');
    const step = card ? card.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [projects]);

  const updateActiveCard = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let closest = null;
    let closestDist = Infinity;
    sortedProjects.forEach((p) => {
      const el = cardRefs.current[p.id];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.left + rect.width / 2 - center);
      if (dist < closestDist) {
        closestDist = dist;
        closest = p.id;
      }
    });
    if (closest) setActiveId(closest);
  }, [sortedProjects]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { updateActiveCard(); raf = null; });
    };
    updateActiveCard();
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [updateActiveCard]);

  const bgProject = hovered || sortedProjects.find(p => p.id === activeId) || sortedProjects[0] || null;

  return (
    <PageTransition className="w-full relative flex-col items-start justify-start">
      {/* Full-page background preview */}
      <AnimatePresence>
        {bgProject && (
          <motion.div
            key={bgProject.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-0 pointer-events-none"
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgProject.imageUrl})` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/50" />
            <div className="absolute inset-0 bg-black/25" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-8 md:mb-10 flex items-end justify-between gap-6">
          <div className="overflow-hidden text-center md:text-left">
            <motion.h2 variants={textReveal} className="font-display text-4xl md:text-6xl font-bold text-white tracking-tight">
              Selected <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Works.</span>
            </motion.h2>
          </div>
          {sortedProjects.length > 0 && (
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <button
                onClick={() => scrollByCard(-1)}
                aria-label="Previous project"
                className="w-11 h-11 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white hover:bg-orange-500 hover:border-orange-500 transition-colors duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollByCard(1)}
                aria-label="Next project"
                className="w-11 h-11 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white hover:bg-orange-500 hover:border-orange-500 transition-colors duration-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {sortedProjects.length > 0 ? (
          <div
            ref={trackRef}
            className="no-scrollbar flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-pl-6 pb-4 -mx-6 px-6"
          >
            {sortedProjects.map((project, index) => {
              const isActive = bgProject?.id === project.id;
              return (
                <motion.div
                  data-carousel-card
                  ref={(el) => { if (el) cardRefs.current[project.id] = el; }}
                  variants={fadeUp}
                  key={project.id}
                  onMouseEnter={() => setHovered(project)}
                  onMouseLeave={() => setHovered(null)}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="group relative shrink-0 snap-center w-[82vw] sm:w-[380px] rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] p-5 flex flex-col"
                >
                  <a href={project.liveLink} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl aspect-[16/10] relative mb-5">
                    <motion.img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      animate={{ scale: isActive ? 1.06 : 1 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute top-3 left-3 font-mono text-xs text-orange-300 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                      0{index + 1}
                    </span>
                    <motion.div
                      animate={{ rotate: isActive ? 0 : -45, scale: isActive ? 1 : 0.9, opacity: isActive ? 1 : 0.6 }}
                      transition={{ type: "spring", stiffness: 200, damping: 18 }}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white group-hover:bg-orange-500 group-hover:border-orange-500 transition-colors duration-300"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </motion.div>
                  </a>
                  <h4 className="font-display text-lg font-bold text-white mb-2">{project.title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-5 flex-1">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {getTech(project).slice(0, 4).map((t) => (
                      <span key={t} className="text-[10px] font-mono uppercase tracking-wide px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-5 pt-1">
                    <a href={project.liveLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-white text-sm font-medium hover:text-orange-400 transition-colors">
                      <ExternalLink className="w-4 h-4" /> Live
                    </a>
                    <a href={project.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-gray-400 text-sm hover:text-white transition-colors">
                      <GithubIcon className="w-4 h-4" /> Source
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-white/50 text-center py-20">No projects found. Log in to Admin to add some.</div>
        )}
      </div>
    </PageTransition>
  );
};

export default ProjectsView;
