import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  MessageCircle, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon, 
  MapPin, 
  Home, 
  ExternalLink,
  Send,
  Clock,
  History,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Hash,
  Sparkles,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Lead, Property, Interaction, LeadStatus, InteractionType, AIMessage } from '../../types';
import { getPropertyById } from '../../services/propertyService';
import { addInteraction, getInteractions } from '../../services/interactionService';
import { updateLeadStatus } from '../../services/leadService';
import { getAISummary } from '../../services/aiService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [newInteraction, setNewInteraction] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLeadData();
    }
  }, [id]);

  const fetchLeadData = async () => {
    setLoading(true);
    try {
      const leadRef = doc(db, 'leads', id!);
      const leadSnap = await getDoc(leadRef);
      
      if (leadSnap.exists()) {
        const leadData = { id: leadSnap.id, ...leadSnap.data() } as Lead;
        setLead(leadData);
        
        if (leadData.propertyId) {
          const propData = await getPropertyById(leadData.propertyId);
          setProperty(propData);
        }
        
        const interactionsData = await getInteractions({ leadId: id });
        setInteractions(interactionsData);

        // Try to fetch AI summary if originated from AI
        if (leadData.source === 'AI_ASSISTANT') {
          fetchAISummary(leadData.id);
        }
      } else {
        navigate('/dashboard/leads');
      }
    } catch (error) {
      console.error('Erro ao buscar lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAISummary = async (leadId: string) => {
    setLoadingSummary(true);
    try {
      // Find the conversation for this lead
      const q = query(
        collection(db, 'aiConversations'),
        where('leadId', '==', leadId),
        limit(1)
      );
      const convSnap = await getDocs(q);
      
      if (!convSnap.empty) {
        const convId = convSnap.docs[0].id;
        const msgQ = query(
          collection(db, 'aiMessages'),
          where('conversationId', '==', convId),
          orderBy('createdAt', 'asc')
        );
        const msgSnap = await getDocs(msgQ);
        const messages = msgSnap.docs.map(d => ({ 
          role: d.data().role, 
          parts: [{ text: d.data().content }] 
        }));
        
        if (messages.length > 0) {
          const summary = await getAISummary(messages);
          setAiSummary(summary);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar resumo da IA:", error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return;
    setSavingStatus(true);
    try {
      await updateLeadStatus(lead.id, newStatus);
      setLead({ ...lead, status: newStatus });
      
      // Add interaction for status change
      await handleAddInteraction(`Status alterado para: ${newStatus}`, 'NOTE');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAddInteraction = async (text: string, type: Interaction['type'] = 'NOTE') => {
    if (!lead || (!text && !newInteraction)) return;
    
    try {
      const interactionData = {
        leadId: lead.id,
        type,
        description: text || newInteraction,
        createdBy: userProfile?.name || 'Sistema'
      };
      
      await addInteraction(interactionData);
      setNewInteraction('');
      
      // Refresh interactions
      const freshInteractions = await getInteractions({ leadId: lead.id });
      setInteractions(freshInteractions);
    } catch (error) {
      console.error('Erro ao adicionar interação:', error);
    }
  };

  const openWhatsApp = () => {
    if (!lead) return;
    const cleanPhone = lead.whatsapp.replace(/\D/g, '');
    const message = `Olá, ${lead.name}. Aqui é ${userProfile?.name} da Elite Imóveis. Vi que você demonstrou interesse no imóvel ${lead.propertyCode || ''}. Como posso ajudá-lo?`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const statusOptions: LeadStatus[] = [
    'NEW', 'FIRST_CONTACT', 'QUALIFIED', 'VISIT_SCHEDULED', 'VISIT_DONE', 'PROPOSAL', 'NEGOTIATION', 'CLOSING', 'WON', 'LOST'
  ];

  const getStatusLabel = (status: LeadStatus) => {
    switch (status) {
      case 'NEW': return 'Novo';
      case 'FIRST_CONTACT': return 'Primeiro Contato';
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

  if (loading || !lead) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dashboard/leads')}
            className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-accent hover:border-accent transition-all shadow-sm"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-1 block">Detalhes do Atendimento</span>
            <h1 className="text-3xl font-black text-primary tracking-tighter">{lead.name}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className={`
              px-6 py-3.5 rounded-2xl border font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all
              ${savingStatus ? 'opacity-50 pointer-events-none' : 'bg-white border-slate-200 text-slate-700 hover:border-accent hover:text-accent'}
            `}>
              Status: {getStatusLabel(lead.status)}
              <ChevronDown size={14} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`
                    w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${lead.status === status ? 'bg-accent/10 text-accent' : 'hover:bg-slate-50 text-slate-500'}
                  `}
                >
                  {getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={openWhatsApp}
            className="px-6 py-3.5 bg-[#25D366] text-white rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:brightness-110 shadow-xl shadow-[#25D366]/20 transition-all active:scale-95"
          >
            <MessageCircle size={18} />
            WhatsApp
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Contact Card */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Informações de Contato</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-accent shrink-0">
                  <Mail size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</span>
                  <span className="text-sm font-bold text-primary">{lead.email}</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-accent shrink-0">
                  <Phone size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone</span>
                  <span className="text-sm font-bold text-primary">{lead.phone}</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#25D366] shrink-0">
                  <MessageCircle size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</span>
                  <span className="text-sm font-bold text-primary">{lead.whatsapp}</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Origem do Lead</span>
                <span className="text-xs font-bold text-primary">{lead.source}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Data</span>
                <span className="text-xs font-bold text-primary block">
                  {lead.createdAt?.seconds 
                    ? format(new Date(lead.createdAt.seconds * 1000), "dd/MM/yyyy HH:mm") 
                    : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Property Card */}
          {property ? (
            <div className="bg-primary p-8 rounded-[40px] shadow-2xl shadow-primary/20 text-white space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-accent uppercase tracking-[0.2em]">Imóvel de Interesse</h3>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-white/10 rounded-md">{property.code}</span>
              </div>
              <div className="aspect-[16/10] rounded-2xl overflow-hidden">
                <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg leading-tight line-clamp-2">{property.title}</h4>
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <MapPin size={12} />
                  {property.neighborhood}, {property.city}
                </div>
              </div>
              <button 
                onClick={() => navigate(`/imoveis/${property.id}`)}
                className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                Ver no Site <ExternalLink size={14} />
              </button>
            </div>
          ) : (
             <div className="bg-slate-50 p-8 rounded-[40px] border border-dashed border-slate-200 text-center space-y-4">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                 <Home size={24} />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhum imóvel vinculado</p>
             </div>
          )}
        </div>

        {/* Interaction History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Message from Lead */}
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-lg font-black text-primary tracking-tight">Mensagem Recebida</h3>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative">
              <div className="absolute top-0 left-8 -translate-y-1/2 w-4 h-4 bg-slate-50 border-l border-t border-slate-100 rotate-45" />
              <p className="text-primary font-medium italic leading-relaxed">"{lead.message}"</p>
            </div>
          </div>

          {/* AI Summary Card */}
          {(aiSummary || loadingSummary) && (
            <div className="bg-indigo-900 p-10 rounded-[40px] shadow-2xl shadow-indigo-900/20 text-white space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-accent">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">Resumo da IA</h3>
                </div>
                {loadingSummary && <Loader2 className="animate-spin text-white/50" size={20} />}
              </div>
              
              {aiSummary ? (
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-indigo-100 prose prose-invert max-w-none prose-sm">
                   <div className="whitespace-pre-wrap">{aiSummary}</div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-xs font-black uppercase tracking-widest text-white/30 animate-pulse">Gerando inteligência comercial...</p>
                </div>
              )}
            </div>
          )}

          {/* Interaction Timeline */}
          <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                  <History size={20} />
                </div>
                <h3 className="text-lg font-black text-primary tracking-tight">Linha do Tempo</h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{interactions.length} registros</span>
            </div>

            {/* Interaction Input */}
            <div className="space-y-4">
              <div className="relative">
                <textarea 
                  rows={3}
                  placeholder="Adicionar observação ou registrar contato..."
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:border-accent font-medium text-sm resize-none"
                  value={newInteraction}
                  onChange={(e) => setNewInteraction(e.target.value)}
                />
                <button 
                  onClick={() => handleAddInteraction('', 'NOTE')}
                  disabled={!newInteraction}
                  className="absolute bottom-4 right-4 p-3 bg-accent text-white rounded-xl shadow-lg shadow-accent/20 hover:scale-105 transition-all disabled:opacity-0"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleAddInteraction('Ligação realizada', 'CALL')}
                  className="px-4 py-2 rounded-xl bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  📞 Marcar Ligação
                </button>
                <button 
                  onClick={() => handleAddInteraction('WhatsApp enviado', 'WHATSAPP')}
                  className="px-4 py-2 rounded-xl bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  💬 Marcar WhatsApp
                </button>
              </div>
            </div>

            {/* Timeline List */}
            <div className="space-y-10 relative">
               <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-100" />
               
               {interactions.length > 0 ? interactions.map((interaction, index) => (
                 <div key={interaction.id} className="relative flex gap-8">
                   <div className={`
                     w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10 shadow-sm
                     ${interaction.type === 'CALL' ? 'bg-blue-50 text-blue-500 border border-blue-100' :
                       interaction.type === 'WHATSAPP' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' :
                       interaction.type === 'VISIT' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                       'bg-white text-slate-400 border border-slate-100'}
                   `}>
                     {interaction.type === 'CALL' ? <Phone size={18} /> :
                      interaction.type === 'WHATSAPP' ? <MessageCircle size={18} /> :
                      interaction.type === 'VISIT' ? <CalendarIcon size={18} /> :
                      <Hash size={18} />}
                   </div>
                   <div className="flex-1 space-y-1 pt-1">
                     <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-accent uppercase tracking-widest">{interaction.type}</span>
                       <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                         <Clock size={10} />
                         {interaction.createdAt?.seconds 
                           ? format(new Date(interaction.createdAt.seconds * 1000), "dd/MM HH:mm") 
                           : 'Agora'}
                       </span>
                     </div>
                     <p className="text-sm font-medium text-primary leading-relaxed">{interaction.description}</p>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pt-2">Por: {interaction.createdBy}</p>
                   </div>
                 </div>
               )) : (
                 <div className="text-center py-10 opacity-40">
                   <p className="text-xs font-black uppercase tracking-widest">Nenhum registro adicional</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronDown({ className, size }: { className?: string; size?: number }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function MessageSquare({ className, size }: { className?: string; size?: number }) {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
