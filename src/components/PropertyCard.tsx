import { Property } from '../types';
import { MapPin, BedDouble, Bath, Square, ChevronRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group"
    >
      {/* Image Section */}
      <div className="relative h-72 overflow-hidden">
        <img 
          src={property.images[0]} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-5 left-5 flex flex-col gap-2">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md ${
            property.purpose === 'SALE' ? 'bg-primary/80 text-white' : 'bg-emerald-600/80 text-white'
          }`}>
            {property.purpose === 'SALE' ? 'À Venda' : 'Para Alugar'}
          </span>
          {property.featured && (
            <span className="bg-accent text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
              Exclusivo
            </span>
          )}
        </div>
        <button className="absolute top-5 right-5 w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white hover:text-red-500 transition-all shadow-lg border border-white/30">
          <Heart size={20} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-8">
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black mb-3 uppercase tracking-[0.15em]">
          <MapPin size={12} className="text-accent" />
          {property.neighborhood}, {property.city}
        </div>
        
        <h3 className="text-xl font-black text-primary mb-4 line-clamp-1 group-hover:text-accent transition-colors leading-tight">
          {property.title}
        </h3>

        <div className="flex items-center justify-between mb-6 py-4 border-y border-slate-50">
          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-[9px] uppercase font-black tracking-widest mb-1">Quartos</span>
            <div className="flex items-center gap-1.5 text-primary font-bold">
              <BedDouble size={18} className="text-accent" />
              {property.bedrooms}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-[9px] uppercase font-black tracking-widest mb-1">Banheiros</span>
            <div className="flex items-center gap-1.5 text-primary font-bold">
              <Bath size={18} className="text-accent" />
              {property.bathrooms}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-[9px] uppercase font-black tracking-widest mb-1">Área M²</span>
            <div className="flex items-center gap-1.5 text-primary font-bold">
              <Square size={16} className="text-accent" />
              {property.builtArea}
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Investimento</span>
            <span className="text-2xl font-black text-primary tracking-tighter">{formattedPrice}</span>
          </div>
          <Link 
            to={`/imovel/${property.id}`}
            className="w-12 h-12 bg-slate-50 text-primary rounded-2xl flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm group/btn"
          >
            <ChevronRight size={24} className="transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
