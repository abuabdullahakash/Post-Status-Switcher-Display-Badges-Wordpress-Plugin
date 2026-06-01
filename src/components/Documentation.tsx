import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Database, Paintbrush, Eye } from 'lucide-react';

const steps = [
  {
    id: 'step-1',
    title: 'Visual Query Initialization',
    icon: Settings,
    description: 'Activate the visual canvas in JetEngine settings.',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 leading-relaxed">
          Navigate to your WordPress dashboard. Under the JetEngine menu, locate the <strong className="text-white">Visual Query Builder</strong> sub-menu. Enable the visual canvas to override the default backend array constructor.
        </p>
        <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 font-mono text-sm text-slate-400 overflow-x-auto">
          <span className="text-blue-400">1.</span> Go to Dashboard &gt; JetEngine<br/>
          <span className="text-blue-400">2.</span> Click "Visual Query Canvas"<br/>
          <span className="text-blue-400">3.</span> Toggle "Enable Node Editor" to <span className="text-emerald-400">ON</span>
        </div>
      </div>
    )
  },
  {
    id: 'step-2',
    title: 'Post Type Assignment',
    icon: Database,
    description: 'Select target Post Types and WooCommerce Products.',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 leading-relaxed">
          Determine which data objects the query builder can interact with. Assign capabilities to WooCommerce Products, default posts, or JetEngine CPTs.
        </p>
        <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-4 sm:p-6 flex items-center justify-center">
          <div className="w-full max-w-sm space-y-3">
            <div className="flex items-center justify-between p-3 rounded bg-slate-900 border border-slate-700 gap-2">
              <span className="text-xs sm:text-sm font-medium">WooCommerce Products</span>
              <div className="w-10 h-5 bg-blue-500 rounded-full flex items-center px-1 justify-end shrink-0">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded bg-slate-900 border border-slate-700 gap-2">
              <span className="text-xs sm:text-sm font-medium">Custom CPTs (e.g. Properties)</span>
              <div className="w-10 h-5 bg-blue-500 rounded-full flex items-center px-1 justify-end shrink-0">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'step-3',
    title: 'Elementor Pro Loop Grid',
    icon: Paintbrush,
    description: 'Inject visual queries straight into Elementor Loop Grids.',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 leading-relaxed">
          Forget writing PHP or JSON arrays for complex filtering. Pass the unique ID of your Visual Node Query to the standard <strong>Elementor Pro Loop Grid</strong> or JetEngine Listing Grid.
        </p>
        <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 sm:p-4 font-mono text-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[10px] sm:text-xs">Query Source</span>
            <span className="text-slate-400 text-xs sm:text-sm break-all">&rarr; Select "JetEngine Visual Query"</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[10px] sm:text-xs">Query ID</span>
            <span className="text-slate-400 text-xs sm:text-sm break-all">&rarr; vqb-dynamic-filter-01</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'step-4',
    title: 'Real-time UI Adaptation',
    icon: Eye,
    description: 'Auto-update layout arrays without refreshing the page.',
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 leading-relaxed">
          Queries update automatically based on URL parameters or JetSmartFilters. Combined with dynamic visibility rules, your grids become completely interactive and state-aware.
        </p>
        <ul className="space-y-2 text-slate-300 text-sm">
           <li className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Smart Condition: Hide Element if</li>
           <li className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>Visual Output: Empty / No Matches</li>
           <li className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>Result: Hides the loop grid seamlessly.</li>
        </ul>
      </div>
    )
  }
];

export default function Documentation() {
  const [activeStep, setActiveStep] = useState(steps[0].id);

  return (
    <section id="docs" className="py-24 bg-slate-900 border-y border-slate-800">
      <div className="max-w-[1320px] mx-auto px-[15px] sm:px-[20px] lg:px-[40px]">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Interactive <span className="text-gradient">Documentation</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Master the setup process in minutes. Our step-by-step tutorial guides you from installation to a fully functional frontend interface.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Tabs Navigation */}
          <div className="w-full lg:w-1/3 space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full flex items-start gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-lg sm:rounded-xl transition-all duration-300 text-left ${isActive ? 'bg-slate-800 border border-slate-700 shadow-lg' : 'bg-transparent border border-transparent hover:bg-slate-800/50'}`}
                >
                  <div className={`shrink-0 p-2 rounded-lg flex items-center justify-center ${isActive ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-500 whitespace-nowrap shrink-0">STEP {index + 1}</span>
                      <h3 className={`font-semibold line-clamp-1 sm:line-clamp-none ${isActive ? 'text-white' : 'text-slate-300'}`}>{step.title}</h3>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {step.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="w-full lg:w-2/3">
            <div className="h-full rounded-2xl bg-slate-950 border border-slate-800 p-5 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden">
              {/* Design Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <AnimatePresence mode="wait">
                {steps.map((step, index) => (
                  step.id === activeStep && (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="relative z-10 h-full flex flex-col"
                    >
                       <div className="flex items-start sm:items-center gap-3 mb-6">
                         <div className="px-3 py-1 bg-slate-800 rounded-full text-xs font-bold tracking-wider text-slate-400 shrink-0 whitespace-nowrap mt-1 sm:mt-0">
                           STEP 0{index + 1}
                         </div>
                         <h3 className="text-2xl font-display font-bold">{step.title}</h3>
                       </div>
                       
                       <div className="prose prose-invert prose-slate max-w-none flex-grow">
                         {step.content}
                       </div>
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
