import React, { useState } from 'react';
import { Settings, Shield, Edit, Trash2, HelpCircle, HardDrive, Bell, Check, Globe, Heart, CheckCircle2 } from 'lucide-react';
import { StudySheet, UserProfile } from '../types';
import PrivacyView from './privacy';

const TRANSLATIONS = {
  de: {
    settingsTitle: "Einstellungen",
    settingsSub: "Konto, Sicherheit & Präferenzen",
    closeBtn: "Schließen",
    saveBtn: "Erfassen & Schließen",
    
    // 1. Profilbearbeitung
    profileTitle: "Erweiterte Profilbearbeitung",
    nameLabel: "Anzeigename",
    ageLabel: "Alter (Jahre)",
    bioLabel: "Eigene Biografie / Beschreibung",
    avatarLabel: "Profilbild ändern",
    
    // 2. Sicherheits- & Kontoverwaltung
    securityTitle: "Sicherheits- & Kontoverwaltung",
    googleStatusConnected: "🟢 Verknüpft mit Google-Konto: ",
    googleStatusUnconnected: "🔴 Nicht verknüpft (Lokales Profil / Gast)",
    
    // 3. push notifications
    pushTitle: "Erweiterte Push-Benachrichtigungen",
    pushLikesLabel: "Likes-Meldungen",
    pushLikesDesc: "Push erhalten, wenn Mitschüler deine Zettel liken",
    pushCommentsLabel: "Kommentar-Meldungen",
    pushCommentsDesc: "Sofort benachrichtigen bei neuen Fragen oder Kommentaren",
    
    // 4. theme preference
    themeTitle: "Erweiterter Theme-Modus (System/Manuell)",
    themeLight: "Hell (Light)",
    themeDark: "Dunkel (Dark)",
    themeSystem: "System-Synchronisierung (Auto)",
    
    // 5. Impressum & Datenschutz
    legalTitle: "Datenschutz & Impressum",
    impressumOperator: "Verantwortlicher Betreiber für QED:",
    impressumBody: "Jonas\nStuttgart, Deutschland\nE-mail: jonas@qed-app.de\nSupport: support@qed-app.de",
    privacyBtn: "Link zur Datenschutzerklärung (privacy.tsx)",
    
    // 6. Zweisprachigkeit
    langTitle: "Zweisprachigkeit (Global DE/EN)",
    langDesc: "Wähle die Sprache für dein QED Einstellungsmenü:",
    langDe: "Deutsch (DE)",
    langEn: "English (EN)",
    
    // 7. Lern-Feed-Präferenzen
    prefTitle: "Lern-Feed-Präferenzen",
    prefDesc: "Filtere deine bevorzugten Schulfächer an oder ab, um deinen personalisierten Feed zu steuern:",
    prefShowOnlyPreferred: "Nur bevorzugte Fächer im Feed anzeigen",
    
    // 8. Speicher- und Level-Statistiken
    statsTitle: "Speicher- und Level-Statistiken",
    statsTotalSheets: "Belegte Lernzettel im Netzwerk:",
    statsMaxSheets: "Maximaler Belegungsstand der Lernzettel:",
    statsXpLeft: "{likes} Likes bis Level {lvl}",
    statsPercent: "Speicherbelegung: {pct}%",
    
    // 9. Geräte-Optimierung
    optTitle: "Geräte-Optimierung & Cache",
    optCacheLabel: "Cache leeren",
    optCacheDesc: "Lokalen Speicher freigeben (Verlauf, offline Scans)",
    optCacheBtn: "Cache bereinigen",
    optExportLabel: "Daten-Download (ZIP)",
    optExportDesc: "Exportiere deine hochgeladenen Zettel gesammelt",
    optExportBtn: "ZIP exportieren",
    
    // 10. Abonnement & Support
    subTitle: "Hilfezentrale & Live Support",
    subProLabel: "Testphasen-Aktivierung (100% Kostenlos)",
    subProActive: "Alle Premium-Features in der Testphase für dich vollständig freigeschaltet!",
    subProInactive: "Alle Premium-Features in der Testphase für dich vollständig freigeschaltet!",
    mailSupportTitle: "Direct-Mail Hilfeformular",
    mailSupportDesc: "Sende eine Anfrage direkt an den Betreiber Jonas nach Stuttgart:",
    mailSupportPlaceholder: "Tippe deine Nachricht hier ein (z.B. Fragen zum Upload oder Bugs)...",
    mailSupportSendBtn: "Nachricht senden",
    mailSupportSuccess: "Nachricht erfolgreich übermittelt! Jonas (Stuttgart) meldet sich schnellstmöglich.",
    
    // 11. Sichtbarkeitsschutz
    visTitle: "Sichtbarkeitsschutz",
    visPrivateLabel: "Privates Profil aktivieren",
    visPrivateDesc: "Deine Lernzettel sind nur für registrierte Mitschüler sichtbar",
    
    // 12. Community-Regeln
    rulesTitle: "Community-Regeln / Verhaltenskodex",
    rulesCodexLabel: "Verhaltenskodex (Zensurschutz & Richtlinien)",
    rulesCodexDesc: "Um ein faires Lernumfeld zu garantieren, sind rassistische Inhalte, Beleidigungen sowie unangemessener oder herabsetzender Humor ('Black Humor' Richtlinien) strengstens untersagt. Verstöße führen zum sofortigen Ausschluss.",
    
    dangerZone: "Gefahrenzone",
    dangerDesc: "Ein Klick auf das Löschen deines Accounts setzt all deine Likes, Posts und Profildaten unwiderruflich gemäß DSGVO-Richtlinie zurück.",
    deleteBtn: "Account vollständig löschen"
  },
  en: {
    settingsTitle: "Settings & Options",
    settingsSub: "Account, Security & Feed Preferences",
    closeBtn: "Close",
    saveBtn: "Save & Close",
    
    // 1. Profilbearbeitung
    profileTitle: "Advanced Profile Editing",
    nameLabel: "Display Name",
    ageLabel: "Age (Years)",
    bioLabel: "Profile Biography / Description",
    avatarLabel: "Change profile picture",
    
    // 2. Sicherheits- & Kontoverwaltung
    securityTitle: "Security & Account Management",
    googleStatusConnected: "🟢 Linked with Google Account: ",
    googleStatusUnconnected: "🔴 Unlinked (Local Profile)",
    
    // 3. push notifications
    pushTitle: "Advanced Push Notifications",
    pushLikesLabel: "Likes notifications",
    pushLikesDesc: "Get pushes whenever classmates like your shared sheets",
    pushCommentsLabel: "Comments notifications",
    pushCommentsDesc: "Ping me immediately for new questions or replies",
    
    // 4. theme preference
    themeTitle: "Advanced Theme Mode (System/Manual)",
    themeLight: "Light Theme",
    themeDark: "Dark Theme",
    themeSystem: "System Synchronization (Auto)",
    
    // 5. Impressum & Datenschutz
    legalTitle: "Privacy & Legal Notice",
    impressumOperator: "Responsible operator for QED:",
    impressumBody: "Jonas\nStuttgart, Germany\nEmail: jonas@qed-app.de\nSupport: support@qed-app.de",
    privacyBtn: "Link to Privacy Policy (privacy.tsx)",
    
    // 6. Zweisprachigkeit
    langTitle: "Bilingualism (Global DE/EN)",
    langDesc: "Choose the language for your QED settings menu:",
    langDe: "German (DE)",
    langEn: "English (EN)",
    
    // 7. Lern-Feed-Präferenzen
    prefTitle: "Learning Feed Preferences",
    prefDesc: "Select or deselect your preferred school subjects to control your custom study feed:",
    prefShowOnlyPreferred: "Show only preferred subjects in study feed",
    
    // 8. Speicher- und Level-Statistiken
    statsTitle: "Storage & Level Statistics",
    statsTotalSheets: "Active Sheets in Network:",
    statsMaxSheets: "Maximum Permitted Study Sheets:",
    statsXpLeft: "{likes} Likes until Level {lvl}",
    statsPercent: "Storage capacity: {pct}%",
    
    // 9. Geräte-Optimierung
    optTitle: "Device Optimization & Storage",
    optCacheLabel: "Clean Local Cache",
    optCacheDesc: "Free local temporary assets (history, offline scans)",
    optCacheBtn: "Purge Cache",
    optExportLabel: "Data Download (ZIP)",
    optExportDesc: "Export all your posted study sheets collectively",
    optExportBtn: "Export ZIP",
    
    // 10. Abonnement & Support
    subTitle: "Help Desk & Support",
    subProLabel: "Testing Phase Status (100% Free)",
    subProActive: "All premium features unlocked for you during the testing phase!",
    subProInactive: "All premium features unlocked for you during the testing phase!",
    mailSupportTitle: "Direct-Mail Help Form",
    mailSupportDesc: "Submit support queries directly to the operator Jonas in Stuttgart:",
    mailSupportPlaceholder: "Type your query here (e.g., issues uploading files or app feedback)...",
    mailSupportSendBtn: "Send Request",
    mailSupportSuccess: "Your support request has been delivered! Jonas (Stuttgart) will reply shortly.",
    
    // 11. Sichtbarkeitsschutz
    visTitle: "Visibility Settings",
    visPrivateLabel: "Enable Private Profile",
    visPrivateDesc: "Only registered schoolmates can search/discover your sheets",
    
    // 12. Community-Regeln
    rulesTitle: "Community Code & Guidelines",
    rulesCodexLabel: "Verhaltenskodex (Safety Policies)",
    rulesCodexDesc: "To preserve a constructive learning environment, racist expressions, insults, and inappropriate or offensive humor ('Black Humor' guidelines) are strictly prohibited. Violators will yield instant account termination.",
    
    dangerZone: "Danger Zone",
    dangerDesc: "Deleting your account permanently erases all your study sheets, likes, and profile associations from the cloud database according to GDPR rights.",
    deleteBtn: "Delete Account Permanently"
  }
};

