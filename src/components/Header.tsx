export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-neutral-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="classic-heading text-2xl font-bold tracking-tighter">ÉLÉGANCE</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
          <a href="#" className="hover:text-neutral-900 transition-colors">New Arrivals</a>
          <a href="#" className="hover:text-neutral-900 transition-colors">Collections</a>
          <a href="#" className="hover:text-neutral-900 transition-colors">About</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium hover:text-neutral-600 transition-colors">
            Cart (0)
          </button>
        </div>
      </div>
    </header>
  );
}
