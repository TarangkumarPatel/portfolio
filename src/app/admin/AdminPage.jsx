"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Cropper from 'react-easy-crop';
import { Lock, Plus, Edit2, Trash2, Save, XCircle, ArrowLeft, LogOut, GripVertical, Check, X as XIcon, UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { PageTransition, MouseGradient, CustomCursor } from '@/components/ui/SharedUI';
import Footer from '@/components/layout/Footer';
import { RELATIONSHIP_OPTIONS } from '@/data/mockTestimonials';
import { getCroppedImageBlob } from '@/lib/cropImage';

const CROP_TARGETS = {
  desktop: { label: 'Desktop (4:5)', aspect: 4 / 5, previewClass: 'aspect-[4/5] w-[150px]' },
  mobile: { label: 'Mobile (3:2)', aspect: 3 / 2, previewClass: 'aspect-[3/2] w-[220px]' },
};

const AdminPage = () => {
  const [checkingSession, setCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginNotice, setLoginNotice] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [authView, setAuthView] = useState('login'); // 'login' | 'forgot-request' | 'forgot-reset'
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotNotice, setForgotNotice] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [hobbies, setHobbies] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  const [isEditingHobby, setIsEditingHobby] = useState(false);
  const [currentHobby, setCurrentHobby] = useState(null);

  const [isEditingTestimonial, setIsEditingTestimonial] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'avatar' | 'resume' }

  const [avatarSrc, setAvatarSrc] = useState(null);
  const [cropTarget, setCropTarget] = useState('desktop');
  const [cropState, setCropState] = useState({
    desktop: { crop: { x: 0, y: 0 }, zoom: 1, croppedAreaPixels: null },
    mobile: { crop: { x: 0, y: 0 }, zoom: 1, croppedAreaPixels: null },
  });
  const [previewUrls, setPreviewUrls] = useState({ desktop: null, mobile: null });
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarNotice, setAvatarNotice] = useState('');

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeSaving, setResumeSaving] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [resumeNotice, setResumeNotice] = useState('');

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [projects]
  );

  const sortedTestimonials = useMemo(
    () => [...testimonials].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [testimonials]
  );
  const pendingCount = useMemo(() => testimonials.filter(t => t.status === 'pending').length, [testimonials]);

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
      const [projRes, msgRes, hobRes, testRes] = await Promise.all([
        fetch('/api/admin/projects'),
        fetch('/api/admin/messages'),
        fetch('/api/admin/hobbies'),
        fetch('/api/admin/testimonials'),
      ]);
      if (projRes.ok) setProjects((await projRes.json()).projects);
      if (msgRes.ok) setMessages((await msgRes.json()).messages);
      if (hobRes.ok) setHobbies((await hobRes.json()).hobbies);
      if (testRes.ok) setTestimonials((await testRes.json()).testimonials);
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

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    setForgotNotice('');
    try {
      const res = await fetch('/api/admin/forgot-password', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setAuthView('forgot-reset');
        setForgotNotice('A reset code has been emailed to the registered admin address.');
      } else {
        setForgotError(data.error || 'Failed to send reset code');
      }
    } catch (err) {
      setForgotError('Failed to send reset code');
    }
    setForgotLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: resetCode, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setAuthView('login');
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotError('');
        setForgotNotice('');
        setLoginError('');
        setLoginNotice('Password updated — log in with your new password.');
      } else {
        setForgotError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setForgotError('Failed to reset password');
    }
    setForgotLoading(false);
  };

  const backToLogin = () => {
    setAuthView('login');
    setForgotError('');
    setForgotNotice('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleLogout = async () => {
    try { await fetch('/api/admin/logout', { method: 'POST' }); } catch {}
    setIsAuthenticated(false);
    setProjects([]);
    setMessages([]);
    setHobbies([]);
    setTestimonials([]);
  };

  const onAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarSrc(reader.result);
      setCropTarget('desktop');
      setCropState({
        desktop: { crop: { x: 0, y: 0 }, zoom: 1, croppedAreaPixels: null },
        mobile: { crop: { x: 0, y: 0 }, zoom: 1, croppedAreaPixels: null },
      });
      setPreviewUrls({ desktop: null, mobile: null });
      setAvatarError('');
      setAvatarNotice('');
    };
    reader.readAsDataURL(file);
  };

  const updateCrop = (target, changes) => {
    setCropState(prev => ({ ...prev, [target]: { ...prev[target], ...changes } }));
  };

  useEffect(() => {
    if (!avatarSrc) return;
    ['desktop', 'mobile'].forEach(async (target) => {
      const areaPixels = cropState[target].croppedAreaPixels;
      if (!areaPixels) return;
      try {
        const blob = await getCroppedImageBlob(avatarSrc, areaPixels);
        setPreviewUrls(prev => {
          if (prev[target]) URL.revokeObjectURL(prev[target]);
          return { ...prev, [target]: URL.createObjectURL(blob) };
        });
      } catch (err) {
        console.error('Failed to generate preview:', err);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarSrc, cropState.desktop.croppedAreaPixels, cropState.mobile.croppedAreaPixels]);

  const handleSaveAvatarClick = () => {
    if (!cropState.desktop.croppedAreaPixels || !cropState.mobile.croppedAreaPixels) {
      setAvatarError('Adjust both the desktop and mobile crops before saving.');
      return;
    }
    setAvatarError('');
    setConfirmAction({ type: 'avatar' });
  };

  const handleConfirmAvatarSave = async () => {
    setAvatarSaving(true);
    setAvatarError('');
    try {
      const [desktopBlob, mobileBlob] = await Promise.all([
        getCroppedImageBlob(avatarSrc, cropState.desktop.croppedAreaPixels),
        getCroppedImageBlob(avatarSrc, cropState.mobile.croppedAreaPixels),
      ]);
      const formData = new FormData();
      formData.append('type', 'avatar');
      formData.append('desktop', desktopBlob, 'avatar-desktop.jpg');
      formData.append('mobile', mobileBlob, 'avatar-mobile.jpg');
      const res = await fetch('/api/admin/profile', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Upload failed');
      }
      setAvatarNotice('Profile picture updated on the live site.');
      setAvatarSrc(null);
      setPreviewUrls({ desktop: null, mobile: null });
    } catch (err) {
      setAvatarError(err.message || 'Upload failed');
    }
    setAvatarSaving(false);
    setConfirmAction(null);
  };

  const onResumeFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    setResumeError('');
    setResumeNotice('');
  };

  const handleSaveResumeClick = () => {
    if (!resumeFile) return;
    setConfirmAction({ type: 'resume' });
  };

  const handleConfirmResumeSave = async () => {
    setResumeSaving(true);
    setResumeError('');
    try {
      const formData = new FormData();
      formData.append('type', 'resume');
      formData.append('file', resumeFile);
      const res = await fetch('/api/admin/profile', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Upload failed');
      }
      setResumeNotice('Resume updated on the live site.');
      setResumeFile(null);
    } catch (err) {
      setResumeError(err.message || 'Upload failed');
    }
    setResumeSaving(false);
    setConfirmAction(null);
  };

  const handleConfirmActionConfirm = () => {
    if (confirmAction?.type === 'avatar') handleConfirmAvatarSave();
    else if (confirmAction?.type === 'resume') handleConfirmResumeSave();
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

  const handleReorderTestimonials = (newOrder) => {
    const withOrder = newOrder.map((t, i) => ({ ...t, order: i + 1 }));
    setTestimonials(withOrder);
    Promise.all(withOrder.map(t =>
      fetch(`/api/admin/testimonials/${t.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t),
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

  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    try {
      const isEdit = Boolean(currentTestimonial.id);
      const res = await fetch(isEdit ? `/api/admin/testimonials/${currentTestimonial.id}` : '/api/admin/testimonials', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentTestimonial),
      });
      if (res.ok) {
        setIsEditingTestimonial(false);
        setCurrentTestimonial(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetTestimonialStatus = async (t, status) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...t, status }),
      });
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
    else if (type === 'testimonial') await handleDeleteTestimonial(id);
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
        <Link href="/" className="absolute top-8 left-8 text-neutral-500 hover:text-white flex items-center gap-2 z-50">
          <ArrowLeft size={20} /> Back to Site
        </Link>
        <PageTransition className="justify-center relative z-10">
          <div className="bg-zinc-900/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 max-w-sm w-full text-center">
            <Lock className="w-12 h-12 text-orange-500/50 mx-auto mb-6" />

            {authView === 'login' && (
              <>
                <h2 className="text-2xl font-bold text-white mb-2">Restricted Area</h2>
                <p className="text-gray-400 text-sm mb-8">Enter password to manage portfolio.</p>
                <form onSubmit={handleLogin}>
                  <input type="password" placeholder="Enter Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-center text-white text-xl tracking-widest mb-2 focus:outline-none focus:border-orange-500" autoFocus />
                  {loginError && <p className="text-red-500 text-xs mb-4">{loginError}</p>}
                  {loginNotice && !loginError && <p className="text-green-500 text-xs mb-4">{loginNotice}</p>}
                  {!loginError && !loginNotice && <div className="mb-6"></div>}
                  <button disabled={loggingIn} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">
                    {loggingIn ? 'Authenticating...' : 'Authenticate'}
                  </button>
                </form>
                <button type="button" onClick={() => { backToLogin(); setAuthView('forgot-request'); }} className="mt-5 text-gray-500 hover:text-white text-xs transition-colors">
                  Forgot password?
                </button>
              </>
            )}

            {authView === 'forgot-request' && (
              <>
                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-gray-400 text-sm mb-8">We&apos;ll email a one-time reset code to the registered admin address.</p>
                <form onSubmit={handleRequestReset}>
                  {forgotError && <p className="text-red-500 text-xs mb-4">{forgotError}</p>}
                  <button disabled={forgotLoading} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">
                    {forgotLoading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </form>
                <button type="button" onClick={backToLogin} className="mt-5 text-gray-500 hover:text-white text-xs transition-colors">
                  Back to login
                </button>
              </>
            )}

            {authView === 'forgot-reset' && (
              <>
                <h2 className="text-2xl font-bold text-white mb-2">Enter Reset Code</h2>
                <p className="text-gray-400 text-sm mb-6">{forgotNotice || 'Check your email for the 6-digit code.'}</p>
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <input type="text" inputMode="numeric" placeholder="6-digit code" value={resetCode} onChange={e => setResetCode(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-center text-white text-xl tracking-widest focus:outline-none focus:border-orange-500" autoFocus />
                  <input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-orange-500" />
                  <input type="password" placeholder="Confirm new password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-orange-500" />
                  {forgotError && <p className="text-red-500 text-xs">{forgotError}</p>}
                  <button disabled={forgotLoading} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">
                    {forgotLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
                <button type="button" onClick={() => setAuthView('forgot-request')} className="mt-5 text-gray-500 hover:text-white text-xs transition-colors">
                  Resend code
                </button>
                <span className="mx-2 text-gray-700 text-xs">·</span>
                <button type="button" onClick={backToLogin} className="mt-5 text-gray-500 hover:text-white text-xs transition-colors">
                  Back to login
                </button>
              </>
            )}
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
              <button onClick={() => setActiveTab('testimonials')} className={`relative shrink-0 px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${activeTab === 'testimonials' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>
                Testimonials
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">{pendingCount}</span>
                )}
              </button>
              <button onClick={() => setActiveTab('messages')} className={`shrink-0 px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${activeTab === 'messages' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>Messages</button>
              <button onClick={() => setActiveTab('profile')} className={`shrink-0 px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>Profile</button>
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

        {activeTab === 'testimonials' && (
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 w-full mb-20">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-white">Testimonials</h3>
              <button onClick={() => { setCurrentTestimonial({ name: '', title: '', organization: '', relationship: RELATIONSHIP_OPTIONS[0], message: '', linkedinUrl: '', avatarUrl: '', status: 'approved', order: testimonials.length + 1 }); setIsEditingTestimonial(true); }} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
                <Plus className="w-4 h-4" /> New Testimonial
              </button>
            </div>

            {isEditingTestimonial && (
              <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSaveTestimonial} className="bg-black/50 p-6 rounded-2xl border border-white/5 space-y-6 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-white font-bold">{currentTestimonial?.id ? 'Edit Testimonial' : 'New Testimonial'}</h4>
                  <button type="button" onClick={() => setIsEditingTestimonial(false)} className="text-gray-400 hover:text-white"><XCircle /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">Name</label><input required type="text" value={currentTestimonial?.name} onChange={e => setCurrentTestimonial({ ...currentTestimonial, name: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div>
                    <label className="block text-xs uppercase text-gray-500 mb-1">Relationship</label>
                    <select value={currentTestimonial?.relationship || RELATIONSHIP_OPTIONS[0]} onChange={e => setCurrentTestimonial({ ...currentTestimonial, relationship: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500">
                      {RELATIONSHIP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">Title / Designation</label><input required type="text" value={currentTestimonial?.title} onChange={e => setCurrentTestimonial({ ...currentTestimonial, title: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">Organization</label><input required type="text" value={currentTestimonial?.organization} onChange={e => setCurrentTestimonial({ ...currentTestimonial, organization: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div className="md:col-span-2"><label className="block text-xs uppercase text-gray-500 mb-1">Testimonial</label><textarea required rows={4} value={currentTestimonial?.message} onChange={e => setCurrentTestimonial({ ...currentTestimonial, message: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">LinkedIn (optional)</label><input type="url" value={currentTestimonial?.linkedinUrl || ''} onChange={e => setCurrentTestimonial({ ...currentTestimonial, linkedinUrl: e.target.value })} placeholder="https://..." className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div><label className="block text-xs uppercase text-gray-500 mb-1">Avatar URL (optional)</label><input type="url" value={currentTestimonial?.avatarUrl || ''} onChange={e => setCurrentTestimonial({ ...currentTestimonial, avatarUrl: e.target.value })} placeholder="https://..." className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500" /></div>
                  <div>
                    <label className="block text-xs uppercase text-gray-500 mb-1">Status</label>
                    <select value={currentTestimonial?.status || 'approved'} onChange={e => setCurrentTestimonial({ ...currentTestimonial, status: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-orange-500">
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="bg-white text-black font-bold py-3 px-8 rounded-lg flex items-center gap-2 hover:bg-gray-200"><Save className="w-5 h-5" /> Save Testimonial</button>
              </motion.form>
            )}

            <p className="text-gray-500 text-xs mb-4">Drag the handle to reorder — this order is reflected on the Testimonials page.</p>
            <Reorder.Group axis="y" values={sortedTestimonials} onReorder={handleReorderTestimonials} className="space-y-4">
              {sortedTestimonials.map(t => (
                <Reorder.Item key={t.id} value={t} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/40 border border-white/5 p-4 rounded-xl hover:border-white/20 transition-colors">
                  <div className="flex items-start gap-4 min-w-0">
                    <GripVertical className="w-4 h-4 text-gray-600 cursor-grab active:cursor-grabbing shrink-0 mt-1" />
                    <span className={`shrink-0 mt-1 text-[10px] font-mono uppercase px-2 py-1 rounded-full ${t.status === 'approved' ? 'bg-green-500/10 text-green-400' : t.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {t.status || 'pending'}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-white font-medium">{t.name} <span className="text-gray-500 text-xs font-normal">· {t.title}{t.organization ? `, ${t.organization}` : ''}</span></h4>
                      <p className="text-gray-400 text-xs line-clamp-2 max-w-xl mt-1">{t.message}</p>
                      {t.email && <p className="text-gray-600 text-[11px] font-mono mt-1">{t.email}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {t.status !== 'approved' && (
                      <button onClick={() => handleSetTestimonialStatus(t, 'approved')} title="Approve" className="p-2 bg-green-500/10 text-green-400 hover:text-green-300 rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                    )}
                    {t.status !== 'rejected' && (
                      <button onClick={() => handleSetTestimonialStatus(t, 'rejected')} title="Reject" className="p-2 bg-yellow-500/10 text-yellow-400 hover:text-yellow-300 rounded-lg transition-colors"><XIcon className="w-4 h-4" /></button>
                    )}
                    <button onClick={() => { setCurrentTestimonial(t); setIsEditingTestimonial(true); }} className="p-2 bg-white/5 text-gray-300 hover:text-white rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => requestDelete('testimonial', t.id, `testimonial from ${t.name}`)} className="p-2 bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            {!loadingData && testimonials.length === 0 && <p className="text-gray-500">No testimonials found. Share the hidden submission link with a professor or manager to collect one.</p>}
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

        {activeTab === 'profile' && (
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 w-full mb-20 space-y-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-orange-400" /> Profile Picture</h3>
              <p className="text-gray-500 text-sm mb-6">Upload a photo, crop it for both the desktop and mobile home page cards, then confirm to publish.</p>

              <label className="flex items-center gap-3 w-fit bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-lg cursor-pointer text-sm font-medium transition-colors mb-6">
                <UploadCloud className="w-4 h-4" /> Choose Image
                <input type="file" accept="image/*" onChange={onAvatarFileChange} className="hidden" />
              </label>

              {avatarSrc && (
                <div className="space-y-6">
                  <div className="flex gap-2">
                    {Object.entries(CROP_TARGETS).map(([key, cfg]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCropTarget(key)}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${cropTarget === key ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full h-80 bg-black rounded-xl overflow-hidden">
                    <Cropper
                      image={avatarSrc}
                      crop={cropState[cropTarget].crop}
                      zoom={cropState[cropTarget].zoom}
                      aspect={CROP_TARGETS[cropTarget].aspect}
                      onCropChange={(crop) => updateCrop(cropTarget, { crop })}
                      onZoomChange={(zoom) => updateCrop(cropTarget, { zoom })}
                      onCropComplete={(_, croppedAreaPixels) => updateCrop(cropTarget, { croppedAreaPixels })}
                    />
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={cropState[cropTarget].zoom}
                    onChange={(e) => updateCrop(cropTarget, { zoom: Number(e.target.value) })}
                    className="w-full"
                  />

                  <div>
                    <p className="text-gray-500 text-xs uppercase font-mono mb-3">Live preview — exactly how it will look on the home page</p>
                    <div className="flex gap-8 items-end">
                      {Object.entries(CROP_TARGETS).map(([key, cfg]) => (
                        <div key={key} className="text-center">
                          <div className={`${cfg.previewClass} rounded-[2rem] overflow-hidden border border-white/10 bg-black mb-2`}>
                            {previewUrls[key] ? (
                              <img src={previewUrls[key]} alt={`${cfg.label} preview`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Adjust crop</div>
                            )}
                          </div>
                          <span className="text-gray-500 text-xs">{cfg.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {avatarError && <p className="text-red-500 text-xs">{avatarError}</p>}
                  <button onClick={handleSaveAvatarClick} disabled={avatarSaving} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium disabled:opacity-50">
                    <Save className="w-4 h-4" /> Save Profile Picture
                  </button>
                </div>
              )}
              {avatarNotice && !avatarSrc && <p className="text-green-500 text-sm">{avatarNotice}</p>}
            </div>

            <div className="border-t border-white/10 pt-10">
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><FileText className="w-5 h-5 text-orange-400" /> Resume</h3>
              <p className="text-gray-500 text-sm mb-6">Upload a PDF to replace the resume linked from the home page.</p>

              <label className="flex items-center gap-3 w-fit bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-lg cursor-pointer text-sm font-medium transition-colors mb-4">
                <UploadCloud className="w-4 h-4" /> Choose PDF
                <input type="file" accept="application/pdf" onChange={onResumeFileChange} className="hidden" />
              </label>

              {resumeFile && <p className="text-gray-400 text-sm mb-4">Selected: {resumeFile.name}</p>}
              {resumeError && <p className="text-red-500 text-xs mb-4">{resumeError}</p>}
              {resumeNotice && !resumeFile && <p className="text-green-500 text-sm mb-4">{resumeNotice}</p>}

              {resumeFile && (
                <button onClick={handleSaveResumeClick} disabled={resumeSaving} className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium disabled:opacity-50">
                  <Save className="w-4 h-4" /> Update Resume
                </button>
              )}
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

      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
            onClick={() => !avatarSaving && !resumeSaving && setConfirmAction(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center"
            >
              {confirmAction.type === 'avatar' ? <ImageIcon className="w-10 h-10 text-orange-400 mx-auto mb-5" /> : <FileText className="w-10 h-10 text-orange-400 mx-auto mb-5" />}
              <h4 className="text-white text-lg font-bold mb-2">
                {confirmAction.type === 'avatar' ? 'Update your profile picture?' : 'Replace your resume?'}
              </h4>
              <p className="text-gray-400 text-sm mb-8">This will go live on the site immediately.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmAction(null)} disabled={avatarSaving || resumeSaving} className="flex-1 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-medium disabled:opacity-50">Cancel</button>
                <button onClick={handleConfirmActionConfirm} disabled={avatarSaving || resumeSaving} className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium transition-colors disabled:opacity-50">
                  {avatarSaving || resumeSaving ? 'Saving...' : 'Yes, confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
