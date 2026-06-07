/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface PrivacyViewProps {
  onBack: () => void;
  language: 'de' | 'en';
}

export default function PrivacyView({ onBack, language }: PrivacyViewProps) {
  return (
    <div id="privacy-container" className="flex flex-col h-full bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans select-text overflow-y-auto p-6 no-scrollbar">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-900 mb-6 shrink-0 select-none">
        <div>
          <h1 className="text-base font-black tracking-tight">{language === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}</h1>
          <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">QED Study App • DSGVO / GDPR Compliant</p>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold rounded-xl cursor-pointer select-none transition-colors"
        >
          {language === 'de' ? 'Zurück' : 'Back'}
        </button>
      </div>

      {language === 'de' ? (
        <div className="space-y-4 text-xs leading-relaxed max-w-prose">
          <section className="space-y-1">
            <h2 className="font-bold text-slate-900 dark:text-white">1. Verantwortlicher & Betreiber</h2>
            <p>Verantwortlich für die Datenerfassung und Datenverarbeitung in dieser Anwendung ist:</p>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] font-mono whitespace-pre-wrap">
{`Betreiber: Jonas
Ort: Stuttgart, Deutschland`}
            </div>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-slate-900 dark:text-white">2. Erfassung personenbezogener Daten</h2>
            <p>Zur Bereitstellung unseres Dienstes erfassen wir folgende Benutzerdaten direkt aus dem Google-Sign-In oder den manuell getätigten Einstellungen:</p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li><strong>Anzeigename (Display Name):</strong> Dient zur Zuordnung von Beitrags-Scans im Schüler-Netzwerk.</li>
              <li><strong>E-Mail-Adresse:</strong> Zur Sicherung der Cloud-Synchronisierung via Firebase Auth.</li>
              <li><strong>Profilbild:</strong> Optionale visuelle Kennzeichnung für deinen Account.</li>
              <li><strong>Lernzettel & Mitschriften:</strong> Fotoaufnahmen inkl. OCR-Rohdaten und verzeichnete Fächerwerte.</li>
            </ul>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-slate-900 dark:text-white">3. Firebase-Cloudspeicher & Sicherheit</h2>
            <p>Alle deine Daten werden in der geschützten Firebase Cloud-Infrastruktur gespeichert. Der Zugriff wird durch strenge Sicherheitsregeln (Firestore Security Rules) reglementiert, welche unbefugtes Lesen und Schreiben blockieren.</p>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-slate-900 dark:text-white">4. Rechte nach DSGVO (Löschen & Export)</h2>
            <p>Du besitzt jederzeit das vollständige Recht auf:</p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li><strong>Auskunft und Export:</strong> Du kannst deine Daten gesammelt als ZIP-Archiv im Einstellungsmenü herunteladen.</li>
              <li><strong>Sofortige Löschung (Recht auf Vergessenwerden):</strong> Über die Gefahrzone in den Einstellungen werden dein Firestore-Dokument und all deine geteilten Lernzettel unwiderruflich und rückstandslos gelöscht.</li>
            </ul>
          </section>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono pt-4 border-t border-slate-100 dark:border-slate-900">
            Letzte Aktualisierung: Juni 2026 • Betreiber Jonas (Stuttgart)
          </p>
        </div>
      ) : (
        <div className="space-y-4 text-xs leading-relaxed max-w-prose">
          <section className="space-y-1">
            <h2 className="font-bold text-slate-900 dark:text-white">1. Data Controller</h2>
            <p>The responsible operator and data controller for this application is:</p>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] font-mono whitespace-pre-wrap">
{`Controller: Jonas
Location: Stuttgart, Germany`}
            </div>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-slate-900 dark:text-white">2. Collection of Personal Information</h2>
            <p>To provide cooperative studying, we save resources from Google Authentication or your manual setup:</p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li><strong>Display Name:</strong> To reference public study sheets.</li>
              <li><strong>Email Address:</strong> To establish clean syncing via Firebase Auth.</li>
              <li><strong>Profile Picture:</strong> Optional visual identification.</li>
              <li><strong>Study Notes & Sheets:</strong> JPG/PNG files including indexing values.</li>
            </ul>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-slate-900 dark:text-white">3. Security</h2>
            <p>All information is synced to Firebase Firestore database shielded by mathematically validated Security Rules enforcing attributes access check.</p>
          </section>

          <section className="space-y-1">
            <h2 className="font-bold text-slate-900 dark:text-white">4. GDPR Actions</h2>
            <p>At any time you hold full rights to export your sheets as a zipped bundle, or wipe your profile data completely, erasing records directly from Firebase.</p>
          </section>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono pt-4 border-t border-slate-100 dark:border-slate-900">
            Last Updated: June 2026 • Representative Jonas (Stuttgart)
          </p>
        </div>
      )}
    </div>
  );
}
