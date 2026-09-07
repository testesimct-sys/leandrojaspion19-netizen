import React from 'react';
import { 
  Phone, 
  MessageCircle, 
  MoreHorizontal, 
  Clock, 
  MapPin, 
  DollarSign,
  AlertTriangle,
  User,
  Home
} from 'lucide-react';
import { Lead } from '../../../types';
import { formatPrice } from '../../../utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OpportunityCardProps {
  opportunity: Lead;
  onClick: () => void;
}

export default function OpportunityCard({ opportunity, onClick }: OpportunityCardProps) {
  const getPriorityColor = (priority: Lead['priority']) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'NORMAL': return 'text-blue-600 bg-blue-50';
      case 'LOW': return 'text-slate-500 bg-slate-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  const isStale = (date: any) => {
    if (!date) return false;
    const lastContact = date.toDate ? date.toDate() : new Date(date);
    const diff = Date.now() - lastContact.getTime();
    return diff > 7 * 24 * 60 * 60 * 1000; // 7 days
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getPriorityColor(opportunity.priority)}`}>
          {opportunity.priority}
        </span>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{opportunity.name}</h4>
      
      <div className="flex flex-col gap-1.5 mb-4">
        {opportunity.propertyCode && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Home size={14} className="text-slate-400" />
            <span>Ref: {opportunity.propertyCode}</span>
          </div>
        )}
        {opportunity.potentialValue && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
            <DollarSign size={14} className="text-emerald-500" />
            <span>{formatPrice(opportunity.potentialValue)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center -space-x-2">
          {opportunity.assignedTo ? (
            <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden">
              <User size={12} className="text-slate-500" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
              ?
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isStale(opportunity.lastContactAt || opportunity.updatedAt) && (
            <div title="Sem contato há mais de 7 dias">
              <AlertTriangle size={14} className="text-red-500 animate-pulse" />
            </div>
          )}
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            <Clock size={12} />
            <span>
              {formatDistanceToNow(opportunity.updatedAt.toDate ? opportunity.updatedAt.toDate() : new Date(opportunity.updatedAt), { 
                addSuffix: true,
                locale: ptBR 
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1">
          <button 
            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
            onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/55${opportunity.whatsapp}`, '_blank'); }}
          >
            <MessageCircle size={14} />
          </button>
          <button 
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            onClick={(e) => { e.stopPropagation(); window.open(`tel:${opportunity.phone}`); }}
          >
            <Phone size={14} />
          </button>
        </div>
        <div className="bg-slate-100 px-2 py-1 rounded text-[10px] font-black text-slate-500">
          Score: {opportunity.score}
        </div>
      </div>
    </div>
  );
}
