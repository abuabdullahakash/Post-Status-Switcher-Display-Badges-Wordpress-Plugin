import { Feature, PricingPlan, FAQItem, SiteSettings, Integration } from '../types';

export const DEFAULT_FEATURES: Feature[] = [
  {
    id: 'auto-transition',
    title: 'Auto State Transition',
    description: 'Automatically changes the status of a post based on time.',
    iconName: 'Timer',
    color: 'from-blue-500 to-indigo-500',
    useCase: 'Used when you want to automatically set the status of an event or job post to "Closed" or "Expired" after a specific time passes.',
    active: true,
    order: 1,
    category: 'general'
  },
  {
    id: 'taxonomy-columns',
    title: 'Show Taxonomy Columns',
    description: 'Displays categories or taxonomies in separate columns along with posts in the backend (Admin List Table).',
    iconName: 'Columns',
    color: 'from-slate-500 to-gray-500',
    useCase: 'When you need to quickly track which category a post belongs to from the database or listing view.',
    active: true,
    order: 2,
    category: 'general'
  },
  {
    id: 'stock-status',
    title: 'In Stock / Out of Stock',
    description: 'Shows whether a product is in stock or sold out.',
    iconName: 'ShoppingCart',
    color: 'from-emerald-400 to-teal-500',
    useCase: 'For e-commerce or product listing sites to inform customers about the current stock status of products.',
    active: true,
    order: 3,
    category: 'ecommerce'
  },
  {
    id: 'flash-sale',
    title: 'Flash Sale / Deal of the Day',
    description: 'Adds a promotional badge for special offers or discounts.',
    iconName: 'Zap',
    color: 'from-yellow-400 to-amber-500',
    useCase: 'Used on e-commerce sites to highlight massive discounts or offers on specific products.',
    active: true,
    order: 4,
    category: 'ecommerce'
  },
  {
    id: 'property-status',
    title: 'Available vs Sold/Rented',
    description: 'Controls whether a property is sold or rented out.',
    iconName: 'Home',
    color: 'from-orange-400 to-red-500',
    useCase: 'Real estate websites (selling/renting apartments, houses, or land) to indicate the current status of the property to clients.',
    active: true,
    order: 5,
    category: 'realestate'
  },
  {
    id: 'featured-properties',
    title: 'Featured Properties',
    description: 'Specifically highlights a property with a Featured badge.',
    iconName: 'Star',
    color: 'from-purple-400 to-pink-500',
    useCase: 'Adding a "Featured" badge on sponsored or premium properties on a real estate website.',
    active: true,
    order: 6,
    category: 'realestate'
  },
  {
    id: 'applicant-count',
    title: 'Applicant Count Column',
    description: 'Shows the number of people who have applied for a specific post.',
    iconName: 'Users',
    color: 'from-blue-400 to-cyan-500',
    useCase: 'Job portal sites to display the current number of applications to candidates or companies.',
    active: true,
    order: 7,
    category: 'jobportal'
  },
  {
    id: 'open-closed',
    title: 'Open vs Closed Status',
    description: 'Indicates whether something is currently running or closed.',
    iconName: 'LockOpen',
    color: 'from-emerald-500 to-green-600',
    useCase: 'Used in job portals (hiring ongoing/closed) or local directory sites (shop/office open or closed).',
    active: true,
    order: 8,
    category: 'jobportal'
  },
  {
    id: 'urgent-hiring',
    title: 'Urgent Hiring',
    description: 'Displays an urgent recruitment badge.',
    iconName: 'AlertCircle',
    color: 'from-red-500 to-rose-600',
    useCase: 'Job portals for positions where a company needs employees quickly. It instantly grabs candidates\' attention.',
    active: true,
    order: 9,
    category: 'jobportal'
  },
  {
    id: 'remote-only',
    title: 'Remote Only',
    description: 'Indicates whether an opportunity allows working from home.',
    iconName: 'Globe',
    color: 'from-sky-400 to-blue-500',
    useCase: 'Given as a badge on job portal listings for "Work From Home" opportunities.',
    active: true,
    order: 10,
    category: 'jobportal'
  },
  {
    id: 'verified-profiles',
    title: 'Verified Profiles (Blue Tick)',
    description: 'Indicates whether a profile is authentic (Verified) and gives a blue tick badge.',
    iconName: 'CheckCircle',
    color: 'from-blue-500 to-indigo-600',
    useCase: 'Directory or community sites (like doctors, lawyers, or membership sites) to separate genuine profiles from fake ones.',
    active: true,
    order: 11,
    category: 'directory'
  },
  {
    id: 'claimed-status',
    title: 'Claimed vs Unclaimed',
    description: 'Determines if a listing has been claimed by the actual business owner.',
    iconName: 'ShieldCheck',
    color: 'from-teal-400 to-emerald-500',
    useCase: 'Directory sites (like Yelp or Yellow Pages) where owners can come and claim ownership of their businesses.',
    active: true,
    order: 12,
    category: 'directory'
  },
  {
    id: 'upcoming-events',
    title: 'Upcoming Events',
    description: 'Label for events that are coming up soon.',
    iconName: 'Calendar',
    color: 'from-indigo-400 to-purple-500',
    useCase: 'Event management or ticket selling sites to make upcoming events attractive.',
    active: true,
    order: 13,
    category: 'event'
  },
  {
    id: 'sold-out',
    title: 'Sold Out',
    description: 'Indicates that tickets or seats are completely sold out.',
    iconName: 'Ticket',
    color: 'from-gray-500 to-slate-600',
    useCase: 'When event ticket sales are finished.',
    active: true,
    order: 14,
    category: 'event'
  },
  {
    id: 'enrollment-status',
    title: 'Enrollment Open/Closed',
    description: 'Toggles whether course enrollment or subscription is ongoing or closed.',
    iconName: 'GraduationCap',
    color: 'from-amber-500 to-orange-600',
    useCase: 'Education or LMS (Learning Management System) sites to control the enrollment status of courses.',
    active: true,
    order: 15,
    category: 'education'
  },
  {
    id: 'certificate-included',
    title: 'Certificate Included',
    description: 'Shows whether a certificate will be provided upon course completion.',
    iconName: 'Award',
    color: 'from-yellow-400 to-amber-500',
    useCase: 'Education sites use this badge to signify extra value or benefits of a course.',
    active: true,
    order: 16,
    category: 'education'
  }
];

