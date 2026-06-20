'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Tilago's AI assistant. Ask me anything about our stream overlays, alerts, packages, or 3D motion graphics! 🎬",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="w-80 sm:w-96 glass-card rounded-2xl overflow-hidden shadow-2xl"
            style={{ boxShadow: '0 0 40px rgba(84,22,181,0.3)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-accent-deep/40 to-accent-violet/40 border-b border-[rgba(127,58,161,0.3)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-deep to-highlight flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Tilago AI</p>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setMinimized(true)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-white/5">
                  <Minimize2 size={14} />
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-white/5">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user' ? 'chat-bubble-user text-white' : 'chat-bubble-ai text-text-primary'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="chat-bubble-ai px-4 py-2.5 text-sm">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[rgba(127,58,161,0.3)] flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about our services..."
                className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="p-2 rounded-lg bg-accent-deep hover:bg-accent-violet transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { setOpen(!open); setMinimized(false); }}
        className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #5416B5, #F0830B)', boxShadow: '0 0 25px rgba(84,22,181,0.5)' }}
      >
        <AnimatePresence mode="wait">
          {open && !minimized ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
