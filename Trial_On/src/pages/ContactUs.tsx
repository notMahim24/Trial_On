import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Phone, Mail, Instagram, Twitter, Facebook, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
};

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to send message');
      
      setStatus({ type: 'success', message: 'Thank you for reaching out. We will get back to you shortly.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
      {/* Back Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#f9f8f6]/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] font-bold text-black/40 hover:text-black transition-colors group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
          </Link>
          <h1 className="text-xl font-serif font-bold tracking-[0.3em]">VESTON</h1>
          <div className="w-20" />
        </div>
      </div>

      <main className="flex-grow pt-32 pb-40 px-8">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20">
          
          {/* Left Column: Form */}
          <motion.div {...fadeUp}>
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-black/30 mb-6 block">Get in Touch</span>
            <h2 className="text-5xl font-serif mb-10 leading-tight">
              We'd love to hear<br /><span className="italic text-[#8b7355]">from you</span>
            </h2>
            <p className="text-black/50 text-lg leading-relaxed mb-12 max-w-lg">
              Whether you have a question about an order, our virtual try-on technology, or just want to chat about fashion, our concierge team is ready to assist.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8 max-w-lg">
              {status && (
                <div className={cn(
                  "p-4 border text-sm",
                  status.type === 'success' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                )}>
                  {status.message}
                </div>
              )}

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-black/60 mb-2">Full Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border-b border-black/20 bg-transparent py-2 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-black/60 mb-2">Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border-b border-black/20 bg-transparent py-2 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-black/60 mb-2">Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full border-b border-black/20 bg-transparent py-2 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-black/60 mb-2">Message *</label>
                <textarea 
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border-b border-black/20 bg-transparent py-2 focus:outline-none focus:border-black transition-colors custom-scrollbar resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-black/80 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'} <ArrowRight size={16} />
              </button>
            </form>
          </motion.div>

          {/* Right Column: Company Info */}
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }} className="lg:pl-20 flex flex-col justify-between">
            <div className="aspect-[4/5] bg-black/5 relative overflow-hidden mb-12 hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1542340916-5633a1400897?auto=format&fit=crop&q=80&w=800" 
                alt="Veston Concierge" 
                className="w-full h-full object-cover grayscale opacity-80"
              />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h4 className="flex items-center gap-2 font-serif text-xl mb-4">
                    <MapPin size={20} className="text-[#8b7355]" /> Headquarters
                  </h4>
                  <p className="text-black/60 leading-relaxed text-sm">
                    NEXARA House<br />
                    100 Fashion Avenue,<br />
                    New York, NY 10001
                  </p>
                </div>
                
                <div>
                  <h4 className="flex items-center gap-2 font-serif text-xl mb-4">
                    <Phone size={20} className="text-[#8b7355]" /> Phone
                  </h4>
                  <p className="text-black/60 text-sm hover:text-black hover:underline cursor-pointer transition-colors">+1 (212) 555-0198</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="flex items-center gap-2 font-serif text-xl mb-4">
                    <Mail size={20} className="text-[#8b7355]" /> Email
                  </h4>
                  <p className="text-black/60 text-sm hover:text-black hover:underline cursor-pointer transition-colors">concierge@veston.ai</p>
                  <p className="text-black/60 text-sm hover:text-black hover:underline cursor-pointer transition-colors mt-2">press@nexara.group</p>
                </div>
                
                <div>
                  <h4 className="font-serif text-xl mb-4">Socials</h4>
                  <div className="flex items-center gap-4">
                    <a href="#" className="w-10 h-10 border border-black/10 flex items-center justify-center text-black/60 hover:text-black hover:border-black transition-all rounded-full">
                      <Instagram size={18} />
                    </a>
                    <a href="#" className="w-10 h-10 border border-black/10 flex items-center justify-center text-black/60 hover:text-black hover:border-black transition-all rounded-full">
                      <Twitter size={18} />
                    </a>
                    <a href="#" className="w-10 h-10 border border-black/10 flex items-center justify-center text-black/60 hover:text-black hover:border-black transition-all rounded-full">
                      <Facebook size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
      
      {/* Footer bar */}
      <div className="border-t border-black/5 py-8 text-center bg-white">
        <p className="text-black/30 text-[10px] uppercase tracking-[0.4em]">© 2026 VESTON · A NEXARA Technology Group Company</p>
      </div>
    </div>
  );
};

export default ContactUs;
