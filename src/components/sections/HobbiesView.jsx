"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { PageTransition, textReveal, fadeUp } from '@/components/ui/SharedUI';

const HobbyCard = ({ hobby }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const Wrapper = hobby.link ? 'a' : 'div';
  const wrapperProps = hobby.link ? { href: hobby.link, target: '_blank', rel: 'noreferrer' } : {};

  return (
    <motion.div variants={fadeUp} className="group relative overflow-hidden rounded-3xl h-[340px] md:h-[400px] bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 p-6 md:p-7 flex flex-col justify-end">
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
        <div className="w-11 h-11 bg-orange-500/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-orange-500/30">
          <Heart className="w-5 h-5 text-orange-400" />
        </div>
        <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">{hobby.title}</h3>
        <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-md">
          {hobby.description}
        </p>
      </div>
    </motion.div>
  );
};

const HobbiesView = ({ hobbies = [] }) => (
  <PageTransition className="max-w-7xl mx-auto flex-col items-start justify-start w-full">
    <div className="mb-10 md:mb-12 w-full text-center md:text-left">
      <motion.h2 variants={textReveal} className="font-display text-5xl md:text-7xl font-bold text-white tracking-tight">
        Beyond <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">the Screen.</span>
      </motion.h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
      {hobbies.map((hobby) => <HobbyCard key={hobby.id} hobby={hobby} />)}
      {hobbies.length === 0 && (
        <div className="text-white/50 text-center py-20 col-span-full">No hobbies added yet.</div>
      )}
    </div>
  </PageTransition>
);

export default HobbiesView;
