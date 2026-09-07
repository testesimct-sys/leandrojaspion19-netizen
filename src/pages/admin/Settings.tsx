import { 
  Save, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  Linkedin,
  Upload,
  Loader2,
  Lock,
  Bell,
  Shield
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings } from '../../services/settingsService';
import { SiteSettings } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const [settings, setSettings] = useState<SiteSettings>({
    id: 'general',
    siteName: 'Elite Imóveis',
    description: '',
    contactEmail: '',
    contactPhone: '',
    whatsapp: '',
    creci: '',
    address: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      linkedin: '',
      youtube: ''
    },
    theme: {
      primaryColor: '#1A1D23',
      accentColor: '#D4AF37'
    },
    updatedAt: new Date()
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('GERAL');

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getSiteSettings();
      if (data) setSettings(data);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteSettings(settings);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">Personalização do Sistema</span>
          <h1 className="text-4xl font-black text-primary tracking-tighter">Configurações</h1>
          <p className="text-slate-500 font-medium mt-1">Gerencie a identidade visual e informações da sua imobiliária.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-10 py-4 bg-accent text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-accent/20 hover:bg-accent/90 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Salvar Configurações
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-100 rounded-3xl shadow-sm w-fit">
        {['GERAL', 'CONTATO', 'REDES SOCIAIS', 'SEGURANÇA'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
              ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-primary'}
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <AnimatePresence mode="wait">
          {activeTab === 'GERAL' && (
            <motion.div
              key="geral"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Globe size={20} />
                </div>
                <h3 className="text-lg font-black text-primary tracking-tight">Informações Institucionais</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome da Imobiliária</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Slogan Principal</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Seu sonho, nosso compromisso."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50">
                 <div className="flex items-start gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Logo da Empresa</label>
                      <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-accent hover:text-accent transition-all cursor-pointer group">
                        <Upload size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Alterar Logo</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-6">
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cresci / Licença</label>
                         <input type="text" placeholder="Ex: 12345-J" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm" />
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'CONTATO' && (
            <motion.div
              key="contato"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <h3 className="text-lg font-black text-primary tracking-tight">Canais de Atendimento</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail de Contato</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="email" 
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telefone Comercial</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Endereço Físico</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text" 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'REDES SOCIAIS' && (
            <motion.div
              key="redes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                  <Instagram size={20} />
                </div>
                <h3 className="text-lg font-black text-primary tracking-tight">Redes Sociais</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center shrink-0">
                    <Instagram size={20} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Link do Instagram"
                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                    value={settings.socialMedia?.instagram || ''}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      socialMedia: { ...(settings.socialMedia || {}), instagram: e.target.value } 
                    })}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Facebook size={20} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Link do Facebook"
                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                    value={settings.socialMedia?.facebook || ''}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      socialMedia: { ...(settings.socialMedia || {}), facebook: e.target.value } 
                    })}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center shrink-0">
                    <Linkedin size={20} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Link do LinkedIn"
                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-accent font-bold text-sm"
                    value={settings.socialMedia?.linkedin || ''}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      socialMedia: { ...(settings.socialMedia || {}), linkedin: e.target.value } 
                    })}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'SEGURANÇA' && (
            <motion.div
              key="seguranca"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <h3 className="text-lg font-black text-primary tracking-tight">Segurança e Acesso</h3>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400">
                      <Lock size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-primary">Alterar Senha</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atualize sua senha de acesso periodicamente</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all">
                    Alterar
                  </button>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400">
                      <Bell size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-primary">Notificações por E-mail</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Receber alertas de novos leads e visitas</span>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-accent rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

