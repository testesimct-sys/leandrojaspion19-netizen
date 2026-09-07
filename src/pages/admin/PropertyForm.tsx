import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Save, 
  ArrowRight, 
  Check, 
  MapPin, 
  Home, 
  DollarSign, 
  Info,
  List,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getPropertyById, createProperty, updateProperty } from '../../services/propertyService';
import { generateAIDescription } from '../../services/aiService';
import { Property, PropertyType, PropertyPurpose, PropertyStatus } from '../../types';
import ImageUpload from '../../components/admin/ImageUpload';
import { useAuth } from '../../context/AuthContext';

const FEATURES_LIST = [
  'Piscina', 'Churrasqueira', 'Varanda', 'Elevador', 'Academia', 'Portaria', 
  'Ar-condicionado', 'Mobiliado', 'Área gourmet', 'Jardim', 'Sacada', 'Closet', 'Escritório'
];

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  
  const [formData, setFormData] = useState<Partial<Property>>({
    code: '',
    title: '',
    description: '',
    purpose: 'SALE',
    propertyType: 'HOUSE',
    status: 'AVAILABLE',
    price: 0,
    condominiumFee: 0,
    iptu: 0,
    zipCode: '',
    state: '',
    city: '',
    neighborhood: '',
    address: '',
    bedrooms: 0,
    suites: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    builtArea: 0,
    totalArea: 0,
    features: [],
    images: [],
    videoURL: '',
    featured: false,
  });

  useEffect(() => {
    if (isEditing) {
      const fetchProperty = async () => {
        try {
          const property = await getPropertyById(id);
          if (property) {
            setFormData(property);
          } else {
            navigate('/dashboard/imoveis');
          }
        } catch (err) {
          console.warn('Erro ao carregar dados do imóvel:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    // Validation
    if (!formData.title || !formData.price || !formData.images?.length) {
      alert('Por favor, preencha as informações obrigatórias e adicione pelo menos uma imagem.');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        ownerId: userProfile?.id,
      } as Property;

      if (isEditing) {
        await updateProperty(id, data);
      } else {
        await createProperty(data);
      }
      navigate('/dashboard/imoveis');
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      alert('Erro ao salvar imóvel. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => {
      const features = prev.features || [];
      if (features.includes(feature)) {
        return { ...prev, features: features.filter(f => f !== feature) };
      }
      return { ...prev, features: [...features, feature] };
    });
  };

  const sections = [
    { id: 1, label: 'Informações Básicas', icon: Info },
    { id: 2, label: 'Valores', icon: DollarSign },
    { id: 3, label: 'Localização', icon: MapPin },
    { id: 4, label: 'Características', icon: Home },
    { id: 5, label: 'Galeria', icon: ImageIcon },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dashboard/imoveis')}
            className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-accent hover:border-accent transition-all shadow-sm"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-1 block">Editor de Imóvel</span>
            <h1 className="text-3xl font-black text-primary tracking-tighter">
              {isEditing ? 'Editar Imóvel' : 'Cadastrar Novo Imóvel'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/imoveis')}
            className="px-6 py-3 rounded-2xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-red-500 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="px-10 py-4 bg-accent text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-accent/20 hover:bg-accent/90 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {isEditing ? 'Salvar Alterações' : 'Publicar Imóvel'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white rounded-[32px] border border-slate-100 p-4 shadow-xl shadow-slate-200/50 sticky top-24">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 mb-1
                  ${activeSection === section.id 
                    ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-primary'}
                `}
              >
                <section.icon size={20} />
                <span className="text-xs font-black uppercase tracking-widest">{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Basic Info */}
            <AnimatePresence mode="wait">
              {activeSection === 1 && (
                <motion.div
                  key="section1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Código do Imóvel</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: AP001"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título do Anúncio</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Apartamento de Luxo no Jardins"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Finalidade</label>
                      <select 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm appearance-none cursor-pointer"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value as PropertyPurpose })}
                      >
                        <option value="SALE">Venda</option>
                        <option value="RENT">Aluguel</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Imóvel</label>
                      <select 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm appearance-none cursor-pointer"
                        value={formData.propertyType}
                        onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as PropertyType })}
                      >
                        <option value="HOUSE">Casa</option>
                        <option value="APARTMENT">Apartamento</option>
                        <option value="CONDO">Condomínio</option>
                        <option value="LAND">Terreno</option>
                        <option value="COMMERCIAL">Comercial</option>
                        <option value="FARM">Fazenda / Sítio</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição Detalhada</label>
                      <button
                        type="button"
                        onClick={async () => {
                          if (generatingAI) return;
                          setGeneratingAI(true);
                          try {
                            const aiData = await generateAIDescription(formData);
                            setFormData(prev => ({
                              ...prev,
                              title: aiData.title || prev.title,
                              description: aiData.longDescription || prev.description
                            }));
                          } catch (error) {
                            console.error("AI Error:", error);
                            alert("Erro ao gerar descrição com IA.");
                          } finally {
                            setGeneratingAI(false);
                          }
                        }}
                        className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-widest hover:text-accent/80 transition-colors"
                      >
                        {generatingAI ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        Gerar com IA
                      </button>
                    </div>
                    <textarea 
                      rows={6}
                      required
                      placeholder="Descreva as principais qualidades e detalhes do imóvel..."
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-medium text-sm resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </motion.div>
              )}

              {/* Section 2: Values */}
              {activeSection === 2 && (
                <motion.div
                  key="section2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Preço (R$)</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                        <input 
                          type="number" 
                          required
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                          value={formData.price || ''}
                          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Condomínio (R$)</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                        <input 
                          type="number" 
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                          value={formData.condominiumFee || ''}
                          onChange={(e) => setFormData({ ...formData, condominiumFee: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">IPTU Anual (R$)</label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                        <input 
                          type="number" 
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                          value={formData.iptu || ''}
                          onChange={(e) => setFormData({ ...formData, iptu: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Section 3: Location */}
              {activeSection === 3 && (
                <motion.div
                  key="section3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CEP</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estado</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cidade</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bairro</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                        value={formData.neighborhood}
                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Endereço Completo</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </motion.div>
              )}

              {/* Section 4: Characteristics */}
              {activeSection === 4 && (
                <motion.div
                  key="section4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-12"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quartos</label>
                      <input type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm" value={formData.bedrooms || ''} onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Suítes</label>
                      <input type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm" value={formData.suites || ''} onChange={(e) => setFormData({ ...formData, suites: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Banheiros</label>
                      <input type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm" value={formData.bathrooms || ''} onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vagas</label>
                      <input type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm" value={formData.parkingSpaces || ''} onChange={(e) => setFormData({ ...formData, parkingSpaces: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Área Útil (m²)</label>
                      <input type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm" value={formData.builtArea || ''} onChange={(e) => setFormData({ ...formData, builtArea: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Área Total (m²)</label>
                      <input type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm" value={formData.totalArea || ''} onChange={(e) => setFormData({ ...formData, totalArea: Number(e.target.value) })} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Comodidades e Diferenciais</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {FEATURES_LIST.map((feature) => (
                        <button
                          key={feature}
                          type="button"
                          onClick={() => handleFeatureToggle(feature)}
                          className={`
                            flex items-center gap-3 p-4 rounded-2xl border transition-all text-left
                            ${formData.features?.includes(feature)
                              ? 'bg-accent/10 border-accent text-accent shadow-lg shadow-accent/5'
                              : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}
                          `}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${formData.features?.includes(feature) ? 'bg-accent border-accent text-white' : 'border-slate-200 text-transparent'}`}>
                            <Check size={12} />
                          </div>
                          <span className="text-xs font-bold">{feature}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Section 5: Gallery */}
              {activeSection === 5 && (
                <motion.div
                  key="section5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fotos do Imóvel</label>
                    <ImageUpload 
                      images={formData.images || []} 
                      onChange={(images) => setFormData({ ...formData, images })}
                      propertyId={isEditing ? id : undefined}
                    />
                  </div>
                  <div className="space-y-2 pt-8 border-t border-slate-50">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Link do Vídeo (YouTube/Vimeo)</label>
                    <input 
                      type="url" 
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                      value={formData.videoURL}
                      onChange={(e) => setFormData({ ...formData, videoURL: e.target.value })}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => setActiveSection(prev => Math.max(1, prev - 1))}
                disabled={activeSection === 1}
                className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-accent hover:border-accent transition-all disabled:opacity-0"
              >
                Anterior
              </button>
              {activeSection < 5 ? (
                <button
                  type="button"
                  onClick={() => setActiveSection(prev => Math.min(5, prev + 1))}
                  className="px-10 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-slate-900 transition-all flex items-center gap-2"
                >
                  Próximo
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="px-12 py-5 bg-accent text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-accent/20 hover:bg-accent/90 transition-all flex items-center gap-3"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {isEditing ? 'Salvar Alterações' : 'Publicar Imóvel'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


