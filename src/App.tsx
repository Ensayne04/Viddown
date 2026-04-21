/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronDown, Check, X, Link, LogIn, LogOut } from 'lucide-react';
import { motion } from "motion/react";
import { useState, useEffect } from 'react';
import { auth, googleProvider, facebookProvider, signInWithPopup } from './services/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (provider: any) => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (!downloadId || status === 'completed' || status === 'failed') return;
    
    const interval = setInterval(async () => {
      const res = await fetch(`/api/download/${downloadId}/status`);
      const data = await res.json();
      setStatus(data.status);
      setProgress(data.progress);
      setSpeed(data.speed);
      if (data.status === 'completed') setNotification({message: 'Download completed!', type: 'success'});
      else if (data.status === 'failed') setNotification({message: 'Download failed!', type: 'error'});
    }, 1000);
    return () => clearInterval(interval);
  }, [downloadId, status]);

  useEffect(() => {
    if (notification) setTimeout(() => setNotification(null), 5000);
  }, [notification]);

  const startDownload = async () => {
    // Basic YouTube URL regex
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!url || !youtubeRegex.test(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    setError('');
    
    const res = await fetch('/api/download/start', { 
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({ url }) 
    });
    const { id } = await res.json();
    setDownloadId(id);
    setStatus('downloading');
  };

  const manageDownload = async (action: string) => {
    if (!downloadId) return;
    const res = await fetch(`/api/download/${downloadId}/${action}`, { method: 'POST' });
    const { status: newStatus } = await res.json();
    setStatus(newStatus);
  };

  return (
    <div className="mesh-bg min-h-screen flex items-center justify-center p-4">
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-xl text-white font-bold z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}
      <div className="w-[420px] h-[700px] glass rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-white font-bold text-xl tracking-tight">VideoDownloader</div>
          {user ? (
            <button onClick={() => signOut(auth)} className="text-white/60 hover:text-white">
              <LogOut size={20} />
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => handleLogin(googleProvider)} className="text-white/60 hover:text-white text-xs">Google</button>
              <button onClick={() => handleLogin(facebookProvider)} className="text-white/60 hover:text-white text-xs">Facebook</button>
            </div>
          )}
        </div>
        
        {user ? (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="orange-disclaimer rounded-2xl p-4 leading-relaxed mb-6">
              <span className="font-bold uppercase tracking-wider block mb-1">Legal Disclaimer</span>
              Respect copyright laws. This app is for personal use for content you have rights to.
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-white/60 text-[10px] uppercase tracking-widest font-semibold ml-1 mb-1.5 block">Source URL</label>
                <div className="relative flex gap-2">
                  <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..." 
                    className={`bg-white/10 border ${error ? 'border-red-500' : 'border-white/20'} rounded-xl px-4 py-3 text-sm text-white w-full outline-none focus:border-indigo-400`} 
                  />
                  <button 
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        setUrl(text);
                        setError('');
                      } catch (err) {
                        setError('Could not access clipboard');
                      }
                    }}
                    className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold px-4 rounded-xl border border-indigo-500/30"
                  >PASTE</button>
                </div>
                {error && <p className="text-red-400 text-[10px] mt-1 ml-1">{error}</p>}
              </div>
              <div>
                <label className="text-white/60 text-[10px] uppercase tracking-widest font-semibold ml-1 mb-1.5 block">Video Quality</label>
                <div className="relative">
                  <select className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white w-full appearance-none outline-none focus:border-indigo-400">
                    <option>Best Quality (Video + Audio)</option>
                    <option>Medium Quality (720p)</option>
                    <option>Audio Only (MP3)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                    <ChevronDown size={16} color="white" />
                  </div>
                </div>
              </div>
              <button onClick={startDownload} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all">START DOWNLOAD</button>
            </div>
            {downloadId && (
              <div className="flex gap-2">
                <button onClick={() => manageDownload('pause')} className="flex-1 bg-yellow-500/20 text-yellow-300 py-2 rounded-xl text-xs font-bold">PAUSE</button>
                <button onClick={() => manageDownload('resume')} className="flex-1 bg-green-500/20 text-green-300 py-2 rounded-xl text-xs font-bold">RESUME</button>
                <button onClick={() => manageDownload('cancel')} className="flex-1 bg-red-500/20 text-red-300 py-2 rounded-xl text-xs font-bold">CANCEL</button>
              </div>
            )}

            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <div className="text-white font-medium text-xs">Downloading...</div>
                <div className="text-indigo-300 font-mono text-[10px]">{progress.toFixed(0)}% • {(speed / 1024 / 1024).toFixed(2)} MB/s</div>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "linear" }}
                  className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="text-white/60 text-[10px] uppercase tracking-widest font-semibold mb-3">History</div>
              <div className="space-y-2 overflow-hidden overflow-y-auto">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                    <Check size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-medium truncate">summer_vlog_final.mp4</div>
                    <div className="text-white/40 text-[10px]">Completed • 124 MB</div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3 opacity-60">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                    <X size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-medium truncate">invalid_stream_link.mov</div>
                    <div className="text-white/40 text-[10px]">Error: Private Content</div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Link size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-medium truncate">cooking_tutorial_1080p.mp4</div>
                    <div className="text-white/40 text-[10px]">Queued</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white">Please log in to start downloading.</div>
        )}
      </div>
    </div>
  );
}
