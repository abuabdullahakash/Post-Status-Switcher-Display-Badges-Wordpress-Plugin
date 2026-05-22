import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Features() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { features } = useData();

  // Filter active features to display on frontend grid
  const activeFeatures = features.filter(f => f.active);

  return (
    <section id="features" className="py-24 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">The Interactive Showcase</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Explore the versatile use-cases. Click on any feature to discover how easy it is to set up and integrate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeFeatures.map((feature) => {
            const IconComponent = (Icons as any)[feature.iconName] || Icons.HelpCircle;
            const isExpanded = expandedId === feature.id;

            return (
              <motion.div
                key={feature.id}
                layout
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden"
              >
                <div 
                  className="p-8 cursor-pointer group"
                  onClick={() => setExpandedId(isExpanded ? null : feature.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} bg-opacity-10 shadow-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-display font-bold group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                    </div>
                    <div className="text-slate-500 group-hover:text-slate-300 transition-colors">
                      {isExpanded ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-slate-800 bg-slate-900/50"
                    >
                      <div className="p-8 pt-6">
                        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Use Case</h4>
                        <p className="text-slate-400">
                          {feature.useCase}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
