import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, ShieldCheck } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'lifetime'>('annual');
  const { pricingPlans } = useData();

  // Filter plans based on selected period
  const activePlans = pricingPlans.filter(plan => plan.period === billingCycle);

  return (
    <section id="pricing" className="py-24 bg-slate-950 relative">
      <div className="max-w-[1320px] mx-auto px-[15px] sm:px-[20px] lg:px-[40px]">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Choose Your Plan</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
            Simple, transparent pricing. Enhance your JetEngine projects today.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 bg-slate-900 border border-slate-800 rounded-full">
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${billingCycle === 'annual' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Annual
            </button>
            <button
              onClick={() => setBillingCycle('lifetime')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${billingCycle === 'lifetime' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Lifetime
              <span className="flex h-2 w-2 rounded-full bg-yellow-300"></span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {activePlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-3xl bg-slate-900 border transition-all duration-300 ${plan.popular ? 'border-amber-500/20 shadow-[0_15px_45px_rgba(245,158,11,0.08)] transform md:-translate-y-4' : 'border-slate-900/80 hover:border-slate-800 shadow-[0_8px_32px_rgba(0,0,0,0.55)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.7)]'} p-8 flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-display font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-display font-bold text-white">${plan.price}</span>
                  <span className="text-slate-400 text-sm mb-1">{billingCycle === 'annual' ? '/year' : '/once'}</span>
                </div>
                <div className="mt-2 inline-block px-3 py-1 bg-slate-800 rounded text-sm text-slate-300 font-medium">
                  {plan.sites} License
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-4 rounded-xl font-medium transition-all cursor-pointer ${
                plan.popular 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                  : 'bg-slate-800 hover:bg-slate-700 text-white' 
              }`}>
                {plan.buttonText || `Get ${plan.name}`}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex justify-center items-center gap-2 text-slate-400 text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          All plans include a risk-free 30-Day Money-Back Guarantee.
        </div>
      </div>
    </section>
  );
}
