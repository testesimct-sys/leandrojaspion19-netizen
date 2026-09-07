import { 
  Search, 
  Plus, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar as CalendarIcon,
  User,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBlogPosts, deletePost } from '../../services/blogService';
import { BlogPost, BlogPostStatus } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BlogList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | 'ALL'>('ALL');

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const result = await getBlogPosts(statusFilter === 'ALL' ? undefined : statusFilter);
      setPosts(result);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este artigo?')) {
      try {
        await deletePost(id);
        setPosts(posts.filter(p => p.id !== id));
      } catch (error) {
        console.error('Erro ao excluir post:', error);
      }
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">Marketing de Conteúdo</span>
          <h1 className="text-4xl font-black text-primary tracking-tighter">Blog</h1>
          <p className="text-slate-500 font-medium mt-1">Gerencie seus artigos, notícias e novidades do mercado.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/blog/novo')}
          className="px-8 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Artigo
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Busque por título ou categoria..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl focus:outline-none focus:border-accent border border-transparent transition-all font-medium text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`
                px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all
                ${statusFilter === status 
                  ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' 
                  : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}
              `}
            >
              {status === 'ALL' ? 'Todos' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid */}
      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Carregando artigos...</span>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group hover:border-accent transition-all"
            >
              <div className="aspect-[16/9] overflow-hidden relative">
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-primary/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
                    {post.category}
                  </span>
                  <span className={`
                    text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg backdrop-blur-md
                    ${post.status === 'PUBLISHED' ? 'bg-emerald-500/80 text-white' : 'bg-amber-500/80 text-white'}
                  `}>
                    {post.status}
                  </span>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-primary tracking-tight leading-tight line-clamp-2">{post.title}</h3>
                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-2">
                      <User size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{post.authorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {post.createdAt?.seconds 
                          ? format(new Date(post.createdAt.seconds * 1000), "dd MMM yyyy", { locale: ptBR }) 
                          : '--'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                   <div className="flex items-center gap-1">
                     <Eye size={12} className="text-slate-300" />
                     <span className="text-xs font-black text-slate-300">{post.views}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <button 
                       onClick={() => navigate(`/dashboard/blog/editar/${post.id}`)}
                       className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-accent hover:bg-accent/5 transition-all"
                     >
                       <Edit3 size={18} />
                     </button>
                     <button 
                       onClick={() => handleDelete(post.id)}
                       className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                     >
                       <Trash2 size={18} />
                     </button>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-24 text-center bg-white rounded-[48px] border border-dashed border-slate-200 shadow-xl shadow-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mx-auto mb-6">
            <FileText size={32} className="text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-primary tracking-tight">Nenhum artigo publicado</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">Crie conteúdos relevantes para atrair mais leads e autoridade no mercado.</p>
          <button 
            onClick={() => navigate('/dashboard/blog/novo')}
            className="mt-8 px-10 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-slate-900 transition-all"
          >
            Escrever Artigo
          </button>
        </div>
      )}
    </div>
  );
}
