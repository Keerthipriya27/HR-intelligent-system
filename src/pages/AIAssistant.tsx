import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { parseDashboardQuery } from '../lib/ai-engine';
import { MEETINGS, EMPLOYEES, getWeeklySpend, getProjectCostMap } from '../lib/mock-data';
import { formatCurrency, cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  'Show me total HR spend by project',
  'Which meetings need attribution review?',
  'What is the weekly spend trend?',
  'Show cost breakdown by role',
  'Which projects are over budget?',
  'Top 5 meetings by cost',
];

export function AIAssistant() {
  const { projects } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your HR Cost Intelligence assistant. I can answer questions about meeting costs, project attribution, spend trends, and more. Try one of the suggestions below or ask me anything!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const query = (text || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      const result = await parseDashboardQuery(
        query,
        projects.map(p => p.name),
        EMPLOYEES.map(e => e.name)
      );

      const costMap = getProjectCostMap();
      const weekly = getWeeklySpend();
      const totalSpend = Array.from(costMap.values()).reduce((s, v) => s + v, 0);

      let response = result.summary;

      if (query.toLowerCase().includes('total') || query.toLowerCase().includes('spend')) {
        response += '\n\n**Current snapshot:**\n- Total HR spend: ' + formatCurrency(Math.round(totalSpend)) + '\n- Active projects: ' + projects.length + '\n- Meetings tracked: ' + MEETINGS.length;
      }
      if (query.toLowerCase().includes('weekly') || query.toLowerCase().includes('trend')) {
        const avgWeekly = Math.round(weekly.reduce((s, w) => s + w.spend, 0) / weekly.length);
        response += '\n\n**Weekly average:** ' + formatCurrency(avgWeekly);
      }

      const assistantMsg: Message = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: 'I encountered an error processing your query. Please try rephrasing or check that your API configuration is correct.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-200">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">AI Assistant</h1>
            <p className="text-xs text-slate-400">Natural language queries about your HR costs</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-700">Connected</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={cn(
              'max-w-[80%] rounded-2xl px-4 py-3',
              msg.role === 'user'
                ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200'
                : 'bg-white border border-slate-200/60 shadow-sm'
            )}>
              <p className={cn(
                'text-sm leading-relaxed whitespace-pre-wrap',
                msg.role === 'user' ? 'text-white' : 'text-slate-700'
              )}>
                {msg.content}
              </p>
              <p className={cn(
                'text-[10px] mt-1.5',
                msg.role === 'user' ? 'text-white/50' : 'text-slate-400'
              )}>
                {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-slate-200/60 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                <span className="text-sm text-slate-500">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {showSuggestions && messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-4"
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(suggestion)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 font-medium hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-md p-3">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
            <Bot className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask about costs, trends, attribution..."
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
              input.trim() && !isLoading
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-lg hover:shadow-rose-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
