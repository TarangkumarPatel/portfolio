"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { PageTransition, MouseGradient, CustomCursor, textReveal, fadeUp } from '@/components/ui/SharedUI';
import { motion } from 'framer-motion';
import Footer from '@/components/layout/Footer';
import { RELATIONSHIP_OPTIONS } from '@/data/mockTestimonials';

const EMPTY_FORM = { name: '', title: '', organization: '', relationship: RELATIONSHIP_OPTIONS[0], message: '', email: '', linkedinUrl: '' };

export default function SubmitTestimonialPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong.');
      }

      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email || 'no-email-provided',
            message: `New testimonial submitted by ${form.name} (${form.title} at ${form.organization}). Review it in the admin dashboard.`,
          }),
        });
      } catch { /* best-effort notification only */ }

      setStatus('success');
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message || 'Failed to submit. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      <CustomCursor />
      <MouseGradient />
      <Link href="/" className="absolute top-8 left-8 text-neutral-500 hover:text-white flex items-center gap-2 z-50">
        <ArrowLeft size={20} /> Back to Site
      </Link>

      <PageTransition className="justify-center relative z-10 !py-20">
        <div className="bg-zinc-900/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10 max-w-lg w-full">
          {status === 'success' ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-14 h-14 text-orange-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">Thank you!</h2>
              <p className="text-gray-400 text-sm">
                Your testimonial has been submitted for review. It will appear on the site once approved.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden mb-2">
                <motion.h2 variants={textReveal} className="font-display text-3xl font-bold text-white tracking-tight">
                  Share a Testimonial
                </motion.h2>
              </div>
              <p className="text-gray-400 text-sm mb-8">
                If you&apos;ve supervised, taught, or worked with me, a few words from you go a long way.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-500 mb-2">Your Name</label>
                    <input required type="text" value={form.name} onChange={update('name')} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-all" placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-500 mb-2">Relationship</label>
                    <select value={form.relationship} onChange={update('relationship')} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all">
                      {RELATIONSHIP_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-500 mb-2">Title / Designation</label>
                    <input required type="text" value={form.title} onChange={update('title')} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-all" placeholder="Professor of Computer Science" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-500 mb-2">Organization</label>
                    <input required type="text" value={form.organization} onChange={update('organization')} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-all" placeholder="University of Toronto" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-500 mb-2">Testimonial</label>
                  <textarea required rows={5} maxLength={2000} value={form.message} onChange={update('message')} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-all resize-none" placeholder="Share your experience working with Tarangkumar..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-500 mb-2">Email <span className="text-gray-600">(optional)</span></label>
                    <input type="email" value={form.email} onChange={update('email')} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-all" placeholder="jane@university.edu" />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-500 mb-2">LinkedIn <span className="text-gray-600">(optional)</span></label>
                    <input type="url" value={form.linkedinUrl} onChange={update('linkedinUrl')} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-all" placeholder="https://linkedin.com/in/..." />
                  </div>
                </div>

                {error && <p className="text-red-500 text-xs">{error}</p>}

                <button disabled={status === 'loading'} className="w-full bg-white text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors disabled:opacity-50">
                  {status === 'loading' ? <span className="animate-pulse">Submitting...</span> : <><Send className="w-4 h-4" /> Submit Testimonial</>}
                </button>
              </form>
            </>
          )}
        </div>
      </PageTransition>
      <Footer />
    </div>
  );
}