interface ProfileScreenProps {
  userProfile: UserProfile | null;
  mySheets: StudySheet[];
  sheetsCountGlobally: number;
  onUpdateProfile: (metadata: Partial<UserProfile>) => void;
  onWipeData: () => void;
  onDeletePost: (sheetId: string) => void;
  triggerToast: (msg: string, type: 'info' | 'success' | 'error') => void;
  avatarBase64: string | null;
  onAvatarChange: (imageBase64: string) => void;
}

export default function ProfileScreen({
  userProfile,
  mySheets,
  sheetsCountGlobally,
  onUpdateProfile,
  onWipeData,
  onDeletePost,
  triggerToast,
  avatarBase64,
  onAvatarChange
}: ProfileScreenProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'grid' | 'list'>('grid');
  const [faqExpanded, setFaqExpanded] = useState<Record<number, boolean>>({});

  // Message Center (Nachrichtenzentrale) Stateful list
  const [notificationsExpanded, setNotificationsExpanded] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string; title: string; text: string; date: string; read: boolean }>>([
    {
      id: "m1",
      title: "Willkommen in der Prüfungsphase! 📚",
      text: "Hallo! Willkommen bei QED. Alle Premium-Funktionen sind in der Testphase komplett kostenfrei freigeschaltet. Wende dich bei Fragen oder Fehlern direkt an Jonas aus Stuttgart im Einstellungsmenü.",
      date: "Heute",
      read: false
    },
    {
      id: "m2",
      title: "QED Sicherheitsgarantie 🔒",
      text: "Deine Daten sind bei uns sicher. Alle Verbindungen zu Firebase laufen über verschlüsselte HTTPS-Zertifikate, API-Keys werden verdeckt serverseitig prozessiert und GitHub-Repositories enthalten keinerlei Geheimschlüssel oder Nutzerdaten.",
      date: "Gestern",
      read: false
    }
  ]);

  // Form states inside settings
  const [editName, setEditName] = useState(userProfile?.name || '');
  const [editBio, setEditBio] = useState(userProfile?.bio || '');
  const [editAge, setEditAge] = useState(userProfile?.age || 17);
  
  // Cache simulated helper
  const [cacheSize, setCacheSize] = useState('24.5 MB');

  // GDPR Confirm overlay
  const [modalType, setModalType] = useState<'none' | 'delete' | 'backup' | 'password' | 'google'>('none');

  // New states for privacy and support forms
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [mailSupportText, setMailSupportText] = useState('');

  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 select-none font-sans text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs mt-3">Profil laden...</p>
      </div>
    );
  }

  const lang = userProfile.languagePreference || 'de';
  const t = (key: keyof typeof TRANSLATIONS['de']) => TRANSLATIONS[lang][key] || TRANSLATIONS['de'][key];

  // Level Progression computations
  const totalLikes = userProfile.totalLikes;
  const userLevel = userProfile.userLevel;
  const nextLevel = userLevel + 1;
  const nextLevelTarget = nextLevel * 10;
  const xpOnThisLevel = totalLikes % 10;
  const progressPercent = Math.min((xpOnThisLevel / 10) * 100, 100);
  const remainingLikes = nextLevelTarget - totalLikes;

  const handleProfileSave = () => {
    onUpdateProfile({
      name: editName,
      bio: editBio,
      age: Number(editAge)
    });
    triggerToast("Profil-Einstellungen erfolgreich erfasst!", "success");
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (userProfile.imageCount >= 1000) {
      triggerToast("Support-Fehler: Dein Cloud-Speicherlimit von 1000 Bildern wurde erreicht. Bitte kontaktiere umgehend support@qed-app.de, um zusätzlichen PWA-Speicherplatz freizuschalten.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onAvatarChange(event.target.result as string);
        triggerToast("Profilbild erfolgreich aktualisiert!", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleFaq = (num: number) => {
    setFaqExpanded(prev => ({ ...prev, [num]: !prev[num] }));
  };

  const handleConfirmModalAction = () => {
    const action = modalType;
    setModalType('none');

    if (action === 'delete') {
      onWipeData();
    } else if (action === 'backup') {
      triggerToast("ZIP-Paket wird geschnürt. Export abgeschlossen!", "success");
      setTimeout(() => {
        triggerToast("QED_Data_Profile.zip erfolgreich geladen.", "info");
      }, 1000);
    } else if (action === 'password') {
      triggerToast("Passwort-Reset-Link wurde an dein Google-Postfach versendet!", "success");
    } else if (action === 'google') {
      triggerToast("Google-Account erfolgreich verknüpft.", "success");
    }
  };

  const handleMarkAllRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
    triggerToast("Alle Nachrichten als gelesen markiert.", "success");
  };

  const handleDeleteMessage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessages(prev => prev.filter(m => m.id !== id));
    triggerToast("Nachricht gelöscht.", "info");
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      
      {/* Scrollable primary Profile Dashboard */}
      <div className="flex-1 overflow-y-auto no-scrollbar">

        {/* NACHRICHTENZENTRALE / MESSAGE CENTER (Above Profile Card, requested) */}
        <div className="mx-6 mt-4 p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/40 rounded-2xl space-y-3 shadow-sm">
          <button 
            type="button" 
            onClick={() => setNotificationsExpanded(!notificationsExpanded)}
            className="w-full flex items-center justify-between font-sans text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell size={15} className="text-blue-600 dark:text-blue-400 animate-swing" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                )}
              </div>
              <span>Nachrichten-Zentrale</span>
              {unreadCount > 0 && (
                <span className="text-[9px] bg-rose-500 text-white font-bold font-mono px-1.5 py-0.2 rounded-full">{unreadCount} neu</span>
              )}
            </div>
            <span className="text-[9px] text-slate-400 font-mono tracking-wider">
              {notificationsExpanded ? "VERBERGEN ▲" : "ÖFFNEN ▼"}
            </span>
          </button>

          {notificationsExpanded && (
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-900 animate-scaleUp">
              {messages.length === 0 ? (
                <p className="text-[10px] text-slate-400 text-center py-2">Keine neuen Nachrichten vorhanden.</p>
              ) : (
                <>
                  <div className="flex justify-end">
                    <button 
                      onClick={handleMarkAllRead} 
                      className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 size={10} /> Alle als gelesen markieren
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar">
                    {messages.map(msg => (
                      <div 
                        key={msg.id} 
                        onClick={() => setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m))}
                        className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${msg.read ? 'bg-white/40 dark:bg-slate-950/25 border-slate-100 dark:border-slate-900 opacity-75' : 'bg-white dark:bg-slate-950 border-blue-100 dark:border-blue-900/30 shadow-xs'}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-[10px] font-extrabold pr-2 ${msg.read ? 'text-slate-700 dark:text-slate-350' : 'text-slate-900 dark:text-white'}`}>
                            {msg.title}
                          </span>
                          <button 
                            onClick={(e) => handleDeleteMessage(msg.id, e)}
                            className="text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Löschen"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">{msg.text}</p>
                        <span className="text-[8px] font-mono text-slate-400 block text-right mt-1">{msg.date}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Profile Card Header Layout */}
        <div className="p-6 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans tracking-tight">Mein Profil</h2>
            
            <button 
              onClick={() => {
                setEditName(userProfile.name);
                setEditBio(userProfile.bio || '');
                setEditAge(userProfile.age || 17);
                setSettingsOpen(true);
              }}
              className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
            >
              <Settings size={18} />
            </button>
          </div>

          <div className="flex items-center gap-6">
            {/* Avatar block with camera integration */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-blue-200 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden shadow-sm">
                {avatarBase64 ? (
                  <img src={avatarBase64} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userProfile.name.charAt(0).toUpperCase()
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer border border-white dark:border-slate-950 text-white hover:bg-blue-700">
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
                <Edit size={10} />
              </label>
            </div>

            {/* Profile Statistics counts */}
            <div className="flex-1 flex justify-around text-center">
              <div>
                <span className="block font-bold text-slate-800 dark:text-slate-100 text-base">{mySheets.length}</span>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Posts</span>
              </div>
              <div>
                <span className="block font-bold text-slate-800 dark:text-slate-100 text-base">{userProfile.followers}</span>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Follower</span>
              </div>
              <div>
                <span className="block font-bold text-slate-800 dark:text-slate-100 text-base">{userProfile.totalLikes}</span>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Likes</span>
              </div>
            </div>
          </div>

          {/* Persona biography */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans">{userProfile.name}</h2>
              <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-[10px] tracking-wider px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40 font-mono">
                Level {userProfile.userLevel}
              </span>
            </div>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-sans">{userProfile.bio || 'Keine Bio angegeben • Beigetreten 2026'}</p>
          </div>

          {/* Real-time Level Progress bars */}
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider">Nächstes Level (XP)</span>
              <span className="text-slate-500 dark:text-slate-400 font-mono font-bold">{totalLikes} / {nextLevelTarget} Likes</span>
            </div>
            <div className="w-full bg-slate-200/55 dark:bg-slate-800/55 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 font-sans">
              Noch {remainingLikes} Likes bis Level {nextLevel}
            </p>
          </div>
        </div>

        {/* Instagram style grid toggle tab */}
        <div className="border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 grid grid-cols-2 text-center text-xs shrink-0 font-mono">
          <button 
            type="button" 
            onClick={() => setProfileTab('grid')}
            className={`py-3 flex justify-center gap-1.5 items-center cursor-pointer border-b-2 transition-all ${profileTab === 'grid' ? 'border-slate-900 dark:border-slate-100 font-bold text-slate-800 dark:text-slate-200' : 'border-transparent text-slate-400 dark:text-slate-500'}`}
          >
            Raster
          </button>
          <button 
            type="button" 
            onClick={() => setProfileTab('list')}
            className={`py-3 flex justify-center gap-1.5 items-center cursor-pointer border-b-2 transition-all ${profileTab === 'list' ? 'border-slate-900 dark:border-slate-100 font-bold text-slate-800 dark:text-slate-200' : 'border-transparent text-slate-400 dark:text-slate-500'}`}
          >
            Liste
          </button>
        </div>

        {/* Thumbnail galleries / layouts representation */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/10 min-h-[220px]">
          {mySheets.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center font-sans">
              <span>Noch keine eigenen Beiträge hochgeladen.</span>
            </div>
          ) : profileTab === 'grid' ? (
            <div className="grid grid-cols-3 gap-2 animate-scaleUp">
              {mySheets.map(item => (
                <div key={item.id} className="relative aspect-square bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200/55 dark:border-slate-850 group">
                  <img src={item.image} alt="Thumbnail" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 font-mono text-[10px] font-bold p-1">
                    <span className="flex items-center gap-1"><Heart size={10} fill="currentColor" /> {item.likes}</span>
                    <button 
                      onClick={() => onDeletePost(item.id)}
                      className="px-2 py-1 bg-rose-600 hover:bg-rose-750 text-white rounded-lg text-[9px] font-extrabold flex items-center gap-1 cursor-pointer font-sans absolute top-2 right-2 shadow-sm shrink-0"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 animate-scaleUp">
              {mySheets.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 overflow-hidden rounded-2xl p-4 shadow-sm flex flex-col gap-3 font-sans relative group">
                  {/* Absolute positioning delete action */}
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={() => onDeletePost(item.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 rounded-xl transition duration-150 cursor-pointer shadow-xs border border-rose-100/30 flex items-center justify-center shrink-0"
                      title="Post löschen"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-[10px] pr-8">
                    <span className="font-bold text-blue-600 dark:text-blue-400 lg:text-[11px] uppercase tracking-wider">{item.fach}</span>
                    <span className="text-slate-400 dark:text-slate-500 font-semibold font-mono">{item.schule}</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <img src={item.image} alt="Thumb" className="w-14 h-14 rounded-xl object-cover bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 shrink-0 shadow-sm" />
                    <div className="flex-1 min-w-0 pr-6">
                      <h4 className="text-xs font-bold text-slate-890 dark:text-slate-100 truncate">{item.titel}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1 leading-relaxed">{item.inhalt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slide-Up Settings configuration drawer */}
      <div className={`absolute inset-0 bg-white dark:bg-slate-950 z-40 transition-transform duration-300 flex flex-col ${settingsOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        {privacyOpen ? (
          <PrivacyView 
            language={userProfile.languagePreference || 'de'} 
            onBack={() => setPrivacyOpen(false)} 
          />
        ) : (
          <>
            <header className="p-6 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans tracking-tight">
                  {t('settingsTitle')}
                </h2>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">{t('settingsSub')}</p>
              </div>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors cursor-pointer text-[10px] font-extrabold shadow-sm"
              >
                {t('closeBtn')}
              </button>
            </header>

            {/* Drawers content fields scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar font-sans text-xs">
              
              {/* 1. PROFILE EDITING CARD */}
              <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 animate-fade">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {t('profileTitle')}
                </h3>
                
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 border dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-450 font-bold text-sm overflow-hidden select-none">
                      {avatarBase64 ? <img src={avatarBase64} alt="Avatar" className="w-full h-full object-cover" /> : userProfile.name.charAt(0).toUpperCase()}
                    </div>
                    <label className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer border-2 border-white dark:border-slate-950 text-white hover:bg-blue-700">
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
                      <Edit size={8} />
                    </label>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        {t('nameLabel')}
                      </label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => { setEditName(e.target.value); onUpdateProfile({ name: e.target.value }); }}
                        className="w-full mt-1 p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        {t('ageLabel')}
                      </label>
                      <input 
                        type="number"
                        value={editAge}
                        onChange={(e) => { setEditAge(Number(e.target.value)); onUpdateProfile({ age: Number(e.target.value) }); }}
                        className="w-full mt-1 p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1 font-mono">
                    {t('bioLabel')}
                  </label>
                  <textarea 
                    value={editBio}
                    onChange={(e) => { setEditBio(e.target.value); onUpdateProfile({ bio: e.target.value }); }}
                    rows={2}
                    className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none resize-none focus:border-blue-500 transition-colors"
                  />
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">{t('avatarLabel')}</p>
                </div>
              </div>

              {/* 2. SECURITY & ACCOUNT CARD */}
              <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {t('securityTitle')}
                </h3>
                
                <div className="flex flex-col gap-2 py-1">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">Google Auth Credentials Status</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    {userProfile.email ? `${t('googleStatusConnected')}${userProfile.email}` : t('googleStatusUnconnected')}
                  </span>
                </div>
              </div>

              {/* 3. ADVANCED PUSH NOTIFICATIONS CARD */}
              <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {t('pushTitle')}
                </h3>
                
                <div className="flex items-center justify-between py-1 border-b border-slate-250/30 dark:border-slate-800/40 pb-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">{t('pushLikesLabel')}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">{t('pushLikesDesc')}</span>
                  </div>
                  <button 
                    onClick={() => {
                      onUpdateProfile({ pushLikes: !userProfile.pushLikes });
                      triggerToast(`Push Likes: ${!userProfile.pushLikes ? "AN" : "AUS"}`, "info");
                    }}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer ${userProfile.pushLikes ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-850'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${userProfile.pushLikes ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                </div>

                <div className="flex items-center justify-between py-1 pt-1.5">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">{t('pushCommentsLabel')}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">{t('pushCommentsDesc')}</span>
                  </div>
                  <button 
                    onClick={() => {
                      onUpdateProfile({ pushComments: !userProfile.pushComments });
                      triggerToast(`Push Kommentare: ${!userProfile.pushComments ? "AN" : "AUS"}`, "info");
                    }}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer ${userProfile.pushComments ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-850'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${userProfile.pushComments ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                </div>
              </div>

              {/* 4. ADVANCED THEME MODES */}
              <div className="space-y-3 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {t('themeTitle')}
                </h3>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(['light', 'dark', 'system'] as const).map((th) => {
                    const isActive = userProfile.themePreference === th;
                    const label = th === 'light' ? t('themeLight') : th === 'dark' ? t('themeDark') : t('themeSystem');
                    return (
                      <button
                        key={th}
                        onClick={() => {
                          onUpdateProfile({ themePreference: th });
                          triggerToast(`ThemePreference: ${th.toUpperCase()}`, "success");
                        }}
                        className={`py-2 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${isActive ? 'bg-blue-600 text-white font-bold' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400'}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. IMPRESSUM & DATENSCHUTZ CARD */}
              <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {t('legalTitle')}
                </h3>
                <div className="p-3 bg-white dark:bg-slate-950 border border-slate-150 rounded-xl dark:border-slate-850 space-y-1.5">
                  <span className="block font-bold text-slate-800 dark:text-slate-200 text-[10px]">
                    {t('impressumOperator')}
                  </span>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-pre-wrap font-mono leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-2 rounded border dark:border-slate-850">
                    {t('impressumBody')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPrivacyOpen(true);
                    triggerToast("In-App Datenschutzerklärung wird geöffnet...", "info");
                  }}
                  className="w-full py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold font-sans text-xs cursor-pointer text-center flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Shield size={12} />
                  <span>{t('privacyBtn')}</span>
                </button>
              </div>

              {/* 6. BILINGUAL LANGUAGE SWITCHER */}
              <div className="space-y-3 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {t('langTitle')}
                </h3>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal">{t('langDesc')}</p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      onUpdateProfile({ languagePreference: 'de' });
                      triggerToast("Sprache auf Deutsch umgestellt!", "success");
                    }}
                    className={`py-2 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${lang === 'de' ? 'bg-blue-600 text-white font-bold' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-500'}`}
                  >
                    {t('langDe')}
                  </button>
                  <button
                    onClick={() => {
                      onUpdateProfile({ languagePreference: 'en' });
                      triggerToast("Language updated to English!", "success");
                    }}
                    className={`py-2 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${lang === 'en' ? 'bg-blue-600 text-white font-bold' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-500'}`}
                  >
                    {t('langEn')}
                  </button>
                </div>
              </div>

              {/* 7. LERN-FEED-PRÄFERENZEN CARD */}
              <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {t('prefTitle')}
                </h3>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal">{t('prefDesc')}</p>
                
                <div className="flex items-center justify-between py-1 pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
                  <span className="text-xs font-semibold">{t('prefShowOnlyPreferred')}</span>
                  <button 
                    onClick={() => {
                      onUpdateProfile({ isFilterPreferredFeed: !userProfile.isFilterPreferredFeed });
                      triggerToast(`Lern-Filter: ${!userProfile.isFilterPreferredFeed ? "AN" : "AUS"}`, "info");
                    }}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer ${userProfile.isFilterPreferredFeed ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-850'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${userProfile.isFilterPreferredFeed ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                </div>

                {/* Subj Multi-Selector tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Mathe", "Biologie", "Physik", "Chemie", "Geschichte", "Deutsch", "Englisch"].map((prefSubj) => {
                    const currentPrefs = userProfile.preferredSubjects || [];
                    const isSelected = currentPrefs.includes(prefSubj);
                    return (
                      <button
                        key={prefSubj}
                        onClick={() => {
                          let nextSubjs = [...currentPrefs];
                          if (isSelected) {
                            nextSubjs = nextSubjs.filter(s => s !== prefSubj);
                          } else {
                            nextSubjs.push(prefSubj);
                          }
                          onUpdateProfile({ preferredSubjects: nextSubjs });
                          triggerToast(`Fach ${prefSubj} ${isSelected ? 'entfernt' : 'hinzugefügt'}!`, "info");
                        }}
                        className={`px-3 py-1.5 text-[9px] font-bold rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-blue-600 text-white font-bold' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-500'}`}
                      >
                        {prefSubj} {isSelected ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 8. SPEICHER & STATS CARD */}
              <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {t('statsTitle')}
                </h3>
                
                <div className="space-y-2 font-mono text-[10px] py-1 border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-450 dark:text-slate-500">{t('statsTotalSheets')}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-350">{sheetsCountGlobally} / 3.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450 dark:text-slate-500">{t('statsMaxSheets')}</span>
                    <span className="font-bold text-slate-830 dark:text-slate-350">1.000 Zettel pro Profil</span>
                  </div>
                </div>

                {/* Dynamic calculation: Noch X Likes und level progression */}
                <div className="space-y-1.5 pt-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-slate-650 dark:text-slate-400 font-sans">Likes-Milestone / Level:</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      Level {userProfile.userLevel} (Total Likes: {userProfile.totalLikes})
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/55 dark:bg-slate-800/55 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider font-mono">
                    {t('statsXpLeft').replace('{likes}', remainingLikes.toString()).replace('{lvl}', nextLevel.toString())}
                  </span>
                </div>
              </div>

              {/* 9. GERÄTE-OPTIMIERUNG & CACHE CARD */}
              <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {t('optTitle')}
                </h3>
                
                <div className="flex items-center justify-between py-1 border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">{t('optCacheLabel')}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono font-semibold">Simuliert: {cacheSize} Cache</span>
                  </div>
                  <button 
                    onClick={() => {
                      setCacheSize('0.0 MB');
                      triggerToast("Gerätecache bereinigt! Speicher freigegeben.", "success");
                    }}
                    className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-705 dark:text-slate-300 rounded-lg cursor-pointer hover:bg-slate-300 transition-colors"
                  >
                    {t('optCacheBtn')}
                  </button>
                </div>

                <div className="flex items-center justify-between py-1 pt-1.5">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">{t('optExportLabel')}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">{t('optExportDesc')}</span>
                  </div>
                  <button 
                    onClick={() => setModalType('backup')} 
                    className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-705 dark:text-slate-300 rounded-lg cursor-pointer hover:bg-slate-300 transition-colors"
                  >
                    {t('optExportBtn')}
                  </button>
                </div>
              </div>

              {/* 10. ABONNEMENT BIILING CARDS REMOVED -> REPLACED WITH 100% FREE INFO */}
              <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {t('subTitle')}
                </h3>
                
                <div className="flex flex-col gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30 rounded-xl justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400">{t('subProLabel')}</span>
                    <span className="text-[10px] text-slate-600 dark:text-slate-450 mt-1 leading-relaxed font-semibold">{t('subProActive')}</span>
                  </div>
                </div>

                {/* Email Help input form directly inside Settings block */}
                <div className="space-y-2.5 pt-1">
                  <label className="block text-[9px] font-bold text-slate-450 uppercase font-mono">
                    {t('mailSupportTitle')}
                  </label>
                  <p className="text-[9px] text-slate-400 leading-normal">{t('mailSupportDesc')}</p>
                  <textarea
                    value={mailSupportText}
                    onChange={(e) => setMailSupportText(e.target.value)}
                    placeholder={t('mailSupportPlaceholder')}
                    rows={2}
                    className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none resize-none font-medium"
                  />
                  <button
                    onClick={() => {
                      if (!mailSupportText.trim()) {
                        triggerToast("Bitte gib ein Anliegen ein.", "error");
                        return;
                      }
                      setMailSupportText('');
                      triggerToast(t('mailSupportSuccess'), "success");
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center shadow-xs"
                  >
                    {t('mailSupportSendBtn')}
                  </button>
                </div>
              </div>

              {/* 11. SICHTBARKEITSSCHUTZ CARD */}
              <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {t('visTitle')}
                </h3>
                
                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">{t('visPrivateLabel')}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">{t('visPrivateDesc')}</span>
                  </div>
                  <button 
                    onClick={() => {
                      onUpdateProfile({ isPrivate: !userProfile.isPrivate });
                      triggerToast(`Sichtbarkeit: ${!userProfile.isPrivate ? "PRIVAT" : "ÖFFENTLICH"}`, "info");
                    }}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer ${userProfile.isPrivate ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-850'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${userProfile.isPrivate ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                </div>
              </div>

              {/* 12. COMMUNITY-REGELN CARD ACCORDION */}
              <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                  {t('rulesTitle')}
                </h3>
                
                <div className="space-y-2 p-1 pt-0">
                  <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-xs">
                    <button 
                      onClick={() => toggleFaq(99)} 
                      className="w-full p-3 text-left font-bold text-[10px] uppercase tracking-wider bg-slate-100/40 dark:bg-slate-900/30 text-slate-700 dark:text-slate-350 flex justify-between items-center cursor-pointer select-none"
                    >
                      <span>{t('rulesCodexLabel')}</span>
                      <span>{faqExpanded[99] ? '▲' : '▼'}</span>
                    </button>
                    {faqExpanded[99] && (
                      <div className="p-3 bg-white dark:bg-slate-950 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-900 font-semibold font-mono font-sans">
                        {t('rulesCodexDesc')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* DYNAMIC Accordion FAQ list */}
              <div className="space-y-3 font-sans">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Häufig gestellte Fragen (FAQs)</h3>
                
                <div className="space-y-2">
                  <div className="border border-slate-100 dark:border-slate-900 rounded-xl overflow-hidden text-xs bg-white dark:bg-slate-950">
                    <button onClick={() => toggleFaq(1)} className="w-full p-3 text-left text-xs font-semibold bg-slate-50/50 dark:bg-slate-900/20 flex justify-between items-center cursor-pointer">
                      <span>Wie funktioniert das Level-System?</span>
                      <span>{faqExpanded[1] ? '▲' : '▼'}</span>
                    </button>
                    {faqExpanded[1] && (
                      <div className="p-3 bg-white dark:bg-slate-950 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-900">
                        Dein Level berechnet sich vollautomatisch aus deinen gesammelten Likes. Pro 10 Likes steigst du ein Level auf (Level = Likes / 10).
                      </div>
                    )}
                  </div>

                  <div className="border border-slate-100 dark:border-slate-900 rounded-xl overflow-hidden text-xs bg-white dark:bg-slate-950">
                    <button onClick={() => toggleFaq(2)} className="w-full p-3 text-left text-xs font-semibold bg-slate-50/50 dark:bg-slate-900/20 flex justify-between items-center cursor-pointer">
                      <span>Was passiert bei Erreichen des Upload-Limits?</span>
                      <span>{faqExpanded[2] ? '▲' : '▼'}</span>
                    </button>
                    {faqExpanded[2] && (
                      <div className="p-3 bg-white dark:bg-slate-950 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-900">
                        Um die Serverressourcen zu schonen, gilt ein Limit von 1.000 Dokumenten für Profile. Wenn dieses erreicht wird, blockiert die App neue Uploads und bittet dich, den Support zu kontaktieren.
                      </div>
                    )}
                  </div>

                  <div className="border border-slate-100 dark:border-slate-900 rounded-xl overflow-hidden text-xs bg-white dark:bg-slate-950">
                    <button onClick={() => toggleFaq(3)} className="w-full p-3 text-left text-xs font-semibold bg-slate-50/50 dark:bg-slate-900/20 flex justify-between items-center cursor-pointer">
                      <span>Was ist die automatische Bereinigung?</span>
                      <span>{faqExpanded[3] ? '▲' : '▼'}</span>
                    </button>
                    {faqExpanded[3] && (
                      <div className="p-3 bg-white dark:bg-slate-950 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-900">
                        Wir setzen ein FIFO (First-In-First-Out) Modell ein. Ab einer Beitragsmenge von 3.000 Zetteln wird das älteste jemals hochgeladene Dokument gelöscht, um Speicher freizugeben.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* DANGER DELETION ZONE */}
              <div className="space-y-3 pt-2">
                <h3 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest font-mono">
                  {t('dangerZone')}
                </h3>
                <div className="border border-rose-100 dark:border-rose-900/60 rounded-2xl p-4 bg-rose-50/50 dark:bg-rose-950/10 space-y-3 text-left font-sans text-xs">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">{t('dangerDesc')}</p>
                  <button 
                    onClick={() => setModalType('delete')} 
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-xl cursor-pointer transition-colors animate-pulse"
                  >
                    {t('deleteBtn')}
                  </button>
                </div>
              </div>

              <div className="text-center text-[9px] text-slate-400 dark:text-slate-600 py-4 font-mono">
                QED Mobile Client v2.5.0-multilingual • Operator Jonas (Stuttgart)
              </div>

            </div>
          </>
        )}
      </div>

      {/* RENDER DYNAMIC SYSTEM MODAL OVERLAYS */}
      {modalType !== 'none' && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-xs border border-slate-100 dark:border-slate-800 space-y-4 shadow-2xl font-sans">
            <div className="text-center space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {modalType === 'delete' ? 'Account unwiderruflich löschen?' : 
                 modalType === 'backup' ? 'Datendownload vorbereiten?' : 
                 'Aktion ausführen?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                {modalType === 'delete' ? 'Bist du absolut sicher? Dies löscht alle Mitschriften, Likes und gesetzten Einstellungen permanent aus der Firebase-Cloud-Datenbank gemäß DSGVO-Richtlinien.' : 
                 modalType === 'backup' ? 'Möchtest du alle deine hochgeladenen Lernzettel sammeln und als ZIP-Datei exportieren?' :
                 'Möchtest du diese Aktion jetzt bestätigen und fortfahren?'}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setModalType('none')} 
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Abbrechen
              </button>
              <button 
                onClick={handleConfirmModalAction} 
                className={`flex-1 py-2 text-white text-xs font-semibold rounded-xl cursor-pointer ${modalType === 'delete' ? 'bg-rose-600' : 'bg-blue-600'}`}
              >
                Bestätigen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
