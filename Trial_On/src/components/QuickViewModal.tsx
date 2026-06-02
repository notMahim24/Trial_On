import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Heart, Loader2, Camera } from 'lucide-react';
import { Product } from '../types';
import { cn } from '../lib/utils';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, qty: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  isAddingToCart: boolean;
  onViewDetails: (product: Product) => void;
  onTryOn: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  isAddingToCart,
  onViewDetails,
  onTryOn,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [qty, setQty] = useState(1);

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[160] w-full max-w-3xl bg-white shadow-2xl flex overflow-hidden"
            style={{ maxHeight: '90vh' }}
          >
            {/* Left — Image */}
            <div className="w-2/5 flex-shrink-0 relative overflow-hidden bg-[#f6f6f6] group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Right — Info */}
            <div className="flex-1 p-10 overflow-y-auto flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-black/40 mb-2 block">{product.category}</span>
                  <h2 className="text-2xl font-serif leading-tight">{product.name}</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-black/5 flex-shrink-0 ml-4">
                  <X size={20} />
                </button>
              </div>

              <p className="text-3xl font-serif mb-2 opacity-80">${product.price.toFixed(2)}</p>

              {/* Stock badge */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">In Stock</span>
              </div>

              <p className="text-sm leading-relaxed text-black/60 mb-8">
                {product.description || 'A masterpiece of modern design, embodying timeless elegance and superior craftsmanship.'}
              </p>

              {/* Size Selection */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Size</span>
                  <span className="text-[10px] uppercase tracking-widest text-black/40 cursor-pointer hover:text-black transition-colors">Size Guide</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'w-10 h-10 text-[10px] font-bold border transition-all',
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : 'border-black/15 hover:border-black'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold mb-4 block">Quantity</span>
                <div className="flex items-center border border-black/15 w-fit">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-black/5 transition-colors text-lg font-light">−</button>
                  <span className="w-12 text-center text-sm font-bold">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-black/5 transition-colors text-lg font-light">+</button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => onToggleWishlist(product)}
                  className="w-12 h-12 border border-black/15 flex items-center justify-center hover:bg-black/5 transition-all flex-shrink-0"
                >
                  <Heart size={16} className={cn(isWishlisted && 'fill-black text-black')} />
                </button>
                <button
                  onClick={() => onAddToCart(product, qty)}
                  disabled={isAddingToCart}
                  className="flex-1 h-12 bg-black text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-black/80 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isAddingToCart
                    ? <><Loader2 size={14} className="animate-spin" /> Adding...</>
                    : <><ShoppingBag size={14} /> Add to Bag</>
                  }
                </button>
              </div>

              {/* Try On */}
              <button
                onClick={onTryOn}
                className="w-full h-11 border border-[#8b7355] text-[#8b7355] text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#8b7355] hover:text-white transition-all flex items-center justify-center gap-2 mb-6"
              >
                <Camera size={14} /> Virtual Try-On
              </button>

              {/* View Full Details */}
              <button
                onClick={() => { onViewDetails(product); onClose(); }}
                className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/40 hover:text-black transition-colors underline underline-offset-4 decoration-black/20"
              >
                View Full Details →
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
