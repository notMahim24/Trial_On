import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
}

interface AIChatWidgetProps {
  onProductClick?: (product: any) => void;
}

export default function AIChatWidget({ onProductClick }: AIChatWidgetProps = {}) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your personal AI Stylist. Looking for an outfit for a specific occasion?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Fetch chat history on load if user is logged in
  useEffect(() => {
    // Only fetch if user ID looks like a valid UUID (36 chars) to prevent Supabase 500 errors for mock users like "admin-1"
    const isValidUUID = user?.id && user.id.length === 36 && user.id.includes('-');
    if (user && isValidUUID && isOpen && !sessionId) {
      const fetchHistory = async () => {
        try {
          const res = await fetch(`/api/chat/sessions/${user.id}`);
          if (!res.ok) return;
          const sessions = await res.json();
          if (sessions && sessions.length > 0) {
            const latestSession = sessions[0];
            setSessionId(latestSession.id);
            
            const msgRes = await fetch(`/api/chat/messages/${latestSession.id}`);
            if (!msgRes.ok) return;
            const pastMessages = await msgRes.json();
            
            if (pastMessages && pastMessages.length > 0) {
              const formattedMessages: Message[] = pastMessages.map((m: any) => ({
                role: m.role,
                content: m.content,
                products: typeof m.recommendations === 'string' ? JSON.parse(m.recommendations) : m.recommendations
              }));
              
              setMessages([{ role: 'assistant', content: 'Hello! I am your personal AI Stylist. Looking for an outfit for a specific occasion?' }, ...formattedMessages]);
            }
          }
        } catch (err) {
          console.error("Failed to fetch chat history:", err);
        }
      };
      fetchHistory();
    }
  }, [user, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Create chat history format expected by backend
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat/wrapper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           userId: user?.id,
           sessionId: sessionId,
           user_message: userMessage, 
           chat_history: chatHistory 
        })
      });

      if (!res.ok) throw new Error('API Error');

      const data = await res.json();
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply || "I couldn't process that, sorry.", 
        products: typeof data.recommendations === 'string' ? JSON.parse(data.recommendations) : data.recommendations 
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 z-[100] bg-black text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center justify-center"
          >
            <Sparkles size={24} className="text-brand-accent animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white/95 backdrop-blur-xl shadow-2xl border border-black/10 flex flex-col overflow-hidden rounded-t-xl rounded-bl-xl"
          >
            {/* Header */}
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-brand-accent" />
                <span className="font-serif text-lg tracking-wider">AI Stylist</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:opacity-70 transition-opacity">
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-brand-muted/10">
              {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex flex-col max-w-[85%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-black text-white rounded-tr-none" 
                      : "bg-black/5 text-black rounded-tl-none border border-black/5"
                  )}>
                    {msg.content}
                  </div>
                  
                  {/* Product Recommendations */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 flex overflow-x-auto gap-3 pb-2 w-[300px] custom-scrollbar">
                      {msg.products.map((p, i) => (
                        <div 
                          key={i} 
                          onClick={() => onProductClick && onProductClick(p)}
                          className="flex-shrink-0 w-32 bg-white border border-black/10 overflow-hidden cursor-pointer hover:border-black/30 transition-colors"
                        >
                          <div className="aspect-[3/4] bg-brand-muted">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-2">
                            <p className="text-[9px] uppercase tracking-widest font-bold truncate">{p.name}</p>
                            <p className="text-xs font-serif mt-1">${p.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="mr-auto bg-black/5 text-black p-3 rounded-2xl rounded-tl-none border border-black/5 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-xs uppercase tracking-widest opacity-60 font-bold">Stylist is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-black/5">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 bg-black/5 rounded-full px-4 py-2 border border-black/10 focus-within:border-black/30 transition-colors"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for fashion advice..."
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="p-2 text-black hover:bg-black/10 rounded-full transition-colors disabled:opacity-30"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
