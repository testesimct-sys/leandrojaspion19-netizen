import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import AIAssistant from './components/ai/AIAssistant';
import Home from './pages/Home';
import SearchPage from './pages/Search';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import PropertyList from './pages/admin/PropertyList';
import PropertyForm from './pages/admin/PropertyForm';
import LeadList from './pages/admin/LeadList';
import LeadDetails from './pages/admin/LeadDetails';
import ClientList from './pages/admin/ClientList';
import Appointments from './pages/admin/Appointments';
import BlogList from './pages/admin/BlogList';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

// CRM Pages
import CRMOverview from './pages/admin/crm/Overview';
import Pipeline from './pages/admin/crm/Pipeline';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col font-sans text-slate-900">
    <Header />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
    <AIAssistant />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/imoveis" element={<PublicLayout><SearchPage /></PublicLayout>} />
          <Route path="/imovel/:id" element={<PublicLayout><PropertyDetails /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
          <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
          
          <Route path="/favoritos" element={
            <ProtectedRoute allowedRoles={['CLIENTE', 'CORRETOR', 'ADMIN']}>
              <PublicLayout>
                <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center p-6 text-center">
                  <h1 className="text-4xl font-black mb-4">Meus Favoritos</h1>
                  <p className="text-slate-500 mb-8 max-w-md">Em breve: Seus imóveis salvos aparecerão aqui.</p>
                </div>
              </PublicLayout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'CORRETOR']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="imoveis" element={<PropertyList />} />
            <Route path="imoveis/novo" element={<PropertyForm />} />
            <Route path="imoveis/editar/:id" element={<PropertyForm />} />
            <Route path="leads" element={<LeadList />} />
            <Route path="leads/:id" element={<LeadDetails />} />
            <Route path="clientes" element={<ClientList />} />
            <Route path="visitas" element={<Appointments />} />
            <Route path="blog" element={<BlogList />} />
            <Route path="relatorios" element={<Reports />} />
            <Route path="configuracoes" element={<Settings />} />
            
            {/* CRM Routes */}
            <Route path="crm" element={<CRMOverview />} />
            <Route path="crm/pipeline" element={<Pipeline />} />
            <Route path="crm/propostas" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Propostas (Em breve)</h1></div>} />
            <Route path="crm/tarefas" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Tarefas (Em breve)</h1></div>} />
            <Route path="crm/interacoes" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Interações (Em breve)</h1></div>} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={
            <PublicLayout>
              <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black mb-4">Página em Construção</h1>
                <p className="text-slate-500 mb-8 max-w-md">Estamos trabalhando nesta funcionalidade para trazer a melhor experiência imobiliária para você.</p>
                <a href="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs">Voltar para Home</a>
              </div>
            </PublicLayout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

