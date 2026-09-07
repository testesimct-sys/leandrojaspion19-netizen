import Hero from '../components/Hero';
import PropertyCard from '../components/PropertyCard';
import { MOCK_PROPERTIES } from '../data';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Shield, TrendingUp, Handshake, Users, Phone, Mail, MapPin, Send, ArrowRight, MessageCircle } from 'lucide-react';

export default function Home() {
  const featuredProperties = MOCK_PROPERTIES.filter(p => p.featured);
  const recentProperties = MOCK_PROPERTIES.slice(0, 4);

  return (
    <div className="flex flex-col">
      <Hero />

      {/* Featured Properties */}
      <section className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Curadoria Exclusiva</span>
              <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tighter">Imóveis em Destaque</h2>
              <p className="text-slate-500 mt-6 text-lg leading-relaxed">Uma seleção rigorosa dos melhores imóveis disponíveis, avaliados por seu potencial de valorização e excelência arquitetônica.</p>
            </div>
            <Link to="/imoveis" className="inline-flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs hover:text-accent transition-all group">
              Explorar Catálogo Completo
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center transition-transform group-hover:translate-x-2">
                <TrendingUp size={20} className="text-accent" />
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Diferenciais</span>
            <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tighter mb-8">Excelência em cada detalhe.</h2>
            <p className="text-slate-500 text-lg leading-relaxed">Minha missão é elevar o padrão do atendimento imobiliário, proporcionando uma experiência de compra e venda sofisticada, segura e absolutamente transparente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="text-accent" size={36} />,
                title: "Segurança Absoluta",
                description: "Análise jurídica minuciosa de toda a documentação, garantindo uma transação 100% protegida e livre de imprevistos."
              },
              {
                icon: <TrendingUp className="text-accent" size={36} />,
                title: "Expertise de Mercado",
                description: "Visão estratégica sobre tendências e valorização, auxiliando você a tomar as melhores decisões de investimento."
              },
              {
                icon: <Handshake className="text-accent" size={36} />,
                title: "Negociação de Elite",
                description: "Habilidade comercial refinada para extrair o melhor valor possível, seja na compra ou na venda do seu patrimônio."
              }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-start p-10 rounded-[40px] bg-slate-50 hover:bg-primary group transition-all duration-500">
                <div className="mb-8 p-5 bg-white rounded-2xl shadow-xl shadow-slate-200/50 group-hover:bg-accent transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black text-primary mb-5 group-hover:text-white transition-colors">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed group-hover:text-slate-300 transition-colors">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats/About Section */}
      <section className="py-32 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/10 blur-[150px] rounded-full translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Experiência e Autoridade</span>
              <h2 className="text-4xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-tight">Consultoria Imobiliária com Alma Digital.</h2>
              <p className="text-slate-400 text-xl mb-12 leading-relaxed font-medium">
                Entendo que um imóvel de alto padrão é mais do que tijolos e concreto; é a materialização de um legado. Meu trabalho combina tecnologia de ponta com um atendimento humano e exclusivo.
              </p>
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <div className="text-5xl font-black text-white mb-3 tracking-tighter">100%</div>
                  <div className="text-xs text-slate-500 font-black uppercase tracking-[0.2em]">Foco no Cliente</div>
                </div>
                <div>
                  <div className="text-5xl font-black text-white mb-3 tracking-tighter">+R$250M</div>
                  <div className="text-xs text-slate-500 font-black uppercase tracking-[0.2em]">Volume de Negócios</div>
                </div>
              </div>
              <Link to="/sobre" className="btn-accent px-10">
                Conheça minha trajetória
                <ArrowRight size={20} />
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl relative z-10 border-8 border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800" 
                  alt="Corretor"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 glass p-10 rounded-[40px] shadow-2xl z-20 hidden md:block">
                <div className="text-primary font-black text-xl mb-1 tracking-tight uppercase">CRECI 123.456-F</div>
                <div className="text-accent text-[10px] font-black uppercase tracking-widest">Consultor Especialista</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-20">
            <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Feedback</span>
            <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tighter mb-6">Relatos de confiança.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Ricardo Mendes",
                role: "CEO Tech Corp",
                text: "O atendimento superou todas as expectativas. A curadoria foi impecável e a negociação conduzida com extrema maestria e segurança.",
                avatar: "https://i.pravatar.cc/150?u=ricardo"
              },
              {
                name: "Ana Paula Silva",
                role: "Juíza Federal",
                text: "A discrição e o profissionalismo foram fundamentais para a venda do meu imóvel. Uma experiência realmente diferenciada no mercado.",
                avatar: "https://i.pravatar.cc/150?u=ana"
              },
              {
                name: "Carlos Eduardo",
                role: "Investidor Imobiliário",
                text: "Raramente encontro um nível de análise técnica e de mercado tão profundo. Tornou-se meu consultor de confiança para todos os negócios.",
                avatar: "https://i.pravatar.cc/150?u=carlos"
              }
            ].map((testimonial, index) => (
              <div key={index} className="p-10 rounded-[40px] bg-slate-50 border border-transparent hover:border-accent/20 hover:bg-white hover:shadow-2xl transition-all duration-500 group">
                <div className="flex items-center gap-5 mb-8">
                  <div className="relative">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-16 h-16 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-accent rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-lg">"</div>
                  </div>
                  <div>
                    <div className="font-black text-primary text-lg leading-tight">{testimonial.name}</div>
                    <div className="text-[10px] text-accent uppercase font-black tracking-widest mt-1">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex gap-1.5 mt-8">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 bg-accent/30 rounded-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action - Contact */}
      <section className="py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">Seu próximo <span className="text-accent">capítulo</span> começa aqui.</h2>
          <p className="text-slate-400 text-xl mb-16 max-w-2xl mx-auto font-medium">
            Agende uma reunião estratégica para discutirmos seus objetivos imobiliários com total exclusividade.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a 
              href="https://wa.me/5500000000000" 
              className="btn-accent px-12 py-6 text-lg w-full sm:w-auto uppercase tracking-widest"
            >
              <MessageCircle size={24} />
              Inicie uma Conversa
            </a>
            <Link 
              to="/contato" 
              className="btn-outline border-white/20 text-white hover:bg-white/10 px-12 py-6 text-lg w-full sm:w-auto uppercase tracking-widest"
            >
              <Mail size={24} />
              Agende uma Reunião
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
