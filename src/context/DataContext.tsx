import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, doc, setDoc, onSnapshot, getDocs, deleteDoc, writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Feature, PricingPlan, FAQItem, SiteSettings } from '../types';
import { 
  DEFAULT_FEATURES, DEFAULT_PRICING, DEFAULT_FAQS, DEFAULT_SETTINGS 
} from '../lib/defaults';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface DataContextType {
  features: Feature[];
  pricingPlans: PricingPlan[];
  faqs: FAQItem[];
  settings: SiteSettings;
  loading: boolean;
  isBootstrapping: boolean;
  downloadsCount: number;
  visitsCount: number;
  updateFeature: (feature: Feature) => Promise<void>;
  addFeature: (feature: Omit<Feature, 'id'>) => Promise<void>;
  deleteFeature: (id: string) => Promise<void>;
  updatePricingPlan: (plan: PricingPlan) => Promise<void>;
  updateSettings: (settings: SiteSettings) => Promise<void>;
  addFAQ: (faq: Omit<FAQItem, 'id'>) => Promise<void>;
  updateFAQ: (faq: FAQItem) => Promise<void>;
  deleteFAQ: (id: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  incrementDownload: () => Promise<void>;
  incrementVisit: () => Promise<void>;
  updateStatsCounts: (visits: number, downloads: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  // Read starting counts from local storage, fallback to standard numbers
  const [downloadsCount, setDownloadsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('poststatus_downloads');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  
  const [visitsCount, setVisitsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('poststatus_visits');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const incrementDownload = async () => {
    setDownloadsCount((prev) => {
      const next = prev + 1;
      localStorage.setItem('poststatus_downloads', String(next));
      setDoc(doc(db, 'settings', 'stats'), { downloadsCount: next }, { merge: true }).catch(() => {});
      return next;
    });
  };

  const incrementVisit = async () => {
    setVisitsCount((prev) => {
      const next = prev + 1;
      localStorage.setItem('poststatus_visits', String(next));
      setDoc(doc(db, 'settings', 'stats'), { visitsCount: next }, { merge: true }).catch(() => {});
      return next;
    });
  };

  const updateStatsCounts = async (visits: number, downloads: number) => {
    setVisitsCount(visits);
    setDownloadsCount(downloads);
    try {
      localStorage.setItem('poststatus_visits', String(visits));
      localStorage.setItem('poststatus_downloads', String(downloads));
      await setDoc(doc(db, 'settings', 'stats'), { 
        visitsCount: visits, 
        downloadsCount: downloads 
      }, { merge: true });
    } catch (e) {
      console.warn("Storage update warnings bypassed.", e);
    }
  };

  // Check and bootstrap Firestore with initial defaults if empty
  const bootstrapIfNeeded = async () => {
    try {
      setIsBootstrapping(true);
      
      // Let's check features
      const featuresSnap = await getDocs(collection(db, 'features')).catch(() => null);
      const needsFeatures = !featuresSnap || featuresSnap.empty;

      if (needsFeatures) {
        console.log("Empty database detected. Bootstrapping default data...");
        
        // Write settings
        await setDoc(doc(db, 'settings', 'global'), DEFAULT_SETTINGS);

        // Write features in batch or sequentially
        const batch = writeBatch(db);
        DEFAULT_FEATURES.forEach((feat) => {
          const ref = doc(db, 'features', feat.id);
          batch.set(ref, feat);
        });

        DEFAULT_PRICING.forEach((plan) => {
          const ref = doc(db, 'pricingPlans', plan.id);
          batch.set(ref, plan);
        });

        DEFAULT_FAQS.forEach((faq) => {
          const ref = doc(db, 'faqs', faq.id);
          batch.set(ref, faq);
        });

        await batch.commit();
        console.log("Bootstrap complete!");
      }
    } catch (err) {
      console.warn("Bootstrap/initial checks failed or lacked permissions. Using local/fallback rules.", err);
    } finally {
      setIsBootstrapping(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrapIfNeeded();

    // Increment website visits once per browser session
    try {
      const sessionKey = 'poststatus_session_visited';
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, 'true');
        incrementVisit();
      }
    } catch (e) {
      console.warn("Storage blocker bypassed.");
    }

    // Setup active listeners for each collection
    const unsubFeatures = onSnapshot(
      collection(db, 'features'),
      (snapshot) => {
        const list: Feature[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Feature);
        });
        setFeatures(list.sort((a, b) => a.order - b.order));
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'features');
      }
    );

    const unsubPricing = onSnapshot(
      collection(db, 'pricingPlans'),
      (snapshot) => {
        const list: PricingPlan[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as PricingPlan);
        });
        setPricingPlans(list.sort((a, b) => a.order - b.order));
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'pricingPlans');
      }
    );

    const unsubFaq = onSnapshot(
      collection(db, 'faqs'),
      (snapshot) => {
        const list: FAQItem[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as FAQItem);
        });
        setFaqs(list.sort((a, b) => a.order - b.order));
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'faqs');
      }
    );

    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'global'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SiteSettings);
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/global');
      }
    );

    const unsubStats = onSnapshot(
      doc(db, 'settings', 'stats'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.downloadsCount !== undefined) {
            setDownloadsCount(data.downloadsCount);
            localStorage.setItem('poststatus_downloads', String(data.downloadsCount));
          }
          if (data.visitsCount !== undefined) {
            setVisitsCount(data.visitsCount);
            localStorage.setItem('poststatus_visits', String(data.visitsCount));
          }
        }
      },
      (error) => {
        console.warn("Stats document listener offline or unprovisioned. Fallbacks active.");
      }
    );

    return () => {
      unsubFeatures();
      unsubPricing();
      unsubFaq();
      unsubSettings();
      unsubStats();
    };
  }, []);

  const updateFeature = async (feature: Feature) => {
    const path = `features/${feature.id}`;
    try {
      await setDoc(doc(db, 'features', feature.id), feature);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const addFeature = async (feature: Omit<Feature, 'id'>) => {
    const id = `feature-${Date.now()}`;
    const newFeat: Feature = { ...feature, id };
    const path = `features/${id}`;
    try {
      await setDoc(doc(db, 'features', id), newFeat);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteFeature = async (id: string) => {
    const path = `features/${id}`;
    try {
      await deleteDoc(doc(db, 'features', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const updatePricingPlan = async (plan: PricingPlan) => {
    const path = `pricingPlans/${plan.id}`;
    try {
      await setDoc(doc(db, 'pricingPlans', plan.id), plan);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateSettings = async (newSettings: SiteSettings) => {
    const path = `settings/${newSettings.id}`;
    try {
      await setDoc(doc(db, 'settings', newSettings.id), newSettings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const addFAQ = async (faq: Omit<FAQItem, 'id'>) => {
    const id = `faq-${Date.now()}`;
    const newFaq: FAQItem = { ...faq, id };
    const path = `faqs/${id}`;
    try {
      await setDoc(doc(db, 'faqs', id), newFaq);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateFAQ = async (faq: FAQItem) => {
    const path = `faqs/${faq.id}`;
    try {
      await setDoc(doc(db, 'faqs', faq.id), faq);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteFAQ = async (id: string) => {
    const path = `faqs/${id}`;
    try {
      await deleteDoc(doc(db, 'faqs', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const resetToDefaults = async () => {
    try {
      const batch = writeBatch(db);
      
      // Reset settings
      batch.set(doc(db, 'settings', 'global'), DEFAULT_SETTINGS);

      // Reset features
      DEFAULT_FEATURES.forEach((feat) => {
        batch.set(doc(db, 'features', feat.id), feat);
      });

      // Reset pricing plans
      DEFAULT_PRICING.forEach((plan) => {
        batch.set(doc(db, 'pricingPlans', plan.id), plan);
      });

      // Reset faqs
      DEFAULT_FAQS.forEach((faq) => {
        batch.set(doc(db, 'faqs', faq.id), faq);
      });

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reset_all');
    }
  };

  const fallbackFeatures = features.length > 0 ? features : DEFAULT_FEATURES;
  const fallbackPricing = pricingPlans.length > 0 ? pricingPlans : DEFAULT_PRICING;
  const fallbackFaqs = faqs.length > 0 ? faqs : DEFAULT_FAQS;

  return (
    <DataContext.Provider value={{
      features: fallbackFeatures,
      pricingPlans: fallbackPricing,
      faqs: fallbackFaqs,
      settings,
      loading: loading && !fallbackFeatures.length,
      isBootstrapping,
      downloadsCount,
      visitsCount,
      updateFeature,
      addFeature,
      deleteFeature,
      updatePricingPlan,
      updateSettings,
      addFAQ,
      updateFAQ,
      deleteFAQ,
      resetToDefaults,
      incrementDownload,
      incrementVisit,
      updateStatsCounts
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
