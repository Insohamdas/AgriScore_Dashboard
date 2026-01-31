import React, { useState, useRef, useEffect } from 'react';
import { 
  Mail, Phone, MessageSquare, Search, 
  ChevronDown, ChevronRight, BookOpen, LifeBuoy, Zap,
  ArrowRight, Sparkles, User, Bot, MoreHorizontal,
  Wifi, Battery, AlertTriangle, CheckCircle, FileText,
  Thermometer, Droplets, Sprout, ArrowLeft, Send,
  Facebook, Twitter, Instagram, Youtube, MessageCircle, Users, Linkedin, Calendar, Clock, MapPin
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Custom Icons ---
const XIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    {...props}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// --- Types ---
type ViewState = 'chat' | 'knowledge' | 'troubleshoot' | 'community';

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  icon: React.ElementType;
}

// --- Mock Data ---
const ARTICLES: Article[] = [
  { id: '1', title: 'Optimizing Soil Moisture for Wheat', category: 'Agronomy', readTime: '5 min', icon: Droplets },
  { id: '2', title: 'Calibrating NPK Sensors', category: 'Hardware', readTime: '3 min', icon: Wifi },
  { id: '3', title: 'Understanding pH Levels', category: 'Soil Health', readTime: '7 min', icon: Sprout },
  { id: '4', title: 'Pest Detection Guide', category: 'Crop Health', readTime: '4 min', icon: AlertTriangle },
  { id: '5', title: 'Exporting Yield Reports', category: 'Platform', readTime: '2 min', icon: FileText },
  { id: '6', title: 'Weather Station Maintenance', category: 'Hardware', readTime: '6 min', icon: Thermometer },
];

const FAQS = [
  { q: 'How do I improve my AgriScore?', a: 'Monitor soil moisture, maintain nutrient balance, and keep devices healthy. Weekly check-ins help improve your score over time.' },
  { q: 'Can I export my data?', a: 'Yes! Click the "Export" button on any dashboard view. You can choose between PDF or Excel formats containing all your sensor readings.' },
  { q: 'How often do sensors update?', a: 'Sensors update every 15 minutes for soil data and hourly for weather conditions. All data is pushed in real-time to your dashboard.' },
  { q: 'Device is offline, what do I do?', a: 'Check the battery levels and WiFi connection. Go to Settings → IoT Devices for troubleshooting steps. We alert you if a device is offline for 30+ mins.' },
];

