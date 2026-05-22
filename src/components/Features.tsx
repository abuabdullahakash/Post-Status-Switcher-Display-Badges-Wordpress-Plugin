import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, Columns, ShoppingCart, Zap, Home, Star, Users, LockOpen, 
  AlertCircle, Globe, CheckCircle, ShieldCheck, Calendar, Ticket, 
  GraduationCap, Award, Plus, Minus 
} from 'lucide-react';

const features = [
  {
    id: 'auto-transition',
    title: 'Auto State Transition',
    description: 'Automatically changes the status of a post based on time.',
    icon: Timer,
    color: 'from-blue-500 to-indigo-500',
    useCase: 'Used when you want to automatically set the status of an event or job post to "Closed" or "Expired" after a specific time passes.'
  },
  {
    id: 'taxonomy-columns',
    title: 'Show Taxonomy Columns',
    description: 'Displays categories or taxonomies in separate columns along with posts in the backend (Admin List Table).',
    icon: Columns,
    color: 'from-slate-500 to-gray-500',
    useCase: 'When you need to quickly track which category a post belongs to from the database or listing view.'
  },
  {
    id: 'stock-status',
    title: 'In Stock / Out of Stock',
    description: 'Shows whether a product is in stock or sold out.',
    icon: ShoppingCart,
    color: 'from-emerald-400 to-teal-500',
    useCase: 'For e-commerce or product listing sites to inform customers about the current stock status of products.'
  },
  {
    id: 'flash-sale',
    title: 'Flash Sale / Deal of the Day',
    description: 'Adds a promotional badge for special offers or discounts.',
    icon: Zap,
    color: 'from-yellow-400 to-amber-500',
    useCase: 'Used on e-commerce sites to highlight massive discounts or offers on specific products.'
  },
  {
    id: 'property-status',
    title: 'Available vs Sold/Rented',
    description: 'Controls whether a property is sold or rented out.',
    icon: Home,
    color: 'from-orange-400 to-red-500',
    useCase: 'Real estate websites (selling/renting apartments, houses, or land) to indicate the current status of the property to clients.'
  },
  {
    id: 'featured-properties',
    title: 'Featured Properties',
    description: 'Specifically highlights a property with a Featured badge.',
    icon: Star,
    color: 'from-purple-400 to-pink-500',
    useCase: 'Adding a "Featured" badge on sponsored or premium properties on a real estate website.'
  },
  {
    id: 'applicant-count',
    title: 'Applicant Count Column',
    description: 'Shows the number of people who have applied for a specific post.',
    icon: Users,
    color: 'from-blue-400 to-cyan-500',
    useCase: 'Job portal sites to display the current number of applications to candidates or companies.'
  },
  {
    id: 'open-closed',
    title: 'Open vs Closed Status',
    description: 'Indicates whether something is currently running or closed.',
    icon: LockOpen,
    color: 'from-emerald-500 to-green-600',
    useCase: 'Used in job portals (hiring ongoing/closed) or local directory sites (shop/office open or closed).'
  },
  {
    id: 'urgent-hiring',
    title: 'Urgent Hiring',
    description: 'Displays an urgent recruitment badge.',
    icon: AlertCircle,
    color: 'from-red-500 to-rose-600',
    useCase: 'Job portals for positions where a company needs employees quickly. It instantly grabs candidates\' attention.'
  },
  {
    id: 'remote-only',
    title: 'Remote Only',
    description: 'Indicates whether an opportunity allows working from home.',
    icon: Globe,
    color: 'from-sky-400 to-blue-500',
    useCase: 'Given as a badge on job portal listings for "Work From Home" opportunities.'
  },
  {
    id: 'verified-profiles',
    title: 'Verified Profiles (Blue Tick)',
    description: 'Indicates whether a profile is authentic (Verified) and gives a blue tick badge.',
    icon: CheckCircle,
    color: 'from-blue-500 to-indigo-600',
    useCase: 'Directory or community sites (like doctors, lawyers, or membership sites) to separate genuine profiles from fake ones.'
  },
  {
    id: 'claimed-status',
    title: 'Claimed vs Unclaimed',
    description: 'Determines if a listing has been claimed by the actual business owner.',
    icon: ShieldCheck,
    color: 'from-teal-400 to-emerald-500',
    useCase: 'Directory sites (like Yelp or Yellow Pages) where owners can come and claim ownership of their businesses.'
  },
  {
    id: 'upcoming-events',
    title: 'Upcoming Events',
    description: 'Label for events that are coming up soon.',
    icon: Calendar,
    color: 'from-indigo-400 to-purple-500',
    useCase: 'Event management or ticket selling sites to make upcoming events attractive.'
  },
  {
    id: 'sold-out',
    title: 'Sold Out',
    description: 'Indicates that tickets or seats are completely sold out.',
    icon: Ticket,
    color: 'from-gray-500 to-slate-600',
    useCase: 'When event ticket sales are finished.'
  },
  {
    id: 'enrollment-status',
    title: 'Enrollment Open/Closed',
    description: 'Toggles whether course enrollment or subscription is ongoing or closed.',
    icon: GraduationCap,
    color: 'from-amber-500 to-orange-600',
    useCase: 'Education or LMS (Learning Management System) sites to control the enrollment status of courses.'
  },
  {
    id: 'certificate-included',
    title: 'Certificate Included',
    description: 'Shows whether a certificate will be provided upon course completion.',
    icon: Award,
    color: 'from-yellow-400 to-amber-500',
    useCase: 'Education sites use this badge to signify extra value or benefits of a course.'
  }
];

export default function Features() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
          {features.map((feature) => {
            const Icon = feature.icon;
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
                        <Icon className="w-6 h-6 text-white" />
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