export const DEFAULT_PRICING: PricingPlan[] = [
  {
    id: 'plan-personal_annual',
    name: 'Personal',
    price: 19,
    sites: '1 Site',
    popular: false,
    period: 'annual',
    description: 'Perfect for a single project or portfolio site.',
    buttonText: 'Get Personal',
    order: 1,
    features: [
      '1 Year Updates',
      '1 Year Premium Support',
      'All Core Features',
      'WooCommerce Integration',
      '30-Day Money-Back Guarantee'
    ]
  },
  {
    id: 'plan-personal_lifetime',
    name: 'Personal',
    price: 49,
    sites: '1 Site',
    popular: false,
    period: 'lifetime',
    description: 'Perfect for a single project or portfolio site.',
    buttonText: 'Get Personal',
    order: 2,
    features: [
      'Lifetime Updates',
      'Lifetime Premium Support',
      'All Core Features',
      'WooCommerce Integration',
      '30-Day Money-Back Guarantee'
    ]
  },
  {
    id: 'plan-business_annual',
    name: 'Business',
    price: 49,
    sites: '5 Sites',
    popular: false,
    period: 'annual',
    description: 'Ideal for freelancers and small agencies.',
    buttonText: 'Get Business',
    order: 3,
    features: [
      '1 Year Updates',
      '1 Year Premium Support',
      'All Core Features',
      'WooCommerce Integration',
      'Advanced Dynamic Visibility',
      '30-Day Money-Back Guarantee'
    ]
  },
  {
    id: 'plan-business_lifetime',
    name: 'Business',
    price: 149,
    sites: '5 Sites',
    popular: false,
    period: 'lifetime',
    description: 'Ideal for freelancers and small agencies.',
    buttonText: 'Get Business',
    order: 4,
    features: [
      'Lifetime Updates',
      'Lifetime Premium Support',
      'All Core Features',
      'WooCommerce Integration',
      'Advanced Dynamic Visibility',
      '30-Day Money-Back Guarantee'
    ]
  },
  {
    id: 'plan-developer_annual',
    name: 'Developer',
    price: 99,
    sites: 'Unlimited Sites',
    popular: true,
    period: 'annual',
    description: 'Built for large agencies and web professionals.',
    buttonText: 'Get Developer',
    order: 5,
    features: [
      '1 Year Updates',
      '1 Year Premium Support',
      'All Core Features',
      'WooCommerce Integration',
      'Advanced Dynamic Visibility',
      'White Label Options',
      '30-Day Money-Back Guarantee'
    ]
  },
  {
    id: 'plan-developer_lifetime',
    name: 'Developer',
    price: 299,
    sites: 'Unlimited Sites',
    popular: true,
    period: 'lifetime',
    description: 'Built for large agencies and web professionals.',
    buttonText: 'Get Developer',
    order: 6,
    features: [
      'Lifetime Updates',
      'Lifetime Premium Support',
      'All Core Features',
      'WooCommerce Integration',
      'Advanced Dynamic Visibility',
      'White Label Options',
      '30-Day Money-Back Guarantee'
    ]
  }
];

