import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ProductZoomProps {
  images: string[];
  alt: string;
}

const ProductZoom: React.FC<ProductZoomProps> = ({ images, alt }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [showLens, setShowLens] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const mainImageRef = useRef<HTMLDivElement>(null);
  const galleryImageRef = useRef<HTMLDivElement>(null);
  const touchStartDist = useRef<number>(0);
  const touchStartZoom = useRef<number>(1);

  const validImages = images.filter(Boolean);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = mainImageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setLensPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setZoomPos({ x, y });
    setShowLens(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowLens(false);
  }, []);

  // Touch pinch-to-zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      touchStartZoom.current = zoomLevel;
    }
  }, [zoomLevel]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = (dist / touchStartDist.current) * touchStartZoom.current;
      setZoomLevel(Math.min(Math.max(scale, 1), 4));
    }
  }, []);

  // Keyboard nav in gallery
  useEffect(() => {
    if (!isGalleryOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setGalleryIndex(i => Math.min(i + 1, validImages.length - 1));
      if (e.key === 'ArrowLeft') setGalleryIndex(i => Math.max(i - 1, 0));
      if (e.key === 'Escape') setIsGalleryOpen(false);
      if (e.key === '+') setZoomLevel(z => Math.min(z + 0.5, 4));
      if (e.key === '-') setZoomLevel(z => Math.max(z - 0.5, 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isGalleryOpen, validImages.length]);

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setZoomLevel(1);
    setZoomPos({ x: 50, y: 50 });
    setIsGalleryOpen(true);
  };

  return (
    <>
      {/* Main Image with Hover Zoom Lens */}
      <div
        ref={mainImageRef}
        className="relative aspect-[4/5] overflow-hidden bg-[#f6f6f6] cursor-crosshair select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => openGallery(currentIndex)}
      >
        <img
          src={validImages[currentIndex]}
          alt={alt}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          draggable={false}
        />

        {/* Zoom Lens overlay */}
        {showLens && (
          <div
            className="absolute pointer-events-none border-2 border-white/60 shadow-xl"
            style={{
              width: 120,
              height: 120,
              left: lensPos.x - 60,
              top: lensPos.y - 60,
              background: `radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)`,
              backdropFilter: 'brightness(1.2)',
            }}
          />
        )}

        {/* Hover zoom preview panel - right side */}
        {showLens && (
          <div
            className="absolute top-0 left-full ml-2 w-[320px] h-[320px] z-30 border border-black/10 shadow-2xl bg-white overflow-hidden"
            style={{ display: 'block' }}
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${validImages[currentIndex]})`,
                backgroundSize: '250%',
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundRepeat: 'no-repeat',
              }}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/40 text-white text-[9px] uppercase tracking-wider px-2 py-1 rounded-full">
              <ZoomIn size={10} /> Zoom
            </div>
          </div>
        )}

        {/* Fullscreen button */}
        <button
          onClick={(e) => { e.stopPropagation(); openGallery(currentIndex); }}
          className="absolute bottom-4 right-4 z-10 p-2 bg-black/40 backdrop-blur-sm text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
        >
          <Maximize2 size={16} />
        </button>

        {/* Click hint */}
        <div className="absolute bottom-4 left-4 text-[9px] uppercase tracking-widest text-white/60 font-bold pointer-events-none">
          Click to expand
        </div>
      </div>

      {/* Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto no-scrollbar pb-1">
          {validImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`flex-shrink-0 w-16 h-20 overflow-hidden border-2 transition-all duration-300 ${
                i === currentIndex ? 'border-black opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      )}

      {/* Full-Screen Gallery Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col"
          >
            {/* Gallery Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <span className="text-white/50 text-[10px] uppercase tracking-[0.4em] font-bold">
                {galleryIndex + 1} / {validImages.length}
              </span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setZoomLevel(z => Math.max(z - 0.5, 1))}
                  disabled={zoomLevel <= 1}
                  className="p-2 text-white/60 hover:text-white disabled:opacity-20 transition-colors"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="text-white/50 text-xs font-mono w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel(z => Math.min(z + 0.5, 4))}
                  disabled={zoomLevel >= 4}
                  className="p-2 text-white/60 hover:text-white disabled:opacity-20 transition-colors"
                >
                  <ZoomIn size={18} />
                </button>
                <div className="w-px h-6 bg-white/20 mx-2" />
                <button
                  onClick={() => { setIsGalleryOpen(false); setZoomLevel(1); }}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Gallery Main */}
            <div
              ref={galleryImageRef}
              className="flex-1 flex items-center justify-center overflow-hidden relative"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => { if (zoomLevel < 1.1) setZoomLevel(1); }}
              style={{ touchAction: 'none' }}
            >
              <motion.img
                key={galleryIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={validImages[galleryIndex]}
                alt={`${alt} ${galleryIndex + 1}`}
                className="max-h-full max-w-full object-contain select-none"
                referrerPolicy="no-referrer"
                draggable={false}
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transition: zoomLevel === 1 ? 'transform 0.4s ease' : 'none',
                  cursor: zoomLevel > 1 ? 'move' : 'zoom-in',
                }}
                onMouseMove={(e) => {
                  if (zoomLevel <= 1) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  setZoomPos({
                    x: ((e.clientX - rect.left) / rect.width) * 100,
                    y: ((e.clientY - rect.top) / rect.height) * 100,
                  });
                }}
                onClick={() => {
                  if (zoomLevel === 1) setZoomLevel(2.5);
                  else setZoomLevel(1);
                }}
              />

              {/* Prev/Next */}
              {galleryIndex > 0 && (
                <button
                  onClick={() => { setGalleryIndex(i => i - 1); setZoomLevel(1); }}
                  className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all border border-white/10"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {galleryIndex < validImages.length - 1 && (
                <button
                  onClick={() => { setGalleryIndex(i => i + 1); setZoomLevel(1); }}
                  className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all border border-white/10"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center justify-center gap-2 py-4 px-6 border-t border-white/10 overflow-x-auto no-scrollbar">
              {validImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setGalleryIndex(i); setZoomLevel(1); }}
                  className={`flex-shrink-0 w-12 h-16 overflow-hidden transition-all duration-300 border-2 ${
                    i === galleryIndex ? 'border-white opacity-100 scale-110' : 'border-transparent opacity-40 hover:opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>

            {/* Zoom hint */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/30 text-[9px] uppercase tracking-widest pointer-events-none">
              Click image to zoom · Pinch on mobile · ← → to navigate
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductZoom;
