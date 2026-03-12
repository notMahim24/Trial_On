import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  Heart,
  Sparkles,
  Loader2,
  ChevronRight,
  ChevronDown,
  Camera,
  CheckCircle2,
  ShieldCheck,
  Volume2,
  VolumeX,
  Filter
} from 'lucide-react';
import { Product, CartItem } from './types';

import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminCategories from './admin/AdminCategories';
import AdminTags from './admin/AdminTags';
import AdminOrders from './admin/AdminOrders';
import AdminPayments from './admin/AdminPayments';
import AdminUsers from './admin/AdminUsers';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminDiscounts from './admin/AdminDiscounts';
import AdminMedia from './admin/AdminMedia';
import AdminBanners from './admin/AdminBanners';
import AdminBlog from './admin/AdminBlog';
import AdminReviews from './admin/AdminReviews';
import AdminNewsletters from './admin/AdminNewsletters';
import AdminSettings from './admin/AdminSettings';
import AdminAccounts from './admin/AdminAccounts';
import AdminProfile from './admin/AdminProfile';
import AdminAuditLogs from './admin/AdminAuditLogs';
import AdminServices from './admin/AdminServices';
import AdminContacts from './admin/AdminContacts';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';
import { cn } from './lib/utils';
import TryOnModal from './components/TryOnModal';
import QuickViewModal from './components/QuickViewModal';
import ProductZoom from './components/ProductZoom';
import OurServices from './pages/OurServices';
import ContactUs from './pages/ContactUs';



const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const TryOnCamera = ({ product }: { product: Product }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center text-white p-8 text-center">
        <Camera size={48} className="mb-4 opacity-20" />
        <p className="text-sm uppercase tracking-widest font-bold mb-2">Camera Access Denied</p>
        <p className="text-xs opacity-50 max-w-xs">Please enable camera permissions in your browser settings to use the virtual mirror.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
      />
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Product Overlay Simulation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg pointer-events-none mix-blend-multiply opacity-80"
      >
        <img
          src={product.image}
          alt="Try on overlay"
          className="w-full h-auto drop-shadow-2xl"
          referrerPolicy="no-referrer"
        />
      </motion.div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
        <div className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] text-white uppercase tracking-[0.3em] font-bold">
          Virtual Fitting in Progress
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/services" element={<OurServices />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="tags" element={<AdminTags />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="discounts" element={<AdminDiscounts />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="newsletters" element={<AdminNewsletters />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="admins" element={<AdminAccounts />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="contacts" element={<AdminContacts />} />
            {/* Placeholder routes for other admin pages */}
            <Route path="*" element={<div className="p-20 text-center font-serif italic opacity-40">This administrative module is currently being refined.</div>} />
          </Route>
          <Route path="*" element={<MainApp />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

const ProductImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <div className={cn("relative w-full h-full bg-brand-muted overflow-hidden", className)}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-black/5 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black/10 border-t-black/40 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "w-full h-full object-cover transition-all duration-700",
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
        )}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

const ProductSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="aspect-[4/5] bg-black/5" />
    <div className="space-y-3 flex flex-col items-center">
      <div className="h-4 bg-black/5 w-3/4" />
      <div className="h-3 bg-black/5 w-1/4" />
    </div>
  </div>
);

