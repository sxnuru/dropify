/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Product } from '../types';
import { 
  Sparkles, Send, Bot, User, RefreshCw, ChevronRight, HelpCircle
} from 'lucide-react';

interface LiveChatProps {
  onNavigateToProduct: (id: string) => void;
  products: Product[];
}

export default function LiveChat({ onNavigateToProduct, products }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Welcome to **DreamShelf**. I am your personal AI shopper and stylist. Let me know what aesthetic you are building today! For example, try clicking one of the style prompts below.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiSource, setAiSource] = useState<'gemini_3.5_flash' | 'offline_concierge' | 'calculating'>('offline_concierge');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const stylePrompts = [
    { label: "Suggest an organic workspaces look", query: "Suggest some brutalist clay vases and architectural books to style a minimalist workspace shelf." },
    { label: "Design a luxury travel outfit", query: "Can you recommend a premium lightweight outerwear look for high-end airport travel?" },
    { label: "I need space-saving workout gear", query: "What smart home fitness dumbbells or items do you have that are compact and stylish?" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setAiSource('calculating');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ sender: m.sender, text: m.text })),
          userPreferences: { localTime: new Date().toISOString() }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setAiSource(data.source);
      } else {
        throw new Error('Fidelity router failed to respond.');
      }
    } catch (error) {
      console.error('Chat AI failed:', error);
      // Fallback
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: "I encountered a transient latency shift, but I highly recommend browsing our signature double-faced [Nordic Cashmere Overcoat](href:product:ds-003) ($490). It is handcrafted from sustainably sourced cashmere and drapes like fluid sculpture. Apply coupon **DREAM20** to get 20% off!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setAiSource('offline_concierge');
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to parse Markdown bolding and our custom product link structures: `[Name](href:product:ID)`
  const renderMessageContent = (text: string) => {
    // 1. First, search and split for product references: [Name](href:product:ID)
    const regex = /\[([^\]]+)\]\(href:product:([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      
      // Add preceding plain text
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }

      const pName = match[1];
      const pId = match[2];

      // Add clickable custom component
      parts.push(
        <button
          key={`btn-link-${matchIndex}`}
          onClick={() => onNavigateToProduct(pId)}
          className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-100 font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg transition-all mx-1 shadow-sm uppercase tracking-wide cursor-pointer align-baseline"
        >
          {pName} <ChevronRight className="w-3 h-3 text-blue-600 inline shrink-0" />
        </button>
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    // Fallback if no custom links found, just return plain text
    if (parts.length === 0) {
      parts.push(text);
    }

    // 2. Map parts to format basic markdown boldings like `**text**` or `_text_`
    return parts.map((part, idx) => {
      if (typeof part !== 'string') return part; // already a custom react component button

      const boldRegex = /\*\*([^*]+)\*\*/g;
      const subParts = [];
      let subLastIndex = 0;
      let boldMatch;

      while ((boldMatch = boldRegex.exec(part)) !== null) {
        if (boldMatch.index > subLastIndex) {
          subParts.push(part.substring(subLastIndex, boldMatch.index));
        }
        subParts.push(<strong key={`bold-${boldMatch.index}`} className="font-extrabold text-slate-900">{boldMatch[1]}</strong>);
        subLastIndex = boldRegex.lastIndex;
      }

      if (subLastIndex < part.length) {
        subParts.push(part.substring(subLastIndex));
      }

      return <span key={`text-part-${idx}`}>{subParts.length > 0 ? subParts : part}</span>;
    });
  };

  return (
    <div id="ai-chat-container" className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[580px] overflow-hidden">
      
      {/* Assistant Header */}
      <div className="bg-slate-900 p-5 flex items-center justify-between border-b border-slate-800 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-blue-800/80 border border-blue-500/30 flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-white text-sm">Aethera Stylist</h3>
            <span className="font-mono text-[9px] text-blue-400 uppercase tracking-widest block font-bold">DreamShelf Smart Personal Shopper</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[9px]">
          {aiSource === 'gemini_3.5_flash' && (
            <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Gemini 3.5 Active
            </span>
          )}
          {aiSource === 'offline_concierge' && (
            <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Offline Concierge
            </span>
          )}
          {aiSource === 'calculating' && (
            <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-bold animate-pulse">
              ANALYZING CATALOG...
            </span>
          )}
        </div>
      </div>

      {/* Messages Scroll Frame */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
        
        {messages.map((msg) => (
          <div 
            id={`chat-msg-${msg.id}`}
            key={msg.id} 
            className={`flex gap-3 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-900 text-white'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className="space-y-1">
              <div className={`p-4 rounded-2xl text-xs font-sans leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-slate-900 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
              }`}>
                {renderMessageContent(msg.text)}
              </div>
              <span className={`block font-mono text-[9px] text-slate-400 ${
                msg.sender === 'user' ? 'text-right' : ''
              }`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-[80%] animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white text-slate-400 border border-slate-100 p-4 rounded-2xl rounded-tl-none text-xs font-sans flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Analyzing specs, coordinating catalog fits...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Container */}
      <div className="px-5 py-2.5 bg-white border-t border-slate-50 overflow-x-auto whitespace-nowrap shrink-0 flex gap-2">
        {stylePrompts.map((p, idx) => (
          <button
            id={`quick-prompt-${idx}`}
            key={idx}
            onClick={() => handleSendMessage(p.query)}
            className="inline-block px-3.5 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-800 text-slate-600 font-sans text-xs font-medium rounded-xl border border-slate-200/60 transition-all cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Frame */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0 flex items-center gap-3">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage(inputText);
          }}
          placeholder="Ask Aethera Stylist to recommend accessories or describe materials..."
          className="flex-1 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-sans placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
        <button 
          id="chat-send-btn"
          onClick={() => handleSendMessage(inputText)}
          className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all cursor-pointer shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
