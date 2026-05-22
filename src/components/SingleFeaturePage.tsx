import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Check, Compass, Sparkles, Star, ChevronRight, HelpCircle, 
  Settings, Layers, Terminal, AlertTriangle, Play, RefreshCw, ShoppingCart, 
  Timer, Columns, Zap, Home, Users, LockOpen, AlertCircle, Globe, Shield, CheckCircle, Video
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useData } from '../context/DataContext';
import { Feature } from '../types';
import PremiumVideoPlayer from './PremiumVideoPlayer';

interface SingleFeaturePageProps {
  featureId: string;
  onBack: () => void;
  onNavigateToFeature: (id: string) => void;
}

export default function SingleFeaturePage({ featureId, onBack, onNavigateToFeature }: SingleFeaturePageProps) {
  const { features, pricingPlans, updateFeature } = useData();
  const topRef = useRef<HTMLDivElement>(null);
  
  // Find current feature
  const feature = features.find(f => f.id === featureId);

  // States for interactive sandbox simulators
  // Features have different states
  const [sandboxBoolean, setSandboxBoolean] = useState(true);
  const [sandboxNumber, setSandboxNumber] = useState(5);
  const [sandboxActiveStyle, setSandboxActiveStyle] = useState<'solid' | 'gradient' | 'outline'>('gradient');
  const [sandboxAccentColor, setSandboxAccentColor] = useState('emerald');
  const [demoActiveFilter, setDemoActiveFilter] = useState('all');
  const [timerProgress, setTimerProgress] = useState(100);
  const [simulatedTimeLeft, setSimulatedTimeLeft] = useState('02:44:11');

  // Trigger smooth scroll to elements
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Scroll to top on load or feature transition
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [featureId]);

  // Handle countdown intervals for timer simulation
  useEffect(() => {
    let interval: any;
    if (featureId === 'auto-transition') {
      interval = setInterval(() => {
        setSimulatedTimeLeft(prev => {
          const parts = prev.split(':').map(Number);
          let h = parts[0], m = parts[1], s = parts[2];
          s--;
          if (s < 0) {
            s = 59;
            m--;
            if (m < 0) {
              m = 59;
              h--;
              if (h < 0) {
                h = 24;
              }
            }
          }
          const pad = (n: number) => n.toString().padStart(2, '0');
          return `${pad(h)}:${pad(m)}:${pad(s)}`;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [featureId]);

  if (!feature) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 text-white">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold">Feature data not found</h3>
        <p className="text-slate-400 mt-2">The selected feature ID "{featureId}" is unavailable or disabled.</p>
        <button onClick={onBack} className="mt-6 px-4 py-2 bg-slate-800 text-white rounded-xl">Back to Homepage</button>
      </div>
    );
  }

  const IconComponent = (Icons as any)[feature.iconName] || Icons.HelpCircle;

  // Custom testimonials per feature ID
  const testimonialsMap: Record<string, { quote: string; author: string; role: string }> = {
    'auto-transition': {
      quote: "This Auto-Transition feature saved me 10 hours a week on my job board! Slots shut down automatically exact to the millisecond.",
      author: "John Doe",
      role: "Founder, WP Job Hunters"
    },
    'taxonomy-columns': {
      quote: "Seeing classifications inside WP post tables makes managing 4,000 magazine articles a beautiful breeze. Recommended!",
      author: "Evelyn Reed",
      role: "Lead Editor, TechDaily"
    },
    'stock-status': {
      quote: "My WooCommerce clients loved the immediate sold-out badges. Drastically slashed customer support emails asking about sizes.",
      author: "Mick Campbell",
      role: "WooCommerce Director, CraftFlow Agency"
    },
    'flash-sale': {
      quote: "Conversion rates peaked by 18% immediately after applying the flashing neon flash-sale badges to our Friday stock deals.",
      author: "Sarah Jenkins",
      role: "E-Commerce VP, GadgetHub"
    },
    'property-status': {
      quote: "We automatic-toggled our real estate properties. Status labels synced perfectly straight to custom map pins without lag.",
      author: "Ricardo Cruz",
      role: "CTO, Madrid Homes"
    },
    'featured-properties': {
      quote: "Paid real-estate listings sell premium placements 40% faster by keeping the high-contrast VIP badge floating elegantly.",
      author: "Samantha Black",
      role: "Ad Revenue Manager"
    },
    'applicant-count': {
      quote: "Applicants love transparency. Displaying the counter right on post cards doubled our click ratios this quarter.",
      author: "Daniel Vane",
      role: "HR Lead, BioHealth Corp"
    },
    'open-closed': {
      quote: "Our global community groups instantly verify active sessions. Displays glowing indicator rings exactly during live hours.",
      author: "Aris Thorne",
      role: "Community Manager, AlphaLabs"
    },
    'urgent-hiring': {
      quote: "Urgent tags with animated visual pulses solved our seasonal driver workforce crisis inside 48 hours.",
      author: "Karim Al-Hussain",
      role: "Recruitment Supervisor, QuickLogistics"
    },
    'remote-only': {
      quote: "A clean filter of remote-only postings kept over 10,000 developers fully engaged with our niche job directory.",
      author: "Tina Lin",
      role: "Operations Expert, DevRemote"
    }
  };

  const featureTestimonial = {
    quote: feature.testimonialQuote || testimonialsMap[feature.id]?.quote || "Integrating these custom display badges transformed how users visually explore status changes across our custom tables.",
    author: feature.testimonialAuthor || testimonialsMap[feature.id]?.author || "Alex Mercer",
    role: feature.testimonialRole || testimonialsMap[feature.id]?.role || "Senior Consultant, JetDevelopers"
  };

  // Custom Real World use cases per feature
  const realWorldCases: Record<string, Array<{ title: string; subtitle: string; description: string; tag: string }>> = {
    'auto-transition': [
      { title: "Dynamic Job Portals", subtitle: "Automate Expirations", description: "Close recruitment slots automatically when dead-lines expire without manually editing WordPress items.", tag: "Job Boards" },
      { title: "Event Listings", subtitle: "Archive Past Shows", description: "Update local music gigs and conferences into a 'Completed' status the moment the calendar date passes.", tag: "Events Directory" },
      { title: "Coupons & Deals", subtitle: "Lock Limited Promotions", description: "Instantly transition high-value promo codes to expired to prevent coupon abuse after campaign hours.", tag: "Deals Sites" }
    ],
    'taxonomy-columns': [
      { title: "News & Magazines", subtitle: "Sub-Class Tracking", description: "View both category and post taxonomy columns parallel in the WP Admin Dashboard to organize content pipelines.", tag: "Media Sites" },
      { title: "Automotive Listings", subtitle: "Car Brand Sorting", description: "Keep continuous tabs on car models, years, and categories from standard database grid sheets.", tag: "Classifieds" },
      { title: "Learning Platforms", subtitle: "Course Levels Overview", description: "Show beginner vs expert course classifiers alongside core lessons in one glance.", tag: "E-Learning" }
    ],
    'stock-status': [
      { title: "WooCommerce Apparel", subtitle: "Size Stock Notifications", description: "Overlay 'In Stock' or high-contrast 'Sold Out' badges on product gallery cards automatically.", tag: "WooCommerce" },
      { title: "Fresh Groceries Portal", subtitle: "Out of Stock Warnings", description: "Disable the Add-to-Cart drawer immediately on depletion and display a 'Back in Stock Soon' badge.", tag: "Food Delivery" },
      { title: "Limited Editions Shop", subtitle: "Low Inventory Triggers", description: "Toggle high-visibility badge when inventory slips under 5 items remaining to invoke FOMO.", tag: "Niche Boutiques" }
    ],
    'flash-sale': [
      { title: "Black Friday Push", subtitle: "High Impact Badges", description: "Attach flashing lightning badges to clearance catalogs during high-volume sales windows.", tag: "Clearance Sales" },
      { title: "Hotel Bookings", subtitle: "Deal of the Day Glows", description: "Highlight exclusive flash prices on premium hotel suites using Elementor Dynamic tags.", tag: "Travel Portals" },
      { title: "Software Bundles", subtitle: "Dynamic Expiries", description: "Show high-impact '50% Off' ribbons next to specific package columns on responsive landing tables.", tag: "SaaS Platforms" }
    ],
    'property-status': [
      { title: "Real Estate Portals", subtitle: "Available vs Rent Status", description: "Toggle statuses dynamically from agent panels to keep properties flagged 'Rented' or 'Active Sale'.", tag: "Property Listings" },
      { title: "Office Rental Space", subtitle: "Coworking Seat Tracker", description: "Update seat reservation tags in real time to prevent double-booking on premium tables.", tag: "Coworking" },
      { title: "Yacht Charters", subtitle: "Seasonal Fleet Tracker", description: "Differentiate charter yachts currently available for booking from vessels booked for maintenance.", tag: "Luxury Charters" }
    ],
    'featured-properties': [
      { title: "Premium Real Estate", subtitle: "Sponsored Gold Cards", description: "Decorate partner properties with glowing VIP ribbons to ensure high buyer view count.", tag: "Broker Directories" },
      { title: "Directory Ads Upgrade", subtitle: "Monetized Post Highlights", description: "Allow users to purchase a 'Featured Post' booster, applying visual overlays to listings dynamically.", tag: "Local Yellow Pages" },
      { title: "Bestseller Books Shelf", subtitle: "Top Pick Recommendations", description: "Elevate expert-selected items with bespoke star ratings directly above product card images.", tag: "Knowledge Bases" }
    ],
    'applicant-count': [
      { title: "High Volume Tech Jobs", subtitle: "Popularity Meters", description: "Show '124 Applicants' tags directly on postings to show candidates which roles are highly trending.", tag: "Tech Careers" },
      { title: "Freelance Gig Boards", subtitle: "Proposal Counters", description: "Let clients see active submission volumes to calibrate bidding requirements without page reloads.", tag: "Crowdsourcing" },
      { title: "University Admissions", subtitle: "Vacancy Watchers", description: "Keep track of active applicants seeking remaining openings across specific research programs.", tag: "Academic Portals" }
    ],
    'open-closed': [
      { title: "Medical & Clinics", subtitle: "Chamber Current Status", description: "Inform visitors whether a medical care center is actively consulting or closed at night.", tag: "Healthcare" },
      { title: "Restaurant Directories", subtitle: "Live Serving Alerts", description: "Synchronize store status automatically with operational time calendars to avoid customer frustration.", tag: "Food Directories" },
      { title: "Client Support Portals", subtitle: "Live Chat Status Hours", description: "Flash green 'Online' tags on helpdesk icons based on the availability of support workers.", tag: "SaaS Support" }
    ],
    'urgent-hiring': [
      { title: "Urgent Medical Shifts", subtitle: "ASAP Staff Openings", description: "Highlight immediate open positions inside clinics using high-contrast flashing emergency badges.", tag: "Hospitals Network" },
      { title: "Rider & Delivery Drivers", subtitle: "Rapid Fleet Onboarding", description: "Attract delivery workers with glowing taglines to accelerate onboarding queues.", tag: "Courier Apps" },
      { title: "Disaster Relief Staff", subtitle: "Volunteers Needed Now", description: "Post emergency volunteer roles and elevate tracking priority instantly on public bulletin boards.", tag: "Non-Profit Networks" }
    ],
    'remote-only': [
      { title: "Global Dev Directories", subtitle: "Work From Anywhere", description: "Attach digital roamer coordinates alongside opportunities to help candidates filter jobs.", tag: "Tech Recruiting" },
      { title: "Virtual Event Series", subtitle: "Fully Online Webcasts", description: "Differentiate hybrid summits from remote webcasts with customizable icon markers.", tag: "Webinar Hosts" },
      { title: "Freelance Agency Hubs", subtitle: "No Location Limits", description: "Pin remote-only gigs to listing boards to appeal to specialized target contractors.", tag: "Agency Channels" }
    ]
  };

  const dynamicCases = [];
  if (feature.realWorldCase1Title) {
    dynamicCases.push({
      title: feature.realWorldCase1Title,
      subtitle: feature.realWorldCase1Subtitle || "Deployment Setup",
      description: feature.realWorldCase1Desc || "",
      tag: feature.realWorldCase1Tag || "Custom Setup"
    });
  }
  if (feature.realWorldCase2Title) {
    dynamicCases.push({
      title: feature.realWorldCase2Title,
      subtitle: feature.realWorldCase2Subtitle || "Deployment Setup",
      description: feature.realWorldCase2Desc || "",
      tag: feature.realWorldCase2Tag || "Custom Setup"
    });
  }
  if (feature.realWorldCase3Title) {
    dynamicCases.push({
      title: feature.realWorldCase3Title,
      subtitle: feature.realWorldCase3Subtitle || "Deployment Setup",
      description: feature.realWorldCase3Desc || "",
      tag: feature.realWorldCase3Tag || "Custom Setup"
    });
  }

  const currentCases = dynamicCases.length > 0 ? dynamicCases : (realWorldCases[feature.id] || [
    { title: "Custom Database Lists", subtitle: "Interactive Tracking", description: "Sync document values instantly to represent statuses on cards.", tag: "General CPTs" },
    { title: "Dynamic Pages Layouts", subtitle: "Rich Visibility", description: "Format layout visibility on elements dynamically centered on specific status keys.", tag: "Layouts Builder" },
    { title: "Filtered Grids UI", subtitle: "Faceted Sorting", description: "Give customers sorting sliders targeting this specific metadata parameter.", tag: "Smart Filters" }
  ]);

  // Recommendations: exclude current, get 3 related active ones
  const relatedFeatures = features
    .filter(f => f.id !== feature.id && f.active)
    .slice(0, 3);

  // Core visual showcase content based on feature type
  const renderVisualSandbox = () => {
    switch (feature.id) {
      case 'auto-transition':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="text-left">
                <span className="text-[10px] text-emerald-400 font-mono font-bold block uppercase">Simulation Controller</span>
                <span className="text-xs text-slate-300 font-medium">Toggle post creation states to verify transition logic:</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setSandboxBoolean(true); 
                    setTimerProgress(100); 
                    setSimulatedTimeLeft('00:00:08');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${sandboxBoolean ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-slate-850 text-slate-400'}`}
                >
                  Active Campaign
                </button>
                <button 
                  onClick={() => {
                    setSandboxBoolean(false); 
                    setTimerProgress(0);
                    setSimulatedTimeLeft('00:00:00');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${!sandboxBoolean ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-950 border-slate-850 text-slate-400'}`}
                >
                  Trigger Expiry
                </button>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-850 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
              
              <div className="max-w-xs mx-auto space-y-4">
                <div className="flex justify-between items-center text-xs font-mono text-slate-500 pb-2 border-b border-slate-800/60">
                  <span>ID: #10429</span>
                  <span>WordPress Event Meta</span>
                </div>

                <div className="relative group p-4 rounded-xl bg-slate-950/80 border border-slate-850">
                  <span className="text-xs text-slate-400 font-mono block mb-1">Interactive React Developer Bootcamp</span>
                  <div className="text-xl font-bold text-white mb-3">Seat Registration</div>
                  
                  {sandboxBoolean ? (
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-semibold animate-pulse">
                        <Timer className="w-3.5 h-3.5" />
                        <span>Active Booking Open</span>
                      </div>
                      <div className="text-[13px] text-slate-400">
                        Registration ends in: <span className="font-mono text-blue-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{simulatedTimeLeft}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-semibold">
                        <Icons.Clock className="w-3.5 h-3.5" />
                        <span>Expired (Autoclose Active)</span>
                      </div>
                      <div className="text-xs text-slate-500 leading-normal">
                        This seat listing closed automatically on <span className="text-slate-400 font-mono">Date Passed</span>. The dynamic visibility filter has disabled checkout actions.
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulated Elementor Frontend output */}
                <div className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-left text-[11px] text-slate-400 space-y-1">
                  <div className="font-semibold text-blue-400 uppercase tracking-widest font-mono text-[9px]">JetEngine Dynamic Visibility Output</div>
                  <div>🛒 Checkout Button: <span className={sandboxBoolean ? "text-emerald-400 font-bold" : "text-slate-600 line-through font-medium"}>{sandboxBoolean ? "Visible (Clickable)" : "Hidden"}</span></div>
                  <div>📝 Waitlist Form: <span className={sandboxBoolean ? "text-slate-600 line-through font-medium" : "text-amber-400 font-bold"}>{sandboxBoolean ? "Hidden" : "Visible (Show alternative)"}</span></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'stock-status':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="text-left">
                <span className="text-[10px] text-emerald-400 font-mono font-bold block">DYNAMIC STOCK STATE</span>
                <span className="text-xs text-slate-300 font-medium">Simulate backend stock quantity value:</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {setSandboxBoolean(true); setSandboxNumber(12);}}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${sandboxBoolean ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-955 border-slate-850 text-slate-400'}`}
                >
                  Quantity (12 In Stock)
                </button>
                <button 
                  onClick={() => {setSandboxBoolean(false); setSandboxNumber(0);}}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${!sandboxBoolean ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-955 border-slate-850 text-slate-400'}`}
                >
                  Quantity (0 Sold Out)
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-850 flex flex-col items-center">
              <div className="w-full max-w-sm bg-slate-950 rounded-2xl overflow-hidden border border-slate-850 shadow-xl group">
                <div className="h-44 bg-slate-900 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop" 
                    alt="Shoes Demo" 
                    className="w-full h-full object-cover brightness-95"
                  />
                  {/* Dynamic Standalone Badge overlay */}
                  <div className="absolute top-3 left-3">
                    {sandboxBoolean ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 tracking-wider flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3" /> In Stock ({sandboxNumber})
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-600/20 tracking-wider flex items-center gap-1 uppercase">
                        Sold Out
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-[10px] text-slate-300 font-mono px-2 py-0.5 rounded">
                    $129 USD
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Speedrunner Ultra Knit</h3>
                    <p className="text-xs text-slate-400 mt-1">Responsive ergonomic cushions optimized for trail runners.</p>
                  </div>

                  {/* Dynamic visibility component based on status */}
                  <AnimatePresence mode="wait">
                    {sandboxBoolean ? (
                      <motion.button 
                        key="buy-btn"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                      >
                        Add to Cart 
                      </motion.button>
                    ) : (
                      <motion.div 
                        key="notify-form"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-2 p-1.5 rounded-xl bg-red-500/5 border border-red-500/10 text-center"
                      >
                        <p className="text-[11px] text-red-400 font-medium font-sans">Unavailable. Enter mail to join restock alert queue:</p>
                        <div className="flex gap-1.5">
                          <input type="text" placeholder="name@domain.com" disabled className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-[11px] flex-1 text-slate-400 focus:outline-none" />
                          <button className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded text-[10px] font-bold">Secure Info</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        );

      case 'property-status':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="text-left">
                <span className="text-[10px] text-emerald-400 font-mono font-bold block">REALESTATE TOGGLE LINK</span>
                <span className="text-xs text-slate-300 font-medium font-sans">Simulate sales pipeline updating:</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSandboxBoolean(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${sandboxBoolean ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-955 border-slate-850 text-slate-400'}`}
                >
                  Mark Available
                </button>
                <button 
                  onClick={() => setSandboxBoolean(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${!sandboxBoolean ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-slate-955 border-slate-850 text-slate-400'}`}
                >
                  Mark Leased / Sold
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-850 flex flex-col items-center">
              <div className="w-full max-w-sm bg-slate-950 rounded-2xl overflow-hidden border border-slate-850 shadow-xl">
                <div className="h-44 bg-slate-900 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=600&auto=format&fit=crop" 
                    alt="Apartment Demo" 
                    className="w-full h-full object-cover brightness-95"
                  />
                  {/* Dynamic Standalone Badge overlay */}
                  <div className="absolute top-3 left-3">
                    {sandboxBoolean ? (
                      <span className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-bold tracking-wider flex items-center gap-1 font-mono uppercase">
                        Available
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-lg bg-orange-600 text-white text-xs font-bold tracking-wider flex items-center gap-1 font-mono uppercase">
                        Sold Out / Rented
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Skyline Vista Penthouse</h3>
                    <p className="text-xs text-slate-400 mt-1">3 Beds • 2 Baths • Panoramic Madrid Horizon Views.</p>
                  </div>

                  <AnimatePresence mode="wait">
                    {sandboxBoolean ? (
                      <motion.button 
                        key="view-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                      >
                        Request Private Tour Booking 
                      </motion.button>
                    ) : (
                      <motion.div 
                        key="unavailable-msg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-semibold text-center text-xs"
                      >
                        ⛔ Not accepting viewings (Property Rented)
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        );

      case 'taxonomy-columns':
        return (
          <div className="space-y-4 text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="text-left">
                <span className="text-[10px] text-blue-400 font-mono font-bold block">ADMIN TABLE CONTROLLER</span>
                <span className="text-xs text-slate-300 font-medium">Toggle Custom Taxonomy columns visibility:</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSandboxBoolean(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${sandboxBoolean ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-slate-955 border-slate-850 text-slate-400'}`}
                >
                  Enabled (Show Columns)
                </button>
                <button 
                  onClick={() => setSandboxBoolean(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${!sandboxBoolean ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-955 border-slate-850 text-slate-400'}`}
                >
                  Disabled
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-855 bg-slate-900 overflow-hidden text-xs">
              <div className="bg-slate-955 border-b border-slate-855 p-3 flex justify-between items-center text-slate-450 font-mono text-[10px]">
                <span>WordPress Admin / All Posts Table</span>
                <span className="text-emerald-450 flex items-center gap-1">● Synced with Engine v2</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-900">
                      <th className="p-3 font-semibold font-mono text-[10px]">Title</th>
                      {sandboxBoolean && (
                        <>
                          <th className="p-3 font-semibold font-mono text-[10px] text-blue-400">Taxonomy: Status</th>
                          <th className="p-3 font-semibold font-mono text-[10px] text-emerald-450">Taxonomy: Region</th>
                        </>
                      )}
                      <th className="p-3 font-semibold font-mono text-[10px]">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300 font-mono text-[11px]">
                    <tr>
                      <td className="p-3 font-semibold font-sans text-white text-xs">Modern Villa, Beverly Hills</td>
                      {sandboxBoolean && (
                        <>
                          <td className="p-3">
                            <span className="bg-emerald-500/10 text-emerald-450 text-[10px] p-1 px-2 rounded-md font-bold uppercase">Available</span>
                          </td>
                          <td className="p-3 text-slate-400">California</td>
                        </>
                      )}
                      <td className="p-3 text-slate-500 text-[10px]">2026/05/22</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold font-sans text-white text-xs">Penthouse Suite Madrid</td>
                      {sandboxBoolean && (
                        <>
                          <td className="p-3">
                            <span className="bg-orange-500/10 text-orange-450 text-[10px] p-1 px-2 rounded-md font-bold uppercase">Sold</span>
                          </td>
                          <td className="p-3 text-slate-400">Spain</td>
                        </>
                      )}
                      <td className="p-3 text-slate-500 text-[10px]">2026/05/20</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'flash-sale':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="text-left">
                <span className="text-[10px] text-yellow-400 font-mono font-bold block">PROMOTION DEALS BADGE</span>
                <span className="text-xs text-slate-300 font-medium">Select dynamic badge design accent:</span>
              </div>
              <div className="flex gap-2">
                {['solid', 'gradient', 'outline'].map((st) => (
                  <button 
                    key={st}
                    onClick={() => setSandboxActiveStyle(st as any)}
                    className={`px-3 py-1 text-xs font-semibold border rounded-lg transition-all capitalize ${sandboxActiveStyle === st ? 'bg-amber-500/10 border-amber-550 text-amber-400' : 'bg-slate-955 border-slate-850 text-slate-400'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-850 flex justify-center">
              <div className="w-full max-w-sm bg-slate-950 p-6 rounded-2xl border border-slate-850 relative overflow-hidden text-left">
                <div className="absolute top-4 right-4">
                  <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider flex items-center gap-1 ${
                    sandboxActiveStyle === 'solid' ? 'bg-yellow-500 text-black font-extrabold' :
                    sandboxActiveStyle === 'gradient' ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white font-bold' :
                    'border border-yellow-500 text-yellow-500'
                  }`}>
                    <Zap className="w-3.5 h-3.5" /> Flash Sale
                  </span>
                </div>

                <div className="space-y-2 mt-4">
                  <span className="text-[11px] text-zinc-500 font-bold uppercase font-mono">Deal of the Day</span>
                  <h3 className="text-lg font-bold text-white">Elementor Pro Extended Pack</h3>
                  <p className="text-xs text-slate-400">Unlock fully loaded custom status columns plus standard Elementor blocks toolkit.</p>
                </div>

                <div className="flex items-end gap-3 pt-4 border-t border-slate-900 mt-4 justify-between">
                  <div>
                    <span className="text-xs text-slate-500 line-through block">$199 USD</span>
                    <span className="text-xl font-mono font-black text-white">$49.50 USD</span>
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-450 hover:to-amber-450 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer">
                    Buy Package
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        // Fallback robust simulator for any other feature IDs
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="text-left">
                <span className="text-[10px] text-blue-400 font-mono font-bold block">DYNAMIC COMPONENT CONTROLLER</span>
                <span className="text-xs text-slate-300 font-medium font-sans">Toggle live visibility parameters:</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSandboxBoolean(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${sandboxBoolean ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-slate-955 border-slate-850 text-slate-400'}`}
                >
                  Apply Badge
                </button>
                <button 
                  onClick={() => setSandboxBoolean(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${!sandboxBoolean ? 'bg-rose-500/10 border-rose-500/30 text-rose-450' : 'bg-slate-955 border-slate-850 text-slate-400'}`}
                >
                  Unassign Badge
                </button>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-855 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
              
              <div className="max-w-xs mx-auto space-y-4">
                <div className="relative p-5 rounded-2xl bg-slate-950/80 border border-slate-850 text-left">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-slate-500 font-mono">Listing ID #1844</span>
                    {sandboxBoolean && (
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 bg-gradient-to-r ${feature.color} text-white`}>
                        <IconComponent className="w-3 h-3" />
                        {feature.title}
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-sm font-bold text-white mb-1">Standard Item Container</h4>
                  <p className="text-xs text-slate-400">This mockup represents your WordPress loop item. Toggling the controller adds the metadata badge instantly.</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div ref={topRef} className="min-h-screen bg-slate-950 text-slate-200 pt-32 pb-24 md:pt-36 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-8">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-slate-400 hover:text-white transition-all text-sm font-semibold uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform text-blue-400" />
            <span>Back to features overview</span>
          </button>

          <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span>WP Plugin Showcase</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300 uppercase font-bold tracking-wider">Verified Safe</span>
          </span>
        </div>

        {/* Desktop grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main content body (8 cols on big, 12 on mobile) */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* 1. HERO SECTION */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/25 rounded-xl text-blue-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-yellow-400" />
                <span>Feature Spotlight</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight flex items-center gap-4">
                  <div className={`p-3 md:p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-xl text-white shrink-0`}>
                    <IconComponent className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <span>{feature.title}</span>
                </h1>
                <p className="text-slate-300 text-lg md:text-xl leading-relaxed pt-2 max-w-3xl font-light">
                  {feature.description}
                </p>
              </div>

              {/* 4 Capability Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {[
                  { label: "Standalone Badge", icon: "📌", desc: "Shortcode & blocks support" },
                  { label: "Display Badge", icon: "🏷️", desc: "Dynamic metadata tags" },
                  { label: "Frontend Filter", icon: "🔍", desc: "JetSmartFilters AJAX search" },
                  { label: "Dynamic Visibility", icon: "👁️", desc: "Render loop rules & gates" }
                ].map((badg, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-left hover:border-slate-700 hover:bg-slate-900 transition-all shadow-md">
                    <span className="text-2xl block mb-3">{badg.icon}</span>
                    <span className="block text-sm font-bold text-white leading-tight mb-1.5">{badg.label}</span>
                    <span className="text-xs text-slate-400 leading-normal">{badg.desc}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-900">
                <button 
                  onClick={() => scrollToId('live-video-walkthrough')}
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-blue-500/15 cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-300" /> Watch Video Walkthrough
                </button>
                <button 
                  onClick={() => scrollToId('live-sandbox-controller')}
                  className="px-7 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 hover:text-white text-slate-300 border border-slate-800 hover:border-slate-700 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer font-sans"
                >
                  Play with Sandbox
                </button>
              </div>
            </motion.div>

            {/* VIDEO SHOWCASE SECTION */}
            <div id="live-video-walkthrough" className="scroll-mt-24 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-indigo-400 animate-pulse" />
                    Premium Video Tutorial Showcase
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Watch the {feature?.title || 'Feature'} plugin block operate in actual WordPress workflows. Double-click the screen to toggle audio.
                  </p>
                </div>
                <span className="self-start sm:self-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">Dynamic Stream v2.0</span>
              </div>
              
              <div className="bg-slate-900/40 border border-slate-900/80 rounded-3xl p-6 shadow-inner">
                <PremiumVideoPlayer 
                  videoUrl={feature?.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-web-development-code-on-a-screen-closeup-42240-large.mp4"} 
                  title={feature?.title} 
                />
              </div>
            </div>

            {/* 2. INTERACTIVE VISUAL PREVIEW / DEMO BLOCK */}
            <div id="live-sandbox-controller" className="scroll-mt-24 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-400" />
                    Interactive Sandbox Playground
                  </h2>
                  <p className="text-slate-405 text-sm mt-1">Simulate WordPress custom parameters dynamically in your browser.</p>
                </div>
                <span className="self-start sm:self-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">React Sandbox v1.4</span>
              </div>

              <div className="bg-slate-900/40 border border-slate-900/80 rounded-3xl p-8 shadow-inner">
                {renderVisualSandbox()}
              </div>
            </div>

            {/* 3. FEATURE CAPABILITIES BREAKDOWN */}
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-display font-bold text-white uppercase tracking-wider text-left">Detailed Capabilities Integration</h2>
                <p className="text-sm text-slate-405 mt-1">Discover key methodologies this package supports straight out of the box.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {[
                  {
                    title: "Standalone Badge",
                    desc: "Inject automatically above product gallery images or listing details dynamically. Comes configured with absolute placement controls so no custom CSS/margins is required.",
                    tool: "📌 Shortcodes & Gutenberg"
                  },
                  {
                    title: "Display Badge (Elementor Dynamic Tag)",
                    desc: "Pulls exact metadata values directly from custom post fields. Perfect for building custom widgets or inserting values seamlessly into existing typographic blocks.",
                    tool: "🏷️ JETENGINE INTEGRATION"
                  },
                  {
                    title: "Frontend Filter (JetSmartFilters)",
                    desc: "Supports taxonomical faceted sorting out of the box. Users can easily check checkboxes to isolate in-stock, remote-only, or featured post cards.",
                    tool: "🔍 AJAX FACETED SORT"
                  },
                  {
                    title: "Dynamic Visibility Rules",
                    desc: "Establish condition logic gates. Render specific booking buttons or checkout carts only when custom values evaluate. Lock blocks with no-code triggers.",
                    tool: "👁️ RENDER CONDITIONS"
                  }
                ].map((cap, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4 hover:border-slate-700 hover:bg-slate-900 transition-all shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-base font-bold text-white">{cap.title}</h4>
                      <span className="self-start sm:self-auto text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20 font-bold uppercase tracking-wider">{cap.tool}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{cap.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. REAL-WORLD USE CASES */}
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-display font-bold text-white uppercase tracking-wider text-left">Real-World Deployments</h2>
                <p className="text-sm text-slate-405 mt-1">Explore architectural examples of where this exact element operates successfully on live websites.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {currentCases.map((cs, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-slate-900/30 border border-slate-850 hover:border-slate-750 hover:bg-slate-900/60 transition-all flex flex-col justify-between shadow-md">
                    <div className="space-y-3">
                      <span className="inline-block px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">{cs.tag}</span>
                      <h4 className="text-base font-bold text-white pt-1">{cs.title}</h4>
                      <span className="text-xs text-slate-400 font-medium block">{cs.subtitle}</span>
                      <p className="text-sm text-slate-300 leading-relaxed mt-2">{cs.description}</p>
                    </div>
                    <div className="pt-5 mt-6 border-t border-slate-900 flex items-center justify-between text-xs font-bold text-blue-400 cursor-pointer hover:text-blue-300 transition-colors">
                      <span>View live setup</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. STEP-BY-STEP CONFIGURATION GUIDE */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-8 text-left space-y-8">
              <div>
                <h3 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400 animate-spin-slow" />
                  WordPress Configuration Tutorial
                </h3>
                <p className="text-sm text-slate-405 mt-1">Configure no-code dynamic statuses on your WordPress site under 3 minutes.</p>
              </div>

              <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-8">
                {[
                  {
                    step: "Step 1: Feature Activation",
                    desc: "Navigate to your PostStatus administrative dashboard within WordPress. Under our universal toggles module, switch on the feature to initialize the database parameters."
                  },
                  {
                    step: "Step 2: Custom Post Type Assignment",
                    desc: "Select which CPTs map to this status taxonomy (e.g. Products, Properties, Gigs). PostStatus automatically establishes the meta-fields instantly."
                  },
                  {
                    step: "Step 3: Elementor Dynamic Tag Integration",
                    desc: "Populate dynamic tags on your customized Elementor templates. Select 'PostStatus Badge API' from the default tag dropdown parameters."
                  },
                  {
                    step: "Step 4: Custom Design & Styles",
                    desc: "Finish by setting visual presets: adjust border-radius values, typography classes, background gradient hues, and hover transitions securely."
                  }
                ].map((st, i) => (
                  <div key={i} className="relative">
                    {/* Ring indicator */}
                    <div className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-full bg-slate-950 border-2 border-blue-500 flex items-center justify-center text-xs text-blue-400 font-bold">
                      {i + 1}
                    </div>
                    <h5 className="text-base font-semibold text-white mb-2">{st.step}</h5>
                    <p className="text-sm text-slate-350 leading-relaxed">{st.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SIDEBAR COLUMNS (4 cols on wide grid) */}
          <div className="lg:col-span-4 space-y-8 text-left">
            
            {/* Sidebar 1: Customer Testimonial Panel */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/15 relative overflow-hidden shadow-lg">
              <span className="text-xs font-bold text-blue-400 font-mono block uppercase tracking-wider">Customer Proof</span>
              <p className="text-sm text-slate-300 italic mt-4 leading-relaxed">
                "{featureTestimonial.quote}"
              </p>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-900/60">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold font-mono text-white shrink-0">
                  {featureTestimonial.author[0]}
                </div>
                <div>
                  <h6 className="text-sm font-semibold text-white">{featureTestimonial.author}</h6>
                  <span className="text-xs text-slate-400 font-medium">{featureTestimonial.role}</span>
                </div>
              </div>
            </div>

            {/* Sidebar 2: Requirements Matrix Table */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-5 shadow-md">
              <h5 className="text-sm font-bold text-white uppercase tracking-wider">System Compatibility</h5>
              <div className="space-y-4">
                {[
                  { name: "JetEngine custom post types", status: "Required ✅" },
                  { name: "Elementor Page Builder", status: "Optional (Works with Free) ✅" },
                  { name: "WooCommerce Products integrations", status: feature.id === 'stock-status' ? "Compatible (Direct hooks!) ✅" : "Fully Integrated ✅" },
                  { name: "Dynamic visibility triggers", status: "Enabled out of the box ✅" }
                ].map((req, rid) => (
                  <div key={rid} className="flex justify-between items-start gap-4 text-sm pb-3 border-b border-slate-900/80 last:border-0 last:pb-0">
                    <span className="text-slate-300 leading-normal">{req.name}</span>
                    <span className="text-xs bg-slate-950 border border-slate-800 px-2.5 py-1 rounded text-white shrink-0 font-mono font-medium">{req.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar 3: Signature Features Toggles */}
            <div className="p-0.5 rounded-2xl bg-gradient-to-r from-blue-500/20 via-transparent to-transparent">
              <div className="bg-slate-950 p-6 rounded-2xl space-y-5">
                <h5 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  Premium Signatures
                </h5>
                <ul className="space-y-4 text-sm text-slate-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-450 shrink-0 mt-0.5" />
                    <span><strong>Auto Transition Timer:</strong> Keep time logs and trigger post state shifts dynamically.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-450 shrink-0 mt-0.5" />
                    <span><strong>Taxonomy Grid Column:</strong> Quick classifying tags synced directly directly on admin layouts.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Sidebar 4: Related / Suggested Features */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-850 space-y-5 shadow-inner">
              <h5 className="text-sm font-bold text-white uppercase tracking-wider">Related capabilities</h5>
              <div className="space-y-3">
                {relatedFeatures.map((f) => {
                  const SubIcon = (Icons as any)[f.iconName] || Icons.HelpCircle;
                  return (
                    <button 
                      key={f.id}
                      onClick={() => {
                        onNavigateToFeature(f.id);
                        if (topRef.current) {
                          topRef.current.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${f.color} text-white shrink-0 shadow-sm`}>
                          <SubIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-slate-300 font-semibold truncate group-hover:text-blue-400 transition-colors">{f.title}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* 7. DYNAMIC PRICING & PRO UPGRADE SECTION */}
        <div id="pricing-bottom-section" className="scroll-mt-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-gradient-to-b from-blue-900/10 via-slate-900 to-slate-900 border border-blue-500/15 p-8 md:p-14 text-center relative overflow-hidden max-w-4xl mx-auto space-y-8 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 blur-2xl pointer-events-none rounded-full" />

            <div className="max-w-2xl mx-auto space-y-5">
              <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-mono font-bold uppercase tracking-widest rounded-full">Pro Upgrade Offer</span>
              <h3 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight">Equip Your Site With PostStatus Pro</h3>
              <p className="text-base text-slate-300 leading-relaxed max-w-xl mx-auto font-light">
                Get full access to "{feature.title}" plus all other backend tables and custom badges taxonomy modules. Elevate how your WordPress site operates today.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  onBack();
                  setTimeout(() => {
                    const pr = document.getElementById('pricing');
                    if (pr) pr.scrollIntoView({ behavior: 'smooth' });
                  }, 200);
                }}
                className="w-full sm:w-auto text-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-blue-500/15"
              >
                Upgrade Plan Now
              </a>
              <button 
                onClick={onBack}
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-900 hover:text-white text-slate-300 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>

            <div className="pt-8 border-t border-slate-900 max-w-md mx-auto flex items-center justify-center gap-5 font-mono text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-blue-500" /> 100% Risk Free</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-850" />
              <span>30-Day Guarantee</span>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
