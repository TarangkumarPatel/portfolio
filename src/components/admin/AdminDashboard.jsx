"use client";
import React, { useState, useEffect } from 'react';
import { Lock, LogOut, Plus, Edit2, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { db, appId } from '@/lib/firebase';
import { INITIAL_PROJECTS } from '@/data/mockProjects';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const AdminDashboard = ({ onLogout, user }) => {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [messages, setMessages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!db || !user) return;
    
    const projectsQ = query(collection(db, 'artifacts', appId, 'public', 'data', 'projects'));
    const unsubProjects = onSnapshot(projectsQ, (snap) => {
      if (!snap.empty) {
        setProjects(snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
    });

    const messagesQ = query(collection(db, 'artifacts', appId, 'public', 'data', 'messages'));
    const unsubMessages = onSnapshot(messagesQ, (snap) => {
      setMessages(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    return () => {
      unsubProjects();
      unsubMessages();
    };
  }, [user]);

  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({ ...project, techStackStr: project.techStack.join(', ') });
  };

  const handleCreateNew = () => {
    setEditingId('new');
    setFormData({
      title: '', description: '', techStackStr: '', liveLink: '', githubLink: '', imageUrl: '', featured: false, order: projects.length + 1
    });
  };

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        techStack: formData.techStackStr ? formData.techStackStr.split(',').map(s => s.trim()) : []
      };
      delete dataToSave.techStackStr;

      if (db && user) {
        const collRef = collection(db, 'artifacts', appId, 'public', 'data', 'projects');
        if (editingId === 'new') {
          await addDoc(collRef, dataToSave);
        } else {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'projects', editingId), dataToSave);
        }
      }
      setEditingId(null);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (id) => {
     if (db && user) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'projects', id));
     }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="border-b border-white/10 bg-[#0A0A0A] px-6 md:px-12 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <Lock size={18} className="text-neutral-500" />
           <span className="font-bold tracking-widest uppercase text-sm">System Admin</span>
        </div>
        <button onClick={onLogout} className="text-neutral-400 hover:text-white flex items-center gap-2 text-sm">
          <LogOut size={16} /> Terminate Session
        </button>
      </nav>

      <div className="container mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
            <h1 className="text-3xl font-display font-bold">Projects Data</h1>
            <Button variant="primary" onClick={handleCreateNew} className="py-2 px-4 text-xs">
              <Plus size={16} className="mr-2" /> New Entry
            </Button>
          </div>

          {editingId ? (
            <div className="bg-[#0A0A0A] border border-white/10 p-8">
              <h3 className="text-xl font-bold mb-6">{editingId === 'new' ? 'Initialize New Project' : 'Edit Project Record'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase text-neutral-500 mb-2">Title</label>
                  <input type="text" className="w-full bg-transparent border border-white/20 p-2 outline-none focus:border-white" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs uppercase text-neutral-500 mb-2">Description</label>
                  <textarea rows={3} className="w-full bg-transparent border border-white/20 p-2 outline-none focus:border-white resize-none" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-neutral-500 mb-2">Tech Stack</label>
                    <input type="text" className="w-full bg-transparent border border-white/20 p-2 outline-none focus:border-white" value={formData.techStackStr || ''} onChange={e => setFormData({...formData, techStackStr: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-neutral-500 mb-2">Image URL</label>
                    <input type="text" className="w-full bg-transparent border border-white/20 p-2 outline-none focus:border-white" value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-neutral-500 mb-2">Live URL</label>
                    <input type="text" className="w-full bg-transparent border border-white/20 p-2 outline-none focus:border-white" value={formData.liveLink || ''} onChange={e => setFormData({...formData, liveLink: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-neutral-500 mb-2">GitHub URL</label>
                    <input type="text" className="w-full bg-transparent border border-white/20 p-2 outline-none focus:border-white" value={formData.githubLink || ''} onChange={e => setFormData({...formData, githubLink: e.target.value})} />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                   <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                     <input type="checkbox" checked={formData.featured || false} onChange={e => setFormData({...formData, featured: e.target.checked})} className="accent-white w-4 h-4" />
                     Featured Project
                   </label>
                </div>
                <div className="flex gap-4 pt-6 mt-6 border-t border-white/10">
                  <Button variant="primary" onClick={handleSave}>Commit Changes</Button>
                  <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map(proj => (
                <div key={proj.id} className="bg-[#0A0A0A] border border-white/5 p-4 flex justify-between items-center hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={proj.imageUrl || 'https://via.placeholder.com/50'} className="w-12 h-12 object-cover filter grayscale" alt="" />
                    <div>
                      <h4 className="font-medium">{proj.title}</h4>
                      <p className="text-xs text-neutral-500">{proj.featured ? 'Featured' : 'Standard'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => handleEdit(proj)} className="p-2 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
                       <Edit2 size={16} />
                     </button>
                     <button onClick={() => handleDelete(proj.id)} className="p-2 text-neutral-400 hover:text-red-500 bg-white/5 hover:bg-red-500/10 transition-colors">
                       <Trash2 size={16} />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-display font-bold">Incoming Transmissions</h2>
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {messages.length === 0 ? (
               <p className="text-neutral-500 text-sm">No messages received.</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="bg-[#0A0A0A] border border-white/5 p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-sm text-white">{msg.name}</h5>
                    <span className="text-[10px] text-neutral-600 uppercase tracking-wider">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <a href={`mailto:${msg.email}`} className="text-xs text-neutral-400 hover:text-white transition-colors mb-3 block">
                    {msg.email}
                  </a>
                  <p className="text-sm font-light text-neutral-300 leading-relaxed break-words">
                    {msg.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;