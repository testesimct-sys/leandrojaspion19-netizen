import { Search, SlidersHorizontal, MapPin, Home as HomeIcon, DollarSign, BedDouble, Bath, Square } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MOCK_PROPERTIES } from '../data';
import PropertyCard from '../components/PropertyCard';
import { PropertyPurpose, PropertyType } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPurpose = searchParams.get('purpose') as PropertyPurpose || '';
  const initialType = searchParams.get('type') as PropertyType || '';
  
  const [purpose, setPurpose] = useState<PropertyPurpose | ''>(initialPurpose);
  const [type, setType] = useState<PropertyType | ''>(initialType);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const p = searchParams.get('purpose') as PropertyPurpose;
    if (p) setPurpose(p);
    const t = searchParams.get('type') as PropertyType;
    if (t) setType(t);
  }, [searchParams]);

  const filteredProperties = useMemo(() => {
    return MOCK_PROPERTIES.filter(p => {
      const matchesPurpose = !purpose || p.purpose === purpose;
      const matchesType = !type || p.propertyType === type;
      const matchesMinPrice = !minPrice || p.price >= parseInt(minPrice);
      const matchesMaxPrice = !maxPrice || p.price <= parseInt(maxPrice);
      const matchesBedrooms = !bedrooms || p.bedrooms >= parseInt(bedrooms);
      const matchesSearch = !searchQuery || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesPurpose && matchesType && matchesMinPrice && matchesMaxPrice && matchesBedrooms && matchesSearch;
    });
  }, [purpose, type, minPrice, maxPrice, bedrooms, searchQuery]);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-12">
          <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Catálogo Completo</span>
          <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tighter mb-4">Explorar Imóveis</h1>
          <p className="text-slate-500 max-w-2xl text-lg font-medium">Utilize os filtros inteligentes para encontrar a residência que harmoniza perfeitamente com seu estilo de vida e objetivos.</p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-6 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 mb-12">
          <div className="flex flex-col lg:flex-row items-stretch gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Busque por cidade, bairro ou código..."
                className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl focus:outline-none focus:border-accent border border-transparent transition-all font-medium text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setPurpose(purpose === 'SALE' ? '' : 'SALE')}
                className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg ${purpose === 'SALE' ? 'bg-primary text-white shadow-primary/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                Comprar
              </button>
              <button 
                onClick={() => setPurpose(purpose === 'RENT' ? '' : 'RENT')}
                className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg ${purpose === 'RENT' ? 'bg-primary text-white shadow-primary/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                Alugar
              </button>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-4 rounded-2xl border flex items-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all ${showFilters ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}`}
              >
                <SlidersHorizontal size={18} />
                <span className="hidden md:inline">Filtros</span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 pb-4 border-t border-slate-100 mt-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Imóvel</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 focus:border-accent focus:outline-none rounded-2xl py-4 px-5 font-bold text-sm appearance-none cursor-pointer"
                      value={type}
                      onChange={(e) => setType(e.target.value as PropertyType)}
                    >
                      <option value="">Todos os tipos</option>
                      <option value="HOUSE">Casa</option>
                      <option value="APARTMENT">Apartamento</option>
                      <option value="PENTHOUSE">Cobertura</option>
                      <option value="LAND">Terreno</option>
                      <option value="COMMERCIAL">Comercial</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quartos</label>
                    <div className="grid grid-cols-5 gap-2">
                      {['Any', '1', '2', '3', '4+'].map((num) => (
                        <button
                          key={num}
                          onClick={() => setBedrooms(num === 'Any' ? '' : num.replace('+', ''))}
                          className={`py-3 rounded-xl text-xs font-black transition-all shadow-sm ${
                            (num === 'Any' && !bedrooms) || bedrooms === num.replace('+', '')
                              ? 'bg-accent text-white shadow-accent/20'
                              : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Preço Mínimo</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                      <input 
                        type="number" 
                        placeholder="Mínimo"
                        className="w-full pl-12 pr-5 py-4 bg-slate-50 rounded-2xl focus:outline-none border border-slate-200 focus:border-accent text-slate-900 font-bold text-sm"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Preço Máximo</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                      <input 
                        type="number" 
                        placeholder="Máximo"
                        className="w-full pl-12 pr-5 py-4 bg-slate-50 rounded-2xl focus:outline-none border border-slate-200 focus:border-accent text-slate-900 font-bold text-sm"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-6">
                  <button 
                    onClick={() => {
                      setPurpose('');
                      setType('');
                      setMinPrice('');
                      setMaxPrice('');
                      setBedrooms('');
                      setSearchQuery('');
                      setSearchParams({});
                    }}
                    className="text-slate-400 hover:text-accent text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
                  >
                    Limpar Filtros Inteligentes
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-10">
          <p className="text-slate-500 font-bold text-sm">
            Mostrando <span className="text-primary font-black underline decoration-accent decoration-2 underline-offset-4">{filteredProperties.length}</span> imóveis exclusivos
          </p>
          <div className="flex items-center gap-3">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ordenar por</label>
            <select className="bg-transparent text-xs font-black text-primary uppercase tracking-widest focus:outline-none cursor-pointer">
              <option>Mais recentes</option>
              <option>Menor preço</option>
              <option>Maior preço</option>
              <option>Relevância</option>
            </select>
          </div>
        </div>

        {/* Property Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredProperties.map((property) => (
                <motion.div
                  key={property.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-[48px] p-24 text-center border border-dashed border-slate-200 shadow-xl shadow-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Search size={44} className="text-slate-300" />
            </div>
            <h3 className="text-3xl font-black text-primary mb-3 tracking-tight">Nenhum imóvel localizado</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-10 font-medium leading-relaxed">
              Tente ajustar seus critérios de busca ou entre em contato para uma consultoria personalizada de prospecção.
            </p>
            <button 
              onClick={() => {
                setPurpose('');
                setType('');
                setMinPrice('');
                setMaxPrice('');
                setBedrooms('');
                setSearchQuery('');
                setSearchParams({});
              }}
              className="btn-primary px-12 py-5 text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              Resetar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
