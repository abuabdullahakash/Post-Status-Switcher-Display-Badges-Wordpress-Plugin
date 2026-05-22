import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth 
} from '../lib/firebase';
import { 
  signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User, signInWithEmailAndPassword 
} from 'firebase/auth';
import { useData } from '../context/DataContext';
import { Feature, PricingPlan, FAQItem, SiteSettings } from '../types';
import * as Icons from 'lucide-react';

const {
  Lock, AlertCircle, Sparkles, LogOut, Check, Plus, Trash2, 
  Edit3, Eye, Settings2, HelpCircle, Columns, ShoppingCart, 
  Timer, Zap, Home, Star, Users, LockOpen, Globe, CheckCircle, 
  ShieldCheck, Calendar, Ticket, GraduationCap, Award, RefreshCw, X
} = Icons;

interface AdminDashboardProps {
  onClose: () => void;
}

const lucideIconNames = [
  'Timer', 'Columns', 'ShoppingCart', 'Zap', 'Home', 'Star', 'Users', 'LockOpen',
  'AlertCircle', 'Globe', 'CheckCircle', 'ShieldCheck', 'Calendar', 'Ticket',
  'GraduationCap', 'Award', 'HelpCircle', 'Laptop', 'Shield', 'Settings', 'Compass'
];

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const { 
    features, pricingPlans, faqs, settings, isBootstrapping,
    updateFeature, updatePricingPlan, updateSettings, addFAQ, updateFAQ, deleteFAQ, resetToDefaults
  } = useData();

  const [user, setUser] = useState<User | null>(null);
  const [localAdmin, setLocalAdmin] = useState<{ email: string; displayName: string } | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'features' | 'pricing' | 'faq' | 'settings'>('features');
  
  // Create / Edit states
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [isAddingFAQ, setIsAddingFAQ] = useState(false);
  
  // Form fields
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  // Track Google Login Setup
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email === settings.adminEmail) {
        setIsDemoMode(false);
      }
    });
    return () => unsub();
  }, [settings.adminEmail]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google Authentication error:", err);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      // First try real Firebase Email/Password auth
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const signedInUser = userCredential.user;
        if (signedInUser.email === settings.adminEmail) {
          setIsLoggingIn(false);
          return;
        } else {
          alert("Firebase logged in successfully, but email is not specified as superadmin.");
        }
      } catch (fbError: any) {
        console.warn("Firebase Email Login failed or option is disabled in console:", fbError);
        
        // Check fallback if it matches the specific mdakash136915@gmail.com and password config
        if (email.trim() === "mdakash136915@gmail.com" && password === '@12a"ak"') {
          setLocalAdmin({
            email: "mdakash136915@gmail.com",
            displayName: "Md. Akash"
          });
          setIsLoggingIn(false);
          return;
        }
        
        let errMsg = "Authentication failed. Please verify credentials.";
        if (fbError.code === 'auth/wrong-password' || fbError.code === 'auth/user-not-found') {
          errMsg = "Invalid email or password. Please try again.";
        } else if (fbError.code === 'auth/invalid-email') {
          errMsg = "The email address is badly formatted.";
        }
        throw new Error(errMsg);
      }
    } catch (err: any) {
      setLoginError(err.message || String(err));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUserIdBypass(false);
      setLocalAdmin(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const [userIdBypass, setUserIdBypass] = useState(false);

  // Checks authorization
  const isSuperAdmin = 
    (user && user.email === settings.adminEmail) || 
    isDemoMode || 
    userIdBypass ||
    localAdmin !== null;

  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeature) return;
    try {
      await updateFeature(editingFeature);
      setEditingFeature(null);
    } catch (err) {
      alert("Error saving feature. Make sure you are authorized.");
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      await updatePricingPlan(editingPlan);
      setEditingPlan(null);
    } catch (err) {
      alert("Error saving plan. Make sure you are authorized.");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(settings);
      alert("Site settings saved successfully to Firestore!");
    } catch (err) {
      alert("Error saving settings. Make sure you are authorized.");
    }
  };

  const handleAddFAQSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion || !newFaqAnswer) return;
    try {
      await addFAQ({
        question: newFaqQuestion,
        answer: newFaqAnswer,
        order: faqs.length + 1
      });
      setNewFaqQuestion('');
      setNewFaqAnswer('');
      setIsAddingFAQ(false);
    } catch (err) {
      alert("Error adding FAQ.");
    }
  };

  const handleUpdateFAQSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFAQ) return;
    try {
      await updateFAQ(editingFAQ);
      setEditingFAQ(null);
    } catch (err) {
      alert("Error updating FAQ.");
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await deleteFAQ(id);
      } catch (err) {
        alert("Error deleting FAQ.");
      }
    }
  };

  const handleReset = async () => {
    if (confirm("Are you sure you want to RESET all data to the beautifully designed default template data? This will overwrite existing custom changes in Firestore.")) {
      try {
        await resetToDefaults();
        alert("Database successfully reset to beautiful template defaults!");
      } catch (err) {
        alert("Error resetting. Make sure you are authenticated as developer.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh]"
      >
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Settings2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-white">PostStatus Info</h2>
                <p className="text-slate-500 text-xs">Dynamic Control Center</p>
              </div>
            </div>

            {isSuperAdmin && (
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab('features')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'features' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                >
                  <Sparkles className="w-4 h-4" />
                  Feature Cards
                </button>
                <button 
                  onClick={() => setActiveTab('pricing')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'pricing' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                >
                  <Ticket className="w-4 h-4" />
                  Pricing & Plans
                </button>
                <button 
                  onClick={() => setActiveTab('faq')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'faq' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                >
                  <HelpCircle className="w-4 h-4" />
                  FAQ Database
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                >
                  <Columns className="w-4 h-4" />
                  General Canvas
                </button>
              </nav>
            )}
          </div>

          <div className="pt-6 border-t border-slate-850">
            {user || localAdmin ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&auto=format&fit=crop'} 
                    referrerPolicy="no-referrer"
                    alt={user?.displayName || localAdmin?.displayName || 'Admin'} 
                    className="w-10 h-10 rounded-full border border-blue-500/30 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{user?.displayName || localAdmin?.displayName || 'Super Admin'}</p>
                    <p className="text-slate-500 text-xs truncate">{user?.email || localAdmin?.email}</p>
                  </div>
                </div>
                {user && user.email !== settings.adminEmail && (
                  <div className="p-2 gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400 flex items-start">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Your Gmail is not standard Superadmin. View is currently restricted unless you enable Demo Bypass mode.</span>
                  </div>
                )}
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 text-xs transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect Auth
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-500 text-xs text-center border-b border-slate-850 pb-2 mb-2">Login below to customize site elements in real time.</p>
                <div className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                  <span className="font-semibold text-slate-300 block mb-1">Superadmin credentials:</span>
                  <div className="font-mono text-[10px] space-y-0.5 text-slate-400">
                    <div>Email: <span className="text-blue-400 select-all">{settings.adminEmail}</span></div>
                    <div>Pass: <span className="text-blue-400 select-all">@12a"ak"</span></div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDemoMode(!isDemoMode)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${isDemoMode ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-slate-850 text-slate-400 hover:text-slate-200'}`}
                >
                  {isDemoMode ? 'Disable Sandbox Mode' : 'Enable Sandbox Mode (Evaluation)'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 p-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                PostStatus Customizer
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-sans">
                  Active Realtime Sync
                </span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">Changes are directly written to Firestore databases and immediately broadcasted to Vercel/live users.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {!isSuperAdmin ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-lg mx-auto w-full">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-8 shadow-xl"
              >
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-emerald-400 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white">Superadmin Access</h3>
                  <p className="text-slate-400 text-xs mt-1">Authenticate to lock/unlock live site customizer fields.</p>
                </div>

                {loginError && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2 text-left"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </motion.div>
                )}

                {/* Email / Password Form */}
                <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Admin Email Address
                    </label>
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Security Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                      >
                        {showPassword ? 'Hide Secret' : 'Show Secret'}
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Validating Identity...
                      </>
                    ) : (
                      'Sign In Securely'
                    )}
                  </button>
                </form>

                <div className="relative flex py-5 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-mono uppercase tracking-widest">or continue with</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Google Login Provider */}
                  <button 
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-medium text-xs transition-colors"
                  >
                    <svg className="w-4 h-4 mr-0.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.57-5.17 3.57-8.7c0-.4-.03-.8-.09-1.47z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16c-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.18 21.88 7.39 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.32 14.24c-.24-.72-.38-1.5-.38-2.3c0-.8.14-1.58.38-2.3V6.49H1.21C.44 8.04 0 9.97 0 12c0 2.03.44 3.96 1.21 5.51l4.11-3.27z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0C7.39 0 3.18 2.12 1.21 5.51l4.11 3.27c.94-2.85 3.57-4.96 6.68-4.96z"/>
                    </svg>
                    Authenticate with Google Mail
                  </button>

                  {/* Sandbox Bypass Mode */}
                  <button 
                    onClick={() => setIsDemoMode(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-850 text-xs font-semibold transition-all mt-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    Evaluation Sandbox Mode
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="p-8 space-y-8 flex-1">
              
              {/* Reset to defaults warning */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl bg-slate-950 border border-slate-850 gap-4">
                <div>
                  <h4 className="font-semibold text-white text-sm">Need a Fresh Start?</h4>
                  <p className="text-xs text-slate-500 mt-1">Easily populate or restock the database with original designs and settings anytime.</p>
                </div>
                <button 
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 rounded-xl text-xs text-slate-400 hover:text-white transition-all font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  Restore System Defaults
                </button>
              </div>

              {/* FEATURES TAB */}
              {activeTab === 'features' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-display font-bold text-white">Dynamic Feature Cards</h3>
                      <p className="text-sm text-slate-400">Enable, disable, update badges, icons, gradients or use-cases of the 16 features grid.</p>
                    </div>
                  </div>

                  {editingFeature ? (
                    <motion.form 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleSaveFeature}
                      className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4"
                    >
                      <h4 className="font-bold text-white text-sm">Editing Card: {editingFeature.title}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Card Title</label>
                          <input 
                            type="text"
                            value={editingFeature.title}
                            onChange={(e) => setEditingFeature({ ...editingFeature, title: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Use Case Color Layout (Tailwind Gradient)</label>
                          <input 
                            type="text"
                            value={editingFeature.color}
                            onChange={(e) => setEditingFeature({ ...editingFeature, color: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                            required
                          />
                          <span className="text-[10px] text-slate-500">e.g., from-blue-500 to-indigo-500 or from-rose-500 to-red-600</span>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Card High-level Description</label>
                          <textarea 
                            value={editingFeature.description}
                            onChange={(e) => setEditingFeature({ ...editingFeature, description: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-sm h-20 focus:outline-none focus:border-blue-500 resize-none"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Detailed Real-World Use Case Action</label>
                          <textarea 
                            value={editingFeature.useCase}
                            onChange={(e) => setEditingFeature({ ...editingFeature, useCase: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-sm h-20 focus:outline-none focus:border-blue-500 resize-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Lucide Vector Icon Family</label>
                          <select 
                            value={editingFeature.iconName}
                            onChange={(e) => setEditingFeature({ ...editingFeature, iconName: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
                          >
                            {lucideIconNames.map(name => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center h-full pt-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={editingFeature.active}
                              onChange={(e) => setEditingFeature({ ...editingFeature, active: e.target.checked })}
                              className="w-4 h-4 accent-blue-500"
                            />
                            <span className="text-sm text-slate-300 font-medium">Set Feature Status Active / Enabled</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button 
                          type="button" 
                          onClick={() => setEditingFeature(null)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg"
                        >
                          Apply Changes
                        </button>
                      </div>
                    </motion.form>
                  ) : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((feat) => {
                      const IconRaw = (Icons as any)[feat.iconName] || Icons.HelpCircle;
                      return (
                        <div 
                          key={feat.id}
                          className={`p-5 rounded-2xl bg-slate-950 border transition-all ${feat.active ? 'border-slate-850' : 'border-red-500/10 opacity-60'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${feat.color} text-white`}>
                                <IconRaw className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-sm">{feat.title}</h4>
                                <span className="text-[10px] text-slate-500 font-mono">id: {feat.id}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${feat.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400 border border-red-500/10'}`}>
                                {feat.active ? 'Active' : 'Disabled'}
                              </span>
                              <button 
                                onClick={() => setEditingFeature(feat)}
                                className="p-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 mt-4 leading-relaxed line-clamp-2">{feat.description}</p>
                          <div className="mt-3 pt-3 border-t border-slate-900 flex justify-between items-center bg-slate-900/10 p-2 rounded-lg">
                            <div className="flex flex-col gap-0.5 max-w-[85%]">
                              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Use Case Context</span>
                              <span className="text-[10px] text-slate-400 truncate leading-relaxed">{feat.useCase}</span>
                            </div>
                            <span className="text-[11px] font-mono font-bold text-slate-500">#{feat.order}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PRICING PLANS TAB */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white">Pricing Plan Adjuster</h3>
                    <p className="text-sm text-slate-400">Configure prices, available sites licenses, popular flag, and descriptions of sales cards.</p>
                  </div>

                  {editingPlan ? (
                    <motion.form 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleSavePlan}
                      className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4"
                    >
                      <h4 className="font-bold text-white text-sm">Editing Plan: {editingPlan.name} ({editingPlan.period})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Billing Price ($ USD)</label>
                          <input 
                            type="number"
                            value={editingPlan.price}
                            onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Sites Volume Details</label>
                          <input 
                            type="text"
                            value={editingPlan.sites}
                            onChange={(e) => setEditingPlan({ ...editingPlan, sites: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Plan Pitch / Description</label>
                          <textarea 
                            value={editingPlan.description}
                            onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-sm h-20 focus:outline-none focus:border-blue-500 resize-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Call to Action Button Text</label>
                          <input 
                            type="text"
                            value={editingPlan.buttonText}
                            onChange={(e) => setEditingPlan({ ...editingPlan, buttonText: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>
                        <div className="flex items-center h-full pt-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={editingPlan.popular}
                              onChange={(e) => setEditingPlan({ ...editingPlan, popular: e.target.checked })}
                              className="w-4 h-4 accent-blue-500"
                            />
                            <span className="text-sm text-slate-300 font-medium">Mark as most popular / highlight style</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button 
                          type="button" 
                          onClick={() => setEditingPlan(null)}
                          className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg"
                        >
                          Save Pricing Changes
                        </button>
                      </div>
                    </motion.form>
                  ) : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pricingPlans.map((plan) => (
                      <div 
                        key={plan.id}
                        className={`p-6 rounded-2xl bg-slate-950 border ${plan.popular ? 'border-blue-500/50 shadow-md shadow-blue-500/5' : 'border-slate-850'} flex flex-col justify-between`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">{plan.period}</span>
                              <h3 className="text-lg font-bold text-white mt-0.5">{plan.name} Plan</h3>
                            </div>
                            <button 
                              onClick={() => setEditingPlan(plan)}
                              className="p-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-blue-400 font-semibold"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-3xl font-display font-extrabold text-white">${plan.price}</span>
                            <span className="text-slate-500 text-xs">/{plan.period === 'annual' ? 'year' : 'lifetime'}</span>
                          </div>
                          <span className="inline-block px-2.5 py-0.5 bg-slate-900 border border-slate-850 rounded text-xs text-slate-300 font-medium mb-4">
                            {plan.sites} limit
                          </span>
                          <p className="text-slate-400 text-xs leading-relaxed mb-4">{plan.description}</p>
                        </div>

                        <div className="pt-4 border-t border-slate-900 space-y-2">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Actions Summary</span>
                          <span className="text-xs text-slate-400 block truncate font-medium">Button: "{plan.buttonText}"</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ TAB */}
              {activeTab === 'faq' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-display font-bold text-white">FAQ Database Editor</h3>
                      <p className="text-sm text-slate-400">Add, edit, rearrange or delete frequently asked questions on the landing page.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsAddingFAQ(true);
                        setEditingFAQ(null);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add New FAQ Item
                    </button>
                  </div>

                  {/* Add FAQ form */}
                  {isAddingFAQ && (
                    <motion.form 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleAddFAQSubmit}
                      className="p-6 rounded-2xl bg-slate-950 border border-blue-500/20 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-white text-sm">Add New FAQ</h4>
                        <button 
                          type="button"
                          onClick={() => setIsAddingFAQ(false)}
                          className="text-slate-500 hover:text-white text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Question</label>
                          <input 
                            type="text"
                            value={newFaqQuestion}
                            onChange={(e) => setNewFaqQuestion(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                            placeholder="e.g., Can I cancel my service?"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Answer</label>
                          <textarea 
                            value={newFaqAnswer}
                            onChange={(e) => setNewFaqAnswer(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-sm h-28 focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="Describe answer clearly..."
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button 
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                        >
                          Publish FAQ To Site
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* Edit FAQ form */}
                  {editingFAQ && (
                    <motion.form 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleUpdateFAQSubmit}
                      className="p-6 rounded-2xl bg-slate-950 border border-blue-500/20 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-white text-sm">Update FAQ Item</h4>
                        <button 
                          type="button"
                          onClick={() => setEditingFAQ(null)}
                          className="text-slate-500 hover:text-white text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Question</label>
                          <input 
                            type="text"
                            value={editingFAQ.question}
                            onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Answer</label>
                          <textarea 
                            value={editingFAQ.answer}
                            onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-sm h-28 focus:outline-none focus:border-blue-500 resize-none"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button 
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                        >
                          Save FAQ Item
                        </button>
                      </div>
                    </motion.form>
                  )}

                  <div className="space-y-3">
                    {faqs.map((item) => (
                      <div 
                        key={item.id}
                        className="p-5 rounded-2xl bg-slate-950 border border-slate-850 flex items-start gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-base leading-relaxed">{item.question}</h4>
                          <p className="text-slate-400 text-sm mt-2 leading-relaxed">{item.answer}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={() => {
                              setEditingFAQ(item);
                              setIsAddingFAQ(false);
                            }}
                            className="p-2 bg-slate-900 hover:bg-slate-800 text-blue-400 rounded-xl border border-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteFAQ(item.id)}
                            className="p-2 bg-slate-905 hover:bg-red-500/10 text-red-400 rounded-xl border border-red-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white">General Canvas Settings</h3>
                    <p className="text-sm text-slate-400">Alter key landing page headings, branding words, sub-lines, descriptions and contact email configurations.</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-slate-950 border border-slate-850 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1 font-medium">Branding/App Badge Logo Text</label>
                        <input 
                          type="text"
                          value={settings.siteName}
                          onChange={(e) => updateSettings({ ...settings, siteName: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1 font-medium">Superadmin Verified Email (Login permission lock)</label>
                        <input 
                          type="email"
                          value={settings.adminEmail}
                          onChange={(e) => updateSettings({ ...settings, adminEmail: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                          required
                        />
                        <span className="text-[10px] text-slate-500">Only Google Logins matching this email string can make edits in Firestore.</span>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-slate-400 mb-1 font-medium">Site SEO/Metadata Description</label>
                        <input 
                          type="text"
                          value={settings.siteDescription}
                          onChange={(e) => updateSettings({ ...settings, siteDescription: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1 font-medium">Hero Primary Title (Upper)</label>
                        <input 
                          type="text"
                          value={settings.heroTitle}
                          onChange={(e) => updateSettings({ ...settings, heroTitle: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1 font-medium">Hero Core Catchy Title (Highlighted gradient)</label>
                        <input 
                          type="text"
                          value={settings.heroSubtitle}
                          onChange={(e) => updateSettings({ ...settings, heroSubtitle: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-slate-400 mb-1 font-medium">Hero Subtitle Paragraph Narrative</label>
                        <textarea 
                          value={settings.heroDescription}
                          onChange={(e) => updateSettings({ ...settings, heroDescription: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-sm h-28 focus:outline-none focus:border-blue-500 resize-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button 
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20"
                      >
                        Commit Site Settings To Database
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
