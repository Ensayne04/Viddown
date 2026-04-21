/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronDown, Check, X, Link } from 'lucide-react';

export default function App() {
  return (
    <div className="mesh-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-[420px] h-[700px] glass rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-white font-bold text-xl tracking-tight">VideoDownloader</div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-white/40"></div>
            <div className="w-2 h-2 rounded-full bg-white/40"></div>
            <div className="w-2 h-2 rounded-full bg-white/40"></div>
          </div>
        </div>

        <div className="orange-disclaimer rounded-2xl p-4 text-[11px] leading-relaxed mb-6">
          <span className="font-bold uppercase tracking-wider block mb-1">Legal Disclaimer</span>
          Respect copyright laws. This app is for personal use for content you have rights to.
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-white/60 text-[10px] uppercase tracking-widest font-semibold ml-1 mb-1.5 block">Source URL</label>
            <div className="relative flex gap-2">
              <input type="text" placeholder="https://..." className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white w-full outline-none focus:border-indigo-400" />
              <button className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold px-4 rounded-xl border border-indigo-500/30">PASTE</button>
            </div>
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
          <button className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all">START DOWNLOAD</button>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <div className="text-white font-medium text-xs">Downloading...</div>
            <div className="text-indigo-300 font-mono text-[10px]">45% • 2.4 MB/s</div>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="w-[45%] h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
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
    </div>
  );
}
