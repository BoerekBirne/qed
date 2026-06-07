import React, { useState, useRef } from 'react';
import { Upload, Camera, Trash2, Loader2 } from 'lucide-react';

interface UploadScreenProps {
  imageCount: number;
  setImageCount: (count: number) => void;
  onPublish: (data: { titel: string; fach: string; schule: string; inhalt: string; imageBase64: string | null }) => void;
  triggerToast: (msg: string, type: 'info' | 'success' | 'error') => void;
}

export default function UploadScreen({ imageCount, setImageCount, onPublish, triggerToast }: UploadScreenProps) {
  const [titel, setTitel] = useState('');
  const [fach, setFach] = useState('');
  const [schule, setSchule] = useState('');
  const [inhalt, setInhalt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingOcr, setLoadingOcr] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger real backend AI OCR analysis
  const performOcr = async (base64Data: string) => {
    setLoadingOcr(true);
    setInhalt('Lernzettel wird analysiert... Bitte warten...');
    triggerToast("Starte automatische KI-Bildanalyse...", "info");

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Data })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Fehler bei der Bildanalyse.");
      }

      setInhalt(data.text || '');
      triggerToast("Text erfolgreich aus dem Bild extrahiert!", "success");
    } catch (err: any) {
      console.error(err);
      setInhalt('');
      triggerToast(`Bilderanalyse fehlgeschlagen: ${err.message || String(err)}`, "error");
    } finally {
      setLoadingOcr(false);
    }
  };

  // File preview converter with Canvas auto-compression to avoid exceeding Firestore's 1MB document limit
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      if (event.target?.result) {
        const rawBase64 = event.target.result as string;
        
        // Use an HTML5 Image to scale down any heavy photo
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 400; // max width or height
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
            setSelectedImage(compressed);
            triggerToast("Optimierte Datei geladen!", "success");
            // Run real OCR image-to-text analysis
            performOcr(compressed);
          } else {
            setSelectedImage(rawBase64);
            triggerToast("Datei geladen!", "success");
            performOcr(rawBase64);
          }
        };
        img.onerror = () => {
          setSelectedImage(rawBase64);
          triggerToast("Datei geladen!", "success");
          performOcr(rawBase64);
        };
        img.src = rawBase64;
      }
    };
    fileReader.readAsDataURL(file);
  };

  const handlePublishClick = () => {
    if (!titel.trim()) {
      triggerToast("Bitte gib einen aussagekräftigen Titel für deinen Zettel ein.", "error");
      return;
    }

    // Technical Rule 1: Limit picture check
    if (imageCount >= 1000) {
      const supportErrorMsg = "Support-Fehler: Dein Cloud-Speicherlimit von 1000 Bildern wurde erreicht. Bitte kontaktiere umgehend support@qed-app.de, um zusätzlichen PWA-Speicherplatz freizuschalten.";
      triggerToast(supportErrorMsg, "error");
      return;
    }

    onPublish({
      titel: titel.trim(),
      fach: fach.trim() || 'Allgemein',
      schule: schule.trim() || 'Keine Angabe',
      inhalt: inhalt.trim() || 'Mitschrift wurde analysiert.',
      imageBase64: selectedImage
    });

    // Reset Form fields
    setTitel('');
    setFach('');
    setSchule('');
    setInhalt('');
    setSelectedImage(null);
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(null);
    setInhalt('');
    triggerToast("Bild entfernt.", "info");
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      <div className="p-6 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 shrink-0">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans tracking-tight">Zettel hochladen</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Nimm ein Foto deiner Mitschrift auf oder lade ein Dokument hoch.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
        {/* Upload Dropzone Container */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-400 rounded-2xl p-6 text-center transition-colors bg-white dark:bg-slate-900 flex flex-col items-center justify-center min-h-[170px] cursor-pointer group"
        >
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="w-11 h-11 bg-slate-50 dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 mb-3 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/20 group-hover:text-blue-500 transition-colors">
            <Camera size={20} className="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Foto aufnehmen oder Datei auswählen</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">JPEG, PNG bis zu 25MB (automatische Bild-KI OCR)</p>
        </div>

        {/* Small Preview Box when image is loaded */}
        {selectedImage && (
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 animate-fadeIn">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black shrink-0 relative">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Bild-Vorschau</span>
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 truncate mt-0.5">Scanned_Study_Sheet.jpg</span>
              {loadingOcr ? (
                <span className="flex items-center gap-1 text-[9px] font-medium text-blue-600 dark:text-blue-400 mt-1">
                  <Loader2 size={10} className="animate-spin" /> Extrahierte Textanalyse läuft...
                </span>
              ) : (
                <span className="block text-[9px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">✓ KI-Textanalyse abgeschlossen</span>
              )}
            </div>
            <button 
              onClick={handleRemoveImage}
              className="p-2 bg-slate-200/60 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all cursor-pointer"
              title="Bild entfernen"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {/* Form Inputs Container */}
        <div className="space-y-4 bg-white dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-900 rounded-2xl shadow-elegant">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-800 dark:text-slate-250 uppercase tracking-wider mb-1.5 font-sans">Titel des Zettels</label>
            <input
              type="text"
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder="z.B. Elektrotechnik Formelsammlung"
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-600"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-800 dark:text-slate-250 uppercase tracking-wider mb-1.5 font-sans">Fach / Thema</label>
              <input
                type="text"
                value={fach}
                onChange={(e) => setFach(e.target.value)}
                placeholder="z.B. Mathematik"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-800 dark:text-slate-250 uppercase tracking-wider mb-1.5 font-sans">Schule</label>
              <input
                type="text"
                value={schule}
                onChange={(e) => setSchule(e.target.value)}
                placeholder="z.B. LMU München"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-800 dark:text-slate-250 uppercase tracking-wider mb-1.5 font-sans">Mitschrift-Inhalt (OCR/Text)</label>
            <textarea
              value={inhalt}
              onChange={(e) => setInhalt(e.target.value)}
              rows={4}
              placeholder="Füge hier wichtigen Text deiner Mitschrift für die Suche und den AI Coach hinzuoder lade ein Bild für die automatische Erkennung hoch..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-600 resize-none leading-relaxed"
            />
          </div>

          <button 
            type="button"
            onClick={handlePublishClick}
            className="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
          >
            <Upload size={14} />
            <span>Zettel veröffentlichen</span>
          </button>
        </div>

      </div>
    </div>
  );
}
