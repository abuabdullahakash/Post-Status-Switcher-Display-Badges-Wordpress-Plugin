import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MessageSquare, Send, CheckCircle2, Shield, Sparkles, Phone, HelpCircle, ArrowRight } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Technical Support',
    message: '',
  });

  const [honeypots, setHoneypots] = useState({
    websiteVerification: '',
    faxNumberInput: '',
  });

  const [captcha, setCaptcha] = useState({
    numA: Math.floor(Math.random() * 8 + 2), // 2 to 9
    numB: Math.floor(Math.random() * 8 + 2), // 2 to 9
    userAnswer: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const subjects = [
    { value: 'Technical Support', label: 'Technical Help', emoji: '🛠️' },
    { value: 'License & Billing', label: 'License & Billing', emoji: '💳' },
    { value: 'Custom Integration', label: 'Custom Development', emoji: '🚀' },
    { value: 'Partnership', label: 'General / Partnership', emoji: '🤝' },
  ];

  const generateNewCaptcha = () => {
    setCaptcha({
      numA: Math.floor(Math.random() * 8 + 2),
      numB: Math.floor(Math.random() * 8 + 2),
      userAnswer: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubjectSelect = (subj: string) => {
    setFormData(prev => ({
      ...prev,
      subject: subj
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Please state your full name');
      return;
    }
    if (formData.name.trim().length < 3) {
      setErrorMessage('Full name must be at least 3 characters long.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Please state your email address');
      return;
    }
    if (!formData.message.trim()) {
      setErrorMessage('Please describe your inquiry in detail');
      return;
    }
    if (formData.message.trim().length < 15) {
      setErrorMessage('Message detail is too short. Please write at least 15 characters.');
      return;
    }

    // Client-side quick check for security math puzzle
    if (!captcha.userAnswer.trim()) {
      setErrorMessage('Please solve the simple math security equation below.');
      return;
    }
    if (Number(captcha.userAnswer) !== (captcha.numA + captcha.numB)) {
      setErrorMessage('Incorrect math security answer. Please solve the captcha equation again.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        ...formData,
        websiteVerification: honeypots.websiteVerification,
        faxNumberInput: honeypots.faxNumberInput,
        numA: captcha.numA,
        numB: captcha.numB,
        userAnswer: captcha.userAnswer,
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to dispatch contact form ticket.');
      }

      setIsSubmitted(true);
      // Reset states on success
      setFormData({
        name: '',
        email: '',
        subject: 'Technical Support',
        message: '',
      });
      setHoneypots({
        websiteVerification: '',
        faxNumberInput: '',
      });
      generateNewCaptcha();
    } catch (err: any) {
      console.error('Contact Form Submit Error:', err);
      setErrorMessage(err.message || 'An error occurred while dispatching your ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden border-t border-slate-900 scroll-mt-20">
      {/* Background radial glowing effects */}
      <div className="absolute top-1/4 left-1/10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Introduction */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-extrabold text-blue-400 uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-blue-450 animate-pulse" /> Contact Core Support
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-slate-100 tracking-tight leading-tight">
            Let&apos;s solve a hurdle <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">together</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-light">
            Need help configuring dynamic status conditions or integrating JetSmartFilters? Custom ideas? 
            Drop us a message below, and our team will get back to you inside 1.5 hours.
          </p>
        </div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch max-w-6xl mx-auto">
          
          {/* Left Column: Direct Info cards & Stats */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 transition-all duration-300 shadow-md">
                <h4 className="text-base font-semibold text-slate-200 flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/15">
                    <Mail className="w-4 h-4" />
                  </div>
                  Direct Correspondence
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light mb-3">
                  Reach out directly for general inquiries, custom contract deals, or press relations.
                </p>
                <a 
                  href="mailto:abuabdullahakash@gmail.com" 
                  className="font-mono text-sm text-blue-450 hover:text-blue-300 transition-colors font-medium flex items-center gap-1"
                >
                  abuabdullahakash@gmail.com
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 transition-all duration-300 shadow-md">
                <h4 className="text-base font-semibold text-slate-200 flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                    <Phone className="w-4 h-4" />
                  </div>
                  Customer Consultation
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light mb-3">
                  Active subscribers check our direct call line or raise high-priority WhatsApp workflows.
                </p>
                <span className="font-mono text-sm text-slate-300 font-medium block">
                  01935136915
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 transition-all duration-300 shadow-md">
                <h4 className="text-base font-semibold text-slate-200 flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  Knowledge Base First?
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  Most support answers on JetEngine queries, CSS variables, and shortcodes are fully listed inside our documentation or FAQs right above.
                </p>
                <div className="mt-4">
                  <a 
                    href="#docs"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-450 hover:text-blue-300 transition-colors"
                  >
                    Go to Documentation &rarr;
                  </a>
                </div>
              </div>

            </div>

            {/* Quick Status Bar */}
            <div className="p-5 rounded-2xl bg-blue-950/10 border border-blue-950/25 flex items-center gap-3.5">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <div>
                <span className="text-xs text-slate-200 font-semibold block">Support Status: Fully Active</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Average reply time is 87 minutes. Responding in English and Spanish.</span>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form Box */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/25 border border-slate-900/80 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-sm flex flex-col justify-between h-full min-h-[480px]">
              
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form 
                    key="contact-form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Anti-Spam Hidden Honeypots */}
                    <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden" aria-hidden="true">
                      <input 
                        type="text" 
                        name="websiteVerification" 
                        value={honeypots.websiteVerification} 
                        onChange={(e) => setHoneypots(prev => ({ ...prev, websiteVerification: e.target.value }))} 
                        tabIndex={-1} 
                        autoComplete="off"
                      />
                      <input 
                        type="text" 
                        name="faxNumberInput" 
                        value={honeypots.faxNumberInput} 
                        onChange={(e) => setHoneypots(prev => ({ ...prev, faxNumberInput: e.target.value }))} 
                        tabIndex={-1} 
                        autoComplete="off"
                      />
                    </div>

                    {/* Floating Form Header info in-box */}
                    <div className="flex items-center gap-2 border-b border-slate-900/80 pb-4">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-bold text-slate-100 font-sans">Send Dispatch Ticket</h3>
                    </div>

                    {/* Full Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label htmlFor="name-input" className="block text-xs font-semibold text-slate-350 uppercase tracking-widest font-mono">Full Name</label>
                        <input 
                          id="name-input"
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Johnathan Doe"
                          className="w-full bg-slate-950/80 border border-slate-850 focus:border-blue-500/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-sans"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email-input" className="block text-xs font-semibold text-slate-350 uppercase tracking-widest font-mono">Email Address</label>
                        <input 
                          id="email-input"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john@example.com"
                          className="w-full bg-slate-950/80 border border-slate-850 focus:border-blue-500/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-sans"
                        />
                      </div>
                    </div>

                    {/* Subject Pills Selection */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-semibold text-slate-350 uppercase tracking-widest font-mono">Select Inquiry Category</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                        {subjects.map((s) => {
                          const isSelected = formData.subject === s.value;
                          return (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => handleSubjectSelect(s.value)}
                              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border text-left flex flex-col justify-between transition-all duration-150 cursor-pointer active:scale-95 text-[10px] sm:text-xs ${
                                isSelected 
                                  ? 'bg-blue-900/10 border-blue-500/60 text-blue-300 ring-1 ring-blue-500/20' 
                                  : 'bg-slate-950/50 border-slate-900 text-slate-400 hover:border-slate-800 hover:bg-slate-950'
                              }`}
                            >
                              <span className="text-sm sm:text-base mb-1 sm:mb-1.5">{s.emoji}</span>
                              <span className="font-semibold leading-tight">{s.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detailed Message */}
                    <div className="space-y-2">
                      <label htmlFor="message-input" className="block text-xs font-semibold text-slate-350 uppercase tracking-widest font-mono">Detailed Message</label>
                      <textarea 
                        id="message-input"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Describe your inquiry in detail..."
                        className="w-full bg-slate-950/80 border border-slate-850 focus:border-blue-500/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-sans min-h-[110px]"
                      />
                    </div>

                    {/* Dynamic Math Verification Code Check */}
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900/60 space-y-3">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-350 uppercase tracking-widest font-mono">Security Check</span>
                          <div className="px-2.5 py-1 bg-blue-950/60 border border-blue-500/20 text-blue-400 rounded-lg text-sm font-mono font-bold selection:bg-transparent">
                            {captcha.numA} + {captcha.numB} = ?
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={generateNewCaptcha} 
                          className="text-[10px] text-blue-450 hover:text-blue-300 font-mono transition-colors border-b border-dashed border-blue-450 hover:border-blue-300 cursor-pointer"
                        >
                          Refresh Equation
                        </button>
                      </div>
                      <input 
                        id="captcha-input"
                        type="number"
                        name="captchaUserAnswer"
                        value={captcha.userAnswer}
                        onChange={(e) => setCaptcha(prev => ({ ...prev, userAnswer: e.target.value }))}
                        placeholder="Solve equation to verify you are human..."
                        className="w-full bg-slate-950/80 border border-slate-850 focus:border-blue-500/80 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-mono"
                      />
                    </div>

                    {/* Error Alerts */}
                    {errorMessage && (
                      <div className="p-3 bg-red-900/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-sans flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                        {errorMessage}
                      </div>
                    )}

                    {/* Submit Button & Compliance */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1 border-t border-slate-900/80">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-sans">
                        <Shield className="w-3.5 h-3.5 text-blue-500/80" /> Privacy guaranteed. No spam, ever.
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isSubmitting 
                            ? 'bg-blue-600/50 text-slate-200 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/10 active:scale-95 duration-150'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 border-t-white animate-spin" />
                            Dispatched...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" /> Dispatch Inquiry
                          </>
                        )}
                      </button>
                    </div>

                  </motion.form>
                ) : (
                  <motion.div 
                    key="success-prompt"
                    className="flex flex-col items-center justify-center text-center p-4 sm:p-8 space-y-6 my-auto"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                      <CheckCircle2 className="w-8 h-8 font-extrabold" />
                    </div>
                    
                    <div className="space-y-2 max-w-md">
                      <h4 className="text-xl font-display font-black text-slate-100">Message Dispatched!</h4>
                      <p className="text-slate-400 text-sm leading-relaxed font-light">
                        Thank you for reaching out. Your request has been logged successfully inside our active support queue. 
                        We typically respond within <span className="text-emerald-400 font-semibold">1.5 hours</span> or less.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-850 text-left max-w-sm w-full divide-y divide-slate-900 text-xs font-mono space-y-2">
                      <div className="pb-2 text-slate-400 flex justify-between">
                        <span>Status:</span>
                        <span className="text-emerald-400 font-bold uppercase tracking-wider">QUEUED &bull; ACTIVE</span>
                      </div>
                      <div className="pt-2 text-slate-400 flex justify-between">
                        <span>Ticket ID:</span>
                        <span className="text-slate-300 font-bold uppercase">#ST-{Math.floor(Math.random() * 900000 + 100000)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:text-white text-slate-350 text-xs font-bold uppercase tracking-widest cursor-pointer transition-all active:scale-95 duration-150"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
