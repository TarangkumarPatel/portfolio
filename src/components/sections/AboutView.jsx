"use client";
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { PageTransition, textReveal, fadeUp, MouseGradient } from '@/components/ui/SharedUI';

const skills = [
  "React", "Next.js", "TypeScript", "JavaScript", "Angular", "Tailwind CSS", "Bootstrap",
  "Framer Motion", "Three.js", "Node.js", "Java", "C++", "C", "Python", "AI", "ML",
  "PostgreSQL", "MongoDB", "Firebase", "GraphQL", "Docker", "Kubernetes", "CI/CD",
  "Git", "GitHub", "Vercel", "Jira", "Blender", "Photoshop"
];

const GROUP_SIZE = 1;             // one fireshot per circle
const ROCKET_STAGGER_S = 0.2;     // delay between successive fireshots
const ROCKET_FLIGHT_S = 0.6;      // time for a rocket to reach its burst point
const ITEM_STAGGER_S = 0.06;      // stagger between circles within one burst
const FALL_S = 2.6;               // slow float down after bursting
const HOLD_S = 2;                 // stay put + readable once landed
const FADE_S = 0.6;               // final vanish
const ITEM_S = FALL_S + HOLD_S + FADE_S;
const FALL_COMPLETE_T = FALL_S / ITEM_S;
const RISE_T = FALL_COMPLETE_T * 0.22;
const FADE_START_T = (FALL_S + HOLD_S) / ITEM_S;

