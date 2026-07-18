"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Plus, Edit2, Trash2, Save, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PageTransition } from '@/components/ui/SharedUI';
import { db, appId } from '@/lib/firebase';
import { collection, doc, addDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState(false);
  
  const [activeTab, setActiveTab] = useState('projects'); 
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  const CORRECT_PIN = "0000"; 

  // Fetch data only after authentication
  useEffect(() => {
    if (isAuthenticated && db) {
      // Fetch Messages
      const unsubMessages = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), (snap) => {
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        msgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMessages(msgs);
      });

      // Fetch Projects
      const unsubProjects = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'projects'), (snap) => {
        const projs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProjects(projs);
      });

      return () => {
        unsubMessages();
        unsubProjects();
      };
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinCode === CORRECT_PIN) { setIsAuthenticated(true); setPinError(false); }
    else setPinError(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!db) return;
    try {
      const projData = {
        ...currentProject,
        tech: typeof currentProject.tech === 'string' ? currentProject.tech.split(',').map(t=>t.trim()) : currentProject.tech,
        order: Number(currentProject.order) || 0
      };
      if (projData.id) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'projects', projData.id), projData);
      else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'projects'), projData);
      setIsEditing(false); setCurrentProject(null);
    } catch (err) { console.error(err); }
  };

  const handleDeleteProject = async (id) => {
    if (!db) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'projects', id));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative">
        <Link href="/" className="absolute top-8 left-8 text-neutral-500 hover:text-white flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Site
        </Link>
        <PageTransition className="justify-center">
          <div className="bg-zinc-900/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 max-w-sm w-full text-center">
            <Lock className="w-12 h-12 text-orange-500/50 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Restricted Area</h2>
            <p className="text-gray-400 text-sm mb-8">Enter access code to manage portfolio.</p>
            <form onSubmit={handleLogin}>
              <input type="password" placeholder="Enter PIN (0000)" value={pinCode} onChange={e=>setPinCode(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-center text-white text-xl tracking-widest mb-2 focus:outline-none focus:border-orange-500" autoFocus />
              {pinError && <p className="text-red-500 text-xs mb-4">Incorrect Code</p>}
              {!pinError && <div className="mb-6"></div>}
              <button className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors">Authenticate</button>
            </form>
          </div>
        </PageTransition>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] overflow-y-auto pt-12">
      <Link href="/" className="absolute top-8 left-8 text-neutral-500 hover:text-white flex items-center gap-2 z-50">
        <ArrowLeft size={20} /> Back to Site
      </Link>
      
      <PageTransition className="max-w-7xl mx-auto flex-col items-start justify-start w-full !pt-12">
        <div className="flex items-center justify-between mb-12 w-full">
          <h2 className="text-4xl font-bold text-white flex items-center gap-4"><Lock className="text-orange-400" /> Command Center</h2>
          <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
            <button onClick={() => setActiveTab('projects')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'projects' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>Projects</button>
            <button onClick={() => setActiveTab('messages')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'messages' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>Messages</button>
          </div>
        </div>

        {activeTab === 'projects' && (
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 w-full mb-20">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-white">Project Roster</h3>
              <button onClick={() => { setCurrentProject({ title:'', description:'', role:'', tech:'', liveLink:'', githubLink:'', imageUrl:'', order: projects.length + 1 }); setIsEditing(true); }} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
                <Plus className="w-4 h-4"/> New Project
              </button>
            </div>

            {isEditing && (
              <motion.form initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} onSubmit={handleSaveProject} className="bg-black/50 p-6 rounded-2xl border border-white/5 space-y-6 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-white font-bold">{currentProject?.id ? 'Edit Project' : 'New Project'}</h4>
                  <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white"><XCircle /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">Title</label><input required type="text" value={currentProject?.title} onChange={e=>setCurrentProject({...currentProject, title: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">Role</label><input required type="text" value={currentProject?.role} onChange={e=>setCurrentProject({...currentProject, role: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div className="md:col-span-2"><label className="block text-xs uppercase text-gray-500 mb-1">Description</label><textarea required rows={3} value={currentProject?.description} onChange={e=>setCurrentProject({...currentProject, description: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">Image URL</label><input required type="url" value={currentProject?.imageUrl} onChange={e=>setCurrentProject({...currentProject, imageUrl: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">Tech Stack (comma separated)</label><input required type="text" value={Array.isArray(currentProject?.tech) ? currentProject.tech.join(', ') : currentProject?.tech} onChange={e=>setCurrentProject({...currentProject, tech: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">Live Link</label><input required type="url" value={currentProject?.liveLink} onChange={e=>setCurrentProject({...currentProject, liveLink: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">GitHub Link</label><input required type="url" value={currentProject?.githubLink} onChange={e=>setCurrentProject({...currentProject, githubLink: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">Display Order</label><input required type="number" value={currentProject?.order} onChange={e=>setCurrentProject({...currentProject, order: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                </div>
                <button type="submit" className="bg-white text-black font-bold py-3 px-8 rounded-lg flex items-center gap-2 hover:bg-gray-200"><Save className="w-5 h-5"/> Save Project</button>
              </motion.form>
            )}

            <div className="space-y-4">
              {projects.sort((a,b)=>a.order-b.order).map(p => (
                <div key={p.id} className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-xl hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 bg-zinc-800 rounded overflow-hidden"><img src={p.imageUrl} alt="" className="w-full h-full object-cover"/></div>
                    <div><h4 className="text-white font-medium">{p.title}</h4><p className="text-gray-500 text-xs font-mono">Order: {p.order} • {p.role}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setCurrentProject(p); setIsEditing(true); }} className="p-2 bg-white/5 text-gray-300 hover:text-white rounded-lg transition-colors"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleDeleteProject(p.id)} className="p-2 bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))}
              {projects.length === 0 && <p className="text-gray-500">No projects found.</p>}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 w-full mb-20">
            <h3 className="text-2xl font-bold text-white mb-8">Inbox</h3>
            <div className="space-y-4">
              {messages.map(m => (
                <div key={m.id} className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <div><h4 className="text-white font-bold text-lg">{m.name}</h4><a href={`mailto:${m.email}`} className="text-orange-400 text-sm hover:underline">{m.email}</a></div>
                    <span className="text-gray-600 text-xs font-mono">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-300 bg-white/5 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">{m.message}</p>
                </div>
              ))}
              {messages.length === 0 && <p className="text-gray-500">No messages yet.</p>}
            </div>
          </div>
        )}
      </PageTransition>
    </div>
  );
};

export default AdminPage;