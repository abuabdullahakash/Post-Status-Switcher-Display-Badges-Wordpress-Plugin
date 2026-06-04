import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useData } from '../context/DataContext';
import { 
  Puzzle, 
  Layers, 
  ShoppingCart, 
  Grid, 
  Database, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface IntegrationPartner {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  description: string;
  testedVersion: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}

const defaultPartnersData = [
  {
    id: 'jetengine',
    name: 'CrocoBlock JetEngine',
    subtitle: 'Dynamic Query Builder Addon',
    badge: 'Native Integration',
    description: 'Unlock visual logic inside JetEngine Query Builder. Allows you to effortlessly construct complex meta queries, custom content types, and relation grids based on post state switches.',
    testedVersion: 'v3.2+',
    color: 'text-amber-400 border-amber-500/20 shadow-amber-500/5',
    bgColor: 'bg-amber-500/10',
    iconName: 'Layers',
    features: [
      'Query by meta field or custom taxonomy',
      'Direct JetEngine Listing Grid binding',
      'Custom Relations integration & rendering',
      'Option Pages default state switching'
    ]
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    subtitle: 'Product State Toggles & Badges',
    badge: 'Certified Compatibility',
    description: 'Enrich product listings and grids with interactive badges. Update real-time status switches for stock status, discount offers, backorders, or special Deals of the Day dynamically.',
    testedVersion: 'v8.0+',
    color: 'text-purple-400 border-purple-500/20 shadow-purple-500/5',
    bgColor: 'bg-purple-500/10',
    iconName: 'ShoppingCart',
    features: [
      'Automated In Stock / Out of Stock indicators',
      'Sales and Flash-Sale dynamic label widgets',
      'Direct integration with Woo Product Loop templates',
      'Cart page state conditional updates'
    ]
  },
  {
    id: 'elementor',
    name: 'Elementor Pro',
    subtitle: 'Dynamic Tag Rendering',
    badge: 'No-Code Workflow',
    description: 'Provides native Elementor Dynamic Tags out of the box. Use Elementor\'s visual design system to completely style and render post states, display badges, and switch triggers without writing single lines of CSS.',
    testedVersion: 'v3.18+',
    color: 'text-rose-400 border-rose-500/20 shadow-rose-500/5',
    bgColor: 'bg-rose-500/10',
    iconName: 'Grid',
    features: [
      'Drag-and-drop Dynamic Tag integration',
      'Full compatibility with Elementor Loop Grids',
      'Custom Container conditional styling rules',
      'Responsive typography & layout adjustments'
    ]
  },
  {
    id: 'cpt',
    name: 'Custom Post Type UI (CPT)',
    subtitle: 'Custom Post State Switching',
    badge: 'Core Infrastructure',
    description: 'Fully supports any custom post type. Whether you are listing real estate properties, automotive dealership vehicles, or event tickers, instantly register custom switcher states in CPT UI Admin Tables.',
    testedVersion: 'v1.15+',
    color: 'text-sky-400 border-sky-500/20 shadow-sky-500/5',
    bgColor: 'bg-sky-500/10',
    iconName: 'Database',
    features: [
      'Universal key-value custom post support',
      'Custom Taxonomy and Category dynamic columns',
      'Instant register & setup directly within WP admin dashboard',
      'Optimized AJAX state updates (No Page Reloads)'
    ]
  }
];

export default function Integrations() {
  const [selectedId, setSelectedId] = useState<string>('jetengine');
  const { integrations } = useData();
  const [partners, setPartners] = useState<IntegrationPartner[]>([]);

  useEffect(() => {
    const activeIntegrations = integrations.filter((p) => p.active);
    const mapped = activeIntegrations.map((item) => {
      let selectedIcon = Layers;
      if (item.id === 'woocommerce') selectedIcon = ShoppingCart;
      else if (item.id === 'elementor') selectedIcon = Grid;
      else if (item.id === 'cpt') selectedIcon = Database;

      const matchedDefaults = defaultPartnersData.find(d => d.id === item.id) || defaultPartnersData[0];

      return {
        id: item.id,
        name: item.name || matchedDefaults.name,
        subtitle: item.subtitle || matchedDefaults.subtitle,
        badge: item.badge || matchedDefaults.badge,
        description: item.description || matchedDefaults.description,
        testedVersion: item.testedVersion || matchedDefaults.testedVersion,
        color: matchedDefaults.color,
        bgColor: matchedDefaults.bgColor,
        icon: selectedIcon,
        features: matchedDefaults.features
      };
    });
    setPartners(mapped);

    if (mapped.length > 0 && !mapped.some((item) => item.id === selectedId)) {
      setSelectedId(mapped[0].id);
    }
  }, [integrations, selectedId]);

  // Compile full set of partner logos for seamless sliding marquee
  const marqueeItems = partners.length > 0 
    ? [...partners, ...partners, ...partners, ...partners] 
    : [];

  // Don't render if no premium adapters are active
  if (partners.length === 0) return null;

  return (
    <section id="integrations" className="relative py-24 bg-slate-950 overflow-hidden border-t border-slate-900">
      {/* Decorative vector assets */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1320px] h-full pointer-events-none">
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-10 w-72 h-72 bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold tracking-widest uppercase mb-5">
            <Puzzle className="w-3.5 h-3.5 animate-pulse" />
            <span>100% Core Compatibility</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-5">
            Seamlessly Plugged Into <br />
            <span className="text-gradient">Your Favorite Ecosystem</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Our WordPress switcher plugin behaves natively within the tools freelancers and web development agencies trust most. Direct support, zero layout breakage.
          </p>
        </div>

        {/* Animated Marquee Strip */}
        <div className="relative w-full mb-16 select-none overflow-hidden py-4 border-y border-slate-900/60 backdrop-blur-sm">
          {/* Left/Right Faders */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

          {/* Scrolling Marquee Row */}
          <div className="flex w-full overflow-hidden">
            <motion.div 
              className="flex gap-8 whitespace-nowrap"
              animate={{ x: [0, '-25%'] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 25,
                  ease: "linear"
                }
              }}
            >
              {marqueeItems.map((partner, index) => {
                const Icon = partner.icon;
                return (
                  <div
                    key={`${partner.id}-${index}`}
                    onClick={() => setSelectedId(partner.id)}
                    className={`flex items-center gap-3.5 px-6 py-4 rounded-2xl bg-slate-900/40 border transition-all duration-300 cursor-pointer hover:bg-slate-900/60 group ${
                      selectedId === partner.id 
                        ? `${partner.color.split(' ')[1] || 'border-blue-500/30'} bg-slate-900/90 shadow-[0_0_25px_rgba(59,130,246,0.12)]` 
                        : 'border-slate-900 hover:border-slate-850'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${partner.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className={`w-5 h-5 ${partner.color.split(' ')[0]}`} />
                    </div>
                    <div>
                      <span className="font-display font-bold text-sm text-slate-100 flex items-center gap-1.5">
                        {partner.name}
                        {selectedId === partner.id && (
                          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
                        )}
                      </span>
                      <p className="font-mono text-[10px] text-slate-450 uppercase tracking-wider">{partner.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Dynamic Detail Card Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Nav Selectors */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <p className="text-xs font-mono font-bold tracking-widest text-slate-450 uppercase mb-2 px-1">
              Select Integration
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {partners.map((p) => {
                const Icon = p.icon;
                const isActive = selectedId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'bg-slate-900 border-blue-500/30 text-white shadow-[0_0_20px_rgba(59,130,246,0.08)]' 
                        : 'bg-transparent border-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${isActive ? p.bgColor : 'bg-slate-900/50'} transition-all`}>
                        <Icon className={`w-4.5 h-4.5 ${isActive ? p.color.split(' ')[0] : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm leading-tight text-inherit">
                          {p.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-blue-400 translate-x-1' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Detail Display */}
          <div className="lg:col-span-8">
            {partners.map((p) => {
              if (p.id !== selectedId) return null;
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 md:p-8 rounded-3xl bg-slate-900/30 border border-slate-900 hover:border-slate-850/50 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.35),0_0_40px_rgba(59,130,246,0.04)] relative overflow-hidden flex flex-col gap-6"
                >
                  {/* Subtle dynamic decoration glow */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 blur-3xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-900/80">
                    <div className="flex items-center gap-4">
                      <div className={`p-3.5 rounded-2xl ${p.bgColor}`}>
                        <Icon className={`w-7 h-7 ${p.color.split(' ')[0]}`} />
                      </div>
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="font-display font-extrabold text-xl md:text-2xl text-white">
                            {p.name}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono tracking-wider font-semibold">
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-450 mt-1">{p.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-2xl bg-slate-950 border border-slate-900/80 min-w-[110px]">
                      <span className="text-[10px] font-mono text-slate-450 font-bold uppercase tracking-widest block">
                        Tested Up To
                      </span>
                      <span className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5">
                        {p.testedVersion}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-mono font-bold tracking-widest text-slate-450 uppercase mb-2">
                      Integration Overview
                    </h5>
                    <p className="text-sm text-slate-300 leading-relaxed font-light">
                      {p.description}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-mono font-bold tracking-widest text-slate-450 uppercase mb-4">
                      Key Capabilities & Supported Data Fields
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {p.features.map((featureMap, fIdx) => (
                        <div 
                          key={fIdx} 
                          className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-900/60 transition-colors hover:border-slate-850/50"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-350 leading-relaxed">
                            {featureMap}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between flex-wrap gap-4 border-t border-slate-900/80">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Zero backend friction, optimized memory footprint.</span>
                    </span>
                    <a
                      href="#docs"
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors hover:underline"
                    >
                      <span>Read Setup Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
