"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const MouseGradient = () => {
  const mouseX = useMotionValue(typeof window !== "undefined" ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== "undefined" ? window.innerHeight / 2 : 0);

  const springX = useSpring(mouseX, { stiffness: 1000, damping: 40, mass: 0.1 });
  const springY = useSpring(mouseY, { stiffness: 1000, damping: 40, mass: 0.1 });

  const parallaxX = useTransform(springX, x => (typeof window !== "undefined" ? (window.innerWidth / 2 - x) * 0.1 : 0));
  const parallaxY = useTransform(springY, y => (typeof window !== "undefined" ? (window.innerHeight / 2 - y) * 0.1 : 0));

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen overflow-hidden">
      <motion.div
        style={{ left: springX, top: springY, x: "-50%", y: "-50%" }}
        className="absolute w-[350px] h-[350px] bg-orange-500 rounded-full blur-[80px]"
      />
      <motion.div
        style={{ x: parallaxX, y: parallaxY }}
        className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-rose-600 rounded-full blur-[60px]"
      />
    </div>
  );
};

export const pageVariants = {
  initial: { opacity: 0, scale: 0.98, y: 20 },
  enter: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 1.02, y: -20, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

export const textReveal = {
  initial: { y: "120%", opacity: 0 },
  enter: { y: "0%", opacity: 1, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
};

export const fadeUp = {
  initial: { y: 40, opacity: 0 },
  enter: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } }
};

export const PageTransition = ({ children, className }) => (
  <motion.div
    initial="initial" animate="enter" exit="exit" variants={pageVariants}
    className={`page-transition-shell min-h-screen w-full pt-32 pb-32 px-6 md:px-12 lg:px-24 flex items-start lg:items-center ${className}`}
  >
    {children}
  </motion.div>
);

export const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if ('ontouchstart' in window) { setIsTouch(true); return; }
    const updateMousePosition = (e) => { setMousePosition({ x: e.clientX, y: e.clientY }); };
    const handleMouseOver = (e) => {
      if (e.target.tagName.toLowerCase() === 'button' || e.target.tagName.toLowerCase() === 'a' || e.target.closest('button') || e.target.closest('a')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };
    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (isTouch) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
        animate={{ x: mousePosition.x - 8, y: mousePosition.y - 8, scale: isHovering ? 2.5 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border border-white/30 rounded-full pointer-events-none z-[9998]"
        animate={{ x: mousePosition.x - 20, y: mousePosition.y - 20, scale: isHovering ? 1.5 : 1, opacity: isHovering ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 20, mass: 0.8 }}
      />
    </>
  );
};

export const MagneticElement = ({ children, className }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };
  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} animate={{ x: position.x, y: position.y }} transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }} className={className}>
      {children}
    </motion.div>
  );
};

export const CinematicTextReveal = ({ text, className, delay = 0 }) => {
  const words = text.split(" ");
  return (
    <div className={`flex flex-wrap overflow-hidden ${className}`}>
      {words.map((word, i) => (
        <motion.span key={i} initial={{ y: "100%", opacity: 0 }} animate={{ y: "0%", opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.05 }} className="mr-2 md:mr-4 inline-block">
          {word}
        </motion.span>
      ))}
    </div>
  );
};

export const CyclingText = ({ words, className, delay = 0 }) => {
  const [index, setIndex] = useState(0);
  const [isInitial, setIsInitial] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsInitial(false);
      setIndex((prev) => (prev + 1) % words.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className="grid overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span key={index} initial={{ y: "100%", opacity: 0 }} animate={{ y: "0%", opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: isInitial && index === 0 ? delay : 0 }} className={`col-start-1 row-start-1 ${className}`}>
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export const SocialPill = ({ icon: Icon, label, href, copyValue }) => {
  const [copied, setCopied] = useState(false);

  const handleClick = (e) => {
    if (copyValue) {
      const textArea = document.createElement("textarea");
      textArea.value = copyValue;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {}
      document.body.removeChild(textArea);
    }
  };

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer" 
      onClick={handleClick}
      className="group/pill flex items-center shrink-0 h-8 sm:h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-2.5 sm:px-3 hover:bg-white/20 hover:border-orange-500/50 transition-all duration-500 ease-[0.16,1,0.3,1]"
    >
      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0 group-hover/pill:text-orange-400 transition-colors" />
      <div className="grid grid-cols-[0fr] group-hover/pill:grid-cols-[1fr] transition-all duration-500 ease-[0.16,1,0.3,1]">
        <div className="overflow-hidden whitespace-nowrap">
          <span className="opacity-0 group-hover/pill:opacity-100 transition-opacity duration-300 ease-out delay-100 text-xs font-medium text-white pl-2 block">
            {copied ? 'Copied!' : label}
          </span>
        </div>
      </div>
    </a>
  );
};
