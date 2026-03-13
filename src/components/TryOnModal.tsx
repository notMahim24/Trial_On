import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Camera, Upload, ChevronLeft, ChevronRight,
  Download, Share2, Sparkles, Loader2, Check, RefreshCw, Zap
} from 'lucide-react';

interface TryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  garmentImageUrl: string;
  allGarments?: { name: string; image: string; price: number }[];
}

const TryOnModal: React.FC<TryOnModalProps> = ({ isOpen, onClose, garmentImageUrl, allGarments = [] }) => {
  const [mode, setMode] = useState<'landing' | 'processing' | 'result'>('landing');
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [activeGarmentIndex, setActiveGarmentIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allItems = allGarments.length > 0 ? allGarments : [{ name: 'Selected Item', image: garmentImageUrl, price: 0 }];
  const currentGarment = allItems[activeGarmentIndex] || allItems[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUserPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setUserPhotoUrl(src);
    };
    reader.readAsDataURL(file);
  };

  const startTryOn = async () => {
    if (!userPhotoUrl || !currentGarment.image) return;
    
    setMode('processing');
    setScanProgress(0);

    const progressInterval = setInterval(() => {
      setScanProgress(p => p < 90 ? p + Math.random() * 5 : p);
    }, 500);

    try {
      if (userPhotoFile) {
        const formData = new FormData();
        formData.append('userImage', userPhotoFile);
        formData.append('garmentImageUrl', currentGarment.image);

        const res = await fetch('/api/try-on', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.resultUrl) {
          clearInterval(progressInterval);
          setScanProgress(100);
          setResultImage(data.resultUrl);
          setMode('result');
          return;
        }
      }
    } catch (error) {
      console.error("VTON API Error:", error);
    }
    
    // Fallback to simulation if API fails
    clearInterval(progressInterval);
    setScanProgress(100);
    setTimeout(() => {
      setResultImage(userPhotoUrl);
      setMode('result');
    }, 1000);
  };

  const handleSave = () => {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = `veston-tryon-${Date.now()}.jpg`;
    a.click();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share && resultImage) {
      try {
        await navigator.share({ title: 'My VESTON Look', text: 'Check out my virtual try-on from VESTON!' });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleReset = () => {
    setUserPhotoUrl(null);
    setUserPhotoFile(null);
    setResultImage(null);
    setMode('landing');
    setIsSaved(false);
    setScanProgress(0);
  };

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[180] flex items-center justify-center"
          style={{ background: 'radial-gradient(ellipse at center, #0a0a14 0%, #000000 100%)' }}
        >
          {/* Animated aurora bg */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="veston-aurora-1" />
            <div className="veston-aurora-2" />
            <div className="veston-aurora-3" />
          </div>

          {/* Close button — always on top */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-6 right-6 z-[200] p-3 border border-white/20 text-white/70 hover:text-white hover:border-white/60 transition-all backdrop-blur-sm bg-black/30 hover:bg-white/10"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="absolute top-6 left-0 right-0 flex justify-center z-20">
            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
              <Sparkles size={14} className="text-[#8b7355]" />
              <span className="text-white text-[10px] uppercase tracking-[0.5em] font-bold">VESTON · Virtual Try-On</span>
              <Sparkles size={14} className="text-[#8b7355]" />
            </div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-20 pb-6 flex gap-6 h-screen items-center">

            {/* ── Left: User Canvas ── */}
            <div className="flex-1 h-[70vh] relative flex flex-col items-center justify-center">
              <div
                className="w-full h-full relative overflow-hidden"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Corner decorations */}
                {[['top-0 left-0', 'border-t border-l'], ['top-0 right-0', 'border-t border-r'],
                  ['bottom-0 left-0', 'border-b border-l'], ['bottom-0 right-0', 'border-b border-r']].map(([pos, border], i) => (
                  <div key={i} className={`absolute ${pos} w-6 h-6 ${border} border-[#8b7355] m-2`} />
                ))}

                {/* Landing */}
                {mode === 'landing' && (
                  <div className="absolute inset-0 flex flex-col p-10 justify-center">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-serif text-white mb-2">Virtual Try-On Setup</h2>
                      <p className="text-white/50 text-sm">Select your photo and the clothing item to begin.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-10 w-full max-w-2xl mx-auto">
                      {/* Option 1: Upload Image */}
                      <div className="border border-white/20 bg-black/20 p-6 flex flex-col items-center justify-center text-center relative min-h-[250px] group rounded-sm overflow-hidden">
                        <div className="absolute top-4 left-4 z-20 text-white/30 text-[10px] uppercase font-bold tracking-widest">Option 1</div>
                        {userPhotoUrl ? (
                           <>
                             <img src={userPhotoUrl} alt="User photo" className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-50 transition-opacity group-hover:opacity-30" />
                             <div className="relative z-10 flex flex-col items-center gap-4">
                               <Check size={32} className="text-emerald-400" />
                               <span className="text-white font-serif">Photo Selected</span>
                               <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-black/80 backdrop-blur border border-white/30 text-white text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Change Photo</button>
                             </div>
                           </>
                        ) : (
                          <div className="relative z-10 flex flex-col items-center">
                            <Upload size={32} className="text-white/40 mb-4" />
                            <h3 className="text-white font-serif mb-2">Upload Image</h3>
                            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-6 px-4">From Gallery</p>
                            <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-white text-black text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-white/90 transition-colors shadow-lg">Select Photo</button>
                          </div>
                        )}
                      </div>

                      {/* Option 2: Select Clothing */}
                      <div className="border border-white/20 bg-black/20 p-6 flex flex-col items-center justify-center text-center relative min-h-[250px] rounded-sm overflow-hidden group">
                        <div className="absolute top-4 left-4 z-20 text-white/30 text-[10px] uppercase font-bold tracking-widest">Option 2</div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />
                        <img src={currentGarment.image} alt="Garment" className="absolute inset-x-0 bottom-0 top-12 w-full h-full object-contain p-4 opacity-80 group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                           <span className="text-white text-[10px] uppercase tracking-widest font-bold mb-2">Clothing Selected</span>
                           <p className="text-white font-serif px-4">{currentGarment.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <button 
                        onClick={startTryOn}
                        disabled={!userPhotoUrl}
                        className="px-12 py-4 bg-admin-gold text-black text-[12px] uppercase font-bold tracking-[0.3em] hover:bg-[#c9a84c] disabled:opacity-30 disabled:bg-white/10 disabled:text-white transition-all rounded-sm shadow-[0_0_20px_rgba(201,168,76,0.2)] disabled:shadow-none"
                      >
                        Start Virtual Try-On
                      </button>
                    </div>
                  </div>
                )}

                {/* Processing */}
                {mode === 'processing' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
                    {userPhotoUrl && (
                      <div className="relative w-full h-full">
                        <img src={userPhotoUrl} alt="Processing" className="w-full h-full object-cover opacity-40" />
                        {/* AI scan animation */}
                        <div
                          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8b7355] to-transparent"
                          style={{ top: `${scanProgress}%`, boxShadow: '0 0 20px #8b7355' }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                          <div className="flex items-center gap-3 px-6 py-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full">
                            <Loader2 size={16} className="text-[#8b7355] animate-spin" />
                            <span className="text-white text-[10px] uppercase tracking-[0.4em]">AI Fitting...</span>
                          </div>
                          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#8b7355] to-[#c9a84c] transition-all"
                              style={{ width: `${Math.min(scanProgress, 100)}%` }}
                            />
                          </div>
                          <span className="text-white/40 text-xs font-mono">{Math.round(Math.min(scanProgress, 100))}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Result */}
                {mode === 'result' && resultImage && (
                  <div className="absolute inset-0">
                    <img
                      src={resultImage}
                      alt="Try-on result"
                      className="w-full h-full object-cover"
                    />
                    {/* Garment overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <img
                        src={currentGarment.image}
                        alt="Garment overlay"
                        className="w-3/5 h-auto opacity-70 mix-blend-multiply drop-shadow-2xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Result badge */}
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full">
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-white text-[9px] uppercase tracking-widest">Ready</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Result actions */}
              {mode === 'result' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 mt-4 w-full"
                >
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/20 text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white/10 transition-all"
                  >
                    {isSaved ? <><Check size={14} className="text-emerald-400" /> Saved!</> : <><Download size={14} /> Save</>}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/20 text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white/10 transition-all"
                  >
                    <Share2 size={14} /> Share
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 px-5 py-3 border border-white/10 text-white/50 text-[10px] uppercase tracking-[0.3em] font-bold hover:text-white hover:border-white/30 transition-all"
                  >
                    <RefreshCw size={14} />
                  </button>
                </motion.div>
              )}
            </div>

            {/* ── Right: Garment Panel ── */}
            <div
              className="w-72 flex flex-col h-[70vh]"
              style={{ border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', background: 'rgba(255,255,255,0.03)' }}
            >
              <div className="p-5 border-b border-white/8">
                <p className="text-white/40 text-[9px] uppercase tracking-[0.5em] font-bold mb-1">Current Outfit</p>
                <h3 className="text-white font-serif text-xl leading-tight">{currentGarment.name}</h3>
                {currentGarment.price > 0 && (
                  <p className="text-[#8b7355] text-sm font-serif mt-1">${currentGarment.price.toFixed(2)}</p>
                )}
              </div>

              {/* Garment Image */}
              <div className="p-4">
                <div className="aspect-[3/4] overflow-hidden bg-white/5 relative group">
                  <img
                    src={currentGarment.image}
                    alt={currentGarment.name}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Outfit Switcher */}
              {allItems.length > 1 && (
                <div className="px-4 flex-1 overflow-hidden">
                  <p className="text-white/30 text-[9px] uppercase tracking-[0.4em] font-bold mb-3">Switch Outfit</p>
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-40 custom-scrollbar pr-1">
                    {allItems.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => { setActiveGarmentIndex(i); if (mode === 'result') setMode('processing'); }}
                        className={`flex items-center gap-3 p-2 text-left transition-all ${
                          i === activeGarmentIndex
                            ? 'bg-white/10 border border-white/20'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <img src={item.image} alt={item.name} className="w-10 h-12 object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                        <div className="min-w-0">
                          <p className="text-white text-[10px] font-bold truncate">{item.name}</p>
                          <p className="text-white/40 text-[9px]">${item.price.toFixed(2)}</p>
                        </div>
                        {i === activeGarmentIndex && <Check size={12} className="text-[#8b7355] flex-shrink-0 ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Switcher Arrows for single item */}
              {allItems.length > 1 && (
                <div className="flex gap-2 p-4 border-t border-white/8 mt-auto">
                  <button
                    onClick={() => setActiveGarmentIndex(i => Math.max(0, i - 1))}
                    disabled={activeGarmentIndex === 0}
                    className="flex-1 py-2 border border-white/15 text-white disabled:opacity-20 hover:bg-white/10 transition-all flex items-center justify-center"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActiveGarmentIndex(i => Math.min(allItems.length - 1, i + 1))}
                    disabled={activeGarmentIndex === allItems.length - 1}
                    className="flex-1 py-2 border border-white/15 text-white disabled:opacity-20 hover:bg-white/10 transition-all flex items-center justify-center"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* AI Badge */}
              <div className="p-4 border-t border-white/8">
                <div className="flex items-center gap-2">
                  <Zap size={12} className="text-[#8b7355]" />
                  <span className="text-white/30 text-[9px] uppercase tracking-widest">Powered by VESTON AI</span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TryOnModal;
