import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Documentation from './components/Documentation';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import SingleFeaturePage from './components/SingleFeaturePage';
import AllFeaturesPage from './components/AllFeaturesPage';
import { DataProvider } from './context/DataContext';
import StatusModal from './components/StatusModal';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [isAllFeaturesOpen, setIsAllFeaturesOpen] = useState(false);

  useEffect(() => {
    const checkRouteState = () => {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      
      if (params.get('admin') === 'true' || hash === '#admin') {
        setIsAdminOpen(true);
        setSelectedFeatureId(null);
        setIsAllFeaturesOpen(false);
      } else if (hash.startsWith('#feature/')) {
        const featId = hash.slice(9);
        setSelectedFeatureId(featId);
        setIsAdminOpen(false);
        setIsAllFeaturesOpen(false);
      } else if (hash === '#all-features') {
        setIsAllFeaturesOpen(true);
        setIsAdminOpen(false);
        setSelectedFeatureId(null);
      } else {
        setIsAdminOpen(false);
        setSelectedFeatureId(null);
        setIsAllFeaturesOpen(false);
      }
    };

    // Run custom route tracker
    checkRouteState();
    window.addEventListener('hashchange', checkRouteState);
    return () => window.removeEventListener('hashchange', checkRouteState);
  }, []);

  const handleOpenAdmin = () => {
    window.location.hash = 'admin';
    setIsAdminOpen(true);
    setSelectedFeatureId(null);
    setIsAllFeaturesOpen(false);
  };

  const handleCloseAdmin = () => {
    window.location.hash = '';
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.history.pushState({}, '', url.pathname + url.hash);
    setIsAdminOpen(false);
  };

  const handleCloseFeature = () => {
    window.location.hash = '';
    setSelectedFeatureId(null);
  };

  const handleCloseAllFeatures = () => {
    window.location.hash = '';
    setIsAllFeaturesOpen(false);
  };

  const handleNavigateToFeature = (id: string) => {
    window.location.hash = `feature/${id}`;
    setSelectedFeatureId(id);
    setIsAllFeaturesOpen(false);
  };

  return (
    <DataProvider>
      <StatusModal />
      {isAdminOpen ? (
        <AdminDashboard onClose={handleCloseAdmin} />
      ) : (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
          <Navbar onOpenAdmin={handleOpenAdmin} />
          <main>
            {selectedFeatureId ? (
              <SingleFeaturePage 
                featureId={selectedFeatureId} 
                onBack={handleCloseFeature} 
                onNavigateToFeature={handleNavigateToFeature} 
              />
            ) : isAllFeaturesOpen ? (
              <AllFeaturesPage 
                onBack={handleCloseAllFeatures}
                onNavigateToFeature={handleNavigateToFeature}
              />
            ) : (
              <>
                <Hero />
                <Features />
                <Documentation />
                <Pricing />
                <FAQ />
                <Contact />
              </>
            )}
          </main>
          <Footer />
        </div>
      )}
    </DataProvider>
  );
}
