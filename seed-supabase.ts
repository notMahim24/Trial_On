import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("⚠️ ERROR: Mising VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Seeding Supabase...');

    const products = [
        { name: "Midnight Velvet Blazer", price: 449.99, category: "Outerwear", image: "https://images.unsplash.com/photo-1598808503746-f34c53b20ef3?auto=format&fit=crop&q=80&w=800", description: "Tailored to perfection, this velvet blazer exudes timeless evening sophistication.", is_available: 1, color: "Black", size: "S,M,L,XL" },
        { name: "Silk Slip Dress", price: 289.00, category: "Dresses", image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d02?auto=format&fit=crop&q=80&w=800", description: "Minimalist mulberry silk slip dress with a fluid, liquid-like drape.", is_available: 1, color: "Champagne", size: "XS,S,M,L" },
        { name: "Cashmere Turtleneck", price: 359.50, category: "Knitwear", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800", description: "Ultra-fine Italian cashmere for unparalleled warmth and softness.", is_available: 1, color: "Camel", size: "S,M,L,XL" },
        { name: "Tailored Wool Trousers", price: 229.00, category: "Bottoms", image: "https://images.unsplash.com/photo-1624372911333-890f54593848?auto=format&fit=crop&q=80&w=800", description: "Precision-cut tailored trousers in breathable virgin wool.", is_available: 1, color: "Grey", size: "30,32,34,36" },
        { name: "Leather Chelsea Boots", price: 510.00, category: "Footwear", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800", description: "Handcrafted leather boots with a refined silhouette and durable finish.", is_available: 1, color: "Tobacco", size: "8,9,10,11,12" },
        { name: "Oversized Linen Shirt", price: 189.00, category: "Tops", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800", description: "Relaxed-fit shirt crafted from high-grade European linen.", is_available: 1, color: "White", size: "S,M,L,XL,XXL" }
    ];

    const categories = [
        { id: '1', name: 'Women', slug: 'women', description: 'Luxury apparel and accessories for women.', parentId: null, image: 'https://images.unsplash.com/photo-1539109132314-34a77ae68c44?q=80&w=1974&auto=format&fit=crop' },
        { id: '1-1', name: 'Dresses', slug: 'women-dresses', description: null, parentId: '1', image: null },
        { id: '1-2', name: 'Outerwear', slug: 'women-outerwear', description: null, parentId: '1', image: null },
        { id: '1-3', name: 'Handbags', slug: 'women-handbags', description: null, parentId: '1', image: null },
        { id: '2', name: 'Men', slug: 'men', description: 'Sophisticated tailoring and essentials for men.', parentId: null, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop' },
        { id: '2-1', name: 'Suits', slug: 'men-suits', description: null, parentId: '2', image: null },
        { id: '2-2', name: 'Accessories', slug: 'men-accessories', description: null, parentId: '2', image: null },
        { id: '3', name: 'Accessories', slug: 'accessories', description: 'The finishing touches for any ensemble.', parentId: null, image: 'https://images.unsplash.com/photo-1511406361295-0a5ff814c0ad?q=80&w=1974&auto=format&fit=crop' }
    ];

    const { error: pErr } = await supabase.from('products').upsert(products);
    if (pErr) console.error("Error products:", pErr);
    else console.log("Products seeded!");

    const { error: cErr } = await supabase.from('categories').upsert(categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        parentid: c.parentId,
        image: c.image
    })));
    if (cErr) console.error("Error categories:", cErr);
    else console.log("Categories seeded!");

    console.log('Seeding Complete.');
}

seed();
