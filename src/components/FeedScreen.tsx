/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Heart, Search, Filter, Clock, BookOpen, Check } from 'lucide-react';
import { StudySheet, UserProfile } from '../types';

interface FeedScreenProps {
  sheets: StudySheet[];
  currentUserId: string | null;
  onLike: (sheetId: string) => void;
  avatarBase64: string | null;
  userProfile?: UserProfile | null;
  onDelete?: (sheetId: string) => void;
}

const POPULAR_SUBJECTS = ["Mathe", "Biologie", "Physik", "Chemie", "Geschichte", "Deutsch", "Englisch"];

export default function FeedScreen({ sheets, currentUserId, onLike, avatarBase64, userProfile, onDelete }: FeedScreenProps) {
  const [filterSubject, setFilterSubject] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [activeSort, setActiveSort] = useState<'newest' | 'oldest' | 'popular'>('newest');

  const normalizeText = (str: string) => {
    return String(str || '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  // Filter study sheets based on input and profile preference
  const filteredSheets = sheets.filter(item => {
    // Live Search
    const matchSubject = !filterSubject || normalizeText(item.fach).includes(normalizeText(filterSubject));
    const matchSchool = !filterSchool || normalizeText(item.schule).includes(normalizeText(filterSchool));
    
    // User Preferred subjects filter synced from settings
    if (userProfile?.isFilterPreferredFeed && userProfile.preferredSubjects && userProfile.preferredSubjects.length > 0) {
      const isPreferred = userProfile.preferredSubjects.some(
        pref => normalizeText(item.fach) === normalizeText(pref)
      );
      if (!isPreferred) return false;
    }

    return matchSubject && matchSchool;
  });

  // Sort study sheets based on selected criteria
  const sortedSheets = [...filteredSheets].sort((a, b) => {
    if (activeSort === 'newest') {
      return b.createdAt - a.createdAt;
    } else if (activeSort === 'oldest') {
      return a.createdAt - b.createdAt;
    } else if (activeSort === 'popular') {
      return b.likes - a.likes;
    }
    return 0;
  });

  // Relative timestamp representation
  const getRelativeTime = (timeSec: number) => {
    const delta = Math.floor(Date.now() / 1000) - timeSec;
    if (delta < 60) return "Gerade eben";
    if (delta < 3600) return `vor ${Math.floor(delta / 60)} Min`;
    if (delta < 86400) return `vor ${Math.floor(delta / 3600)} Std`;
    return `vor ${Math.floor(delta / 86400)} Tagen`;
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Filtering & Sorting Panel */}
      <div className="px-6 py-4 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 space-y-3 shrink-0">
        
        {/* Live Search Inputs */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              placeholder="Fach filtern (z.B. Mathe)..."
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
            />
            {filterSubject && (
              <button 
                onClick={() => setFilterSubject('')} 
                className="absolute right-2.5 top-1.5 text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              placeholder="Schule filtern..."
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Quick Subject Badge Chips (Live filter row) */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 select-none shrink-0 scroll-smooth">
          <button
            onClick={() => setFilterSubject('')}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all shrink-0 cursor-pointer ${!filterSubject ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-200'}`}
          >
            Alle Fächer
          </button>
          {POPULAR_SUBJECTS.map(subj => {
            const isActive = filterSubject.toLowerCase() === subj.toLowerCase();
            return (
              <button
                key={subj}
                onClick={() => setFilterSubject(isActive ? '' : subj)}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all shrink-0 cursor-pointer ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-200'}`}
              >
                {subj}
              </button>
            );
          })}
        </div>

        {/* Active Preference Notification Banner */}
        {userProfile?.isFilterPreferredFeed && (
          <div className="flex items-center gap-1.5 py-1 px-3 bg-blue-50/75 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-semibold border border-blue-100/40">
            <Check size={10} className="stroke-[3]" />
            <span>Feed personalisiert: Zeigt nur deine bevorzugten Fächer (Mathe, Bio, Geschichte...)</span>
          </div>
        )}

        <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
          <span className="font-medium flex items-center gap-1">
            <Filter size={11} /> Sortieren nach:
          </span>
          <div className="flex gap-2 font-mono">
            <button
              onClick={() => setActiveSort('newest')}
              className={`font-semibold cursor-pointer ${activeSort === 'newest' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'hover:text-slate-800 dark:hover:text-slate-250'}`}
            >
              Neueste
            </button>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <button
              onClick={() => setActiveSort('oldest')}
              className={`font-semibold cursor-pointer ${activeSort === 'oldest' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'hover:text-slate-800 dark:hover:text-slate-250'}`}
            >
              Älteste
            </button>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <button
              onClick={() => setActiveSort('popular')}
              className={`font-semibold cursor-pointer ${activeSort === 'popular' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'hover:text-slate-800 dark:hover:text-slate-250'}`}
            >
              Beliebteste
            </button>
          </div>
        </div>
      </div>

      {/* Feed Cards List */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scroll-smooth [-webkit-overflow-scrolling:touch] overscroll-y-contain">
        {sortedSheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-200/50 dark:border-slate-800">
              <BookOpen size={24} className="text-slate-500 dark:text-slate-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Keine Zettel gefunden</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-[200px] leading-relaxed">
              Passe deine Filter an oder lade eigene Mitschriften hoch!
            </p>
          </div>
        ) : (
          sortedSheets.map((item) => {
            const isLiked = currentUserId ? item.likedBy.includes(currentUserId) : false;
            return (
              <div 
                key={item.id} 
                className="bg-white dark:bg-slate-950 border border-slate-100/85 dark:border-slate-900 rounded-2xl overflow-hidden shadow-elegant hover:border-slate-200 dark:hover:border-slate-800 transition-all"
              >
                {/* Header */}
                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-slate-100 dark:border-slate-900 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center overflow-hidden">
                      {avatarBase64 && item.autorId === currentUserId ? (
                        <img src={avatarBase64} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        item.autor.charAt(1).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-250">{item.autor}</span>
                      <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">{item.schule}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-100/50 dark:border-blue-900/40 px-2.5 py-1 rounded-full">
                      {item.fach}
                    </span>
                  </div>
                </div>

                {/* Study Sheet Image Rendering */}
                <div className="w-full bg-slate-900/5 dark:bg-slate-900/40 aspect-video overflow-hidden border-y border-slate-50 dark:border-slate-900 flex items-center justify-center">
                  <img 
                    src={item.image} 
                    alt={item.titel} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Metadata & Actions */}
                <div className="p-5 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                    {item.titel}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed whitespace-pre-wrap">
                    {item.inhalt}
                  </p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-900 text-[9px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> Gepostet {getRelativeTime(item.createdAt)}
                    </span>
                    <button 
                      onClick={() => onLike(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-pointer ${
                        isLiked 
                          ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400' 
                          : 'bg-slate-50 border-slate-100 text-slate-400 dark:bg-slate-900 dark:border-slate-850 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100'
                      } transition-all`}
                    >
                      <Heart size={13} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'scale-110' : ''} />
                      <span className="font-mono font-bold text-[11px]">{item.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
