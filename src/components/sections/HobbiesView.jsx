"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition, textReveal, fadeUp } from '@/components/ui/SharedUI';

const HobbyCard = ({ hobby, onHoverStart, onHoverEnd }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const Wrapper = hobby.link ? 'a' : 'div';
  const wrapperProps = hobby.link ? { href: hobby.link, target: '_blank', rel: 'noreferrer' } : {};

  return (
    <motion.div
      variants={fadeUp}
      onMouseEnter={() => onHoverStart(hobby)}
      onMouseLeave={onHoverEnd}
      className="group relative overflow-hidden rounded-3xl h-[340px] md:h-[400px] bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 p-6 md:p-7 flex flex-col justify-end"
    >
      <Wrapper {...wrapperProps} className={`absolute inset-0 z-0 ${hobby.link ? 'cursor-pointer' : ''}`} aria-label={hobby.title}>
        {!imgFailed && (
          <img
            src={hobby.imageUrl}
            alt={hobby.title}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-1000 ease-[0.16,1,0.3,1]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </Wrapper>
      <div className="relative z-10 pointer-events-none transform group-hover:-translate-y-3 transition-transform duration-500 ease-[0.16,1,0.3,1]">
        <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">{hobby.title}</h3>
        <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-md">
          {hobby.description}
        </p>
      </div>
    </motion.div>
  );
};

const HobbiesView = ({ hobbies = [] }) => {
  const [hovered, setHovered] = useState(null);

  return (
    <PageTransition className="max-w-7xl mx-auto flex-col items-start justify-start w-full">
      {/* Full-page background preview, matching the Projects page hover effect */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key={hovered.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-0 pointer-events-none"
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${hovered.imageUrl})` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/50" />
            <div className="absolute inset-0 bg-black/25" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mb-10 md:mb-12 w-full text-center md:text-left">
        <motion.h2 variants={textReveal} className="font-display text-5xl md:text-7xl font-bold text-white tracking-tight">
          Beyond <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">the Screen.</span>
        </motion.h2>
      </div>
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
        {hobbies.map((hobby) => (
          <HobbyCard key={hobby.id} hobby={hobby} onHoverStart={setHovered} onHoverEnd={() => setHovered(null)} />
        ))}
        {hobbies.length === 0 && (
          <div className="text-white/50 text-center py-20 col-span-full">No hobbies added yet.</div>
        )}
      </div>
    </PageTransition>
  );
};

export default HobbiesView;
