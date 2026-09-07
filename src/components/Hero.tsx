import { Search, MapPin, Home, DollarSign, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Hero() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Home"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-2 px-5 rounded-full bg-accent/20 backdrop-blur-md border border-accent/30 text-accent text-xs font-black uppercase tracking-[0.3em] mb-8">
              Consultoria Imobiliária de Alto Padrão
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] mb-8 tracking-tighter">
              Encontre o <span className="text-accent">imóvel certo</span> para o próximo capítulo.
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-2xl font-medium">
              Curadoria exclusiva, atendimento personalizado e segurança absoluta em cada etapa da sua jornada imobiliária.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 mb-20">
              <button 
                onClick={() => navigate('/imoveis')}
                className="btn-accent px-10 py-5 text-lg"
              >
                Encontrar meu imóvel
                <ArrowRight size={22} />
              </button>
              <button 
                onClick={() => window.open('https://wa.me/5500000000000', '_blank')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                Falar com o corretor
              </button>
            </div>
          </motion.div>

          {/* Quick Search Widget */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="glass p-3 rounded-3xl shadow-2xl flex flex-col md:flex-row items-stretch gap-3 max-w-5xl"
          >
            <div className="flex-[1.5] flex items-center gap-4 px-5 py-4 md:border-r border-slate-200/50">
              <Search size={22} className="text-accent" />
              <div className="flex-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Localização</label>
                <input 
                  type="text" 
                  placeholder="Onde você quer morar?"
                  className="w-full focus:outline-none text-primary placeholder:text-slate-400 font-bold text-lg bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 flex items-center gap-4 px-5 py-4 md:border-r border-slate-200/50">
              <Home size={22} className="text-accent" />
              <div className="flex-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Tipo</label>
                <select 
                  className="w-full bg-transparent focus:outline-none text-primary font-bold text-lg appearance-none cursor-pointer"
                  onChange={(e) => navigate(`/imoveis?type=${e.target.value}`)}
                >
                  <option value="">Qualquer tipo</option>
                  <option value="HOUSE">Casa</option>
                  <option value="APARTMENT">Apartamento</option>
                  <option value="PENTHOUSE">Cobertura</option>
                </select>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-4 px-5 py-4">
              <DollarSign size={22} className="text-accent" />
              <div className="flex-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Investimento</label>
                <select className="w-full bg-transparent focus:outline-none text-primary font-bold text-lg appearance-none cursor-pointer">
                  <option value="">Faixa de preço</option>
                  <option value="0-500k">Até R$ 500k</option>
                  <option value="500k-1m">R$ 500k - R$ 1M</option>
                  <option value="1m+">Acima de R$ 1M</option>
                </select>
              </div>
            </div>
            <button 
              onClick={() => navigate(`/imoveis?q=${searchQuery}`)}
              className="bg-primary hover:bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl active:scale-95 shrink-0"
            >
              Buscar
            </button>
          </motion.div>
        </div>
      </div>

      {/* Floating Metrics (Optional flair) */}
      <div className="absolute bottom-10 right-10 hidden xl:flex gap-8">
        <div className="text-right">
          <div className="text-3xl font-black text-white">120+</div>
          <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Imóveis Vendidos</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-white">R$ 50M+</div>
          <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Em Patrimônio</div>
        </div>
      </div>
    </section>
  );
}
