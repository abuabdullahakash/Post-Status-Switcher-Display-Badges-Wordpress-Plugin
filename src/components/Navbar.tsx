import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings2, Menu, X, ShieldAlert } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Navbar({ onOpenAdmin }: { onOpenAdmin?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useData();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Features', href: '#features' },
    { name: 'Documentation', href: '#docs' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/80 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {settings.logoImageUrl ? (
              <img 
                src={settings.logoImageUrl} 
                alt="Logo" 
                className="w-10 h-10 object-contain rounded-lg border border-slate-800/80 shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-400 p-[1px]">
                <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center">
                  <Settings2 className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            )}
            <span className="font-display font-bold text-xl tracking-tight">
              {settings.siteName === 'PostStatus' ? (
                <>Post<span className="text-emerald-400">Status</span></>
              ) : (
                settings.siteName
              )}
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <a key={link.name} href={link.href} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {onOpenAdmin && (
              <button 
                onClick={onOpenAdmin}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
                title="Open Admin Dashboard"
              >
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                Admin
              </button>
            )}
            <a href="#pricing" className="px-5 py-2.5 rounded-full bg-white text-slate-900 font-medium text-sm hover:bg-slate-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-4">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {link.name}
            </a>
          ))}
          {onOpenAdmin && (
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full text-left px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Admin Dashboard
            </button>
          )}
          <div className="px-3 pt-2">
            <a href="#pricing" className="block w-full text-center px-5 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600">
              Get Started
            </a>
          </div>
        </div>
      )}
    </motion.nav>
  );
}
