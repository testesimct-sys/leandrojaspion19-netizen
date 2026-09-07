import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Star,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProperties, updateProperty, deleteProperty } from '../../services/propertyService';
import { Property, PropertyStatus, PropertyType, PropertyPurpose } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice } from '../../utils';

export default function PropertyList() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'ALL'>('ALL');
  const [purposeFilter, setPurposeFilter] = useState<PropertyPurpose | 'ALL'>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [statusFilter, typeFilter, purposeFilter]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (typeFilter !== 'ALL') filters.type = typeFilter;
      if (purposeFilter !== 'ALL') filters.purpose = purposeFilter;
      
      const result = await getProperties({ ...filters, pageSize: 50 });
      setProperties(result.properties);
    } catch (error) {
      console.error('Erro ao buscar imóveis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (property: Property) => {
    try {
      await updateProperty(property.id, { featured: !property.featured });
      setProperties(properties.map(p => p.id === property.id ? { ...p, featured: !p.featured } : p));
    } catch (error) {
      console.error('Erro ao atualizar destaque:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.')) {
      try {
        await deleteProperty(id);
        setProperties(properties.filter(p => p.id !== id));
      } catch (error) {
        console.error('Erro ao excluir imóvel:', error);
      }
    }
  };

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    p.neighborhood.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">Gestão de Inventário</span>
          <h1 className="text-4xl font-black text-primary tracking-tighter">Imóveis</h1>
          <p className="text-slate-500 font-medium mt-1">Gerencie seu catálogo de imóveis, status e destaques.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/imoveis/novo')}
          className="px-8 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
        >
          <Plus size={20} />
          Cadastrar Imóvel
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Busque por código, título ou endereço..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl focus:outline-none focus:border-accent border border-transparent transition-all font-medium text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-4 rounded-2xl border flex items-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all ${showFilters ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}`}
            >
              <Filter size={18} />
              Filtros
            </button>
            <button 
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
                setPurposeFilter('ALL');
              }}
              className="px-6 py-4 rounded-2xl bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
            >
              Limpar
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 mt-6 border-t border-slate-50">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-xs focus:outline-none focus:border-accent appearance-none cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <option value="ALL">Todos os status</option>
                    <option value="AVAILABLE">Disponível</option>
                    <option value="RESERVED">Reservado</option>
                    <option value="SOLD">Vendido</option>
                    <option value="RENTED">Alugado</option>
                    <option value="INACTIVE">Inativo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-xs focus:outline-none focus:border-accent appearance-none cursor-pointer"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                  >
                    <option value="ALL">Todos os tipos</option>
                    <option value="HOUSE">Casa</option>
                    <option value="APARTMENT">Apartamento</option>
                    <option value="LAND">Terreno</option>
                    <option value="COMMERCIAL">Comercial</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Finalidade</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-xs focus:outline-none focus:border-accent appearance-none cursor-pointer"
                    value={purposeFilter}
                    onChange={(e) => setPurposeFilter(e.target.value as any)}
                  >
                    <option value="ALL">Todas</option>
                    <option value="SALE">Venda</option>
                    <option value="RENT">Aluguel</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando inventário...</span>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Imóvel</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Destaque</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                          <img 
                            src={property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=300'} 
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">{property.code}</span>
                          <span className="text-sm font-black text-primary truncate max-w-[250px] leading-tight">{property.title}</span>
                          <div className="flex items-center gap-2 mt-1.5 text-slate-400">
                            <MapPin size={12} className="shrink-0" />
                            <span className="text-[10px] font-bold truncate">{property.neighborhood}, {property.city}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-primary">{formatPrice(property.price)}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {property.purpose === 'SALE' ? 'Venda' : 'Aluguel'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          property.status === 'AVAILABLE' ? 'bg-emerald-500' :
                          property.status === 'RESERVED' ? 'bg-amber-500' :
                          property.status === 'SOLD' ? 'bg-blue-500' : 'bg-slate-400'
                        }`} />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{property.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleToggleFeatured(property)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          property.featured 
                            ? 'bg-amber-50 text-amber-500 shadow-inner' 
                            : 'bg-slate-50 text-slate-300 hover:text-slate-400'
                        }`}
                      >
                        <Star size={18} fill={property.featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/imoveis/${property.id}`)}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-primary hover:bg-slate-100 transition-all"
                          title="Visualizar"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => navigate(`/dashboard/imoveis/editar/${property.id}`)}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-accent hover:bg-accent/5 transition-all"
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(property.id)}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Home size={32} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-primary tracking-tight">Nenhum imóvel encontrado</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">Ajuste os filtros ou cadastre seu primeiro imóvel no sistema.</p>
            <button 
              onClick={() => navigate('/dashboard/imoveis/novo')}
              className="mt-8 px-10 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-slate-900 transition-all"
            >
              Cadastrar Imóvel
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredProperties.length > 0 && (
        <div className="flex items-center justify-between px-4">
          <p className="text-xs font-bold text-slate-400">
            Mostrando <span className="text-primary font-black">{filteredProperties.length}</span> imóveis de <span className="text-primary font-black">{properties.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary disabled:opacity-50 transition-all">
              <ChevronLeft size={20} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs">
              1
            </button>
            <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
              2
            </button>
            <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