function MainApp() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileView, setProfileView] = useState<'main' | 'orders' | 'wishlist' | 'shipping' | 'payment' | 'settings'>('main');
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [isBuyNowOpen, setIsBuyNowOpen] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [discount, setDiscount] = useState(0);
  const [couponInput, setCouponInput] = useState('');
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [buyNowEmail, setBuyNowEmail] = useState('');
  const [buyNowSize, setBuyNowSize] = useState('M');
  const [buyNowSuccess, setBuyNowSuccess] = useState(false);
  const [isBuyNowSubmitting, setIsBuyNowSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' } | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  // Profile settings state
  const [profileDisplayName, setProfileDisplayName] = useState('');
  const [profileOldPassword, setProfileOldPassword] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileSaveMsg, setProfileSaveMsg] = useState('');

  const productsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const rainAudioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Initialize rain audio
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-rain-on-roof-loop-2440.mp3');
    audio.loop = true;
    audio.volume = 0.4;
    rainAudioRef.current = audio;

    return () => {
      audio.pause();
      rainAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('vv_wishlist');
    if (savedWishlist) {
      try { setWishlist(JSON.parse(savedWishlist)); } catch (e) {}
    }
  }, []);

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const isWishlisted = prev.some(item => item.id === product.id);
      const newWishlist = isWishlisted
        ? prev.filter(item => item.id !== product.id)
        : [...prev, product];
      localStorage.setItem('vv_wishlist', JSON.stringify(newWishlist));
      showNotification(isWishlisted ? `Removed ${product.name} from wishlist` : `Added ${product.name} to wishlist`, 'success');
      return newWishlist;
    });
  };

  useEffect(() => {
    const savedRV = localStorage.getItem('vv_recently_viewed');
    if (savedRV) {
      try { setRecentlyViewed(JSON.parse(savedRV)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setRecentlyViewed(prev => {
        const filtered = prev.filter(p => p.id !== selectedProduct.id);
        const newRV = [selectedProduct, ...filtered].slice(0, 8);
        localStorage.setItem('vv_recently_viewed', JSON.stringify(newRV));
        return newRV;
      });
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0.6;
    }
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (rainAudioRef.current) {
      if (!newMuted && window.scrollY === 0 && !selectedProduct) {
        rainAudioRef.current.play().catch(() => { });
      } else {
        rainAudioRef.current.pause();
      }
    }

    if (videoRef.current) {
      videoRef.current.muted = newMuted;
      if (!newMuted) {
        videoRef.current.play().catch(() => { });
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);

      if (rainAudioRef.current) {
        if (window.scrollY > 100 || selectedProduct || isMuted) {
          rainAudioRef.current.pause();
        } else if (window.scrollY === 0 && !isMuted && !selectedProduct) {
          rainAudioRef.current.play().catch(() => { });
        }
      }

      if (videoRef.current) {
        if (window.scrollY > 100 || selectedProduct || isMuted) {
          videoRef.current.muted = true;
        } else if (window.scrollY < 100 && !isMuted && !selectedProduct) {
          videoRef.current.muted = false;
          videoRef.current.play().catch(() => { });
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMuted, selectedProduct]);

  useEffect(() => {
    setIsLoadingProducts(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const availableProducts = data.filter((p: Product) =>
          p.is_available === 1 ||
          p.is_available === true ||
          p.is_available === undefined ||
          p.is_available === null
        );
        setProducts(availableProducts);
        setFilteredProducts(availableProducts);
      })
      .catch(err => console.error('Fetch error:', err))
      .finally(() => setIsLoadingProducts(false));
  }, []);

  useEffect(() => {
    let result = products;

    // Category Filter
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Search Filter
    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price Filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Color Filter
    if (selectedColors.length > 0) {
      result = result.filter(p => p.color && selectedColors.includes(p.color));
    }

    // Size Filter
    if (selectedSizes.length > 0) {
      result = result.filter(p => {
        if (!p.size) return false;
        const productSizes = p.size.split(',').map(s => s.trim());
        return selectedSizes.some(size => productSizes.includes(size));
      });
    }

    setFilteredProducts(result);
  }, [searchQuery, activeCategory, products, priceRange, selectedColors, selectedSizes]);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    setAddingToCartId(product.id);
    // Simulate network delay for better user feedback
    await new Promise(resolve => setTimeout(resolve, 800));

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });
    setAddingToCartId(null);
    setIsCartOpen(true);
    showNotification(`Added ${quantity} ${product.name} to bag`);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setCheckoutStep(1);
    setIsCheckoutOpen(true);
  };

  const processOrder = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'customer@example.com',
          total: finalTotal,
          items: cart
        })
      });
      if (response.ok) {
        setCart([]);
        setCheckoutStep(3);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification("Thank you for subscribing to our newsletter!", "info");
  };

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToFooter = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = cartTotal * discount;
  const finalTotal = cartTotal - discountAmount + (isGiftWrapped ? 15 : 0);

  const handleApplyCoupon = () => {
    const code = couponInput.toUpperCase();
    if (code === 'VESTON10' || code === 'TRYOVA10') {
      setDiscount(0.1);
      showNotification('10% Discount applied!', 'success');
      setCouponInput('');
    } else {
      showNotification('Invalid promo code.', 'info');
    }
  };

  const handleBuyNow = async () => {
    if (!buyNowEmail || !selectedProduct) return;
    setIsBuyNowSubmitting(true);
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: buyNowEmail,
          total: selectedProduct.price * buyQuantity,
          items: [{ ...selectedProduct, quantity: buyQuantity, size: buyNowSize }]
        })
      });
      setBuyNowSuccess(true);
    } catch {
      showNotification('Order could not be placed. Please try again.', 'info');
    } finally {
      setIsBuyNowSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-brand-bg text-brand-paper px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10"
          >
            {notification.type === 'success' ? <ShoppingBag size={18} className="text-emerald-400" /> : <Sparkles size={18} className="text-brand-accent" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 h-16 md:h-24 flex items-center",
        isScrolled ? "bg-white/90 backdrop-blur-md border-b border-black/5" : "bg-transparent border-transparent"
      )}>
        <div className="max-w-[1800px] w-full mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <button onClick={() => setIsMobileMenuOpen(true)} className={cn("md:hidden p-2", !isScrolled && !selectedProduct ? "text-white" : "text-black")}>
              <Menu size={24} />
            </button>
            <div className="hidden md:block relative">
              <button
                onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 border rounded-full text-[10px] uppercase tracking-[0.3em] font-bold transition-all",
                  !isScrolled && !selectedProduct
                    ? "text-white border-white/20 hover:bg-white/10"
                    : "text-black border-black/10 hover:bg-black/5"
                )}
              >
                Menu <ChevronDown size={14} className={cn("transition-transform", isNavMenuOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isNavMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-4 w-48 bg-white shadow-2xl border border-black/5 py-4 z-50"
                  >
                    <button onClick={() => { setActiveCategory('Outerwear'); scrollToProducts(); setIsNavMenuOpen(false); }} className="w-full text-left px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 transition-colors">New</button>
                    <button onClick={() => { setActiveCategory('All'); scrollToProducts(); setIsNavMenuOpen(false); }} className="w-full text-left px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 transition-colors">Women</button>
                    <button onClick={() => { setActiveCategory('All'); scrollToProducts(); setIsNavMenuOpen(false); }} className="w-full text-left px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 transition-colors">Men</button>
                    <button onClick={() => { scrollToFooter(); setIsNavMenuOpen(false); }} className="w-full text-left px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 transition-colors">Maison</button>
                    <Link to="/services" onClick={() => setIsNavMenuOpen(false)} className="block w-full text-left px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 transition-colors text-[#8b7355] border-t border-black/5">Our Services</Link>
                    <Link to="/contact" onClick={() => setIsNavMenuOpen(false)} className="block w-full text-left px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-black/5 transition-colors text-[#8b7355] border-t border-black/5">Contact Us</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <h1
            onClick={() => { setSelectedProduct(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={cn(
              "text-sm sm:text-xl md:text-4xl font-serif font-bold tracking-[0.25em] sm:tracking-[0.3em] cursor-pointer absolute left-1/2 -translate-x-1/2 transition-colors duration-700 whitespace-nowrap",
              !isScrolled && !selectedProduct ? "text-white" : "text-black"
            )}
          >
            VESTON
          </h1>

          <div className={cn("flex items-center gap-2 sm:gap-4 md:gap-8", !isScrolled && !selectedProduct ? "text-white" : "text-black")}>
            <div className={`hidden lg:flex items-center transition-all duration-300 ${isSearchOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full bg-transparent border-b px-2 py-1 text-xs uppercase tracking-widest focus:outline-none transition-all",
                  !isScrolled && !selectedProduct ? "border-white/20 focus:border-white text-white" : "border-black/20 focus:border-black text-black"
                )}
              />
            </div>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="nav-link flex items-center gap-2"
            >
              <Search size={18} /> <span className="hidden lg:inline">Search</span>
            </button>
            <button onClick={() => setIsCartOpen(true)} className="nav-link flex items-center gap-2">
              <ShoppingBag size={18} /> <span className="hidden lg:inline text-[10px] uppercase tracking-widest font-bold">Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
            </button>
            <button onClick={() => setIsProfileOpen(true)} className="nav-link flex items-center gap-2">
              <User size={18} /> <span className="hidden lg:inline text-[10px] uppercase tracking-widest font-bold">{isAuthenticated ? user?.name?.split(' ')[0] : 'Profile'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mega Menu Overlay (LV Style) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white z-[100] overflow-y-auto"
            >
              <div className="max-w-[1800px] mx-auto px-8 h-24 flex items-center">
                <button onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 uppercase tracking-[0.3em] text-[10px] font-bold hover:opacity-50 transition-opacity">
                  <X size={20} /> Close
                </button>
              </div>

              <div className="max-w-[1800px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-24">
                {/* Left Column: Categories */}
                <div className="lg:col-span-4 space-y-6">
                  {[
                    "Monogram Anniversary",
                    "Gifts and Personalization",
                    "New",
                    "Bags and Small Leather Goods",
                    "Women",
                    "Men",
                    "Perfumes and Beauty",
                    "Jewelry",
                    "Watches",
                    "Trunks, Travel and Home"
                  ].map((cat) => (
                    <button
                      key={cat}
                      className={`w-full text-left text-2xl font-serif tracking-wide hover:opacity-50 transition-opacity flex items-center justify-between group ${cat === 'Men' ? 'border-b border-black pb-2' : ''}`}
                    >
                      {cat}
                      {cat === 'Men' && <ChevronRight size={20} />}
                    </button>
                  ))}
                </div>

                {/* Right Column: Featured & Sub-links */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-12 border-l border-black/5 pl-12">
                  <div className="space-y-12">
                    <div className="aspect-[16/9] bg-brand-muted overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1549037173-e3b717902c57?auto=format&fit=crop&q=80&w=1200"
                        alt="LV Trunk Edition"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-[0.4em] font-bold">LV Trunk Edition</p>
                    </div>
                  </div>

                  <div className="space-y-8 pt-12">
                    {[
                      "Bags",
                      "Wallets and Small Leather Goods",
                      "Travel",
                      "Accessories",
                      "Fashion Jewelry"
                    ].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => { setActiveCategory('All'); scrollToProducts(); setIsMobileMenuOpen(false); }}
                        className="w-full text-left text-lg font-serif hover:opacity-50 transition-opacity"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsProfileOpen(false); setProfileView('main'); }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white z-[120] p-12 shadow-2xl rounded-none min-h-[600px] flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                  {profileView !== 'main' && (
                    <button onClick={() => setProfileView('main')} className="p-2 hover:bg-black/5 -ml-2">
                      <ArrowRight size={20} className="rotate-180" />
                    </button>
                  )}
                  <h3 className="text-2xl font-serif italic">
                    {profileView === 'main' ? 'My Account' :
                      profileView === 'orders' ? 'My Orders' :
                        profileView === 'wishlist' ? 'My Wishlist' :
                          profileView === 'shipping' ? 'Shipping Address' :
                            profileView === 'payment' ? 'Payment Methods' : 'Settings'}
                  </h3>
                </div>
                <button onClick={() => { setIsProfileOpen(false); setProfileView('main'); }} className="p-2 hover:bg-black/5">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {profileView === 'main' && (
                  <div className="space-y-8">
                    {!isAuthenticated ? (
                      <div className="text-center py-12 space-y-8">
                        <div className="w-20 h-20 rounded-full bg-brand-muted flex items-center justify-center mx-auto">
                          <User size={40} className="opacity-20" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xl font-serif">Welcome to VESTON</h4>
                          <p className="text-xs opacity-50 uppercase tracking-widest">Sign in to manage your orders and profile</p>
                        </div>
                        <div className="flex flex-col gap-4">
                          <Link
                            to="/login"
                            onClick={() => setIsProfileOpen(false)}
                            className="w-full py-5 bg-black text-white text-xs uppercase tracking-[0.3em] font-bold hover:opacity-80 transition-opacity"
                          >
                            Sign In
                          </Link>
                          <Link
                            to="/signup"
                            onClick={() => setIsProfileOpen(false)}
                            className="w-full py-5 border border-black text-black text-xs uppercase tracking-[0.3em] font-bold hover:bg-black hover:text-white transition-all"
                          >
                            Create Account
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-6 pb-8 border-b border-black/5">
                          <div className="w-16 h-16 rounded-full bg-brand-muted flex items-center justify-center">
                            <User size={32} className="opacity-20" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold uppercase tracking-widest">{user?.name}</h4>
                            <p className="text-xs opacity-50 tracking-widest">{user?.email}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {[
                            { id: 'orders', label: 'My Orders' },
                            { id: 'wishlist', label: 'Wishlist' },
                            { id: 'shipping', label: 'Shipping Address' },
                            { id: 'payment', label: 'Payment Methods' },
                            { id: 'settings', label: 'Settings' }
                          ].map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setProfileView(item.id as any)}
                              className="w-full text-left py-5 text-xs uppercase tracking-[0.2em] font-bold border-b border-black/5 hover:pl-4 transition-all flex items-center justify-between group"
                            >
                              {item.label}
                              <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            logout();
                            showNotification("Logged out successfully", "info");
                            setIsProfileOpen(false);
                          }}
                          className="w-full py-5 bg-black text-white text-xs uppercase tracking-[0.3em] font-bold hover:opacity-80 transition-opacity mt-8"
                        >
                          Sign Out
                        </button>

                        {isAdmin && (
                          <div className="pt-8 border-t border-black/5">
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center justify-center gap-3 w-full py-4 border border-admin-gold text-admin-gold text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-admin-gold hover:text-white transition-all"
                            >
                              <ShieldCheck size={16} /> Admin Portal
                            </Link>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {profileView === 'orders' && (
                  <div className="space-y-6">
                    {[
                      { id: '12849', date: 'Oct 12, 2026', status: 'Shipped', step: 2, item: 'Midnight Velvet Blazer', img: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=800', price: 249.99 },
                      { id: '11920', date: 'Sep 28, 2026', status: 'Delivered', step: 3, item: 'Silk Slip Dress', img: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=800', price: 189.00 }
                    ].map(order => (
                      <div key={order.id} className="border border-black/10 p-6">
                        <div className="flex justify-between items-start mb-6 border-b border-black/5 pb-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-1">Order #VV-{order.id}</p>
                            <p className="text-sm">Placed on {order.date}</p>
                          </div>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-brand-bg bg-brand-bg/5 px-3 py-1">{order.status}</span>
                        </div>
                        <div className="flex gap-4">
                          <img src={order.img} className="w-16 h-20 object-cover" referrerPolicy="no-referrer" alt={order.item} />
                          <div className="flex flex-col justify-center">
                            <p className="font-bold text-sm mb-1">{order.item}</p>
                            <p className="text-xs opacity-60">Qty: 1 · ${order.price.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        {/* Tracking Timeline */}
                        <div className="mt-8 pt-6 border-t border-black/5">
                          <div className="flex justify-between items-center relative px-2">
                            <div className="absolute top-[5px] left-4 right-4 h-px bg-black/10 -z-10" />
                            {['Placed', 'Confirmed', 'Shipped', 'Delivered'].map((status, i) => (
                              <div key={status} className="flex flex-col items-center bg-white px-2 cursor-help group" title={`Status: ${status}`}>
                                <div className={cn(
                                  "w-2.5 h-2.5 rounded-full mb-3 outline outline-2 outline-white box-content transition-colors",
                                  i <= order.step ? "bg-brand-bg" : "bg-black/10"
                                )} />
                                <span className={cn(
                                  "text-[8px] uppercase tracking-[0.2em] font-bold transition-opacity",
                                  i <= order.step ? "opacity-100" : "opacity-30 group-hover:opacity-50"
                                )}>{status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-6 flex gap-4">
                          <button onClick={() => showNotification("Receipt downloaded.", "success")} className="text-[9px] uppercase tracking-[0.2em] font-bold border border-black/10 px-4 py-2 hover:bg-black/5 transition-colors">Download Receipt</button>
                          {order.status === 'Delivered' && (
                            <button onClick={() => showNotification("Initiating return flow...", "info")} className="text-[9px] uppercase tracking-[0.2em] font-bold border border-transparent text-black/40 hover:text-black transition-colors">Return Item</button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-4 border border-black/10 text-[10px] uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-all">
                      View All Order History
                    </button>
                  </div>
                )}

                {profileView === 'wishlist' && (
                  <div className="grid grid-cols-2 gap-6">
                    {wishlist.map(product => (
                      <div key={product.id} className="group cursor-pointer" onClick={() => { setSelectedProduct(product); setIsProfileOpen(false); }}>
                        <div className="aspect-[3/4] bg-brand-muted overflow-hidden relative mb-3">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                          >
                            <Heart size={14} className="fill-brand-bg text-brand-bg" />
                          </button>
                        </div>
                        <h4 className="text-[10px] uppercase tracking-widest font-bold mb-1 truncate">{product.name}</h4>
                        <p className="text-xs opacity-50">${product.price.toFixed(2)}</p>
                      </div>
                    ))}
                    {wishlist.length === 0 && (
                      <div className="col-span-2 py-20 text-center opacity-40 italic font-serif">
                        Your wishlist is currently empty.
                      </div>
                    )}
                  </div>
                )}

                {profileView === 'shipping' && (
                  <div className="space-y-8">
                    <div className="p-6 border border-black/10 relative">
                      <div className="absolute top-4 right-4 flex gap-3">
                        <button className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100">Edit</button>
                      </div>
                      <p className="text-[10px] uppercase tracking-widest font-bold mb-4">Primary Address</p>
                      <p className="text-sm leading-relaxed">
                        Muntasir Mamun<br />
                        123 Luxury Avenue, Suite 400<br />
                        New York, NY 10001<br />
                        United States
                      </p>
                    </div>
                    <button className="w-full py-5 border-2 border-dashed border-black/10 text-[10px] uppercase tracking-widest font-bold hover:border-black transition-all flex items-center justify-center gap-2">
                      <Plus size={16} /> Add New Address
                    </button>
                  </div>
                )}

                {profileView === 'payment' && (
                  <div className="space-y-6">
                    <div className="p-6 border border-black/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-brand-bg rounded flex items-center justify-center text-[8px] text-white font-bold">VISA</div>
                        <div>
                          <p className="text-xs font-bold">•••• •••• •••• 4242</p>
                          <p className="text-[10px] opacity-40">Expires 12/25</p>
                        </div>
                      </div>
                      <button className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100">Remove</button>
                    </div>
                    <button className="w-full py-5 border-2 border-dashed border-black/10 text-[10px] uppercase tracking-widest font-bold hover:border-black transition-all flex items-center justify-center gap-2">
                      <Plus size={16} /> Add Payment Method
                    </button>
                  </div>
                )}

                {profileView === 'settings' && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">Update Display Name</h4>
                      <input
                        type="text"
                        placeholder={user?.name || 'Display name'}
                        value={profileDisplayName}
                        onChange={(e) => setProfileDisplayName(e.target.value)}
                        className="w-full border-b border-black/20 py-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">Change Password</h4>
                      <input
                        type="password"
                        placeholder="Current Password"
                        value={profileOldPassword}
                        onChange={(e) => setProfileOldPassword(e.target.value)}
                        className="w-full border-b border-black/20 py-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                      />
                      <input
                        type="password"
                        placeholder="New Password"
                        value={profileNewPassword}
                        onChange={(e) => setProfileNewPassword(e.target.value)}
                        className="w-full border-b border-black/20 py-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent"
                      />
                    </div>
                    {profileSaveMsg && (
                      <p className="text-xs text-emerald-600 font-medium">{profileSaveMsg}</p>
                    )}
                    <button
                      onClick={() => {
                        setProfileSaveMsg('Settings saved successfully.');
                        setTimeout(() => setProfileSaveMsg(''), 3000);
                        setProfileOldPassword('');
                        setProfileNewPassword('');
                      }}
                      className="w-full py-5 bg-black text-white text-xs uppercase tracking-[0.3em] font-bold hover:opacity-80 transition-opacity"
                    >
                      Save Changes
                    </button>
                    <div className="space-y-4 pt-6 border-t border-black/5">
                      <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">Email Preferences</h4>
                      <div className="flex items-center justify-between py-2 border-b border-black/5">
                        <span className="text-xs font-medium">Email Notifications</span>
                        <button className="w-10 h-5 bg-emerald-500 rounded-full relative">
                          <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                        </button>
                      </div>
                      <button className="w-full text-left text-xs font-medium py-2 border-b border-black/5 text-red-500">Delete Account</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {!selectedProduct ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Hero Section - Full Screen Cinematic Video */}
              <section className="relative h-screen overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src="/homepage-video.mp4" type="video/mp4" />
                </video>

                {/* Cinematic gradient overlays for luxury depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

                {/* Mute Toggle */}
                <button
                  onClick={toggleMute}
                  className="absolute bottom-12 right-12 z-20 p-4 border border-white/20 backdrop-blur-sm text-white hover:bg-white/10 transition-all duration-500"
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                {/* Hero Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center px-6"
                  >
                    {/* Brand monogram line */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                      className="flex items-center justify-center gap-6 mb-10"
                    >
                      <div className="h-px w-16 bg-white/40" />
                      <span className="uppercase tracking-[0.8em] text-[9px] font-bold text-white/70">Spring · Summer 2026</span>
                      <div className="h-px w-16 bg-white/40" />
                    </motion.div>

                    <h2 className="text-4xl md:text-8xl font-serif mb-6 leading-[1.05] font-light max-w-5xl mx-auto">
                      See how every outfit
                      <span className="italic font-normal block mt-2"> looks on you.</span>
                    </h2>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 1.2 }}
                      className="text-white/60 text-sm tracking-[0.3em] uppercase mb-16 max-w-sm mx-auto"
                    >
                      AI-Powered Virtual Try-On
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0, duration: 1 }}
                      className="flex flex-col md:flex-row gap-5 justify-center items-center"
                    >
                      <button
                        onClick={scrollToProducts}
                        className="group relative px-14 py-5 bg-white text-black text-[10px] uppercase tracking-[0.5em] font-bold overflow-hidden hover:bg-transparent hover:text-white border border-transparent hover:border-white transition-all duration-700 min-w-[220px]"
                      >
                        <span className="relative z-10">Explore Collection</span>
                        <div className="absolute inset-0 bg-white transition-transform duration-700 group-hover:-translate-y-full" />
                      </button>
                      <button
                        onClick={scrollToProducts}
                        className="group px-14 py-5 border border-white/40 text-white text-[10px] uppercase tracking-[0.5em] font-bold hover:border-white hover:bg-white/10 backdrop-blur-sm transition-all duration-500 min-w-[220px] flex items-center justify-center gap-3"
                      >
                        <Camera size={14} />
                        <span>Virtual Try&#8209;On</span>
                      </button>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5, duration: 1 }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
                >
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="w-px h-14 bg-gradient-to-b from-white/60 to-transparent"
                  />
                  <span className="text-[8px] uppercase tracking-[0.7em] text-white/30 font-bold">Scroll</span>
                </motion.div>
              </section>

              {/* Trust Badges / Features Bar */}
              <section className="bg-brand-bg text-brand-paper">
                <div className="max-w-[1800px] mx-auto px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { icon: '✦', title: 'Free Express Shipping', sub: 'On all orders over $200' },
                    { icon: '↩', title: '30-Day Returns', sub: 'Hassle-free returns policy' },
                    { icon: '🔒', title: 'Secure Payments', sub: 'SSL encrypted checkout' },
                    { icon: '✦', title: 'AI Virtual Try-On', sub: 'See before you buy' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 py-2">
                      <span className="text-brand-accent text-lg">{item.icon}</span>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold">{item.title}</p>
                        <p className="text-[9px] text-brand-paper/40 mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Maison Highlight - Split Layout */}
              <section className="grid grid-cols-1 md:grid-cols-2 h-screen">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="relative overflow-hidden group"
                >
                  <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="Women" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white p-12 text-center">
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 1, delay: 0.2 }}
                    >
                      <span className="uppercase tracking-[0.5em] text-[10px] font-bold mb-6 block">The Collection</span>
                      <h3 className="text-6xl font-serif mb-10 italic">Women's Universe</h3>
                      <button
                        onClick={() => { setActiveCategory('Dresses'); scrollToProducts(); }}
                        className="group relative px-10 py-4 overflow-hidden border border-white"
                      >
                        <div className="absolute inset-0 bg-white translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                        <span className="relative text-white group-hover:text-black text-[10px] uppercase tracking-widest font-bold transition-colors duration-500">Discover</span>
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="relative overflow-hidden group"
                >
                  <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="Men" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white p-12 text-center">
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ duration: 1, delay: 0.4 }}
                    >
                      <span className="uppercase tracking-[0.5em] text-[10px] font-bold mb-6 block">The Collection</span>
                      <h3 className="text-6xl font-serif mb-10 italic">Men's Universe</h3>
                      <button
                        onClick={() => { setActiveCategory('Outerwear'); scrollToProducts(); }}
                        className="group relative px-10 py-4 overflow-hidden border border-white"
                      >
                        <div className="absolute inset-0 bg-white translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                        <span className="relative text-white group-hover:text-black text-[10px] uppercase tracking-widest font-bold transition-colors duration-500">Discover</span>
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              </section>

              {/* Product Grid - Refined */}
              <section ref={productsRef} className="max-w-[1600px] mx-auto px-8 py-32 scroll-mt-24">
                <div className="text-center mb-16">
                  <span className="uppercase tracking-[0.4em] text-[10px] font-bold opacity-40 mb-4 block">Selection</span>
                  <h3 className="text-5xl font-serif italic">Signature Pieces</h3>
                </div>

                {/* Filter Controls */}
                <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-8 border-b border-black/5 pb-8">
                  <div className="flex items-center gap-8 overflow-x-auto pb-4 md:pb-0 no-scrollbar w-full md:w-auto">
                    {['All', 'Dresses', 'Outerwear', 'Knitwear', 'Bottoms', 'Footwear', 'Tops'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          "text-[10px] uppercase tracking-[0.3em] font-bold whitespace-nowrap transition-all",
                          activeCategory === cat ? "text-brand-bg border-b-2 border-brand-bg pb-1" : "text-brand-bg/40 hover:text-brand-bg"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:opacity-50 transition-opacity"
                  >
                    <Filter size={14} /> {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>

                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-12"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 p-8 bg-brand-muted border border-black/5">
                        {/* Price Filter */}
                        <div className="space-y-6">
                          <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold">Price Range</h4>
                          <div className="space-y-4">
                            <input
                              type="range"
                              min="0"
                              max="1000"
                              step="50"
                              value={priceRange[1]}
                              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                              className="w-full accent-brand-bg"
                            />
                            <div className="flex justify-between text-[10px] font-mono opacity-60">
                              <span>$0</span>
                              <span>Up to ${priceRange[1]}</span>
                            </div>
                          </div>
                        </div>

                        {/* Color Filter */}
                        <div className="space-y-6">
                          <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold">Colors</h4>
                          <div className="flex flex-wrap gap-3">
                            {['Black', 'White', 'Champagne', 'Camel', 'Grey', 'Brown'].map(color => (
                              <button
                                key={color}
                                onClick={() => {
                                  setSelectedColors(prev =>
                                    prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                                  );
                                }}
                                className={cn(
                                  "px-4 py-2 text-[9px] uppercase tracking-widest font-bold border transition-all",
                                  selectedColors.includes(color)
                                    ? "bg-brand-bg text-white border-brand-bg"
                                    : "bg-white text-brand-bg border-black/10 hover:border-brand-bg"
                                )}
                              >
                                {color}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Size Filter */}
                        <div className="space-y-6">
                          <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold">Sizes</h4>
                          <div className="flex flex-wrap gap-3">
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '8', '9', '10', '11', '12'].map(size => (
                              <button
                                key={size}
                                onClick={() => {
                                  setSelectedSizes(prev =>
                                    prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                                  );
                                }}
                                className={cn(
                                  "w-10 h-10 text-[9px] font-bold border transition-all flex items-center justify-center",
                                  selectedSizes.includes(size)
                                    ? "bg-brand-bg text-white border-brand-bg"
                                    : "bg-white text-brand-bg border-black/10 hover:border-brand-bg"
                                )}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => {
                            setPriceRange([0, 1000]);
                            setSelectedColors([]);
                            setSelectedSizes([]);
                          }}
                          className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-40 hover:opacity-100 transition-opacity"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isLoadingProducts ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {filteredProducts.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group cursor-pointer product-card-hover"
                        onClick={() => { setSelectedProduct(product); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      >
                        <div className="relative aspect-[4/5] overflow-hidden bg-brand-muted mb-8">
                          <ProductImage
                            src={product.image}
                            alt={product.name}
                            className="group-hover:scale-110 transition-transform duration-1000"
                          />
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }} 
                            className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur hover:bg-white flex items-center justify-center rounded-none border border-transparent hover:border-black/10 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Heart size={16} className={cn(wishlist.some(w => w.id === product.id) && "fill-brand-bg text-brand-bg")} />
                          </button>
                          {/* Quick View Button */}
                          <button
                            className="quick-view-btn"
                            onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); setIsQuickViewOpen(true); }}
                          >
                            Quick View
                          </button>
                        </div>
                        <div className="text-center">
                          <h4 className="text-sm uppercase tracking-widest font-bold mb-2">{product.name}</h4>
                          <p className="text-sm font-serif opacity-50">${product.price.toFixed(2)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-brand-bg/40 font-serif text-xl italic">No pieces found matching your criteria.</p>
                    <button onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('All');
                      setPriceRange([0, 1000]);
                      setSelectedColors([]);
                      setSelectedSizes([]);
                    }} className="mt-4 text-sm font-semibold uppercase tracking-widest border-b border-brand-bg pb-1">Reset Filters</button>
                  </div>
                )}
              </section>

              {/* Recently Viewed on Homepage */}
              {recentlyViewed.length > 0 && (
                <section className="max-w-[1600px] mx-auto px-8 pb-24">
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <span className="uppercase tracking-[0.4em] text-[10px] font-bold opacity-40 mb-3 block">Continue Exploring</span>
                      <h3 className="text-3xl font-serif italic">Recently Viewed</h3>
                    </div>
                    <button
                      onClick={() => { setRecentlyViewed([]); localStorage.removeItem('vv_recently_viewed'); }}
                      className="text-[9px] uppercase tracking-widest font-bold opacity-30 hover:opacity-80 transition-opacity"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="rv-scroll">
                    {recentlyViewed.slice(0, 8).map(product => (
                      <div
                        key={'rv-h-'+product.id}
                        className="w-52 group cursor-pointer product-card-hover flex-shrink-0"
                        onClick={() => { setSelectedProduct(product); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      >
                        <div className="w-full aspect-[3/4] overflow-hidden bg-brand-muted mb-4 relative">
                          <ProductImage src={product.image} alt={product.name} className="group-hover:scale-105 transition-transform duration-700" />
                          <button
                            onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); setIsQuickViewOpen(true); }}
                            className="quick-view-btn"
                          >
                            Quick View
                          </button>
                        </div>
                        <h4 className="text-[10px] uppercase tracking-widest font-bold mb-1 truncate">{product.name}</h4>
                        <p className="text-xs font-serif opacity-50">${product.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Heritage Section */}
              <section className="bg-brand-muted py-32">
                <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-24 items-center">
                  <div className="order-2 md:order-1">
                    <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800" className="w-full rounded-none shadow-2xl" alt="Maison" referrerPolicy="no-referrer" />
                  </div>
                  <div className="order-1 md:order-2">
                    <span className="uppercase tracking-[0.4em] text-[10px] font-bold opacity-40 mb-6 block">The Maison</span>
                    <h2 className="text-6xl font-serif mb-10 leading-tight">A Legacy of <br /><span className="italic">Craftsmanship</span></h2>
                    <p className="text-brand-bg/60 text-lg leading-relaxed mb-12">
                      Since our inception, VESTON has stood for the pinnacle of luxury. Every piece is a testament to the artisans who pour their soul into every stitch, ensuring that elegance is not just seen, but felt.
                    </p>
                    <Link to="/services" className="btn-outline inline-block text-center">Explore our Story</Link>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-7xl mx-auto px-6 pt-32 pb-24"
            >
              <div className="flex items-center justify-between mb-12">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold opacity-30 hover:opacity-100 transition-all group"
                >
                  <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                  Back to Collection
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                {/* Product Images — with ProductZoom */}
                <div className="space-y-8">
                  {selectedProduct.video ? (
                    <div className="aspect-[4/5] rounded-none overflow-hidden bg-brand-muted relative">
                      <video
                        src={selectedProduct.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md px-4 py-2 text-[8px] uppercase tracking-[0.3em] font-bold text-white border border-white/10">
                        Cinematic View 1
                      </div>
                    </div>
                  ) : (
                    <ProductZoom
                      images={[selectedProduct.image, selectedProduct.image2, selectedProduct.image3, selectedProduct.image4, selectedProduct.image5].filter(Boolean) as string[]}
                      alt={selectedProduct.name}
                    />
                  )}
                  <div className="aspect-[4/5]" style={{ display: 'none' }}>

                  </div>
                  {selectedProduct.video2 && (
                    <div className="aspect-[4/5] rounded-none overflow-hidden bg-brand-muted relative">
                      <video
                        src={selectedProduct.video2}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md px-4 py-2 text-[8px] uppercase tracking-[0.3em] font-bold text-white border border-white/10">
                        Cinematic View 2
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col pt-12">
                  <div className="mb-12">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-brand-bg/40 font-bold mb-6">{selectedProduct.category}</p>
                    <h2 className="text-6xl font-serif mb-8 leading-tight">{selectedProduct.name}</h2>
                    <p className="text-4xl font-serif mb-6 opacity-20">${selectedProduct.price.toFixed(2)}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#fff8eb] text-[#d97706] border border-[#fef3c7] mb-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse" />
                      <span className="text-[9px] uppercase tracking-widest font-bold">Only {Math.floor(selectedProduct.price % 5) + 2} left in stock</span>
                    </div>
                    <div className="h-px bg-black/5 w-full mb-10" />
                    <p className="text-brand-bg/60 text-sm leading-loose mb-12 max-w-md">
                      {selectedProduct.description || "A masterpiece of modern design, this piece embodies the TRYOVA philosophy of timeless elegance and superior craftsmanship."}
                    </p>
                  </div>

                  <div className="space-y-10 mb-16">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Size</span>
                        <button
                          onClick={() => setIsSizeChartOpen(true)}
                          className="text-[9px] uppercase tracking-widest font-bold text-brand-accent hover:underline"
                        >
                          Size Chart
                        </button>
                      </div>
                      <div className="flex gap-4">
                        {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                          <button key={size} className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center text-[10px] font-bold hover:border-brand-bg transition-colors">
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-[0.4em] font-bold mb-6 block">Quantity</span>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center border border-black/10">
                          <button
                            onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 1))}
                            className="w-10 h-10 flex items-center justify-center hover:bg-black/5 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center text-xs font-bold">{buyQuantity}</span>
                          <button
                            onClick={() => setBuyQuantity(buyQuantity + 1)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-black/5 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Pieces to buy</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-[0.4em] font-bold mb-6 block">Color</span>
                      <div className="flex gap-4">
                        <button className="w-10 h-10 rounded-full bg-brand-bg border-2 border-brand-accent p-1">
                          <div className="w-full h-full rounded-full bg-brand-bg" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-[#9c9c9c] border border-black/5" />
                        <button className="w-10 h-10 rounded-full bg-white border border-black/10" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => toggleWishlist(selectedProduct)}
                      className="w-16 bg-white border border-brand-bg flex items-center justify-center hover:bg-brand-bg/5 transition-all"
                      title={wishlist.some(w => w.id === selectedProduct.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart size={18} className={cn(wishlist.some(w => w.id === selectedProduct.id) && "fill-brand-bg text-brand-bg")} />
                    </button>
                    <button
                      onClick={() => addToCart(selectedProduct, buyQuantity)}
                      disabled={addingToCartId === selectedProduct.id}
                      className="flex-grow bg-white text-brand-bg border border-brand-bg py-5 rounded-none uppercase tracking-[0.2em] text-xs font-bold hover:bg-brand-bg hover:text-brand-paper transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToCartId === selectedProduct.id ? (
                        <>Processing <Loader2 size={16} className="animate-spin" /></>
                      ) : (
                        <>Add to Bag <ShoppingBag size={16} /></>
                      )}
                    </button>
                    <button
                      onClick={() => setIsBuyNowOpen(true)}
                      className="flex-grow bg-brand-bg text-brand-paper py-5 rounded-none uppercase tracking-[0.2em] text-xs font-bold hover:bg-brand-bg/80 transition-all flex items-center justify-center gap-3"
                    >
                      Buy Now
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    <button
                      onClick={() => setIsTryOnOpen(true)}
                      className="w-full py-5 border border-brand-accent text-brand-accent text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-brand-accent hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      <Camera size={16} /> Virtual Try On
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Reviews */}
              <div className="mt-32 border-t border-black/5 pt-24">
                <div className="flex justify-between items-end mb-12">
                  <div>
                    <h3 className="text-2xl font-serif mb-4">Client Reviews</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <div key={star} className="text-brand-bg flex items-center justify-center">★</div>
                        ))}
                      </div>
                      <span className="text-sm font-bold opacity-60">4.9 / 5.0  (128 Reviews)</span>
                    </div>
                  </div>
                  <button onClick={() => showNotification("Review submissions are currently closed.", "info")} className="text-[10px] uppercase tracking-widest font-bold border-b border-black pb-1 hover:opacity-50 transition-opacity">
                    Write a Review
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {[
                    { name: 'Eleanor V.', date: 'Oct 2026', title: 'Exceptional Quality', text: 'The attention to detail and craftsmanship are unparalleled. Truly a magnificent piece that elevates my entire wardrobe.' },
                    { name: 'Sarah M.', date: 'Sep 2026', title: 'Perfect Fit', text: 'I used the virtual try-on feature and was amazed at how accurate the sizing turned out to be. The fabric feels luxurious.' },
                    { name: 'Isabella R.', date: 'Aug 2026', title: 'A Masterpiece', text: 'From the unboxing experience to wearing it out, everything about this purchase felt premium. Worth every penny.' },
                    { name: 'Chloe T.', date: 'Aug 2026', title: 'Stunning Design', text: 'Gets compliments every time I wear it out. The silhouette is very flattering.' }
                  ].map((review, i) => (
                    <div key={i} className="bg-brand-muted p-8">
                      <div className="flex justify-between mb-6">
                        <div className="flex gap-1 text-sm text-brand-bg">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star}>★</span>
                          ))}
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">{review.date}</span>
                      </div>
                      <h4 className="font-serif text-lg mb-3">{review.title}</h4>
                      <p className="text-sm leading-relaxed opacity-70 mb-6">{review.text}</p>
                      <span className="text-[10px] uppercase tracking-widest font-bold">{review.name}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-12 text-center">
                  <button className="text-[10px] uppercase tracking-widest font-bold border border-black/10 px-8 py-4 hover:border-brand-bg hover:bg-brand-bg hover:text-white transition-all">
                    Load More Reviews
                  </button>
                </div>
              </div>

              {/* Related Products Placeholder */}
              <div className="mt-32">
                <h3 className="text-2xl font-serif mb-12">Complete the Look</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {products.filter(p => p.id !== selectedProduct.id).slice(0, 4).map(product => (
                    <div key={product.id} className="group cursor-pointer" onClick={() => { setSelectedProduct(product); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-brand-muted mb-4 relative">
                        <ProductImage
                          src={product.image}
                          alt={product.name}
                          className="group-hover:scale-105 transition-transform"
                        />
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }} 
                          className="absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur hover:bg-white flex items-center justify-center rounded-none border border-transparent hover:border-black/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Heart size={14} className={cn(wishlist.some(w => w.id === product.id) && "fill-brand-bg text-brand-bg")} />
                        </button>
                      </div>
                      <h4 className="text-sm font-medium">{product.name}</h4>
                      <p className="text-sm opacity-50">${product.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recently Viewed */}
              {recentlyViewed.filter(p => p.id !== selectedProduct.id).length > 0 && (
                <div className="mt-24 border-t border-black/5 pt-24">
                  <h3 className="text-2xl font-serif mb-12 opacity-60">Recently Viewed</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {recentlyViewed.filter(p => p.id !== selectedProduct.id).slice(0, 4).map(product => (
                      <div key={'rv-'+product.id} className="group cursor-pointer" onClick={() => { setSelectedProduct(product); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-brand-muted mb-4 relative">
                          <ProductImage
                            src={product.image}
                            alt={product.name}
                            className="group-hover:scale-105 transition-transform"
                          />
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }} 
                            className="absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur hover:bg-white flex items-center justify-center rounded-none border border-transparent hover:border-black/10 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Heart size={14} className={cn(wishlist.some(w => w.id === product.id) && "fill-brand-bg text-brand-bg")} />
                          </button>
                        </div>
                        <h4 className="text-sm font-medium">{product.name}</h4>
                        <p className="text-sm opacity-50">${product.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Virtual Try-On Promo Banner */}
        {!selectedProduct && (
          <section className="bg-brand-bg text-brand-paper py-24 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-16">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
                  <Camera size={16} className="text-brand-accent" />
                  <span className="text-xs font-semibold uppercase tracking-widest">Virtual Try-On</span>
                </div>
                <h2 className="text-5xl font-serif mb-6 leading-tight">See how every outfit<br /><span className="italic text-brand-accent">looks on you</span></h2>
                <p className="text-brand-paper/70 text-lg mb-10 max-w-md">
                  Upload your photo and see exactly how any garment fits you — powered by VESTON AI virtual try-on technology.
                </p>
                <button
                  onClick={scrollToProducts}
                  className="bg-brand-accent text-brand-bg px-10 py-4 rounded-full font-semibold hover:bg-brand-accent/90 transition-all"
                >
                  Explore Collection
                </button>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-full border border-white/10 absolute -top-20 -right-20 w-[120%] animate-pulse" />
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800"
                  alt="Virtual Try-On"
                  className="rounded-3xl relative z-10 shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </section>
        )}
      </main>



      {/* Sticky Add-to-Bag bar on mobile when product is selected */}
      {selectedProduct && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] md:hidden bg-white border-t border-black/10 p-4 flex gap-3 shadow-2xl">
          <button
            onClick={() => addToCart(selectedProduct, buyQuantity)}
            className="flex-1 py-4 border border-brand-bg text-brand-bg text-[10px] uppercase tracking-widest font-bold"
          >
            Add to Bag
          </button>
          <button
            onClick={() => setIsBuyNowOpen(true)}
            className="flex-1 py-4 bg-brand-bg text-brand-paper text-[10px] uppercase tracking-widest font-bold"
          >
            Buy Now
          </button>
        </div>
      )}

      {selectedProduct && (
        <TryOnModal
          isOpen={isTryOnOpen}
          onClose={() => setIsTryOnOpen(false)}
          garmentImageUrl={selectedProduct.image}
          allGarments={products.slice(0, 10).map(p => ({ name: p.name, image: p.image, price: p.price }))}
        />
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist}
        isWishlisted={!!quickViewProduct && wishlist.some(w => w.id === quickViewProduct.id)}
        isAddingToCart={!!quickViewProduct && addingToCartId === quickViewProduct.id}
        onViewDetails={(product) => { setSelectedProduct(product); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onTryOn={() => { if (quickViewProduct) { setSelectedProduct(quickViewProduct); setIsTryOnOpen(true); setIsQuickViewOpen(false); } }}
      />

      {/* Footer */}
      <footer ref={footerRef} className="bg-white border-t border-black/5 pt-32 pb-0">
        <div className="max-w-[1800px] mx-auto px-8 grid grid-cols-1 md:grid-cols-5 gap-16 pb-24">
          <div className="col-span-2">
            <h1 className="text-3xl font-serif font-bold tracking-[0.35em] mb-8">VESTON</h1>
            <p className="text-xs uppercase tracking-widest text-brand-bg/40 leading-loose mb-10">
              The pinnacle of AI-powered luxury fashion. <br />A NEXARA Technology Group Company.
            </p>
            {/* Social Media Links */}
            <div className="flex gap-6">
              {[
                { label: 'IG', url: 'https://instagram.com' },
                { label: 'TT', url: 'https://tiktok.com' },
                { label: 'PI', url: 'https://pinterest.com' },
                { label: 'YT', url: 'https://youtube.com' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-black/10 flex items-center justify-center text-[8px] font-bold hover:bg-brand-bg hover:text-white hover:border-brand-bg transition-all duration-300"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-10">Universe</h5>
            <ul className="space-y-6 text-xs uppercase tracking-widest text-brand-bg/60">
              <li><button onClick={() => { setActiveCategory('All'); scrollToProducts(); }} className="hover:text-brand-bg transition-colors">Women</button></li>
              <li><button onClick={() => { setActiveCategory('Outerwear'); scrollToProducts(); }} className="hover:text-brand-bg transition-colors">Men</button></li>
              <li><button onClick={() => { setActiveCategory('Dresses'); scrollToProducts(); }} className="hover:text-brand-bg transition-colors">Accessories</button></li>
              <li><button onClick={() => { setActiveCategory('All'); scrollToProducts(); }} className="hover:text-brand-bg transition-colors">New Arrivals</button></li>
              <li><button onClick={() => showNotification('Art of Living collection arriving soon', 'info')} className="hover:text-brand-bg transition-colors">Art of Living</button></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-10">Services</h5>
            <ul className="space-y-6 text-xs uppercase tracking-widest text-brand-bg/60">
              <li><Link to="/services" className="hover:text-brand-bg transition-colors">Our Services</Link></li>
              <li><button onClick={() => showNotification('Complimentary express shipping on orders over $200', 'info')} className="hover:text-brand-bg transition-colors">Shipping</button></li>
              <li><button onClick={() => showNotification('30-day hassle-free returns policy', 'info')} className="hover:text-brand-bg transition-colors">Returns</button></li>
              <li><Link to="/contact" className="hover:text-brand-bg transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-10">Newsletter</h5>
            <p className="text-xs uppercase tracking-widest text-brand-bg/40 mb-8 leading-loose">Subscribe to receive the latest from the Maison.</p>
            <form onSubmit={handleNewsletter} className="flex border-b border-black/20 pb-2 mb-8">
              <input
                type="email"
                required
                placeholder="Email address"
                className="bg-transparent text-xs uppercase tracking-widest flex-grow focus:outline-none"
              />
              <button type="submit" className="hover:opacity-50 transition-opacity">
                <ArrowRight size={16} />
              </button>
            </form>
            <div className="space-y-3 text-[9px] uppercase tracking-widest text-brand-bg/30">
              <div className="flex items-center gap-2"><span>🔒</span><span>Secure checkout — SSL encrypted</span></div>
              <div className="flex items-center gap-2"><span>↩</span><span>30-day free returns</span></div>
              <div className="flex items-center gap-2"><span>✦</span><span>Authenticity guaranteed</span></div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-black/5 bg-brand-muted/30">
          <div className="max-w-[1800px] mx-auto px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] uppercase tracking-[0.3em] opacity-60 font-bold">
            <p>© 2026 VESTON · NEXARA Group. All Rights Reserved.</p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {['Visa', 'MC', 'Amex', 'Apple Pay', 'PayPal'].map(p => (
                <span key={p} className="px-3 py-1 border border-black/10 text-[8px] font-bold rounded">{p}</span>
              ))}
            </div>
            <div className="flex gap-8">
              <button onClick={() => showNotification('Privacy Policy updated Feb 2026', 'info')}>Privacy Policy</button>
              <button onClick={() => showNotification('Terms of Service updated Feb 2026', 'info')}>Terms</button>
              <button onClick={() => showNotification('Accessibility Statement', 'info')}>Accessibility</button>
              <button onClick={() => showNotification('Cookie Notice', 'info')}>Cookies</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-brand-paper z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-xl font-serif">Your Bag ({cart.length})</h3>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-black/5 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-8">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <ShoppingBag size={48} className="opacity-10 mb-4" />
                    <p className="text-brand-bg/40">Your bag is empty</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-6 text-sm font-semibold uppercase tracking-widest border-b border-brand-bg pb-1"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{item.name}</h4>
                            <button onClick={() => removeFromCart(item.id)} className="text-brand-bg/40 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-sm text-brand-bg/40 mt-1">{item.category}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center border border-black/10 rounded-full px-2 py-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-black/5 rounded-full"><Minus size={12} /></button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-black/5 rounded-full"><Plus size={12} /></button>
                          </div>
                          <p className="font-serif">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-black/5 space-y-4">
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      placeholder="Promo Code (VESTON10)" 
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-grow bg-brand-muted px-4 py-2 text-[10px] uppercase tracking-widest focus:outline-none focus:border-brand-bg border border-transparent transition-colors"
                    />
                    <button onClick={handleApplyCoupon} className="bg-brand-bg text-white px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand-bg/90 transition-all">
                      Apply
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={() => setIsGiftWrapped(!isGiftWrapped)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={cn(
                        "w-4 h-4 flex items-center justify-center transition-colors",
                        isGiftWrapped ? "bg-brand-bg border border-brand-bg" : "border border-black/20 group-hover:border-brand-bg"
                      )}>
                        {isGiftWrapped && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span className="text-[10px] uppercase tracking-widest font-bold">Add Gift Wrapping</span>
                    </button>
                    <span className="text-[10px] uppercase font-bold opacity-40">+$15.00</span>
                  </div>
                  <div className="h-px w-full bg-black/5 my-4" />
                  <div className="flex justify-between items-center text-sm opacity-60">
                    <span className="font-serif">Subtotal</span>
                    <span className="font-serif">${cartTotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-sm text-brand-accent font-bold">
                      <span className="font-serif">Discount ({discount * 100}%)</span>
                      <span className="font-serif">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {isGiftWrapped && (
                    <div className="flex justify-between items-center text-sm opacity-60">
                      <span className="font-serif">Gift Wrap</span>
                      <span className="font-serif">$15.00</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg mt-2">
                    <span className="font-serif">Total</span>
                    <span className="font-serif font-bold">${finalTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-brand-bg/40 uppercase tracking-widest text-center mt-4">Shipping & taxes calculated at checkout</p>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-brand-bg text-brand-paper py-5 rounded-none uppercase tracking-[0.2em] text-xs font-bold hover:bg-brand-bg/80 transition-all"
                  >
                    Checkout Now
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>



      {/* Virtual Try On has been delegated to the standalone TryOnModal component */}

      {/* Buy Now Modal */}
      <AnimatePresence>
        {isBuyNowOpen && selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsBuyNowOpen(false); setBuyNowSuccess(false); setBuyNowEmail(''); }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white z-[120] shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-8 border-b border-black/5">
                <h3 className="text-2xl font-serif italic">{buyNowSuccess ? 'Order Confirmed' : 'Express Checkout'}</h3>
                <button onClick={() => { setIsBuyNowOpen(false); setBuyNowSuccess(false); setBuyNowEmail(''); }} className="p-2 hover:bg-black/5">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8">
                {buyNowSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8 flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h4 className="text-2xl font-serif mb-3">Thank You!</h4>
                    <p className="text-black/60 mb-2">Your order for <strong>{selectedProduct.name}</strong> has been placed.</p>
                    <p className="text-black/40 text-sm mb-8">A confirmation will be sent to <strong>{buyNowEmail}</strong>.</p>
                    <div className="bg-black/5 px-8 py-4 mb-8 text-sm font-mono">#VV-{Math.floor(Math.random() * 900000) + 100000}</div>
                    <button
                      onClick={() => { setIsBuyNowOpen(false); setBuyNowSuccess(false); setBuyNowEmail(''); setSelectedProduct(null); }}
                      className="w-full bg-black text-white py-4 text-xs uppercase tracking-[0.3em] font-bold hover:opacity-80"
                    >
                      Continue Shopping
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex gap-5 mb-8 pb-8 border-b border-black/5">
                      <div className="w-20 h-28 bg-brand-muted overflow-hidden flex-shrink-0">
                        <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-[10px] uppercase tracking-widest opacity-40 mb-1">{selectedProduct.category}</p>
                        <h4 className="text-lg font-serif mb-2">{selectedProduct.name}</h4>
                        <p className="text-xl font-bold">${(selectedProduct.price * buyQuantity).toFixed(2)}</p>
                        <p className="text-xs text-emerald-600 mt-1">✓ Free Express Shipping</p>
                      </div>
                    </div>

                    <div className="space-y-5 mb-8">
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block opacity-60">Size</label>
                          <select
                            value={buyNowSize}
                            onChange={(e) => setBuyNowSize(e.target.value)}
                            className="w-full bg-black/5 border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-black"
                          >
                            {['XS','S','M','L','XL','XXL'].map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block opacity-60">Quantity</label>
                          <div className="flex items-center border border-black/10 h-full">
                            <button onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 1))} className="w-10 h-full flex items-center justify-center hover:bg-black/5 text-lg">-</button>
                            <span className="flex-grow text-center text-sm font-bold">{buyQuantity}</span>
                            <button onClick={() => setBuyQuantity(buyQuantity + 1)} className="w-10 h-full flex items-center justify-center hover:bg-black/5 text-lg">+</button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold mb-2 block opacity-60">Your Email *</label>
                        <input
                          type="email"
                          required
                          value={buyNowEmail}
                          onChange={(e) => setBuyNowEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full bg-black/5 border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                        />
                      </div>

                      <div className="bg-black/5 p-4 flex justify-between items-center">
                        <span className="text-xs uppercase tracking-widest font-bold opacity-60">Total</span>
                        <span className="text-xl font-bold font-serif">${(selectedProduct.price * buyQuantity).toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleBuyNow}
                      disabled={!buyNowEmail || isBuyNowSubmitting}
                      className="w-full bg-black text-white py-5 text-xs uppercase tracking-[0.3em] font-bold hover:bg-black/80 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isBuyNowSubmitting ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : `Place Order — $${(selectedProduct.price * buyQuantity).toFixed(2)}`}
                    </button>
                    <p className="text-center text-[10px] text-black/30 mt-3 uppercase tracking-widest">🔒 Secure simulated checkout</p>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Multi-step Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => checkoutStep !== 3 && setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[130]"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white z-[140] flex flex-col max-h-[90vh] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-black/5 flex justify-between items-center bg-brand-muted/30">
                <h3 className="text-2xl font-serif">Checkout</h3>
                {checkoutStep !== 3 && (
                  <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {/* Stepper */}
                <div className="flex items-center justify-between mb-12 relative px-4">
                  <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-black/10 -z-10" />
                  {[1, 2, 3].map(step => (
                    <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold uppercase transition-colors",
                        checkoutStep >= step ? "bg-brand-bg text-white" : "bg-brand-muted text-brand-bg/40 border border-black/10"
                      )}>
                        {step < checkoutStep ? <CheckCircle2 size={14} /> : step}
                      </div>
                      <span className={cn(
                        "text-[9px] uppercase tracking-widest font-bold",
                        checkoutStep >= step ? "text-brand-bg" : "text-brand-bg/40"
                      )}>
                        {step === 1 ? 'Shipping' : step === 2 ? 'Payment' : 'Complete'}
                      </span>
                    </div>
                  ))}
                </div>

                {checkoutStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <h4 className="font-serif text-lg mb-6">Shipping Information</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <input type="text" placeholder="First Name" className="w-full bg-brand-muted px-4 py-3 text-sm focus:outline-none focus:border-brand-bg" />
                      <input type="text" placeholder="Last Name" className="w-full bg-brand-muted px-4 py-3 text-sm focus:outline-none focus:border-brand-bg" />
                    </div>
                    <input type="email" placeholder="Email Address" className="w-full bg-brand-muted px-4 py-3 text-sm focus:outline-none focus:border-brand-bg" />
                    <input type="text" placeholder="Street Address" className="w-full bg-brand-muted px-4 py-3 text-sm focus:outline-none focus:border-brand-bg" />
                    <div className="grid grid-cols-3 gap-6">
                      <input type="text" placeholder="City" className="col-span-1 bg-brand-muted px-4 py-3 text-sm focus:outline-none focus:border-brand-bg" />
                      <input type="text" placeholder="State/Province" className="col-span-1 bg-brand-muted px-4 py-3 text-sm focus:outline-none focus:border-brand-bg" />
                      <input type="text" placeholder="ZIP / Postal Code" className="col-span-1 bg-brand-muted px-4 py-3 text-sm focus:outline-none focus:border-brand-bg" />
                    </div>
                    <button onClick={() => setCheckoutStep(2)} className="w-full bg-brand-bg text-white py-4 mt-8 uppercase tracking-[0.2em] text-xs font-bold hover:bg-brand-bg/90 transition-colors">
                      Continue to Payment
                    </button>
                  </motion.div>
                )}

                {checkoutStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <div>
                      <h4 className="font-serif text-lg mb-4">Payment Method (Mock)</h4>
                      <p className="text-xs opacity-60 mb-6">This is a simulated checkout. No real card is needed.</p>
                      <div className="p-6 border border-brand-bg bg-brand-muted/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <ShieldCheck size={48} />
                        </div>
                        <input type="text" placeholder="Card Number (e.g. 4242 4242 4242 4242)" className="w-full bg-transparent border-b border-black/20 focus:border-brand-bg pb-2 mb-6 text-sm outline-none" defaultValue="4242 4242 4242 4242" />
                        <div className="grid grid-cols-2 gap-6">
                          <input type="text" placeholder="MM/YY" className="bg-transparent border-b border-black/20 focus:border-brand-bg pb-2 text-sm outline-none" defaultValue="12/26" />
                          <input type="text" placeholder="CVC" className="bg-transparent border-b border-black/20 focus:border-brand-bg pb-2 text-sm outline-none" defaultValue="123" />
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-black/10 pt-6">
                      <div className="flex justify-between items-center text-xl font-serif">
                        <span>Total to Pay</span>
                        <strong>${finalTotal.toFixed(2)}</strong>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setCheckoutStep(1)} className="w-1/3 bg-transparent border border-black/20 text-brand-bg py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-black/5 transition-colors">
                        Back
                      </button>
                      <button onClick={processOrder} className="w-2/3 bg-brand-bg text-white py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-brand-bg/90 transition-colors">
                        Complete Order
                      </button>
                    </div>
                  </motion.div>
                )}

                {checkoutStep === 3 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-8">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-3xl font-serif mb-4">Thank You</h3>
                    <p className="text-brand-bg/60 max-w-sm mb-8">Your order has been placed successfully. You will receive an email confirmation shortly.</p>
                    <div className="bg-brand-muted p-6 w-full max-w-sm mb-12">
                      <div className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">Order Reference</div>
                      <div className="text-xl font-mono">#VV-{Math.floor(Math.random() * 900000) + 100000}</div>
                    </div>
                    <div className="flex flex-col w-full max-w-sm gap-4">
                      <button onClick={() => window.print()} className="w-full bg-brand-bg text-white py-4 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-xs font-bold hover:bg-brand-bg/90 transition-colors">
                        Download Invoice
                      </button>
                      <button onClick={() => { setIsCheckoutOpen(false); setCheckoutStep(1); }} className="w-full bg-white border border-brand-bg text-brand-bg py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-brand-bg/5 transition-colors">
                        Continue Shopping
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Size Chart Modal */}
      <AnimatePresence>
        {isSizeChartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeChartOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white z-[110] p-12 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h3 className="text-3xl font-serif mb-2">Size Guide</h3>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30">Luxury Standard Measurements</p>
                </div>
                <button onClick={() => setIsSizeChartOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/10">
                      <th className="py-4 text-[10px] uppercase tracking-widest font-bold opacity-40">Size</th>
                      <th className="py-4 text-[10px] uppercase tracking-widest font-bold opacity-40">Chest (in)</th>
                      <th className="py-4 text-[10px] uppercase tracking-widest font-bold opacity-40">Waist (in)</th>
                      <th className="py-4 text-[10px] uppercase tracking-widest font-bold opacity-40">Hips (in)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {(selectedProduct?.sizeChart && selectedProduct.sizeChart.length > 0 ? selectedProduct.sizeChart : [
                      { size: 'XS', chest: '32-33', waist: '24-25', hips: '34-35' },
                      { size: 'S', chest: '34-35', waist: '26-27', hips: '36-37' },
                      { size: 'M', chest: '36-37', waist: '28-29', hips: '38-39' },
                      { size: 'L', chest: '38-40', waist: '30-32', hips: '40-42' },
                      { size: 'XL', chest: '41-43', waist: '33-35', hips: '43-45' },
                    ]).map((row: any, i: number) => (
                      <tr key={i}>
                        <td className="py-4 text-xs font-bold">{row.size || row.s}</td>
                        <td className="py-4 text-xs opacity-60">{row.chest || row.c}</td>
                        <td className="py-4 text-xs opacity-60">{row.waist || row.w}</td>
                        <td className="py-4 text-xs opacity-60">{row.hips || row.h}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-12 p-6 bg-brand-muted border border-black/5">
                <p className="text-[10px] leading-relaxed opacity-60 italic">
                  * Measurements are in inches and refer to body measurements, not garment dimensions. If you are between sizes, we recommend ordering the larger size for a more comfortable fit.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
