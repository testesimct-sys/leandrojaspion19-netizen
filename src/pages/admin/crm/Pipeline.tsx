import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  LayoutDashboard, 
  Kanban as KanbanIcon, 
  List,
  RefreshCw,
  MoreVertical,
  Download
} from 'lucide-react';
import { Lead, LeadStatus } from '../../../types';
import { getOpportunities, updateOpportunityStatus } from '../../../services/crmService';
import KanbanBoard from '../../../components/admin/crm/KanbanBoard';
import OpportunityDetails from '../../../components/admin/crm/OpportunityDetails';
import { useAuth } from '../../../context/AuthContext';

export default function Pipeline() {
  const { userProfile } = useAuth();
  const [opportunities, setOpportunities] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Lead | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const data = await getOpportunities();
      setOpportunities(data);
    } catch (error) {
      console.error('Erro ao carregar oportunidades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleMove = async (leadId: string, newStatus: LeadStatus) => {
    if (!userProfile) return;
    
    // Optimistic update
    setOpportunities(prev => prev.map(o => o.id === leadId ? { ...o, status: newStatus } : o));
    
    try {
      await updateOpportunityStatus(leadId, newStatus, userProfile.id, userProfile.name);
    } catch (error) {
      console.error('Erro ao mover oportunidade:', error);
      fetchOpportunities(); // Rollback
    }
  };

  const handleCardClick = (opportunity: Lead) => {
    setSelectedOpportunity(opportunity);
    setIsDetailsOpen(true);
  };

  const filteredOpportunities = opportunities.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.propertyCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Pipeline de Vendas</h1>
          <p className="text-sm text-slate-500">Gerencie sua jornada comercial e converta mais leads.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchOpportunities}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-primary transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-primary/20">
            <Plus size={18} />
            Novo Lead
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, e-mail ou código do imóvel..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-primary text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:border-primary transition-colors">
            <Filter size={18} />
            Filtros
          </button>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button className="p-2 bg-white text-primary rounded-lg shadow-sm">
              <KanbanIcon size={18} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600">
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {loading && opportunities.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <KanbanBoard 
          opportunities={filteredOpportunities} 
          onMove={handleMove} 
          onCardClick={handleCardClick}
        />
      )}

      <OpportunityDetails 
        opportunity={selectedOpportunity}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onUpdate={fetchOpportunities}
      />
    </div>
  );
}
