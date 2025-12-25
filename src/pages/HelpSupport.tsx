import React, { useState, useRef, useEffect } from 'react';
import { 
  Mail, Phone, Clock, Send, MessageSquare, Search, 
  ChevronDown, ChevronRight, BookOpen, LifeBuoy, Zap,
  ArrowRight, Sparkles, User, Bot, MoreHorizontal
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Card } from '../components/ui';

export const HelpSupport = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'Hello! I\'m your AgriScore AI assistant. How can I help you optimize your farm today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'faq'>('chat');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const faqs = [
    { q: 'How do I improve my AgriScore?', a: 'Monitor soil moisture, maintain nutrient balance, and keep devices healthy. Weekly check-ins help improve your score over time.' },
    { q: 'Can I export my data?', a: 'Yes! Click the "Export" button on any dashboard view. You can choose between PDF or Excel formats containing all your sensor readings.' },
    { q: 'How often do sensors update?', a: 'Sensors update every 15 minutes for soil data and hourly for weather conditions. All data is pushed in real-time to your dashboard.' },
    { q: 'Device is offline, what do I do?', a: 'Check the battery levels and WiFi connection. Go to Settings → IoT Devices for troubleshooting steps. We alert you if a device is offline for 30+ mins.' },
    { q: 'Is my data secure?', a: 'Absolutely. All data is encrypted at rest and in transit using industry-standard protocols. We never share your farm data with third parties.' },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      // In a real app, handle the missing key gracefully
      
      const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy_key' });
      const contents = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: userMsg }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents,
        config: {
          systemInstruction: 'You are a helpful agricultural assistant. Provide practical advice about farming, crops, soil health, and AgriScore features.'
        }
      });

      const text = response.text || 'I apologize, but I am unable to process that request right now.';
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error: any) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the server. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 lg:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-medium text-emerald-300 mb-6">
            <Sparkles className="w-3 h-3" />
            <span>24/7 Intelligent Support</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight leading-tight">
            How can we help you <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">grow today?</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
            Get instant answers from our advanced AI, browse our comprehensive documentation, or connect with our expert support team.
          </p>
          
          <div className="relative max-w-xl group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 flex items-center">
              <Search className="w-6 h-6 text-slate-300 ml-3" />
              <input 
                type="text" 
                placeholder="Search for help articles, tutorials, or troubleshooting..." 
                className="w-full bg-transparent border-none text-white placeholder-slate-400 focus:ring-0 px-4 py-2 text-base"
              />
              <button className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: BookOpen, title: 'Documentation', desc: 'Detailed guides & API refs', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: Zap, title: 'Quick Start', desc: 'Get up and running fast', color: 'text-amber-500', bg: 'bg-amber-50' },
              { icon: LifeBuoy, title: 'Community', desc: 'Join other farmers', color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map((item, i) => (
              <button key={i} className="group flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all text-left">
                <div className={`p-3 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* AI Chat Interface */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">AgriGenius AI</h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Online • Replies instantly
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8F9FC]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-slate-200' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-slate-500" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <div className="relative flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything about your farm..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-700 placeholder-slate-400 px-3"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-slate-900 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-slate-900 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-3">
                AI can make mistakes. Please verify critical farming advice.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Contact Support Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6">Contact Support</h3>
            <div className="space-y-4">
              {[
                { icon: Phone, label: 'Call Us', value: '+91 98765 43210', sub: 'Mon-Fri, 9am-6pm' },
                { icon: Mail, label: 'Email', value: 'support@agriscore.in', sub: 'Response in 2 hours' },
                { icon: MessageSquare, label: 'Live Chat', value: 'Start a chat', sub: 'Available 24/7' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                    <p className="text-xs text-slate-500">{item.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-emerald-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Frequently Asked</h3>
            <div className="space-y-1">
              {faqs.map((item, i) => (
                <details key={i} className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors list-none">
                    <span className="text-sm font-medium text-slate-700 group-open:text-emerald-700">{item.q}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform duration-300" />
                  </summary>
                  <div className="px-3 pb-3 pt-1">
                    <p className="text-xs text-slate-500 leading-relaxed">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
            <button className="w-full mt-4 py-2.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors flex items-center justify-center gap-2">
              View all FAQs <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


