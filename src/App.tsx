import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Documentation from './components/Documentation';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import { DataProvider } from './context/DataContext';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    // Check if '?admin=true' query exists or '#admin' hash is present to auto-open admin dashboard
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || window.location.hash === '#admin') {
      setIsAdminOpen(true);
    }
  }, []);

  return (
    <DataProvider>
      <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
        <Navbar onOpenAdmin={() => setIsAdminOpen(true)} />
        <main>
          <Hero />
          <Features />
          <Documentation />
          <Pricing />
          <FAQ />
        </main>
        <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

        {/* Dynamic Superadmin Admin Control Center Panel */}
        {isAdminOpen && (
          <AdminDashboard onClose={() => setIsAdminOpen(false)} />
        )}
      </div>
    </DataProvider>
  );
}
