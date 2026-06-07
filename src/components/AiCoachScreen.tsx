import React, { useState, useRef } from 'react';
import { Sparkles, Camera, MessageSquare, Send, Check, X, AlertCircle, ChevronRight, HelpCircle, RefreshCw } from 'lucide-react';
import { StudySheet, UserProfile } from '../types';

interface AiCoachScreenProps {
  selectedSheet: StudySheet | null;
  triggerToast: (msg: string, type: 'info' | 'success' | 'error') => void;
  checkAndIncrementUploadCount?: (isTestOnly?: boolean) => Promise<boolean>;
  userProfile?: UserProfile | null;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface VocabCard {
  term: string;
  definition: string;
}

export default function AiCoachScreen({ selectedSheet, triggerToast, checkAndIncrementUploadCount, userProfile }: AiCoachScreenProps) {
  const [quickText, setQuickText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<'analyze' | 'quiz' | 'vocab'>('analyze');
  const [loading, setLoading] = useState(false);
  const [responseHtml, setResponseHtml] = useState<string>('');
  const [chatSessionActive, setChatSessionActive] = useState(false);
  
  // Quiz Interactive state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Vocabulary Interactive cards state
  const [vocabCards, setVocabCards] = useState<VocabCard[]>([]);
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0);
  const [isVocabFlipped, setIsVocabFlipped] = useState(false);
  const [vocabStatus, setVocabStatus] = useState<Record<number, 'known' | 'retry'>>({});
  const [vocabFinished, setVocabFinished] = useState(false);
  const [vocabError, setVocabError] = useState<string | null>(null);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'coach'; msg: string }>>([
    { sender: 'coach', msg: 'Bereit für fachliche Fragen zu Dokumenten oder hochgeladenen Mitschriften.' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatTypingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger high-fidelity dynamic typing animation for live/interactive responses
  const startTypingAnimation = (rawText: string) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    const words = rawText.split(' ');
    let currentIndex = 0;
    setResponseHtml(formatMarkdownToHtml(''));

    typingIntervalRef.current = setInterval(() => {
      currentIndex++;
      const partialText = words.slice(0, currentIndex).join(' ');
      setResponseHtml(formatMarkdownToHtml(partialText));

      if (currentIndex >= words.length) {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
      }
    }, 45); // Gorgeous typewriter speed
  };

  // Chat typewriter simulation for conversational responses
  const animateChatCoachReply = (rawText: string) => {
    if (chatTypingIntervalRef.current) {
      clearInterval(chatTypingIntervalRef.current);
    }

    const words = rawText.split(' ');
    let currentIndex = 0;

    setChatHistory(prev => [...prev, { sender: 'coach', msg: '' }]);

    chatTypingIntervalRef.current = setInterval(() => {
      currentIndex++;
      const partialText = words.slice(0, currentIndex).join(' ');

      setChatHistory(prev => {
        const copy = [...prev];
        if (copy.length > 0) {
          copy[copy.length - 1] = { sender: 'coach', msg: partialText };
        }
        return copy;
      });

      if (currentIndex >= words.length) {
        if (chatTypingIntervalRef.current) {
          clearInterval(chatTypingIntervalRef.current);
        }
      }
    }, 45);
  };
  // Trigger real backend API analysis with Gemini
  const handleStartAnalysis = async (customPrompt?: string) => {
    const hasImage = !!uploadedImage;
    const textVal = customPrompt || quickText.trim();
    
    // Fallback: If they have an uploaded image, avoid pulling target content of an unrelated selected study sheet
    const targetInhalt = textVal || (hasImage ? "" : (selectedSheet ? selectedSheet.inhalt : ''));
    const targetTitle = textVal ? 'Manuelle Eingabe' : (hasImage ? 'Bild-Scan' : (selectedSheet ? selectedSheet.titel : 'Generischer Scan'));
    const targetFach = hasImage ? 'Allgemein' : (selectedSheet ? selectedSheet.fach : 'Allgemein');

    if (!targetInhalt && !hasImage) {
      triggerToast("Bitte gib einen Text ein, lade ein Foto hoch oder wähle einen Lernzettel aus.", "error");
      return;
    }

    // Limit Charge: If analyzing a direct image, perform the daily increment slot charge
    if (hasImage) {
      if (checkAndIncrementUploadCount) {
        const charged = await checkAndIncrementUploadCount(false);
        if (!charged) return; // blocked by image upload limit
      }
    }

    setLoading(true);
    setResponseHtml('');
    setQuizQuestions([]);
    setVocabCards([]);
    setQuizFinished(false);
    setVocabFinished(false);
    setQuizError(null);
    setVocabError(null);
    triggerToast("Anfrage wird über /api/ai verarbeitet...", "info");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inhalt: targetInhalt,
          uploadedImage: uploadedImage, // passes raw compressed image directly
          mode: aiMode,
          titel: targetTitle,
          fach: targetFach
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Aufruf des KI-Modells.");
      }

      if (aiMode === 'quiz') {
        try {
          const parsed = JSON.parse(data.text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setQuizQuestions(parsed);
            setCurrentQuizIndex(0);
            setSelectedOptionIndex(null);
            setQuizScore(0);
            setQuizFinished(false);
            triggerToast(`Interaktives Quiz mit ${parsed.length} Fragen erstellt!`, "success");
          } else {
            throw new Error("Ungültiges JSON-Array erhalten.");
          }
        } catch (e) {
          console.error("Quiz JSON parse error", e, data.text);
          setQuizError("Konnte kein strukturiertes Quiz laden. Es wurde standardmäßiger Text ausgegeben.");
          startTypingAnimation(data.text);
        }
      } else if (aiMode === 'vocab') {
        try {
          const parsed = JSON.parse(data.text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setVocabCards(parsed);
            setCurrentVocabIndex(0);
            setIsVocabFlipped(false);
            setVocabStatus({});
            setVocabFinished(false);
            triggerToast(`Karteikarten für ${parsed.length} Vokabeln generiert!`, "success");
          } else {
            throw new Error("Ungültiges Vokabel-Array erhalten.");
          }
        } catch (e) {
          console.error("Vocab JSON parse error", e, data.text);
          setVocabError("Konnte keine strukturierten Karteikarten laden. Es wurde standardmäßiger Text ausgegeben.");
          startTypingAnimation(data.text);
        }
      } else {
        startTypingAnimation(data.text);
        triggerToast("KI-Analyse erfolgreich abgeschlossen!", "success");
      }

    } catch (err: any) {
      console.error("AI Coach Error:", err);
      triggerToast(`AI Coach Fehler: ${err?.message || String(err)}`, "error");
      setResponseHtml(`
        <div class="text-rose-600 dark:text-rose-400 text-center space-y-2 py-4">
          <p class="font-bold">FEHLER</p>
          <p class="text-[11px]">${err?.message || "Fehler beim Laden der Antwort."}</p>
        </div>
      `);
    } finally {
      setLoading(false);
    }
  };

