import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Globe, Award, Users, TrendingUp, Check, ChevronLeft } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
};

const CountUp: React.FC<{ end: number; suffix?: string; prefix?: string }> = ({ end, suffix = '', prefix = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || !ref.current) return;
    let start = 0;
    const step = end / 60;
    const timer = setInterval(() => {
      start += step;
      if (ref.current) ref.current.textContent = `${prefix}${Math.round(Math.min(start, end)).toLocaleString()}${suffix}`;
      if (start >= end) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [isInView, end, suffix, prefix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
};

const timeline = [
  { year: '2021', title: 'The Vision', desc: 'Three fashion technologists began building the bridge between AI and haute couture. A small kitchen table. A grand idea.' },
  { year: '2022', title: 'First Algorithm', desc: 'Our proprietary pose estimation model achieved 98.3% accuracy on garment draping — a breakthrough that attracted our first investors.' },
  { year: '2023', title: 'NEXARA Labs Founded', desc: 'NEXARA Technology Group established as the parent company, housing VESTON and future innovation verticals.' },
  { year: '2024', title: 'Beta Launch', desc: 'VESTON entered private beta with 200 luxury brands and 50,000 early users across 12 markets.' },
  { year: '2025', title: 'Global Expansion', desc: 'Opened offices in London, Paris, and Tokyo. Partnered with top-tier fashion houses for exclusive AI integration.' },
  { year: '2026', title: 'VESTON Today', desc: 'Serving millions worldwide. The gold standard for AI-powered virtual fashion try-on technology.' },
];

const techFeatures = [
  {
    icon: <Zap size={24} className="text-[#8b7355]" />,
    title: 'Neural Garment Fitting',
    desc: 'Our deep learning model analyzes body landmarks, fabric physics, and lighting in real-time to produce photorealistic garment draping.',
  },
  {
    icon: <Sparkles size={24} className="text-[#8b7355]" />,
    title: 'Style Intelligence',
    desc: 'Trained on 40+ million fashion images, our AI predicts style affinity, suggests complementary pieces, and learns your personal aesthetic.',
  },
  {
    icon: <Globe size={24} className="text-[#8b7355]" />,
    title: 'Universal Fit Engine',
    desc: 'Works across all body types, skin tones, and garment categories. From casual denim to formal haute couture — VESTON adapts seamlessly.',
  },
  {
    icon: <Award size={24} className="text-[#8b7355]" />,
    title: 'Privacy First Architecture',
    desc: 'All processing happens on-device or in encrypted ephemeral sessions. We never store or train on your personal images.',
  },
];

const partners = [
  'Condé Nast', 'Farfetch', 'Net-A-Porter', 'LVMH Digital',
  'Kering Labs', 'Fashion Forward VC', 'TechStyle Group', 'WhoWhatWear',
];

const achievements = [
  { value: 5, suffix: 'M+', label: 'Try-Ons Monthly' },
  { value: 98, suffix: '%', label: 'Fit Accuracy' },
  { value: 200, suffix: '+', label: 'Brand Partners' },
  { value: 40, suffix: '+', label: 'Countries' },
];

const OurServices: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Back Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/5">
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

      {/* ── Hero ── */}
      <section
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #000000 0%, #0d0d0d 50%, #111111 100%)' }}
      >
        {/* bg accent */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #8b7355 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-8"
            style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div {...fadeUp}>
            <div className="flex items-center justify-center gap-6 mb-12">
              <div className="h-px w-20 bg-white/20" />
              <span className="text-white/40 text-[10px] uppercase tracking-[0.8em] font-bold">Est. 2021 · NEXARA Group</span>
              <div className="h-px w-20 bg-white/20" />
            </div>
            <h1 className="text-6xl md:text-8xl font-serif text-white mb-8 leading-[1.05]">
              The Future of<br /><span className="italic text-[#8b7355]">Fashion Technology</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-2xl mx-auto mb-14 tracking-wide">
              VESTON is the AI-powered virtual fashion platform by NEXARA Technology Group — redefining how the world discovers, tries on, and experiences fashion.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#mission" className="group relative px-10 py-4 overflow-hidden bg-white text-black text-[10px] uppercase tracking-[0.4em] font-bold hover:opacity-90 transition-all">
                Our Mission
              </a>
              <a href="#technology" className="px-10 py-4 border border-white/20 text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:border-white/50 hover:bg-white/5 transition-all">
                Our Technology
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-px h-14 bg-gradient-to-b from-white/50 to-transparent" />
          <span className="text-white/20 text-[8px] uppercase tracking-[0.8em]">Scroll</span>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section id="mission" className="py-40 max-w-[1400px] mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-32 items-center">
          <motion.div {...fadeUp}>
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-black/30 mb-6 block">Our Mission</span>
            <h2 className="text-5xl font-serif leading-tight mb-10">
              Democratise luxury.<br /><span className="italic">Elevate every wardrobe.</span>
            </h2>
            <p className="text-black/60 text-lg leading-relaxed mb-8">
              We believe that before you invest in fashion, you deserve to see exactly how it looks on <em>you</em>. Not a model. Not an AI avatar. <strong>You.</strong>
            </p>
            <p className="text-black/50 leading-relaxed">
              VESTON's mission is to eliminate the guesswork of online fashion — reducing returns, increasing confidence, and making the joy of dressing yours to experience, always.
            </p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
            <div className="aspect-square relative overflow-hidden bg-black/5">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800"
                alt="Fashion atelier"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6">
                  <p className="text-white font-serif text-2xl italic leading-tight">"Technology is only as beautiful as the human experience it creates."</p>
                  <p className="text-white/60 text-xs uppercase tracking-widest mt-4">— NEXARA Founding Charter</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Vision */}
        <motion.div {...fadeUp} className="mt-40 text-center max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-black/30 mb-6 block">Our Vision</span>
          <h2 className="text-5xl font-serif mb-10">A world where <span className="italic">every person</span> dresses with confidence</h2>
          <p className="text-black/50 text-lg leading-relaxed">
            By 2030, we envision a world where no fashion purchase is made without experiencing it first. Where size anxiety is eliminated. Where fashion is not just seen — it's felt, simulated, and celebrated before a single transaction.
          </p>
        </motion.div>
      </section>

      {/* ── Achievement Stats ── */}
      <section className="bg-black py-24">
        <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-16">
          {achievements.map((stat, i) => (
            <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className="text-center">
              <p className="text-5xl md:text-6xl font-serif text-white mb-3">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── AI Technology ── */}
      <section id="technology" className="py-40 bg-[#f9f8f6]">
        <div className="max-w-[1400px] mx-auto px-8">
          <motion.div {...fadeUp} className="text-center mb-24">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-black/30 mb-6 block">Innovation</span>
            <h2 className="text-5xl font-serif mb-8">Our AI Technology</h2>
            <p className="text-black/50 max-w-2xl mx-auto text-lg leading-relaxed">
              Built on years of computer vision research, VESTON's technology stack is the most advanced garment simulation engine available to consumers today.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {techFeatures.map((feat, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.12 }}
                className="bg-white p-10 border border-black/5 hover:shadow-2xl transition-all duration-700 group"
              >
                <div className="w-14 h-14 border border-[#8b7355]/20 flex items-center justify-center mb-8 group-hover:bg-[#8b7355]/5 transition-colors">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-serif mb-4">{feat.title}</h3>
                <p className="text-black/55 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* How it Works */}
          <motion.div {...fadeUp} className="mt-28">
            <h3 className="text-3xl font-serif text-center mb-16">How Virtual Try-On Works</h3>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: '01', title: 'Upload', desc: 'Upload your photo or use your live camera' },
                { step: '02', title: 'Scan', desc: 'AI maps 133 body landmarks in milliseconds' },
                { step: '03', title: 'Drape', desc: 'Garment physics engine simulates real fabric behavior' },
                { step: '04', title: 'Wear', desc: 'See yourself in the outfit — save, share, or buy' },
              ].map((s, i) => (
                <div key={i} className="relative">
                  {i < 3 && <div className="hidden md:block absolute top-8 left-full w-full h-px bg-black/10 -translate-x-1/2 z-0" />}
                  <div className="relative z-10 bg-white p-8 border border-black/5 text-center">
                    <div className="text-4xl font-serif font-bold text-black/10 mb-4">{s.step}</div>
                    <div className="w-8 h-px bg-black/20 mx-auto mb-4" />
                    <h4 className="font-bold uppercase tracking-widest text-sm mb-3">{s.title}</h4>
                    <p className="text-black/50 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── About Parent Company ── */}
      <section className="py-40 max-w-[1400px] mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-32 items-center">
          <motion.div {...fadeUp}>
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000"
                alt="NEXARA HQ"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-6 left-6 bg-black text-white px-5 py-3">
                <p className="text-[9px] uppercase tracking-[0.5em] font-bold">Parent Company</p>
                <p className="text-xl font-serif mt-1">NEXARA Group</p>
              </div>
            </div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-black/30 mb-6 block">The Maison Behind VESTON</span>
            <h2 className="text-5xl font-serif leading-tight mb-10">
              NEXARA Technology Group
            </h2>
            <p className="text-black/60 leading-relaxed mb-6">
              NEXARA Technology Group is a global technology holding company focused on the intersection of artificial intelligence, luxury experiences, and consumer fashion. Founded in 2021 and headquartered in New York with offices in London, Paris, and Tokyo.
            </p>
            <p className="text-black/50 leading-relaxed mb-10">
              Our portfolio includes VESTON (AI Try-On), Fabricore (3D fashion design tools), and StyleDNA (personalisation engines for enterprise retail). We exist to make technology as human, beautiful, and purposeful as the brands it powers.
            </p>
            <div className="grid grid-cols-2 gap-8">
              {[
                { icon: Users, value: '280+', label: 'Team Members' },
                { icon: Globe, value: '12', label: 'Global Offices' },
                { icon: TrendingUp, value: '$45M', label: 'Series B Raised' },
                { icon: Award, value: '6', label: 'Industry Awards' },
              ].map(({ icon: Icon, value, label }, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-[#8b7355]/30 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-[#8b7355]" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{value}</p>
                    <p className="text-black/40 text-[10px] uppercase tracking-widest">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="bg-black py-40">
        <div className="max-w-[1400px] mx-auto px-8">
          <motion.div {...fadeUp} className="text-center mb-24">
            <span className="text-white/30 text-[10px] uppercase tracking-[0.5em] font-bold mb-6 block">Our Journey</span>
            <h2 className="text-5xl font-serif text-white">The VESTON Story</h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
            <div className="space-y-24">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                  className={`relative grid md:grid-cols-2 gap-16 items-center ${i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}
                >
                  <div className={`text-${i % 2 === 0 ? 'right' : 'left'} md:text-right`}>
                    <span className="text-[#8b7355] text-6xl font-serif font-bold opacity-30">{item.year}</span>
                  </div>
                  <div
                    className={`bg-white/5 border border-white/8 p-8 hover:border-white/20 transition-all duration-500 ${i % 2 === 1 ? 'md:col-start-1' : ''}`}
                  >
                    <h3 className="text-white font-serif text-2xl mb-4">{item.title}</h3>
                    <p className="text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                  {/* Center dot */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#8b7355] border-2 border-black hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Partners & Trust ── */}
      <section className="py-32 border-b border-black/5">
        <div className="max-w-[1400px] mx-auto px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-black/30 mb-6 block">Trusted By</span>
            <h2 className="text-4xl font-serif">Our Partners & Collaborators</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
            {partners.map((p, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                className="border border-black/10 p-6 text-center hover:border-black/40 hover:shadow-lg transition-all duration-500 group"
              >
                <span className="font-serif text-sm text-black/60 group-hover:text-black transition-colors">{p}</span>
              </motion.div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🔒', title: 'Privacy Certified', desc: 'SOC 2 Type II · GDPR Compliant · ISO 27001' },
              { icon: '🏆', title: 'Award Winning', desc: 'Forbes AI 50 · Wired Next List · FashionTech Award 2025' },
              { icon: '✦', title: 'Enterprise Grade', desc: '99.9% Uptime SLA · 24/7 Support · Dedicated CSM' },
            ].map((badge, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                className="flex items-start gap-5 p-8 bg-[#f9f8f6]"
              >
                <span className="text-3xl">{badge.icon}</span>
                <div>
                  <h4 className="font-bold uppercase tracking-widest text-sm mb-2">{badge.title}</h4>
                  <p className="text-black/50 text-xs leading-relaxed">{badge.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-40 text-center max-w-3xl mx-auto px-8">
        <motion.div {...fadeUp}>
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-black/30 mb-8 block">Begin Your Journey</span>
          <h2 className="text-5xl font-serif mb-10">Ready to wear the future?</h2>
          <p className="text-black/50 text-lg mb-14 leading-relaxed">
            Experience the magic of VESTON's AI virtual try-on. Discover fashion that fits your body, your style, and your life.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-3 px-14 py-5 bg-black text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-black/80 transition-all group"
          >
            Explore the Collection <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Footer bar */}
      <div className="border-t border-black/5 py-8 text-center">
        <p className="text-black/30 text-[10px] uppercase tracking-[0.4em]">© 2026 VESTON · A NEXARA Technology Group Company</p>
      </div>
    </div>
  );
};

export default OurServices;