export const HelpSupport = () => {
  const [activeView, setActiveView] = useState<ViewState>('chat');
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'Hello! I\'m your AgriScore AI assistant. How can I help you optimize your farm today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Hero image carousel (cross-fade between multiple images)
  const heroImages = [
    "https://images.unsplash.com/photo-1681226298721-88cdb4096e5f?q=80&w=2533&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1691693809124-d7761a7c4d83?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1707811180403-c22b7ef06476?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1695666403934-5929e4690900?q=80&w=2531&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1633410195091-bd66114cef5f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1596337323475-d2bf40338c8a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1728725045728-60c0beb17c02?q=80&w=986&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setHeroIndex(i => (i + 1) % heroImages.length), 8000);
    return () => clearInterval(id);
  }, []);

  // --- Effects ---
  useEffect(() => {
    if (activeView === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeView]);

  // --- Handlers ---
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
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
      setMessages(prev => [...prev, { role: 'model', text: `I'm having trouble connecting to the server. Please try again later. (Error: ${error.message || error})` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Sub-Components ---
  
  const SystemStatusWidget = () => (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900">System Health</h3>
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">IoT Gateway</p>
              <p className="text-xs text-slate-500">Online • 24ms latency</p>
            </div>
          </div>
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Battery className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Sensor Battery</p>
              <p className="text-xs text-slate-500">Avg. 85% • Good</p>
            </div>
          </div>
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        </div>
      </div>
      <button 
        onClick={() => setActiveView('troubleshoot')}
        className="w-full mt-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
      >
        Run Diagnostics
      </button>
    </div>
  );

  const KnowledgeBaseView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Knowledge Base</h2>
        <button onClick={() => setActiveView('chat')} className="text-sm text-emerald-600 font-medium hover:underline">
          Back to Chat
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ARTICLES.map((article) => (
          <div key={article.id} className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <article.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                {article.readTime}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
              {article.title}
            </h3>
            <p className="text-sm text-slate-500">{article.category}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const TroubleshootView = () => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setActiveView('chat')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Device Diagnostics</h2>
          <p className="text-sm text-slate-500">Automated troubleshooting wizard</p>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-semibold">Sensor Node #4 is unresponsive</p>
            <p className="text-sm opacity-80">Last heartbeat: 45 mins ago</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Recommended Actions:</h3>
          {[
            'Check if the solar panel is obstructed by debris',
            'Ensure the antenna is pointing vertically',
            'Press the reset button on the device for 5 seconds'
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <p className="text-slate-700 text-sm">{step}</p>
            </div>
          ))}
        </div>

        <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
          Retest Connection
        </button>
      </div>
    </div>
  );

  const CommunityView = () => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setActiveView('chat')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Community Hub</h2>
          <p className="text-sm text-slate-500">Connect with fellow farmers and experts</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: 'Facebook Group', icon: Facebook, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '#' },
          { name: 'WhatsApp Community', icon: MessageCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', link: 'https://whatsapp.com/channel/0029VbC5yhMGE56kIAeyBi3K' },
          { name: 'X (Twitter)', icon: XIcon, color: 'text-emerald-600', bg: 'bg-emerald-50', link: 'https://x.com/AgriScore' },
          { name: 'YouTube Channel', icon: Youtube, color: 'text-emerald-600', bg: 'bg-emerald-50', link: 'https://youtube.com/@agriscore?si=QgxLB7U__fqCD71c' },
          { name: 'LinkedIn Official Page', icon: Linkedin, color: 'text-emerald-600', bg: 'bg-emerald-50', link: 'https://www.linkedin.com/company/myagriscore/' },
          { name: 'Instagram', icon: Instagram, color: 'text-emerald-600', bg: 'bg-emerald-50', link: 'https://www.instagram.com/agriscore.official?igsh=MW5uM2dkanQ0MGZiaA==' },
        ].map((social, i) => (
          <a 
            key={i}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group"
          >
            <div className={`w-12 h-12 rounded-full ${social.bg} ${social.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <social.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{social.name}</h3>
              <p className="text-xs text-slate-500">Join conversation</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-emerald-500 transition-colors" />
          </a>
        ))}
      </div>

      <div className="mt-8 group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-sm transition-all hover:shadow-md hover:border-emerald-200">
        <div className="flex flex-col md:flex-row">
          {/* Date Column */}
          <div className="flex flex-col items-center justify-center p-6 bg-emerald-50/50 rounded-xl md:w-32 border border-emerald-100/50 text-emerald-900 shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Feb</span>
            <span className="text-3xl font-bold">15</span>
            <span className="text-xs font-medium text-emerald-600/60 mt-1">2026</span>
          </div>

          {/* Content Column */}
          <div className="flex-1 p-6 flex flex-col justify-center">
               <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
                     <Users className="w-3 h-3" /> In-Person Event
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-medium text-red-600">
                     Limited Spots
                  </span>
               </div>
               <h3 className="text-lg font-bold text-slate-900">Sustainable Irrigation Masterclass</h3>
               <p className="text-sm text-slate-500 mt-1">Join expert agronomists to learn about drip irrigation and water conservation techniques.</p>
               
               <div className="flex items-center gap-4 mt-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                     <Clock className="w-3.5 h-3.5" />
                     10:00 AM - 2:00 PM
                  </div>
                  <div className="flex items-center gap-1.5">
                     <MapPin className="w-3.5 h-3.5" />
                     School Ground, Tarakeswar
                  </div>
               </div>
          </div>

          {/* Action Column */}
          <div className="flex flex-col justify-center p-6 border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/50 rounded-xl md:w-48 text-center space-y-3 shrink-0">
               <div className="text-xs text-slate-500">
                  <span className="font-bold text-slate-900">145</span> farmers going
               </div>
               <div className="flex justify-center -space-x-2 overflow-hidden">
                 {['SK', 'RM', 'AD', 'KP'].map((initial, i) => (
                   <div key={i} className={`inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white text-[10px] font-bold text-white ${
                     ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500'][i]
                   }`}>
                     {initial}
                   </div>
                 ))}
                 <div className="h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">+141</div>
               </div>
               <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                  Register Free
               </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-transparent text-white p-6 lg:p-8 shadow-xl border border-emerald-100 isolate group">
        {/* Natural Image Background with Ken Burns Effect */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {heroImages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Farm scene ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-cover animate-ken-burns transition-opacity duration-1000 ${
                heroIndex === i ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          {/* Darker left overlay for readable white text */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-emerald-800/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 backdrop-blur-md border border-emerald-700/20 text-[10px] font-semibold text-emerald-100 mb-6 shadow-sm">
            <Sprout className="w-3 h-3 text-emerald-200" />
            <span className="tracking-wide uppercase">Kisan Sahayata Kendra</span>
          </div>
          
            <h1 className="text-3xl lg:text-5xl font-bold mb-4 tracking-tight leading-tight text-white drop-shadow-md">
              Suprabhat, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-200">
                A new day for growth.
              </span>
            </h1>
          
          <p className="text-white/90 text-base mb-8 max-w-xl leading-relaxed font-medium drop-shadow-sm">
            Start your day with real-time insights. 
            Check mandi rates, weather, and crop health instantly.
          </p>
          
          <div className="relative max-w-xl group">
            <div className="absolute inset-0 bg-emerald-800/20 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
            <div className="relative bg-white/10 backdrop-blur-xl border border-emerald-800/30 rounded-2xl p-1.5 flex items-center shadow-lg">
              <Search className="w-5 h-5 text-white/80 ml-3" />
              <input 
                type="text" 
                placeholder="Search for 'Wheat prices', 'Soil pH'..." 
                className="w-full bg-transparent border-none text-white placeholder-white/60 focus:ring-0 px-3 py-2 text-sm outline-none font-medium"
              />
              <button className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white px-6 py-2 rounded-xl font-semibold text-xs hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-md shadow-emerald-500/20">
                Search
              </button>
            </div>
          </div>

          {/* Quick Tags */}
          <div className="mt-6 flex flex-wrap gap-2">
            {['Mandi Rates', 'Weather Forecast', 'Soil Health Card', 'Govt Schemes'].map((tag) => (
              <button key={tag} className="px-3 py-1 rounded-full bg-white/10 border border-emerald-900/20 text-[10px] font-semibold text-white/90 hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm shadow-sm">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'knowledge', icon: BookOpen, title: 'Knowledge Base', desc: 'Guides & Tutorials', color: 'text-blue-500', bg: 'bg-blue-50' },
              { id: 'troubleshoot', icon: Zap, title: 'Troubleshoot', desc: 'Fix device issues', color: 'text-amber-500', bg: 'bg-amber-50' },
              { id: 'community', icon: LifeBuoy, title: 'Community', desc: 'Connect with peers', color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map((item, i) => (
              <button 
                key={i} 
                onClick={() => setActiveView(item.id as ViewState)}
                className={`group flex items-start gap-4 p-5 bg-white rounded-2xl border transition-all text-left ${
                  activeView === item.id ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-md' : 'border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100'
                }`}
              >
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

          {/* Dynamic View Content */}
          {activeView === 'chat' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px] animate-in fade-in duration-500">
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
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-700 placeholder-slate-400 px-3 outline-none"
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
          )}

          {activeView === 'knowledge' && <KnowledgeBaseView />}
          {activeView === 'troubleshoot' && <TroubleshootView />}
          {activeView === 'community' && <CommunityView />}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Contact Support Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="font-bold text-slate-900 mb-6">Contact Support</h3>
            <div className="space-y-4">
              {[
                { icon: Phone, label: 'Call Us', value: '+91 98765 43210', sub: 'Mon-Fri, 9am-6pm' },
                { icon: Mail, label: 'Email', value: 'support@myagriscore.com', sub: 'Response in 2 hours' },
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
              {FAQS.map((item, i) => (
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


