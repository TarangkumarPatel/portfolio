"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Lock } from 'lucide-react';
import Link from 'next/link';
import { db, appId } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { INITIAL_PROJECTS } from '@/data/mockProjects';
import { INITIAL_HOBBIES } from '@/data/mockHobbies';

// Shared UI
import { CustomCursor } from '@/components/ui/SharedUI';
import Footer from '@/components/layout/Footer';

// Sections
import HomeView from '@/components/sections/HomeView';
import AboutView from '@/components/sections/AboutView';
import ProjectsView from '@/components/sections/ProjectsView';
import HobbiesView from '@/components/sections/HobbiesView';
import ContactView from '@/components/sections/ContactView';

export default function PortfolioApp() {
  const [currentView, setCurrentView] = useState('home');
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [hobbies, setHobbies] = useState(INITIAL_HOBBIES);
  const [loading, setLoading] = useState(true);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const navExpanded = navVisible || menuOpen;

  const [floatPos, setFloatPos] = useState({ top: 90, left: 300 });
  const dragBoundsRef = useRef(null);
  const autoCloseRef = useRef(null);

  useEffect(() => {
    setFloatPos({ top: 90, left: window.innerWidth - 72 });
  }, []);

  const openMobileMenu = () => {
    setMenuOpen(true);
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    autoCloseRef.current = setTimeout(() => setMenuOpen(false), 5000);
  };
  const closeMobileMenu = () => {
    setMenuOpen(false);
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
  };

  useEffect(() => () => { if (autoCloseRef.current) clearTimeout(autoCloseRef.current); }, []);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'projects'), (snapshot) => {
      if (!snapshot.empty) {
        const projs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setProjects(projs);
      } else {
        setProjects(INITIAL_PROJECTS);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      setProjects(INITIAL_PROJECTS);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'hobbies'), (snapshot) => {
      if (!snapshot.empty) {
        const hobs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setHobbies(hobs);
      } else {
        setHobbies(INITIAL_HOBBIES);
      }
    }, (error) => {
      console.error("Error fetching hobbies:", error);
      setHobbies(INITIAL_HOBBIES);
    });
    return () => unsub();
  }, []);

  const navigate = (view) => {
    setCurrentView(view);
    closeMobileMenu();
    window.scrollTo(0, 0);
    setNavVisible(true);
  };

  const showNav = () => setNavVisible(true);
  const hideNav = () => {
    if (!menuOpen) setNavVisible(false);
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (e.clientY < 96) {
        setNavVisible(true);
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Me' },
    { id: 'projects', label: 'Work' },
    { id: 'hobbies', label: 'Life' },
    { id: 'contact', label: 'Contact' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-orange-400 text-sm font-mono tracking-widest animate-pulse uppercase">
          Initializing Engine...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 font-sans overflow-x-hidden"
      style={{ '--nav-space': navExpanded ? '6rem' : '0rem' }}
    >
      <CustomCursor />
      
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      <div
        className="hidden md:block fixed top-0 left-0 right-0 h-24 z-[95]"
        onMouseEnter={showNav}
        aria-hidden="true"
      />

      <nav
        onMouseEnter={showNav}
        onMouseLeave={hideNav}
        className={`fixed top-4 md:top-8 w-full flex justify-center z-[100] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${navExpanded ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0 md:opacity-0 md:-translate-y-24'}`}
      >
        <div className="hidden md:flex items-center gap-2 px-4 py-3 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${currentView === item.id ? 'text-black' : 'text-gray-400 hover:text-white'}`}
            >
              {currentView === item.id && (
                <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white rounded-full z-0" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="md:hidden flex justify-center w-full">
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, scale: 0.6, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6, y: -10 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="flex items-center gap-1 px-2 py-2 max-w-[92vw] overflow-x-auto no-scrollbar bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl"
              >
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`relative shrink-0 px-3 py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors duration-300 ${currentView === item.id ? 'text-black' : 'text-gray-400'}`}
                  >
                    {currentView === item.id && (
                      <motion.div layoutId="mobile-nav-pill" className="absolute inset-0 bg-white rounded-full z-0" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </button>
                ))}
                <button onClick={closeMobileMenu} aria-label="Close menu" className="shrink-0 w-8 h-8 ml-1 rounded-full flex items-center justify-center text-white/70">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Drag boundary for the floating mobile menu button */}
      <div ref={dragBoundsRef} className="md:hidden fixed inset-4 pointer-events-none z-0" aria-hidden="true" />

      <motion.button
        drag
        dragConstraints={dragBoundsRef}
        dragMomentum={false}
        dragElastic={0.08}
        onTap={() => { if (!menuOpen) openMobileMenu(); }}
        animate={{ opacity: menuOpen ? 0 : 1, scale: menuOpen ? 0.5 : 1 }}
        transition={{ duration: 0.25 }}
        style={{ top: floatPos.top, left: floatPos.left }}
        className={`md:hidden fixed z-[110] w-14 h-14 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center justify-center text-white active:cursor-grabbing cursor-grab ${menuOpen ? 'pointer-events-none' : ''}`}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </motion.button>

      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-[90]"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      <main className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          {currentView === 'home' && <HomeView key="home" navigate={navigate} />}
          {currentView === 'about' && <AboutView key="about" />}
          {currentView === 'projects' && <ProjectsView key="projects" projects={projects} />}
          {currentView === 'hobbies' && <HobbiesView key="hobbies" hobbies={hobbies} />}
          {currentView === 'contact' && <ContactView key="contact" />}
        </AnimatePresence>
      </main>

      <Footer />

      <Link href="/admin" className="fixed bottom-12 right-4 w-12 h-12 flex items-center justify-center opacity-50 hover:opacity-90 cursor-pointer z-50 transition-opacity">
        <Lock className="w-4 h-4 text-white" />
      </Link>
    </div>
  );
}
