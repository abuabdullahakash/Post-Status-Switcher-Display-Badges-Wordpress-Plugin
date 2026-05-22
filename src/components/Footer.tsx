import { Settings2, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 pt-20 pb-10 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded border border-slate-700 bg-slate-900 flex items-center justify-center">
                <Settings2 className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">
                Post<span className="text-emerald-400">Status</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
              The ultimate status switcher and dynamic badge solution for Elementor and JetEngine. Build sophisticated, stateful applications visually.
            </p>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 max-w-sm">
              <h4 className="text-slate-200 font-medium mb-3 text-sm">Enterprise Query? Reach out.</h4>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Email address"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2 flex items-center justify-center rounded-lg transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#docs" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Documentation</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Video Tutorials</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Changelog</a></li>
              <li><a href="#faq" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Help Center</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">About Us</a></li>
              <li><a href="#pricing" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Pricing</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Post Status Switcher Plugin. Not affiliated with Crocoblock or Elementor.
          </p>
          <div className="flex items-center gap-4">
             {/* Social links placeholder if needed */}
          </div>
        </div>
      </div>
    </footer>
  );
}
