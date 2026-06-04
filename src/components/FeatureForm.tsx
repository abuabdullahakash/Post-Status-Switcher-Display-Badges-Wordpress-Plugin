import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { Feature } from '../types';
import ImageUploader from './ImageUploader';

interface FeatureFormProps {
  initialFeature: Partial<Feature>;
  isEditing: boolean;
  onSubmit: (feature: Partial<Feature>) => Promise<void>;
  onCancel: () => void;
  categories: { id: string; name: string; icon: string; color?: string }[];
  onAddCategoryClick: (target: 'new' | 'edit') => void;
  isSaving: boolean;
}

const PRESET_GRADIENTS = [
  { name: 'Royal Indigo', value: 'from-blue-500 to-indigo-500', bg: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
  { name: 'Ocean Breeze', value: 'from-cyan-500 to-blue-600', bg: 'bg-gradient-to-r from-cyan-500 to-blue-600' },
  { name: 'Cyber Mint', value: 'from-emerald-450 to-teal-550', bg: 'bg-gradient-to-r from-emerald-400 to-teal-500' },
  { name: 'Twilight Gold', value: 'from-yellow-400 to-amber-500', bg: 'bg-gradient-to-r from-yellow-400 to-amber-500' },
  { name: 'Sunset Flame', value: 'from-orange-400 to-red-500', bg: 'bg-gradient-to-r from-orange-400 to-red-500' },
  { name: 'Cosmic Magenta', value: 'from-purple-400 to-pink-500', bg: 'bg-gradient-to-r from-purple-400 to-pink-500' },
  { name: 'Hot Rose', value: 'from-red-500 to-rose-600', bg: 'bg-gradient-to-r from-red-500 to-rose-600' },
  { name: 'Volcanic Ash', value: 'from-gray-600 to-slate-800', bg: 'bg-gradient-to-r from-gray-600 to-slate-800' },
];

const POPULAR_ICONS = [
  'Sparkles', 'Timer', 'Activity', 'HardDrive', 'Shield', 'Zap', 'Settings', 'Database',
  'Globe', 'Terminal', 'Heart', 'Cpu', 'Layers', 'Lock', 'Code', 'Award', 'Columns', 'ShoppingCart'
];

// Reusable elegant tooltip component
const InfoTooltip = ({ content }: { content: string }) => {
  return (
    <div className="group relative inline-block ml-1.5 align-middle cursor-help">
      <Icons.HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-blue-400 transition-colors inline" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none duration-250 z-50 leading-relaxed font-normal normal-case tracking-normal">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
};

export default function FeatureForm({
  initialFeature,
  isEditing,
  onSubmit,
  onCancel,
  categories,
  onAddCategoryClick,
  isSaving,
}: FeatureFormProps) {
  const [feature, setFeature] = useState<Partial<Feature>>({
    title: '',
    description: '',
    iconName: 'Sparkles',
    color: 'from-blue-500 to-indigo-500',
    useCase: '',
    active: true,
    category: 'general',
    testimonialQuote: '',
    testimonialAuthor: '',
    testimonialRole: '',
    realWorldCase1Title: '',
    realWorldCase1Subtitle: '',
    realWorldCase1Desc: '',
    realWorldCase1Tag: '',
    realWorldCase2Title: '',
    realWorldCase2Subtitle: '',
    realWorldCase2Desc: '',
    realWorldCase2Tag: '',
    realWorldCase3Title: '',
    realWorldCase3Subtitle: '',
    realWorldCase3Desc: '',
    realWorldCase3Tag: '',
    videoUrl: '',
    videoPoster: '',
    gallery: [],
    systemCompatibility: '',
    tutorialVideos: [],
    ...initialFeature,
  });

  const [activeTab, setActiveTab] = useState<'general' | 'details' | 'media'>('general');
  const [iconSearch, setIconSearch] = useState('');
  const [showIconChooser, setShowIconChooser] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(true);

  // Auto-migrate original single video format into the first tutorial Video object for backwards safety
  useEffect(() => {
    if ((!feature.tutorialVideos || feature.tutorialVideos.length === 0) && (feature.videoUrl || feature.videoPoster)) {
      setFeature(prev => ({
        ...prev,
        tutorialVideos: [
          {
            id: 'video-1',
            title: '1. Feature Demo and Configuration Guide',
            url: prev.videoUrl || '',
            poster: prev.videoPoster || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200'
          }
        ]
      }));
    }
  }, []);

  // Migrate 3-fixed-scenario-cases into realWorldPillars array if not already done, and default to 1 card
  useEffect(() => {
    if (!feature.realWorldPillars || feature.realWorldPillars.length === 0) {
      const initialPillars = [];
      if (feature.realWorldCase1Title) {
        initialPillars.push({
          title: feature.realWorldCase1Title || '',
          subtitle: feature.realWorldCase1Subtitle || '',
          description: feature.realWorldCase1Desc || '',
          tag: feature.realWorldCase1Tag || '',
          link: ''
        });
      }
      if (feature.realWorldCase2Title) {
        initialPillars.push({
          title: feature.realWorldCase2Title || '',
          subtitle: feature.realWorldCase2Subtitle || '',
          description: feature.realWorldCase2Desc || '',
          tag: feature.realWorldCase2Tag || '',
          link: ''
        });
      }
      if (feature.realWorldCase3Title) {
        initialPillars.push({
          title: feature.realWorldCase3Title || '',
          subtitle: feature.realWorldCase3Subtitle || '',
          description: feature.realWorldCase3Desc || '',
          tag: feature.realWorldCase3Tag || '',
          link: ''
        });
      }

      if (initialPillars.length === 0) {
        // Start with exactly ONE empty card case
        initialPillars.push({
          title: '',
          subtitle: '',
          description: '',
          tag: '',
          link: ''
        });
      }

      setFeature(prev => ({ ...prev, realWorldPillars: initialPillars }));
    }
  }, []);

  const fullDescRef = useRef<HTMLTextAreaElement>(null);
  const visualEditorRef = useRef<HTMLDivElement>(null);
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaTab, setMediaTab] = useState<'upload' | 'library'>('library');

  // Multi-theme gorgeous media assets for classic WP integration
  const wpDemoAssets = [
    { name: 'Query Builder Screen', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800', desc: 'Analytical dashboard for faceted WordPress sorting grids' },
    { name: 'WooCommerce Store Catalog', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800', desc: 'Listing grids overlaying Dynamic post status badges' },
    { name: 'Dynamic Field Admin Panel', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800', desc: 'WP database parameters and meta field control layouts' },
    { name: 'Interactive Location Directory', url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800', desc: 'Real-estate card lists utilizing automated expiration timelines' },
    { name: 'Meta Fields Setup Guide', url: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=800', desc: 'Developer integration layouts for JetEngine and ACF' }
  ];

  // Keep the visual contentEditable synced with raw state when switching modes or loading feature items
  useEffect(() => {
    if (editorMode === 'visual' && visualEditorRef.current) {
      visualEditorRef.current.innerHTML = feature.fullDescription || '';
    }
  }, [editorMode, feature.id]);

  const handleVisualInput = () => {
    if (visualEditorRef.current) {
      const html = visualEditorRef.current.innerHTML;
      setFeature(prev => ({ ...prev, fullDescription: html }));
    }
  };

  const handleVisualBlur = () => {
    if (visualEditorRef.current) {
      const html = visualEditorRef.current.innerHTML;
      setFeature(prev => ({ ...prev, fullDescription: html }));
    }
  };

  const handleToggleMode = (mode: 'visual' | 'code') => {
    if (mode === editorMode) return;
    
    if (editorMode === 'visual' && visualEditorRef.current) {
      const html = visualEditorRef.current.innerHTML;
      setFeature(prev => ({ ...prev, fullDescription: html }));
    }
    
    setEditorMode(mode);
  };

  const executeVisualCommand = (command: string, value: string = '') => {
    if (visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand(command, false, value);
      handleVisualInput();
    }
  };

  const insertMediaToPost = (url: string) => {
    if (editorMode === 'code') {
      const textarea = fullDescRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const imgTag = `\n<img src="${url}" alt="WordPress Asset" />\n`;
      const newText = text.substring(0, start) + imgTag + text.substring(end);
      setFeature(prev => ({ ...prev, fullDescription: newText }));
      setShowMediaLibrary(false);
      setTimeout(() => {
        textarea.focus();
        const cursor = start + imgTag.length;
        textarea.setSelectionRange(cursor, cursor);
      }, 50);
    } else {
      if (visualEditorRef.current) {
        visualEditorRef.current.focus();
        // Standard rich editor insertion
        document.execCommand('insertImage', false, url);
        setShowMediaLibrary(false);
        handleVisualInput();
      }
    }
  };

  const insertHtmlTag = (tagType: string) => {
    const textarea = fullDescRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = '';
    switch (tagType) {
      case 'bold':
        replacement = `<strong>${selectedText || 'Text'}</strong>`;
        break;
      case 'italic':
        replacement = `<em>${selectedText || 'Text'}</em>`;
        break;
      case 'bullet':
        replacement = `\n<ul>\n  <li>${selectedText || 'Item 1'}</li>\n  <li>${selectedText ? '' : 'Item 2'}</li>\n</ul>\n`;
        break;
      case 'quote':
        replacement = `<blockquote>${selectedText || 'Quote citation'}</blockquote>`;
        break;
      case 'link':
        const url = prompt("Enter link URL:", "https://");
        if (url) {
          replacement = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${selectedText || 'Link'}</a>`;
        } else {
          return;
        }
        break;
      case 'p':
        replacement = `<p>${selectedText || 'Paragraph content'}</p>`;
        break;
      default:
        return;
    }

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setFeature(prev => ({ ...prev, fullDescription: newText }));

    // Refocus and select
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const addDeploymentPillar = () => {
    const list = feature.realWorldPillars || [];
    setFeature(prev => ({
      ...prev,
      realWorldPillars: [
        ...list,
        { title: '', subtitle: '', description: '', tag: '', link: '' }
      ]
    }));
  };

  const handlePillarChange = (index: number, key: string, val: string) => {
    const list = [...(feature.realWorldPillars || [])];
    if (list[index]) {
      list[index] = { ...list[index], [key]: val };
    }
    
    // Also keep backward compatibility synced up to Case 1, 2, 3
    const updates: Partial<Feature> = { realWorldPillars: list };
    if (index === 0 && list[0]) {
      updates.realWorldCase1Title = list[0].title;
      updates.realWorldCase1Subtitle = list[0].subtitle;
      updates.realWorldCase1Desc = list[0].description;
      updates.realWorldCase1Tag = list[0].tag;
    } else if (index === 1 && list[1]) {
      updates.realWorldCase2Title = list[1].title;
      updates.realWorldCase2Subtitle = list[1].subtitle;
      updates.realWorldCase2Desc = list[1].description;
      updates.realWorldCase2Tag = list[1].tag;
    } else if (index === 2 && list[2]) {
      updates.realWorldCase3Title = list[2].title;
      updates.realWorldCase3Subtitle = list[2].subtitle;
      updates.realWorldCase3Desc = list[2].description;
      updates.realWorldCase3Tag = list[2].tag;
    }
    
    setFeature(prev => ({ ...prev, ...updates }));
  };

  const removeDeploymentPillar = (index: number) => {
    const list = (feature.realWorldPillars || []).filter((_, i) => i !== index);
    const updates: Partial<Feature> = { realWorldPillars: list };
    if (index === 0) {
      updates.realWorldCase1Title = '';
      updates.realWorldCase1Subtitle = '';
      updates.realWorldCase1Desc = '';
      updates.realWorldCase1Tag = '';
    } else if (index === 1) {
      updates.realWorldCase2Title = '';
      updates.realWorldCase2Subtitle = '';
      updates.realWorldCase2Desc = '';
      updates.realWorldCase2Tag = '';
    } else if (index === 2) {
      updates.realWorldCase3Title = '';
      updates.realWorldCase3Subtitle = '';
      updates.realWorldCase3Desc = '';
      updates.realWorldCase3Tag = '';
    }
    setFeature(prev => ({ ...prev, ...updates }));
  };

  // Filter Lucide icons by text search
  const filteredIcons = POPULAR_ICONS.filter(icon => 
    icon.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(feature);
  };

  const handlePresetSelect = (val: string) => {
    setFeature(prev => ({ ...prev, color: val }));
  };

  const handleIconSelect = (iconName: string) => {
    setFeature(prev => ({ ...prev, iconName }));
    setShowIconChooser(false);
  };

  // Video playlist action helpers
  const addVideoPlaylistSlot = () => {
    const list = feature.tutorialVideos || [];
    const newIdx = list.length + 1;
    setFeature(prev => ({
      ...prev,
      tutorialVideos: [
        ...list,
        {
          id: `vid-${Date.now()}`,
          title: `${newIdx}. Walkthrough Guide`,
          url: '',
          poster: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200'
        }
      ]
    }));
  };

  const handleVideoSlotChange = (index: number, key: string, val: string) => {
    const list = [...(feature.tutorialVideos || [])];
    list[index] = { ...list[index], [key]: val };
    
    // Also sync back the first child to legacy keys for compatibility support
    const updates: Partial<Feature> = { tutorialVideos: list };
    if (index === 0) {
      if (key === 'url') updates.videoUrl = val;
      if (key === 'poster') updates.videoPoster = val;
    }
    
    setFeature(prev => ({ ...prev, ...updates }));
  };

  const removeVideoSlot = (index: number) => {
    const list = (feature.tutorialVideos || []).filter((_, i) => i !== index);
    setFeature(prev => ({ ...prev, tutorialVideos: list }));
  };

  const isSvgIcon = feature.iconName?.trim().startsWith('<svg') || feature.iconName?.includes('<svg') || feature.iconName?.includes('xmlns=');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-white relative" id="feature-form-container">
      {/* Left Sidebar: Sticky Real-time Feature Card Preview */}
      <div className="lg:col-span-4 order-last lg:order-first">
        <div className="sticky top-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-widest flex items-center gap-1.5 font-mono">
              <Icons.Eye className="w-3.5 h-3.5 text-blue-400" /> Real-time UX Preview
            </span>
            <button 
              type="button"
              onClick={() => setPreviewExpanded(!previewExpanded)}
              className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
            >
              {previewExpanded ? 'Collapse Context' : 'Expand Context'}
            </button>
          </div>

          {/* Real-time Renderer Card */}
          <div className="group p-6 sm:p-8 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-slate-700/80 transition-all duration-300 flex flex-col relative overflow-hidden select-none shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
            
            {/* Corner Badge */}
            <div className="absolute top-4 right-4 bg-slate-950/80 border border-slate-800 px-2 py-0.6 rounded-full text-[9px] font-semibold text-slate-400 tracking-wider uppercase">
              {categories.find(c => c.id === feature.category)?.name || 'General'}
            </div>

            {/* Header elements */}
            <div className="flex items-center gap-3.5 mt-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${feature.color || 'from-blue-500 to-indigo-500'} bg-opacity-20 shadow-md relative z-10`}>
                {isSvgIcon ? (
                  <div 
                    className="w-5 h-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-current [&>svg]:stroke-[2] text-white"
                    dangerouslySetInnerHTML={{ __html: feature.iconName || '' }}
                  />
                ) : (
                  (() => {
                    const IconComponent = (Icons as any)[feature.iconName || 'Sparkles'] || Icons.HelpCircle;
                    return <IconComponent className="w-5 h-5 text-white drop-shadow" />;
                  })()
                )}
              </div>
              
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {feature.title || 'New Dynamic Feature'}
              </h3>
            </div>

            {/* Content Preview */}
            <div className="mt-4 flex-1 flex flex-col">
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description || 'Provide a highly engaging, readable copy describing what this feature does...'}
              </p>

              <AnimatePresence initial={false}>
                {previewExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-4 border-t border-slate-850">
                      <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 font-mono">
                        ACTUAL USE CASE SCENARIO
                      </span>
                      <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-850 text-xs text-slate-300 leading-relaxed">
                        {feature.useCase || 'Write a detailed scenario illustrating real-world values for site admins...'}
                      </div>

                      {((feature.tutorialVideos && feature.tutorialVideos.length > 0) || feature.testimonialQuote) && (
                        <div className="mt-4 pt-3 border-t border-slate-850 border-dashed space-y-2">
                          {feature.tutorialVideos && feature.tutorialVideos.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10 w-fit font-mono">
                              <Icons.PlayCircle className="w-3.5 h-3.5" /> Tutorial Playlist ({feature.tutorialVideos.length} Videos)
                            </div>
                          )}
                          {feature.testimonialQuote && (
                            <p className="text-[10px] italic text-slate-450 border-l-2 border-slate-800 pl-2 leading-relaxed">
                              "{feature.testimonialQuote.substring(0, 65)}..."
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Preview Status Bar */}
            <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-850 text-[10px] text-slate-550 font-mono">
              <span>Status: {feature.active ? '🟢 Published' : '🟡 Draft Mode'}</span>
              <span>Type: {isSvgIcon ? 'Custom Vector' : 'Lucide Font'}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-850/60 text-xs text-slate-400 space-y-1.5 leading-relaxed">
            <span className="font-bold text-slate-350 block font-mono">🎨 LIVE COMPATIBILITY SYNC</span>
            All fields automatically sync step-by-step. Toggle elements above to view layouts on the public showcase tables instantly.
          </div>
        </div>
      </div>

      {/* Right Content Column: Custom Overhauled Form */}
      <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-950 border border-slate-850/80 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 via-sky-450 to-indigo-600" />

          {/* Form Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-900 gap-4 mb-8">
            <div>
              <h4 className="font-extrabold text-white text-lg flex items-center gap-2">
                <span className="w-2 rounded-full h-2 bg-blue-550 animate-pulse" />
                {isEditing ? 'Modify Feature Card Details' : 'Design New Feature Card'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Design stunning showcase integrations with multi-step structured data.
              </p>
            </div>
            <button 
              type="button" 
              onClick={onCancel}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Icons.ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
              Cancel & Return
            </button>
          </div>

          {/* Premium Step Switcher */}
          <div className="flex border-b border-slate-900 mb-8 gap-1.5 p-1 bg-slate-900/50 rounded-xl">
            {[
              { id: 'general', label: '1. 📝 General Info', tooltip: 'Setup identity, core text, colors and card layout styles' },
              { id: 'details', label: '2. ⚙️ Details & Compatibility', tooltip: 'Modify details page use cases, custom requirements and screenshots' },
              { id: 'media', label: '3. 🎥 Showcases & Proofs', tooltip: 'Build tutorials playlist, customer feedbacks and deployments' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex-1 py-3 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-form-tab"
                    className="absolute inset-0 bg-blue-600 rounded-lg -z-10 shadow-lg shadow-blue-500/25"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span>{tab.label}</span>
                <InfoTooltip content={tab.tooltip} />
              </button>
            ))}
          </div>

          {/* Form Step Contents */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-8"
            >
              
              {/* STEP 1: GENERAL INFO & BRANDING */}
              {activeTab === 'general' && (
                <div className="space-y-8">
                  {/* Identity Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-900/60">
                    <div className="space-y-2">
                      <label className="block text-xs uppercase font-extrabold text-slate-400 font-mono tracking-wider">
                        Feature Card Title
                        <InfoTooltip content="The prominent title shown on the landing table cards and showcase details header." />
                      </label>
                      <input 
                        type="text"
                        value={feature.title || ''}
                        onChange={(e) => setFeature({ ...feature, title: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-all focus:ring-1 focus:ring-blue-550"
                        placeholder="e.g. JetEngine Dynamic Auto-Transition"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs uppercase font-extrabold text-slate-400 font-mono tracking-wider">
                          Feature Category
                          <InfoTooltip content="Categorize features to allow visitors to filter elements easily." />
                        </label>
                        <button
                          type="button"
                          onClick={() => onAddCategoryClick(isEditing ? 'edit' : 'new')}
                          className="text-[10px] text-emerald-400 hover:text-emerald-355 flex items-center gap-1 font-semibold cursor-pointer py-0.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                        >
                          <Icons.Plus className="w-3 h-3 text-emerald-400" />
                          <span>Quick Create</span>
                        </button>
                      </div>
                      <select 
                        value={feature.category || 'general'}
                        onChange={(e) => setFeature({ ...feature, category: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Highlights color swatch */}
                  <div className="space-y-4 pb-6 border-b border-slate-900/60">
                    <div>
                      <span className="block text-xs uppercase font-extrabold text-slate-400 font-mono tracking-wider">
                        Aesthetic Highlight Theme
                        <InfoTooltip content="Apply a luxurious color swatch gradient tone to decorate core icons and highlight borders." />
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {PRESET_GRADIENTS.map((preset) => {
                        const isSelected = feature.color === preset.value;
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handlePresetSelect(preset.value)}
                            className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.01] flex flex-col justify-between h-20 relative cursor-pointer ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500' 
                                : 'border-slate-850 bg-slate-900/40 hover:border-slate-755'
                            }`}
                          >
                            <span className="text-[11px] font-bold text-white block truncate">{preset.name}</span>
                            <div className="flex items-center justify-between w-full mt-2">
                              <div className={`w-12 h-3.5 rounded-md ${preset.bg} border border-white/10`} />
                              {isSelected && (
                                <Icons.CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[11px] text-slate-450 font-semibold font-mono uppercase tracking-wider">Custom Swatch Tailwind Class Name</label>
                      <input 
                        type="text"
                        value={feature.color || ''}
                        onChange={(e) => setFeature({ ...feature, color: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                        placeholder="from-blue-500 to-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Icon section */}
                  <div className="space-y-4 pb-6 border-b border-slate-900/60">
                    <div className="flex items-center justify-between">
                      <span className="block text-xs uppercase font-extrabold text-slate-400 font-mono tracking-wider">
                        Feature Icon Identity
                        <InfoTooltip content="Set the primary vector icon. Browse standard presets, type Lucide fonts, or drop customized inline XML SVGs." />
                      </span>
                      <a 
                        href="https://lucide.dev" 
                        target="_blank" 
                        rel="noreferrer noopener"
                        className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 font-semibold hover:text-blue-300"
                      >
                        <Icons.Globe className="w-3 h-3" />
                        Browse Lucide Directory
                      </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-8 space-y-1.5">
                        <textarea 
                          rows={2}
                          value={feature.iconName || 'Sparkles'}
                          onChange={(e) => setFeature({ ...feature, iconName: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-blue-500 resize-none transition-all"
                          placeholder="e.g. Sparkles, Timer, Cpu, or Drop standard RAW <svg> code here..."
                        />
                      </div>
                      
                      <div className="md:col-span-4 flex gap-3 h-14 items-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-xl">
                          {isSvgIcon ? (
                            <div 
                              className="w-5 h-5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-current [&>svg]:stroke-[2] text-blue-400"
                              dangerouslySetInnerHTML={{ __html: feature.iconName || '' }}
                            />
                          ) : (
                            (() => {
                              const IconComponent = (Icons as any)[feature.iconName || 'Sparkles'] || Icons.HelpCircle;
                              return <IconComponent className="w-5 h-5 text-blue-400" />;
                            })()
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowIconChooser(!showIconChooser)}
                          className="flex-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-300 hover:text-white transition-all text-xs font-bold py-2.5 px-3 flex items-center justify-center gap-1.5 h-12 cursor-pointer"
                        >
                          <Icons.Search className="w-4 h-4 text-slate-450" />
                          <span>Browse Directory</span>
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {showIconChooser && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden p-4 rounded-xl bg-slate-900/40 border border-slate-850 space-y-3"
                        >
                          <div className="flex items-center gap-2">
                            <input 
                              type="text"
                              value={iconSearch}
                              onChange={(e) => setIconSearch(e.target.value)}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-550 placeholder-slate-600"
                              placeholder="Type to filter Lucide vector badges..."
                            />
                            {iconSearch && (
                              <button
                                type="button"
                                onClick={() => setIconSearch('')}
                                className="text-[10px] text-slate-500 hover:text-white"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                            {filteredIcons.map(item => {
                              const Comp = (Icons as any)[item] || Icons.HelpCircle;
                              const isIconActive = feature.iconName === item;
                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => handleIconSelect(item)}
                                  className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 hover:bg-slate-950/80 transition-all cursor-pointer ${
                                    isIconActive 
                                      ? 'border-blue-550 bg-blue-500/10 text-white' 
                                      : 'border-slate-850 bg-slate-950/30 text-slate-400 hover:text-white hover:border-slate-750'
                                  }`}
                                  title={item}
                                >
                                  <Comp className="w-4 h-4 stroke-[2]" />
                                  <span className="text-[8px] font-mono whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">{item}</span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Tagline */}
                  <div className="space-y-2 pb-6 border-b border-slate-900/60">
                    <label className="block text-xs uppercase font-extrabold text-slate-400 font-mono tracking-wider">
                      Card Tagline Description
                      <InfoTooltip content="A highly condensed, scannable, engaging summary text printed directly inside general grids of feature boxes." />
                    </label>
                    <textarea 
                      value={feature.description || ''}
                      onChange={(e) => setFeature({ ...feature, description: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-sm h-24 focus:outline-none focus:border-blue-500 resize-none transition-all"
                      placeholder="Write a clear, concise tagline (preferably 2-3 lines of text)..."
                      required
                    />
                  </div>

                  {/* Detailed Use Case text area (Moved to First Step) */}
                  <div className="space-y-2 pb-6 border-b border-slate-900/60">
                    <label className="block text-xs uppercase font-extrabold text-slate-400 font-mono tracking-wider">
                      Detailed Real-World Use Case Action
                      <InfoTooltip content="Describe exactly how admins or customers interact with and trigger this booster feature under actual WordPress setup." />
                    </label>
                    <textarea 
                      value={feature.useCase || ''}
                      onChange={(e) => setFeature({ ...feature, useCase: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-sm h-28 focus:outline-none focus:border-blue-500 resize-none transition-all"
                      placeholder="Describe target triggers, hook timings or actions where site operators gain value..."
                      required
                    />
                  </div>

                  {/* Status Toggle Block */}
                  <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-850 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-extrabold text-white block">Publishing Status</span>
                      <span className="text-[11px] text-slate-400">Keep feature in Draft mode or instantly publish globally to the plugin directory.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={feature.active !== false}
                        onChange={(e) => setFeature({ ...feature, active: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 2: DETAILS PAGE FIELDS, COMPATIBILITY & GALLERY */}
              {activeTab === 'details' && (
                <div className="space-y-8">
                  {/* WordPress Classic Rich Text Editor for Detailed Plugin Description */}
                  <div className="space-y-4 pb-6 border-b border-slate-900/60">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs uppercase font-extrabold text-slate-400 font-mono tracking-wider">
                        Full Plugin Description (WordPress Editor Mode)
                        <InfoTooltip content="Add deep details, user instructions, setup guides or features list using classic formatting controls." />
                      </label>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Rich Visual & HTML Mode</span>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl transition-all relative">
                      
                      {/* Editor Sub-Header Row with "Add Media" and "Visual/Code Tabs" */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900 border-b border-slate-850 px-4 py-3 selection:bg-blue-600/30">
                        {/* Add media button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowMediaLibrary(!showMediaLibrary)}
                            className="bg-white/5 hover:bg-white/10 text-white/90 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          >
                            <Icons.Image className="w-3.5 h-3.5 text-blue-400" />
                            <span>Add media</span>
                          </button>
                        </div>

                        {/* Editor Mode Tabs (Visual vs Code) */}
                        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-850">
                          <button
                            type="button"
                            onClick={() => handleToggleMode('visual')}
                            className={`px-3.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${editorMode === 'visual' ? 'bg-slate-850 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                          >
                            Visual
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleMode('code')}
                            className={`px-3.5 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${editorMode === 'code' ? 'bg-slate-850 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                          >
                            Code
                          </button>
                        </div>
                      </div>

                      {/* WordPress Toolbar strip (Only shown or adapted depending on modes) */}
                      <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/60 border-b border-slate-850/80 px-4 py-2 select-none">
                        
                        {/* Visual mode format dropdown block */}
                        {editorMode === 'visual' ? (
                          <div className="flex items-center gap-1">
                            <select
                              onChange={(e) => executeVisualCommand('formatBlock', e.target.value)}
                              defaultValue="<p>"
                              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-[10px] focus:outline-none cursor-pointer"
                            >
                              <option value="<p>">Paragraph</option>
                              <option value="<h1>">Heading 1</option>
                              <option value="<h2>">Heading 2</option>
                              <option value="<h3>">Heading 3</option>
                              <option value="<h4>">Heading 4</option>
                              <option value="<pre>">Preformatted</option>
                              <option value="<blockquote>">Blockquote Tag</option>
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => insertHtmlTag('p')}
                              className="bg-slate-950 hover:bg-slate-850 border border-slate-800 px-2 py-1 rounded text-slate-400 text-[10px] font-mono"
                              title="Paragraph tag"
                            >
                              &lt;p&gt;
                            </button>
                          </div>
                        )}

                        <div className="w-px h-4 bg-slate-800 mx-1" />

                        {/* Bold & Italic */}
                        <button 
                          type="button" 
                          onClick={() => editorMode === 'visual' ? executeVisualCommand('bold') : insertHtmlTag('bold')} 
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-850 transition-all text-xs font-black font-mono w-7 h-7 flex items-center justify-center border border-slate-900" 
                          title="Bold Text (<strong>)"
                        >
                          B
                        </button>
                        <button 
                          type="button" 
                          onClick={() => editorMode === 'visual' ? executeVisualCommand('italic') : insertHtmlTag('italic')} 
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-850 transition-all text-xs font-serif italic w-7 h-7 flex items-center justify-center border border-slate-900" 
                          title="Italic Text (<em>)"
                        >
                          I
                        </button>

                        {/* List buttons */}
                        <button 
                          type="button" 
                          onClick={() => editorMode === 'visual' ? executeVisualCommand('insertUnorderedList') : insertHtmlTag('bullet')} 
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-850 transition-all border border-slate-900" 
                          title="Bullet List (<ul>/<li>)"
                        >
                          <Icons.List className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => editorMode === 'visual' ? executeVisualCommand('insertOrderedList') : insertHtmlTag('bullet')} 
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-850 transition-all border border-slate-900" 
                          title="Numbered List (<ol>/<li>)"
                        >
                          <Icons.ListOrdered className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-px h-4 bg-slate-800 mx-1" />

                        {/* Align Options (for Visual) */}
                        <button 
                          type="button" 
                          onClick={() => executeVisualCommand('justifyLeft')} 
                          disabled={editorMode !== 'visual'}
                          className={`p-1.5 rounded transition-all border border-slate-905 ${editorMode === 'visual' ? 'text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer' : 'opacity-30 cursor-not-allowed'}`} 
                          title="Align Left"
                        >
                          <Icons.AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => executeVisualCommand('justifyCenter')} 
                          disabled={editorMode !== 'visual'}
                          className={`p-1.5 rounded transition-all border border-slate-905 ${editorMode === 'visual' ? 'text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer' : 'opacity-30 cursor-not-allowed'}`} 
                          title="Align Center"
                        >
                          <Icons.AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => executeVisualCommand('justifyRight')} 
                          disabled={editorMode !== 'visual'}
                          className={`p-1.5 rounded transition-all border border-slate-905 ${editorMode === 'visual' ? 'text-slate-400 hover:text-white hover:bg-slate-850 cursor-pointer' : 'opacity-30 cursor-not-allowed'}`} 
                          title="Align Right"
                        >
                          <Icons.AlignRight className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-px h-4 bg-slate-800 mx-1" />

                        {/* Quote & Link */}
                        <button 
                          type="button" 
                          onClick={() => editorMode === 'visual' ? executeVisualCommand('formatBlock', '<blockquote>') : insertHtmlTag('quote')} 
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-850 transition-all border border-slate-900" 
                          title="Blockquote (<blockquote>)"
                        >
                          <Icons.Quote className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => editorMode === 'visual' ? executeVisualCommand('createLink') : insertHtmlTag('link')} 
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-850 transition-all border border-slate-900" 
                          title="Insert custom URL Link (<a>)"
                        >
                          <Icons.Link2 className="w-3.5 h-3.5" />
                        </button>
                        
                        {editorMode === 'visual' && (
                          <button 
                            type="button" 
                            onClick={() => executeVisualCommand('removeFormat')} 
                            className="p-1.5 rounded text-slate-405 hover:text-white hover:bg-slate-850 transition-all border border-slate-900" 
                            title="Clear formatting"
                          >
                            <Icons.Eraser className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* MEDIA LIBRARY OVERLAY PANEL */}
                      <AnimatePresence>
                        {showMediaLibrary && (
                          <motion.div 
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="bg-slate-900 border-b border-slate-800 p-4 space-y-4 select-none relative z-10"
                          >
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              {/* Media tabs */}
                              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850">
                                <button
                                  type="button"
                                  onClick={() => setMediaTab('library')}
                                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${mediaTab === 'library' ? 'bg-slate-850 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                  WP Media Library
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setMediaTab('upload')}
                                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${mediaTab === 'upload' ? 'bg-slate-850 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                  Upload Files
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => setShowMediaLibrary(false)}
                                className="p-1 text-slate-450 hover:text-white bg-slate-950 rounded border border-slate-850 cursor-pointer"
                              >
                                <Icons.X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Library list */}
                            {mediaTab === 'library' ? (
                              <div className="space-y-3">
                                <span className="text-[10px] text-slate-400 font-mono block">SELECT AN INTEGRATED SCREENSHOT / SCHEMATIC BLOCK AND CLICK TO INSERT INSIDE POST CONTENT:</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-1">
                                  {wpDemoAssets.map((asset, idx) => (
                                    <div 
                                      key={idx}
                                      onClick={() => insertMediaToPost(asset.url)}
                                      className="group/media p-2 bg-slate-950 rounded-xl border border-slate-850 hover:border-blue-500 cursor-pointer transition-all flex flex-col justify-between"
                                    >
                                      <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
                                        <img 
                                          src={asset.url} 
                                          alt={asset.name} 
                                          className="w-full h-full object-cover group-hover/media:scale-105 transition-transform" 
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
                                          <Icons.Plus className="w-5 h-5 text-white" />
                                        </div>
                                      </div>
                                      <div className="pt-2">
                                        <span className="block text-[11px] font-bold text-white truncate">{asset.name}</span>
                                        <span className="block text-[9px] text-slate-500 line-clamp-1">{asset.desc}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-850/80 space-y-4">
                                <div className="space-y-1">
                                  <label className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">Upload New Image Binary</label>
                                  <p className="text-[9px] text-slate-500 leading-normal">Drag and drop high-contrast diagram assets here to upload. They will auto-generate CDN links that insert directly inside WordPress visuals.</p>
                                </div>

                                <ImageUploader
                                  onUploadSuccess={(url) => insertMediaToPost(url)}
                                  compact={false}
                                  historyKey="wordpress_media_uploads"
                                />
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* TEXT EDIT AREAS (VISUAL SHEETS VS MONOSPACED RAW MARKUP) */}
                      {editorMode === 'visual' ? (
                        <div className="bg-white p-6 relative">
                          <span className="absolute right-4 bottom-4 text-[9px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded pointer-events-none select-none z-10">CLASSIC EDITOR CANVAS</span>
                          <div
                            ref={visualEditorRef}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={handleVisualBlur}
                            onInput={handleVisualInput}
                            className="w-full text-slate-850 bg-white min-h-[300px] max-h-[480px] overflow-y-auto focus:outline-none text-xs text-left leading-relaxed font-sans prose prose-slate
                              [&_img]:max-w-[70%] [&_img]:mx-auto [&_img]:block [&_img]:my-4 [&_img]:rounded-xl [&_img]:border [&_img]:border-slate-200 [&_img]:shadow-md
                              [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:text-slate-550 [&_blockquote]:bg-slate-50 [&_blockquote]:py-1
                              [&_strong]:font-bold [&_strong]:text-slate-900"
                            placeholder="Type WordPress walkthrough instructions here visually, format text, blockquote or add media..."
                          />
                        </div>
                      ) : (
                        <textarea 
                          ref={fullDescRef}
                          value={feature.fullDescription || ''}
                          onChange={(e) => setFeature({ ...feature, fullDescription: e.target.value })}
                          className="w-full bg-slate-950 p-5 text-white text-xs font-mono h-[320px] focus:outline-none resize-y leading-relaxed"
                          placeholder="Provide detailed explanations, instructions, custom lists, or HTML layouts. E.g. <strong>Advanced Features</strong> <p>This addon unlocks real-time status syncing...</p>"
                        />
                      )}
                    </div>
                  </div>

                  {/* Requirements Compatibility Matrix */}
                  <div className="space-y-3 pb-6 border-b border-slate-900/60">
                    <div className="space-y-1">
                      <label className="block text-xs uppercase font-extrabold text-slate-400 font-mono tracking-wider">
                        System Requirements & Compatibility
                        <InfoTooltip content="Each line creates an item on the page's Requirements Sidebar table. Use the format: 'Requirement Name | Status Badge'. Keep empty to fallback automatically to standard defaults." />
                      </label>
                      <p className="text-[11px] text-slate-450 font-medium">Use the pattern: <code>Requirement Label | Value Badge Status</code> (one item per line)</p>
                    </div>

                    <textarea 
                      value={feature.systemCompatibility || ''}
                      onChange={(e) => setFeature({ ...feature, systemCompatibility: e.target.value })}
                      rows={5}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl p-4 text-white text-xs font-mono h-32 focus:outline-none focus:border-blue-500 leading-relaxed"
                      placeholder={`JetEngine custom CPTs | Required ✅\nElementor Page Builder | Works with Free ✅\nWooCommerce Shop Integration | Fully Compatible ✅\nAutomatic Transition Hook | Out of Box ✅`}
                    />

                    {/* Pre-fill default button */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setFeature({
                            ...feature,
                            systemCompatibility: "JetEngine custom post types | Required ✅\nElementor Page Builder | Optional (Works with Free) ✅\nWooCommerce Products integrations | Fully Integrated ✅\nDynamic visibility triggers | Enabled out of the box ✅"
                          });
                        }}
                        className="text-[10px] text-blue-400 border border-blue-900 bg-blue-950/20 px-3 py-1 rounded-lg hover:bg-blue-900/20 hover:text-blue-300 transition-all cursor-pointer"
                      >
                        Reset/Fill Default Compatibility Values
                      </button>
                    </div>
                  </div>

                  {/* Image Gallery Uploader */}
                  <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-850/85 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icons.Image className="w-4 h-4 text-amber-500" />
                        <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">Interface Screenshots Gallery</span>
                        <InfoTooltip content="Showcase the actual dashboard views or templates built with this feature. Drag/upload or drop up to 6 screenshots." />
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{(feature.gallery || []).length} of 6 Uploaded</span>
                    </div>

                    {feature.gallery && feature.gallery.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {feature.gallery.map((imgUrl, i) => (
                          <div key={i} className="group relative rounded-xl overflow-hidden aspect-video border border-slate-800 bg-slate-950">
                            <img src={imgUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const nextGallery = (feature.gallery || []).filter((_, idx) => idx !== i);
                                  setFeature({ ...feature, gallery: nextGallery });
                                }}
                                className="p-1.5 rounded-lg bg-red-650 hover:bg-red-500 text-white transition-all cursor-pointer shadow-lg"
                              >
                                <Icons.Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-800 py-6 text-center text-xs text-slate-500 rounded-xl font-mono bg-slate-950/30">
                        No custom screenshots configured. System default mockups will be displayed.
                      </div>
                    )}

                    {(!feature.gallery || feature.gallery.length < 6) && (
                      <div className="space-y-2">
                        <label className="block text-[11px] text-slate-400 font-medium">Add Image to Gallery Block</label>
                        <ImageUploader 
                          onUploadSuccess={(url) => {
                            const nextG = [...(feature.gallery || []), url];
                            setFeature({ ...feature, gallery: nextG });
                          }}
                          compact={true}
                          clearOnSuccess={true}
                          historyKey="gallery_uploads"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: PLAYLISTS, PROOFS & DEPLOYMENTS */}
              {activeTab === 'media' && (
                <div className="space-y-8 max-h-[550px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-slate-800">
                  
                  {/* Tutorial Videos Playlist Builder */}
                  <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-indigo-950/60">
                      <div className="flex items-center gap-1.5">
                        <Icons.Video className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider">Tutorial Videos Playlist</span>
                        <InfoTooltip content="Add one or more tutorial guides and configuration videos. Multiples form an interactive list playlist on the public details modal!" />
                      </div>
                      
                      <button
                        type="button"
                        onClick={addVideoPlaylistSlot}
                        className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Icons.Plus className="w-3.5 h-3.5" />
                        <span>Add Playlist Video</span>
                      </button>
                    </div>

                    {feature.tutorialVideos && feature.tutorialVideos.length > 0 ? (
                      <div className="space-y-4">
                        {feature.tutorialVideos.map((tut, index) => (
                          <div key={tut.id || index} className="p-4 rounded-xl bg-slate-950 border border-slate-850/80 space-y-4 relative group/item">
                            <button
                              type="button"
                              onClick={() => removeVideoSlot(index)}
                              className="absolute top-4 right-4 text-slate-500 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete Video from Playlist"
                            >
                              <Icons.Trash className="w-4 h-4" />
                            </button>

                            <span className="text-[10px] bg-slate-900 text-indigo-400 border border-indigo-550/20 px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider">
                              Playlist Node #{index + 1}
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="block text-[10px] text-slate-400 font-mono">Video Title</label>
                                <input 
                                  type="text"
                                  value={tut.title || ''}
                                  onChange={(e) => handleVideoSlotChange(index, 'title', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                                  placeholder="e.g. 1. Intro & Admin Column Integration"
                                  required
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="block text-[10px] text-slate-400 font-mono">Stream URL (Direct MP4 or Embed)</label>
                                <input 
                                  type="text"
                                  value={tut.url || ''}
                                  onChange={(e) => handleVideoSlotChange(index, 'url', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:indigo-indigo-500"
                                  placeholder="https://assets.mixkit.co/videos/...mp4"
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-[10px] text-slate-400 font-mono">Video Cover Poster / Thumbnail Image</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  value={tut.poster || ''}
                                  onChange={(e) => handleVideoSlotChange(index, 'poster', e.target.value)}
                                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none"
                                  placeholder="Image URL"
                                />
                                <div className="w-24 shrink-0">
                                  <ImageUploader 
                                    onUploadSuccess={(url) => handleVideoSlotChange(index, 'poster', url)}
                                    compact={true}
                                    presetUrl={tut.poster || ''}
                                    historyKey="video_poster_uploads"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-indigo-500/10 py-6 text-center text-xs text-slate-500 rounded-xl font-mono">
                        No videos configured. The sidebar will fall back on default introductory setup loops.
                      </div>
                    )}
                  </div>

                  {/* Testimonial Form Panel */}
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                    <div className="flex items-center gap-1.5">
                      <Icons.Quote className="w-4 h-4 text-blue-400" />
                      <span className="text-xs uppercase font-extrabold text-blue-400 tracking-wider">Client Testimonial Feedback</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] text-slate-400 font-medium">Testimonial Quote Text</label>
                      <textarea 
                        value={feature.testimonialQuote || ''}
                        onChange={(e) => setFeature({ ...feature, testimonialQuote: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs h-20 focus:outline-none focus:border-blue-500 resize-none"
                        placeholder="&quot;Our agency saved over 12 hours of setup this month because of these immediate columns!&quot;"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] text-slate-400 font-medium">Author Name</label>
                        <input 
                          type="text"
                          value={feature.testimonialAuthor || ''}
                          onChange={(e) => setFeature({ ...feature, testimonialAuthor: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                          placeholder="e.g. Liam Sterling"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[11px] text-slate-400 font-medium">Author Role/Job Title</label>
                        <input 
                          type="text"
                          value={feature.testimonialRole || ''}
                          onChange={(e) => setFeature({ ...feature, testimonialRole: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                          placeholder="e.g. Lead Developer, AgencyLab"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Deployments / Scenarios Dynamic Panel */}
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icons.Compass className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs uppercase font-extrabold text-slate-300 tracking-wider">Deployments & Real-world Pillars</span>
                        <InfoTooltip content="Display real-world deployment cases outlining how specific directories (e.g. Real-estate, Classifieds, Jobs) utilize this booster." />
                      </div>
                      <button
                        type="button"
                        onClick={addDeploymentPillar}
                        className="text-[10px] text-emerald-400 font-bold border border-emerald-950/80 bg-emerald-950/20 px-2.5 py-1 rounded-lg hover:bg-emerald-900/20 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-all uppercase font-mono"
                      >
                        <Icons.Plus className="w-3 h-3" />
                        <span>Add Scenario Card</span>
                      </button>
                    </div>

                    {(feature.realWorldPillars || []).map((pillar, index) => (
                      <div key={index} className="p-3.5 rounded-xl bg-slate-950 border border-slate-900 space-y-3 relative group">
                        
                        {/* Remove card button */}
                        {(feature.realWorldPillars || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDeploymentPillar(index)}
                            className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-all text-xs text-red-400 hover:text-red-300 hover:underline p-1 cursor-pointer"
                          >
                            Remove Card
                          </button>
                        )}

                        <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800/80 px-2 py-0.5 rounded font-mono font-extrabold">SCENARIO DEPLOYMENT #{index + 1}</span>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-slate-500 font-mono">Title</label>
                            <input 
                              type="text"
                              value={pillar.title || ''}
                              onChange={(e) => handlePillarChange(index, 'title', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                              placeholder="e.g. Dynamic Directories"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-slate-500 font-mono">Subtitle</label>
                            <input 
                              type="text"
                              value={pillar.subtitle || ''}
                              onChange={(e) => handlePillarChange(index, 'subtitle', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                              placeholder="e.g. Auto Expirations"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-slate-500 font-mono">Tag Badge</label>
                            <input 
                              type="text"
                              value={pillar.tag || ''}
                              onChange={(e) => handlePillarChange(index, 'tag', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                              placeholder="e.g. Classifieds"
                            />
                          </div>
                        </div>

                        {/* Case Synopsis and View Setup Link */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="col-span-1 sm:col-span-2 space-y-1">
                            <label className="block text-[10px] text-slate-400 font-mono">Case Synopsis</label>
                            <textarea 
                              value={pillar.description || ''}
                              onChange={(e) => handlePillarChange(index, 'description', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs h-14 resize-none focus:outline-none"
                              placeholder="Explain exactly how they execute checkout transitions here..."
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-slate-400 font-mono">View Live Setup (Custom Link URL)</label>
                            <input 
                              type="text"
                              value={pillar.link || ''}
                              onChange={(e) => handlePillarChange(index, 'link', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-xs focus:outline-none placeholder-slate-600"
                              placeholder="e.g. https://yourdemo.com/directory-preview"
                            />
                            <span className="text-[9px] text-slate-500 font-mono">Custom link to external setup page</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Form Actions Footer & Step Guidance */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 pt-6 border-t border-slate-900 mt-8">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={activeTab === 'general'}
                onClick={() => {
                  if (activeTab === 'media') setActiveTab('details');
                  else if (activeTab === 'details') setActiveTab('general');
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white cursor-pointer hover:border-slate-705% disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold select-none"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={activeTab === 'media'}
                onClick={() => {
                  if (activeTab === 'general') setActiveTab('details');
                  else if (activeTab === 'details') setActiveTab('media');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold select-none"
              >
                Continue →
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button 
                type="button" 
                onClick={onCancel}
                className="px-4 py-2 hover:bg-slate-900 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer font-bold"
              >
                Discard
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Icons.RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-200" />
                    <span>Syncing database...</span>
                  </>
                ) : (
                  <>
                    <Icons.Check className="w-4 h-4 text-blue-100" />
                    <span>{isEditing ? 'Save Feature Booster' : 'Publish Feature Card'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
