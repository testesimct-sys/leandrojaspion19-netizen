import { 
  Search, 
  UserPlus, 
  Filter, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClients } from '../../services/clientService';
import { Client } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ClientList() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const result = await getClients();
      setClients(result);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">Gestão de Relacionamento</span>
          <h1 className="text-4xl font-black text-primary tracking-tighter">Clientes</h1>
          <p className="text-slate-500 font-medium mt-1">Base de dados unificada de compradores, vendedores e locatários.</p>
        </div>
        <button 
          onClick={() => {/* TODO: New Client Modal */}}
          className="px-8 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
        >
          <UserPlus size={20} />
          Novo Cliente
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Busque por nome, e-mail ou telefone..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl focus:outline-none focus:border-accent border border-transparent transition-all font-medium text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando clientes...</span>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-accent transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-black text-2xl group-hover:bg-accent group-hover:text-white transition-all">
                  {client.name[0].toUpperCase()}
                </div>
                <button className="p-2 rounded-xl text-slate-300 hover:text-primary hover:bg-slate-50 transition-all">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              
              <div className="space-y-1 mb-8">
                <h3 className="text-xl font-black text-primary tracking-tight truncate">{client.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <Mail size={12} />
                  {client.email}
                </div>
              </div>

              <div className="space-y-3 pb-8 border-b border-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone</span>
                  <span className="text-xs font-bold text-primary">{client.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desde</span>
                  <span className="text-xs font-bold text-primary">
                    {client.createdAt?.seconds 
                      ? format(new Date(client.createdAt.seconds * 1000), "MMM yyyy", { locale: ptBR }) 
                      : '--'}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/dashboard/clientes/${client.id}`)}
                className="w-full mt-8 py-4 bg-slate-50 group-hover:bg-primary group-hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                Perfil Completo <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-24 text-center rounded-[48px] border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mx-auto mb-6">
            <UserCheck size={32} className="text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-primary tracking-tight">Base de clientes vazia</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">Cadastre seu primeiro cliente para começar a gerenciar sua carteira.</p>
        </div>
      )}
    </div>
  );
}
