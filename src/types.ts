export interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: string; // e.g., 'Timer', 'Columns', etc.
  color: string; // Tailwind class like 'from-blue-500 to-indigo-500'
  useCase: string;
  active: boolean;
  order: number;
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
}
