import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Lead, LeadStatus } from '../../../types';
import OpportunityCard from './OpportunityCard';

interface KanbanBoardProps {
  opportunities: Lead[];
  onMove: (leadId: string, newStatus: LeadStatus) => void;
  onCardClick: (lead: Lead) => void;
}

const COLUMNS: { id: LeadStatus; title: string }[] = [
  { id: 'NEW', title: 'Novo Lead' },
  { id: 'FIRST_CONTACT', title: 'Primeiro Contato' },
  { id: 'QUALIFIED', title: 'Qualificado' },
  { id: 'VISIT_SCHEDULED', title: 'Visita Agendada' },
  { id: 'VISIT_DONE', title: 'Visita Realizada' },
  { id: 'PROPOSAL', title: 'Proposta' },
  { id: 'NEGOTIATION', title: 'Negociação' },
  { id: 'CLOSING', title: 'Fechamento' },
  { id: 'WON', title: 'Ganho' },
  { id: 'LOST', title: 'Perdido' },
];

export default function KanbanBoard({ opportunities, onMove, onCardClick }: KanbanBoardProps) {
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    onMove(draggableId, destination.droppableId as LeadStatus);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-250px)]">
        {COLUMNS.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80 flex flex-col">
            <div className="mb-4 flex items-center justify-between px-2">
              <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest flex items-center gap-2">
                {column.title}
                <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">
                  {opportunities.filter((o) => o.status === column.id).length}
                </span>
              </h3>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`flex-1 rounded-2xl p-2 transition-colors duration-200 ${
                    snapshot.isDraggingOver ? 'bg-slate-100' : 'bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-3">
                    {opportunities
                      .filter((o) => o.status === column.id)
                      .map((opp, index) => (
                        <Draggable key={opp.id} draggableId={opp.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary/20 rounded-2xl' : ''}
                            >
                              <OpportunityCard 
                                opportunity={opp} 
                                onClick={() => onCardClick(opp)} 
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
