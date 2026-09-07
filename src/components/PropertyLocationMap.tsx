import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Copy, 
  Check, 
  Layers, 
  Compass, 
  Utensils, 
  GraduationCap, 
  ShoppingBag, 
  Trees, 
  Building, 
  ShieldCheck,
  Car,
  Footprints
} from 'lucide-react';
import { Property } from '../types';

interface PropertyLocationMapProps {
  property: Property;
}

export default function PropertyLocationMap({ property }: PropertyLocationMapProps) {
  const [mapType, setMapType] = useState<'m' | 'k'>('m'); // 'm' = normal street map (bright), 'k' = satellite
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'gastronomy' | 'education' | 'shopping' | 'leisure'>('all');

  const fullAddress = [
    property.address,
    property.neighborhood,
    property.city,
    property.state
  ].filter(Boolean).join(', ');

  // Create clean query for Google Maps embed
  const mapQuery = property.latitude && property.longitude
    ? `${property.latitude},${property.longitude}`
    : encodeURIComponent(`${property.neighborhood}, ${property.city}, ${property.state || 'Brasil'}`);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || `${property.neighborhood}, ${property.city}`)}`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(fullAddress || `${property.neighborhood}, ${property.city}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Curated neighborhood amenities for high-end properties
  const nearbyPlaces = [
    {
      category: 'gastronomy',
      name: 'Polo Gastronômico & Cafés',
      type: 'Restaurantes & Bistrôs',
      distance: '450m',
      time: '5 min a pé',
      icon: Utensils
    },
    {
      category: 'shopping',
      name: 'Shopping & Empório Gourmet',
      type: 'Conveniência & Alta Moda',
      distance: '1.2 km',
      time: '4 min de carro',
      icon: ShoppingBag
    },
    {
      category: 'education',
      name: 'Colégios & Escolas Bilíngues',
      type: 'Educação de Excelência',
      distance: '850m',
      time: '3 min de carro',
      icon: GraduationCap
    },
    {
      category: 'leisure',
      name: 'Parques, Praias & Ciclovias',
      type: 'Lazer ao Ar Livre',
      distance: '600m',
      time: '7 min a pé',
      icon: Trees
    },
    {
      category: 'shopping',
      name: 'Centro Empresarial & Serviços',
      type: 'Serviços & Conveniência',
      distance: '1.8 km',
      time: '6 min de carro',
      icon: Building
    }
  ];

  const filteredPlaces = activeCategory === 'all' 
    ? nearbyPlaces 
    : nearbyPlaces.filter(p => p.category === activeCategory);

  return (
    <div className="mb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-primary tracking-tight flex items-center gap-4">
            <div className="w-12 h-1.5 bg-accent rounded-full" />
            Localização Privilegiada
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-2">
            Explore a região, vias de acesso e conveniências ao redor de <span className="text-primary font-bold">{property.neighborhood}, {property.city}</span>.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyAddress}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
            title="Copiar endereço"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            {copied ? 'Copiado!' : 'Copiar Endereço'}
          </button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-accent px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
          >
            Abrir no Maps
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Modern Bright Interactive Map Container */}
      <div className="bg-white rounded-[36px] border border-slate-200/90 shadow-xl overflow-hidden relative">
        {/* Top Control Bar over Map */}
        <div className="p-4 sm:p-5 bg-white/95 backdrop-blur-md border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 flex items-center justify-center text-accent shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-primary text-sm sm:text-base tracking-tight">
                  {property.neighborhood}, {property.city} - {property.state}
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck size={11} /> Região Nobre
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {property.address || 'Localização aproximada para preservar a privacidade do imóvel'}
              </p>
            </div>
          </div>

          {/* Map Layer Switcher (Street vs Satellite) */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setMapType('m')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                mapType === 'm'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-500 hover:text-primary'
              }`}
            >
              <Compass size={13} className={mapType === 'm' ? 'text-accent' : ''} />
              Ruas (Claro)
            </button>
            <button
              type="button"
              onClick={() => setMapType('k')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                mapType === 'k'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-500 hover:text-primary'
              }`}
            >
              <Layers size={13} className={mapType === 'k' ? 'text-accent' : ''} />
              Satélite
            </button>
          </div>
        </div>

        {/* Live Interactive Embed Map (Bright, Crisp & Modern) */}
        <div className="relative w-full h-[400px] sm:h-[480px] bg-slate-100">
          <iframe
            title={`Mapa de localização - ${property.title}`}
            src={`https://maps.google.com/maps?q=${mapQuery}&t=${mapType}&z=15&ie=UTF8&iwloc=&output=embed`}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Floating Pill: Approximate location badge */}
          <div className="absolute bottom-5 left-5 z-10 pointer-events-none">
            <div className="glass px-4 py-2 rounded-2xl shadow-xl border border-white/40 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] font-bold text-primary tracking-wide">
                Ponto de referência no bairro
              </span>
            </div>
          </div>
        </div>

        {/* Neighborhood Amenities & Highlights */}
        <div className="p-6 sm:p-8 bg-slate-50/80 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-accent block">
                Comodidades do Entorno
              </span>
              <h3 className="text-base font-black text-primary">
                O que você encontra por perto
              </h3>
            </div>

            {/* Filter tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'gastronomy', label: 'Gastronomia' },
                { id: 'shopping', label: 'Shoppings' },
                { id: 'education', label: 'Educação' },
                { id: 'leisure', label: 'Lazer & Natureza' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPlaces.map((place, i) => {
              const Icon = place.icon;
              const isWalking = place.time.includes('pé');
              return (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-accent/40 transition-all flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-accent shrink-0 mt-0.5">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-primary text-xs sm:text-sm truncate">
                      {place.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium block">
                      {place.type}
                    </span>
                    <div className="flex items-center gap-2 mt-2 text-[11px] font-bold text-slate-600">
                      <span className="flex items-center gap-1 text-accent font-black">
                        <Navigation size={11} /> {place.distance}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        {isWalking ? <Footprints size={12} /> : <Car size={12} />}
                        {place.time}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
