/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  onSnapshot, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  signInAnonymously
} from 'firebase/auth';
import { Rss, Search, Plus, Sparkles, User, LogIn, AlertCircle } from 'lucide-react';
import { db, auth, handleFirestoreError } from './firebase';
import { StudySheet, UserProfile, OperationType } from './types';

// Importing sub-screens
import FeedScreen from './components/FeedScreen';
import SearchScreen from './components/SearchScreen';
import UploadScreen from './components/UploadScreen';
import AiCoachScreen from './components/AiCoachScreen';
import ProfileScreen from './components/ProfileScreen';

// Base dummy sheets to pre-populate if database is empty - ensures immediate Old Money high-craft display
const SEED_DATA: Omit<StudySheet, 'id' | 'createdAt'>[] = [];

export default function App() {
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('qed_cached_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('qed_cached_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authChecking, setAuthChecking] = useState(() => {
    try {
      return !localStorage.getItem('qed_cached_user');
    } catch {
      return true;
    }
  });
  const [sheets, setSheets] = useState<StudySheet[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'search' | 'upload' | 'ai' | 'profile'>('feed');
  const [aiSelectedSheet, setAiSelectedSheet] = useState<StudySheet | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: number; msg: string; type: 'info' | 'success' | 'error' }>>([]);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

  // Toast notifier
  const triggerToast = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // 1. Silent anonymous fallback login as a high-fidelity workspace bridge is disabled; we now boot to Welcome page
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          localStorage.setItem('qed_cached_user', JSON.stringify({
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            isAnonymous: currentUser.isAnonymous
          }));
        } catch (e) {
          console.error("Cache user failed:", e);
        }
        await ensureUserProfileDoc(currentUser);
      } else {
        setUser(null);
        setUserProfile(null);
        try {
          localStorage.removeItem('qed_cached_user');
          localStorage.removeItem('qed_cached_profile');
        } catch (e) {
          console.error("Remove cache user failed:", e);
        }
      }
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Ensure current user doc is present in Firestore
  const ensureUserProfileDoc = async (currentUser: any) => {
    const userRef = doc(db, 'users', currentUser.uid);
    try {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const initialProfile: UserProfile = {
          userId: currentUser.uid,
          name: currentUser.displayName || (currentUser.isAnonymous ? "Gast" : "Mitschüler"),
          email: currentUser.email || `${currentUser.uid.substring(0, 5)}@qed.app`,
          bio: currentUser.isAnonymous ? "Bereit zum Lernen (Gast)" : "Bereit zum Lernen",
          age: 17,
          userLevel: 0,
          totalLikes: 0,
          followers: 0,
          imageCount: 0,
          isPrivate: false,
          themePreference: 'system',
          languagePreference: 'de',
          pushLikes: true,
          pushComments: true
        };
        await setDoc(userRef, initialProfile);
        setUserProfile(initialProfile);
        try {
          localStorage.setItem('qed_cached_profile', JSON.stringify(initialProfile));
        } catch (e) {
          console.error("Cache initial profile failed:", e);
        }
      } else {
        const profile = snap.data() as UserProfile;
        setUserProfile(profile);
        try {
          localStorage.setItem('qed_cached_profile', JSON.stringify(profile));
        } catch (e) {
          console.error("Cache profile load failed:", e);
        }
      }
    } catch (err) {
      console.warn("Firestore not connected, loading local profile cached locally:", err);
      // Fallback local state to keep app highly usable and visual even if connection is delayed
      const fallbackProfile: UserProfile = {
        userId: currentUser?.uid || "guest-id",
        name: currentUser?.displayName || (currentUser?.isAnonymous ? "Gast" : "Mitschüler"),
        email: currentUser?.email || "gast@qed.app",
        bio: "Bereit zum Lernen (Lokaler Test-Modus)",
        age: 17,
        userLevel: 0,
        totalLikes: 0,
        followers: 0,
        imageCount: 0,
        isPrivate: false,
        themePreference: 'system',
        languagePreference: 'de',
        pushLikes: true,
        pushComments: true
      };
      setUserProfile(fallbackProfile);
    }
  };

  // Apply visual theme from Preference
  useEffect(() => {
    if (userProfile?.themePreference) {
      const htmlElement = document.documentElement;
      if (userProfile.themePreference === 'dark') {
        htmlElement.classList.add('dark');
      } else if (userProfile.themePreference === 'light') {
        htmlElement.classList.remove('dark');
      } else {
        // system theme fallback
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
          htmlElement.classList.add('dark');
        } else {
          htmlElement.classList.remove('dark');
        }
      }
    }
  }, [userProfile?.themePreference]);

  // Real-time listener for study sheets
  useEffect(() => {
    const q = query(collection(db, 'studySheets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (snap) => {
      const sheetsList: StudySheet[] = [];
      const seededPostsToClean: StudySheet[] = [];

      snap.forEach(docSnap => {
        const data = docSnap.data() as StudySheet;
        // Exclude any seed users, bots, or pre-entered mock posts from display completely
        if (
          data.autorId === 'seed-user-1' || 
          data.autorId === 'seed-user-2' || 
          data.autor === '@maximilian' || 
          data.autor === '@sophie_salem'
        ) {
          seededPostsToClean.push(data);
        } else {
          sheetsList.push(data);
        }
      });
      setSheets(sheetsList);

      // Attempt background auto-cleanup of seed/preset posts if user is authenticated
      if (seededPostsToClean.length > 0) {
        for (const post of seededPostsToClean) {
          try {
            await deleteDoc(doc(db, 'studySheets', post.id));
          } catch (err) {
            // Silently ignore if unauthenticated or permissions are pending
          }
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'studySheets');
    });

    return () => unsubscribe();
  }, []);

  // Sync profile data change with FireStore
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, updates);
      setUserProfile(prev => {
        const profile = prev ? { ...prev, ...updates } : null;
        if (profile) {
          try {
            localStorage.setItem('qed_cached_profile', JSON.stringify(profile));
          } catch (e) {
            console.error("Cache update profile failed:", e);
          }
        }
        return profile;
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleAvatarChange = async (base64Img: string) => {
    if (!user || !userProfile) return;
    
    // Technical Rule checks: picture limit cannot exceed 1000
    if (userProfile.imageCount >= 1000) {
      triggerToast("Support-Fehler: Dein Cloud-Speicherlimit von 1000 Bildern wurde erreicht. Bitte kontaktiere umgehend support@qed-app.de, um zusätzlichen PWA-Speicherplatz freizuschalten.", "error");
      return;
    }

    try {
      // Direct base64 profile sync. Since it simulates profile storage, we keep it safe inside fields.
      const newImageCount = (userProfile.imageCount || 0) + 1;
      await handleUpdateProfile({
        imageCount: newImageCount
      });
      setAvatarBase64(base64Img);
      triggerToast("Profilbild hochgeladen. Speicher-Status aktualisiert.", "success");
    } catch (err) {
      console.error(err);
    }
  };

  // Check and increment daily image upload count (limit: 2 per day)
  const checkAndIncrementUploadCount = async (isTestOnly = false): Promise<boolean> => {
    if (!user || !userProfile) {
      triggerToast("Bitte melde dich an, um diese Funktion zu nutzen.", "error");
      return false;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const currentCount = userProfile.lastUploadDate === todayStr ? (userProfile.dailyUploadCount || 0) : 0;

    if (currentCount >= 2) {
      triggerToast("Limit erreicht: Du kannst maximal 2 Bilder pro Tag hochladen.", "error");
      return false;
    }

    if (isTestOnly) {
      return true;
    }

    const nextCount = currentCount + 1;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        dailyUploadCount: nextCount,
        lastUploadDate: todayStr
      });
      setUserProfile(prev => prev ? {
        ...prev,
        dailyUploadCount: nextCount,
        lastUploadDate: todayStr
      } : null);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      return false;
    }
  };

  // Google Sign-In pop-up trigger
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      triggerToast(`Herzlich willkommen, ${result.user.displayName}!`, "success");
    } catch (err: any) {
      triggerToast(`Login fehlgeschlagen: ${err?.message}`, "error");
    }
  };

  // Publish sheets + FIFO 3000 Auto-Cleanup
  const handlePublishSheet = async (data: { titel: string; fach: string; schule: string; inhalt: string; imageBase64: string | null }) => {
    if (!user || !userProfile) return;

    // Technical Rule 1: check user's imageCount limits before posting
    if (userProfile.imageCount >= 1000) {
      triggerToast("Support-Fehler: Dein Cloud-Speicherlimit von 1500 Bildern wurde erreicht. Bitte kontaktiere umgehend support@qed-app.de, um zusätzlichen PWA-Speicherplatz freizuschalten.", "error");
      return;
    }

    // Limit Check for 2 images per day
    if (data.imageBase64) {
      const allowed = await checkAndIncrementUploadCount();
      if (!allowed) {
        return;
      }
    }

    const nextId = doc(collection(db, 'studySheets')).id;
    const defaultPlaceholderImage = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180"><rect width="100%" height="100%" fill="%23fcfbfa"/><path d="M 0,0 L 0,180" stroke="%233b82f6" stroke-width="12"/><line x1="30" y1="35" x2="270" y2="35" stroke="%23e2e8f0" stroke-width="2"/><text x='40' y='55' font-family='serif' font-size='14' font-weight='bold' fill='%233b82f6'>${data.fach}</text><text x='40' y='80' font-family='sans-serif' font-size='10' fill='%2364748b'>${data.titel}</text></svg>`;

    const newSheet: StudySheet = {
      id: nextId,
      titel: data.titel,
      fach: data.fach,
      schule: data.schule,
      inhalt: data.inhalt,
      autor: `@${userProfile.name.toLowerCase().replace(/\s+/g, '')}`,
      autorId: user.uid,
      likes: 0,
      likedBy: [],
      createdAt: Math.floor(Date.now() / 1000),
      image: data.imageBase64 || defaultPlaceholderImage
    };

    try {
      // Technical Rule 2: Auto-Cleanup trigger (FIFO count > 3000)
      const currentGlobalCount = sheets.length;
      if (currentGlobalCount >= 3000) {
        // Fetch oldest study sheet ordered by createdAt ascending
        const oldQuery = query(collection(db, 'studySheets'), orderBy('createdAt', 'asc'), limit(1));
        const oldestSnap = await getDocs(oldQuery);
        if (!oldestSnap.empty) {
          const oldestDoc = oldestSnap.docs[0];
          await deleteDoc(doc(db, 'studySheets', oldestDoc.id));
          triggerToast(`Auto-Cleanup: Alters-Limit (>3.000) erreicht. Das älteste Dokument wurde gelöscht.`, "info");
        }
      }

      // Upload current sheet document
      await setDoc(doc(db, 'studySheets', nextId), newSheet);

      // Increment profile image count slightly since a document upload is a "photo capture/scan" upload
      await handleUpdateProfile({
        imageCount: (userProfile.imageCount || 0) + 1
      });

      triggerToast("Lernzettel hochgeladen - das hat geklappt!", "success");
      setActiveTab('feed');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `studySheets/${nextId}`);
    }
  };

  // Like Toggle Event Trigger + Dynamic level level computation: userLevel = Math.floor(totalLikes / 10)
  const handleLikeSheet = async (sheetId: string) => {
    if (!user || !userProfile) return;

    const sheetRef = doc(db, 'studySheets', sheetId);
    const targetSheet = sheets.find(s => s.id === sheetId);
    if (!targetSheet) return;

    const isLiked = targetSheet.likedBy.includes(user.uid);
    const updatedLikedBy = isLiked
      ? targetSheet.likedBy.filter(id => id !== user.uid)
      : [...targetSheet.likedBy, user.uid];
    const updatedLikesCount = isLiked ? targetSheet.likes - 1 : targetSheet.likes + 1;

    try {
      // Write Like update
      await updateDoc(sheetRef, {
        likes: updatedLikesCount,
        likedBy: updatedLikedBy
      });

      // Technical Trigger Rule: When a like-event happens, sum all likes for target author and update levels
      const authorId = targetSheet.autorId;
      if (authorId) {
        // Instantly aggregate updated likes across all documents of this author
        const authorSheetsQuery = query(collection(db, 'studySheets'));
        const allSheetsSnap = await getDocs(authorSheetsQuery);
        
        let aggregatedLikes = 0;
        allSheetsSnap.forEach(snap => {
          const s = snap.data() as StudySheet;
          if (s.autorId === authorId) {
            // Include our just-updated count in computation if it matches
            if (s.id === sheetId) {
              aggregatedLikes += updatedLikesCount;
            } else {
              aggregatedLikes += s.likes;
            }
          }
        });

        const computedLevel = Math.floor(aggregatedLikes / 10);
        
        // Update user profile document in Firestore
        const authorUserRef = doc(db, 'users', authorId);
        const authorSnap = await getDoc(authorUserRef);
        if (authorSnap.exists()) {
          await updateDoc(authorUserRef, {
            totalLikes: aggregatedLikes,
            userLevel: computedLevel
          });
        }

        // If the author was the currently logged-in user, synchronize current state
        if (authorId === user.uid) {
          setUserProfile(prev => prev ? {
            ...prev,
            totalLikes: aggregatedLikes,
            userLevel: computedLevel
          } : null);
        }
      }

    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `studySheets/${sheetId}`);
    }
  };

  // GDPR fully wipe profile data
  const handleWipeUserData = async () => {
    if (!user) return;
    try {
      // Delete user documents
      const userRef = doc(db, 'users', user.uid);
      await deleteDoc(userRef);

      // Clean author's study sheets
      const myDocIds = sheets.filter(s => s.autorId === user.uid).map(s => s.id);
      for (const id of myDocIds) {
        await deleteDoc(doc(db, 'studySheets', id));
      }

      await signOut(auth);
      triggerToast("Profil-Daten und Mitschriften wurden vollständig gelöscht.", "success");
      setUserProfile(null);
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete sheet and recalculate userLevel/likes, satisfies request
  const handleDeleteSheet = async (sheetId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'studySheets', sheetId));
      triggerToast("Lernzettel erfolgreich gelöscht.", "success");

      const remainingSheets = sheets.filter(s => s.autorId === user.uid && s.id !== sheetId);
      const totalLikesValue = remainingSheets.reduce((sum, s) => sum + s.likes, 0);
      const computedLvlValue = Math.floor(totalLikesValue / 10);

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        totalLikes: totalLikesValue,
        userLevel: computedLvlValue
      });

      setUserProfile(prev => prev ? {
        ...prev,
        totalLikes: totalLikesValue,
        userLevel: computedLvlValue
      } : null);

    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `studySheets/${sheetId}`);
    }
  };

  // Helper selecting sheet from search and opening in Coach
  const handleSelectSearchSheet = (sheet: StudySheet) => {
    setAiSelectedSheet(sheet);
    triggerToast(`Zettel "${sheet.titel}" für AI Coach vorgemerkt!`, "info");
    setActiveTab('ai');
  };

  const mySheets = sheets.filter(s => s.autorId === user?.uid);

  if (authChecking) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-white select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase animate-pulse mt-3">Anmeldedaten prüfen...</span>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 select-none overflow-hidden text-white font-sans">
        {/* Decorative background swirls */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -left-10 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-purple-600/10 blur-3xl rounded-full"></div>
        </div>

        <div className="relative z-10 w-full max-w-sm px-8 py-10 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg transform rotate-6 mb-6">
            <Sparkles size={28} className="text-white transform -rotate-6 animate-pulse" />
          </div>

          <h2 className="text-3xl font-black tracking-tight mb-2">QED <span className="text-xs font-mono font-bold text-blue-400 border border-blue-400/30 px-1.5 py-0.5 rounded uppercase ml-1">v1.2</span></h2>
          <p className="text-xs text-slate-400 mb-8 max-w-[240px] leading-relaxed">
            Teile deine Lernzettel, übe mit dem KI Coach und maximiere dein Unterrichtswissen.
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <LogIn size={14} className="text-slate-900" />
              <span>Mit Google anmelden</span>
            </button>
          </div>

          <div className="mt-8 text-[9px] text-slate-500 font-mono uppercase tracking-widest">
            Gemini-Powered Learning System
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      
      {/* Edge-to-Edge full viewport container */}
      <div id="app-container" className="relative w-full h-full flex flex-col overflow-hidden">
        
        {/* Header bar */}
        <header className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-900 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md z-30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-blue-200 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
              {avatarBase64 ? (
                <img src={avatarBase64} alt="M" className="w-full h-full object-cover" />
              ) : (
                userProfile?.name.charAt(0).toUpperCase() || "M"
              )}
            </div>
            <h1 className="text-2.5xl font-black tracking-tight text-slate-900 dark:text-white font-sans">QED</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {userProfile && (
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Level</span>
                <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">Lv. {userProfile.userLevel}</span>
              </div>
            )}
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800/80"></div>
            
            {/* Google Authentication login pop-up trigger */}
            {user?.isAnonymous ? (
              <button 
                onClick={handleGoogleLogin}
                className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450 border border-blue-100/50 hover:bg-blue-100 cursor-pointer flex items-center gap-1 text-[10px] font-bold font-sans"
                title="Google Konto verknüpfen"
              >
                <LogIn size={11} /> Google Link
              </button>
            ) : (
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            )}
          </div>
        </header>

        {/* Dynamic Display of screens */}
        <div className="flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-slate-900/40">
          {activeTab === 'feed' && (
            <FeedScreen 
              sheets={sheets} 
              currentUserId={user?.uid} 
              onLike={handleLikeSheet} 
              avatarBase64={avatarBase64}
              userProfile={userProfile}
              onDelete={handleDeleteSheet}
            />
          )}

          {activeTab === 'search' && (
            <SearchScreen 
              sheets={sheets} 
              onSelectSheet={handleSelectSearchSheet}
            />
          )}

          {activeTab === 'upload' && (
            <UploadScreen 
              imageCount={userProfile?.imageCount || 0} 
              setImageCount={(count) => handleUpdateProfile({ imageCount: count })}
              onPublish={handlePublishSheet}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'ai' && (
            <AiCoachScreen 
              selectedSheet={aiSelectedSheet || (sheets.length > 0 ? sheets[0] : null)}
              triggerToast={triggerToast}
              checkAndIncrementUploadCount={checkAndIncrementUploadCount}
              userProfile={userProfile}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileScreen 
              userProfile={userProfile} 
              mySheets={mySheets}
              sheetsCountGlobally={sheets.length}
              onUpdateProfile={handleUpdateProfile}
              onWipeData={handleWipeUserData}
              onDeletePost={handleDeleteSheet}
              triggerToast={triggerToast}
              avatarBase64={avatarBase64}
              onAvatarChange={handleAvatarChange}
            />
          )}
        </div>

        {/* Global Toast Message Container overlay */}
        <div className="absolute bottom-24 left-6 right-6 z-50 pointer-events-none space-y-2">
          {toasts.map(toast => (
            <div 
              key={toast.id}
              className={`p-4 rounded-2xl border shadow-lg flex items-start gap-3 pointer-events-auto transition-all duration-300 ${
                toast.type === 'error' 
                  ? 'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/80 dark:border-rose-900/40 dark:text-rose-200' 
                  : toast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-900/40 dark:text-emerald-200'
                  : 'bg-slate-900 border-slate-800 text-white dark:bg-slate-800 dark:border-slate-700'
              }`}
            >
              <div className="flex-1 text-xs font-semibold leading-relaxed font-sans">{toast.msg}</div>
            </div>
          ))}
        </div>

        {/* Floating Bottom Navigation Bar */}
        <nav className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 px-4 py-2.5 flex justify-between items-center z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.01)] shrink-0 transition-colors duration-300">
          
          <button 
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-all ${activeTab === 'feed' ? 'text-blue-600 dark:text-blue-400 font-bold scale-105' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <Rss size={18} />
            <span className="text-[8px] font-bold tracking-wider uppercase opacity-80 font-mono">Feed</span>
          </button>

          <button 
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-all ${activeTab === 'search' ? 'text-blue-600 dark:text-blue-400 font-bold scale-105' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <Search size={18} />
            <span className="text-[8px] font-bold tracking-wider uppercase opacity-80 font-mono">Suche</span>
          </button>

          <div className="flex-1 flex justify-center -mt-6">
            <button 
              onClick={() => setActiveTab('upload')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg cursor-pointer transition-all border-2 border-white dark:border-slate-950 ${activeTab === 'upload' ? 'bg-blue-600 text-white scale-110' : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white hover:scale-105'}`}
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>

          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-all ${activeTab === 'ai' ? 'text-blue-600 dark:text-blue-400 font-bold scale-105' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <Sparkles size={18} />
            <span className="text-[8px] font-bold tracking-wider uppercase opacity-80 font-mono">AI Coach</span>
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 flex-1 cursor-pointer transition-all ${activeTab === 'profile' ? 'text-blue-600 dark:text-blue-400 font-bold scale-105' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <User size={18} />
            <span className="text-[8px] font-bold tracking-wider uppercase opacity-80 font-mono">Profil</span>
          </button>

        </nav>

      </div>

    </div>
  );
}
