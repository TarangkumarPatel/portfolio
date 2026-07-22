"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Lock, Plus, Edit2, Trash2, Save, XCircle, ArrowLeft, LogOut, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { PageTransition, MouseGradient, CustomCursor } from '@/components/ui/SharedUI';
import Footer from '@/components/layout/Footer';

const AdminPage = () => {
  const [checkingSession, setCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [hobbies, setHobbies] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  const [isEditingHobby, setIsEditingHobby] = useState(false);
  const [currentHobby, setCurrentHobby] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(null);

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [projects]
  );

  useEffect(() => {
    fetch('/api/admin/session')
      .then(res => res.json())
      .then(data => setIsAuthenticated(!!data.authenticated))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setCheckingSession(false));
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [projRes, msgRes, hobRes] = await Promise.all([
        fetch('/api/admin/projects'),
        fetch('/api/admin/messages'),
        fetch('/api/admin/hobbies'),
      ]);
      if (projRes.ok) setProjects((await projRes.json()).projects);
      if (msgRes.ok) setMessages((await msgRes.json()).messages);
      if (hobRes.ok) setHobbies((await hobRes.json()).hobbies);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
    setLoadingData(false);
  };

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        const data = await res.json().catch(() => ({}));
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Login failed');
    }
    setLoggingIn(false);
  };

  const handleLogout = async () => {
    try { await fetch('/api/admin/logout', { method: 'POST' }); } catch {}
    setIsAuthenticated(false);
    setProjects([]);
    setMessages([]);
    setHobbies([]);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      const projData = {
        ...currentProject,
        tech: typeof currentProject.tech === 'string' ? currentProject.tech.split(',').map(t => t.trim()).filter(Boolean) : currentProject.tech,
        order: Number(currentProject.order) || 0,
      };
      const isEdit = Boolean(projData.id);
      const res = await fetch(isEdit ? `/api/admin/projects/${projData.id}` : '/api/admin/projects', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projData),
      });
      if (res.ok) {
        setIsEditing(false);
        setCurrentProject(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReorderProjects = (newOrder) => {
    const withOrder = newOrder.map((p, i) => ({ ...p, order: i + 1 }));
    setProjects(withOrder);
    Promise.all(withOrder.map(p =>
      fetch(`/api/admin/projects/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      })
    )).catch(err => console.error(err));
  };

  const handleDeleteMessage = async (id) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveHobby = async (e) => {
    e.preventDefault();
    try {
      const isEdit = Boolean(currentHobby.id);
      const res = await fetch(isEdit ? `/api/admin/hobbies/${currentHobby.id}` : '/api/admin/hobbies', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentHobby),
      });
      if (res.ok) {
        setIsEditingHobby(false);
        setCurrentHobby(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHobby = async (id) => {
    try {
      const res = await fetch(`/api/admin/hobbies/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const requestDelete = (type, id, label) => setConfirmDelete({ type, id, label });

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    if (type === 'project') await handleDeleteProject(id);
    else if (type === 'message') await handleDeleteMessage(id);
    else if (type === 'hobby') await handleDeleteHobby(id);
    setConfirmDelete(null);
  };

  if (checkingSession) {
    return <div className="min-h-screen bg-[#050505]" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
        <CustomCursor />
        <MouseGradient />
        <Link href="/" className="absolute top-8 left-8 text-neutral-500 hover:text-white flex items-center gap-2 z-10">
          <ArrowLeft size={20} /> Back to Site
        </Link>
        <PageTransition className="justify-center relative z-10">
          <div className="bg-zinc-900/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 max-w-sm w-full text-center">
            <Lock className="w-12 h-12 text-orange-500/50 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Restricted Area</h2>
            <p className="text-gray-400 text-sm mb-8">Enter password to manage portfolio.</p>
            <form onSubmit={handleLogin}>
              <input type="password" placeholder="Enter Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-center text-white text-xl tracking-widest mb-2 focus:outline-none focus:border-orange-500" autoFocus />
              {loginError && <p className="text-red-500 text-xs mb-4">{loginError}</p>}
              {!loginError && <div className="mb-6"></div>}
              <button disabled={loggingIn} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">
                {loggingIn ? 'Authenticating...' : 'Authenticate'}
              </button>
            </form>
          </div>
        </PageTransition>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] overflow-y-auto overflow-x-hidden relative pt-12">
      <CustomCursor />
      <MouseGradient />
      <Link href="/" className="absolute top-8 left-8 text-neutral-500 hover:text-white flex items-center gap-2 z-50">
        <ArrowLeft size={20} /> Back to Site
      </Link>

      <PageTransition className="relative z-10 max-w-7xl mx-auto flex-col items-start justify-start w-full !pt-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-12 w-full">
          <h2 className="text-2xl md:text-4xl font-bold text-white flex items-center gap-3 md:gap-4"><Lock className="text-orange-400 w-5 h-5 md:w-6 md:h-6" /> Command Center</h2>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex gap-1 md:gap-2 p-1 bg-white/5 border border-white/10 rounded-xl overflow-x-auto no-scrollbar">
              <button onClick={() => setActiveTab('projects')} className={`shrink-0 px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${activeTab === 'projects' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>Projects</button>
              <button onClick={() => setActiveTab('hobbies')} className={`shrink-0 px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${activeTab === 'hobbies' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>Hobbies</button>
              <button onClick={() => setActiveTab('messages')} className={`shrink-0 px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${activeTab === 'messages' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>Messages</button>
            </div>
            <button onClick={handleLogout} className="shrink-0 flex items-center gap-2 text-gray-400 hover:text-white text-xs md:text-sm px-2 md:px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {activeTab === 'projects' && (
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 w-full mb-20">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-white">Project Roster</h3>
              <button onClick={() => { setCurrentProject({ title: '', description: '', tech: '', liveLink: '', githubLink: '', imageUrl: '', order: projects.length + 1 }); setIsEditing(true); }} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
                <Plus className="w-4 h-4" /> New Project
              </button>
            </div>

            {isEditing && (
              <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSaveProject} className="bg-black/50 p-6 rounded-2xl border border-white/5 space-y-6 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-white font-bold">{currentProject?.id ? 'Edit Project' : 'New Project'}</h4>
                  <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white"><XCircle /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2"><label className="block text-xs uppercase text-gray-500 mb-1">Title</label><input required type="text" value={currentProject?.title} onChange={e => setCurrentProject({ ...currentProject, title: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div className="md:col-span-2"><label className="block text-xs uppercase text-gray-500 mb-1">Description</label><textarea required rows={3} value={currentProject?.description} onChange={e => setCurrentProject({ ...currentProject, description: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">Image URL</label><input required type="url" value={currentProject?.imageUrl} onChange={e => setCurrentProject({ ...currentProject, imageUrl: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">Tech Stack (comma separated)</label><input required type="text" value={Array.isArray(currentProject?.tech) ? currentProject.tech.join(', ') : currentProject?.tech} onChange={e => setCurrentProject({ ...currentProject, tech: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">Live Link</label><input required type="url" value={currentProject?.liveLink} onChange={e => setCurrentProject({ ...currentProject, liveLink: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">GitHub Link</label><input required type="url" value={currentProject?.githubLink} onChange={e => setCurrentProject({ ...currentProject, githubLink: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                </div>
                <button type="submit" className="bg-white text-black font-bold py-3 px-8 rounded-lg flex items-center gap-2 hover:bg-gray-200"><Save className="w-5 h-5" /> Save Project</button>
              </motion.form>
            )}

            <p className="text-gray-500 text-xs mb-4">Drag the handle to reorder — this order is reflected on the Works page.</p>
            <Reorder.Group axis="y" values={sortedProjects} onReorder={handleReorderProjects} className="space-y-4">
              {sortedProjects.map(p => (
                <Reorder.Item key={p.id} value={p} className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-xl hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-4 h-4 text-gray-600 cursor-grab active:cursor-grabbing shrink-0" />
                    <div className="w-16 h-12 bg-zinc-800 rounded overflow-hidden shrink-0"><img src={p.imageUrl} alt="" className="w-full h-full object-cover" /></div>
                    <div><h4 className="text-white font-medium">{p.title}</h4></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setCurrentProject(p); setIsEditing(true); }} className="p-2 bg-white/5 text-gray-300 hover:text-white rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => requestDelete('project', p.id, p.title)} className="p-2 bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            {!loadingData && projects.length === 0 && <p className="text-gray-500">No projects found.</p>}
          </div>
        )}

        {activeTab === 'hobbies' && (
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 w-full mb-20">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-white">Interests</h3>
              <button onClick={() => { setCurrentHobby({ title: '', description: '', imageUrl: '', link: '' }); setIsEditingHobby(true); }} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
                <Plus className="w-4 h-4" /> New Hobby
              </button>
            </div>

            {isEditingHobby && (
              <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSaveHobby} className="bg-black/50 p-6 rounded-2xl border border-white/5 space-y-6 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-white font-bold">{currentHobby?.id ? 'Edit Hobby' : 'New Hobby'}</h4>
                  <button type="button" onClick={() => setIsEditingHobby(false)} className="text-gray-400 hover:text-white"><XCircle /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2"><label className="block text-xs uppercase text-gray-500 mb-1">Title</label><input required type="text" value={currentHobby?.title} onChange={e => setCurrentHobby({ ...currentHobby, title: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div className="md:col-span-2"><label className="block text-xs uppercase text-gray-500 mb-1">Description</label><textarea required rows={3} value={currentHobby?.description} onChange={e => setCurrentHobby({ ...currentHobby, description: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">Image URL</label><input required type="url" value={currentHobby?.imageUrl} onChange={e => setCurrentHobby({ ...currentHobby, imageUrl: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">Link (optional)</label><input type="url" value={currentHobby?.link || ''} onChange={e => setCurrentHobby({ ...currentHobby, link: e.target.value })} placeholder="https://..." className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                </div>
                <button type="submit" className="bg-white text-black font-bold py-3 px-8 rounded-lg flex items-center gap-2 hover:bg-gray-200"><Save className="w-5 h-5" /> Save Hobby</button>
              </motion.form>
            )}

            <div className="space-y-4">
              {hobbies.map(h => (
                <div key={h.id} className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-xl hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 bg-zinc-800 rounded overflow-hidden shrink-0"><img src={h.imageUrl} alt="" className="w-full h-full object-cover" /></div>
                    <div><h4 className="text-white font-medium">{h.title}</h4><p className="text-gray-500 text-xs font-mono">{h.link ? h.link : 'No link'}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setCurrentHobby(h); setIsEditingHobby(true); }} className="p-2 bg-white/5 text-gray-300 hover:text-white rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => requestDelete('hobby', h.id, h.title)} className="p-2 bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {!loadingData && hobbies.length === 0 && <p className="text-gray-500">No hobbies found.</p>}
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
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 text-xs font-mono">{new Date(m.createdAt).toLocaleDateString()}</span>
                      <button onClick={() => requestDelete('message', m.id, `message from ${m.name}`)} className="p-2 bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-gray-300 bg-white/5 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">{m.message}</p>
                </div>
              ))}
              {!loadingData && messages.length === 0 && <p className="text-gray-500">No messages yet.</p>}
            </div>
          </div>
        )}
      </PageTransition>
      <Footer />

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-5" />
              <h4 className="text-white text-lg font-bold mb-2">Delete {confirmDelete.label}?</h4>
              <p className="text-gray-400 text-sm mb-8">This action can't be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-medium">No, keep it</button>
                <button onClick={handleConfirmDelete} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-colors">Yes, delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
