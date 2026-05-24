import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Documentation from './components/Documentation';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import SingleFeaturePage from './components/SingleFeaturePage';
import { DataProvider } from './context/DataContext';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  useEffect(() => {
    const checkRouteState = () => {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      
      if (params.get('admin') === 'true' || hash === '#admin') {
        setIsAdminOpen(true);
        setSelectedFeatureId(null);
      } else if (hash.startsWith('#feature/')) {
        const featId = hash.slice(9);
        setSelectedFeatureId(featId);
        setIsAdminOpen(false);
      } else {
        setIsAdminOpen(false);
        setSelectedFeatureId(null);
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

  const handleNavigateToFeature = (id: string) => {
    window.location.hash = `feature/${id}`;
    setSelectedFeatureId(id);
  };

  return (
    <DataProvider>
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
            ) : (
              <>
                <Hero />
                <Features />
                <Documentation />
                <Pricing />
                <FAQ />
              </>
            )}
          </main>
          <Footer />
        </div>
      )}
    </DataProvider>
  );
}
