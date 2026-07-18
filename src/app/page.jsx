"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Lock } from 'lucide-react';
import Link from 'next/link';
import { db, appId } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { INITIAL_PROJECTS } from '@/data/mockProjects';

// Shared UI
import { CustomCursor } from '@/components/ui/SharedUI';

// Sections
import HomeView from '@/components/sections/HomeView';
import AboutView from '@/components/sections/AboutView';
import ProjectsView from '@/components/sections/ProjectsView';
import HobbiesView from '@/components/sections/HobbiesView';
import ContactView from '@/components/sections/ContactView';

export default function PortfolioApp() {
  const [currentView, setCurrentView] = useState('home');
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [loading, setLoading] = useState(true);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const navExpanded = navVisible || menuOpen;

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'projects'), (snapshot) => {
      if (!snapshot.empty) {
        const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  const navigate = (view) => {
    setCurrentView(view);
    setMenuOpen(false);
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

        <div className="md:hidden flex items-center justify-between w-[90vw] bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 shadow-2xl">
          <span className="font-bold text-white tracking-widest">T.J.P</span>
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-white">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[90] bg-[#050505]/95 backdrop-blur-3xl flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navItems.map((item) => (
              <button key={item.id} onClick={() => navigate(item.id)} className={`text-4xl font-bold ${currentView === item.id ? 'text-white' : 'text-white/40'}`}>
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          {currentView === 'home' && <HomeView key="home" navigate={navigate} />}
          {currentView === 'about' && <AboutView key="about" />}
          {currentView === 'projects' && <ProjectsView key="projects" projects={projects} />}
          {currentView === 'hobbies' && <HobbiesView key="hobbies" />}
          {currentView === 'contact' && <ContactView key="contact" />}
        </AnimatePresence>
      </main>

      {/* FIXED: Now uses Next.js Link to route directly to your standalone Admin page */}
      <Link href="/admin" className="fixed bottom-4 right-4 w-12 h-12 flex items-center justify-center opacity-0 hover:opacity-20 cursor-pointer z-50 transition-opacity">
        <Lock className="w-4 h-4 text-white" />
      </Link>
    </div>
  );
}
