import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Features() {
  const { features, settings } = useData();

  // Keep track of which features are expanded. We can expand multiple independently.
  // We'll pre-expand 'taxonomy-columns' as shown in the mockup image if it exists.
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'taxonomy-columns': true,
    'id-taxonomy-columns': true, // Fallback if naming differs slightly
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!features || features.length === 0) return null;

  return (
    <section id="features" className="py-24 relative z-10 bg-slate-950">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Header Block */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs sm:text-sm font-semibold mb-4"
          >
            <Icons.Layers className="w-4 h-4 text-blue-400" />
            <span>Showcase Grid</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight mb-4 text-white"
          >
            {settings?.featuresSectionTitle || 'The Interactive Showcase'}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
          >
            {settings?.featuresSectionSubtitle || 'Explore the powerful capabilities that make this visual query builder the perfect addition to your tech stack.'}
          </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features
            .filter((f) => f.active)
            .sort((a, b) => a.order - b.order)
            .slice(0, 6) // Curated premium list for the homepage
            .map((feature, i) => {
              // Resolve Lucide Icon dynamically
              const isSvgIcon = feature.iconName && (
                feature.iconName.trim().toLowerCase().startsWith('<svg') || 
                feature.iconName.toLowerCase().includes('<svg') || 
                feature.iconName.toLowerCase().includes('xmlns=') ||
                (feature.iconName.trim().startsWith('<') && feature.iconName.toLowerCase().includes('svg'))
              );
              const IconComponent = !isSvgIcon ? (
                (Icons as any)[feature.iconName] ||
                (Icons as any)[feature.iconName.replace(/\s+/g, '')] ||
                Icons.Settings
              ) : null;
              
              const isExpanded = !!expandedIds[feature.id];

              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => toggleExpand(feature.id)}
                  className="group p-6 sm:p-8 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-slate-700/80 transition-[border-color,box-shadow] duration-300 flex flex-col relative overflow-hidden select-none hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] cursor-pointer"
                >
                  {/* Subtle top indicator hover line */}
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-300" />

                  {/* Header: Icon, Title, Expand Icon */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Gradient wrapped icon container */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${feature.color || 'from-blue-500 to-indigo-500'} bg-opacity-20 shadow-md relative z-10`}>
                        {isSvgIcon ? (
                          <div 
                            className="w-5 h-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-current [&>svg]:stroke-[2] text-white"
                            dangerouslySetInnerHTML={{ __html: feature.iconName }}
                          />
                        ) : (
                          IconComponent && <IconComponent className="w-5 h-5 text-white drop-shadow" />
                        )}
                      </div>
                      
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors duration-200">
                        {feature.title}
                      </h3>
                    </div>

                    {/* Expander Trigger Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(feature.id);
                      }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border text-slate-400 hover:text-white flex items-center justify-center transition-all bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-slate-700 cursor-pointer focus:outline-none`}
                    >
                      {isExpanded ? (
                        <Icons.Minus className="w-4 h-4 text-slate-300 stroke-[2.5]" />
                      ) : (
                        <Icons.Plus className="w-4 h-4 text-slate-300 stroke-[2.5]" />
                      )}
                    </button>
                  </div>

                  {/* Description Element */}
                  <div className="mt-4 flex-1 flex flex-col">
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Accordion Expand Area */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ 
                            height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
                            opacity: { duration: 0.25, ease: 'linear' }
                          }}
                          className="overflow-hidden"
                        >
                          <div className="pt-5">
                            {/* Top Divider */}
                            <div className="border-t border-slate-800/80 mb-5" />

                            <div className="space-y-4">
                              {/* Use Case Box */}
                              <div>
                                <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 font-mono">
                                  USE CASE
                                </span>
                                <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/40">
                                  {feature.useCase || 'Seamless dynamic integration across WooCommerce default grids.'}
                                </p>
                              </div>

                              {/* Bottom Divider */}
                              <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between gap-4 mt-2">
                                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                                  JETENGINE OPTIMIZED
                                </span>
                                
                                <a
                                  href={`#feature/${feature.id}`}
                                  onClick={(e) => {
                                    // Navigates naturally via routing setup
                                    e.stopPropagation();
                                  }}
                                  className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all duration-200 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center gap-1.5 shrink-0"
                                >
                                  <span>View Details</span>
                                  <Icons.ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* View All Features Trigger Block */}
        <div className="mt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block p-1 rounded-2xl bg-slate-950 border border-slate-850 shadow-2xl"
          >
            <div className="px-6 py-6 sm:px-12 sm:py-8 text-center max-w-2xl">
              <span className="text-xs font-mono font-bold tracking-widest text-[#3b82f6] uppercase block mb-2">
                1000+ MODULE ROSTER ACTIVE
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Looking for a specific configuration module?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
                Explore our full, comprehensive database index of switchers complete with search filters, interactive categories, and direct configuration files.
              </p>
              
              <a
                href="#all-features"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs sm:text-sm text-white transition-all duration-200 hover:shadow-[0_0_25px_rgba(59,130,246,0.45)] group shrink-0"
              >
                <span>Browse All 1,000+ Features</span>
                <Icons.ArrowRight className="w-4 h-4 transition-transform duration-250 group-hover:translate-x-1" />
              </a>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
