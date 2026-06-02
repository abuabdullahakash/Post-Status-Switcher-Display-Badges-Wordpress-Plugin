import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../context/DataContext';
import * as Icons from 'lucide-react';

export default function StatusModal() {
  const { settings } = useData();
  const [isOpen, setIsOpen] = useState(false);

  // Check if popup should show
  useEffect(() => {
    // If not enabled globally in settings, do not show
    const isEnabled = settings.enableStatusModal ?? true;
    if (!isEnabled) {
      setIsOpen(false);
      return;
    }

    // Check if dismissed in current browser session
    const isDismissed = sessionStorage.getItem('poststatus_status_modal_dismissed');
    if (!isDismissed) {
      // Small timeout for pleasant delayed activation
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [settings.enableStatusModal]);

  const handleDismiss = () => {
    sessionStorage.setItem('poststatus_status_modal_dismissed', 'true');
    setIsOpen(false);
  };

  const handleContactScroll = () => {
    handleDismiss();
    // Allow state change and then scroll to contact section
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = 'contact';
      }
    }, 100);
  };

  // Safe fallback text in case database properties are empty strings
  const fallbackTitle = 'Website Development Under Construction';
  const fallbackMessage = 'Our website configuration is currently under active development and will be completed very soon. However, you are absolutely welcome to browse and download our premium plugins to start using them directly in your projects right now!\n\nIf you need any setup assistance or have questions about using our plugins, please head down to the Contact Section of this page to communicate directly with us. We will be absolutely delighted to support you!';

  const displayTitle = settings.statusModalTitle || fallbackTitle;
  const displayMessage = settings.statusModalMessage || fallbackMessage;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
          />

          {/* Dialog Card Box */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              transition: { type: 'spring', damping: 25, stiffness: 350 }
            }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 p-6 sm:p-8 text-center flex flex-col items-center gap-5 z-10"
          >
            {/* Top Glowing Ambient Accents */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-[40px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] pointer-events-none" />

            {/* Close Circle Anchor */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-950/50 hover:bg-slate-950 border border-slate-850/60 transition-all cursor-pointer"
              aria-label="Dismiss Alert"
            >
              <Icons.X className="w-4 h-4" />
            </button>

            {/* Glowing Icon Package */}
            <div className="relative">
              <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full scale-110 animate-pulse" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-600/20 border border-pink-500/25 text-pink-400 shadow-xl shadow-pink-500/5">
                <Icons.Cog className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
                <Icons.Construction className="w-4 h-4 absolute bottom-2.5 right-2.5 text-pink-300" />
              </div>
            </div>

            {/* Headings */}
            <div className="space-y-2">
              <span className="text-[10px] sm:text-xs font-bold text-pink-400 uppercase tracking-widest bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                Work In Progress &bull; Launching Soon
              </span>
              <h3 className="text-lg sm:text-xl font-display font-bold text-white leading-tight">
                {displayTitle}
              </h3>
            </div>

            {/* Bengali Messages description block */}
            <div className="rounded-2xl bg-slate-950/40 border border-slate-850/40 p-4 text-xs sm:text-sm text-slate-300 antialiased leading-relaxed text-center whitespace-pre-line">
              {displayMessage}
            </div>

            {/* Interactive Grid Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-1">
              <button
                onClick={handleDismiss}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-all active:scale-[98%] text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Icons.Grid className="w-3.5 h-3.5" />
                Explore & Download Plugins
              </button>

              <button
                onClick={handleContactScroll}
                className="w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 hover:shadow-lg hover:shadow-pink-500/20 text-white font-bold text-xs transition-all active:scale-[98%] text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Icons.HelpCircle className="w-3.5 h-3.5" />
                Need Help? Get Support
              </button>
            </div>

            <p className="text-[10px] text-slate-500 italic mt-1 font-mono">
              Press anywhere or ESC to close & continue browsing
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
