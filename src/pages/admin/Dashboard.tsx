import { 
  Home, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Briefcase, 
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getLeads } from '../../services/leadService';
import { getProperties } from '../../services/propertyService';
import { getAppointments } from '../../services/appointmentService';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    soldProperties: 0,
    rentedProperties: 0,
    newLeads: 0,
    upcomingVisits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [propsResult, leadsResult, visitsResult] = await Promise.all([
          getProperties({ pageSize: 100 }),
          getLeads(),
          getAppointments()
        ]);

        const props = propsResult.properties;
        setStats({
          totalProperties: props.length,
          availableProperties: props.filter(p => p.status === 'AVAILABLE').length,
          soldProperties: props.filter(p => p.status === 'SOLD').length,
          rentedProperties: props.filter(p => p.status === 'RENTED').length,
          newLeads: leadsResult.filter(l => l.status === 'NEW').length,
          upcomingVisits: visitsResult.filter(v => v.status === 'PENDING' || v.status === 'CONFIRMED').length
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { 
      label: 'Total de Imóveis', 
      value: stats.totalProperties, 
      icon: Home, 
      color: 'bg-blue-500',
      trend: '+4%',
      trendUp: true
    },
    { 
      label: 'Novos Leads', 
      value: stats.newLeads, 
      icon: Briefcase, 
      color: 'bg-emerald-500',
      trend: '+12%',
      trendUp: true
    },
    { 
      label: 'Visitas Pendentes', 
      value: stats.upcomingVisits, 
      icon: CalendarIcon, 
      color: 'bg-amber-500',
      trend: '-2%',
      trendUp: false
    },
    { 
      label: 'Mensagens', 
      value: 8, 
      icon: MessageSquare, 
      color: 'bg-purple-500',
      trend: '+5%',
      trendUp: true
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">Central de Operações</span>
          <h1 className="text-4xl font-black text-primary tracking-tighter">Painel de Controle</h1>
          <p className="text-slate-500 font-medium mt-1">Bem-vindo de volta! Aqui está o resumo da sua operação imobiliária.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/leads')}
            className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-all shadow-sm"
          >
            Gerenciar Leads
          </button>
          <button 
            onClick={() => navigate('/dashboard/imoveis/novo')}
            className="px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
          >
            <Plus size={18} />
            Novo Imóvel
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 group hover:border-accent transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {stat.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-4xl font-black text-primary tracking-tighter leading-none">{stat.value}</span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-xl font-black text-primary tracking-tight">Leads Recentes</h2>
            <button 
              onClick={() => navigate('/dashboard/leads')}
              className="text-accent font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group"
            >
              Ver todos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="p-2">
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead>
                   <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                     <th className="px-6 py-4">Cliente</th>
                     <th className="px-6 py-4">Origem</th>
                     <th className="px-6 py-4">Data</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-right">Ação</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {/* Dummy data for now */}
                   {[1, 2, 3, 4, 5].map((i) => (
                     <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary font-black text-xs">
                             JD
                           </div>
                           <div className="flex flex-col">
                             <span className="text-sm font-bold text-primary">João da Silva</span>
                             <span className="text-xs text-slate-400">joao@email.com</span>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <span className="text-xs font-bold text-slate-600">Site Elite</span>
                       </td>
                       <td className="px-6 py-4 text-xs font-medium text-slate-500">
                         Há 2 horas
                       </td>
                       <td className="px-6 py-4">
                         <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                           Novo
                         </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <button className="p-2 rounded-lg hover:bg-white hover:shadow-md transition-all text-slate-400 hover:text-accent">
                           <ArrowRight size={18} />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Property Status Distribution */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8">
          <h2 className="text-xl font-black text-primary tracking-tight mb-8">Status do Inventário</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disponíveis</span>
                <span className="text-lg font-black text-primary">{stats.availableProperties}</span>
              </div>
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.availableProperties / (stats.totalProperties || 1)) * 100}%` }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendidos</span>
                <span className="text-lg font-black text-primary">{stats.soldProperties}</span>
              </div>
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.soldProperties / (stats.totalProperties || 1)) * 100}%` }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alugados</span>
                <span className="text-lg font-black text-primary">{stats.rentedProperties}</span>
              </div>
              <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.rentedProperties / (stats.totalProperties || 1)) * 100}%` }}
                  className="h-full bg-purple-500 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Atividade Recente</h3>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-primary leading-tight">Imóvel COD-1234 atualizado</p>
                    <span className="text-[10px] text-slate-400 font-medium">Há 15 minutos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
