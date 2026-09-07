import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar as CalendarIcon, 
  Download,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'motion/react';

const data = [
  { name: 'Jan', leads: 40, visitas: 24, vendas: 4 },
  { name: 'Fev', leads: 30, visitas: 13, vendas: 2 },
  { name: 'Mar', leads: 20, visitas: 38, vendas: 8 },
  { name: 'Abr', leads: 27, visitas: 39, vendas: 3 },
  { name: 'Mai', leads: 18, visitas: 48, vendas: 6 },
  { name: 'Jun', leads: 23, visitas: 38, vendas: 5 },
  { name: 'Jul', leads: 34, visitas: 43, vendas: 7 },
];

const COLORS = ['#D4AF37', '#1A1D23', '#F8FAFC', '#94A3B8'];

export default function Reports() {
  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">Inteligência de Mercado</span>
          <h1 className="text-4xl font-black text-primary tracking-tighter">Relatórios e Métricas</h1>
          <p className="text-slate-500 font-medium mt-1">Análise completa de desempenho e conversão.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-all shadow-sm flex items-center gap-2">
            <CalendarIcon size={18} />
            Últimos 30 dias
          </button>
          <button className="px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-primary/20 flex items-center gap-2">
            <Download size={18} />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div className="flex items-center gap-1 text-emerald-500 font-black text-xs">
              <ArrowUpRight size={14} />
              +12.5%
            </div>
          </div>
          <span className="text-4xl font-black text-primary tracking-tighter">R$ 4.2M</span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Volume Geral de Vendas</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
              <ArrowUpRight size={24} />
            </div>
            <div className="flex items-center gap-1 text-emerald-500 font-black text-xs">
              <ArrowUpRight size={14} />
              +5.2%
            </div>
          </div>
          <span className="text-4xl font-black text-primary tracking-tighter">8.4%</span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Taxa de Conversão</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
              <Filter size={24} />
            </div>
            <div className="flex items-center gap-1 text-red-500 font-black text-xs">
              <ArrowDownRight size={14} />
              -2.1%
            </div>
          </div>
          <span className="text-4xl font-black text-primary tracking-tighter">342</span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Novos Leads Qualificados</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Leads Evolution */}
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50">
          <h3 className="text-xl font-black text-primary tracking-tight mb-10">Evolução de Leads e Visitas</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                <Area type="monotone" dataKey="visitas" stroke="#1A1D23" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Month */}
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50">
          <h3 className="text-xl font-black text-primary tracking-tight mb-10">Volume de Vendas Mensais</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="vendas" fill="#D4AF37" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
