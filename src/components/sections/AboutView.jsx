"use client";
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { PageTransition, textReveal, fadeUp, MouseGradient } from '@/components/ui/SharedUI';

const skills = [
  "React", "Next.js", "TypeScript", "JavaScript", "Angular", "Tailwind CSS", "Bootstrap",
  "Framer Motion", "Three.js", "Node.js", "Java", "C++", "C", "Python", "AI", "ML",
  "PostgreSQL", "MongoDB", "Firebase", "GraphQL", "Docker", "Kubernetes", "CI/CD",
  "Git", "GitHub", "Vercel", "Jira", "Blender", "Photoshop"
];

const TechArsenal = () => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.03 }}
        className="inline-flex items-center gap-3 px-6 py-3 rounded-full font-medium text-sm bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-[0_0_30px_rgba(234,88,12,0.35)] cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        Reveal my tech arsenal
      </motion.button>

      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
              onClick={() => setOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              >
                <button onClick={() => setOpen(false)} aria-label="Close" className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <h4 className="text-white text-lg font-bold mb-6 pr-8">Tech Arsenal</h4>
                <div className="flex flex-wrap gap-2.5">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3.5 py-2 rounded-full text-xs md:text-sm font-medium text-gray-300 bg-white/5 border border-white/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

const EducationItem = ({ active, degree, school, period }) => (
  <div className="relative">
    <div className={`absolute w-3 h-3 rounded-full -left-[30px] top-1.5 ${active ? 'bg-orange-500 blur-[2px]' : 'bg-orange-500/50'}`} />
    {active && <div className="absolute w-3 h-3 bg-orange-400 rounded-full -left-[30px] top-1.5" />}
    <h4 className="font-display text-lg md:text-xl text-white font-bold leading-tight">{degree}</h4>
    <p className="text-white/70 mt-1 text-xs md:text-sm">{school}</p>
    <p className="text-orange-400 mt-2 text-xs font-mono">{period}</p>
  </div>
);

const AboutView = () => {
  return (
    <PageTransition className="pt-32 pb-20 px-6 flex-col items-start justify-start relative overflow-hidden">
      <MouseGradient />
      <div className="relative z-10 max-w-6xl w-full mx-auto my-auto">
        <div className="overflow-hidden mb-10 md:mb-12 text-center md:text-left">
          <motion.h2 variants={textReveal} className="font-display text-5xl md:text-6xl font-bold text-white tracking-tight">
            Engineering <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500 text-4xl md:text-5xl">the invisible.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          <motion.div variants={fadeUp} className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[2rem] flex flex-col">
            <div className="space-y-5 text-base md:text-lg text-gray-300 font-light leading-relaxed flex-1">
              <p>
                I'm a software developer who cares as much about how something feels as how it's built. I like taking a rough idea and turning it into a product that's fast, reliable, and genuinely enjoyable to use — the kind of interface where nothing gets in the way.
              </p>
              <p>
                My work sits where thoughtful engineering meets clean, intentional design. From data models on the backend to the last few pixels of a transition, I sweat the details so the end result feels effortless. I'm always learning, shipping, and refining.
              </p>
            </div>
            <p className="mt-8 pt-6 border-t border-white/10 font-mono text-xs md:text-sm text-orange-400 tracking-[0.3em] uppercase">
              Eat. Code. Sleep. Repeat.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 md:p-10 rounded-[2rem] space-y-10">
            <div>
              <h3 className="font-display text-white text-sm font-bold tracking-widest uppercase mb-5 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-white/20"></span> Education
              </h3>
              <div className="space-y-7 border-l border-white/20 pl-6 relative">
                <EducationItem
                  active
                  degree="Honors BTech. Software Development"
                  school="Seneca Polytechnic"
                  period="January 2026 - August 2028"
                />
                <EducationItem
                  degree="Computer Programming Diploma"
                  school="Seneca Polytechnic"
                  period="January 2021 - April 2022"
                />
              </div>
            </div>

            <div>
              <h3 className="font-display text-white text-sm font-bold tracking-widest uppercase mb-6 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-white/20"></span> Tech Arsenal
              </h3>
              <TechArsenal />
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AboutView;