const TechArsenal = () => {
  const [firing, setFiring] = useState(false);
  const [rockets, setRockets] = useState([]);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  const launch = () => {
    if (!btnRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const rect = btnRef.current.getBoundingClientRect();
    const start = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    setOrigin(start);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 640;
    const margin = isMobile ? 50 : 110;
    const usableW = Math.max(vw - margin * 2, 100);

    const groups = [];
    for (let i = 0; i < skills.length; i += GROUP_SIZE) groups.push(skills.slice(i, i + GROUP_SIZE));

    const newRockets = groups.map((groupSkills, gi) => {
      const t = groups.length === 1 ? 0.5 : gi / (groups.length - 1);
      const burstX = margin + usableW * t + (Math.random() - 0.5) * 24;
      const burstY = vh * (isMobile ? 0.2 : 0.14 + Math.random() * 0.08);
      const launchDelay = gi * ROCKET_STAGGER_S;

      const items = groupSkills.map((skill, si) => {
        const spreadOffset = (si - (groupSkills.length - 1) / 2) * (isMobile ? 58 : 88);
        const landX = Math.min(Math.max(burstX + spreadOffset, 44), vw - 44);
        const landY = vh * (isMobile ? 0.7 : 0.75) + (Math.random() * 24 - 12);
        const liftY = burstY - (20 + Math.random() * 26);
        const size = isMobile ? 62 + Math.random() * 14 : 82 + Math.random() * 20;
        return {
          id: `${skill}-${gi}-${si}`,
          skill,
          landX,
          landY,
          liftY,
          rotate: (Math.random() - 0.5) * 36,
          size,
          itemDelay: launchDelay + ROCKET_FLIGHT_S + si * ITEM_STAGGER_S,
        };
      });

      return { id: `rocket-${gi}`, launchDelay, burstX, burstY, items };
    });

    setRockets(newRockets);
    setFiring(true);

    const lastLaunch = (groups.length - 1) * ROCKET_STAGGER_S;
    const lastItemDelay = lastLaunch + ROCKET_FLIGHT_S + (GROUP_SIZE - 1) * ITEM_STAGGER_S;
    const total = (lastItemDelay + ITEM_S + 0.3) * 1000;
    timeoutRef.current = setTimeout(() => setFiring(false), total);
  };

  return (
    <div className="relative flex flex-col items-center md:items-start">
      <motion.button
        ref={btnRef}
        onClick={launch}
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.03 }}
        className="relative z-20 inline-flex items-center gap-3 px-6 py-3 rounded-full font-medium text-sm bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-[0_0_30px_rgba(234,88,12,0.35)] cursor-pointer"
      >
        <motion.span animate={{ rotate: firing ? 180 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
          <Sparkles className="w-4 h-4" />
        </motion.span>
        {firing ? "Launching..." : "Reveal my tech arsenal"}
      </motion.button>

      {mounted && createPortal(
        <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
          <AnimatePresence>
            {firing && rockets.map((r) => (
              <React.Fragment key={r.id}>
                {/* Rocket launch trail */}
                <motion.span
                  initial={{ left: origin.x, top: origin.y, x: "-50%", y: "-50%", opacity: 1, scale: 1 }}
                  animate={{
                    left: r.burstX,
                    top: r.burstY,
                    opacity: [1, 1, 0],
                    scale: [1, 0.7, 0.2],
                  }}
                  transition={{
                    left: { duration: ROCKET_FLIGHT_S, delay: r.launchDelay, ease: [0.4, 0, 0.2, 1] },
                    top: { duration: ROCKET_FLIGHT_S, delay: r.launchDelay, ease: [0.4, 0, 0.2, 1] },
                    opacity: { duration: ROCKET_FLIGHT_S, delay: r.launchDelay, times: [0, 0.8, 1] },
                    scale: { duration: ROCKET_FLIGHT_S, delay: r.launchDelay, times: [0, 0.8, 1] },
                  }}
                  className="absolute w-3 h-3 rounded-full bg-orange-300 shadow-[0_0_25px_10px_rgba(251,146,60,0.85)]"
                />
                <motion.span
                  initial={{ left: origin.x, top: origin.y, x: "-50%", y: "-50%", opacity: 0.6, scaleY: 1 }}
                  animate={{ left: r.burstX, top: r.burstY, opacity: [0.6, 0.3, 0], scaleY: [1, 2.2, 2.6] }}
                  transition={{ duration: ROCKET_FLIGHT_S, delay: r.launchDelay, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute w-1.5 h-8 rounded-full bg-gradient-to-t from-orange-400/70 to-transparent blur-[2px]"
                />

                {/* Burst flash */}
                <motion.span
                  initial={{ left: r.burstX, top: r.burstY, x: "-50%", y: "-50%", opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 0.9, 0], scale: [0, 3, 4] }}
                  transition={{ duration: 0.6, delay: r.launchDelay + ROCKET_FLIGHT_S, ease: "easeOut" }}
                  className="absolute w-8 h-8 rounded-full bg-orange-200"
                />

                {/* Tech circles that float down and hold */}
                {r.items.map((p) => (
                  <motion.span
                    key={p.id}
                    initial={{ left: r.burstX, top: r.burstY, x: "-50%", y: "-50%", opacity: 0, scale: 0, rotate: 0 }}
                    animate={{
                      left: [r.burstX, p.landX, p.landX],
                      top: [r.burstY, p.liftY, p.landY, p.landY],
                      opacity: [0, 1, 1, 0],
                      scale: [0, 1.15, 1, 1, 0.9],
                      rotate: [0, p.rotate, p.rotate],
                    }}
                    transition={{
                      left: { duration: ITEM_S, delay: p.itemDelay, times: [0, FALL_COMPLETE_T, 1], ease: ["easeOut", "linear"] },
                      top: { duration: ITEM_S, delay: p.itemDelay, times: [0, RISE_T, FALL_COMPLETE_T, 1], ease: ["easeOut", "easeInOut", "linear"] },
                      opacity: { duration: ITEM_S, delay: p.itemDelay, times: [0, 0.06, FADE_START_T, 1] },
                      scale: { duration: ITEM_S, delay: p.itemDelay, times: [0, 0.15, FALL_COMPLETE_T, FADE_START_T, 1] },
                      rotate: { duration: ITEM_S, delay: p.itemDelay, times: [0, FALL_COMPLETE_T, 1] },
                    }}
                    style={{ width: p.size, height: p.size }}
                    className="absolute flex items-center justify-center text-center rounded-full border border-white/25 bg-gradient-to-br from-orange-500 to-rose-600 text-white font-semibold leading-tight px-1.5 shadow-[0_0_18px_rgba(234,88,12,0.65)]"
                  >
                    <span className="text-[10px] sm:text-[11px] md:text-xs">{p.skill}</span>
                  </motion.span>
                ))}
              </React.Fragment>
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </div>
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
