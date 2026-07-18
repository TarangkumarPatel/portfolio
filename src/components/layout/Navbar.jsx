"use client";
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollTo = (id) => {
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className="fixed w-full z-50 mix-blend-difference top-0 py-6 px-6 md:px-12 flex justify-between items-center pointer-events-none">
        <div className="text-white font-display font-bold text-xl tracking-tighter pointer-events-auto cursor-pointer" onClick={() => scrollTo('home')}>
          Tarangkumar Patel
        </div>
        
        <div className="hidden md:flex items-center gap-8 pointer-events-auto">
          {['About', 'Projects', 'Personal', 'Contact'].map(item => (
            <button 
              key={item} 
              onClick={() => scrollTo(item.toLowerCase())}
              className="text-white hover:text-neutral-400 text-sm font-medium tracking-wide transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        <button 
          className="md:hidden text-white pointer-events-auto z-50 mix-blend-difference"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <div className={`fixed inset-0 bg-[#050505] z-40 flex flex-col justify-center px-12 transition-transform duration-700 ease-in-out ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
         <div className="flex flex-col gap-8 text-4xl font-display font-bold text-white">
           {['Home', 'About', 'Projects', 'Personal', 'Contact'].map(item => (
             <button 
               key={item} 
               className="text-left hover:text-neutral-500 transition-colors"
               onClick={() => scrollTo(item.toLowerCase() === 'home' ? 'home' : item.toLowerCase())}
             >
               {item}
             </button>
           ))}
         </div>
      </div>
    </>
  );
};

export default Navbar;