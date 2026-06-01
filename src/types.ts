export interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: string; // e.g., 'Timer', 'Columns', etc.
  color: string; // Tailwind class like 'from-blue-500 to-indigo-500'
  useCase: string;
  active: boolean;
  order: number;
  
  // Custom single page elements
  testimonialQuote?: string;
  testimonialAuthor?: string;
  testimonialRole?: string;
  
  realWorldCase1Title?: string;
  realWorldCase1Subtitle?: string;
  realWorldCase1Desc?: string;
  realWorldCase1Tag?: string;

  realWorldCase2Title?: string;
  realWorldCase2Subtitle?: string;
  realWorldCase2Desc?: string;
  realWorldCase2Tag?: string;

  realWorldCase3Title?: string;
  realWorldCase3Subtitle?: string;
  realWorldCase3Desc?: string;
  realWorldCase3Tag?: string;
  videoUrl?: string;
  videoPoster?: string;
  gallery?: string[];
  galleryCaptions?: string[];
  tutorialVideos?: { id: string; url: string; title: string; poster?: string }[];
  
  // Pending moderation details
  pendingApproval?: 'create' | 'update' | null;
  pendingUpdateData?: Partial<Feature> | null;
  category?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  sites: string;
  popular: boolean;
  features: string[];
  description: string;
  period: 'annual' | 'lifetime';
  buttonText: string;
  order: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  adminEmail: string;
  logoImageUrl?: string;
  heroImageUrl?: string;
  adminName?: string;
  adminAvatarUrl?: string;
  pluginDownloadUrl?: string;
  
  // Custom Section Headings & Badges Settings
  ctaButtonText?: string;
  featuresSectionTitle?: string;
  featuresSectionSubtitle?: string;
  faqSectionTitle?: string;
  faqSectionSubtitle?: string;
  pricingSectionTitle?: string;
  pricingSectionSubtitle?: string;
  footerCopyrightText?: string;
  heroVideoUrl?: string;
  heroVideoPoster?: string;
  categoriesList?: { id: string; name: string; icon: string; color?: string }[];

  // SMTP & Mail Settings
  smtpEmail?: string;
  smtpAppPassword?: string;
  adminNotificationEmail?: string;
  autoReplySubject?: string;
  autoReplyTemplate?: string;
  customAutoReplySubject?: string;
  customAutoReplyTemplate?: string;
}