export const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Does it support Custom Post Types and Taxonomies?',
    answer: 'Absolutely. It is fully integrated with WordPress architecture, meaning any CPT, standard Post, or WooCommerce Product is supported natively out of the box.',
    order: 1
  },
  {
    id: 'faq-2',
    question: 'How do I use it with JetEngine Query Builder?',
    answer: 'The plugin saves states as standard metadata. You can effortlessly filter grids, lists, and maps via the JetEngine Query Builder using standard Meta Queries.',
    order: 2
  },
  {
    id: 'faq-3',
    question: 'Is there any performance impact?',
    answer: 'None at all. The plugin uses highly optimized AJAX calls for state toggling. No full-page reloads occur, ensuring the fastest possible user experience.',
    order: 3
  },
  {
    id: 'faq-4',
    question: 'Can I style the feature badges without custom CSS?',
    answer: 'Yes! Our custom Elementor Dynamic Tags allow you to use Elementors native typography, color, and border styling directly in the editor panel.',
    order: 4
  },
  {
    id: 'faq-5',
    question: 'Does this work with standard Elementor Pro loops?',
    answer: 'Yes, as long as you are using JetEngine to construct the custom listing items or injecting our dynamic tags within the Elementor loop templates.',
    order: 5
  }
];

export const DEFAULT_CATEGORIES = [
  { id: 'custom', name: 'Custom Features', icon: 'Sparkles', color: 'text-pink-400' },
  { id: 'general', name: 'General Features', icon: 'Columns', color: 'text-indigo-400' },
  { id: 'ecommerce', name: 'E-commerce Features', icon: 'ShoppingCart', color: 'text-amber-400' },
  { id: 'realestate', name: 'Real Estate Features', icon: 'Home', color: 'text-emerald-400' },
  { id: 'jobportal', name: 'Job Portal Features', icon: 'Folder', color: 'text-yellow-500' },
  { id: 'automotive', name: 'Automotive Features', icon: 'Car', color: 'text-red-400' },
  { id: 'restaurant', name: 'Restaurant Features', icon: 'Utensils', color: 'text-rose-450' },
  { id: 'directory', name: 'Directory Features', icon: 'BookOpen', color: 'text-teal-400' },
  { id: 'event', name: 'Event Features', icon: 'Calendar', color: 'text-purple-450' },
  { id: 'education', name: 'Education Features', icon: 'GraduationCap', color: 'text-sky-400' }
];

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 'global',
  siteName: 'PostStatus',
  siteDescription: 'A world-class product landing page and documentation portal for the Post Status Switcher & Display Badges plugin.',
  heroTitle: 'The Ultimate',
  heroSubtitle: 'Post Status Switcher',
  heroDescription: 'An ultra-light, lightning-fast WordPress plugin that empowers backend workflows and enriches front-end visuals with automated statuses, taxonomy columns, custom criteria, and vibrant display badges.',
  adminEmail: 'mdakash136915@gmail.com',
  logoImageUrl: '',
  heroImageUrl: '',
  adminName: 'Md. Akash',
  adminAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&auto=format&fit=crop',
  pluginDownloadUrl: '',
  
  // Custom Headings Defaults
  ctaButtonText: 'Download WordPress Asset',
  featuresSectionTitle: 'The Interactive Showcase',
  featuresSectionSubtitle: 'Explore the versatile use-cases. Click on any feature to discover how easy it is to set up and integrate.',
  faqSectionTitle: 'Frequently Asked Questions',
  faqSectionSubtitle: 'Everything you need to know about the product, licensing, and installation.',
  pricingSectionTitle: 'Choose Your Plan',
  pricingSectionSubtitle: 'Simple, transparent pricing. Enhance your WordPress and JetEngine projects today.',
  footerCopyrightText: 'PostStatus Switcher. Developed inside secure Cloud Workspace.',
  heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-spinning-glowing-globe-of-data-connections-42289-large.mp4',
  heroVideoPoster: '',
  categoriesList: DEFAULT_CATEGORIES,
  autoReplySubject: 'We have received your support ticket! (Ticket #{ticketID})',
  autoReplyTemplate: 'Hello {name},\n\nThank you for reaching out to us! We have successfully received your support inquiry.\n\nSubject: {subject}\n\nOur team is reviewing your message and will respond to you shortly at {email}.\n\nTicket ID: #{ticketID}\n\nBest regards,\nThe {siteName} Team',
  customAutoReplySubject: '[Module Proposal Registered] Your request for "{moduleTitle}" is serialized!',
  customAutoReplyTemplate: 'Hello {name},\n\nThank you for submitting a custom feature module proposal! We have successfully registered your interest.\n\nProposed Module: {moduleTitle}\nTarget Category: {moduleCategory}\n\nWorkflow Description:\n{moduleDesc}\n\nOur engineering team has received the specifications of the status switcher workflow you described. We will analyze the implementation and contact you shortly at {email} with a development update.\n\nBest regards,\nThe {siteName} Team',
  enableStatusModal: true,
  statusModalTitle: 'Website Development Under Construction',
  statusModalMessage: 'Our website configuration is currently under active development and will be completed very soon. However, you are absolutely welcome to browse and download our premium plugins to start using them directly in your projects right now!\n\nIf you need any setup assistance or have questions about using our plugins, please head down to the Contact Section of this page to communicate directly with us. We will be absolutely delighted to support you!'
};

