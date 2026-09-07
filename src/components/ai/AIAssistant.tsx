import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2,
  RefreshCw,
  Phone,
  Maximize2,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AIMessage, AIConversation } from '../../types';
import { sendAIChatMessage } from '../../services/aiService';
import { 
  createAIConversation, 
  addAIMessage, 
  getAIConversationMessages 
} from '../../services/aiConversationService';
import { useAuth } from '../../context/AuthContext';
import PropertyCard from '../PropertyCard';
import { getPropertyById } from '../../services/propertyService';

export default function AIAssistant() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [recommendedProperties, setRecommendedProperties] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedSessionId = localStorage.getItem('ai_session_id');
    if (savedSessionId) {
      setConversationId(savedSessionId);
      loadMessages(savedSessionId);
    }
  }, []);

  const loadMessages = async (id: string) => {
    try {
      const history = await getAIConversationMessages(id);
      setMessages(history);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    }
  };

  const initConversation = async () => {
    const sessionId = Math.random().toString(36).substring(7);
    const id = await createAIConversation({
      userId: currentUser?.uid,
      sessionId,
      status: 'ACTIVE',
      channel: 'SITE'
    });
    setConversationId(id);
    localStorage.setItem('ai_session_id', id);
    
    // Add initial greeting
    const greeting: Omit<AIMessage, 'id' | 'createdAt'> = {
      conversationId: id,
      role: 'model',
      content: 'Olá! 👋 Sou o assistente imobiliário da Elite Imóveis. Posso ajudar você a encontrar um imóvel, entender as opções disponíveis ou falar com um corretor. O que você procura hoje?'
    };
    await addAIMessage(greeting);
    loadMessages(id);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    let currentConvId = conversationId;
    if (!currentConvId) {
      currentConvId = await createAIConversation({
        userId: currentUser?.uid,
        sessionId: Math.random().toString(36).substring(7),
        status: 'ACTIVE',
        channel: 'SITE'
      });
      setConversationId(currentConvId);
      localStorage.setItem('ai_session_id', currentConvId);
    }

    const userMsg: Omit<AIMessage, 'id' | 'createdAt'> = {
      conversationId: currentConvId,
      role: 'user',
      content: input
    };

    setInput('');
    setMessages(prev => [...prev, { ...userMsg, id: 'temp-' + Date.now(), createdAt: new Date() } as any]);
    setIsLoading(true);

    try {
      await addAIMessage(userMsg);
      
      const chatHistory = await getAIConversationMessages(currentConvId);
      const geminiMessages = chatHistory.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await sendAIChatMessage(geminiMessages, currentConvId);
      const modelContent = response.candidates[0].content.parts[0].text;
      
      const modelMsg: Omit<AIMessage, 'id' | 'createdAt'> = {
        conversationId: currentConvId,
        role: 'model',
        content: modelContent
      };

      await addAIMessage(modelMsg);
      loadMessages(currentConvId);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const restartConversation = () => {
    localStorage.removeItem('ai_session_id');
    setConversationId(null);
    setMessages([]);
    initConversation();
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          if (!conversationId) initConversation();
        }}
        className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group"
      >
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 font-bold text-xs uppercase tracking-widest">
          Assistente Imobiliário
        </span>
        <Bot size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-tighter">Elite AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white/70 uppercase">Online Agora</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={restartConversation}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                  title="Reiniciar conversa"
                >
                  <RefreshCw size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg, i) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`mt-1 p-1 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border border-slate-100 text-slate-700 shadow-sm'}`}>
                      {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="mt-1 p-1 rounded-lg bg-white border border-slate-100 text-slate-700 shadow-sm">
                      <Sparkles size={14} />
                    </div>
                    <div className="p-3 bg-white border border-slate-100 text-slate-700 shadow-sm rounded-2xl rounded-tl-none">
                      <Loader2 size={18} className="animate-spin" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Actions */}
            {messages.length < 3 && (
              <div className="px-4 py-2 flex flex-wrap gap-2 bg-slate-50/50 border-t border-slate-100">
                {[
                  "Comprar casa",
                  "Alugar apto",
                  "Até R$ 500k",
                  "Falar com corretor"
                ].map(action => (
                  <button
                    key={action}
                    onClick={() => {
                      setInput(action);
                      // setTimeout to allow focus
                      setTimeout(() => handleSend(), 10);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-primary hover:text-primary transition-all shadow-sm"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Como posso ajudar você?"
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary text-sm transition-all"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-primary text-white rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:bg-slate-300"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[9px] text-slate-400 mt-2 text-center uppercase font-black tracking-widest">
                Elite AI Inteligência Imobiliária
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
