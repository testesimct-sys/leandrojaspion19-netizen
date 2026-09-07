import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  PieChart as PieIcon,
  Activity,
  User
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { getCRMStats, getOpportunities } from '../../../services/crmService';
import { formatPrice } from '../../../utils';
import { Lead } from '../../../types';
import { Link } from 'react-router-dom';

export default function CRMOverview() {
  const [stats, setStats] = useState<any>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await getCRMStats();
        const leadsData = await getOpportunities();
        setStats(statsData);
        setRecentLeads(leadsData.slice(0, 5));
      } catch (error) {
        console.error('Erro ao carregar dados do CRM:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pipelineData = [
    { name: 'Novos', value: stats?.newLeads || 0, color: '#6366f1' },
    { name: 'Qualificados', value: stats?.qualified || 0, color: '#0ea5e9' },
    { name: 'Visitas', value: 0, color: '#8b5cf6' }, // Mock for now
    { name: 'Propostas', value: 0, color: '#f59e0b' }, // Mock for now
    { name: 'Ganhos', value: stats?.won || 0, color: '#10b981' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <TrendingUp className="animate-pulse text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Visão Geral do CRM</h1>
        <p className="text-sm text-slate-500">Acompanhe o desempenho do seu funil de vendas em tempo real.</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Novas Oportunidades" 
          value={stats?.newLeads || 0} 
          icon={Target} 
          trend="+12%" 
          positive={true} 
          color="bg-blue-500"
        />
        <StatCard 
          title="Leads Qualificados" 
          value={stats?.qualified || 0} 
          icon={Users} 
          trend="+5%" 
          positive={true} 
          color="bg-indigo-500"
        />
        <StatCard 
          title="Negócios Ganhos" 
          value={stats?.won || 0} 
          icon={TrendingUp} 
          trend="+2%" 
          positive={true} 
          color="bg-emerald-500"
        />
        <StatCard 
          title="Valor em Pipeline" 
          value={formatPrice(stats?.totalPotentialValue || 0)} 
          icon={DollarSign} 
          trend="-3%" 
          positive={false} 
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Funnel Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              Volume do Funil
            </h3>
            <Link to="/dashboard/crm/pipeline" className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">
              Ver Pipeline Completo
            </Link>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Stats */}
        <div className="bg-primary text-white p-8 rounded-3xl shadow-xl shadow-primary/20 flex flex-col justify-between">
          <div>
            <h3 className="font-black mb-1">Conversão Geral</h3>
            <p className="text-white/60 text-xs">Média dos últimos 30 dias</p>
          </div>
          
          <div className="py-10 flex flex-col items-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="white"
                  strokeWidth="12"
                  strokeDasharray={440}
                  strokeDashoffset={440 * (1 - 0.24)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black">24%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Taxa Final</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
              <span className="text-white/60">Meta Mensal</span>
              <span>R$ 5M</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white w-3/4 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            Atividades Recentes
          </h3>
          <div className="space-y-6">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <User size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{lead.name}</p>
                  <p className="text-xs text-slate-500">Interessado em: {lead.propertyCode || 'Geral'}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest bg-slate-100 text-slate-500`}>
                    {lead.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Contacts / Tasks */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            Próximos Contatos
          </h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Calendar size={24} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-500 font-medium">Você não tem contatos agendados para hoje.</p>
            <button className="mt-4 text-xs font-bold text-primary uppercase tracking-widest hover:underline">
              Ver agenda completa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, positive, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${color} text-white rounded-2xl`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}
