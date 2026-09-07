import { useParams, Link } from 'react-router-dom';
import { MOCK_PROPERTIES } from '../data';
import { 
  MapPin, BedDouble, Bath, Square, Car, Ruler, 
  CheckCircle2, Share2, Heart, MessageCircle, 
  Calendar, Info, Phone, Mail, User, Send,
  ChevronLeft, ChevronRight, Shield, Check
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createLead } from '../services/leadService';

export default function PropertyDetails() {
  const { id } = useParams();
  const property = MOCK_PROPERTIES.find(p => p.id === id);
  const [activeImage, setActiveImage] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-black text-slate-900 mb-4">Imóvel não encontrado</h1>
        <p className="text-slate-500 mb-8">O imóvel que você está procurando não existe ou foi removido.</p>
        <Link to="/imoveis" className="bg-primary text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs">
          Voltar para busca
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(property.price);

  const condominiumPrice = property.condominiumFee ? new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(property.condominiumFee) : null;

  const iptuPrice = property.iptu ? new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(property.iptu) : null;

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.phone, // Assuming phone is also whatsapp for now
        message: formData.message || `Tenho interesse no imóvel ${property.code}: ${property.title}`,
        propertyId: property.id,
        propertyCode: property.code,
        source: 'SITE',
        priority: 'NORMAL',
        score: 0
      });
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Ocorreu um erro ao enviar sua mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-32 bg-white">
      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px] md:h-[650px]">
          <div className="lg:col-span-8 relative rounded-[40px] overflow-hidden shadow-2xl group">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImage}
                src={property.images[activeImage] || property.images[0]} 
                alt={property.title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 flex items-center justify-between px-8 opacity-0 group-hover:opacity-100 transition-all duration-500">
              <button 
                onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : property.images.length - 1)}
                className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all shadow-2xl border border-white/30"
              >
                <ChevronLeft size={28} />
              </button>
              <button 
                onClick={() => setActiveImage(prev => prev < property.images.length - 1 ? prev + 1 : 0)}
                className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all shadow-2xl border border-white/30"
              >
                <ChevronRight size={28} />
              </button>
            </div>
            <div className="absolute top-8 left-8 flex flex-col gap-3">
              <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl backdrop-blur-md border border-white/20 ${
                property.purpose === 'SALE' ? 'bg-primary/80 text-white' : 'bg-emerald-600/80 text-white'
              }`}>
                {property.purpose === 'SALE' ? 'Venda Exclusiva' : 'Aluguel Disponível'}
              </span>
              {property.featured && (
                <span className="bg-accent text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl border border-accent/30">
                  Destaque Elite
                </span>
              )}
            </div>
            <div className="absolute bottom-8 right-8 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-xl text-white text-[10px] font-black tracking-widest border border-white/10">
              {activeImage + 1} / {property.images.length}
            </div>
          </div>
          <div className="lg:col-span-4 hidden lg:grid grid-rows-2 gap-6">
            {property.images.slice(1, 3).map((img, i) => (
              <div 
                key={i} 
                className="relative rounded-[32px] overflow-hidden shadow-xl cursor-pointer group"
                onClick={() => setActiveImage(i + 1)}
              >
                <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Info Column */}
          <div className="lg:col-span-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-12 border-b border-slate-100 pb-12">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-accent font-black uppercase tracking-[0.2em] text-[10px] mb-4">
                  <MapPin size={14} />
                  {property.neighborhood}, {property.city}
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-primary mb-4 leading-[1.1] tracking-tighter">{property.title}</h1>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-3 py-1 rounded-md">ID: {property.code}</span>
                  <div className="flex gap-4">
                    <button className="text-slate-400 hover:text-accent transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                      <Share2 size={14} /> Compartilhar
                    </button>
                    <button className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                      <Heart size={14} /> Favoritar
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.3em] mb-1">Valor do Investimento</span>
                <div className="text-5xl font-black text-primary tracking-tighter leading-none">{formattedPrice}</div>
                <div className="flex gap-4 mt-3">
                  {condominiumPrice && <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Cond: <span className="text-primary">{condominiumPrice}</span></span>}
                  {iptuPrice && <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">IPTU: <span className="text-primary">{iptuPrice}</span></span>}
                </div>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-8 bg-slate-50 rounded-[40px] mb-16">
              {[
                { icon: <BedDouble size={28} />, value: property.bedrooms, label: "Quartos" },
                { icon: <Bath size={28} />, value: property.bathrooms, label: "Banheiros" },
                { icon: <Car size={28} />, value: property.parkingSpaces, label: "Vagas" },
                { icon: <Square size={24} />, value: `${property.builtArea}m²`, label: "Área Const." },
              ].map((spec, i) => (
                <div key={i} className={`flex flex-col items-center text-center ${i > 0 ? 'sm:border-l border-slate-200' : ''}`}>
                  <div className="text-accent mb-3">{spec.icon}</div>
                  <span className="text-primary font-black text-2xl tracking-tighter">{spec.value}</span>
                  <span className="text-slate-400 text-[9px] uppercase font-black tracking-widest mt-1">{spec.label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-16">
              <h2 className="text-2xl font-black text-primary mb-8 tracking-tight flex items-center gap-4">
                <div className="w-12 h-1.5 bg-accent rounded-full" />
                Apresentação do Imóvel
              </h2>
              <div className="text-slate-600 leading-relaxed space-y-6 text-xl font-medium">
                <p className="first-letter:text-5xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left leading-relaxed">
                  {property.description}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="mb-16">
              <h2 className="text-2xl font-black text-primary mb-8 tracking-tight flex items-center gap-4">
                <div className="w-12 h-1.5 bg-accent rounded-full" />
                Comodidades & Lazer
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {property.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 group">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-accent shadow-sm group-hover:bg-accent group-hover:text-white transition-colors">
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="font-bold text-slate-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="mb-16">
              <h2 className="text-2xl font-black text-primary mb-8 tracking-tight flex items-center gap-4">
                <div className="w-12 h-1.5 bg-accent rounded-full" />
                Localização Privilegiada
              </h2>
              <div className="aspect-[21/9] bg-slate-100 rounded-[40px] flex flex-col items-center justify-center text-slate-400 overflow-hidden relative border border-slate-200 group shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200" 
                  alt="Map Placeholder"
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/20 backdrop-blur-[1px] group-hover:backdrop-blur-none transition-all">
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-accent shadow-2xl mb-4 group-hover:scale-110 transition-transform">
                     <MapPin size={32} />
                   </div>
                   <div className="glass px-8 py-4 rounded-2xl border border-white/20 text-center shadow-2xl">
                     <p className="font-black text-primary uppercase tracking-widest text-xs mb-1">Localização Aproximada</p>
                     <p className="text-primary/70 font-bold text-sm">{property.neighborhood}, {property.city}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Column (Sticky) */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              {/* Form Card */}
              <div className="bg-primary p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/20 blur-[80px] rounded-full" />
                <h3 className="text-3xl font-black mb-4 relative z-10 tracking-tight leading-tight">Tenho Interesse Exclusivo</h3>
                <p className="text-slate-400 text-sm mb-10 relative z-10 font-medium">Consultoria personalizada para o seu próximo grande passo.</p>
                
                {success ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check size={32} className="text-white" />
                    </div>
                    <h4 className="text-xl font-black mb-2">Mensagem Enviada!</h4>
                    <p className="text-slate-300 text-sm">Recebemos seu interesse. Um de nossos consultores entrará em contato em breve.</p>
                    <button 
                      onClick={() => setSuccess(false)}
                      className="mt-6 text-[10px] font-black uppercase tracking-widest text-accent hover:underline"
                    >
                      Enviar outra mensagem
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome Completo</label>
                      <div className="relative">
                        <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Como podemos chamá-lo?" 
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-accent transition-all text-sm font-medium" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Canal de Contato</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="Seu melhor e-mail" 
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-accent transition-all text-sm font-medium" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">WhatsApp</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          type="tel" 
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="(00) 00000-0000" 
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-accent transition-all text-sm font-medium" 
                        />
                      </div>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full btn-accent py-5 text-sm uppercase tracking-[0.2em] mt-8 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          Agendar Consultoria
                          <Calendar size={20} />
                        </div>
                      )}
                    </button>
                    <button 
                      type="button"
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-sm"
                    >
                      Canal WhatsApp
                      <MessageCircle size={20} className="text-emerald-500" />
                    </button>
                  </form>
                )}
              </div>

              {/* Broker Card */}
              <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 group hover:bg-white hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150" className="w-20 h-20 rounded-[24px] object-cover shadow-xl group-hover:scale-105 transition-transform grayscale hover:grayscale-0" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg">
                      <Shield size={16} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-black text-primary text-xl leading-tight">Ricardo Santos</h4>
                    <p className="text-[10px] text-accent font-black uppercase tracking-widest mt-1">CRECI 123.456-F</p>
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 italic">"Compromisso com a transparência e a excelência em cada etapa do seu negócio imobiliário."</p>
                <Link to="/sobre" className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:text-accent flex items-center gap-2 transition-colors">
                  Perfil Consultivo
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
