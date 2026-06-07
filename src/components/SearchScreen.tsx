/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, BookOpen, Clock } from 'lucide-react';
import { StudySheet } from '../types';

interface SearchScreenProps {
  sheets: StudySheet[];
  onSelectSheet?: (sheet: StudySheet) => void;
}

export default function SearchScreen({ sheets, onSelectSheet }: SearchScreenProps) {
  const [query, setQuery] = useState('');

  // Germany School Subjects for search suggestions & storage lookup
  const GERMAN_SUBJECTS = [
    'Mathematik', 'Deutsch', 'Englisch', 'Physik', 'Chemie', 
    'Biologie', 'Geschichte', 'Geographie', 'Latein', 'Französisch', 
    'Spanisch', 'Informatik', 'Wirtschaft & Recht', 'Sozialkunde', 
    'Kunst', 'Musik', 'Religion & Ethik', 'Sport'
  ];

  // Normalize value ignoring diacritics and casing for reliable matching
  const normalizeText = (str: string) => {
    return String(str || '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  // Handle live search matching any relevant fields
  const filtered = sheets.filter(sheet => {
    const qRaw = query.trim();
    if (qRaw === '') return false;
    
    const keywords = normalizeText(qRaw).split(/\s+/).filter(Boolean);
    if (keywords.length === 0) return false;

    const consolidatedText = normalizeText([
      sheet.titel,
      sheet.fach,
      sheet.schule,
      sheet.inhalt,
      sheet.autor
    ].join(' '));

    return keywords.every(kw => consolidatedText.includes(kw));
  });

  const getRelativeTime = (timeSec: number) => {
    const delta = Math.floor(Date.now() / 1000) - timeSec;
    if (delta < 60) return "Gerade eben";
    if (delta < 3600) return `vor ${Math.floor(delta / 60)} Min`;
    return `vor ${Math.floor(delta / 3600)} Std`;
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Live Search Inputs */}
      <div className="p-6 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 shrink-0">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 font-sans tracking-tight">Live Suche</h2>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search size={16} strokeWidth={2.5} />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Fächer, Themen, Schulen oder Namen..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Results panel container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {/* Germany School Subjects Grid */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Fächer-Schnellwahl (Deutschland)</h3>
          <div className="flex flex-wrap gap-2">
            {GERMAN_SUBJECTS.map((sub) => {
              const isSelected = query.toLowerCase() === sub.toLowerCase();
              return (
                <button
                  key={sub}
                  onClick={() => setQuery(isSelected ? '' : sub)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-650 text-white shadow-sm scale-102 font-bold' 
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-350 border border-slate-100 dark:border-slate-800'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {query.trim() === '' ? 'Verfügbare Zettel' : `Suchergebnisse (${filtered.length})`}
          </h3>
          
          {query.trim() === '' ? (
            sheets.length === 0 ? (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center justify-center">
                <BookOpen size={24} className="text-slate-300 dark:text-slate-700 mb-2" />
                <span>Noch keine Zettel im Hauptfeed hochgeladen.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {sheets.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onSelectSheet && onSelectSheet(item)}
                    className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl p-4 shadow-sm hover:border-slate-200 dark:hover:border-slate-800 transition-all flex items-center gap-3 cursor-pointer"
                  >
                    <img
                      src={item.image}
                      alt={item.titel}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                          {item.fach}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                          {getRelativeTime(item.createdAt)}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.titel}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.schule} • {item.autor}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-xs">
              Keine Ergebnisse für deine Suche gefunden.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelectSheet && onSelectSheet(item)}
                  className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl p-4 shadow-sm hover:border-slate-200 dark:hover:border-slate-800 transition-all flex items-center gap-3 cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.titel}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                        {item.fach}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                        {getRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.titel}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.schule} • {item.autor}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