  const formatMarkdownToHtml = (text: string) => {
    let cleanText = text
      .replace(/\$/g, '')
      .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");

    let html = cleanText
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\*{2}/g, '') // strip **
      .replace(/^(?:#|\*)\s*(.*)$/gm, '<li class="ml-4 list-disc font-semibold text-slate-900 dark:text-white">$1</li>')
      .replace(/### (.*)/g, '<h4 class="font-bold text-xs mt-3 mb-1 text-slate-900 dark:text-white">$1</h4>')
      .replace(/## (.*)/g, '<h3 class="font-bold text-xs mt-4 mb-2 text-slate-900 dark:text-white">$1</h3>');

    return `
      <div class="space-y-3.5 text-left text-xs text-slate-900 dark:text-white font-medium leading-relaxed">
        <h4 class="font-bold text-slate-900 dark:text-white text-xs border-b border-slate-200 dark:border-slate-800 pb-1.5 flex justify-between items-center">
          <span>Scan-Analytik (Gemini-2.5-Flash)</span>
          <span class="text-[8px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-900 dark:text-white font-mono font-bold">GEMINI 2.5 ACTIVE</span>
        </h4>
        <div class="whitespace-pre-wrap">${html}</div>
      </div>
    `;
  };

  const handleDirectScanClick = () => {
    fileInputRef.current?.click();
  };

  // Real scan analysis loading file into preview state with canvas auto-compression
  const handleFileScanChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (checkAndIncrementUploadCount) {
      const allowed = await checkAndIncrementUploadCount(true);
      if (!allowed) {
        return;
      }
    }

    setLoading(true);
    triggerToast("Erfasse Bild für KI-Direkt-Analyse...", "info");

    const reader = new FileReader();
    reader.onload = async () => {
      if (reader.result) {
        const rawBase64 = reader.result as string;

        // Use canvas auto-compression to avoid massive payload uploads
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 600; // optimized high-resolution max border
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            setUploadedImage(compressed);
            triggerToast("Vorschaubild geladen! Bereit für direktes Coaching.", "success");
          } else {
            setUploadedImage(rawBase64);
            triggerToast("Vorschaubild geladen!", "success");
          }
          setLoading(false);
        };
        img.onerror = () => {
          setUploadedImage(rawBase64);
          triggerToast("Vorschaubild geladen!", "success");
          setLoading(false);
        };
        img.src = rawBase64;
      } else {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { sender: 'user', msg: userMsg }]);
    
    setLoading(true);
    triggerToast("Antwort wird formuliert...", "info");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inhalt: userMsg,
          uploadedImage: uploadedImage, // passes active image context for continuous questions.
          mode: 'chat',
          titel: 'Quick Chat Input',
          fach: 'Examen'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      animateChatCoachReply(data.text);
    } catch (e: any) {
      setChatHistory(prev => [...prev, { sender: 'coach', msg: 'Fehler beim Abrufen der KI-Antwort.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Quiz helper functions
  const handleQuizAnswer = (optionIdx: number) => {
    if (selectedOptionIndex !== null) return; // already answered
    setSelectedOptionIndex(optionIdx);
    const isCorrect = optionIdx === quizQuestions[currentQuizIndex].answerIndex;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      triggerToast("Korrekt! Wunderbar.", "success");
    } else {
      triggerToast("Leider falsch, lies dir die Erklärung durch.", "error");
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
    } else {
      setQuizFinished(true);
    }
  };

  // Vocab card helper functions
  const handleVocabMark = (status: 'known' | 'retry') => {
    setVocabStatus(prev => ({ ...prev, [currentVocabIndex]: status }));
    setIsVocabFlipped(false);
    if (currentVocabIndex < vocabCards.length - 1) {
      setCurrentVocabIndex(prev => prev + 1);
    } else {
      setVocabFinished(true);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const uploadsToday = userProfile?.lastUploadDate === todayStr ? (userProfile?.dailyUploadCount || 0) : 0;
  const remainingUploads = Math.max(0, 2 - uploadsToday);

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden ai-canvas-bg">
      {/* Animated AI Schlieren waves backdrop */}
      <div className="ai-waber-container">
        <div className="ai-waber-blob ai-waber-blob-1"></div>
        <div className="ai-waber-blob ai-waber-blob-2"></div>
        <div className="ai-waber-blob ai-waber-blob-3"></div>
      </div>

      <div className="ai-streak-1"></div>
      <div className="ai-streak-2"></div>

      <div className="p-6 border-b border-blue-100 dark:border-blue-900/40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md flex justify-between items-center z-10 shrink-0 gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-sans tracking-tight">
            <span>AI Coach</span>
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">Analysiere Mitschriften, mache interaktive Quizzes oder Karteikarten.</p>
        </div>

        <span className="text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100/20 px-2.5 py-1 rounded-full shrink-0">
          Bilder übrig: {remainingUploads} / 2
        </span>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleFileScanChange} 
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar z-10">
        
        {chatSessionActive ? (
          /* Direct interactive Chat UI */
          <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border border-blue-100 dark:border-blue-900/40 rounded-2xl p-5 min-h-[220px] flex flex-col justify-between shadow-elegant">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs border-b border-blue-50 dark:border-blue-900/20 pb-2 flex justify-between items-center mb-3">
              <span>Direkter Chatverlauf</span>
              <span className="text-[8px] bg-blue-100 dark:bg-blue-950/40 px-2 py-0.5 rounded text-blue-600 dark:text-blue-400 font-mono">Live</span>
            </h4>

            <div className="flex-1 max-h-[240px] overflow-y-auto no-scrollbar space-y-3 mb-4 text-[11px]">
              {chatHistory.map((chat, i) => (
                <div key={i} className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[8px] text-slate-400 font-bold uppercase mb-0.5">
                    {chat.sender === 'user' ? 'Mitschüler' : 'AI Coach'}
                  </span>
                  <div className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${chat.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'}`}>
                    {chat.msg}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-900">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                placeholder="Stelle eine Frage..."
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <button 
                onClick={handleSendChatMessage}
                className="px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        ) : (
          /* Structured inputs and response UI */
          <>
            <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md p-4 border border-blue-100 dark:border-blue-900/40 rounded-2xl space-y-3 shadow-elegant">
              <label className="block text-[10px] font-bold text-blue-600/70 dark:text-blue-400/85 uppercase tracking-wider">
                Eingabe oder Direkt-Bild-Scan
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={quickText}
                  onChange={(e) => setQuickText(e.target.value)}
                  placeholder={selectedSheet ? `Nutze ausgewählten Zettel: "${selectedSheet.titel}"` : "Text eintippen oder Frage an den Coach..."}
                  className="flex-1 px-3 py-2.5 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                />
                
                <button
                  type="button"
                  onClick={handleDirectScanClick}
                  className="w-10 h-10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-xl flex items-center justify-center cursor-pointer text-slate-600 dark:text-slate-300 shadow-sm shrink-0 transition-colors"
                  title="Lernzettel erfassen"
                >
                  <Camera size={16} className="text-blue-600 dark:text-blue-400" />
                </button>
              </div>

              {uploadedImage && (
                <div className="relative inline-block bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 animate-fadeIn shrink-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative group">
                    <img src={uploadedImage} alt="Uploaded preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors shadow-md"
                      title="Bild entfernen"
                    >
                      <X size={10} />
                    </button>
                  </div>
                  <span className="block text-[8px] font-mono text-slate-500 font-bold mt-1 text-center">Bild aktiv</span>
                </div>
              )}

              {/* Modes Selection Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[9px] uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setAiMode('analyze')}
                  className={`py-2 rounded-lg font-bold transition-all shadow-sm cursor-pointer ${aiMode === 'analyze' ? 'bg-blue-600 text-white' : 'bg-white/90 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-400'}`}
                >
                  Analyse
                </button>
                <button
                  type="button"
                  onClick={() => setAiMode('quiz')}
                  className={`py-2 rounded-lg font-bold transition-all shadow-sm cursor-pointer ${aiMode === 'quiz' ? 'bg-blue-600 text-white' : 'bg-white/90 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-400'}`}
                >
                  QUIZ (15 FRAGEN)
                </button>
                <button
                  type="button"
                  onClick={() => setAiMode('vocab')}
                  className={`py-2 rounded-lg font-bold transition-all shadow-sm cursor-pointer ${aiMode === 'vocab' ? 'bg-blue-600 text-white' : 'bg-white/90 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-400'}`}
                >
                  LERNKARTEN
                </button>
              </div>
            </div>

            {/* Run Button with beautiful pulse effect */}
            <button
              onClick={() => handleStartAnalysis()}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md ai-btn-glow disabled:opacity-50 cursor-pointer active:scale-98"
            >
              <Sparkles size={14} />
              <span>{loading ? "Generiere..." : `AI Coach starten (${aiMode === 'quiz' ? '15 interaktive Fragen' : aiMode === 'vocab' ? 'Interaktive Karteikarten' : 'Zusammenfassung'})`}</span>
            </button>

            {/* Response Area container - Houses dynamic rendering */}
            <div className="bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border border-blue-100 dark:border-blue-900/40 rounded-2xl p-5 min-h-[190px] flex flex-col justify-center relative overflow-hidden shadow-elegant whitespace-pre-wrap">
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-blue-100/50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full border border-blue-200/50 z-25">
                <span className="text-[8px] font-mono font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">INTERACTIVE COACH</span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-6">
                  <div className="flex items-center gap-1.5 justify-center">
                    <span className="loading-wave-bar"></span>
                    <span className="loading-wave-bar"></span>
                    <span className="loading-wave-bar"></span>
                    <span className="loading-wave-bar"></span>
                  </div>
                  <span className="text-[9px] text-blue-500 font-mono tracking-widest uppercase animate-pulse">
                    Konstruiere interaktive Benutzeroberfläche...
                  </span>
                </div>
              ) : aiMode === 'quiz' && quizQuestions.length > 0 ? (
                /* INTERACTIVE 15-QUESTION QUIZ RENDERER */
                quizFinished ? (
                  <div className="text-center py-6 space-y-4 animate-scaleUp">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center text-emerald-600 mx-auto border border-emerald-100">
                      <Check size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">Quiz abgeschlossen!</h4>
                      <p className="text-xs text-slate-500 font-mono">
                        Ergebnis: <strong className="text-blue-600 dark:text-blue-400">{quizScore} von 15 richtig</strong> ({( (quizScore / 15) * 100 ).toFixed(0)}%)
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-850 rounded-xl max-w-xs mx-auto">
                      <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                        {quizScore === 15 ? "🏆 Perfekt! Du hast volles Verständnis für diesen Lernzettel bewiesen. QED Mastermind!" : 
                         quizScore >= 10 ? "🥈 Super Arbeit! Du bist extrem nah dran an der perfekten Note." : 
                         "📘 Guter Versuch! Nutze die Erklärungen bei jeder Frage, um Wissenslücken gezielt zu füllen."}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleStartAnalysis()} 
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-blue-700 transition"
                    >
                      Quiz neustarten
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-left animate-fadeIn">
                    <div className="border-b border-slate-100 dark:border-slate-900 pb-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Frage {currentQuizIndex + 1} von 15</span>
                      {/* Linear progression bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${((currentQuizIndex + 1) / 15) * 100}%` }}></div>
                      </div>
                    </div>
                    
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white leading-relaxed font-sans">
                      {quizQuestions[currentQuizIndex]?.question}
                    </h5>

                    <div className="space-y-2 pt-1.5">
                      {quizQuestions[currentQuizIndex]?.options.map((option, idx) => {
                        const isSelected = selectedOptionIndex === idx;
                        const isCorrect = idx === quizQuestions[currentQuizIndex].answerIndex;
                        const isAnySelected = selectedOptionIndex !== null;

                        let buttonStyle = "bg-slate-50 hover:bg-slate-100/75 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200/60 dark:border-slate-850 text-slate-800 dark:text-slate-350";
                        
                        if (isAnySelected) {
                          if (isCorrect) {
                            buttonStyle = "bg-emerald-500 text-white border-emerald-600 font-bold";
                          } else if (isSelected) {
                            buttonStyle = "bg-rose-500 text-white border-rose-600 font-bold";
                          } else {
                            buttonStyle = "opacity-55 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-850/40 text-slate-400";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleQuizAnswer(idx)}
                            disabled={isAnySelected}
                            className={`w-full p-3 rounded-xl text-left text-xs transition-all duration-200 flex items-center justify-between ${buttonStyle} ${!isAnySelected ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            <span>{option}</span>
                            {isAnySelected && (
                              isCorrect ? <Check size={14} className="text-white" /> : 
                              isSelected ? <X size={14} className="text-white" /> : null
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {selectedOptionIndex !== null && (
                      <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-105/30 rounded-xl space-y-1.5 animate-slideUp">
                        <span className="block text-[8px] font-bold text-blue-600 dark:text-blue-400 font-mono uppercase tracking-widest">💡 ERKLÄRUNG</span>
                        <p className="text-[11px] leading-relaxed text-slate-750 dark:text-slate-300">
                          {quizQuestions[currentQuizIndex].explanation}
                        </p>
                        <button
                          onClick={handleNextQuizQuestion}
                          className="pt-2 w-full text-right text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-end gap-1 hover:underline cursor-pointer"
                        >
                          <span>{currentQuizIndex === quizQuestions.length - 1 ? "Ergebnisse anzeigen" : "Nächste Frage"}</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              ) : aiMode === 'vocab' && vocabCards.length > 0 ? (
                /* INTERACTIVE VOCABULARY CARD FLIPPER */
                vocabFinished ? (
                  <div className="text-center py-6 space-y-4 animate-scaleUp">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center text-amber-500 mx-auto border border-amber-140">
                      <HelpCircle size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">Lernkarten abgeschlossen!</h4>
                      <p className="text-xs text-slate-500">
                        Du hast {Object.values(vocabStatus).filter(s => s === 'known').length} von {vocabCards.length} Begriffen beherrscht.
                      </p>
                    </div>
                    
                    <div className="divide-y divide-slate-100 dark:divide-slate-900 border dark:border-slate-850 rounded-2xl max-h-[140px] overflow-y-auto no-scrollbar font-mono text-[9px] text-left">
                      {vocabCards.map((card, idx) => {
                        const state = vocabStatus[idx];
                        return (
                          <div key={idx} className="p-2.5 flex justify-between items-center bg-white dark:bg-slate-950">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-3">{card.term}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${state === 'known' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {state === 'known' ? 'Gewusst' : 'Nochmal üben'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <button 
                      onClick={() => handleStartAnalysis()} 
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-blue-700 transition"
                    >
                      Karten zurücksetzen
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-left animate-fadeIn">
                    <div className="border-b border-slate-100 dark:border-slate-900 pb-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Lernkarte {currentVocabIndex + 1} von {vocabCards.length}</span>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${((currentVocabIndex + 1) / vocabCards.length) * 100}%` }}></div>
                      </div>
                    </div>

                    {/* Flipped Card Component */}
                    <div 
                      onClick={() => setIsVocabFlipped(prev => !prev)}
                      className="relative min-h-[120px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-center items-center text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors shadow-sm relative overflow-hidden"
                    >
                      <span className="absolute top-2 right-3 font-mono text-[7px] text-slate-400 uppercase font-bold tracking-widest">
                        {isVocabFlipped ? "Klicke zum Drehen (Rückseite)" : "Klicke zum Drehen (Vorderseite)"}
                      </span>

                      {!isVocabFlipped ? (
                        <div className="animate-scaleUp">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{vocabCards[currentVocabIndex]?.term}</h4>
                        </div>
                      ) : (
                        <div className="animate-scaleUp">
                          <p className="text-xs text-slate-650 dark:text-slate-300 font-semibold leading-relaxed max-w-[220px]">
                            {vocabCards[currentVocabIndex]?.definition}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Interactive grading buttons */}
                    <div className="flex gap-2 pt-1 font-sans text-xs">
                      <button
                        onClick={() => handleVocabMark('retry')}
                        className="flex-1 py-3 border border-amber-200/50 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <RefreshCw size={12} className="animate-spin-slow" /> Nochmal üben
                      </button>
                      <button
                        onClick={() => handleVocabMark('known')}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                      >
                        <Check size={12} strokeWidth={3} /> Gewusst!
                      </button>
                    </div>
                  </div>
                )
              ) : responseHtml ? (
                <div dangerouslySetInnerHTML={{ __html: responseHtml }} />
              ) : (
                <div className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed text-center py-6 italic">
                  {selectedSheet ? (
                    <span>
                      Ausgewählter Lernzettel: <strong>"{selectedSheet.titel}"</strong>.<br />
                      Fächer-Thema: <strong>{selectedSheet.fach}</strong>.<br />
                      Klicke auf "AI Coach starten", um diesen Zettel tiefgreifend zu analysieren oder Übungsaufgaben zu generieren.
                    </span>
                  ) : (
                    <span>
                      Wähle im Feed einen Dokumenten-Zettel aus, lade selbst eine Mitschrift hoch oder tippe eine Frage ein und klicke oben auf "AI Coach starten", um zu beginnen.
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide mt-3 text-center select-none z-10 shrink-0 uppercase">
              Gemini - Ki kann Fehler machen.
            </div>
          </>
        )}

      </div>
    </div>
  );
}
