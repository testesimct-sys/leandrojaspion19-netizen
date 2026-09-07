import { 
  Search, 
  Filter, 
  MessageSquare, 
  Phone, 
  Calendar as CalendarIcon,
  ArrowRight,
  MoreHorizontal,
  Mail,
  User,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeads, updateLeadStatus } from '../../services/leadService';
import { Lead, LeadStatus } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function LeadList() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const result = await getLeads();
      let filtered = result;
      if (statusFilter !== 'ALL') {
        filtered = result.filter(l => l.status === statusFilter);
      }
      setLeads(filtered);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search) ||
    (l.propertyCode && l.propertyCode.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'NEW': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'FIRST_CONTACT': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'QUALIFIED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'VISIT_SCHEDULED': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'VISIT_DONE': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'PROPOSAL': return 'bg-cyan-50 text-cyan-600 border-cyan-100';
      case 'NEGOTIATION': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'CLOSING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'WON': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'LOST': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusLabel = (status: LeadStatus) => {
    switch (status) {
      case 'NEW': return 'Novo';
      case 'FIRST_CONTACT': return 'Contatado';
      case 'QUALIFIED': return 'Qualificado';
      case 'VISIT_SCHEDULED': return 'Visita Agendada';
      case 'VISIT_DONE': return 'Visita Realizada';
      case 'PROPOSAL': return 'Proposta';
      case 'NEGOTIATION': return 'Negociação';
      case 'CLOSING': return 'Fechamento';
      case 'WON': return 'Ganho';
      case 'LOST': return 'Perdido';
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">Gestão de Oportunidades</span>
          <h1 className="text-4xl font-black text-primary tracking-tighter">Leads</h1>
          <p className="text-slate-500 font-medium mt-1">Monitore interessados, gerencie funil e converta vendas.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/crm/pipeline')}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-primary/20"
        >
          <LayoutDashboard size={18} />
          Ver Pipeline (CRM)
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Busque por nome, e-mail, telefone ou código do imóvel..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl focus:outline-none focus:border-accent border border-transparent transition-all font-medium text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-4 rounded-2xl border flex items-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all ${showFilters ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}`}
            >
              <Filter size={18} />
              Filtrar Status
            </button>
            <button 
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
              }}
              className="px-6 py-4 rounded-2xl bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
            >
              Limpar
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pt-6 mt-6 border-t border-slate-50">
                {['ALL', 'NEW', 'FIRST_CONTACT', 'QUALIFIED', 'VISIT_SCHEDULED', 'VISIT_DONE', 'PROPOSAL', 'NEGOTIATION', 'CLOSING', 'WON', 'LOST'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status as any)}
                    className={`
                      px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                      ${statusFilter === status 
                        ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}
                    `}
                  >
                    {status === 'ALL' ? 'Todos' : getStatusLabel(status as LeadStatus)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Leads Grid/List */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando leads...</span>
          </div>
        ) : filteredLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead / Cliente</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Imóvel de Interesse</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-black text-sm">
                          {lead.name[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-primary leading-tight">{lead.name}</span>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Phone size={10} /> {lead.phone}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Mail size={10} /> {lead.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-accent uppercase tracking-widest">{lead.propertyCode || 'N/A'}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lead.source}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {lead.createdAt?.seconds 
                            ? format(new Date(lead.createdAt.seconds * 1000), "dd 'de' MMM", { locale: ptBR }) 
                            : 'Recém criado'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                          {lead.createdAt?.seconds 
                            ? format(new Date(lead.createdAt.seconds * 1000), "HH:mm") 
                            : '--:--'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`
                        px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest
                        ${getStatusColor(lead.status)}
                      `}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => navigate(`/dashboard/leads/${lead.id}`)}
                        className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-accent hover:text-white hover:shadow-lg hover:shadow-accent/20 transition-all active:scale-95"
                      >
                        <ArrowRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Briefcase size={32} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-primary tracking-tight">Nenhum lead encontrado</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">Os leads gerados pelos formulários do site aparecerão aqui automaticamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Briefcase({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      className={className} 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
