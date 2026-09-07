import { 
  Bell, 
  Search, 
  Plus,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminHeader() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar */}
      <div className="hidden md:flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2.5 w-96 group focus-within:border-accent transition-all">
        <Search size={18} className="text-slate-400 group-focus-within:text-accent transition-colors" />
        <input 
          type="text" 
          placeholder="Busque por código, cliente ou lead..."
          className="bg-transparent border-none focus:outline-none text-sm font-medium w-full placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => navigate('/dashboard/imoveis/novo')}
          className="hidden sm:flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-accent/20 active:scale-95"
        >
          <Plus size={18} />
          Novo Imóvel
        </button>

        <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
          <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-accent hover:border-accent transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-accent/20 flex items-center justify-center">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt={userProfile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-accent font-black">{userProfile?.name[0]}</span>
              )}
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-black text-primary leading-tight group-hover:text-accent transition-colors">{userProfile?.name}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{userProfile?.role}</span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
