"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, FileText } from 'lucide-react';
import { PageTransition, CyclingText, CinematicTextReveal, SocialPill, MagneticElement, MouseGradient } from '@/components/ui/SharedUI';

// Custom SVG Icons to replace the missing Lucide brand icons
const GithubIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const HomeView = ({ navigate }) => {
  return (
    <PageTransition className="justify-center relative overflow-hidden">
      <MouseGradient />

      <div className="grid lg:grid-cols-[300px_auto] gap-8 lg:gap-16 w-full lg:w-fit mx-auto items-center z-10 my-auto">

        <div className="order-1 lg:order-2 lg:col-start-2 lg:row-start-1 lg:max-w-xl text-center lg:text-left flex flex-col justify-center lg:pt-8">
          <h1 className="font-hero text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] uppercase flex flex-col items-center lg:items-start mb-0">
            <CyclingText words={["Creative", "Full-Stack", "Software"]} className="bg-gradient-to-r from-orange-400 via-amber-200 to-white bg-clip-text text-transparent pr-1 mb-[-0.1em]" delay={0.2} />
            <CinematicTextReveal text="Developer" delay={0.1} className="text-white" />
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          className="order-2 lg:order-1 lg:col-start-1 lg:row-start-1 lg:row-span-2 relative w-full max-w-[220px] md:max-w-[300px] md:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(234,88,12,0.15)] mx-auto group border border-white/5 flex flex-col md:block"
        >
          <div className="relative aspect-[3/2] w-full md:absolute md:inset-0 md:aspect-auto">
            <img
              src="/Profile.jpg"
              alt="Tarangkumar Patel"
              className="w-full h-full object-cover object-top md:object-center scale-105 group-hover:scale-100 transition-transform duration-1000 ease-[0.16,1,0.3,1]"
            />
          </div>
          <div className="relative md:absolute md:inset-0 bg-black/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none md:bg-gradient-to-t md:from-black/90 md:via-black/40 md:to-transparent px-6 pb-5 pt-2 md:p-8 flex flex-col justify-end">
            <h2 className="font-sans text-2xl md:text-lg font-bold tracking-tight text-white mb-1 md:mb-0.5">Tarangkumar Patel</h2>
            <p className="text-orange-400 font-mono text-xs mb-3 md:mb-4">Toronto, Canada</p>
            <div className="flex gap-1.5 sm:gap-2 flex-nowrap overflow-x-auto no-scrollbar">
              <SocialPill icon={GithubIcon} label="GitHub" href="https://github.com/TarangkumarPatel" />
              <SocialPill icon={LinkedinIcon} label="LinkedIn" href="https://www.linkedin.com/in/tarangkumarpatel/" />
              <SocialPill icon={Mail} label="Email" href="mailto:tarangkumar.dev@gmail.com" copyValue="tarangkumar.dev@gmail.com" />
              <SocialPill icon={FileText} label="Resume" href="/Resume_Tarangkumar_Janakkumar_Patel.pdf" />
            </div>
          </div>
        </motion.div>

        <div className="order-3 lg:order-3 lg:col-start-2 lg:row-start-2 lg:max-w-xl text-center lg:text-left flex flex-col items-center lg:items-start">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }} className="text-base md:text-xl text-white/60 font-light max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed px-4 lg:px-0">
            Hi, I'm <strong className="text-white font-medium">Tarangkumar Janakkumar Patel</strong>. I engineer digital experiences that bridge the gap between high-end product design and robust full-stack architecture.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <MagneticElement>
              <button onClick={() => navigate('projects')} className="group relative px-6 md:px-8 py-3 md:py-4 bg-white text-black font-semibold rounded-full overflow-hidden flex items-center gap-2">
                <span className="relative z-10">My Work</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-orange-100 transform scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500 ease-in-out z-0"></div>
              </button>
            </MagneticElement>
            <MagneticElement>
              <button onClick={() => navigate('contact')} className="group relative px-6 md:px-8 py-3 md:py-4 bg-transparent border border-white/20 text-white font-semibold rounded-full overflow-hidden flex items-center justify-center">
                <span className="relative z-10 group-hover:text-black transition-colors duration-500">Contact Me</span>
                <div className="absolute inset-0 bg-white transform scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500 ease-in-out z-0"></div>
              </button>
            </MagneticElement>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default HomeView;
