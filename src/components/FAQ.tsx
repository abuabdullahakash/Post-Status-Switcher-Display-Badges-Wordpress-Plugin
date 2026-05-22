import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Does it support Custom Post Types and Taxonomies?',
    answer: 'Absolutely. It is fully integrated with WordPress architecture, meaning any CPT, standard Post, or WooCommerce Product is supported natively out of the box.'
  },
  {
    question: 'How do I use it with JetEngine Query Builder?',
    answer: 'The plugin saves states as standard metadata. You can effortlessly filter grids, lists, and maps via the JetEngine Query Builder using standard Meta Queries.'
  },
  {
    question: 'Is there any performance impact?',
    answer: 'None at all. The plugin uses highly optimized AJAX calls for state toggling. No full-page reloads occur, ensuring the fastest possible user experience.'
  },
  {
    question: 'Can I style the feature badges without custom CSS?',
    answer: 'Yes! Our custom Elementor Dynamic Tags allow you to use Elementor\'s native typography, color, and border styling directly in the editor panel.'
  },
  {
    question: 'Does this work with standard Elementor Pro loops?',
    answer: 'Yes, as long as you are using JetEngine to construct the custom listing items or injecting our dynamic tags within the Elementor loop templates.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-slate-900 border-y border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                  isOpen ? 'bg-slate-800/80 border-blue-500/30' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className={`font-semibold text-lg ${isOpen ? 'text-blue-400' : 'text-slate-200'}`}>
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-blue-400' : ''}`}
                  />
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 pt-2 text-slate-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
