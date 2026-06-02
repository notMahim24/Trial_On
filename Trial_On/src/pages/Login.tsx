import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@zelori.com';
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      if (email === adminEmail && from === '/') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06060a] flex items-center justify-center relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#8b7355]/8 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm px-8 py-12 mx-4"
      >
        {/* Brand */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-serif font-bold tracking-[0.45em] text-white mb-2">
              VESTON
            </h1>
          </Link>
          <div className="h-px w-12 bg-[#8b7355] mx-auto mb-5" />
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-medium">
            Sign in to your account
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-4 py-3 border border-red-500/25 bg-red-500/8 text-red-400 text-[10px] uppercase tracking-widest font-bold text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-[9px] uppercase tracking-[0.3em] text-white/35 font-bold">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#8b7355] transition-colors placeholder:text-white/20"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-[9px] uppercase tracking-[0.3em] text-white/35 font-bold">
                Password
              </label>
              <Link to="#" className="text-[9px] uppercase tracking-widest text-white/25 hover:text-[#8b7355] transition-colors">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#8b7355] transition-colors placeholder:text-white/20"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black py-4 text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-3 disabled:opacity-40"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                'Enter'
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">
            New to VESTON?{' '}
            <Link to="/signup" className="text-white/50 hover:text-white transition-colors underline underline-offset-4">
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