export const DEFAULT_INTEGRATIONS: Integration[] = [
  {
    id: 'jetengine',
    name: 'CrocoBlock JetEngine',
    subtitle: 'Dynamic Query Builder Addon',
    badge: 'Native Integration',
    description: 'Unlock visual logic inside JetEngine Query Builder. Allows you to effortlessly construct complex meta queries, custom content types, and relation grids based on post state switches.',
    testedVersion: 'v3.2+',
    active: true,
    order: 1
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    subtitle: 'Product State Toggles & Badges',
    badge: 'Certified Compatibility',
    description: 'Enrich product listings and grids with interactive badges. Update real-time status switches for stock status, discount offers, backorders, or special Deals of the Day dynamically.',
    testedVersion: 'v8.0+',
    active: true,
    order: 2
  },
  {
    id: 'elementor',
    name: 'Elementor Pro',
    subtitle: 'Dynamic Tag Rendering',
    badge: 'No-Code Workflow',
    description: 'Provides native Elementor Dynamic Tags out of the box. Use Elementor\'s visual design system to completely style and render post states, display badges, and switch triggers without writing single lines of CSS.',
    testedVersion: 'v3.18+',
    active: true,
    order: 3
  },
  {
    id: 'cpt',
    name: 'Custom Post Type UI (CPT)',
    subtitle: 'Custom Post State Switching',
    badge: 'Core Infrastructure',
    description: 'Fully supports any custom post type. Whether you are listing real estate properties, automotive dealership vehicles, or event tickers, instantly register custom switcher states in CPT UI Admin Tables.',
    testedVersion: 'v1.15+',
    active: true,
    order: 4
  }
];

