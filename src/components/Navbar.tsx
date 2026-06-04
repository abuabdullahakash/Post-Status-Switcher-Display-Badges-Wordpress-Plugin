import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings2, Menu, X, Mail } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useData();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Features', href: '#features' },
    { name: 'Integrations', href: '#integrations' },
    { name: 'Documentation', href: '#docs' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-900/90 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
          : 'bg-slate-950/40 backdrop-blur-sm border-b border-slate-900/20 py-4'
      }`}
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a 
            href="#" 
            className="flex items-center gap-2 cursor-pointer select-none no-underline hover:opacity-95 transition-opacity duration-150" 
            onClick={(e) => {
              e.preventDefault();
              if (window.location.hash && window.location.hash !== '') {
                window.location.hash = '';
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            {settings.logoImageUrl ? (
              <img 
                src={settings.logoImageUrl} 
                alt="Logo" 
                className="w-9 h-9 object-contain rounded-lg border border-slate-850 shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-400 p-[1px]">
                <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center">
                  <Settings2 className="w-4 h-4 text-emerald-450" />
                </div>
              </div>
            )}
            <span className="font-display font-bold text-lg tracking-tight text-white">
              {settings.siteName === 'PostStatus' ? (
                <>Post<span className="text-emerald-400">Status</span></>
              ) : (
                settings.siteName
              )}
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector(link.href);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Contact Button */}
          <div className="hidden lg:flex items-center gap-4">
            <a 
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                const contactSec = document.getElementById('contact');
                if (contactSec) {
                  contactSec.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-white hover:bg-slate-100 text-slate-950 duration-200 px-5 py-2.5 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-[0_4px_15px_rgba(255,255,255,0.1)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.2)] hover:scale-[1.03] active:scale-[0.97]"
            >
              <Mail className="w-3.5 h-3.5 text-slate-950" />
              <span>Contact</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 rounded-lg bg-slate-900/60 border border-slate-900 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden absolute top-full left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-b border-slate-900 overflow-hidden shadow-2xl"
          >
            <div className="px-4 sm:px-6 py-6 space-y-4 max-w-[1320px] mx-auto">
              <div className="flex flex-col gap-1.5">
                {links.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      setTimeout(() => {
                        const el = document.querySelector(link.href);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 200);
                    }}
                    className="block px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-900/80 transition-all border border-transparent hover:border-slate-850/40"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-900">
                <a 
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    setTimeout(() => {
                      const contactSec = document.getElementById('contact');
                      if (contactSec) {
                        contactSec.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 200);
                  }}
                  className="w-full text-center py-3 px-4 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 uppercase cursor-pointer transition-all shadow-[0_4px_15px_rgba(255,255,255,0.1)]"
                >
                  <Mail className="w-4 h-4 text-slate-950" />
                  <span>Contact</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
