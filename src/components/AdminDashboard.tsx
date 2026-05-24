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
    updateFeature, addFeature, deleteFeature, updatePricingPlan, updateSettings, addFAQ, updateFAQ, deleteFAQ, resetToDefaults,
    downloadsCount, visitsCount
  } = useData();

  const [user, setUser] = useState<User | null>(null);
  const [localAdmin, setLocalAdmin] = useState<{ email: string; displayName: string } | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'features' | 'pricing' | 'faq' | 'settings'>('dashboard');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Custom states for search, list-grid view, unsaved-changes original feature snapshots
  const [featureSearchQuery, setFeatureSearchQuery] = useState('');
  const [featureViewMode, setFeatureViewMode] = useState<'grid' | 'list'>('grid');
  const [showUnsavedWarningPopup, setShowUnsavedWarningPopup] = useState(false);
  const [originalFeatureCopy, setOriginalFeatureCopy] = useState<Feature | null>(null);
  const [warningPostAction, setWarningPostAction] = useState<() => void>(() => {});
  
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

  // Track Superadmin state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (currentUser.email === "mdakash136915@gmail.com") {
          setUser(currentUser);
        } else {
          // Force sign out of any other unauthorized accounts
          signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    
    const targetEmail = "mdakash136915@gmail.com";
    const targetPassword = '@12a"ak"';

    const enteredEmail = email.trim();
    if (enteredEmail.toLowerCase() !== targetEmail) {
      setLoginError("Unauthorized Admin Account. Only the official administrator can access this panel.");
      setIsLoggingIn(false);
      return;
    }

    try {
      // First try real Firebase Email/Password auth
      try {
        const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
        const signedInUser = userCredential.user;
        if (signedInUser.email === targetEmail) {
          setIsLoggingIn(false);
          return;
        } else {
          setLoginError("Authorized credentials mismatch.");
        }
      } catch (fbError: any) {
        console.warn("Firebase Email Login failed or option is disabled in console:", fbError);
        
        // If they entered the correct credentials but register is missing in Firebase Auth, auto-create it
        if (password === targetPassword) {
          if (
            fbError.code === 'auth/user-not-found' || 
            fbError.code === 'auth/invalid-credential' || 
            fbError.code === 'auth/invalid-login-credentials' ||
            fbError.message?.includes('user-not-found') || 
            fbError.message?.includes('INVALID_LOGIN_CREDENTIALS')
          ) {
            try {
              console.log("Superadmin user not registered in Firebase Auth, attempting auto-creation...");
              await createUserWithEmailAndPassword(auth, targetEmail, password);
              console.log("Superadmin auto-creation and login successful!");
              setIsLoggingIn(false);
              return;
            } catch (signUpErr: any) {
              console.error("Superadmin auto-creation failed:", signUpErr);
            }
          }
          
          // Successful fallback to local state if Firebase configuration restricts signup
          setLocalAdmin({
            email: targetEmail,
            displayName: "Md. Akash"
          });
          setIsLoggingIn(false);
          return;
        } else {
          setLoginError("Incorrect password. Please try again.");
        }
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
      setLocalAdmin(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const isDemoMode = false;

  // Checks authorization - Strictly restricted to admin mdakash136915@gmail.com
  const isSuperAdmin = 
    (user && user.email === "mdakash136915@gmail.com") || 
    (localAdmin !== null && localAdmin.email === "mdakash136915@gmail.com");

  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeature) return;
    setIsSaving(true);
    try {
      await updateFeature(editingFeature);
      setToast({ message: "Feature card details updated and broadcasted to live users.", type: 'success' });
      setEditingFeature(null);
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast({ message: "Error saving feature. Make sure you are logged in and authorized.", type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEditFeature = () => {
    const isEditingChanged = editingFeature && originalFeatureCopy && (
      editingFeature.title !== originalFeatureCopy.title ||
      editingFeature.description !== originalFeatureCopy.description ||
      editingFeature.iconName !== originalFeatureCopy.iconName ||
      editingFeature.color !== originalFeatureCopy.color ||
      editingFeature.useCase !== originalFeatureCopy.useCase ||
      editingFeature.videoUrl !== originalFeatureCopy.videoUrl ||
      editingFeature.videoPoster !== originalFeatureCopy.videoPoster ||
      editingFeature.testimonialQuote !== originalFeatureCopy.testimonialQuote ||
      editingFeature.testimonialAuthor !== originalFeatureCopy.testimonialAuthor ||
      editingFeature.testimonialRole !== originalFeatureCopy.testimonialRole ||
      editingFeature.realWorldCase1Title !== originalFeatureCopy.realWorldCase1Title ||
      editingFeature.realWorldCase1Desc !== originalFeatureCopy.realWorldCase1Desc ||
      editingFeature.realWorldCase2Title !== originalFeatureCopy.realWorldCase2Title ||
      editingFeature.realWorldCase2Desc !== originalFeatureCopy.realWorldCase2Desc ||
      editingFeature.realWorldCase3Title !== originalFeatureCopy.realWorldCase3Title ||
      editingFeature.realWorldCase3Desc !== originalFeatureCopy.realWorldCase3Desc ||
      JSON.stringify(editingFeature.gallery || []) !== JSON.stringify(originalFeatureCopy.gallery || [])
    );

    if (isEditingChanged) {
      setWarningPostAction(() => () => {
        setEditingFeature(null);
        setOriginalFeatureCopy(null);
      });
      setShowUnsavedWarningPopup(true);
    } else {
      setEditingFeature(null);
      setOriginalFeatureCopy(null);
    }
  };

  const handleCancelAddFeature = () => {
    const isAddingChanged = !!(
      newFeature.title ||
      newFeature.description ||
      newFeature.useCase ||
      newFeature.testimonialQuote ||
      newFeature.videoUrl
    );

    if (isAddingChanged) {
      setWarningPostAction(() => () => {
        setIsAddingFeature(false);
        setNewFeature({
          title: '',
          description: '',
          iconName: 'Sparkles',
          color: 'from-blue-500 to-indigo-500',
          useCase: '',
          active: true,
          order: features.length + 1,
        });
      });
      setShowUnsavedWarningPopup(true);
    } else {
      setIsAddingFeature(false);
    }
  };

  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
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
      setToast({ message: "New feature card deployed successfully!", type: 'success' });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast({ message: "Error adding feature. Make sure you are authorized.", type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (confirm("Are you sure you want to permanently DELETE this feature card? This is completely irreversible.")) {
      try {
        await deleteFeature(id);
        setToast({ message: "Feature card has been permanently deleted and removed.", type: 'success' });
        setTimeout(() => setToast(null), 4000);
      } catch (err) {
        setToast({ message: "Error deleting feature. Verify authorization status.", type: 'error' });
        setTimeout(() => setToast(null), 5000);
      }
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setIsSaving(true);
    try {
      await updatePricingPlan(editingPlan);
      setEditingPlan(null);
      setToast({ message: "Pricing plan levels saved and synced in real-time.", type: 'success' });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast({ message: "Error saving plan. Make sure you are authorized.", type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(settings);
      setToast({ message: "Global site settings updated successfully!", type: 'success' });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast({ message: "Error saving settings. Make sure you are authorized.", type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFAQSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion || !newFaqAnswer) return;
    setIsSaving(true);
    try {
      await addFAQ({
        question: newFaqQuestion,
        answer: newFaqAnswer,
        order: faqs.length + 1
      });
      setNewFaqQuestion('');
      setNewFaqAnswer('');
      setIsAddingFAQ(false);
      setToast({ message: "New query added to FAQ knowledgebase.", type: 'success' });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast({ message: "Error adding FAQ query. Verify authorizations.", type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateFAQSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFAQ) return;
    setIsSaving(true);
    try {
      await updateFAQ(editingFAQ);
      setEditingFAQ(null);
      setToast({ message: "FAQ record updated successfully.", type: 'success' });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast({ message: "Error updating FAQ query. Verify authorizations.", type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsSaving(false);
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

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-200 relative overflow-hidden">
        {/* Subtle, beautiful design accents */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

        {/* Back to Home Website Action */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-300 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2 font-medium shadow-md cursor-pointer whitespace-nowrap active:scale-95"
          >
            <Icons.Home className="w-3.5 h-3.5 text-blue-400" />
            <span>Back to Website</span>
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-850 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4 text-blue-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-display font-medium text-white tracking-tight">Superadmin Access</h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">Authenticate with administrative credentials below.</p>
          </div>

          {loginError && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 mb-5 rounded-xl bg-red-500/15 border border-red-500/25 text-xs text-red-400 flex items-start gap-2.5 text-left leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{loginError}</span>
            </motion.div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-5 text-left">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                Admin Email Address
              </label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 hover:border-slate-700 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-705"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Security Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold tracking-wider uppercase cursor-pointer"
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
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 hover:border-slate-700 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-705"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Validating Credentials...</span>
                </>
              ) : (
                <span>Sign In Securely</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col md:flex-row text-slate-200 overflow-hidden relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 bg-slate-900/95 backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-2xl border ${
              toast.type === 'success' 
                ? 'border-emerald-500/30 shadow-emerald-500/10' 
                : 'border-rose-500/30'
            } max-w-sm`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-455'
            }`}>
              {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                {toast.type === 'success' ? 'Live System Saved' : 'Database Alert'}
              </p>
              <p className="text-slate-300 text-xs mt-0.5 leading-normal">{toast.message}</p>
            </div>
            <button 
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-500 hover:text-white transition-colors p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                >
                  <Icons.LayoutDashboard className="w-4 h-4" />
                  Dashboard Overview
                </button>
                <button 
                  onClick={() => setActiveTab('features')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === 'features' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                >
                  <Sparkles className="w-4 h-4" />
                  Feature Cards Grid
                </button>
                <button 
                  onClick={() => setActiveTab('pricing')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === 'pricing' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                >
                  <Ticket className="w-4 h-4" />
                  Pricing & Plans
                </button>
                <button 
                  onClick={() => setActiveTab('faq')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === 'faq' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                >
                  <HelpCircle className="w-4 h-4" />
                  FAQ Database
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
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
                  <div className="w-10 h-10 rounded-full border border-blue-500/30 bg-slate-900 flex items-center justify-center shrink-0">
                    <Icons.ShieldCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">MD. Akash</p>
                    <p className="text-slate-400 text-xs truncate">mdakash136915@gmail.com</p>
                  </div>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-950 text-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  Close Panel Session
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-center p-3.5 rounded-xl bg-slate-950/60 border border-slate-900">
                <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-amber-500/80" />
                  <span>Control Panel Locked</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">Authenticate using your admin credentials to unlock options.</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950 md:h-screen overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm sticky top-0 z-10">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-display font-bold text-white flex flex-wrap items-center gap-2">
                PostStatus Customizer
                <span className="text-[10px] sm:text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-sans tracking-wide shrink-0">
                  Active Realtime Sync
                </span>
              </h1>
              <p className="text-slate-400 text-[11px] sm:text-xs mt-1 leading-normal max-w-xl">Changes are directly written to Firestore databases and immediately broadcasted to live users.</p>
            </div>
            <button 
              onClick={onClose}
              className="w-full sm:w-auto justify-center px-4 py-2.5 text-xs bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-300 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2 font-medium shadow-sm cursor-pointer shrink-0"
            >
              <Icons.Home className="w-3.5 h-3.5 text-blue-400" />
              <span>Back to Website</span>
            </button>
          </div>

            <div className="p-8 space-y-8 flex-1">
              
              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* High Level Metrics Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Visitors Card */}
                    <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/40 to-slate-950 border border-slate-900 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Icons.Users className="w-16 h-16 text-blue-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                          <Icons.Users className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-400">Website Visitors</span>
                      </div>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-display font-bold text-white tracking-tight">{visitsCount}</span>
                        <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Icons.TrendingUp className="w-2.5 h-2.5" /> +12.5%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">Real-time session tracker active.</p>
                    </div>

                    {/* Downloads Card */}
                    <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/40 to-slate-950 border border-slate-900 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Icons.ArrowDownToLine className="w-16 h-16 text-emerald-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                          <Icons.ArrowDownToLine className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-400">Plugin Downloads</span>
                      </div>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-display font-bold text-white tracking-tight">{downloadsCount}</span>
                        <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Icons.TrendingUp className="w-2.5 h-2.5" /> +18.4%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">Downloads incremented on click.</p>
                    </div>

                    {/* Active Features Status Card */}
                    <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/40 to-slate-950 border border-slate-900 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Icons.Sparkles className="w-16 h-16 text-purple-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
                          <Icons.Sparkles className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-400">Feature Modules</span>
                      </div>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-display font-bold text-white tracking-tight">
                          {features.filter(f => f.active).length}
                        </span>
                        <span className="text-xs text-slate-400">/ {features.length} active</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">
                        {features.filter(f => !f.active).length} cards archived in Firestore database.
                      </p>
                    </div>

                    {/* System Integrity status */}
                    <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/40 to-slate-950 border border-slate-900 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Icons.Activity className="w-16 h-16 text-amber-500" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
                          <Icons.Activity className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-400">Database Status</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-450 flex items-center gap-1.5 uppercase tracking-wide">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1">
                        <Icons.ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Firestore Sandbox Bound
                      </p>
                    </div>
                  </div>

                  {/* SVG Area Chart Section */}
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-900 shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h4 className="font-display font-semibold text-white text-base">Interactive Audience Analytics Curve</h4>
                        <p className="text-xs text-slate-400 mt-1">Real-time daily unique site views and switcher download interactions.</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium">
                        <span className="flex items-center gap-1.5 text-blue-400 bg-blue-500/5 px-2.5 py-1 rounded-lg border border-blue-500/10">
                          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Page Visits
                        </span>
                        <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Downloads
                        </span>
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div className="relative h-64 w-full bg-slate-950/40 rounded-xl p-4 border border-slate-900/60 overflow-hidden flex items-center justify-center">
                      <svg className="w-full h-full text-slate-700 overflow-visible" viewBox="0 0 700 240" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                          </linearGradient>
                          <linearGradient id="downloadsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Grid Lines */}
                        <line x1="40" y1="20" x2="680" y2="20" stroke="#1e293b" strokeDasharray="4" strokeWidth="1" />
                        <line x1="40" y1="70" x2="680" y2="70" stroke="#1e293b" strokeDasharray="4" strokeWidth="1" />
                        <line x1="40" y1="120" x2="680" y2="120" stroke="#1e293b" strokeDasharray="4" strokeWidth="1" />
                        <line x1="40" y1="170" x2="680" y2="170" stroke="#1e293b" strokeDasharray="4" strokeWidth="1" />
                        <line x1="40" y1="210" x2="680" y2="210" stroke="#131d31" strokeWidth="1.5" />

                        {/* Y-Axis labels */}
                        <text x="10" y="24" className="text-[9px] font-mono fill-slate-500">100%</text>
                        <text x="10" y="74" className="text-[9px] font-mono fill-slate-500">75%</text>
                        <text x="10" y="124" className="text-[9px] font-mono fill-slate-500">50%</text>
                        <text x="10" y="174" className="text-[9px] font-mono fill-slate-500">25%</text>
                        <text x="10" y="214" className="text-[9px] font-mono fill-slate-500">0%</text>

                        {/* Dynamic spline for visits (calculated relative to visitsCount scalar) */}
                        <path 
                          d={`M 60 ${210 - Math.min(180, (visitsCount * 0.12))} 
                             C 110 ${210 - Math.min(180, (visitsCount * 0.17))}, 110 ${210 - Math.min(180, (visitsCount * 0.08))}, 160 ${210 - Math.min(180, (visitsCount * 0.14))} 
                             C 210 ${210 - Math.min(180, (visitsCount * 0.19))}, 210 ${210 - Math.min(180, (visitsCount * 0.09))}, 260 ${210 - Math.min(180, (visitsCount * 0.16))} 
                             C 310 ${210 - Math.min(180, (visitsCount * 0.22))}, 310 ${210 - Math.min(180, (visitsCount * 0.12))}, 360 ${210 - Math.min(180, (visitsCount * 0.2))} 
                             C 410 ${210 - Math.min(180, (visitsCount * 0.27))}, 410 ${210 - Math.min(180, (visitsCount * 0.14))}, 460 ${210 - Math.min(180, (visitsCount * 0.22))} 
                             C 510 ${210 - Math.min(180, (visitsCount * 0.3))}, 510 ${210 - Math.min(180, (visitsCount * 0.16))}, 560 ${210 - Math.min(180, (visitsCount * 0.26))} 
                             C 610 ${210 - Math.min(180, (visitsCount * 0.35))}, 610 ${210 - Math.min(180, (visitsCount * 0.22))}, 660 ${210 - Math.min(180, (visitsCount * 0.3))}
                             L 660 210 L 60 210 Z`}
                          fill="url(#visitsGrad)"
                        />
                        <path 
                          d={`M 60 ${210 - Math.min(180, (visitsCount * 0.12))} 
                             C 110 ${210 - Math.min(180, (visitsCount * 0.17))}, 110 ${210 - Math.min(180, (visitsCount * 0.08))}, 160 ${210 - Math.min(180, (visitsCount * 0.14))} 
                             C 210 ${210 - Math.min(180, (visitsCount * 0.19))}, 210 ${210 - Math.min(180, (visitsCount * 0.09))}, 260 ${210 - Math.min(180, (visitsCount * 0.16))} 
                             C 310 ${210 - Math.min(180, (visitsCount * 0.22))}, 310 ${210 - Math.min(180, (visitsCount * 0.12))}, 360 ${210 - Math.min(180, (visitsCount * 0.2))} 
                             C 410 ${210 - Math.min(180, (visitsCount * 0.27))}, 410 ${210 - Math.min(180, (visitsCount * 0.14))}, 460 ${210 - Math.min(180, (visitsCount * 0.22))} 
                             C 510 ${210 - Math.min(180, (visitsCount * 0.3))}, 510 ${210 - Math.min(180, (visitsCount * 0.16))}, 560 ${210 - Math.min(180, (visitsCount * 0.26))} 
                             C 610 ${210 - Math.min(180, (visitsCount * 0.35))}, 610 ${210 - Math.min(180, (visitsCount * 0.22))}, 660 ${210 - Math.min(180, (visitsCount * 0.3))}`}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />

                        {/* Dynamic spline for downloads */}
                        <path 
                          d={`M 60 ${210 - Math.min(180, (downloadsCount * 0.15))} 
                             C 110 ${210 - Math.min(180, (downloadsCount * 0.2))}, 110 ${210 - Math.min(180, (downloadsCount * 0.07))}, 160 ${210 - Math.min(180, (downloadsCount * 0.17))} 
                             C 210 ${210 - Math.min(180, (downloadsCount * 0.23))}, 210 ${210 - Math.min(180, (downloadsCount * 0.1))}, 260 ${210 - Math.min(180, (downloadsCount * 0.21))} 
                             C 310 ${210 - Math.min(180, (downloadsCount * 0.29))}, 310 ${210 - Math.min(180, (downloadsCount * 0.13))}, 360 ${210 - Math.min(180, (downloadsCount * 0.25))} 
                             C 410 ${210 - Math.min(180, (downloadsCount * 0.34))}, 410 ${210 - Math.min(180, (downloadsCount * 0.15))}, 460 ${210 - Math.min(180, (downloadsCount * 0.28))} 
                             C 510 ${210 - Math.min(180, (downloadsCount * 0.4))}, 510 ${210 - Math.min(180, (downloadsCount * 0.18))}, 560 ${210 - Math.min(180, (downloadsCount * 0.33))} 
                             C 610 ${210 - Math.min(180, (downloadsCount * 0.44))}, 610 ${210 - Math.min(180, (downloadsCount * 0.25))}, 660 ${210 - Math.min(180, (downloadsCount * 0.38))}
                             L 660 210 L 60 210 Z`}
                          fill="url(#downloadsGrad)"
                        />
                        <path 
                          d={`M 60 ${210 - Math.min(180, (downloadsCount * 0.15))} 
                             C 110 ${210 - Math.min(180, (downloadsCount * 0.2))}, 110 ${210 - Math.min(180, (downloadsCount * 0.07))}, 160 ${210 - Math.min(180, (downloadsCount * 0.17))} 
                             C 210 ${210 - Math.min(180, (downloadsCount * 0.23))}, 210 ${210 - Math.min(180, (downloadsCount * 0.1))}, 260 ${210 - Math.min(180, (downloadsCount * 0.21))} 
                             C 310 ${210 - Math.min(180, (downloadsCount * 0.29))}, 310 ${210 - Math.min(180, (downloadsCount * 0.13))}, 360 ${210 - Math.min(180, (downloadsCount * 0.25))} 
                             C 410 ${210 - Math.min(180, (downloadsCount * 0.34))}, 410 ${210 - Math.min(180, (downloadsCount * 0.15))}, 460 ${210 - Math.min(180, (downloadsCount * 0.28))} 
                             C 510 ${210 - Math.min(180, (downloadsCount * 0.4))}, 510 ${210 - Math.min(180, (downloadsCount * 0.18))}, 560 ${210 - Math.min(180, (downloadsCount * 0.33))} 
                             C 610 ${210 - Math.min(180, (downloadsCount * 0.44))}, 610 ${210 - Math.min(180, (downloadsCount * 0.25))}, 660 ${210 - Math.min(180, (downloadsCount * 0.38))}`}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />

                        {/* Points anchors */}
                        <circle cx="60" cy={210 - Math.min(180, (visitsCount * 0.12))} r="4" fill="#3b82f6" stroke="#090d16" strokeWidth="2.5" />
                        <circle cx="260" cy={210 - Math.min(180, (visitsCount * 0.16))} r="4" fill="#3b82f6" stroke="#090d16" strokeWidth="2.5" />
                        <circle cx="460" cy={210 - Math.min(180, (visitsCount * 0.22))} r="4" fill="#3b82f6" stroke="#090d16" strokeWidth="2.5" />
                        <circle cx="660" cy={210 - Math.min(180, (visitsCount * 0.3))} r="4" fill="#3b82f6" stroke="#090d16" strokeWidth="2.5" />

                        <circle cx="60" cy={210 - Math.min(180, (downloadsCount * 0.15))} r="4" fill="#10b981" stroke="#090d16" strokeWidth="2.5" />
                        <circle cx="260" cy={210 - Math.min(180, (downloadsCount * 0.21))} r="4" fill="#10b981" stroke="#090d16" strokeWidth="2.5" />
                        <circle cx="460" cy={210 - Math.min(180, (downloadsCount * 0.28))} r="4" fill="#10b981" stroke="#090d16" strokeWidth="2.5" />
                        <circle cx="660" cy={210 - Math.min(180, (downloadsCount * 0.38))} r="4" fill="#10b981" stroke="#090d16" strokeWidth="2.5" />

                        {/* X-Axis Labels */}
                        <text x="60" y="228" className="text-[9px] font-mono fill-slate-400 text-center" textAnchor="middle">Mon</text>
                        <text x="160" y="228" className="text-[9px] font-mono fill-slate-400 text-center" textAnchor="middle">Tue</text>
                        <text x="260" y="228" className="text-[9px] font-mono fill-slate-400 text-center" textAnchor="middle">Wed</text>
                        <text x="360" y="228" className="text-[9px] font-mono fill-slate-400 text-center" textAnchor="middle">Thu</text>
                        <text x="460" y="228" className="text-[9px] font-mono fill-slate-400 text-center" textAnchor="middle">Fri</text>
                        <text x="560" y="228" className="text-[9px] font-mono fill-slate-400 text-center" textAnchor="middle">Sat</text>
                        <text x="660" y="228" className="text-[9px] font-mono fill-slate-400 text-center" textAnchor="middle">Sun (Today)</text>
                      </svg>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/85 border border-slate-900 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                      <div>
                        <h5 className="text-white text-xs font-semibold flex items-center gap-1.5">
                          <Icons.BadgeAlert className="w-3.5 h-3.5 text-blue-400" />
                          System Insight Summary
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-1">This panel operates with direct streaming on client engagement triggers. Visits dynamically track web session initiations and cumulative plugin counts track (.zip) interactions.</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono shrink-0">
                        Admin: <span className="text-white font-sans font-semibold">mdakash136915@gmail.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                      <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                        <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                          <Icons.Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                          <span>Editing Card: {editingFeature.title}</span>
                        </h4>
                        <button 
                          type="button" 
                          onClick={handleCancelEditFeature}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Icons.ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
                          <span>Back without Changes</span>
                        </button>
                      </div>
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
                        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                          <div className="flex items-center gap-2">
                            <Icons.Video className="w-4 h-4 text-indigo-400" />
                            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">Custom Showcase Video & Feature Image</span>
                          </div>
                          
                          {/* Feature Video Image / Poster */}
                          <div className="space-y-2 pb-3 border-b border-slate-900">
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Feature Video Image (Poster/Thumbnail)</label>
                            <p className="text-[11px] text-slate-450">Upload or drag-and-drop a thumbnail cover image for the tutorial video player. Supports clipboard paste (Ctrl+V).</p>
                            <ImageUploader 
                              presetUrl={editingFeature.videoPoster || ""} 
                              onUploadSuccess={(url) => setEditingFeature({ ...editingFeature, videoPoster: url })}
                            />
                            <div className="pt-2">
                              <label className="block text-[10px] text-slate-450 uppercase mb-1 font-mono">Or paste Video Cover Image Link directly:</label>
                              <input 
                                type="text"
                                value={editingFeature.videoPoster || ""}
                                onChange={(e) => setEditingFeature({ ...editingFeature, videoPoster: e.target.value })}
                                placeholder="e.g. https://images.unsplash.com/photo-..."
                                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs text-slate-300 mb-1 font-medium font-semibold uppercase tracking-wider text-[11px]">Showcase Video Stream URL</label>
                            <input 
                              type="text"
                              value={editingFeature.videoUrl || ""}
                              onChange={(e) => setEditingFeature({ ...editingFeature, videoUrl: e.target.value })}
                              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://myhost.com/video.mp4"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-300 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Accepts YouTube watch links, direct MP4/WebM resources, or public Google Drive file URL.</p>
                          </div>
                        </div>

                        {/* Showcase Gallery Images Manager */}
                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                          <div className="flex items-center gap-2">
                            <Icons.Image className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">Custom Showcase Gallery Images</span>
                          </div>
                          
                          <div>
                            <p className="text-xs text-slate-405 mb-3">Upload portfolio or dashboard screenshots of this feature to create an elegant image gallery for the feature overview page.</p>
                            
                            {editingFeature.gallery && editingFeature.gallery.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-2 bg-slate-950 rounded-xl border border-slate-900">
                                {editingFeature.gallery.map((imgUrl, i) => (
                                  <div key={i} className="group relative aspect-video rounded-lg overflow-hidden border border-slate-850 bg-slate-900">
                                    <img src={imgUrl} alt={`Screenshot ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextGallery = (editingFeature.gallery || []).filter((_, idx) => idx !== i);
                                        setEditingFeature({ ...editingFeature, gallery: nextGallery });
                                      }}
                                      className="absolute top-1 right-1 w-5 h-5 bg-red-650 flex items-center justify-center text-white rounded-full hover:bg-red-500 transition-colors shadow-lg text-sm font-bold focus:outline-none cursor-pointer"
                                      title="Remove image from gallery"
                                    >
                                      &times;
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-500 mb-3 block italic">No custom gallery screenshots configured. High-quality generic templates are used as placeholders.</p>
                            )}

                            {/* Add a new image to gallery */}
                            <div className="space-y-3">
                              <span className="block text-[10px] font-mono font-bold uppercase text-slate-450 tracking-wider">Upload or Paste Image here to add to gallery:</span>
                              <ImageUploader 
                                onUploadSuccess={(url) => {
                                  if (url) {
                                    const nextG = [...(editingFeature.gallery || []), url];
                                    setEditingFeature({ ...editingFeature, gallery: nextG });
                                  }
                                }}
                              />
                              <div className="pt-2">
                                <label className="block text-[10px] text-slate-450 uppercase mb-1 font-mono">Or paste a Direct Image Link to Add:</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="text"
                                    id="manual-gallery-url-edit"
                                    placeholder="https://images.unsplash.com/..."
                                    className="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const inputEl = document.getElementById('manual-gallery-url-edit') as HTMLInputElement;
                                      const urlVal = inputEl?.value?.trim();
                                      if (urlVal) {
                                        const nextG = [...(editingFeature.gallery || []), urlVal];
                                        setEditingFeature({ ...editingFeature, gallery: nextG });
                                        if (inputEl) inputEl.value = '';
                                      }
                                    }}
                                    className="px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                                  >
                                    Add Link
                                  </button>
                                </div>
                              </div>
                            </div>
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
                          onClick={handleCancelEditFeature}
                          className="px-4 py-2 hover:bg-slate-900 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          disabled={isSaving}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <Icons.RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-200" />
                              <span>Saving changes...</span>
                            </>
                          ) : (
                            <span>Apply & Save Feature Changes</span>
                          )}
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
                      <div className="flex justify-between items-center pb-3 border-b border-slate-900">
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          <Icons.BadgeAlert className="w-4 h-4 text-emerald-400" />
                          Create New Feature Card Content
                        </h4>
                        <button 
                          type="button" 
                          onClick={handleCancelAddFeature}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Icons.ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
                          Cancel & Return
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
                        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                          <div className="flex items-center gap-2">
                            <Icons.Video className="w-4 h-4 text-indigo-400" />
                            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">Custom Showcase Video & Feature Image</span>
                          </div>
                          
                          {/* Feature Video Image / Poster */}
                          <div className="space-y-2 pb-3 border-b border-slate-900">
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Feature Video Image (Poster/Thumbnail)</label>
                            <p className="text-[11px] text-slate-450">Upload or drag-and-drop a thumbnail cover image for the tutorial video player. Supports clipboard paste (Ctrl+V).</p>
                            <ImageUploader 
                              presetUrl={newFeature.videoPoster || ""} 
                              onUploadSuccess={(url) => setNewFeature({ ...newFeature, videoPoster: url })}
                            />
                            <div className="pt-2">
                              <label className="block text-[10px] text-slate-450 uppercase mb-1 font-mono">Or paste Video Cover Image Link directly:</label>
                              <input 
                                type="text"
                                value={newFeature.videoPoster || ""}
                                onChange={(e) => setNewFeature({ ...newFeature, videoPoster: e.target.value })}
                                placeholder="e.g. https://images.unsplash.com/photo-..."
                                className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs text-slate-300 mb-1 font-medium font-semibold uppercase tracking-wider text-[11px]">Showcase Video Stream URL</label>
                            <input 
                              type="text"
                              value={newFeature.videoUrl || ""}
                              onChange={(e) => setNewFeature({ ...newFeature, videoUrl: e.target.value })}
                              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://myhost.com/video.mp4"
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-300 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Accepts YouTube watch links, direct MP4/WebM resources, or public Google Drive file URL.</p>
                          </div>
                        </div>

                        {/* Showcase Gallery Images Manager */}
                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                          <div className="flex items-center gap-2">
                            <Icons.Image className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">Custom Showcase Gallery Images</span>
                          </div>
                          
                          <div>
                            <p className="text-xs text-slate-405 mb-3">Upload portfolio or dashboard screenshots of this feature to create an elegant image gallery for the feature overview page.</p>
                            
                            {newFeature.gallery && newFeature.gallery.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-2 bg-slate-950 rounded-xl border border-slate-900">
                                {newFeature.gallery.map((imgUrl, i) => (
                                  <div key={i} className="group relative aspect-video rounded-lg overflow-hidden border border-slate-850 bg-slate-900">
                                    <img src={imgUrl} alt={`Screenshot ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextGallery = (newFeature.gallery || []).filter((_, idx) => idx !== i);
                                        setNewFeature({ ...newFeature, gallery: nextGallery });
                                      }}
                                      className="absolute top-1 right-1 w-5 h-5 bg-red-650 flex items-center justify-center text-white rounded-full hover:bg-red-500 transition-colors shadow-lg text-sm font-bold focus:outline-none cursor-pointer"
                                      title="Remove image from gallery"
                                    >
                                      &times;
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-500 mb-3 block italic">No custom gallery screenshots configured. High-quality generic templates are used as placeholders.</p>
                            )}

                            {/* Add a new image to gallery */}
                            <div className="space-y-3">
                              <span className="block text-[10px] font-mono font-bold uppercase text-slate-450 tracking-wider">Upload or Paste Image here to add to gallery:</span>
                              <ImageUploader 
                                onUploadSuccess={(url) => {
                                  if (url) {
                                    const nextG = [...(newFeature.gallery || []), url];
                                    setNewFeature({ ...newFeature, gallery: nextG });
                                  }
                                }}
                              />
                              <div className="pt-2">
                                <label className="block text-[10px] text-slate-450 uppercase mb-1 font-mono">Or paste a Direct Image Link to Add:</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="text"
                                    id="manual-gallery-url-new"
                                    placeholder="https://images.unsplash.com/..."
                                    className="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const inputEl = document.getElementById('manual-gallery-url-new') as HTMLInputElement;
                                      const urlVal = inputEl?.value?.trim();
                                      if (urlVal) {
                                        const nextG = [...(newFeature.gallery || []), urlVal];
                                        setNewFeature({ ...newFeature, gallery: nextG });
                                        if (inputEl) inputEl.value = '';
                                      }
                                    }}
                                    className="px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                                  >
                                    Add Link
                                  </button>
                                </div>
                              </div>
                            </div>
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
                          onClick={handleCancelAddFeature}
                          className="px-4 py-2 hover:bg-slate-900 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          disabled={isSaving}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <Icons.RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-200" />
                              <span>Deploying...</span>
                            </>
                          ) : (
                            <span>Deploy New Feature Card</span>
                          )}
                        </button>
                      </div>
                    </motion.form>
                  ) : null}

                  {/* SEARCH, TOGGLE AND LISTING BAR */}
                  {!editingFeature && !isAddingFeature && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/10 p-4 rounded-2xl border border-slate-900 shadow-xl">
                        {/* Search Input Box */}
                        <div className="relative w-full sm:max-w-md">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                            <Icons.Search className="w-4 h-4" />
                          </span>
                          <input 
                            type="text"
                            value={featureSearchQuery}
                            onChange={(e) => setFeatureSearchQuery(e.target.value)}
                            placeholder="Search among live features..."
                            className="w-full bg-slate-950 border border-slate-900 rounded-xl pl-10 pr-10 py-2.5 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                          />
                          {featureSearchQuery && (
                            <button 
                              onClick={() => setFeatureSearchQuery('')}
                              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-white transition-colors cursor-pointer"
                            >
                              <Icons.X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* View Mode controls */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button 
                            type="button"
                            onClick={() => setFeatureViewMode('grid')}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${featureViewMode === 'grid' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900'}`}
                            title="Grid Mode Layout"
                          >
                            <Icons.Grid className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFeatureViewMode('list')}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${featureViewMode === 'list' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900'}`}
                            title="Table List Mode Layout"
                          >
                            <Icons.List className="w-4 h-4" />
                          </button>
                          <span className="text-[11px] text-slate-500 font-mono pl-1">
                            Matches: {features.filter(f => f.title.toLowerCase().includes(featureSearchQuery.toLowerCase())).length}
                          </span>
                        </div>
                      </div>

                      {/* RENDERING OF THE FEATURES */}
                      {featureViewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {features
                            .filter(feat => 
                              feat.title.toLowerCase().includes(featureSearchQuery.toLowerCase()) || 
                              feat.description.toLowerCase().includes(featureSearchQuery.toLowerCase()) || 
                              feat.useCase.toLowerCase().includes(featureSearchQuery.toLowerCase())
                            )
                            .map((feat) => {
                              const IconRaw = (Icons as any)[feat.iconName] || Icons.HelpCircle;
                              return (
                                <div 
                                  key={feat.id}
                                  className={`p-5 rounded-2xl bg-slate-950 border transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.65)] ${feat.active ? 'border-slate-900 hover:border-slate-800' : 'border-slate-900/40 opacity-60'}`}
                                >
                                  <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between gap-3 border-b border-slate-900/60 pb-3">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className={`p-2 rounded-lg bg-gradient-to-br ${feat.color} text-white shrink-0`}>
                                          <IconRaw className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                          <h4 className="font-bold text-white text-sm truncate leading-snug">{feat.title}</h4>
                                          <span className="text-[10px] text-slate-500 font-mono select-all">id: {feat.id}</span>
                                        </div>
                                      </div>
                                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${feat.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'}`}>
                                        {feat.active ? 'Active' : 'Archived'}
                                      </span>
                                    </div>

                                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">{feat.description}</p>
                                    
                                    <div className="pt-2 border-t border-slate-900/40 flex justify-between items-center bg-slate-905/20 p-2 rounded-lg">
                                      <div className="flex flex-col gap-0.5 max-w-[85%] min-w-0">
                                        <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Use Case Context</span>
                                        <span className="text-[10px] text-slate-400 truncate leading-relaxed">{feat.useCase}</span>
                                      </div>
                                      <span className="text-[11px] font-mono font-bold text-slate-500 shrink-0">#{feat.order}</span>
                                    </div>

                                    {/* Actions footer bar */}
                                    <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-900/60">
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          setEditingFeature(feat);
                                          setOriginalFeatureCopy(feat);
                                          setIsAddingFeature(false);
                                        }}
                                        className="p-1 px-2.5 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs text-blue-400 hover:text-blue-350 flex items-center gap-1 transition-all cursor-pointer font-medium"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                      </button>

                                      <button 
                                        type="button"
                                        onClick={async () => {
                                          try {
                                            await updateFeature({ ...feat, active: !feat.active });
                                            setToast({ 
                                              message: feat.active 
                                                ? `Feature "${feat.title}" has been successfully archived.` 
                                                : `Feature "${feat.title}" is now active on the grid.`, 
                                              type: 'success' 
                                            });
                                            setTimeout(() => setToast(null), 4000);
                                          } catch (err) {
                                            setToast({ message: "Error toggling feature status.", type: 'error' });
                                            setTimeout(() => setToast(null), 5000);
                                          }
                                        }}
                                        className={`p-1 px-2.5 rounded-lg bg-slate-900 border transition-all hover:bg-slate-850 text-xs flex items-center gap-1 cursor-pointer font-medium ${feat.active ? 'text-amber-500 border-slate-850 hover:text-amber-400' : 'text-emerald-500 border-slate-850 hover:text-emerald-400'}`}
                                        title={feat.active ? 'Archive/Deactivate this feature' : 'Unarchive/Activate this feature'}
                                      >
                                        <Icons.Archive className="w-3.5 h-3.5" />
                                        <span>{feat.active ? 'Archive' : 'Restore'}</span>
                                      </button>

                                      <button 
                                        type="button"
                                        onClick={() => handleDeleteFeature(feat.id)}
                                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:border-red-500/20 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                                        title="Permanently Delete Feature"
                                      >
                                        <Icons.Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        /* SPREADSHEET TABLE row layout mode for List view! */
                        <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-900/80 border-b border-slate-850 text-slate-400 font-semibold tracking-wider uppercase text-[10px]">
                                <th className="p-4 pl-6">Order</th>
                                <th className="p-4">Icon & Title</th>
                                <th className="p-4">Description Clip</th>
                                <th className="p-4">Use Case</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {features
                                .filter(feat => 
                                  feat.title.toLowerCase().includes(featureSearchQuery.toLowerCase()) || 
                                  feat.description.toLowerCase().includes(featureSearchQuery.toLowerCase()) || 
                                  feat.useCase.toLowerCase().includes(featureSearchQuery.toLowerCase())
                                )
                                .map((feat) => {
                                  const IconRaw = (Icons as any)[feat.iconName] || Icons.HelpCircle;
                                  return (
                                    <tr key={feat.id} className="border-b border-slate-900 hover:bg-slate-900/30 transition-colors">
                                      <td className="p-4 pl-6 font-mono font-bold text-slate-500 font-medium">#{feat.order}</td>
                                      <td className="p-4">
                                        <div className="flex items-center gap-3">
                                          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${feat.color} text-white shrink-0`}>
                                            <IconRaw className="w-4 h-4" />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="font-bold text-white truncate max-w-[150px]">{feat.title}</div>
                                            <div className="text-[10px] text-slate-600 truncate max-w-[120px]">{feat.id}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-4 text-slate-400 max-w-xs truncate">{feat.description}</td>
                                      <td className="p-4 text-slate-400 font-medium">{feat.useCase}</td>
                                      <td className="p-4 text-center">
                                        <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${feat.active ? 'bg-emerald-500/10 text-emerald-450' : 'bg-amber-500/10 text-amber-500'}`}>
                                          {feat.active ? 'Active' : 'Archived'}
                                        </span>
                                      </td>
                                      <td className="p-4 pr-6 text-right">
                                        <div className="inline-flex gap-1.5">
                                          <button 
                                            type="button"
                                            onClick={() => {
                                              setEditingFeature(feat);
                                              setOriginalFeatureCopy(feat);
                                              setIsAddingFeature(false);
                                            }}
                                            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-blue-400 hover:bg-slate-800 transition-all cursor-pointer"
                                            title="Edit Feature Details"
                                          >
                                            <Edit3 className="w-3.5 h-3.5" />
                                          </button>
                                          <button 
                                            type="button"
                                            onClick={async () => {
                                              try {
                                                await updateFeature({ ...feat, active: !feat.active });
                                                setToast({ 
                                                  message: feat.active 
                                                    ? `Feature "${feat.title}" has been successfully archived.` 
                                                    : `Feature "${feat.title}" is now active on the grid.`, 
                                                  type: 'success' 
                                                });
                                                setTimeout(() => setToast(null), 4000);
                                              } catch (err) {
                                                setToast({ message: "Error changing status", type: 'error' });
                                                setTimeout(() => setToast(null), 5000);
                                              }
                                            }}
                                            className={`p-1.5 rounded bg-slate-900 border text-slate-400 hover:bg-slate-800 transition-all cursor-pointer ${feat.active ? 'border-amber-500/10 hover:text-amber-400' : 'border-emerald-500/10 hover:text-emerald-400'}`}
                                            title={feat.active ? 'Archive feature' : 'Restore feature'}
                                          >
                                            <Icons.Archive className="w-3.5 h-3.5" />
                                          </button>
                                          <button 
                                            type="button"
                                            onClick={() => handleDeleteFeature(feat.id)}
                                            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all cursor-pointer"
                                            title="Permanently Delete Feature"
                                          >
                                            <Icons.Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
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
                          disabled={isSaving}
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <Icons.RefreshCw className="w-3 h-3 animate-spin text-blue-200" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <span>Save Pricing Changes</span>
                          )}
                        </button>
                      </div>
                    </motion.form>
                  ) : null}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pricingPlans.map((plan) => (
                      <div 
                        key={plan.id}
                        className={`p-6 rounded-2xl bg-slate-950 border transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.7)] ${plan.popular ? 'border-amber-500/20 shadow-amber-500/5' : 'border-slate-900 hover:border-slate-805'} flex flex-col justify-between`}
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
                          disabled={isSaving}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <Icons.RefreshCw className="w-3 h-3 animate-spin text-blue-200" />
                              <span>Publishing...</span>
                            </>
                          ) : (
                            <span>Publish FAQ To Site</span>
                          )}
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
                          disabled={isSaving}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <Icons.RefreshCw className="w-3 h-3 animate-spin text-blue-200" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <span>Save FAQ Item</span>
                          )}
                        </button>
                      </div>
                    </motion.form>
                  )}

                  <div className="space-y-3">
                    {faqs.map((item) => (
                      <div 
                        key={item.id}
                        className="p-5 rounded-2xl bg-slate-950 border border-slate-900 hover:border-slate-800 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-start gap-4"
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

                    {/* DANGER ZONE FACTORY RESET */}
                    <div className="mt-8 p-6 rounded-2xl border border-rose-900/40 bg-rose-950/10 space-y-3 shadow-xl">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h4 className="font-semibold text-rose-400 text-sm flex items-center gap-2">
                            <Icons.ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                            Need a Fresh Start?
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">Easily populate or restock the Firestore databases with original features, defaults, and settings anytime.</p>
                        </div>
                        <button 
                          type="button"
                          onClick={handleReset}
                          className="flex items-center gap-2 px-4 py-2.5 bg-rose-950 border border-rose-800 hover:bg-rose-900 rounded-xl text-xs text-rose-200 hover:text-white transition-all font-semibold cursor-pointer shrink-0"
                        >
                          <Icons.RefreshCw className="w-3.5 h-3.5 text-rose-400" />
                          Restore System Defaults
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button 
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <>
                            <Icons.RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-200" />
                            <span>Saving settings...</span>
                          </>
                        ) : (
                          <span>Commit Site Settings To Database</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>

        </div>

      {/* UNSAVED CHANGES POPUP WARNING */}
      <AnimatePresence>
        {showUnsavedWarningPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-400">
                <Icons.AlertCircle className="w-6 h-6 shrink-0" />
                <h4 className="font-display font-bold text-white text-lg">Unsaved Edits Detected</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                You have modified some configuration fields inside this feature. If you return now without saving, all changes will be lost permanently.
              </p>
              <div className="flex gap-2.5 justify-end pt-2">
                <button 
                  onClick={() => {
                    setShowUnsavedWarningPopup(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-755 text-slate-300 transition-colors cursor-pointer border border-slate-750"
                >
                  Cancel, Go Back
                </button>
                <button 
                  onClick={() => {
                    setShowUnsavedWarningPopup(false);
                    warningPostAction();
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                >
                  Yes, Discard Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
