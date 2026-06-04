import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Check, Compass, Sparkles, Star, ChevronLeft, ChevronRight, HelpCircle, 
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

  // Image gallery configurations & default custom fallbacks
  const fallbackGalleryMap: Record<string, string[]> = {
    'auto-transition': [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1200"
    ],
    'taxonomy-columns': [
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200",
      "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=1200",
      "https://images.unsplash.com/photo-1581291518655-9523c932dedf?q=80&w=1200"
    ],
    'stock-status': [
      "https://images.unsplash.com/photo-1472851294608-062f824d296e?q=80&w=1200",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200"
    ]
  };

  const defaultFallbacks = [
    "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1200",
    "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200",
    "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=1200",
    "https://images.unsplash.com/photo-1581291518655-9523c932dedf?q=80&w=1200"
  ];

  const galleryImages = (feature?.gallery && feature.gallery.length > 0) 
    ? feature.gallery 
    : (fallbackGalleryMap[feature?.id || ''] || defaultFallbacks);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [activeTutorialIndex, setActiveTutorialIndex] = useState(0);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);

  // Prevent background scroll when lightbox or video player opens
  useEffect(() => {
    if (isLightboxOpen || isTutorialOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen, isTutorialOpen]);

  // Gallery captions getter
  const getGalleryCaption = (index: number) => {
    if (feature?.galleryCaptions && feature.galleryCaptions[index]) {
      return {
        title: feature.galleryCaptions[index],
        desc: "Live dashboard screenshot showing optimized backend table layouts and status badge rendering."
      };
    }
    const defaultCaptions: Record<string, { title: string; desc: string }[]> = {
      'auto-transition': [
        { title: "Status Transition Rules Interface", desc: "Define precise time-based scheduling rules with ease." },
        { title: "Database Sync Logger Dashboard", desc: "Audit real-time database transitions and timing executions safely." },
        { title: "Dynamic Countdown Badges", desc: "Visualize ticking deadlines directly inside Gutenberg blocks." }
      ],
      'taxonomy-columns': [
        { title: "Admin Column Setup Control", desc: "Select which CPT tables map taxonomy attributes dynamically." },
        { title: "Faceted Taxonomy Sorting Filter", desc: "Filter items using interactive taxonomies without page updates." },
        { title: "Visual Badge Palette Customizer", desc: "Design bespoke colors, spacing, and typography weights for badging." }
      ],
      'stock-status': [
        { title: "WooCommerce Availability Sync", desc: "Connect standard inventory stock levels directly with visual cues." },
        { title: "Custom Out-of-Stock Forms", desc: "Increase lead captures by displaying email forms when products are sold out." },
        { title: "Dynamic Card Badge Options", desc: "Configure how product cards render sale tags dynamically." }
      ]
    };
    const list = defaultCaptions[feature?.id || ''] || [
      { title: "General Configuration Settings", desc: "Flexible dashboard layout displaying custom options and status toggle parameters." },
      { title: "Shortcode Generator Panel", desc: "Quick copy and paste generated template codes with responsive presets." },
      { title: "Advanced Conditional Visibility Gates", desc: "Limit dynamic visibility criteria and roles for private content areas." },
      { title: "Sleek Responsive Mobile Viewport", desc: "Pixel-perfect touch experiences optimizing badge scales on mobile devices." }
    ];
    return list[index % list.length];
  };

  // Video tutorial playlists builder
  const getTutorialVideos = () => {
    const baseVideo = feature?.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-web-development-code-on-a-screen-closeup-42240-large.mp4";
    const basePoster = feature?.videoPoster || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200";

    const customList = feature?.tutorialVideos || [];
    if (customList.length > 0) {
      return customList;
    }

    return [
      {
        id: "intro-guide",
        title: "1. Core Overview & Walkthrough",
        url: baseVideo,
        poster: basePoster,
        duration: "2:44",
        desc: "Learn standard settings and see how to easily render fields in custom templates."
      },
      {
        id: "admin-setup",
        title: "2. Setting Up Backend Admin Columns",
        url: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-hands-typing-on-keyboard-41315-large.mp4",
        poster: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200",
        duration: "3:10",
        desc: "Mapping custom fields, creating grid tables, and sorting terms with AJAX filters."
      },
      {
        id: "advanced-rules",
        title: "3. Advanced Dynamic Visibility Gates",
        url: "https://assets.mixkit.co/videos/preview/mixkit-spinning-metallic-gear-mechanism-close-up-42721-large.mp4",
        poster: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1200",
        duration: "4:05",
        desc: "Build private visibility criteria rules to hide badges and locks elements behind membership parameters."
      }
    ];
  };

  const tutorialPlaylist = getTutorialVideos();

  // Navigation functions for lightbox
  const handleLightboxNext = () => {
    setLightboxIndex(prev => (prev + 1) % galleryImages.length);
  };

  const handleLightboxPrev = () => {
    setLightboxIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') handleLightboxNext();
      if (e.key === 'ArrowLeft') handleLightboxPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, lightboxIndex, galleryImages.length]);

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

  // If feature is pending creation approval, redirect or show error
  if (feature.pendingApproval === 'create') {
    return (
      <div className="py-32 text-center bg-slate-950 text-white flex flex-col items-center justify-center min-h-screen">
        <Icons.AlertOctagon className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold font-display tracking-tight text-white mb-2">Feature Not Available</h2>
        <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">This feature page is either unpublished or queued for administrative approval by mdakash136915@gmail.com.</p>
        <button onClick={onBack} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer">
          <Icons.ArrowLeft className="w-4 h-4" />
          <span>Return to Showcase</span>
        </button>
      </div>
    );
  }

  const isSvgIcon = feature.iconName && (
    feature.iconName.trim().toLowerCase().startsWith('<svg') || 
    feature.iconName.toLowerCase().includes('<svg') || 
    feature.iconName.toLowerCase().includes('xmlns=') ||
    (feature.iconName.trim().startsWith('<') && feature.iconName.toLowerCase().includes('svg'))
  );
  const IconComponent = !isSvgIcon ? ((Icons as any)[feature.iconName] || Icons.HelpCircle) : null;

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

  // Custom multi-testimonials map to allow left-right sliding proofs
  const multipleTestimonialsMap: Record<string, { quote: string; author: string; role: string }[]> = {
    'auto-transition': [
      {
        quote: feature.testimonialQuote || testimonialsMap[feature.id]?.quote || "This Auto-Transition feature saved me 10 hours a week on my job board! Slots shut down automatically exact to the millisecond.",
        author: feature.testimonialAuthor || testimonialsMap[feature.id]?.author || "John Doe",
        role: feature.testimonialRole || testimonialsMap[feature.id]?.role || "Founder, WP Job Hunters"
      },
      {
        quote: "Dynamic status scheduling works like magic. We saw ad revenue increase by 24% because expired posts cleared out immediately, driving clients to upgrade.",
        author: "Marcus Vance",
        role: "Ad Operations, DirectoryHQ"
      },
      {
        quote: "Extremely reliable hook logic. I no longer write custom cron jobs to expire custom posts.",
        author: "Liam Sterling",
        role: "Senior WordPress Engineer"
      }
    ],
    'taxonomy-columns': [
      {
        quote: feature.testimonialQuote || testimonialsMap[feature.id]?.quote || "Seeing classifications inside WP post tables makes managing 4,000 magazine articles a beautiful breeze. Recommended!",
        author: feature.testimonialAuthor || testimonialsMap[feature.id]?.author || "Evelyn Reed",
        role: feature.testimonialRole || testimonialsMap[feature.id]?.role || "Lead Editor, TechDaily"
      },
      {
        quote: "The admin column sorting makes bulk taxonomy tagging incredibly easy. It works seamlessly with thousands of taxonomy tags.",
        author: "Robert Chen",
        role: "Product Manager, CMS Expert"
      },
      {
        quote: "Saved us countless back-and-forth clicks inside Gutenberg pages. Content managers can filter terms in the spreadsheet view directly.",
        author: "Sophia Alvarez",
        role: "Head of Editorial Content"
      }
    ],
    'stock-status': [
      {
        quote: feature.testimonialQuote || testimonialsMap[feature.id]?.quote || "My WooCommerce clients loved the immediate sold-out badges. Drastically slashed customer support emails asking about sizes.",
        author: feature.testimonialAuthor || testimonialsMap[feature.id]?.author || "Mick Campbell",
        role: feature.testimonialRole || testimonialsMap[feature.id]?.role || "WooCommerce Director, CraftFlow Agency"
      },
      {
        quote: "Incredible UX enhancement! This visual indicator works flawlessly with variable products when inventory levels reach zero.",
        author: "Elena Petrova",
        role: "Shop Owner, WoolenGems"
      },
      {
        quote: "We set low-stock warnings with this badge module. Customers checkout much faster now as it instills immediate scarcity.",
        author: "Nils Sjöberg",
        role: "Growth Marketer, Scandinavian Gear"
      }
    ],
    'flash-sale': [
      {
        quote: feature.testimonialQuote || testimonialsMap[feature.id]?.quote || "Conversion rates peaked by 18% immediately after applying the flashing neon flash-sale badges to our Friday stock deals.",
        author: feature.testimonialAuthor || testimonialsMap[feature.id]?.author || "Sarah Jenkins",
        role: feature.testimonialRole || testimonialsMap[feature.id]?.role || "E-Commerce VP, GadgetHub"
      },
      {
        quote: "The animated visual flash is extremely catchy! Traffic conversion increased on our landing listings right away.",
        author: "David Kim",
        role: "CRO Specialist, TrendyWear"
      },
      {
        quote: "Highly responsive badge rendering that loads in milliseconds. Perfect for high-intensity traffic during shopping holidays.",
        author: "Lucas Müller",
        role: "DevOps Engineer, TechMart"
      }
    ],
    'property-status': [
      {
        quote: feature.testimonialQuote || testimonialsMap[feature.id]?.quote || "We automatic-toggled our real estate properties. Status labels synced perfectly straight to custom map pins without lag.",
        author: feature.testimonialAuthor || testimonialsMap[feature.id]?.author || "Ricardo Cruz",
        role: feature.testimonialRole || testimonialsMap[feature.id]?.role || "CTO, Madrid Homes"
      },
      {
        quote: "It instantly updates property listings to 'Under Offer'. No more manual database updates, making our site perfectly reliable.",
        author: "Beatrice Webb",
        role: "Operations, Prime Realty"
      },
      {
        quote: "My real estate clients can easily filter through active properties in real-time. A vital feature for modern agencies.",
        author: "Yusuf Kaan",
        role: "Fullstack WordPress Developer"
      }
    ],
    'featured-properties': [
      {
        quote: feature.testimonialQuote || testimonialsMap[feature.id]?.quote || "Paid real-estate listings sell premium placements 40% faster by keeping the high-contrast VIP badge floating elegantly.",
        author: feature.testimonialAuthor || testimonialsMap[feature.id]?.author || "Samantha Black",
        role: feature.testimonialRole || testimonialsMap[feature.id]?.role || "Ad Revenue Manager"
      },
      {
        quote: "The highlighted card style looks absolutely stunning. Standard listings feel distinct, and premium clients happily pay the dynamic fee.",
        author: "Gregory Peck",
        role: "CEO, LuxEstates"
      },
      {
        quote: "We saw premium listings subscription rate rise by 35% within just two weeks of launching these sleek gold status badges.",
        author: "Monica Geller",
        role: "Marketing Director, UrbanLiving"
      }
    ],
    'applicant-count': [
      {
        quote: feature.testimonialQuote || testimonialsMap[feature.id]?.quote || "Applicants love transparency. Displaying the counter right on post cards doubled our click ratios this quarter.",
        author: feature.testimonialAuthor || testimonialsMap[feature.id]?.author || "Daniel Vane",
        role: feature.testimonialRole || testimonialsMap[feature.id]?.role || "HR Lead, BioHealth Corp"
      },
      {
        quote: "Job searchers apply much faster when they see real-time urgency. A marvelous trigger for user actions.",
        author: "Aisha Patel",
        role: "Director of Talent, HireGlobal"
      },
      {
        quote: "The count badge displays dynamically without page reloads. Simple hook implementation that works perfectly with Elementor.",
        author: "Tom Fletcher",
        role: "WP Solution Architect"
      }
    ],
    'open-closed': [
      {
        quote: feature.testimonialQuote || testimonialsMap[feature.id]?.quote || "Our global community groups instantly verify active sessions. Displays glowing indicator rings exactly during live hours.",
        author: feature.testimonialAuthor || testimonialsMap[feature.id]?.author || "Aris Thorne",
        role: feature.testimonialRole || testimonialsMap[feature.id]?.role || "Community Manager, AlphaLabs"
      },
      {
        quote: "We display real-time business status badge. No more confused clients arriving outside of our live support window.",
        author: "Chloe Dubois",
        role: "Support Director, Paris Clinic"
      },
      {
        quote: "Perfect integration with local timezones. Highly flexible open-status badge renders accurately on mobile views too.",
        author: "Sandro Rossi",
        role: "Technical Lead, GastroHub"
      }
    ],
    'urgent-hiring': [
      {
        quote: feature.testimonialQuote || testimonialsMap[feature.id]?.quote || "Urgent tags with animated visual pulses solved our seasonal driver workforce crisis inside 48 hours.",
        author: feature.testimonialAuthor || testimonialsMap[feature.id]?.author || "Karim Al-Hussain",
        role: feature.testimonialRole || testimonialsMap[feature.id]?.role || "Recruitment Supervisor, QuickLogistics"
      },
      {
        quote: "The pulsing animation is eye-catching without being annoying. Conversion of applications increased significantly.",
        author: "Jessica Winters",
        role: "Talent Acquisition, DevTalent"
      },
      {
        quote: "Extremely simple configuration but maximum impact. Fully responsive, highly customizable colors.",
        author: "Takeshi Sato",
        role: "Owner, TokyoStaffing"
      }
    ],
    'remote-only': [
      {
        quote: feature.testimonialQuote || testimonialsMap[feature.id]?.quote || "A clean filter of remote-only postings kept over 10,000 developers fully engaged with our niche job directory.",
        author: feature.testimonialAuthor || testimonialsMap[feature.id]?.author || "Tina Lin",
        role: feature.testimonialRole || testimonialsMap[feature.id]?.role || "Operations Expert, DevRemote"
      },
      {
        quote: "We added the glowing remote-work icon. Developers immediately praise the visual clarity and professional interface design.",
        author: "Oliver Hanson",
        role: "Community Lead, StackRemote"
      },
      {
        quote: "Incredible filter performance. Clean CSS layout and SVG iconography works gracefully on all screen resolutions.",
        author: "Emma Watson",
        role: "UI Engineer, NomadClass"
      }
    ]
  };

  const testimonialsList = multipleTestimonialsMap[feature.id] || [
    {
      quote: feature.testimonialQuote || "Integrating these custom display badges transformed how users visually explore status changes across our custom tables.",
      author: feature.testimonialAuthor || "Alex Mercer",
      role: feature.testimonialRole || "Senior Consultant, JetDevelopers"
    },
    {
      quote: "Outstanding visual enhancements and flawless custom query structures. It elevated standard WordPress displays into high-end directories.",
      author: "Samantha Drake",
      role: "Lead UI Developer, WebCraft"
    },
    {
      quote: "The absolute best extension module for JetEngine. Fully compatible with dynamic tags and custom callbacks.",
      author: "Julius Caesar",
      role: "Full Stack Engineer, Imperator Web"
    }
  ];

  const featureTestimonial = testimonialsList[activeTestimonialIndex % testimonialsList.length];

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
  if (feature.realWorldPillars && feature.realWorldPillars.length > 0) {
    feature.realWorldPillars.forEach(pillar => {
      if (pillar.title) {
        dynamicCases.push({
          title: pillar.title,
          subtitle: pillar.subtitle || "Deployment Setup",
          description: pillar.description || "",
          tag: pillar.tag || "Custom Setup",
          link: pillar.link || ""
        });
      }
    });
  } else {
    if (feature.realWorldCase1Title) {
      dynamicCases.push({
        title: feature.realWorldCase1Title,
        subtitle: feature.realWorldCase1Subtitle || "Deployment Setup",
        description: feature.realWorldCase1Desc || "",
        tag: feature.realWorldCase1Tag || "Custom Setup",
        link: ""
      });
    }
    if (feature.realWorldCase2Title) {
      dynamicCases.push({
        title: feature.realWorldCase2Title,
        subtitle: feature.realWorldCase2Subtitle || "Deployment Setup",
        description: feature.realWorldCase2Desc || "",
        tag: feature.realWorldCase2Tag || "Custom Setup",
        link: ""
      });
    }
    if (feature.realWorldCase3Title) {
      dynamicCases.push({
        title: feature.realWorldCase3Title,
        subtitle: feature.realWorldCase3Subtitle || "Deployment Setup",
        description: feature.realWorldCase3Desc || "",
        tag: feature.realWorldCase3Tag || "Custom Setup",
        link: ""
      });
    }
  }

  const currentCases = dynamicCases.length > 0 ? dynamicCases : (realWorldCases[feature.id] || [
    { title: "Custom Database Lists", subtitle: "Interactive Tracking", description: "Sync document values instantly to represent statuses on cards.", tag: "General CPTs", link: "" },
    { title: "Dynamic Pages Layouts", subtitle: "Rich Visibility", description: "Format layout visibility on elements dynamically centered on specific status keys.", tag: "Layouts Builder", link: "" },
    { title: "Filtered Grids UI", subtitle: "Faceted Sorting", description: "Give customers sorting sliders targeting this specific metadata parameter.", tag: "Smart Filters", link: "" }
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
                        {isSvgIcon ? (
                          <div 
                            className="w-3 h-3 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-current [&>svg]:stroke-[2] text-white"
                            dangerouslySetInnerHTML={{ __html: feature.iconName }}
                          />
                        ) : (
                          IconComponent && <IconComponent className="w-3 h-3" />
                        )}
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
    <div ref={topRef} className="min-h-screen bg-slate-950 text-slate-300 pt-28 pb-20 md:pt-36 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Dynamic atmospheric radial background glow specific to the feature's color theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1320px] h-[600px] bg-gradient-to-b from-blue-500/5 via-transparent to-transparent blur-3xl rounded-full opacity-30 pointer-events-none" />

      <div className="max-w-[1320px] mx-auto space-y-12 relative z-10">
        
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.03] pb-6">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer font-sans"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-blue-400/80" />
            <span>Back to features overview</span>
          </button>

          <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span>WP Plugin Showcase</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse"></span>
            <span className="text-slate-300 uppercase font-bold tracking-wider">Verified Live</span>
          </span>
        </div>

        {/* ========================================================= */}
        {/* GLORIOUS FULL-WIDTH HERO SECTION (REFINED STYLING) */}
        {/* ========================================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-slate-900/10 backdrop-blur-md border border-slate-900/60 rounded-3xl p-4 sm:p-8 md:p-12 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)] space-y-8"
        >
          {/* Ambient mesh lighting lamps */}
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8 relative z-10">
            {/* Title & Description Column */}
            <div className="space-y-6 max-w-3xl text-left flex-1">
              <div className="flex items-center gap-2 w-fit px-3 py-1 bg-blue-500/5 border border-blue-500/10 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest text-blue-400/90">
                <Sparkles className="w-3.5 h-3.5 text-amber-500/80 animate-spin-slow" />
                <span>Feature Spotlight Panel</span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className={`p-2.5 sm:p-3 md:p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-gradient-to-br ${feature.color} shadow-xl text-white shrink-0`}>
                  {isSvgIcon ? (
                    <div 
                      className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-12 lg:h-12 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-current [&>svg]:stroke-[2] text-white"
                      dangerouslySetInnerHTML={{ __html: feature.iconName }}
                    />
                  ) : (
                    IconComponent && <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-12 lg:h-12" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-black text-slate-100 tracking-tight leading-tight">
                    {feature.title}
                  </h1>
                  <span className="text-[10px] sm:text-xs font-mono text-slate-400 font-bold uppercase tracking-wider block mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-950/45 font-mono text-indigo-400/90 border border-slate-900/60">Namespace: JET_ENGINE</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-emerald-400/90 bg-slate-950/45 px-2 py-0.5 rounded sm:bg-transparent sm:p-0 border border-slate-900/60 sm:border-transparent">Stable v2.1.4</span>
                  </span>
                </div>
              </div>

              <p className="text-slate-300 text-base md:text-lg leading-relaxed font-light max-w-2xl pt-2">
                {feature.description}
              </p>
              
              {/* Fine details to boost readability */}
              <div className="flex flex-wrap items-center gap-6 text-slate-450 text-[10px] font-mono font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70" />
                  <span>Elementor Pro compatible</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500/70" />
                  <span>Gutenberg blocks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70" />
                  <span>WPML Multilingual</span>
                </div>
              </div>
            </div>

            {/* CTA action buttons neatly integrated in hero */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 sm:gap-4 lg:gap-5 w-full lg:w-fit shrink-0 lg:min-w-[260px]">
              <button 
                onClick={() => setIsTutorialOpen(true)}
                className="flex-1 px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 active:scale-95 duration-150"
              >
                <Play className="w-4 h-4 text-emerald-300 animate-pulse fill-emerald-300" /> Watch Setup Guides
              </button>
              <button 
                onClick={() => scrollToId('live-image-gallery')}
                className="flex-1 px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800 hover:text-white text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-all text-[10px] sm:text-xs font-bold uppercase tracking-widest cursor-pointer font-sans active:scale-95 duration-150 shadow-md"
              >
                View Feature Gallery
              </button>
            </div>
          </div>

          {/* 4 Capability Badges - full width inside the gorgeous hero module */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-slate-900/80">
            {[
              { label: "Standalone Badge", icon: "📌", desc: "Shortcode & blocks support" },
              { label: "Display Badge", icon: "🏷️", desc: "Dynamic metadata tags" },
              { label: "Frontend Filter", icon: "🔍", desc: "JetSmartFilters AJAX search" },
              { label: "Dynamic Visibility", icon: "👁️", desc: "Render loop rules & gates" }
            ].map((badg, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/25 border border-slate-900/80 text-left hover:border-slate-800 hover:bg-slate-900/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all shadow-md group">
                <span className="text-xl block mb-2 group-hover:scale-110 transition-transform duration-300">{badg.icon}</span>
                <span className="block text-xs font-semibold text-slate-200 leading-tight mb-1">{badg.label}</span>
                <span className="text-[11px] text-slate-400 leading-normal">{badg.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Desktop grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main content body (8 cols on big, 12 on mobile) */}
          <div className="lg:col-span-8 space-y-16">

            {/* 1. DETAILED DOCUMENTATION / FULL DESCRIPTION SECTION (MOVED & ENHANCED) */}
            <div className="space-y-6 text-left">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-display font-black text-white flex items-center gap-2.5 tracking-tight uppercase">
                    <Icons.FileText className="w-5.5 h-5.5 text-blue-400" />
                    Plugin Detailed Overview
                  </h2>
                  <span className="text-[10px] text-blue-450 bg-blue-950/20 border border-blue-900/40 px-3 py-1 rounded font-mono font-bold tracking-wider uppercase">CPT Active Documentation</span>
                </div>
                <p className="text-slate-400 text-sm font-light">Comprehensive description, implementation guidelines, and real-world execution logics of this WordPress active addon module.</p>
              </div>

              <div className="bg-gradient-to-br from-slate-900/30 to-slate-950/30 border border-slate-900/70 rounded-3xl p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />
                
                {feature.fullDescription ? (
                  <div className="prose prose-invert max-w-none text-slate-300 text-[13.5px] leading-relaxed space-y-4 font-normal
                    [&>p]:leading-relaxed [&>p]:text-slate-300 [&>p]:mb-4
                    [&>strong]:text-white [&>strong]:font-semibold
                    [&>h1]:text-white [&>h1]:text-base [&>h1]:font-black [&>h1]:my-4 [&>h1]:font-mono [&>h1]:border-b [&>h1]:border-slate-900 [&>h1]:pb-2
                    [&>h2]:text-slate-100 [&>h2]:text-sm [&>h2]:font-bold [&>h2]:my-3 [&>h2]:font-mono [&>h2]:uppercase [&>h2]:tracking-wider
                    [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 [&>ul]:my-4 [&>ul>li]:text-slate-300
                    [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-2 [&>ol]:my-4 [&>ol>li]:text-slate-300
                    [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-5 [&>blockquote]:text-slate-400 [&>blockquote]:bg-slate-950/20 [&>blockquote]:py-2 [&>blockquote]:rounded-r-lg
                    [&>a]:text-blue-400 [&>a]:hover:underline [&>a]:font-semibold transition-colors
                    [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-2xl [&_img]:scale-100 hover:[&_img]:scale-[1.01] [&_img]:transition-transform [&_img]:duration-300 [&_img]:my-6 [&_img]:border [&_img]:border-slate-800/80 [&_img]:shadow-2xl [&_img]:mx-auto [&_img]:block"
                    dangerouslySetInnerHTML={{ __html: feature.fullDescription }}
                  />
                ) : (
                  <div className="space-y-4 text-slate-300 text-[13.5px] leading-relaxed">
                    <p>{feature.description || "No deep overview specified yet. Run the system administrator panel to customize WordPress parameters with layouts, images, and walkthrough notes."}</p>
                    {feature.useCase && (
                      <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/35 text-slate-300 italic mt-4 relative">
                        <strong className="block text-[10px] font-mono uppercase tracking-wider text-blue-400 not-italic mb-1.5 font-bold">WP EXECUTION HOOK TIMING:</strong>
                        "{feature.useCase}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 1. CUSTOM SCREENSHOT GALLERY SHOWCASE (DYNAMIC EQUAL-SIZED PLOT) */}
            <div id="live-image-gallery" className="scroll-mt-24 space-y-6">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-display font-extrabold text-slate-100 flex items-center gap-2">
                    <Icons.Image className="w-5 h-5 text-blue-450" />
                    Feature Showcase Gallery
                  </h2>
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">{galleryImages.length} Screenshots</span>
                </div>
                <p className="text-slate-400 text-sm">Real-world dashboard layouts and production interfaces. Hover over screenshots for context; click to expand high-fidelity views.</p>
              </div>

              <div className="bg-slate-900/10 border border-slate-900/50 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {galleryImages.map((imgUrl, i) => {
                    const caption = getGalleryCaption(i);
                    return (
                      <motion.div
                        key={`${imgUrl}-${i}`}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        onClick={() => {
                          setLightboxIndex(i);
                          setIsLightboxOpen(true);
                        }}
                        className="group relative aspect-video rounded-2xl overflow-hidden cursor-pointer bg-slate-950/80 border border-slate-900/70 hover:border-slate-800/60 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] transition-all duration-300 shadow-md"
                      >
                        {/* Core Image element */}
                        <img 
                          src={imgUrl} 
                          alt={caption.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none" 
                          referrerPolicy="no-referrer"
                        />

                        {/* Hover Overlay with text and icons */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5 z-20 text-left">
                          {/* Upper section with quick tags */}
                          <div className="flex justify-between items-start">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-450 border border-blue-500/20 text-[9px] font-mono font-bold uppercase tracking-wider">
                              Screenshot #{i + 1}
                            </span>
                            <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-900 text-slate-350 hover:text-white transition-colors">
                              <Icons.Maximize2 className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          {/* Bottom metadata details */}
                          <div className="space-y-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <h3 className="text-xs font-bold text-white tracking-tight">{caption.title}</h3>
                            <p className="text-[10px] text-slate-300 leading-normal line-clamp-2">
                              {caption.desc}
                            </p>
                          </div>
                        </div>

                        {/* Ambient subtle light border overlay */}
                        <div className="absolute inset-0 border border-white/[0.02] pointer-events-none rounded-2xl group-hover:border-white/[0.05] transition-colors duration-300" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3. FEATURE CAPABILITIES BREAKDOWN */}
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-display font-semibold text-slate-200 uppercase tracking-wider text-left">Detailed Capabilities Integration</h2>
                <p className="text-sm text-slate-450 mt-1">Discover key methodologies this package supports straight out of the box.</p>
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
                  <div key={i} className="p-6 rounded-2xl bg-slate-900/15 border border-slate-900/80 space-y-4 hover:border-slate-805 hover:bg-slate-900/25 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-base font-semibold text-slate-100">{cap.title}</h4>
                      <span className="self-start sm:self-auto text-[10px] font-mono text-blue-450 bg-blue-950/30 px-2.5 py-1 rounded border border-blue-900/20 font-bold uppercase tracking-wider">{cap.tool}</span>
                    </div>
                    <p className="text-sm text-slate-350 leading-relaxed font-light">{cap.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. REAL-WORLD USE CASES */}
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-display font-semibold text-slate-200 uppercase tracking-wider text-left">Real-World Deployments</h2>
                <p className="text-sm text-slate-450 mt-1">Explore architectural examples of where this exact element operates successfully on live websites.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {currentCases.map((cs, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-slate-900/10 border border-slate-900/60 hover:border-slate-800 hover:bg-slate-900/20 hover:shadow-[0_12px_35px_rgba(0,0,0,0.45)] transition-all flex flex-col justify-between shadow-md">
                    <div className="space-y-3">
                      <span className="inline-block px-2.5 py-1 rounded bg-emerald-950/20 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">{cs.tag}</span>
                      <h4 className="text-base font-semibold text-slate-100 pt-1">{cs.title}</h4>
                      <span className="text-xs text-slate-450 font-medium block">{cs.subtitle}</span>
                      <p className="text-sm text-slate-350 leading-relaxed mt-2 font-light">{cs.description}</p>
                    </div>
                    <a 
                      href={cs.link ? (cs.link.startsWith('http') ? cs.link : `https://${cs.link}`) : `https://wordpress.org/plugins/search/${encodeURIComponent(feature.title || '')}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="pt-5 mt-6 border-t border-slate-950/60 flex items-center justify-between text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors group/setup-link cursor-pointer"
                    >
                      <span>View live setup</span>
                      <ChevronRight className="w-4 h-4 group-hover/setup-link:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. STEP-BY-STEP CONFIGURATION GUIDE */}
            <div className="bg-slate-900/10 border border-slate-900/60 rounded-2xl p-8 text-left space-y-8 shadow-[0_8px_30px_rgba(0,0,0,0.3)] backdrop-blur-sm">
              <div>
                <h3 className="text-xl font-display font-extrabold text-slate-100 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-450/95 animate-spin-slow" />
                  WordPress Configuration Tutorial
                </h3>
                <p className="text-sm text-slate-450 mt-1">Configure no-code dynamic statuses on your WordPress site under 3 minutes.</p>
              </div>

              <div className="relative border-l-2 border-slate-900/80 ml-4 pl-6 space-y-8">
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
                    <div className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-full bg-slate-950 border border-blue-500/60 text-blue-400 flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(59,130,246,0.15)]">
                      {i + 1}
                    </div>
                    <h5 className="text-base font-semibold text-slate-100 mb-2">{st.step}</h5>
                    <p className="text-sm text-slate-350 leading-relaxed font-light">{st.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SIDEBAR COLUMNS (4 cols on wide grid) */}
          <div className="lg:col-span-4 space-y-8 text-left">
            
            {/* Sidebar 1: Customer Testimonial Panel */}
            <div className="p-6 rounded-2xl bg-blue-950/10 border border-blue-950/30 relative overflow-hidden shadow-lg shadow-black/10">
              <div className="flex items-center justify-between pb-1 mb-2">
                <span className="text-xs font-bold text-blue-400/90 font-mono block uppercase tracking-wider">Customer Proof</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {((activeTestimonialIndex % testimonialsList.length) + 1)} / {testimonialsList.length}
                  </span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setActiveTestimonialIndex(prev => (prev - 1 + testimonialsList.length) % testimonialsList.length)}
                      className="p-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-slate-800 cursor-pointer active:scale-90"
                      aria-label="Previous Testimonial"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => setActiveTestimonialIndex(prev => (prev + 1) % testimonialsList.length)}
                      className="p-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-slate-800 cursor-pointer active:scale-90"
                      aria-label="Next Testimonial"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Animating the switching testimonials cleanly */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonialIndex % testimonialsList.length}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-slate-355 italic leading-relaxed font-light min-h-[70px]">
                    "{featureTestimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-900/60">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sm font-bold font-mono text-slate-350 shrink-0">
                      {featureTestimonial.author[0]}
                    </div>
                    <div>
                      <h6 className="text-sm font-semibold text-slate-200">{featureTestimonial.author}</h6>
                      <span className="text-xs text-slate-450 font-medium">{featureTestimonial.role}</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sidebar 2: Requirements Matrix Table */}
            <div className="p-6 rounded-2xl bg-slate-900/15 border border-slate-900/70 space-y-5 shadow-xl">
              <h5 className="text-sm font-bold text-slate-200 uppercase tracking-wider">System Compatibility</h5>
              <div className="space-y-4">
                {(feature.systemCompatibility && feature.systemCompatibility.trim() !== '') ? (
                  feature.systemCompatibility.split('\n').filter(line => line.trim() !== '').map((line, rid) => {
                    const parts = line.split('|');
                    const name = parts[0]?.trim() || '';
                    const status = parts[1]?.trim() || 'Fully Integrated ✅';
                    return (
                      <div key={rid} className="flex justify-between items-start gap-4 text-sm pb-3 border-b border-slate-950/55 last:border-0 last:pb-0">
                        <span className="text-slate-300 leading-normal font-light">{name}</span>
                        <span className="text-xs bg-slate-955/30 border border-slate-900/80 px-2.5 py-1 rounded text-slate-300 shrink-0 font-mono font-medium">{status}</span>
                      </div>
                    );
                  })
                ) : (
                  [
                    { name: "JetEngine custom post types", status: "Required ✅" },
                    { name: "Elementor Page Builder", status: "Optional (Works with Free) ✅" },
                    { name: "WooCommerce Products integrations", status: feature.id === 'stock-status' ? "Compatible (Direct hooks!) ✅" : "Fully Integrated ✅" },
                    { name: "Dynamic visibility triggers", status: "Enabled out of the box ✅" }
                  ].map((req, rid) => (
                    <div key={rid} className="flex justify-between items-start gap-4 text-sm pb-3 border-b border-slate-950/55 last:border-0 last:pb-0">
                      <span className="text-slate-300 leading-normal font-light">{req.name}</span>
                      <span className="text-xs bg-slate-955/30 border border-slate-900/80 px-2.5 py-1 rounded text-slate-300 shrink-0 font-mono font-medium">{req.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar 3: Signature Features Toggles */}
            <div className="p-6 rounded-2xl bg-slate-900/10 border border-slate-900/80 space-y-5 shadow-lg shadow-black/20 relative overflow-hidden">
              <h5 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
                Premium Signatures
              </h5>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400/80 shrink-0 mt-0.5" />
                  <span className="font-light"><strong className="font-semibold text-slate-200">Auto Transition Timer:</strong> Keep time logs and trigger post state shifts dynamically.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400/80 shrink-0 mt-0.5" />
                  <span className="font-light"><strong className="font-semibold text-slate-200">Taxonomy Grid Column:</strong> Quick classifying tags synced directly directly on admin layouts.</span>
                </li>
              </ul>
            </div>

            {/* Sidebar 4: Related / Suggested Features */}
            <div className="p-6 rounded-2xl bg-slate-900/10 border border-slate-900/70 space-y-5 shadow-lg shadow-black/25">
              <h5 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Related capabilities</h5>
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
                      className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 hover:bg-slate-900/30 border border-slate-900/80 hover:border-slate-800 hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${f.color} text-white shrink-0 shadow-sm`}>
                          <SubIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-slate-350 font-semibold truncate group-hover:text-blue-400 transition-colors">{f.title}</span>
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

            <div className="max-w-2xl mx-auto flex flex-col items-center">
              <span className="inline-flex px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-mono font-bold uppercase tracking-widest rounded-full mb-6">Pro Upgrade Offer</span>
              <h3 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight leading-tight">Equip Your Site With PostStatus Pro</h3>
              <p className="text-base text-slate-300 leading-relaxed max-w-xl mx-auto font-light mt-4">
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
                className="w-full sm:w-auto text-center px-4 py-3 sm:px-8 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-blue-500/15 active:scale-95 duration-150"
              >
                Upgrade Plan Now
              </a>
              <button 
                onClick={onBack}
                className="w-full sm:w-auto px-4 py-3 sm:px-7 sm:py-4 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-900 hover:text-white text-slate-300 font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all cursor-pointer active:scale-95 duration-150"
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

      {/* GLORIOUS LIGHTBOX PORTAL */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[999] bg-slate-950/98 backdrop-blur-xl flex flex-col justify-between p-4 md:p-8 select-none"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Top Control Bar */}
            <div className="flex items-center justify-between gap-4 w-full max-w-7xl mx-auto border-b border-white/5 pb-4 md:pb-6 z-10" onClick={e => e.stopPropagation()}>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-blue-400 font-mono tracking-widest block mb-1">Feature Spotlight Gallery</span>
                <h4 className="text-sm md:text-base font-bold text-white">{getGalleryCaption(lightboxIndex).title}</h4>
              </div>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-350 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-lg"
              >
                <span>Close</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[9px] font-mono text-slate-450 border border-slate-850">esc</span>
              </button>
            </div>

            {/* Main Stage View */}
            <div className="flex-1 flex items-center justify-center relative w-full h-full max-w-7xl mx-auto my-4 text-center" onClick={e => e.stopPropagation()}>
              
              {/* Prev button */}
              <button
                onClick={handleLightboxPrev}
                className="absolute left-2 md:left-4 z-20 p-3 md:p-4 rounded-full bg-slate-900/60 border border-slate-850 text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xl outline-none"
                title="Previous Image (Left Arrow)"
              >
                <Icons.ChevronLeft className="w-5 h-5" />
              </button>

              {/* Main Active image showcase card with framer animations */}
              <div className="w-full max-w-5xl h-[55vh] md:h-[65vh] flex items-center justify-center overflow-hidden relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={lightboxIndex}
                    src={galleryImages[lightboxIndex]}
                    alt={`Active expanded view #${lightboxIndex}`}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-slate-850 select-none"
                    referrerPolicy="no-referrer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.25 }}
                  />
                </AnimatePresence>
              </div>

              {/* Next button */}
              <button
                onClick={handleLightboxNext}
                className="absolute right-2 md:right-4 z-20 p-3 md:p-4 rounded-full bg-slate-900/60 border border-slate-850 text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xl outline-none"
                title="Next Image (Right Arrow)"
              >
                <Icons.ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Caption & Stats Deck */}
            <div className="w-full max-w-3xl mx-auto text-center space-y-3 z-10 pb-4" onClick={e => e.stopPropagation()}>
              <span className="px-3 py-1 rounded bg-slate-900 border border-slate-850 text-xs font-mono text-slate-350 tracking-wider inline-block">
                IMAGE {lightboxIndex + 1} OF {galleryImages.length}
              </span>
              <p className="text-xs md:text-sm text-slate-400 italic max-w-xl mx-auto leading-relaxed">
                "{getGalleryCaption(lightboxIndex).desc}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLORIOUS MULTI-VIDEO ACADEMY MODAL */}
      <AnimatePresence>
        {isTutorialOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[999] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 md:p-8"
            onClick={() => setIsTutorialOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl h-[90vh] lg:h-[80vh] flex flex-col overflow-hidden shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 p-5 md:p-6 bg-slate-950/60 backdrop-blur-md">
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <Icons.Play className="w-4 h-4 text-emerald-450 animate-pulse fill-emerald-450" />
                    <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-widest block font-mono">Video Tutorial Academy</span>
                  </div>
                  <h3 className="text-sm md:text-base font-black text-white">{feature?.title} Setup Guides</h3>
                </div>
                
                <button
                  onClick={() => setIsTutorialOpen(false)}
                  className="flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-350 transition-all cursor-pointer group"
                  title="Close Academic Center"
                >
                  <Icons.X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* Modal Core Split-Screen Body */}
              <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:grid lg:grid-cols-12 min-h-0">
                
                {/* Left side: Video Showcase Theater (8 cols) */}
                <div className="w-full lg:col-span-8 bg-black/40 p-4 sm:p-5 md:p-6 flex flex-col lg:justify-between lg:overflow-y-auto shrink-0 min-h-0">
                  <div key={tutorialPlaylist[activeTutorialIndex].url} className="w-full rounded-2xl overflow-hidden border border-slate-850 shadow-2xl bg-slate-950 shrink-0">
                    <PremiumVideoPlayer 
                      videoUrl={tutorialPlaylist[activeTutorialIndex].url}
                      title={tutorialPlaylist[activeTutorialIndex].title}
                      posterUrl={tutorialPlaylist[activeTutorialIndex].poster}
                    />
                  </div>

                  {/* Curated Video Title Cards */}
                  <div className="text-left mt-5 bg-slate-950/40 border border-slate-855 p-4 rounded-xl shrink-0">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold uppercase tracking-wider inline-block mb-1.5 font-mono">
                      Playing Tutorial Episode #{activeTutorialIndex + 1}
                    </span>
                    <h4 className="text-base font-bold text-white">{tutorialPlaylist[activeTutorialIndex].title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1 font-medium italic">
                      "{tutorialPlaylist[activeTutorialIndex].desc}"
                    </p>
                  </div>
                </div>

                {/* Right side: Interactive Playlist Selector (4 cols) */}
                <div className="w-full lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950/60 p-4 sm:p-5 md:p-6 flex flex-col lg:overflow-y-auto shrink-0 min-h-0">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-850">
                    <h5 className="text-xs font-bold text-slate-350 uppercase tracking-wider font-mono flex items-center gap-2 font-mono">
                      <Icons.List className="w-4 h-4 text-blue-400" />
                      Playlist ({tutorialPlaylist.length} Guides)
                    </h5>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded text-slate-400 font-mono font-medium">Auto-Play Enabled</span>
                  </div>

                  <div className="space-y-3 flex-1">
                    {tutorialPlaylist.map((tut, index) => (
                      <button
                        key={`${tut.id}-${index}`}
                        onClick={() => setActiveTutorialIndex(index)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-300 outline-none select-none cursor-pointer group ${
                          activeTutorialIndex === index
                            ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                            : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900/80 hover:border-slate-800'
                        }`}
                      >
                        {/* Thumbnail or Icon */}
                        <div className="relative w-20 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 shadow-md">
                          <img src={tut.poster} alt={tut.title} className="w-full h-full object-cover select-none" referrerPolicy="no-referrer" />
                          <div className={`absolute inset-0 flex items-center justify-center bg-slate-950/30 transition-opacity ${activeTutorialIndex === index ? 'opacity-0' : 'opacity-100 group-hover:opacity-10'}`}>
                            <Icons.Play className="w-4 h-4 text-white drop-shadow" />
                          </div>
                          
                          {/* Duration Stamp overlay */}
                          <div className="absolute bottom-1 right-1 bg-slate-950/80 px-1 py-0.5 text-[8px] font-mono text-white rounded scale-90 border border-white/5 leading-none">
                            {tut.duration}
                          </div>
                        </div>

                        {/* Title and Short descriptions */}
                        <div className="min-w-0 pr-1 space-y-0.5">
                          <h6 className={`text-xs font-bold truncate transition-colors leading-snug ${
                            activeTutorialIndex === index ? 'text-blue-400' : 'text-slate-205 group-hover:text-white'
                          }`}>
                            {tut.title}
                          </h6>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                            {tut.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Playlist footer */}
                  <div className="pt-4 mt-4 border-t border-slate-850 text-center text-[10px] font-mono text-slate-500 leading-normal font-mono">
                    Designed and curated for premium WordPress setup.
                  </div>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
