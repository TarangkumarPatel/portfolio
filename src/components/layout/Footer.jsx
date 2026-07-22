import React from 'react';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 inset-x-0 z-40 bg-[#050505]/30 backdrop-blur-md border-t border-white/5 text-center px-6 py-2.5">
      <p className="text-neutral-600 text-[10px] md:text-xs tracking-widest uppercase">
        © {new Date().getFullYear()} Tarangkumar Patel. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;