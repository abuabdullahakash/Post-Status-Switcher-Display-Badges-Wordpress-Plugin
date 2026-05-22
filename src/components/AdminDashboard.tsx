import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth 
} from '../lib/firebase';
import { 
  signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword 
} from 'firebase/auth';
import { useData } from '../context/DataContext';
import { Feature, PricingPlan, FAQItem, SiteSettings } from '../types';
import * as Icons from 'lucide-react';
import ImageUploader from './ImageUploader';

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
    updateFeature, addFeature, deleteFeature, updatePricingPlan, updateSettings, addFAQ, updateFAQ, deleteFAQ, resetToDefaults
  } = useData();

  const [user, setUser] = useState<User | null>(null);
  const [localAdmin, setLocalAdmin] = useState<{ email: string; displayName: string } | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'features' | 'pricing' | 'faq' | 'settings' | 'media'>('features');
  
  // Create / Edit states
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [isAddingFeature, setIsAddingFeature] = useState(false);
  const [newFeature, setNewFeature] = useState<Partial<Feature>>({
    title: '',
    description: '',
    iconName: 'Sparkles',
    color: 'from-blue-500 to-indigo-500',
    useCase: '',
    active: true,
    order: features.length + 1,
    testimonialQuote: '',
    testimonialAuthor: '',
    testimonialRole: '',
    realWorldCase1Title: '',
    realWorldCase1Subtitle: '',
    realWorldCase1Tag: '',
    realWorldCase1Desc: '',
    realWorldCase2Title: '',
    realWorldCase2Subtitle: '',
    realWorldCase2Tag: '',
    realWorldCase2Desc: '',
    realWorldCase3Title: '',
    realWorldCase3Subtitle: '',
    realWorldCase3Tag: '',
    realWorldCase3Desc: '',
  });
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
    setLoginError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google Authentication error:", err);
      if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed-by-user')) {
        setLoginError("The login popup was closed. IMPORTANT: If you are viewing this app inside the Google AI Studio iframe preview, standard login popups are blocked by browser iframe security. Please click the 'Open in New Tab' icon at the top-right corner of the screen to log in with Google, or sign in using the Email & Password option below!");
      } else {
        setLoginError(`Google Sign-In failed: ${err.message || String(err)}`);
      }
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      // First try real Firebase Email/Password auth
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const signedInUser = userCredential.user;
        if (signedInUser.email === settings.adminEmail) {
          setIsLoggingIn(false);
          return;
        } else {
          alert("Firebase logged in successfully, but email is not specified as superadmin.");
        }
      } catch (fbError: any) {
        console.warn("Firebase Email Login failed or option is disabled in console:", fbError);
        
        // If they entered the superadmin email, attempt automatic account creation in Firebase Auth 
        // to sync Firestore authentication and avoid permissions issues!
        if (email.trim() === "mdakash136915@gmail.com" && (
          fbError.code === 'auth/user-not-found' || 
          fbError.code === 'auth/invalid-credential' || 
          fbError.code === 'auth/invalid-login-credentials' ||
          fbError.message?.includes('user-not-found') || 
          fbError.message?.includes('INVALID_LOGIN_CREDENTIALS')
        )) {
          try {
            console.log("Superadmin user not registered in Firebase Auth, attempting auto-creation...");
            const signUpCred = await createUserWithEmailAndPassword(auth, "mdakash136915@gmail.com", password);
            console.log("Superadmin auto-creation and login successful!");
            setIsLoggingIn(false);
            return;
          } catch (signUpErr: any) {
            console.error("Superadmin auto-creation failed:", signUpErr);
          }
        }

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
        throw new Error(fbError.message || errMsg);
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

  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addFeature({
        title: newFeature.title || 'Untitled Feature',
        description: newFeature.description || '',
        iconName: newFeature.iconName || 'Sparkles',
        color: newFeature.color || 'from-blue-500 to-indigo-500',
        useCase: newFeature.useCase || '',
        active: newFeature.active !== false,
        order: Number(newFeature.order) || features.length + 1,
        testimonialQuote: newFeature.testimonialQuote || '',
        testimonialAuthor: newFeature.testimonialAuthor || '',
        testimonialRole: newFeature.testimonialRole || '',
        realWorldCase1Title: newFeature.realWorldCase1Title || '',
        realWorldCase1Subtitle: newFeature.realWorldCase1Subtitle || '',
        realWorldCase1Tag: newFeature.realWorldCase1Tag || '',
        realWorldCase1Desc: newFeature.realWorldCase1Desc || '',
        realWorldCase2Title: newFeature.realWorldCase2Title || '',
        realWorldCase2Subtitle: newFeature.realWorldCase2Subtitle || '',
        realWorldCase2Tag: newFeature.realWorldCase2Tag || '',
        realWorldCase2Desc: newFeature.realWorldCase2Desc || '',
        realWorldCase3Title: newFeature.realWorldCase3Title || '',
        realWorldCase3Subtitle: newFeature.realWorldCase3Subtitle || '',
        realWorldCase3Tag: newFeature.realWorldCase3Tag || '',
        realWorldCase3Desc: newFeature.realWorldCase3Desc || '',
        videoUrl: newFeature.videoUrl || '',
      });
      setIsAddingFeature(false);
      setNewFeature({
        title: '',
        description: '',
        iconName: 'Sparkles',
        color: 'from-blue-500 to-indigo-500',
        useCase: '',
        active: true,
        order: features.length + 2,
        testimonialQuote: '',
        testimonialAuthor: '',
        testimonialRole: '',
        realWorldCase1Title: '',
        realWorldCase1Subtitle: '',
        realWorldCase1Tag: '',
        realWorldCase1Desc: '',
        realWorldCase2Title: '',
        realWorldCase2Subtitle: '',
        realWorldCase2Tag: '',
        realWorldCase2Desc: '',
        realWorldCase3Title: '',
        realWorldCase3Subtitle: '',
        realWorldCase3Tag: '',
        realWorldCase3Desc: '',
        videoUrl: '',
      });
    } catch (err) {
      alert("Error adding feature.");
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (confirm("Are you sure you want to permanently DELETE this feature card? This is completely irreversible.")) {
      try {
        await deleteFeature(id);
      } catch (err) {
        alert("Error deleting feature.");
      }
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
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row text-slate-200 overflow-hidden">
      {/* Sidebar Nav */}
      <div className="w-full md:w-64 bg-slate-900 border-r border-slate-800/60 p-6 flex flex-col justify-between md:h-screen shrink-0 overflow-y-auto">
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
                <button 
                  onClick={() => setActiveTab('media')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'media' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                >
                  <Icons.CloudLightning className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Media Cloud (ImgBB)
                </button>
              </nav>
            )}
          </div>

          <div className="pt-6 border-t border-slate-850">
            {user || localAdmin ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={settings.adminAvatarUrl || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&auto=format&fit=crop'} 
                    referrerPolicy="no-referrer"
                    alt={settings.adminName || user?.displayName || localAdmin?.displayName || 'Admin'} 
                    className="w-10 h-10 rounded-full border border-blue-500/30 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{settings.adminName || user?.displayName || localAdmin?.displayName || 'Super Admin'}</p>
                    <p className="text-slate-505 text-xs truncate">{user?.email || localAdmin?.email}</p>
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
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950 md:h-screen overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-900 p-6 bg-slate-900/40 backdrop-blur-sm sticky top-0 z-10">
            <div>
              <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                PostStatus Customizer
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-sans tracking-wide">
                  Active Realtime Sync
                </span>
              </h1>
              <p className="text-slate-400 text-xs mt-1">Changes are directly written to Firestore databases and immediately broadcasted to live users.</p>
            </div>
            <button 
              onClick={onClose}
              className="px-4 py-2 text-xs bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-300 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2 font-medium shadow-sm cursor-pointer"
            >
              <Icons.Home className="w-3.5 h-3.5 text-blue-400" />
              <span>Back to Website</span>
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
                  <div className="flex justify-between items-center bg-slate-950 p-5 rounded-2xl border border-slate-900">
                    <div>
                      <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                        <Icons.Sparkles className="w-5 h-5 text-blue-400" />
                        Dynamic Feature Cards
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">Enable, disable, update badges, icons, gradients or use-cases of the 16 features grid.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsAddingFeature(true);
                        setEditingFeature(null);
                      }}
                      className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Feature
                    </button>
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

                      {/* Advanced Single Page Content */}
                      <div className="border-t border-slate-900 pt-6 mt-6 space-y-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <h5 className="text-sm font-bold text-white uppercase tracking-wider">Features Single-Page Custom Overrides</h5>
                        </div>
                        <p className="text-xs text-slate-400">Configure custom testimonials and real-world cases displayed in this specific feature's individual details page. Backs up to high-quality fallback presets if left blank.</p>

                        {/* Video Showcase Input Block */}
                        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                          <div className="flex items-center gap-2">
                            <Icons.Video className="w-4 h-4 text-indigo-400" />
                            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">Custom Showcase Video URL</span>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1 font-medium">Link Web Asset or Youtube embed (supports Ctrl+V and quick pasting)</label>
                            <input 
                              type="text"
                              value={editingFeature.videoUrl || ""}
                              onChange={(e) => setEditingFeature({ ...editingFeature, videoUrl: e.target.value })}
                              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://myhost.com/video.mp4"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-300 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Accepts YouTube watch links or direct MP4/WebM video asset. If left blank, defaults to a high-quality coding stock loop.</p>
                          </div>
                        </div>

                        {/* Testimonial Fields Group */}
                        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 space-y-3">
                          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">Bespoke Customer Interview</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-[11px] text-slate-400 mb-1">Quote</label>
                              <textarea
                                value={editingFeature.testimonialQuote || ""}
                                onChange={(e) => setEditingFeature({ ...editingFeature, testimonialQuote: e.target.value })}
                                placeholder="Integrating post-status badges transformed our content dashboard transparency..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs h-16 focus:outline-none focus:border-blue-500 resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">Author Name</label>
                              <input 
                                type="text" 
                                placeholder="Alex Mercer"
                                value={editingFeature.testimonialAuthor || ""}
                                onChange={(e) => setEditingFeature({ ...editingFeature, testimonialAuthor: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">Author Profession/Company Info</label>
                              <input 
                                type="text" 
                                placeholder="Lead React Architect, JetLabs"
                                value={editingFeature.testimonialRole || ""}
                                onChange={(e) => setEditingFeature({ ...editingFeature, testimonialRole: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Use Case 1 */}
                        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 space-y-3">
                          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">Custom Use-Case #1 Details</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Title</label>
                              <input 
                                type="text" 
                                placeholder="Automated Recruitment Lists"
                                value={editingFeature.realWorldCase1Title || ""}
                                onChange={(e) => setEditingFeature({ ...editingFeature, realWorldCase1Title: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Subtitle</label>
                              <input 
                                type="text" 
                                placeholder="Interactive tracking"
                                value={editingFeature.realWorldCase1Subtitle || ""}
                                onChange={(e) => setEditingFeature({ ...editingFeature, realWorldCase1Subtitle: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Tag / Category Badge</label>
                              <input 
                                type="text" 
                                placeholder="HR Board"
                                value={editingFeature.realWorldCase1Tag || ""}
                                onChange={(e) => setEditingFeature({ ...editingFeature, realWorldCase1Tag: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Description</label>
                              <input 
                                type="text" 
                                placeholder="Help recruiters see applicant counts directly on job postings automatically without refreshing."
                                value={editingFeature.realWorldCase1Desc || ""}
                                onChange={(e) => setEditingFeature({ ...editingFeature, realWorldCase1Desc: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Use Case 2 */}
                        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 space-y-3">
                          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">Custom Use-Case #2 Details</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Title</label>
                              <input 
                                type="text" 
                                placeholder="E-Commerce Badges"
                                value={editingFeature.realWorldCase2Title || ""}
                                onChange={(e) => setEditingFeature({ ...editingFeature, realWorldCase2Title: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Subtitle</label>
                              <input 
                                type="text" 
                                placeholder="Increase Conversions"
                                value={editingFeature.realWorldCase2Subtitle || ""}
                                onChange={(e) => setEditingFeature({ ...editingFeature, realWorldCase2Subtitle: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Tag / Category Badge</label>
                              <input 
                                type="text" 
                                placeholder="WooCommerce"
                                value={editingFeature.realWorldCase2Tag || ""}
                                onChange={(e) => setEditingFeature({ ...editingFeature, realWorldCase2Tag: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Description</label>
                              <input 
                                type="text" 
                                placeholder="Trigger in stock and low inventory warnings instantly with specific color combinations."
                                value={editingFeature.realWorldCase2Desc || ""}
                                onChange={(e) => setEditingFeature({ ...editingFeature, realWorldCase2Desc: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Use Case 3 */}
                        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 space-y-3">
                          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">Custom Use-Case #3 Details</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Title</label>
                              <input 
                                type="text" 
                                placeholder="Medical Staff Portals"
                                value={editingFeature.realWorldCase3Title || ""}
                                onChange={(e) => setEditingFeature({ ...editingFeature, realWorldCase3Title: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Subtitle</label>
                              <input 
                                type="text" 
                                placeholder="Interactive Booking"
                                value={editingFeature.realWorldCase3Subtitle || ""}
                                onChange={(e) => setEditingFeature({ ...editingFeature, realWorldCase3Subtitle: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Tag / Category Badge</label>
                              <input 
                                type="text" 
                                placeholder="Healthcare"
                                value={editingFeature.realWorldCase3Tag || ""}
                                onChange={(e) => setEditingFeature({ ...editingFeature, realWorldCase3Tag: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Description</label>
                              <input 
                                type="text" 
                                placeholder="Track clinic rooms or active appointments in real time using green online indicators."
                                value={editingFeature.realWorldCase3Desc || ""}
                                onChange={(e) => setEditingFeature({ ...editingFeature, realWorldCase3Desc: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-900 mt-4">
                        <button 
                          type="button" 
                          onClick={() => setEditingFeature(null)}
                          className="px-4 py-2 hover:bg-slate-900 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-lg shadow-blue-500/20"
                        >
                          Apply & Save Feature Changes
                        </button>
                      </div>
                    </motion.form>
                  ) : null}

                  {isAddingFeature ? (
                    <motion.form 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleCreateFeature}
                      className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/20 space-y-4 shadow-xl shadow-emerald-500/5"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          <Icons.BadgeAlert className="w-4 h-4 text-emerald-400" />
                          Create New Feature Card Content
                        </h4>
                        <button 
                          type="button" 
                          onClick={() => setIsAddingFeature(false)}
                          className="text-xs text-slate-500 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Card Title</label>
                          <input 
                            type="text"
                            value={newFeature.title || ''}
                            onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                            placeholder="e.g., Live Agent Desk"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Use Case Color Layout (Tailwind Gradient)</label>
                          <input 
                            type="text"
                            value={newFeature.color || ''}
                            onChange={(e) => setNewFeature({ ...newFeature, color: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                            placeholder="from-emerald-500 to-teal-600"
                            required
                          />
                          <span className="text-[10px] text-slate-500">e.g., from-blue-500 to-indigo-500 or from-rose-500 to-red-600</span>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Card High-level Description</label>
                          <textarea 
                            value={newFeature.description || ''}
                            onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-sm h-20 focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="A concise, engaging copy summarising this premium booster feature card..."
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Detailed Real-World Use Case Action</label>
                          <textarea 
                            value={newFeature.useCase || ''}
                            onChange={(e) => setNewFeature({ ...newFeature, useCase: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-sm h-20 focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="Describe concrete scenarios in which site admins rely on this feature's dynamic tags..."
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1 font-medium">Lucide Vector Icon Family</label>
                          <select 
                            value={newFeature.iconName || 'Sparkles'}
                            onChange={(e) => setNewFeature({ ...newFeature, iconName: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
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
                              checked={newFeature.active !== false}
                              onChange={(e) => setNewFeature({ ...newFeature, active: e.target.checked })}
                              className="w-4 h-4 accent-blue-500"
                            />
                            <span className="text-sm text-slate-300 font-medium">Publish Feature Active / Enabled</span>
                          </label>
                        </div>
                      </div>

                      {/* Advanced Single Page Content */}
                      <div className="border-t border-slate-900 pt-6 mt-6 space-y-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <h5 className="text-sm font-bold text-white uppercase tracking-wider">Features Single-Page Custom Overrides (Optional)</h5>
                        </div>
                        <p className="text-xs text-slate-400">Configure custom testimonials and real-world cases displayed in this specific feature's individual details page.</p>

                        {/* Video Showcase Input Block */}
                        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                          <div className="flex items-center gap-2">
                            <Icons.Video className="w-4 h-4 text-indigo-400" />
                            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">Custom Showcase Video URL</span>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1 font-medium">Link Web Asset or Youtube embed (supports Ctrl+V and quick pasting)</label>
                            <input 
                              type="text"
                              value={newFeature.videoUrl || ""}
                              onChange={(e) => setNewFeature({ ...newFeature, videoUrl: e.target.value })}
                              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://myhost.com/video.mp4"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-300 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Accepts YouTube watch links or direct MP4/WebM video asset. If left blank, defaults to a high-quality coding stock loop.</p>
                          </div>
                        </div>

                        {/* Testimonial Fields Group */}
                        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 space-y-3">
                          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">Bespoke Customer Interview</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-[11px] text-slate-400 mb-1">Quote</label>
                              <textarea
                                value={newFeature.testimonialQuote || ""}
                                onChange={(e) => setNewFeature({ ...newFeature, testimonialQuote: e.target.value })}
                                placeholder="Integrating post-status badges transformed our content dashboard transparency..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs h-16 focus:outline-none focus:border-blue-500 resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">Author Name</label>
                              <input 
                                type="text" 
                                placeholder="Alex Mercer"
                                value={newFeature.testimonialAuthor || ""}
                                onChange={(e) => setNewFeature({ ...newFeature, testimonialAuthor: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">Author Profession/Company Info</label>
                              <input 
                                type="text" 
                                placeholder="Lead React Architect, JetLabs"
                                value={newFeature.testimonialRole || ""}
                                onChange={(e) => setNewFeature({ ...newFeature, testimonialRole: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Use Case 1 */}
                        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 space-y-3">
                          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">Custom Use-Case #1 Details</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Title</label>
                              <input 
                                type="text" 
                                placeholder="Automated Recruitment Lists"
                                value={newFeature.realWorldCase1Title || ""}
                                onChange={(e) => setNewFeature({ ...newFeature, realWorldCase1Title: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Subtitle</label>
                              <input 
                                type="text" 
                                placeholder="Interactive tracking"
                                value={newFeature.realWorldCase1Subtitle || ""}
                                onChange={(e) => setNewFeature({ ...newFeature, realWorldCase1Subtitle: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Tag / Category Badge</label>
                              <input 
                                type="text" 
                                placeholder="HR Board"
                                value={newFeature.realWorldCase1Tag || ""}
                                onChange={(e) => setNewFeature({ ...newFeature, realWorldCase1Tag: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Description</label>
                              <input 
                                type="text" 
                                placeholder="Help recruiters see applicant counts directly on job postings automatically without refreshing."
                                value={newFeature.realWorldCase1Desc || ""}
                                onChange={(e) => setNewFeature({ ...newFeature, realWorldCase1Desc: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Use Case 2 */}
                        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 space-y-3">
                          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">Custom Use-Case #2 Details</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Title</label>
                              <input 
                                type="text" 
                                placeholder="E-Commerce Badges"
                                value={newFeature.realWorldCase2Title || ""}
                                onChange={(e) => setNewFeature({ ...newFeature, realWorldCase2Title: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Subtitle</label>
                              <input 
                                type="text" 
                                placeholder="Increase Conversions"
                                value={newFeature.realWorldCase2Subtitle || ""}
                                onChange={(e) => setNewFeature({ ...newFeature, realWorldCase2Subtitle: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Tag / Category Badge</label>
                              <input 
                                type="text" 
                                placeholder="WooCommerce"
                                value={newFeature.realWorldCase2Tag || ""}
                                onChange={(e) => setNewFeature({ ...newFeature, realWorldCase2Tag: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Description</label>
                              <input 
                                type="text" 
                                placeholder="Trigger in stock and low inventory warnings instantly with specific color combinations."
                                value={newFeature.realWorldCase2Desc || ""}
                                onChange={(e) => setNewFeature({ ...newFeature, realWorldCase2Desc: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Use Case 3 */}
                        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 space-y-3">
                          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">Custom Use-Case #3 Details</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Title</label>
                              <input 
                                type="text" 
                                placeholder="Medical Staff Portals"
                                value={newFeature.realWorldCase3Title || ""}
                                onChange={(e) => setNewFeature({ ...newFeature, realWorldCase3Title: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Subtitle</label>
                              <input 
                                type="text" 
                                placeholder="Interactive Booking"
                                value={newFeature.realWorldCase3Subtitle || ""}
                                onChange={(e) => setNewFeature({ ...newFeature, realWorldCase3Subtitle: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Tag / Category Badge</label>
                              <input 
                                type="text" 
                                placeholder="Healthcare"
                                value={newFeature.realWorldCase3Tag || ""}
                                onChange={(e) => setNewFeature({ ...newFeature, realWorldCase3Tag: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Description</label>
                              <input 
                                type="text" 
                                placeholder="Track clinic rooms or active appointments in real time using green online indicators."
                                value={newFeature.realWorldCase3Desc || ""}
                                onChange={(e) => setNewFeature({ ...newFeature, realWorldCase3Desc: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-900 mt-4">
                        <button 
                          type="button" 
                          onClick={() => setIsAddingFeature(false)}
                          className="px-4 py-2 hover:bg-slate-900 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
                        >
                          Deploy New Feature Card
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
                          className={`p-5 rounded-2xl bg-slate-950 border transition-all ${feat.active ? 'border-slate-850' : 'border-amber-500/10 opacity-60'}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${feat.color} text-white`}>
                                <IconRaw className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-sm">{feat.title}</h4>
                                <span className="text-[10px] text-slate-500 font-mono">id: {feat.id}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${feat.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'}`}>
                                {feat.active ? 'Active' : 'Archived'}
                              </span>
                              
                              <button 
                                onClick={() => {
                                  setEditingFeature(feat);
                                  setIsAddingFeature(false);
                                }}
                                className="p-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                              </button>

                              <button 
                                onClick={async () => {
                                  try {
                                    await updateFeature({ ...feat, active: !feat.active });
                                  } catch (err) {
                                    alert("Error modifying status.");
                                  }
                                }}
                                className="p-1 px-2.5 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
                                title={feat.active ? 'Archive/Deactivate this feature' : 'Unarchive/Activate this feature'}
                              >
                                <Icons.Archive className="w-3.5 h-3.5" />
                                {feat.active ? 'Archive' : 'Restore'}
                              </button>

                              <button 
                                onClick={() => handleDeleteFeature(feat.id)}
                                className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-red-500/10 hover:bg-red-555/5 text-slate-500 hover:text-red-400 transition-colors"
                                title="Permanently Delete Feature"
                              >
                                <Icons.Trash2 className="w-3.5 h-3.5" />
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
                      
                      <div className="md:col-span-2 border-t border-slate-900/60 pt-5 mt-4">
                        <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-1.5 uppercase tracking-wide">
                          <Icons.BadgeCheck className="w-4 h-4 text-blue-400" />
                          Brand & Product Visuals (ImgBB Cloud Hosting)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/10 p-4 rounded-2xl border border-slate-900/40">
                          <div className="space-y-2">
                            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Header Brand Logo</span>
                            <ImageUploader 
                              presetUrl={settings.logoImageUrl}
                              onUploadSuccess={(url) => updateSettings({ ...settings, logoImageUrl: url })}
                              label=""
                            />
                            <p className="text-[10px] text-slate-550 leading-normal">Allows custom upload via files, drag and drop, or Ctrl+V clipboard paste. Replaces the generic icon with your brand logo in the header and footer.</p>
                          </div>
                          
                          <div className="space-y-2">
                            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Main Product Mock Image</span>
                            <ImageUploader 
                              presetUrl={settings.heroImageUrl}
                              onUploadSuccess={(url) => updateSettings({ ...settings, heroImageUrl: url })}
                              label=""
                            />
                            <p className="text-[10px] text-slate-550 leading-normal">Loads onto ImgBB and records the direct CDN link on Firestore database. Replaces the default dynamic cards visual with your own custom mockup preview.</p>
                          </div>
                        </div>
                      </div>

                      {/* ADMIN PROFILE EDIT MODULE */}
                      <div className="md:col-span-2 border-t border-slate-900/60 pt-5 mt-4">
                        <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-1.5 uppercase tracking-wide">
                          <Icons.User className="w-4 h-4 text-emerald-400 animate-pulse" />
                          Logged-In Admin Profile Settings
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/10 p-4 rounded-2xl border border-slate-900/40">
                          <div className="space-y-3 justify-center flex flex-col">
                            <div>
                              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Profile Display Name</label>
                              <input 
                                type="text"
                                value={settings.adminName || ""}
                                onChange={(e) => updateSettings({ ...settings, adminName: e.target.value })}
                                placeholder="Md. Akash"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <p className="text-[10px] text-slate-500 leading-normal">Customize the display name shown in the sidebar when you or any other super-administrator logs in.</p>
                          </div>
                          
                          <div className="space-y-2">
                            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Profile Avatar Image</span>
                            <ImageUploader 
                              presetUrl={settings.adminAvatarUrl}
                              onUploadSuccess={(url) => updateSettings({ ...settings, adminAvatarUrl: url })}
                              label=""
                            />
                            <p className="text-[10px] text-slate-550 leading-normal">Change your profile picture quickly. Drag-and-drop support, file selection, or direct pasting (Ctrl+V) from the clipboard are fully integrated.</p>
                          </div>
                        </div>
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

              {/* MEDIA ASSETS TAB */}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                      <Icons.UploadCloud className="w-5 h-5 text-emerald-400 animate-bounce" />
                      Freeform Media Cloud Storage
                    </h3>
                    <p className="text-sm text-slate-400">Perfect for uploading any file, screenshot, mockup, or image. Paste (Ctrl+V) anywhere on the box or drop. The CDN links generated below will be stored in your browser session history for easy copying.</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-900/60">
                    <ImageUploader label="Upload and grab direct ImgBB link" />
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
    </div>
  );
}
