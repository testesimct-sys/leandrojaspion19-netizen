import { Link, useNavigate } from 'react-router-dom';
import { Menu, Phone, MessageCircle, X, Search, Heart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../firebase/auth';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, userProfile, isAdmin, isBroker } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navLinks = [
    { name: 'Início', href: '/' },
    { name: 'Comprar', href: '/imoveis?purpose=SALE' },
    { name: 'Alugar', href: '/imoveis?purpose=RENT' },
    { name: 'Imóveis', href: '/imoveis' },
    { name: 'Sobre', href: '/sobre' },
    { name: 'Contato', href: '/contato' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-900/5 py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-xl shadow-xl transition-transform group-hover:scale-105">
            <span className="text-white font-black text-2xl">E</span>
          </div>
          <div className="flex flex-col">
            <span className={`font-black text-2xl tracking-tighter leading-none transition-colors ${isScrolled ? 'text-primary' : 'text-primary md:text-white'}`}>ELITE</span>
            <span className={`text-[10px] tracking-[0.3em] font-bold leading-none transition-colors ${isScrolled ? 'text-accent' : 'text-accent md:text-accent/90'}`}>IMÓVEIS</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`text-sm font-bold uppercase tracking-widest transition-all hover:text-accent relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all hover:after:w-full ${
                isScrolled ? 'text-slate-600' : 'text-slate-700 md:text-white/80'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Link 
              to="/favoritos"
              className={`p-2.5 rounded-xl transition-all ${
                isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-700 md:text-white/80 md:hover:bg-white/10'
              }`}
            >
              <Heart size={20} />
            </Link>
            
            {currentUser ? (
              <div className="flex items-center gap-2">
                {(isAdmin || isBroker) && (
                  <Link 
                    to="/dashboard"
                    className={`p-2.5 rounded-xl transition-all ${
                      isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-700 md:text-white/80 md:hover:bg-white/10'
                    }`}
                  >
                    <LayoutDashboard size={20} />
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className={`p-2.5 rounded-xl transition-all ${
                    isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-700 md:text-white/80 md:hover:bg-white/10'
                  }`}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className={`p-2.5 rounded-xl transition-all ${
                  isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-700 md:text-white/80 md:hover:bg-white/10'
                }`}
              >
                <User size={20} />
              </Link>
            )}
          </div>
          
          <a 
            href="https://wa.me/5500000000000" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-accent/20 hover:shadow-accent/30 active:scale-95"
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>
          
          <button 
            className={`lg:hidden p-2 rounded-xl transition-colors ${isScrolled ? 'text-primary' : 'text-primary md:text-white'}`}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-white z-[60] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 flex items-center justify-center rounded-lg">
                  <span className="text-white font-bold">E</span>
                </div>
                <span className="font-bold text-lg text-slate-900">ELITE IMÓVEIS</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-8 px-6 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-2xl font-semibold text-slate-900"
                >
                  {link.name}
                </Link>
              ))}
              {currentUser && (isAdmin || isBroker) && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-2xl font-semibold text-slate-900"
                >
                  Painel de Controle
                </Link>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 space-y-4">
              {currentUser ? (
                <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full py-4 border border-slate-200 rounded-xl font-semibold text-slate-700"
                >
                  <LogOut size={20} />
                  Sair da Conta
                </button>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 border border-slate-200 rounded-xl font-semibold text-slate-700"
                >
                  <User size={20} />
                  Entrar na Conta
                </Link>
              )}
              <a 
                href="https://wa.me/5500000000000" 
                className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold"
              >
                <MessageCircle size={20} />
                Falar com Corretor
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
