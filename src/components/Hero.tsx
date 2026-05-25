import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play, CheckCircle2, RefreshCw, ArrowDownToLine } from 'lucide-react';
import { useData } from '../context/DataContext';

function getDirectDownloadUrl(url: string | undefined): string {
  if (!url) return '';
  const trimmedUrl = url.trim();
  
  // Custom parsing for Google Drive file URLs
  // Regular expression to find the folder ID or file ID in drive URLs
  // e.g., https://drive.google.com/file/d/1A2B3C4D5E6F/view?usp=sharing
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]{25,})/i;
  const match = trimmedUrl.match(driveRegex);
  
  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  
  return trimmedUrl;
}

export default function Hero() {
  const { settings, incrementDownload } = useData();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadClick = () => {
    if (downloading) return;
    setDownloading(true);
    incrementDownload();

    // Resolve direct download URL
    const urlSet = settings.pluginDownloadUrl;
    const directUrl = getDirectDownloadUrl(urlSet);

    if (directUrl) {
      // Create a transient anchor element to trigger direct download window
      const link = document.createElement('a');
      link.href = directUrl;
      link.target = '_blank';
      link.setAttribute('download', 'poststatus-switcher.zip');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback: If no custom plugin URL has been configured in administrative dashboard,
      // trigger standard template ZIP simulation mock download so that it functions like "one click download" for placeholder/live preview!
      const zipContent = "PostStatus Switcher & Display Badges Plugin Template ZIP.\n\nConfigure your real download ZIP link from Google Drive or GitHub inside the Live Superadmin Settings Canvas of the Dashboard (mdakash136915@gmail.com).";
      const blob = new Blob([zipContent], { type: 'application/zip' });
      const mockUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = mockUrl;
      link.setAttribute('download', 'poststatus-switcher-fallback.zip');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(mockUrl);
    }

    setTimeout(() => {
      setDownloading(false);
    }, 3000);
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1320px] h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative max-w-[1320px] mx-auto px-[15px] sm:px-[20px] lg:px-[40px]">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
            New: Smart WooCommerce Integration
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6 leading-tight"
          >
            {settings.heroTitle} <br className="hidden md:block" />
            <span className="text-gradient">{settings.heroSubtitle}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            {settings.heroDescription}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto px-4 sm:px-0"
          >
            <button 
              onClick={handleDownloadClick}
              className={`w-full sm:w-auto px-5 py-3 sm:px-8 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer select-none text-xs sm:text-sm uppercase tracking-wider ${
                downloading 
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]'
              }`}
            >
              <ArrowDownToLine className={`w-4 h-4 sm:w-5 sm:h-5 ${downloading ? 'animate-bounce' : ''}`} />
              <span>{downloading ? "Downloading... ✅" : (settings.ctaButtonText || "Download Plugin")}</span>
            </button>
            <a 
              href="#features" 
              onClick={(e) => {
                e.preventDefault();
                const featuresEl = document.getElementById('features');
                if (featuresEl) {
                  featuresEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full sm:w-auto px-5 py-3 sm:px-8 sm:py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center justify-center gap-2 transition-all border border-slate-700 hover:border-slate-600 cursor-pointer text-xs sm:text-sm"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Explore Features</span>
            </a>
          </motion.div>
        </div>

        {/* Visual Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="relative max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-4 overflow-hidden shadow-2xl"
        >
          {/* Browser Top Bar */}
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          </div>
          
          {settings.heroImageUrl ? (
            <div className="relative rounded-xl overflow-hidden aspect-[16/9] border border-slate-800 max-h-[480px]">
              <img 
                src={settings.heroImageUrl} 
                alt="Product Dashboard Preview" 
                className="w-full h-full object-cover brightness-[0.9] hover:brightness-[1.0] transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Post Card 1 */}
              <div className="rounded-xl bg-slate-800/80 border border-slate-700 overflow-hidden relative">
                <div className="absolute top-3 left-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-xs font-medium backdrop-blur-md">
                  In Stock
                </div>
                <div className="h-40 bg-slate-700 w-full animate-pulse"></div>
                <div className="p-4">
                  <div className="h-5 w-3/4 bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-slate-700/50 rounded mb-6"></div>
                  <div className="flex justify-between items-center">
                    <span className="h-5 w-1/4 bg-slate-700 rounded"></span>
                    <button className="p-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors cursor-pointer flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-xs">Toggle</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Post Card 2 */}
              <div className="rounded-xl bg-slate-800/80 border border-slate-700 overflow-hidden relative">
                <div className="absolute top-3 left-3 bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded text-xs font-medium backdrop-blur-md">
                  Sold Out
                </div>
                <div className="h-40 bg-slate-700 w-full opacity-50"></div>
                <div className="p-4">
                  <div className="h-5 w-2/3 bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 w-1/3 bg-slate-700/50 rounded mb-6"></div>
                  <div className="flex justify-between items-center">
                    <span className="h-5 w-1/4 bg-slate-700 rounded"></span>
                    <button className="p-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors cursor-pointer flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-xs">Toggle</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Post Card 3 */}
              <div className="rounded-xl bg-slate-800/80 border border-slate-700 overflow-hidden relative hidden md:block">
                <div className="absolute top-3 left-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded text-xs font-medium backdrop-blur-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Available
                </div>
                <div className="h-40 bg-slate-700 w-full"></div>
                <div className="p-4">
                  <div className="h-5 w-full bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 w-2/3 bg-slate-700/50 rounded mb-6"></div>
                  <div className="flex justify-between items-center">
                    <span className="h-5 w-1/4 bg-slate-700 rounded"></span>
                    <button className="p-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors cursor-pointer flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-blue-400 animate-spin-slow" />
                      <span className="text-xs text-blue-400">Saving...</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Gradient Overlay for bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>
        </motion.div>
      </div>
    </section>
  );
}
