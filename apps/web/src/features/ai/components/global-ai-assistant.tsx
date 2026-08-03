'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAiChat } from '../hooks/use-ai';

export function GlobalAiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Hi there! I am your Flowlyx AI Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  
  const chatMutation = useAiChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');

    // Prepare context from previous messages (up to last 4)
    const contextLines = messages.slice(-4).map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`);
    const context = contextLines.join('\n');

    chatMutation.mutate(
      { message: userMessage, context },
      {
        onSuccess: (data) => {
          setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        },
        onError: () => {
          setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error while trying to respond. Please try again.' }]);
        }
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20 z-40 transition-transform ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <Sparkles className="h-6 w-6" />
      </Button>

      {/* Chatbox Window */}
      <div 
        className={`fixed bottom-6 right-6 w-80 sm:w-96 flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl z-50 transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`}
        style={{ height: '500px', maxHeight: 'calc(100vh - 48px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Flowlyx AI</h3>
              <p className="text-2xs text-orange-500 font-medium flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                Online
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-zinc-400 hover:text-white rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-orange-500 text-white rounded-br-sm' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-bl-sm whitespace-pre-wrap leading-relaxed'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                <span className="text-xs">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-zinc-900/50 border-t border-zinc-800 rounded-b-2xl shrink-0">
          <div className="flex items-end gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-1 focus-within:border-orange-500/50 focus-within:ring-1 focus-within:ring-orange-500/50 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 px-3 py-2 outline-none"
              disabled={chatMutation.isPending}
            />
            <Button 
              size="icon" 
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="h-8 w-8 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shrink-0 disabled:bg-zinc-800 disabled:text-zinc-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
