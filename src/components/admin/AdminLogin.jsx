"use client";
import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { auth } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        if (password === 'admin123') { 
           if (auth) await signInAnonymously(auth); 
           onLogin(true);
        } else {
           setError('Invalid credentials');
        }
    } catch (err) {
        setError('Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative">
      <Link href="/" className="absolute top-8 left-8 text-neutral-500 hover:text-white flex items-center gap-2">
        <X size={20} /> Back to Site
      </Link>
      
      <div className="w-full max-w-md bg-[#0A0A0A] border border-white/10 p-10 shadow-2xl">
        <div className="flex justify-center mb-8 text-white">
          <Lock size={32} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-2">Restricted Access</h2>
        <p className="text-center text-neutral-500 text-sm mb-8">System Content Management</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input 
              type="password" 
              placeholder="Enter Passphrase"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border border-white/20 focus:border-white px-4 py-3 text-white text-center tracking-widest outline-none transition-colors"
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Authenticating...' : 'Access System'}
          </Button>
          <p className="text-center text-xs text-neutral-600 mt-4">Demo password: admin123</p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;