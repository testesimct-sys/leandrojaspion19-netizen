import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  Users, 
  MapPin, 
  StickyNote,
  DollarSign,
  Clock,
  User,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { Interaction, InteractionType } from '../../../types';
import { getInteractionsByLead } from '../../../services/interactionService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function InteractionTimeline({ leadId }: { leadId: string }) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const data = await getInteractionsByLead(leadId);
        setInteractions(data);
      } catch (error) {
        console.error('Erro ao carregar interações:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, [leadId]);

  const getIcon = (type: InteractionType) => {
    switch (type) {
      case 'CALL': return { icon: Phone, color: 'bg-blue-500' };
      case 'WHATSAPP': return { icon: MessageCircle, color: 'bg-emerald-500' };
      case 'EMAIL': return { icon: Mail, color: 'bg-amber-500' };
      case 'MEETING': return { icon: Users, color: 'bg-indigo-500' };
      case 'VISIT': return { icon: MapPin, color: 'bg-purple-500' };
      case 'PROPOSAL': return { icon: DollarSign, color: 'bg-primary' };
      case 'NOTE': return { icon: StickyNote, color: 'bg-slate-500' };
      default: return { icon: StickyNote, color: 'bg-slate-500' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse flex gap-4">
            <div className="w-8 h-8 bg-slate-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-10 bg-slate-200 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-slate-400">Nenhuma interação registrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
      {interactions.map((interaction) => {
        const { icon: Icon, color } = getIcon(interaction.type);
        const date = interaction.createdAt?.toDate ? interaction.createdAt.toDate() : new Date(interaction.createdAt);

        return (
          <div key={interaction.id} className="relative pl-12">
            <div className={`absolute left-0 w-8 h-8 rounded-full ${color} flex items-center justify-center text-white shadow-sm z-10`}>
              <Icon size={14} />
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {interaction.type}
                  </span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <button className="text-slate-300 hover:text-slate-600 transition-colors">
                  <MoreVertical size={14} />
                </button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {interaction.description}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  <User size={10} className="text-slate-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registrado por Admin</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
