"use client";
import React from 'react';
import { useReveal } from '@/hooks/useReveal';

const SectionHeader = ({ title, subtitle }) => {
  const revealRef = useReveal();
  
  return (
    <div ref={revealRef} className="reveal-hidden mb-16 md:mb-24">
      <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-4 uppercase">
        {title}
      </h2>
      {subtitle && <p className="text-xl text-neutral-400 font-light">{subtitle}</p>}
      <div className="h-px w-24 bg-white/20 mt-8"></div>
    </div>
  );
};

export default SectionHeader;