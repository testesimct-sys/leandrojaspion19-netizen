import { Link } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-slate-400 pt-32 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand & Mission */}
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-white flex items-center justify-center rounded-2xl transition-transform group-hover:scale-110">
                <span className="text-primary font-black text-2xl">E</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl leading-none text-white tracking-tighter">ELITE</span>
                <span className="text-[10px] tracking-[0.3em] font-black leading-none text-accent">IMÓVEIS</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs font-medium">
              Elevando o patamar das transações imobiliárias. Curadoria exclusiva para quem não aceita nada menos que a excelência.
            </p>
            <div className="flex items-center gap-4">
              {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-accent hover:border-accent hover:text-white transition-all duration-300">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-8">Navegação</h4>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-widest">
              <li><Link to="/imoveis" className="hover:text-accent transition-colors">Portfólio</Link></li>
              <li><Link to="/venda-seu-imovel" className="hover:text-accent transition-colors">Venda seu Imóvel</Link></li>
              <li><Link to="/sobre" className="hover:text-accent transition-colors">Quem Sou</Link></li>
              <li><Link to="/blog" className="hover:text-accent transition-colors">Insights</Link></li>
              <li><Link to="/contato" className="hover:text-accent transition-colors">Atendimento</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-8">Direct</h4>
            <ul className="space-y-6 text-sm font-medium">
              <li className="flex items-start gap-4">
                <MapPin size={20} className="text-accent shrink-0" />
                <span className="leading-relaxed">Av. Brg. Faria Lima, 3477<br />Itaim Bibi, São Paulo - SP</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone size={20} className="text-accent shrink-0" />
                <span>+55 11 99999-9999</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail size={20} className="text-accent shrink-0" />
                <span>exclusive@eliteimoveis.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-8">Exclusividade</h4>
            <p className="text-sm mb-6 font-medium">Receba oportunidades de investimento e lançamentos exclusivos.</p>
            <form className="relative group">
              <input 
                type="email" 
                placeholder="Seu e-mail corporativo"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-accent transition-all placeholder:text-slate-500"
              />
              <button className="absolute right-2 top-2 w-10 h-10 bg-accent text-white rounded-xl flex items-center justify-center hover:bg-accent-hover transition-colors shadow-lg">
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              CRECI 123.456-J | Elite Real Estate Advisors
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
              &copy; {currentYear} Elite Imóveis. Absolute Excellence.
            </p>
          </div>
          <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
