import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Sparkles, ArrowRight, Github } from 'lucide-react';
import { CustomCursor } from '../components/CustomCursor';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

export const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMobileMenuOpen(false);
  }, [pathname]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Header fade-in animation using GSAP
  useEffect(() => {
    gsap.fromTo(
      '.navbar-gsap',
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
    );
  }, []);

  const navLinks = [
    { label: 'Features', path: '/features' },
    { label: 'Integrations', path: '/integrations' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'About', path: '/about' },
    { label: 'Careers', path: '/careers' },
    { label: 'Blog', path: '/blog' },
    { label: 'Docs', path: '/docs' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <div className="min-h-screen relative flex flex-col selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Background Overlays */}
      <div className="noise-overlay" />
      <div className="fixed inset-0 grid-bg opacity-[0.4] pointer-events-none z-0" />
      <div className="fixed inset-0 cursor-glow pointer-events-none z-0" />

      {/* Custom Mouse Cursor */}
      <CustomCursor />

      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-violet-600 via-purple-500 to-blue-500 z-[99999] transition-all duration-100 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Header / Navigation */}
      <header className="navbar-gsap fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
          <nav className="glass-panel border border-zinc-200/10 dark:border-zinc-800/40 rounded-full py-3 px-6 flex items-center justify-between shadow-premium backdrop-blur-md">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                NEXUS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-semibold tracking-wide transition-colors ${
                    pathname === link.path 
                      ? 'text-violet-500 dark:text-violet-400' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full border border-zinc-200/10 dark:border-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Session Buttons */}
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard"
                    className="text-xs font-bold text-zinc-300 hover:text-white transition-colors"
                  >
                    Console
                  </Link>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="text-xs font-bold px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-200 rounded-full border border-zinc-200/10 dark:border-zinc-700/50 transition-all"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 text-white rounded-full shadow-glow hover:shadow-glow-strong transition-all"
                  >
                    Get Started <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Buttons */}
            <div className="flex lg:hidden items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full border border-zinc-200/10 dark:border-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </nav>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mx-4 mt-2 p-6 glass-panel border border-zinc-200/10 dark:border-zinc-800/40 rounded-2xl shadow-premium backdrop-blur-xl animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white py-1.5 border-b border-zinc-100 dark:border-zinc-900"
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex flex-col gap-3 mt-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="w-full text-center py-2.5 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl border border-zinc-800 text-sm font-bold"
                    >
                      Dashboard Console
                    </Link>
                    <button
                      onClick={() => { logout(); navigate('/'); }}
                      className="w-full text-center py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="w-full text-center py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-bold"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="w-full text-center py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold shadow-glow"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow z-10 pt-24">
        {children}
      </main>

      {/* Global Newsletter & Footer */}
      <footer className="z-10 bg-zinc-950 border-t border-zinc-900 pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Newsletter Section */}
          <div className="glass-panel border border-zinc-800/40 rounded-3xl p-8 md:p-12 mb-16 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="max-w-md">
              <h3 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">
                Accelerate your workflows
              </h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Join 10,000+ teams automating operations, executing visual nodes, and orchestrating server responses with AI.
              </p>
            </div>
            <form 
              onSubmit={(e) => { e.preventDefault(); alert('Subscribed to newsletter.'); }}
              className="w-full max-w-md flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="flex-grow px-5 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50 placeholder:text-zinc-600"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-zinc-200 transition-colors shadow-premium flex items-center justify-center gap-1.5"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Footer Navigation Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            
            {/* Branding Column */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-md tracking-tight text-white">NEXUS AI</span>
              </Link>
              <p className="mt-4 text-xs text-zinc-500 leading-relaxed max-w-sm">
                State-of-the-art AI-driven workflow automation. Design, build, deploy visual node pipelines seamlessly.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li><Link to="/features" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Features</Link></li>
                <li><Link to="/integrations" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Integrations</Link></li>
                <li><Link to="/pricing" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li><Link to="/docs" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Documentation</Link></li>
                <li><Link to="/blog" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Contact Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-4">Company</h4>
              <ul className="space-y-2.5">
                <li><Link to="/about" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-medium flex items-center gap-1.5">Careers <span className="text-[9px] bg-violet-500/10 text-violet-400 px-1.5 py-0.5 rounded-full border border-violet-500/20">Hiring</span></Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li><Link to="/privacy" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

          </div>

          <hr className="border-zinc-900 mb-8" />

          {/* Footer Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-zinc-600 font-mono">
              &copy; {new Date().getFullYear()} Nexus AI, Inc. All rights reserved.
            </span>
            <span className="text-[10px] text-zinc-600 font-mono flex items-center gap-1.5">
              Engineered with ✦ React, Three.js, GSAP & Tailwind
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
};
