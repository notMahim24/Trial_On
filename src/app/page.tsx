"use client";

import { useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import TryOnModal from "@/components/TryOnModal";

// Sample placeholder data for the classic clothing look
const PRODUCTS = [
  {
    id: "p1",
    name: "Classic Beige Trench Coat",
    price: "$295.00",
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "p2",
    name: "Minimalist Linen Silhouette",
    price: "$145.00",
    imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "p3",
    name: "Oversized Wool Blazer",
    price: "$320.00",
    imageUrl: "https://images.unsplash.com/photo-1588143232675-bc32204c32b1?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: "p4",
    name: "Silk Satin Midi Dress",
    price: "$210.00",
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop"
  }
];

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGarmentUrl, setSelectedGarmentUrl] = useState<string>("");

  const handleOpenTryOn = (productId: string, garmentUrl: string) => {
    setSelectedGarmentUrl(garmentUrl);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="mb-16 max-w-2xl">
          <h1 className="classic-heading text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Redefining Your <br />
            <span className="text-neutral-500 italic">Personal Style</span>
          </h1>
          <p className="text-lg text-neutral-600 font-medium">
            Explore our curated collection of timeless classics. Use our advanced IDM-VTON technology to virtually try on any piece before you buy.
          </p>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-12">
          {PRODUCTS.map(product => (
            <ProductCard 
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
              onTryOn={handleOpenTryOn}
            />
          ))}
        </section>
      </main>

      <TryOnModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        garmentImageUrl={selectedGarmentUrl} 
      />
    </div>
  );
}
