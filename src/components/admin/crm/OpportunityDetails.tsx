import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Home, 
  Phone, 
  Mail, 
  MessageCircle, 
  Calendar, 
  DollarSign, 
  Tag, 
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lead, Interaction, InteractionType, OpportunityPriority } from '../../../types';
import { formatPrice } from '../../../utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import InteractionTimeline from './InteractionTimeline';
import { updateOpportunityStatus, updateOpportunityPriority } from '../../../services/crmService';
import { addInteraction } from '../../../services/interactionService';
import { useAuth } from '../../../context/AuthContext';

interface OpportunityDetailsProps {
  opportunity: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function OpportunityDetails({ opportunity, isOpen, onClose, onUpdate }: OpportunityDetailsProps) {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'tasks' | 'proposals'>('info');
  const [newInteraction, setNewInteraction] = useState('');
  const [interactionType, setInteractionType] = useState<InteractionType>('NOTE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!opportunity) return null;

  const handleStatusChange = async (newStatus: Lead['status']) => {
    if (!userProfile) return;
    await updateOpportunityStatus(opportunity.id, newStatus, userProfile.id, userProfile.name);
    onUpdate();
  };

  const handlePriorityChange = async (newPriority: OpportunityPriority) => {
    if (!userProfile) return;
    await updateOpportunityPriority(opportunity.id, newPriority, userProfile.id, userProfile.name);
    onUpdate();
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInteraction.trim() || !userProfile) return;

    setIsSubmitting(true);
    try {
      await addInteraction({
        leadId: opportunity.id,
        type: interactionType,
        description: newInteraction,
        createdBy: userProfile.id,
      });
      setNewInteraction('');
      onUpdate();
    } catch (error) {
      console.error('Erro ao adicionar interação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">{opportunity.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    ID: {opportunity.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">
                    {opportunity.source}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <button 
                onClick={() => window.open(`https://wa.me/55${opportunity.whatsapp}`, '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-colors shadow-sm"
              >
                <MessageCircle size={14} />
                WhatsApp
              </button>
              <button 
                onClick={() => window.open(`tel:${opportunity.phone}`)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:border-primary transition-colors"
              >
                <Phone size={14} />
                Ligar
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:border-primary transition-colors">
                <Calendar size={14} />
                Agendar Visita
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:border-primary transition-colors">
                <Plus size={14} />
                Nova Tarefa
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              {[
                { id: 'info', label: 'Informações', icon: User },
                { id: 'history', label: 'Linha do Tempo', icon: History },
                { id: 'tasks', label: 'Tarefas', icon: CheckCircle2 },
                { id: 'proposals', label: 'Propostas', icon: DollarSign },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
                    activeTab === tab.id 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              {activeTab === 'info' && (
                <div className="space-y-8">
                  {/* Status & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Etapa do Funil</label>
                      <select 
                        value={opportunity.status}
                        onChange={(e) => handleStatusChange(e.target.value as any)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:border-primary"
                      >
                        <option value="NEW">Novo Lead</option>
                        <option value="FIRST_CONTACT">Primeiro Contato</option>
                        <option value="QUALIFIED">Qualificado</option>
                        <option value="VISIT_SCHEDULED">Visita Agendada</option>
                        <option value="VISIT_DONE">Visita Realizada</option>
                        <option value="PROPOSAL">Proposta</option>
                        <option value="NEGOTIATION">Negociação</option>
                        <option value="WON">Fechado (Ganho)</option>
                        <option value="LOST">Perdido</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Prioridade</label>
                      <select 
                        value={opportunity.priority}
                        onChange={(e) => handlePriorityChange(e.target.value as any)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:border-primary"
                      >
                        <option value="LOW">Baixa</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">Alta</option>
                        <option value="URGENT">Urgente</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <User size={16} className="text-primary" />
                      Dados do Cliente
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <Mail size={16} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">{opportunity.email}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                        <Phone size={16} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">{opportunity.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Property Info */}
                  {opportunity.propertyId && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Home size={16} className="text-primary" />
                        Imóvel de Interesse
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                          <Home size={24} className="text-slate-300" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Ref: {opportunity.propertyCode}</p>
                          <p className="text-xs text-slate-500">ID: {opportunity.propertyId}</p>
                          {opportunity.potentialValue && (
                            <p className="text-sm font-black text-primary mt-1">{formatPrice(opportunity.potentialValue)}</p>
                          )}
                        </div>
                        <button className="ml-auto p-2 hover:bg-slate-50 rounded-xl transition-colors">
                          <MoreVertical size={20} className="text-slate-400" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Qualification info could go here */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Tag size={16} className="text-primary" />
                      Qualificação e Mensagem
                    </h3>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-600 italic leading-relaxed">
                        "{opportunity.message || 'Nenhuma mensagem adicional.'}"
                      </p>
                    </div>
                    {opportunity.notes && (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Notas Internas</p>
                        <p className="text-sm text-amber-700">{opportunity.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6">
                  {/* Quick Note Input */}
                  <form onSubmit={handleAddInteraction} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <select 
                        value={interactionType}
                        onChange={(e) => setInteractionType(e.target.value as InteractionType)}
                        className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border-none focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option value="NOTE">Nota</option>
                        <option value="CALL">Ligação</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="EMAIL">E-mail</option>
                        <option value="MEETING">Reunião</option>
                        <option value="VISIT">Visita</option>
                      </select>
                    </div>
                    <textarea 
                      placeholder="Registrar nova interação..."
                      value={newInteraction}
                      onChange={(e) => setNewInteraction(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-primary resize-none h-24"
                    />
                    <div className="flex justify-end">
                      <button 
                        disabled={isSubmitting || !newInteraction.trim()}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? 'Salvando...' : 'Registrar'}
                        <Send size={14} />
                      </button>
                    </div>
                  </form>

                  <InteractionTimeline leadId={opportunity.id} />
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-slate-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Gerenciamento de Tarefas</h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">Em breve: Controle suas pendências e compromissos diretamente aqui.</p>
                  </div>
                </div>
              )}

              {activeTab === 'proposals' && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <DollarSign size={32} className="text-slate-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Propostas Comerciais</h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">Em breve: Registre e acompanhe o status das ofertas recebidas.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
