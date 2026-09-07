import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User, 
  Plus,
  CheckCircle2,
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAppointments, updateAppointmentStatus } from '../../services/appointmentService';
import { Appointment, AppointmentStatus } from '../../types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Appointments() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'CALENDAR' | 'LIST'>('CALENDAR');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const result = await getAppointments();
      setAppointments(result);
    } catch (error) {
      console.error('Erro ao buscar visitas:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayAppointments = (date: Date) => {
    return appointments.filter(app => {
      // Assuming app.date is ISO string or YYYY-MM-DD
      const appDate = new Date(app.date);
      return isSameDay(appDate, date);
    });
  };

  const selectedDayAppointments = getDayAppointments(selectedDate);

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500';
      case 'CONFIRMED': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-emerald-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">Agenda de Visitas</span>
          <h1 className="text-4xl font-black text-primary tracking-tighter">Cronograma</h1>
          <p className="text-slate-500 font-medium mt-1">Gerencie seus horários de visita e compromissos com clientes.</p>
        </div>
        <div className="flex items-center gap-3 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <button 
            onClick={() => setView('CALENDAR')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'CALENDAR' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-primary'}`}
          >
            Calendário
          </button>
          <button 
            onClick={() => setView('LIST')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'LIST' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-primary'}`}
          >
            Lista
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Calendar Section */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
          {/* Calendar Header */}
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-2xl font-black text-primary tracking-tight capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <div className="flex items-center gap-4">
              <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-accent transition-all">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-accent transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-8">
            <div className="grid grid-cols-7 gap-px mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                const dayApps = getDayAppointments(day);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square rounded-2xl p-2 flex flex-col items-center justify-between transition-all relative group
                      ${isSelected ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'bg-slate-50 hover:bg-slate-100'}
                      ${!isCurrentMonth && !isSelected ? 'opacity-20' : 'opacity-100'}
                    `}
                  >
                    <span className={`text-sm font-black ${isSelected ? 'text-white' : 'text-primary'}`}>
                      {format(day, 'd')}
                    </span>
                    
                    {dayApps.length > 0 && (
                      <div className="flex gap-1">
                        {dayApps.slice(0, 3).map(app => (
                          <div key={app.id} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : getStatusColor(app.status)}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Agenda */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-accent uppercase tracking-widest">Compromissos</span>
                <h3 className="text-xl font-black text-primary tracking-tight">
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </h3>
              </div>
              <button className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {selectedDayAppointments.length > 0 ? selectedDayAppointments.map((app) => (
                <div key={app.id} className="relative pl-6 border-l-2 border-slate-100 hover:border-accent transition-all group">
                  <div className={`absolute left-[-5px] top-1 w-2 h-2 rounded-full ${getStatusColor(app.status)}`} />
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-primary">{app.time}</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-50 text-slate-400`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-primary leading-none">Visita: Residencial Jardins</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <User size={12} /> Marcos Oliveira
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all text-[9px] font-black uppercase tracking-widest">
                         Confirmar
                       </button>
                       <button className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-[9px] font-black uppercase tracking-widest">
                         Cancelar
                       </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center opacity-30">
                  <CalendarIcon size={40} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Sem visitas agendadas</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-primary p-8 rounded-[40px] text-white shadow-2xl shadow-primary/20">
            <h4 className="text-xs font-black text-accent uppercase tracking-widest mb-6">Resumo Mensal</h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-3xl font-black block">12</span>
                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Visitas Realizadas</span>
              </div>
              <div>
                <span className="text-3xl font-black block">4</span>
                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Vendas Fechadas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
