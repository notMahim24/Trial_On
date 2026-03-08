import { useState } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  onTryOn: (productId: string, GarmentImageUrl: string) => void;
}

export default function ProductCard({ id, name, price, imageUrl, onTryOn }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative flex flex-col gap-3 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imageUrl} 
          alt={name} 
          className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Hover Overlay with Try-On Button */}
        <div className={`absolute inset-0 bg-black/5 flex items-end justify-center pb-6 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onTryOn(id, imageUrl);
            }}
            className="glass-panel px-6 py-2.5 rounded-full font-medium text-sm text-neutral-900 hover:bg-white transition-all transform hover:scale-105"
          >
            Virtual Try-On
          </button>
        </div>
      </div>
      
      <div className="flex flex-col">
        <h3 className="text-sm font-medium text-neutral-900">{name}</h3>
        <p className="text-sm text-neutral-500">{price}</p>
      </div>
    </div>
  );
}
