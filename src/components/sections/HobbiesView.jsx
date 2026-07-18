"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Camera } from 'lucide-react';
import { PageTransition, textReveal, fadeUp } from '@/components/ui/SharedUI';

const HobbiesView = () => (
  <PageTransition className="max-w-7xl mx-auto flex-col items-start justify-start w-full">
    <div className="mb-10 md:mb-12 w-full text-center md:text-left">
      <motion.h2 variants={textReveal} className="font-display text-5xl md:text-7xl font-bold text-white tracking-tight">
        Beyond <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">the Screen.</span>
      </motion.h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
      <motion.div variants={fadeUp} className="group relative overflow-hidden rounded-3xl h-[340px] md:h-[400px] bg-zinc-900 border border-white/5 p-6 md:p-7 flex flex-col justify-end">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2535&auto=format&fit=crop" alt="Soccer" className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-1000 ease-[0.16,1,0.3,1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 transform group-hover:-translate-y-3 transition-transform duration-500 ease-[0.16,1,0.3,1]">
          <div className="w-11 h-11 bg-orange-500/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-orange-500/30">
            <Activity className="w-5 h-5 text-orange-400" />
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">The Pitch</h3>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-md">
            When I'm not writing code, I'm analyzing the beautiful game. Competitive amateur soccer teaches me split-second decision making, spatial awareness, and team dynamics.
          </p>
        </div>
      </motion.div>
      <motion.div variants={fadeUp} className="group relative overflow-hidden rounded-3xl h-[340px] md:h-[400px] bg-zinc-900 border border-white/5 p-6 md:p-7 flex flex-col justify-end">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1516961642265-531546e84af2?q=80&w=2574&auto=format&fit=crop" alt="Photography" className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-1000 ease-[0.16,1,0.3,1] grayscale group-hover:grayscale-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 transform group-hover:-translate-y-3 transition-transform duration-500 ease-[0.16,1,0.3,1]">
          <div className="w-11 h-11 bg-orange-500/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-orange-500/30">
            <Camera className="w-5 h-5 text-orange-400" />
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">Through the Lens</h3>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-md">
            Street and architectural photography is my way of practicing observation. It trains the eye for composition, lighting, and visual hierarchy.
          </p>
        </div>
      </motion.div>
    </div>
  </PageTransition>
);

export default HobbiesView;