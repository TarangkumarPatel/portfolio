"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Smartphone, Send } from 'lucide-react';
import { PageTransition, textReveal, fadeUp, MouseGradient } from '@/components/ui/SharedUI';
import { db, appId } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const ContactView = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); 
  const [copiedItem, setCopiedItem] = useState(null);

  const handleCopy = (value, type) => {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedItem(type);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {}
    document.body.removeChild(textArea);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      if(db) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), {
          ...formData, createdAt: new Date().toISOString()
        });
      }
      try {
        await fetch('/api/notify', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
        });
      } catch (apiErr) { console.log("Backend API not connected in local preview."); }
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus('error');
    }
  };

  return (
    <PageTransition className="pt-32 pb-20 px-6 flex justify-center relative overflow-hidden">
      <MouseGradient />
      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-16 items-center my-auto">

        <div className="order-1 lg:order-1 lg:col-start-1 lg:row-start-1">
          <div className="overflow-hidden mb-3 md:mb-6 text-center lg:text-left">
            <motion.h2 variants={textReveal} className="font-display text-5xl md:text-7xl font-bold text-white tracking-tight">
              Let's <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Connect.</span>
            </motion.h2>
          </div>
          <motion.p variants={fadeUp} className="text-lg text-gray-400 font-light max-w-md mx-auto lg:mx-0 text-center lg:text-left">
            Whether it's a job opportunity, a freelance project, or just to talk tech, my inbox is always open.
          </motion.p>
        </div>

        <motion.div variants={fadeUp} className="order-3 lg:order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 md:p-12 rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />
          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-500 mb-2">Your Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:bg-black/80 transition-all" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-gray-500 mb-2">Email Address</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:bg-black/80 transition-all" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-gray-500 mb-2">Message</label>
              <textarea required rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:bg-black/80 transition-all resize-none" placeholder="Tell me about your project..." />
            </div>
            <button disabled={status === 'loading'} className="w-full mt-4 bg-white text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors disabled:opacity-50 relative overflow-hidden group">
              {status === 'idle' && <><Send className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform"/> Send Message</>}
              {status === 'loading' && <span className="animate-pulse">Transmitting...</span>}
              {status === 'success' && <span className="text-green-600">Message Received!</span>}
              {status === 'error' && <span className="text-red-600">Error Sending</span>}
            </button>
          </form>
        </motion.div>

        <motion.div variants={fadeUp} className="order-2 lg:order-3 lg:col-start-1 lg:row-start-2 space-y-3 md:space-y-6 flex flex-col items-center lg:items-start">
          <a href="mailto:tarangkumar.dev@gmail.com" target="_blank" rel="noopener noreferrer" onClick={() => handleCopy('tarangkumar.dev@gmail.com', 'email')} className="flex items-center gap-5 group cursor-pointer">
            <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:border-orange-500/50 group-hover:bg-orange-500/10 transition-all">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg md:text-xl text-white font-light group-hover:text-orange-400 transition-colors">
              {copiedItem === 'email' ? 'Copied to clipboard!' : 'tarangkumar.dev@gmail.com'}
            </span>
          </a>
          <a href="sms:+14379874012" target="_blank" rel="noopener noreferrer" onClick={() => handleCopy('+14379874012', 'phone')} className="flex items-center gap-5 group cursor-pointer">
            <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:border-orange-500/50 group-hover:bg-orange-500/10 transition-all">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg md:text-xl text-white font-light group-hover:text-orange-400 transition-colors">
              {copiedItem === 'phone' ? 'Copied to clipboard!' : '+1 (437) 987-4012'}
            </span>
          </a>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default ContactView;