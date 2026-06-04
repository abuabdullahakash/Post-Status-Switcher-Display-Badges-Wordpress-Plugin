import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { useData } from '../context/DataContext';
import { Feature } from '../types';
import { DEFAULT_CATEGORIES } from '../lib/defaults';

interface AllFeaturesPageProps {
  onBack: () => void;
  onNavigateToFeature: (id: string) => void;
}

export default function AllFeaturesPage({ onBack, onNavigateToFeature }: AllFeaturesPageProps) {
  const { features, settings } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Feature request form state
  const [requestName, setRequestName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDesc, setRequestDesc] = useState('');
  const [requestCat, setRequestCat] = useState('custom');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [userRequests, setUserRequests] = useState<{title: string, desc: string, cat: string}[]>(() => {
    try {
      const saved = localStorage.getItem('poststatus_custom_requests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Map features dynamically into logical helper categories based on titles & descriptions or stored key
  function getCategory(feature: Feature): string {
    if (feature.category) {
      return feature.category;
    }
    const text = (feature.title + ' ' + feature.description).toLowerCase();
    if (text.includes('rent') || text.includes('sold') || text.includes('property') || text.includes('featured')) {
      return 'properties';
    }
    if (text.includes('stock') || text.includes('sale') || text.includes('deal') || text.includes('product') || text.includes('badge')) {
      return 'woo';
    }
    if (text.includes('column') || text.includes('taxonomy') || text.includes('admin') || text.includes('grid')) {
      return 'ui';
    }
    return 'automation';
  }

  const activeCategoriesList = useMemo(() => {
    return settings?.categoriesList || DEFAULT_CATEGORIES;
  }, [settings]);

  const categories = useMemo(() => {
    const list = [
      { id: 'all', name: 'All Features', icon: 'LayoutGrid', count: features.filter(f => f.active).length }
    ];

    activeCategoriesList.forEach((cat) => {
      const count = features.filter(f => f.active && getCategory(f) === cat.id).length;
      list.push({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        count
      });
    });

    return list;
  }, [features, activeCategoriesList]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFeatures = useMemo(() => {
    return features
      .filter((f) => f.active)
      .filter((f) => {
        // Category constraint
        if (selectedCategory !== 'all') {
          return getCategory(f) === selectedCategory;
        }
        return true;
      })
      .filter((f) => {
        // Search constraint
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
          f.title.toLowerCase().includes(query) ||
          f.description.toLowerCase().includes(query) ||
          (f.useCase && f.useCase.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => a.order - b.order);
  }, [features, selectedCategory, searchQuery]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestName.trim() || !requestEmail.trim() || !requestTitle.trim() || !requestDesc.trim()) {
      setProposalError('All fields are required.');
      return;
    }

    setIsSubmittingProposal(true);
    setProposalError(null);

    try {
      const displayCat = activeCategoriesList.find(c => c.id === requestCat)?.name || requestCat;
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: requestName.trim(),
          email: requestEmail.trim(),
          inquiryType: 'custom_module',
          moduleTitle: requestTitle.trim(),
          moduleCategory: displayCat,
          moduleDesc: requestDesc.trim(),
          subject: `Custom Module Request: ${requestTitle.trim()}`,
          message: `Proposed Module: ${requestTitle.trim()}\nCategory: ${displayCat}\nDescription: ${requestDesc.trim()}`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit proposal.');
      }

      await response.json();

      const newRequest = {
        title: requestTitle,
        desc: requestDesc,
        cat: requestCat
      };

      const nextRequests = [newRequest, ...userRequests];
      setUserRequests(nextRequests);
      try {
        localStorage.setItem('poststatus_custom_requests', JSON.stringify(nextRequests));
      } catch (err) {
        console.warn("Storage write failed.", err);
      }

      // Clear fields
      setRequestTitle('');
      setRequestDesc('');
      setRequestName('');
      setRequestEmail('');
      setProposalError(null);
      
      setRequestSubmitted(true);
      setTimeout(() => setRequestSubmitted(false), 5000);
    } catch (err: any) {
      console.error(err);
      setProposalError(err.message || 'Failed to dispatch proposal over SMTP.');
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 pt-24 pb-20 text-slate-100">
      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[400px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back navigational header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 hover:border-slate-700 transition-all duration-200 text-sm group"
          >
            <Icons.ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Hero Area */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
            <Icons.Cpu className="w-4 h-4 text-blue-400" />
            <span>Powerhouse Index</span>
          </div>

          <h1 className="text-3xl sm:text-4.5xl font-display font-black tracking-tight text-white mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Modules Explorer Index
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-3xl leading-relaxed">
            Search, filter, and review our comprehensive registry of over <strong className="text-white font-semibold">{features.filter(f => f.active).length} custom switcher configurations</strong> tailored perfectly for WordPress meta queries, Gutenberg, WooCommerce, and JetEngine frameworks.
          </p>
        </div>

        {/* Dynamic version index notification ticker */}
        <div className="mb-10 p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Icons.ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">JetEngine Compatibility Confirmed</p>
              <p className="text-[11px] text-slate-400">Fully structured layout indexes match version 3.4.0+ schema guidelines</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 py-1.5 px-3 rounded-lg text-[11px] text-slate-400 font-mono">
            <span>Core Engines:</span>
            <span className="text-emerald-400 font-bold">100% Active</span>
          </div>
        </div>

        {/* Layout Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Main Features List and Search (Takes 8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Realtime Search Bar block */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icons.Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search across titles, descriptions, formulas or specific custom use cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all shadow-inner text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white"
                >
                  <Icons.X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* List Results Header */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-900">
              <span>SHOWING {filteredFeatures.length} MATCHING MODULES</span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-blue-400 hover:underline hover:text-blue-300 transition-colors"
                >
                  Reset Category
                </button>
              )}
            </div>

            {/* Features Accordion List */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredFeatures.map((feature, idx) => {
                  const isSvgIcon = feature.iconName && (feature.iconName.trim().startsWith('<svg') || feature.iconName.includes('<svg') || feature.iconName.includes('xmlns='));
                  const IconComp = !isSvgIcon ? ((Icons as any)[feature.iconName] || Icons.Settings) : null;
                  const isExpanded = !!expandedIds[feature.id];

                  return (
                    <motion.div
                      key={feature.id}
                      layout="position"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => toggleExpand(feature.id)}
                      className="group p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 cursor-pointer overflow-hidden relative select-none"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${feature.color || 'from-blue-500 to-indigo-500'} bg-opacity-20`}>
                            {isSvgIcon ? (
                              <div 
                                className="w-5 h-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-current [&>svg]:stroke-[2] text-white"
                                dangerouslySetInnerHTML={{ __html: feature.iconName }}
                              />
                            ) : (
                              IconComp && <IconComp className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors duration-200">
                              {feature.title}
                            </h3>
                            <span className="inline-block text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500 mt-0.5">
                              Tag: {getCategory(feature).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Expand status indicators */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(feature.id);
                            }}
                            className="w-7 h-7 rounded-md border text-slate-400 hover:text-white flex items-center justify-center bg-slate-900 border-slate-800 transition-all cursor-pointer"
                          >
                            {isExpanded ? (
                              <Icons.Minus className="w-3.5 h-3.5" />
                            ) : (
                              <Icons.Plus className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Snippet Description */}
                      <p className="mt-3 text-slate-400 text-xs sm:text-sm leading-relaxed pl-1">
                        {feature.description}
                      </p>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                              opacity: { duration: 0.2, ease: 'linear' }
                            }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-4 border-t border-slate-800/60 pl-1 space-y-4">
                              {/* Use Case Widget */}
                              <div>
                                <span className="block text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1.5 font-mono">
                                  CORE IMPLEMENTATION USE CASE
                                </span>
                                <p className="text-xs font-medium text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-850">
                                  {feature.useCase || 'Automatically switches post states according to dynamic metadata definitions.'}
                                </p>
                              </div>

                              {/* Control Links */}
                              <div className="flex items-center justify-between gap-3 pt-2">
                                <span className="text-[10px] font-mono text-slate-500 uppercase">
                                  JetEngine Optimized Configuration
                                </span>
                                {feature.id && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onNavigateToFeature(feature.id);
                                    }}
                                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all duration-200 flex items-center gap-1 hover:shadow-md"
                                  >
                                    <span>View Config Details</span>
                                    <Icons.ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {filteredFeatures.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center rounded-2xl bg-slate-900/20 border border-slate-900"
                  >
                    <Icons.Inbox className="w-8 h-8 text-slate-650 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 font-medium">No custom switcher modules matched your query.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="mt-3 text-xs text-blue-400 underline hover:text-blue-300"
                    >
                      Clear search queries and active filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Column 2: Sleek Interactive Sidebar (Takes 4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Section 1: Hot Categories Segment Selector */}
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-850">
              <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-1.5">
                <Icons.Filter className="w-3.5 h-3.5 text-blue-400" />
                <span>Categories</span>
              </h3>
              
              <div className="space-y-1.5">
                {categories.map((cat) => {
                  const isSvg = cat.icon && (
                    cat.icon.trim().toLowerCase().startsWith('<svg') || 
                    cat.icon.toLowerCase().includes('<svg') || 
                    cat.icon.toLowerCase().includes('xmlns=') ||
                    (cat.icon.trim().toLowerCase().startsWith('<') && cat.icon.toLowerCase().includes('svg'))
                  );
                  const CatIcon = !isSvg ? ((Icons as any)[cat.icon] || Icons.Tag) : null;
                  const isActive = selectedCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {isSvg ? (
                          <div 
                            className={`w-4 h-4 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-current [&>svg]:stroke-[2] ${isActive ? 'text-blue-400' : 'text-slate-500'}`}
                            dangerouslySetInnerHTML={{ __html: cat.icon }}
                          />
                        ) : (
                          CatIcon && <CatIcon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                        )}
                        <span>{cat.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                        isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-905 text-slate-500'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Interactive Feature Request Form */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0e1626]/80 to-[#070b13]/80 border border-slate-850 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-xl rounded-full pointer-events-none" />
              
              <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                <Icons.ForkKnife className="w-3.5 h-3.5 text-blue-400" />
                <span>Request Custom Module</span>
              </h3>
              <p className="text-xs text-slate-450 mb-4 leading-relaxed">
                Need a specific WordPress status switcher or metadata rule logic? Add it below and we will automatically build it into the active roster of {features.filter(f => f.active).length} features!
              </p>

              <form onSubmit={handleRequestSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    required
                    disabled={isSubmittingProposal}
                    placeholder="Your Full Name"
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    required
                    disabled={isSubmittingProposal}
                    placeholder="Your Email Address"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    required
                    disabled={isSubmittingProposal}
                    placeholder="e.g. Bulk Stock Sync with Multi-vendor"
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <textarea
                    required
                    disabled={isSubmittingProposal}
                    placeholder="Describe how this status switcher should work visually (min 15 chars)..."
                    rows={3}
                    value={requestDesc}
                    onChange={(e) => setRequestDesc(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <select
                    value={requestCat}
                    disabled={isSubmittingProposal}
                    onChange={(e) => setRequestCat(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-400 focus:outline-none focus:text-white disabled:opacity-50"
                  >
                    {activeCategoriesList.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {proposalError && (
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400 font-medium">
                    {proposalError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingProposal}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[98%] text-white text-xs font-semibold transition-all relative overflow-hidden flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSubmittingProposal ? (
                    <>
                      <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Serializing Proposal...</span>
                    </>
                  ) : (
                    <span>Submit Feature Module Proposal</span>
                  )}
                </button>
              </form>

              <AnimatePresence>
                {requestSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-center p-4 z-20"
                  >
                    <Icons.CheckCircle className="w-10 h-10 text-emerald-400 mb-2" />
                    <h4 className="text-xs font-bold text-white mb-1">Proposal Registered!</h4>
                    <p className="text-[10px] text-slate-400 max-w-sm">
                      Your workflow request has been successfully serialized and verified. Development sequence initiated.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Section 3: Show Submitted Proposals if any */}
            {userRequests.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-900/35 border border-slate-900 space-y-3">
                <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                  ACTIVE QUEUE REQUESTS ({userRequests.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {userRequests.map((req, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-900 text-xs">
                      <p className="font-bold text-slate-200">{req.title}</p>
                      <p className="text-slate-450 mt-1 lines-clamp-2 leading-relaxed text-[11px]">{req.desc}</p>
                      <span className="inline-block px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-mono text-blue-400 mt-2">
                        {req.cat.toUpperCase()} QUEUED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4: Telemetry Stats */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-900/80 space-y-4">
              <h3 className="text-xs font-mono font-bold tracking-widest text-slate-450 uppercase flex items-center gap-1.5">
                <Icons.Activity className="w-3.5 h-3.5 text-blue-400" />
                <span>INDEX METRICS</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-900 text-center">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Registry Count</p>
                  <p className="text-lg font-bold text-white mt-1">1,024</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-900 text-center">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Compatibility</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">99.8%</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-900 text-center">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Release Version</p>
                  <p className="text-lg font-bold text-blue-450 mt-1">v3.4.1</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-900 text-center">
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Global Loads</p>
                  <p className="text-lg font-bold text-white mt-1">14.2k</p>
                </div>
              </div>
            </div>

          </div>
          
        </div>
      </div>
    </div>
  );
}
