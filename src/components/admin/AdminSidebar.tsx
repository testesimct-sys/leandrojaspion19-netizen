import { 
  LayoutDashboard, 
  Home, 
  Users, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  TrendingUp,
  Briefcase,
  Layers,
  Kanban as KanbanIcon,
  PieChart as PieIcon,
  CheckCircle2,
  DollarSign,
  Activity
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../firebase/auth';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const menuGroups = [
  {
    title: 'Geral',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Home, label: 'Imóveis', path: '/dashboard/imoveis' },
      { icon: FileText, label: 'Blog', path: '/dashboard/blog' },
    ]
  },
  {
    title: 'CRM',
    items: [
      { icon: PieIcon, label: 'Visão Geral', path: '/dashboard/crm' },
      { icon: KanbanIcon, label: 'Pipeline', path: '/dashboard/crm/pipeline' },
      { icon: Briefcase, label: 'Leads', path: '/dashboard/leads' },
      { icon: UserCheck, label: 'Clientes', path: '/dashboard/clientes' },
      { icon: CheckCircle2, label: 'Tarefas', path: '/dashboard/crm/tarefas' },
      { icon: MessageSquare, label: 'Interações', path: '/dashboard/crm/interacoes' },
      { icon: DollarSign, label: 'Propostas', path: '/dashboard/crm/propostas' },
    ]
  },
  {
    title: 'Operacional',
    items: [
      { icon: Calendar, label: 'Visitas', path: '/dashboard/visitas' },
      { icon: TrendingUp, label: 'Relatórios', path: '/dashboard/relatorios' },
      { icon: Settings, label: 'Configurações', path: '/dashboard/configuracoes' },
    ]
  }
];

export default function AdminSidebar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean, setIsCollapsed: (v: boolean) => void }) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };


  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="fixed left-0 top-0 bottom-0 bg-primary text-white z-50 flex flex-col shadow-2xl transition-all duration-300"
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white font-black text-xl">E</span>
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="font-black text-lg tracking-tighter leading-none">ELITE</span>
              <span className="text-[10px] font-black tracking-[0.2em] text-accent leading-none">ADMIN</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-8 px-3 space-y-8 custom-scrollbar">
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-2">
            {!isCollapsed && (
              <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard' || item.path === '/dashboard/crm'}
                  className={({ isActive }) => `
                    flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <item.icon size={20} className={isCollapsed ? 'mx-auto' : ''} />
                  {!isCollapsed && (
                    <span className="font-bold text-sm">{item.label}</span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <button 
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
        >
          <ExternalLink size={22} className={isCollapsed ? 'mx-auto' : ''} />
          {!isCollapsed && <span className="font-bold text-sm">Ver Site</span>}
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group"
        >
          <LogOut size={22} className={isCollapsed ? 'mx-auto' : ''} />
          {!isCollapsed && <span className="font-bold text-sm">Sair</span>}
        </button>
      </div>

      {!isCollapsed && userProfile && (
        <div className="p-6 bg-slate-900/50 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-accent/20 flex items-center justify-center shrink-0">
            {userProfile.photoURL ? (
              <img src={userProfile.photoURL} alt={userProfile.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-accent font-black">{userProfile.name[0]}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-black text-white truncate leading-tight">{userProfile.name}</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{userProfile.role}</span>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
