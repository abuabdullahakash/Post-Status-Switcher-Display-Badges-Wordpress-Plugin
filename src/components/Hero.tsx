import { motion } from 'motion/react';
import { ArrowRight, Play, CheckCircle2, RefreshCw } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            The Ultimate <br className="hidden md:block" />
            <span className="text-gradient">Post Status Switcher</span> <br className="hidden md:block"/>
            & Display Badges
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Effortlessly change dynamic post and product statuses directly from JetEngine Listing grids and display beautiful conditional badges on the frontend. Built exclusively for Elementor.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="#pricing" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center justify-center gap-2 transition-all border border-slate-700 hover:border-slate-600">
              <Play className="w-5 h-5" />
              Explore Features
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
          
          {/* Gradient Overlay for bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>
        </motion.div>
      </div>
    </section>
  );
}
