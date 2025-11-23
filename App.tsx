
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, Sprout, Bell, Droplets, Settings, Menu, X, 
  Thermometer, Activity, Battery, Wifi, WifiOff, MapPin, ChevronRight,
  Wind, AlertTriangle, FileText, Stethoscope, BarChart2, HelpCircle, LogOut,
  Search, Download, Sun, Cloud, ArrowDown, ArrowUp, Carrot, MoreHorizontal, Calendar,
  User as UserIcon, Shield, Globe, Lock, Mail, Smartphone, Camera, Save, ToggleLeft, ToggleRight,
  CheckCircle, Clock, Filter, Plus, Trash2, Droplet, CloudRain, Zap, Image as ImageIcon,
  ChevronDown, MessageSquare, Phone, FlaskConical, Layers, Diamond, Award,
  CreditCard, Users, Link as LinkIcon, Key, History, BadgeCheck, AlertCircle, FileCheck,
  Facebook, IndianRupee, Send, Sunrise, Sunset, Eye, Gauge, Navigation, Umbrella, MoveRight,
  BookOpen, Bug, LifeBuoy, Mic, MicOff, Square, Volume2, AudioWaveform
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { api } from './services/mockDataService';
import { Farm, Field, Device, Sensor, Reading, Alert, IrrigationEvent, DeviceStatus, AlertSeverity, SensorType, Task, HarvestItem, User } from './types';

// --- Audio Helpers for Live API ---

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createBlob(data: Float32Array) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Pending': 'bg-amber-50 text-amber-600',
    'In Progress': 'bg-blue-50 text-blue-600',
    'Completed': 'bg-green-50 text-green-600',
    'Online': 'bg-green-50 text-green-600',
    'Offline': 'bg-red-50 text-red-600',
    'Maintenance': 'bg-amber-100 text-amber-700',
    'Scheduled': 'bg-purple-50 text-purple-600',
    'Critical': 'bg-red-100 text-red-700',
    'Warning': 'bg-orange-100 text-orange-700',
    'Excellent': 'bg-green-50 text-green-600',
    'Good': 'bg-blue-50 text-blue-600',
    'Fair': 'bg-orange-50 text-orange-600',
    'Poor': 'bg-red-50 text-red-600',
    'Active': 'bg-green-100 text-green-700',
    'Inactive': 'bg-slate-100 text-slate-500',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${styles[status] || 'bg-gray-50 text-gray-600'}`}>
      {status}
    </span>
  );
};

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) => (
  <button 
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500/20 ${enabled ? 'bg-green-500' : 'bg-slate-200'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-[24px] p-6 shadow-soft border border-slate-100/50 ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ title, subtitle, action }: { title: string, subtitle?: string, action?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
    <div>
      <h1 className="text-[22px] font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-slate-500 text-sm mt-1 font-medium">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const MiniGauge = ({ value, max, color, track, size = 80, strokeWidth = 8, children }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const offset = circumference - (normalizedValue / max) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={`${track} opacity-20`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${color} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
         {children}
      </div>
    </div>
  );
};

// --- Layout Component ---

const Layout: React.FC<{ children: React.ReactNode; onLogout: () => void }> = ({ children, onLogout }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/farms', icon: Sprout, label: 'Crop Management' },
    { path: '/irrigation', icon: Droplets, label: 'Soil & Water' },
    { path: '/weather', icon: Sun, label: 'Weather' },
    { path: '/tasks', icon: FileText, label: 'Task Management' },
    { path: '/doctor', icon: Stethoscope, label: 'Crop Doctor' },
    { path: '/reports', icon: BarChart2, label: 'Reports & Analytics' },
    { path: '/score', icon: Activity, label: 'AgriScore' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/account', icon: UserIcon, label: 'My Account' },
    { path: '/help', icon: HelpCircle, label: 'Help & Support' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-slate-100 transition-transform duration-200 ease-in-out flex flex-col
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center px-8">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-1.5 rounded-lg">
              <Sprout className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">AgriScore</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`
                flex items-center px-4 py-3 rounded-xl transition-all duration-200 group text-[13px] font-medium
                ${isActive(item.path) 
                  ? 'bg-[#F1FDF4] text-green-600' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
              `}
            >
              <item.icon className={`w-[18px] h-[18px] mr-3.5 transition-colors ${isActive(item.path) ? 'text-green-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 mt-auto">
           <button 
             onClick={onLogout}
             className="flex items-center w-full px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors text-[13px] font-medium group"
           >
              <LogOut className="w-[18px] h-[18px] mr-3.5 group-hover:text-red-500 transition-colors" />
              Log Out
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-sm border-b border-slate-100 flex items-center justify-between px-8 z-20 sticky top-0">
          <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 text-slate-500">
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Search */}
          <div className="hidden md:flex items-center max-w-lg w-full relative group">
            <Search className="w-[18px] h-[18px] absolute left-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search something here...." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent focus:border-green-200 focus:bg-white rounded-full text-sm text-slate-600 placeholder:text-slate-400 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-5">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors hover:bg-slate-50 rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            
            <div className="flex items-center pl-2">
              <div className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-white">
                MK
              </div>
              <div className="ml-3 hidden md:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">Manish Kumar</p>
                <p className="text-[11px] text-slate-400">kmanish45@gmail.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth bg-[#F8F9FC]">
          <div className="max-w-7xl mx-auto pb-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Authentication Component ---

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  return (
    <div className="min-h-screen flex bg-white font-sans">
       {/* Left Image Section */}
       <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
          <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Farm" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
          <div className="relative z-10 text-white max-w-lg px-12">
            <div className="bg-green-500/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-green-500/30">
               <Sprout className="w-8 h-8 text-green-400" strokeWidth={2.5} />
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">Smart Farming for a <span className="text-green-400">Better Future</span></h1>
            <p className="text-xl text-slate-200 leading-relaxed font-light">Monitor, Analyze, and Optimize your farm operations with real-time data insights and intelligent crop management.</p>
          </div>
       </div>

       {/* Right Login Form */}
       <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center lg:text-left">
               <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
               <p className="mt-2 text-slate-500">Sign in to your AgriScore account</p>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-3 gap-3">
               <button onClick={onLogin} className="flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
                  {/* Google Icon SVG */}
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
               </button>
               <button onClick={onLogin} className="flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-[#1877F2] group">
                  <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" />
               </button>
               <button onClick={() => setMethod(method === 'phone' ? 'email' : 'phone')} className={`flex items-center justify-center px-4 py-2.5 border rounded-xl transition-colors ${method === 'phone' ? 'bg-green-50 border-green-200 text-green-600' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                  <Smartphone className="w-5 h-5" />
               </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 font-medium">Or continue with {method}</span>
              </div>
            </div>

            <div className="space-y-5">
               {method === 'email' ? (
                 <>
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
                     <div className="relative group">
                       <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                       <input type="email" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none text-sm transition-all" placeholder="name@company.com" />
                     </div>
                   </div>
                   <div>
                     <div className="flex justify-between items-center mb-1.5">
                       <label className="block text-sm font-semibold text-slate-700">Password</label>
                       <a href="#" className="text-xs font-semibold text-green-600 hover:text-green-700">Forgot password?</a>
                     </div>
                     <div className="relative group">
                       <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                       <input type="password" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none text-sm transition-all" placeholder="••••••••" />
                     </div>
                   </div>
                 </>
               ) : (
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                   <div className="relative group">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium border-r border-slate-300 pr-2 mr-2 select-none">+91</span>
                     <input type="tel" className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none text-sm transition-all" placeholder="98765 43210" />
                   </div>
                   <div className="mt-4">
                      <button className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm shadow-sm">Send OTP</button>
                   </div>
                 </div>
               )}

               <button onClick={onLogin} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/30 transition-all transform active:scale-[0.98]">
                 Sign In
               </button>
            </div>
            
            <p className="text-center text-sm text-slate-500">
               Don't have an account? <a href="#" className="font-bold text-green-600 hover:text-green-700">Create an account</a>
            </p>
          </div>
       </div>
    </div>
  )
}

// --- Dashboard Page ---

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [harvest, setHarvest] = useState<HarvestItem[]>([]);

  useEffect(() => {
    api.getTasks().then(setTasks);
    api.getHarvestSummary().then(setHarvest);
  }, []);

  // Production Data for Gauge
  const productionData = [
    { name: 'Wheat', value: 40, color: '#A855F7' }, 
    { name: 'Corn', value: 30, color: '#3B82F6' },  
    { name: 'Rice', value: 20, color: '#22C55E' },  
  ];
  const gaugeTotal = 1000;

  // Yield Data
  const yieldData = [
    { name: 'Jan', value: 310 },
    { name: 'Feb', value: 280 },
    { name: 'Mar', value: 350 },
    { name: 'Apr', value: 320 },
    { name: 'May', value: 400 },
    { name: 'Jun', value: 250 },
    { name: 'Jul', value: 480 },
    { name: 'Aug', value: 520 },
    { name: 'Sep', value: 580 },
  ];

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <SectionHeader 
        title="Good Morning !" 
        subtitle="Optimize Your Farm Operations with Real-Time Insights"
        action={
          <div className="flex items-center space-x-3">
            <div className="relative">
              <select className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg pl-4 pr-8 py-2.5 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none shadow-sm cursor-pointer">
                <option>This Month</option>
                <option>Last Month</option>
              </select>
              <ArrowDown className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button className="bg-[#22C55E] hover:bg-green-600 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center transition-all shadow-sm shadow-green-200">
              Export <Download className="w-3.5 h-3.5 ml-2" strokeWidth={2.5} />
            </button>
          </div>
        }
      />

      {/* Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weather Card */}
        <div className="lg:col-span-3 bg-white rounded-[24px] p-6 shadow-soft border border-slate-100/50 relative overflow-hidden flex flex-col justify-between min-h-[240px]">
          <div className="flex justify-between items-start z-10">
             <div className="px-3 py-1.5 bg-[#22C55E] text-white rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center shadow-md shadow-green-500/20">
               <MapPin className="w-3 h-3 mr-1" /> Agarpara
             </div>
             <div className="flex bg-[#F1F5F9] rounded-full p-1">
               <button className="w-7 h-7 rounded-full bg-[#22C55E] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">C</button>
               <button className="w-7 h-7 rounded-full text-slate-400 flex items-center justify-center text-[10px] font-medium hover:text-slate-600">F</button>
             </div>
          </div>
          
          <div className="z-10 mt-4">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Tuesday</p>
            <p className="text-slate-300 text-[11px]">25 Nov, 2025</p>
            
            <div className="flex items-start mt-3">
               <span className="text-[56px] font-medium text-slate-800 leading-none tracking-tight">24</span>
               <span className="text-xl text-slate-400 mt-1 ml-1 font-medium">°C</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">High: 25 &nbsp;•&nbsp; Low: 12</p>
          </div>

          <div className="z-10 mt-4 border-t border-slate-50 pt-4">
             <p className="text-slate-400 text-[11px]">Feels Like 26</p>
             <p className="text-slate-700 font-semibold text-sm">Cloudy</p>
          </div>

          {/* Weather Decor */}
          <div className="absolute top-16 -right-6 pointer-events-none">
             <Cloud className="w-32 h-32 text-[#F1F5F9]/80 fill-white" />
             <Sun className="w-12 h-12 text-yellow-400 fill-yellow-400 absolute top-2 right-8 animate-pulse" />
          </div>
        </div>

        {/* Production Overview Gauge */}
        <Card className="lg:col-span-5 flex flex-col">
          <div className="flex justify-between items-center mb-2">
             <h3 className="text-[15px] font-bold text-slate-800">Production Overview</h3>
             <div className="relative">
                <select className="appearance-none bg-[#F8F9FC] border-none text-slate-500 text-[11px] font-medium rounded-lg pl-3 pr-7 py-1.5 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
                    <option>Yearly</option>
                </select>
                <ArrowDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
             </div>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center">
             <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={productionData}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={75}
                    outerRadius={100}
                    paddingAngle={6}
                    dataKey="value"
                    cornerRadius={8}
                  >
                    {productionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute bottom-0 flex flex-col items-center mb-2">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">1,000</span>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-1">tons production</span>
             </div>
          </div>

          <div className="flex justify-center space-x-6 mt-4">
             {productionData.map(item => (
               <div key={item.name} className="flex items-center">
                 <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                 <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-medium uppercase">{item.name}</span>
                    <span className="text-xs font-bold text-slate-700">{item.value}%</span>
                 </div>
               </div>
             ))}
          </div>
        </Card>

        {/* Stats Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           {/* Land Area */}
           <Card className="flex items-start justify-between flex-1">
             <div className="flex flex-col justify-between h-full">
               <div className="flex items-center space-x-2">
                 <span className="text-[13px] text-slate-500 font-medium">Total Land Area</span>
                 <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
               </div>
               <div>
                 <p className="text-[28px] font-bold text-slate-900 tracking-tight">1,200 <span className="text-sm font-normal text-slate-400 ml-1">acres</span></p>
                 <div className="flex items-center mt-2">
                    <span className="bg-red-50 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center">
                        <ArrowDown className="w-3 h-3 mr-0.5" /> 16.08%
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">from last month</span>
                 </div>
               </div>
             </div>
             <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
                <Sprout className="w-6 h-6" strokeWidth={2} />
             </div>
           </Card>

           {/* Revenue */}
           <Card className="flex items-start justify-between flex-1">
             <div className="flex flex-col justify-between h-full">
               <div className="flex items-center space-x-2">
                 <span className="text-[13px] text-slate-500 font-medium">Revenue</span>
                 <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
               </div>
               <div>
                 <p className="text-[28px] font-bold text-slate-900 tracking-tight">₹42,00,000</p>
                 <div className="flex items-center mt-2">
                    <span className="bg-green-50 text-green-500 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center">
                        <ArrowUp className="w-3 h-3 mr-0.5" /> 12.45%
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">from last month</span>
                 </div>
               </div>
             </div>
             <div className="w-12 h-12 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#9333EA]">
                <span className="text-xl font-bold">₹</span>
             </div>
           </Card>
        </div>
      </div>

      {/* Middle Section: Chart & Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[340px]">
        
        {/* Yield Analysis Chart */}
        <Card className="lg:col-span-7 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[15px] font-bold text-slate-800">Monthly Yield Analysis</h3>
            <div className="flex space-x-3">
               <div className="relative">
                 <select className="appearance-none bg-[#F8F9FC] border-none text-slate-600 text-[11px] font-medium rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer hover:bg-slate-100">
                    <option>Corn</option>
                 </select>
                 <ArrowDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
               </div>
               <div className="relative">
                 <select className="appearance-none bg-[#F8F9FC] border-none text-slate-600 text-[11px] font-medium rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer hover:bg-slate-100">
                    <option>2025</option>
                 </select>
                 <ArrowDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
               </div>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={yieldData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 500}} 
                    dy={15} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 500}} 
                    domain={[0, 600]} 
                    ticks={[0, 150, 300, 450, 600]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'white',
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        padding: '10px 14px',
                        fontSize: '12px'
                    }}
                    cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }}
                    itemStyle={{ color: '#16A34A', fontWeight: 600 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#22C55E" 
                    strokeWidth={3} 
                    dot={{ stroke: '#22C55E', strokeWidth: 3, r: 4, fill: 'white' }} 
                    activeDot={{ r: 6, fill: '#22C55E', stroke: '#fff', strokeWidth: 2 }}
                  />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </Card>

        {/* Field Image Card */}
        <div className="lg:col-span-5 h-full relative rounded-[24px] overflow-hidden shadow-soft group">
           <img 
             src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop" 
             alt="Corn Field" 
             className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
           />
           {/* Gradient Overlay */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
           
           {/* Glass Panel */}
           <div className="absolute bottom-5 left-5 right-5">
              <div className="glass-panel rounded-[20px] p-5 shadow-lg border border-white/20">
                 <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center">
                     <span className="font-bold text-slate-900 text-sm">Corn Field</span>
                     <ChevronRight className="w-4 h-4 text-slate-400 ml-1" />
                   </div>
                   <button className="flex items-center text-[11px] font-medium text-slate-500 hover:text-green-600 transition-colors bg-white/50 px-2 py-1 rounded-lg">
                     More Details <ChevronRight className="w-3 h-3 ml-1" />
                   </button>
                 </div>
                 
                 <div className="flex justify-between divide-x divide-slate-200/50">
                   <div className="pr-4 flex-1">
                     <p className="text-[10px] text-slate-500 font-medium mb-1">Crop Health</p>
                     <p className="text-sm font-bold text-green-600">Good</p>
                   </div>
                   <div className="px-4 flex-1">
                     <p className="text-[10px] text-slate-500 font-medium mb-1">Planting Date</p>
                     <p className="text-sm font-bold text-slate-800">01 Nov, 2025</p>
                   </div>
                   <div className="pl-4 flex-1 text-right">
                     <p className="text-[10px] text-slate-500 font-medium mb-1">Harvest Time</p>
                     <p className="text-sm font-bold text-slate-800">6 month</p>
                   </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         
         {/* Task Management */}
         <Card className="lg:col-span-7">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold text-slate-800">Task Management</h3>
              <div className="flex items-center space-x-3">
                <button className="bg-[#22C55E] hover:bg-green-600 text-white pl-3 pr-2 py-2 rounded-lg text-[11px] font-semibold transition-colors flex items-center shadow-sm shadow-green-200">
                   Add New Task <span className="ml-2 text-sm leading-none bg-white/20 rounded w-4 h-4 flex items-center justify-center">+</span>
                </button>
                <Link to="/tasks" className="text-[11px] text-slate-400 font-medium flex items-center hover:text-slate-600 px-2 py-1 hover:bg-slate-50 rounded-lg transition-colors">
                  View All <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>

            <div className="overflow-hidden">
              <table className="w-full">
                 <thead>
                   <tr className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100/80">
                     <th className="pb-4 pl-2 font-medium">Task Name</th>
                     <th className="pb-4 font-medium">Due Date</th>
                     <th className="pb-4 text-right pr-2 font-medium">Status</th>
                   </tr>
                 </thead>
                 <tbody className="text-[13px]">
                   {tasks.map((task, i) => (
                     <tr key={task.id} className={`group transition-colors ${i !== tasks.length - 1 ? 'border-b border-slate-50' : ''}`}>
                       <td className="py-4 pl-2 font-semibold text-slate-700 group-hover:text-green-600 transition-colors">{task.name}</td>
                       <td className="py-4 text-slate-500 font-medium">{task.date}</td>
                       <td className="py-4 text-right pr-2">
                         <StatusBadge status={task.status} />
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
            </div>
         </Card>

         {/* Harvest Summary */}
         <Card className="lg:col-span-5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold text-slate-800">Vegetable Harvest Summary</h3>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
               {harvest.map(item => (
                 <div key={item.id} className="flex items-center justify-between p-3.5 bg-[#F8F9FC] rounded-2xl hover:bg-[#F1F5F9] transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shadow-sm ${item.color}`}>
                         {item.name === 'Tomatoes' && <div className="w-4 h-4 bg-current rounded-full shadow-sm" />} 
                         {item.name === 'Carrots' && <Carrot className="w-5 h-5" />}
                         {item.name === 'Corn' && <Sprout className="w-5 h-5" />}
                       </div>
                       <span className="font-semibold text-slate-700 text-[13px]">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 text-[13px]">{item.amount} <span className="text-slate-400 font-medium text-[11px] ml-0.5">{item.unit}</span></span>
                 </div>
               ))}
            </div>
         </Card>

      </div>
    </div>
  );
};

// --- Page Components ---

const TaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState('All');
  
  useEffect(() => {
    api.getTasks().then(data => {
        setTasks([...data, 
            { id: 3, name: 'Inspect Irrigation System', date: '26-Nov-25', status: 'Pending' },
            { id: 4, name: 'Soil pH Testing', date: '28-Nov-25', status: 'Scheduled' }
        ] as any);
    });
  }, []);

  return (
    <div>
      <SectionHeader 
        title="Task Management" 
        subtitle="Track and manage farm operations efficiently"
        action={
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-green-200 transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         {['Pending', 'In Progress', 'Completed'].map(status => (
           <Card key={status} className="border-t-4 border-t-green-500">
              <div className="flex justify-between items-start mb-4">
                 <h3 className="font-bold text-slate-700">{status}</h3>
                 <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                    {tasks.filter(t => t.status === status).length}
                 </span>
              </div>
              <div className="space-y-3">
                 {tasks.filter(t => t.status === status).map(task => (
                    <div key={task.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-green-200 transition-colors group cursor-pointer">
                       <p className="font-semibold text-sm text-slate-800 mb-1 group-hover:text-green-600">{task.name}</p>
                       <div className="flex items-center text-xs text-slate-500">
                          <Calendar className="w-3 h-3 mr-1" /> {task.date}
                       </div>
                    </div>
                 ))}
                 {tasks.filter(t => t.status === status).length === 0 && (
                    <div className="text-center py-4 text-slate-400 text-sm">No tasks</div>
                 )}
              </div>
           </Card>
         ))}
      </div>
      
      <Card>
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">All Tasks</h3>
            <div className="flex gap-2">
               {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? 'bg-green-50 text-green-600' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {f}
                  </button>
               ))}
            </div>
        </div>
        <table className="w-full">
            <thead>
                <tr className="text-left text-xs font-semibold text-slate-400 uppercase border-b border-slate-100">
                    <th className="pb-3 pl-2">Task Name</th>
                    <th className="pb-3">Assigned To</th>
                    <th className="pb-3">Due Date</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3 text-right pr-2">Status</th>
                </tr>
            </thead>
            <tbody className="text-sm">
                {tasks.filter(t => filter === 'All' || t.status === filter).map((task, i) => (
                    <tr key={task.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-4 pl-2 font-medium text-slate-800">{task.name}</td>
                        <td className="py-4 text-slate-500 flex items-center">
                            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-500 text-[10px] font-bold flex items-center justify-center mr-2">MK</div>
                            Manish
                        </td>
                        <td className="py-4 text-slate-500">{task.date}</td>
                        <td className="py-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-50 px-2 py-0.5 rounded">High</span>
                        </td>
                        <td className="py-4 text-right pr-2"><StatusBadge status={task.status} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
      </Card>
    </div>
  );
}

const WeatherPage = () => {
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([]);
  const [astro, setAstro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tempTrend, setTempTrend] = useState<any[]>([]);

  const LAT = 22.68;
  const LON = 88.38;

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Extended parameters for advanced data
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility&hourly=temperature_2m,weather_code,precipitation_probability,uv_index,dew_point_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timezone=auto`
        );
        const data = await response.json();

        // Helper for Codes
        const getWeatherInfo = (code: number) => {
           if (code === 0) return { desc: 'Clear Sky', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50' };
           if (code >= 1 && code <= 3) return { desc: 'Partly Cloudy', icon: Cloud, color: 'text-blue-400', bg: 'bg-blue-50' };
           if (code >= 45 && code <= 48) return { desc: 'Foggy', icon: Cloud, color: 'text-slate-500', bg: 'bg-slate-50' };
           if (code >= 51 && code <= 67) return { desc: 'Rain', icon: CloudRain, color: 'text-blue-600', bg: 'bg-blue-100' };
           if (code >= 80 && code <= 82) return { desc: 'Showers', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50' };
           if (code >= 95) return { desc: 'Storm', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' };
           return { desc: 'Cloudy', icon: Cloud, color: 'text-slate-400', bg: 'bg-slate-50' };
        };

        const currentInfo = getWeatherInfo(data.current.weather_code);

        // 1. Current Weather Detailed
        setCurrentWeather({
          temp: Math.round(data.current.temperature_2m),
          feelsLike: Math.round(data.current.apparent_temperature),
          desc: currentInfo.desc,
          icon: currentInfo.icon,
          humidity: data.current.relative_humidity_2m,
          wind: Math.round(data.current.wind_speed_10m),
          windDir: data.current.wind_direction_10m,
          precip: data.current.precipitation,
          pressure: data.current.surface_pressure,
          visibility: (data.current.visibility / 1000).toFixed(1), // km
          uv: data.hourly.uv_index[new Date().getHours()], // Approx current UV
          dewPoint: Math.round(data.hourly.dew_point_2m[new Date().getHours()]),
        });

        // 2. Daily Forecast (5 days)
        const daily = data.daily.time.slice(0, 5).map((time: string, index: number) => {
           const info = getWeatherInfo(data.daily.weather_code[index]);
           return {
             day: new Date(time).toLocaleDateString('en-US', { weekday: 'short' }),
             fullDate: new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
             max: Math.round(data.daily.temperature_2m_max[index]),
             min: Math.round(data.daily.temperature_2m_min[index]),
             icon: info.icon,
             color: info.color,
             rainSum: data.daily.precipitation_sum[index]
           };
        });
        setForecast(daily);

        // 3. Hourly Forecast (Next 24h)
        const currentHour = new Date().getHours();
        const next24Hours = data.hourly.time.slice(currentHour, currentHour + 24).map((t: string, i: number) => {
            const idx = currentHour + i;
            return {
                time: new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
                temp: Math.round(data.hourly.temperature_2m[idx]),
                icon: getWeatherInfo(data.hourly.weather_code[idx]).icon,
                pop: data.hourly.precipitation_probability[idx]
            };
        });
        setHourlyForecast(next24Hours);
        
        // 4. Chart Data (Temp Trend)
        setTempTrend(next24Hours.map((h: any) => ({ name: h.time, temp: h.temp })));

        // 5. Astro
        setAstro({
            sunrise: new Date(data.daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit' }),
            sunset: new Date(data.daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit' })
        });

        setLoading(false);

      } catch (error) {
        console.error("Weather Fetch Error:", error);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading || !currentWeather) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Analyzing atmospheric data...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <SectionHeader title="Weather Analysis" subtitle="Hyper-local forecasting & environmental monitoring" />

       {/* Hero Section: Current Conditions */}
       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20">
              <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                  <Cloud className="absolute top-10 right-10 w-64 h-64" />
                  <Wind className="absolute bottom-10 left-10 w-48 h-48" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between h-full">
                  <div>
                      <div className="flex items-center space-x-2 bg-white/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10 mb-6">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-bold tracking-wide">AGARPARA, WEST BENGAL</span>
                      </div>
                      
                      <div className="flex items-center gap-6">
                          <div className="text-[96px] font-bold leading-none tracking-tighter">
                              {currentWeather.temp}°
                          </div>
                          <div className="flex flex-col justify-center">
                              <p className="text-2xl font-medium opacity-90">{currentWeather.desc}</p>
                              <p className="text-lg opacity-70">Feels like {currentWeather.feelsLike}°</p>
                          </div>
                      </div>
                  </div>

                  <div className="mt-8 md:mt-0 flex flex-col justify-between items-end text-right">
                       <div>
                           <p className="text-lg font-bold uppercase tracking-widest opacity-80">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
                           <p className="text-3xl font-light">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}</p>
                       </div>

                       <div className="flex gap-8 mt-8">
                           <div className="text-center">
                               <Wind className="w-6 h-6 mx-auto mb-2 opacity-80" />
                               <p className="text-sm opacity-70 uppercase font-bold text-[10px]">Wind</p>
                               <p className="text-xl font-bold">{currentWeather.wind} <span className="text-xs">km/h</span></p>
                           </div>
                           <div className="text-center">
                               <Droplets className="w-6 h-6 mx-auto mb-2 opacity-80" />
                               <p className="text-sm opacity-70 uppercase font-bold text-[10px]">Humidity</p>
                               <p className="text-xl font-bold">{currentWeather.humidity}<span className="text-xs">%</span></p>
                           </div>
                           <div className="text-center">
                               <Gauge className="w-6 h-6 mx-auto mb-2 opacity-80" />
                               <p className="text-sm opacity-70 uppercase font-bold text-[10px]">Pressure</p>
                               <p className="text-xl font-bold">{currentWeather.pressure} <span className="text-xs">hPa</span></p>
                           </div>
                       </div>
                  </div>
              </div>
          </div>

          {/* Right: Astro & Wind Direction */}
          <div className="grid grid-rows-2 gap-6">
              <Card className="flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 border-amber-100">
                  <h3 className="text-slate-500 text-xs font-bold uppercase mb-4 flex items-center gap-2"><Sun className="w-4 h-4 text-orange-500" /> Sun Cycle</h3>
                  <div className="flex justify-between items-center px-2">
                      <div className="text-center">
                          <p className="text-xs text-slate-400 font-bold mb-1">Sunrise</p>
                          <p className="text-xl font-bold text-slate-800">{astro.sunrise}</p>
                      </div>
                      <div className="flex-1 mx-4 h-1 bg-gradient-to-r from-orange-300 to-purple-300 rounded-full relative">
                          <div className="absolute -top-1.5 left-1/2 w-4 h-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50 ring-2 ring-white"></div>
                      </div>
                      <div className="text-center">
                          <p className="text-xs text-slate-400 font-bold mb-1">Sunset</p>
                          <p className="text-xl font-bold text-slate-800">{astro.sunset}</p>
                      </div>
                  </div>
                  <Sunrise className="absolute -bottom-4 -left-4 w-24 h-24 text-orange-500/10" />
              </Card>

              <Card className="flex flex-col justify-center relative bg-slate-50">
                   <h3 className="text-slate-500 text-xs font-bold uppercase mb-4 flex items-center gap-2"><Navigation className="w-4 h-4 text-blue-500" /> Wind Direction</h3>
                   <div className="flex items-center justify-center gap-6">
                       <div className="relative w-24 h-24 border-4 border-slate-200 rounded-full flex items-center justify-center bg-white shadow-inner">
                           <div className="absolute top-1 text-[10px] font-bold text-slate-400">N</div>
                           <div className="absolute bottom-1 text-[10px] font-bold text-slate-400">S</div>
                           <div className="absolute left-1 text-[10px] font-bold text-slate-400">W</div>
                           <div className="absolute right-1 text-[10px] font-bold text-slate-400">E</div>
                           <Navigation 
                              className="w-10 h-10 text-blue-600 transition-all duration-1000 ease-out" 
                              style={{ transform: `rotate(${currentWeather.windDir}deg)` }} 
                              fill="currentColor"
                           />
                       </div>
                       <div>
                           <p className="text-3xl font-bold text-slate-800">{currentWeather.wind} <span className="text-sm text-slate-400 font-medium">km/h</span></p>
                           <p className="text-xs text-slate-500 font-medium mt-1">Direction: {currentWeather.windDir}°</p>
                       </div>
                   </div>
              </Card>
          </div>
       </div>

       {/* Middle: Hourly & Advanced Metrics */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hourly Forecast Scroll */}
          <Card className="lg:col-span-2 flex flex-col">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Clock className="w-4 h-4 mr-2 text-green-500" /> 24-Hour Forecast</h3>
              <div className="flex-1 overflow-x-auto custom-scrollbar pb-4 -mx-2 px-2">
                  <div className="flex space-x-6">
                      {hourlyForecast.map((hour, i) => (
                          <div key={i} className="flex flex-col items-center min-w-[60px] group">
                              <span className="text-xs font-bold text-slate-400 mb-2">{hour.time}</span>
                              <hour.icon className="w-6 h-6 text-slate-600 mb-2 group-hover:scale-110 transition-transform" />
                              <span className="text-lg font-bold text-slate-800">{hour.temp}°</span>
                              {hour.pop > 0 && (
                                  <span className="text-[10px] font-bold text-blue-500 mt-1 flex items-center">
                                      <Umbrella className="w-2 h-2 mr-0.5" /> {hour.pop}%
                                  </span>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
              {/* Temperature Chart */}
              <div className="h-[120px] w-full mt-4 border-t border-slate-50 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={tempTrend}>
                          <defs>
                              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="temp" stroke="#fbbf24" strokeWidth={3} fill="url(#colorTemp)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </Card>

          {/* Environmental Details Grid */}
          <div className="grid grid-cols-2 gap-4">
              <Card className="flex flex-col items-center justify-center p-4 bg-purple-50/50 border-purple-100">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-full mb-2"><Sun className="w-5 h-5" /></div>
                  <p className="text-xs font-bold text-slate-500 uppercase">UV Index</p>
                  <p className="text-2xl font-bold text-slate-800">{currentWeather.uv}</p>
                  <p className="text-[10px] text-purple-500 font-bold px-2 py-0.5 bg-purple-100 rounded-full mt-1">
                      {currentWeather.uv > 5 ? 'High' : 'Moderate'}
                  </p>
              </Card>
              <Card className="flex flex-col items-center justify-center p-4 bg-blue-50/50 border-blue-100">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full mb-2"><Eye className="w-5 h-5" /></div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Visibility</p>
                  <p className="text-2xl font-bold text-slate-800">{currentWeather.visibility}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">km</p>
              </Card>
              <Card className="flex flex-col items-center justify-center p-4 bg-green-50/50 border-green-100">
                  <div className="p-2 bg-green-100 text-green-600 rounded-full mb-2"><Droplet className="w-5 h-5" /></div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Dew Point</p>
                  <p className="text-2xl font-bold text-slate-800">{currentWeather.dewPoint}°</p>
              </Card>
              <Card className="flex flex-col items-center justify-center p-4 bg-slate-50 border-slate-100">
                  <div className="p-2 bg-slate-200 text-slate-600 rounded-full mb-2"><CloudRain className="w-5 h-5" /></div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Precipitation</p>
                  <p className="text-2xl font-bold text-slate-800">{currentWeather.precip}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">mm</p>
              </Card>
          </div>
       </div>

       {/* Bottom: 5-Day Forecast */}
       <Card>
           <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-slate-800 flex items-center"><Calendar className="w-4 h-4 mr-2 text-orange-500" /> 5-Day Forecast</h3>
               <button className="text-xs font-bold text-green-600 flex items-center hover:text-green-700">Detailed Report <MoveRight className="w-3 h-3 ml-1" /></button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
               {forecast.map((day: any, i: number) => (
                   <div key={i} className="flex flex-col items-center py-2 px-2 hover:bg-slate-50 transition-colors rounded-xl">
                       <p className="text-sm font-bold text-slate-800 mb-1">{day.day}</p>
                       <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase">{day.fullDate}</p>
                       <day.icon className={`w-8 h-8 ${day.color} mb-3`} />
                       <div className="flex gap-3 text-sm mb-2">
                           <span className="font-bold text-slate-800">{day.max}°</span>
                           <span className="font-medium text-slate-400">{day.min}°</span>
                       </div>
                       {day.rainSum > 0 && (
                           <div className="flex items-center text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                               <Droplets className="w-3 h-3 mr-1" /> {day.rainSum}mm
                           </div>
                       )}
                   </div>
               ))}
           </div>
       </Card>
    </div>
  );
};

const FarmSettings = () => {
  const devices = [
    { id: 1, name: 'Node-WZ-01', type: 'Sensor Node', status: 'Online', battery: 88, location: 'North Field' },
    { id: 2, name: 'Node-WZ-02', type: 'Sensor Node', status: 'Maintenance', battery: 12, location: 'North Field' },
    { id: 3, name: 'Node-RS-01', type: 'Weather Station', status: 'Online', battery: 95, location: 'River Side' },
    { id: 4, name: 'Node-HT-01', type: 'Gateway', status: 'Offline', battery: 0, location: 'Hilltop' },
    { id: 5, name: 'Pump-Controller-A', type: 'Actuator', status: 'Online', battery: 100, location: 'Pump House' },
  ];

  return (
    <div className="space-y-6">
       <SectionHeader title="Settings" subtitle="Manage farm configuration and devices" />
       
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
             <Card>
                <h3 className="font-bold text-slate-800 mb-4">Farm Details</h3>
                <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Farm Name</label>
                      <input type="text" defaultValue="Green Valley Estates" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 outline-none focus:border-green-500 transition-colors" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Latitude</label>
                         <input type="text" defaultValue="22.68" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Longitude</label>
                         <input type="text" defaultValue="88.38" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800" />
                      </div>
                   </div>
                   <button className="w-full py-2.5 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors">Save Changes</button>
                </div>
             </Card>
             
             <Card>
                <h3 className="font-bold text-slate-800 mb-4">Preferences</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">Notifications</span>
                      <Toggle enabled={true} onChange={() => {}} />
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">Auto-Irrigation</span>
                      <Toggle enabled={false} onChange={() => {}} />
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">Dark Mode</span>
                      <Toggle enabled={false} onChange={() => {}} />
                   </div>
                   <div className="pt-2 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Timezone</label>
                      <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                         <option>IST (GMT+05:30)</option>
                         <option>UTC (GMT+00:00)</option>
                      </select>
                   </div>
                </div>
             </Card>
          </div>

          <Card className="lg:col-span-2">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Connected Devices</h3>
                <button className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors flex items-center">
                   <Plus className="w-3.5 h-3.5 mr-1" /> Add New Device
                </button>
             </div>
             
             <div className="overflow-hidden">
                <table className="w-full">
                   <thead>
                      <tr className="text-left text-xs font-bold text-slate-400 uppercase bg-slate-50/50">
                         <th className="p-3 pl-4 rounded-l-lg">Device Name</th>
                         <th className="p-3">Type</th>
                         <th className="p-3">Location</th>
                         <th className="p-3">Battery</th>
                         <th className="p-3">Status</th>
                         <th className="p-3 rounded-r-lg"></th>
                      </tr>
                   </thead>
                   <tbody className="text-sm">
                      {devices.map(device => (
                         <tr key={device.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                            <td className="p-4 font-bold text-slate-700 flex items-center gap-3">
                               <div className={`p-2 rounded-lg ${
                                  device.status === 'Online' ? 'bg-green-100 text-green-600' : 
                                  device.status === 'Offline' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                               }`}>
                                  {device.status === 'Online' && <Wifi className="w-4 h-4" />}
                                  {device.status === 'Offline' && <WifiOff className="w-4 h-4" />}
                                  {device.status === 'Maintenance' && <AlertTriangle className="w-4 h-4" />}
                               </div>
                               {device.name}
                            </td>
                            <td className="p-4 text-slate-500">{device.type}</td>
                            <td className="p-4 text-slate-500">{device.location}</td>
                            <td className="p-4">
                               <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                     <div 
                                       className={`h-full rounded-full ${device.battery < 20 ? 'bg-red-500' : 'bg-green-500'}`} 
                                       style={{ width: `${device.battery}%` }}
                                     ></div>
                                  </div>
                                  <span className="text-xs font-medium text-slate-400">{device.battery}%</span>
                               </div>
                            </td>
                            <td className="p-4"><StatusBadge status={device.status} /></td>
                            <td className="p-4 text-right">
                               <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </Card>
       </div>
    </div>
  );
};

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'subscription', label: 'Billing & Plans', icon: CreditCard },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
       <SectionHeader title="My Account" subtitle="Manage your personal details and account settings" />

       <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Nav */}
          <div className="lg:w-64 flex-shrink-0">
             <div className="bg-white rounded-[24px] shadow-soft p-2 space-y-1">
                {tabs.map(tab => (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        activeTab === tab.id 
                        ? 'bg-green-50 text-green-700 shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                     }`}
                   >
                      <tab.icon className={`w-4 h-4 mr-3 ${activeTab === tab.id ? 'text-green-600' : 'text-slate-400'}`} />
                      {tab.label}
                   </button>
                ))}
             </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
             {activeTab === 'profile' && (
                <Card>
                   <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-6">
                         <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-orange-500 border-4 border-white shadow-lg">MK</div>
                            <button className="absolute bottom-0 right-0 p-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 shadow-md transition-colors">
                               <Camera className="w-4 h-4" />
                            </button>
                         </div>
                         <div>
                            <h2 className="text-xl font-bold text-slate-900">Manish Kumar</h2>
                            <p className="text-slate-500 text-sm">Farmer • Green Valley Estates</p>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-md flex items-center border border-green-100">
                                  <BadgeCheck className="w-3 h-3 mr-1" /> Kisan ID Verified
                               </span>
                               <span className="text-xs text-slate-400">Joined Jan 2023</span>
                            </div>
                         </div>
                      </div>
                      <div className="text-right hidden sm:block">
                         <div className="text-sm font-bold text-slate-700 mb-1">Profile Strength</div>
                         <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[85%] rounded-full"></div>
                         </div>
                         <div className="text-xs text-green-600 font-bold mt-1">85% Complete</div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                            <div className="relative">
                               <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                               <input type="text" defaultValue="Manish Kumar" className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" />
                            </div>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
                            <div className="relative">
                               <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                               <input type="email" defaultValue="kmanish45@gmail.com" className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" />
                            </div>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone Number</label>
                            <div className="relative">
                               <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                               <input type="tel" defaultValue="+91 98765 43210" className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" />
                            </div>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Location</label>
                            <div className="relative">
                               <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                               <input type="text" defaultValue="Agarpara, India" className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all" />
                            </div>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Language</label>
                            <div className="relative">
                               <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                               <select className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all appearance-none">
                                  <option>English (India)</option>
                                  <option>Hindi</option>
                                  <option>Punjabi</option>
                                </select>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="mt-8 flex justify-end">
                      <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-green-200 transition-colors flex items-center">
                         <Save className="w-4 h-4 mr-2" /> Save Changes
                      </button>
                   </div>
                </Card>
             )}

             {activeTab === 'subscription' && (
                <div className="space-y-6">
                   <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none">
                      <div className="flex justify-between items-start">
                         <div>
                            <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Current Plan</div>
                            <h2 className="text-3xl font-bold mb-1">Pro Plan</h2>
                            <p className="text-slate-400 text-sm">Next billing on 25 Dec, 2025</p>
                         </div>
                         <div className="text-right">
                            <div className="text-3xl font-bold">₹2,499<span className="text-sm text-slate-400 font-medium">/mo</span></div>
                         </div>
                      </div>
                      <div className="mt-8 grid grid-cols-3 gap-8 border-t border-white/10 pt-6">
                         <div>
                            <div className="text-sm font-bold mb-1">1,200</div>
                            <div className="text-xs text-slate-400 uppercase">Acres Managed</div>
                         </div>
                         <div>
                            <div className="text-sm font-bold mb-1">15</div>
                            <div className="text-xs text-slate-400 uppercase">Team Members</div>
                         </div>
                         <div>
                            <div className="text-sm font-bold mb-1">50GB</div>
                            <div className="text-xs text-slate-400 uppercase">Data Storage</div>
                         </div>
                      </div>
                   </Card>
                   <Card>
                      <h3 className="font-bold text-slate-800 mb-4">Payment Methods</h3>
                      <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-white font-bold text-xs">VISA</div>
                            <div>
                               <p className="font-bold text-slate-800 text-sm">Visa ending in 4242</p>
                               <p className="text-xs text-slate-500">Expires 12/28</p>
                            </div>
                         </div>
                         <button className="text-xs font-bold text-slate-500 hover:text-slate-800">Edit</button>
                      </div>
                   </Card>
                </div>
             )}

             {activeTab === 'team' && (
                <Card>
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-800">Team Members</h3>
                      <button className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors flex items-center">
                         <Plus className="w-3.5 h-3.5 mr-1" /> Invite Member
                      </button>
                   </div>
                   <div className="space-y-4">
                      {[
                         { name: 'Manish Kumar', role: 'Owner', email: 'kmanish45@gmail.com', avatar: 'bg-orange-100 text-orange-600' },
                         { name: 'Rajesh Singh', role: 'Agronomist', email: 'rajesh.singh@example.com', avatar: 'bg-blue-100 text-blue-600' },
                         { name: 'Anita Desai', role: 'Viewer', email: 'anita.d@example.com', avatar: 'bg-purple-100 text-purple-600' }
                      ].map((member, i) => (
                         <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                            <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${member.avatar}`}>
                                  {member.name.charAt(0)}
                               </div>
                               <div>
                                  <p className="font-bold text-slate-800 text-sm">{member.name}</p>
                                  <p className="text-xs text-slate-500">{member.email}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{member.role}</span>
                               <button className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                         </div>
                      ))}
                   </div>
                </Card>
             )}
             
             {activeTab === 'security' && (
                <Card>
                    <h3 className="font-bold text-slate-800 mb-6">Login History</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase font-bold bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Device</th>
                                <th className="px-4 py-3">Location</th>
                                <th className="px-4 py-3">Time</th>
                                <th className="px-4 py-3 rounded-r-lg">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-50">
                                <td className="px-4 py-4 font-medium text-slate-700 flex items-center gap-2"><Smartphone className="w-4 h-4" /> iPhone 14 Pro</td>
                                <td className="px-4 py-4 text-slate-500">Agarpara, India</td>
                                <td className="px-4 py-4 text-slate-500">Just now</td>
                                <td className="px-4 py-4"><span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">Active</span></td>
                            </tr>
                            <tr>
                                <td className="px-4 py-4 font-medium text-slate-700 flex items-center gap-2"><Globe className="w-4 h-4" /> Chrome / Windows</td>
                                <td className="px-4 py-4 text-slate-500">Kolkata, India</td>
                                <td className="px-4 py-4 text-slate-500">Yesterday, 10:23 PM</td>
                                <td className="px-4 py-4"><span className="text-slate-400 font-bold text-xs bg-slate-50 px-2 py-1 rounded">Logged Out</span></td>
                            </tr>
                        </tbody>
                    </table>
                </Card>
             )}
          </div>
       </div>
    </div>
  );
};

const HelpSupport = () => {
    // Mode: 'text' or 'voice'
    const [mode, setMode] = useState<'text' | 'voice'>('text');
    
    // Text Chat State
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
        { role: 'model', text: 'Hello! I am your AgriSmart Assistant. Ask me anything about your farm, crop health, or weather conditions.' }
    ]);
    const [input, setInput] = useState('');
    const [isTextLoading, setIsTextLoading] = useState(false);
    const textChatSession = useRef<any>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Voice Chat State
    const [isLiveConnected, setIsLiveConnected] = useState(false);
    const [voiceStatus, setVoiceStatus] = useState('Disconnected');
    const [isMuted, setIsMuted] = useState(false);
    
    const liveSessionRef = useRef<any>(null); // For sessionPromise
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

    // Scroll text chat
    useEffect(() => {
        if (mode === 'text') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, mode]);

    // Cleanup Audio on Unmount or Mode Switch
    useEffect(() => {
        return () => {
            disconnectFromLiveAPI();
        };
    }, []);

    // --- Text Chat Logic ---
    const handleSendText = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsTextLoading(true);

        try {
            if (!process.env.API_KEY) throw new Error("API Key missing");
            
            if (!textChatSession.current) {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                textChatSession.current = ai.chats.create({
                    model: "gemini-3-pro-preview",
                    config: { systemInstruction: "You are an expert agricultural assistant." }
                });
            }
            const result = await textChatSession.current.sendMessage({ message: userMsg });
            setMessages(prev => [...prev, { role: 'model', text: result.text || "No response" }]);
        } catch (error) {
            console.error("Text chat error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI." }]);
        } finally {
            setIsTextLoading(false);
        }
    };

    // --- Voice Chat Logic (Live API) ---
    const connectToLiveAPI = async () => {
        if (!process.env.API_KEY) {
            alert("API Key is missing!");
            return;
        }

        try {
            setVoiceStatus("Connecting...");
            
            // 1. Setup Audio Contexts
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const inputCtx = new AudioContext({ sampleRate: 16000 });
            const outputCtx = new AudioContext({ sampleRate: 24000 });
            
            inputAudioContextRef.current = inputCtx;
            outputAudioContextRef.current = outputCtx;
            nextStartTimeRef.current = 0;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // 2. Connect Session
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: 'You are a friendly and helpful agricultural assistant. Keep answers concise.',
                },
                callbacks: {
                    onopen: async () => {
                        console.log("Live API Connected");
                        setVoiceStatus("Listening");
                        setIsLiveConnected(true);

                        // Start Mic Stream
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        const source = inputCtx.createMediaStreamSource(stream);
                        sourceNodeRef.current = source;
                        
                        const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                        scriptProcessor.onaudioprocess = (e) => {
                            if (isMuted) return; // Simple mute
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            
                            // Send to model
                            sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputCtx.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                         // Play audio response
                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && outputCtx) {
                            setVoiceStatus("Speaking");
                            
                            // Simple visual reset after speaking starts
                            setTimeout(() => setVoiceStatus("Listening"), 3000); 

                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            const audioBuffer = await decodeAudioData(
                                decode(base64Audio), 
                                outputCtx, 
                                24000, 
                                1
                            );
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                        }
                    },
                    onclose: () => {
                        console.log("Live API Closed");
                        setVoiceStatus("Disconnected");
                        setIsLiveConnected(false);
                    },
                    onerror: (e) => {
                        console.error("Live API Error", e);
                        setVoiceStatus("Error");
                        setIsLiveConnected(false);
                    }
                }
            });
            liveSessionRef.current = sessionPromise;

        } catch (err) {
            console.error(err);
            setVoiceStatus("Failed to Connect");
            setIsLiveConnected(false);
        }
    };

    const disconnectFromLiveAPI = () => {
        // Close Contexts
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        
        // Stop Tracks
        sourceNodeRef.current?.mediaStream?.getTracks().forEach(t => t.stop());
        
        // Close Session (Not explicitly available on promise, rely on context closure)
        setIsLiveConnected(false);
        setVoiceStatus("Disconnected");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
            {/* Sidebar remains same */}
            <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2">
                <SectionHeader title="Help Center" subtitle="Get support and answers" />
                <Card className="bg-green-600 text-white border-none">
                    <h3 className="font-bold text-lg mb-2">Need immediate help?</h3>
                    <p className="text-green-100 text-sm mb-4">Our agronomy experts are available 24/7 for emergency consultation.</p>
                    <button className="bg-white text-green-700 w-full py-2.5 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors flex items-center justify-center">
                        <Phone className="w-4 h-4 mr-2" /> Call Support
                    </button>
                </Card>
                <div className="space-y-3">
                    <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Common Topics</h4>
                    {['Soil Health Management', 'Pest Control Guidelines', 'Irrigation Scheduling', 'App Troubleshooting'].map((topic, i) => (
                        <button key={i} className="w-full text-left p-4 bg-white rounded-xl border border-slate-100 hover:border-green-200 hover:shadow-sm transition-all text-sm font-medium text-slate-700 flex justify-between items-center group">
                            {topic}
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-green-500" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <Card className="lg:col-span-2 flex flex-col h-full p-0 overflow-hidden border border-slate-200">
                {/* Header with Toggle */}
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${mode === 'voice' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'} flex items-center justify-center`}>
                            {mode === 'voice' ? <AudioWaveform className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">AgriSmart Assistant</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${isLiveConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span> 
                                {mode === 'voice' ? 'Voice Mode' : 'Text Mode'}
                            </p>
                        </div>
                    </div>
                    {/* Toggle Switch */}
                    <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                        <button 
                            onClick={() => { setMode('text'); disconnectFromLiveAPI(); }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'text' ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Text
                        </button>
                        <button 
                            onClick={() => setMode('voice')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'voice' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Voice
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-[#F8F9FC] relative">
                    {mode === 'text' ? (
                        <div className="p-4 space-y-4 h-full overflow-y-auto">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                        msg.role === 'user' 
                                        ? 'bg-green-600 text-white rounded-tr-sm' 
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTextLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm flex gap-2 items-center">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                    ) : (
                        // --- Voice Mode UI ---
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-slate-50 to-white">
                             {/* Status Indicator */}
                             <div className={`mb-8 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                                 voiceStatus === 'Listening' ? 'bg-green-100 text-green-600' :
                                 voiceStatus === 'Speaking' ? 'bg-blue-100 text-blue-600' :
                                 voiceStatus === 'Connecting...' ? 'bg-yellow-100 text-yellow-600' :
                                 'bg-slate-100 text-slate-500'
                             }`}>
                                 {voiceStatus}
                             </div>

                             {/* Visualizer Circle */}
                             <div className="relative mb-12 group">
                                 {/* Pulse Rings */}
                                 {isLiveConnected && (
                                     <>
                                        <div className={`absolute inset-0 rounded-full opacity-20 animate-ping ${voiceStatus === 'Speaking' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                        <div className={`absolute -inset-4 rounded-full opacity-10 animate-pulse ${voiceStatus === 'Speaking' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                     </>
                                 )}
                                 
                                 {/* Main Mic Button */}
                                 <button 
                                    onClick={isLiveConnected ? disconnectFromLiveAPI : connectToLiveAPI}
                                    className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform hover:scale-105 ${
                                        isLiveConnected 
                                          ? (voiceStatus === 'Speaking' ? 'bg-blue-600' : 'bg-green-600') 
                                          : 'bg-slate-800'
                                    }`}
                                 >
                                    {isLiveConnected ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-10 h-10 text-white" />}
                                 </button>
                             </div>

                             <h2 className="text-xl font-bold text-slate-800 mb-2">
                                 {isLiveConnected ? "Conversation Active" : "Start Voice Chat"}
                             </h2>
                             <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">
                                 {isLiveConnected 
                                    ? "Speak naturally. AgriSmart AI is listening to your questions." 
                                    : "Connect to have a real-time, hands-free conversation about your farm."}
                             </p>

                             {/* Controls */}
                             {isLiveConnected && (
                                 <div className="flex gap-4">
                                     <button 
                                       onClick={() => setIsMuted(!isMuted)}
                                       className={`p-3 rounded-full border transition-colors ${isMuted ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                     >
                                         {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                     </button>
                                     <button 
                                        className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                     >
                                        <Volume2 className="w-5 h-5" />
                                     </button>
                                 </div>
                             )}
                        </div>
                    )}
                </div>

                {/* Text Input (Only visible in Text Mode) */}
                {mode === 'text' && (
                    <div className="p-4 bg-white border-t border-slate-100">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                                placeholder="Ask about crop diseases, market prices, or weather..." 
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            />
                            <button 
                                onClick={handleSendText}
                                disabled={!input.trim() || isTextLoading}
                                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-lg shadow-green-200 flex items-center justify-center"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

// Helper for Chatbot Icon
const SparklesIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const SoilWater = () => {
  // Mock Data matching the design requirements
  const nutrients = [
    { label: 'Nitrogen', value: 40, max: 100, thresholdMin: 30, unit: 'mg/kg', trend: '+5%', trendPos: true, icon: FlaskConical, color: 'text-blue-500', track: 'text-blue-500', bgColor: 'bg-blue-50' },
    { label: 'Phosphorus', value: 50, max: 100, thresholdMin: 30, unit: 'mg/kg', trend: '+3%', trendPos: true, icon: Layers, color: 'text-purple-500', track: 'text-purple-500', bgColor: 'bg-purple-50' },
    { label: 'Potassium', value: 30, max: 100, thresholdMin: 40, unit: 'mg/kg', trend: '-2%', trendPos: false, icon: Diamond, color: 'text-orange-500', track: 'text-orange-500', bgColor: 'bg-orange-50' },
    { label: 'Soil Temperature', value: 28, max: 50, thresholdMax: 35, unit: '°C', trend: '+1.5°', trendPos: true, icon: Thermometer, color: 'text-red-500', track: 'text-red-500', bgColor: 'bg-red-50' },
    { label: 'Soil Moisture', value: 70, max: 100, thresholdMin: 30, unit: '%', trend: '-5%', trendPos: false, icon: Droplet, color: 'text-cyan-500', track: 'text-cyan-500', bgColor: 'bg-cyan-50' },
    { label: 'Soil pH', value: 6.5, max: 14, thresholdMin: 5.5, thresholdMax: 7.5, unit: 'pH', trend: 'Optimal', trendPos: true, icon: Activity, color: 'text-green-500', track: 'text-green-500', bgColor: 'bg-green-50' },
    { label: 'Electrical Cond.', value: 1.2, max: 5, thresholdMax: 2.5, unit: 'dS/m', trend: 'Normal', trendPos: true, icon: Zap, color: 'text-yellow-500', track: 'text-yellow-500', bgColor: 'bg-yellow-50' },
    { label: 'Leaf Wetness', value: 15, max: 100, thresholdMax: 80, unit: '%', trend: 'Low Risk', trendPos: true, icon: Droplets, color: 'text-teal-500', track: 'text-teal-500', bgColor: 'bg-teal-50' },
  ];

  const devices = [
    { label: 'Air Temperature', value: '32', unit: '°C', icon: Thermometer, color: 'bg-orange-500' },
    { label: 'Air Humidity', value: '65', unit: '%', icon: Wind, color: 'bg-blue-400' },
    { label: 'Rain Detected', value: 'No', unit: '', icon: CloudRain, color: 'bg-slate-500' },
    { label: 'Total Rainfall', value: '125', unit: 'mm', icon: CloudRain, color: 'bg-blue-600' },
    { label: 'Ammonia Level', value: '0.8', unit: 'ppm', icon: Activity, color: 'bg-yellow-500' },
    { label: 'GPS Satellites', value: '12', unit: '', icon: MapPin, color: 'bg-purple-500' },
  ];

  const trendsData = [
    { time: '6:00', moisture: 45, temp: 24, ph: 6.2 },
    { time: '9:00', moisture: 52, temp: 26, ph: 6.3 },
    { time: '12:00', moisture: 48, temp: 28, ph: 6.4 },
    { time: '15:00', moisture: 55, temp: 30, ph: 6.4 },
    { time: '18:00', moisture: 62, temp: 27, ph: 6.4 },
    { time: '21:00', moisture: 58, temp: 25, ph: 6.4 },
    { time: 'Now', moisture: 66, temp: 24, ph: 6.4 },
  ];

  const waterUsageData = [
    { day: 'Mon', value: 450 },
    { day: 'Tue', value: 380 },
    { day: 'Wed', value: 520 },
    { day: 'Thu', value: 410 },
    { day: 'Fri', value: 480 },
    { day: 'Sat', value: 350 },
    { day: 'Sun', value: 430 },
  ];
  
  const fieldHealth = [
     { name: 'North Field', score: 92, status: 'Excellent' },
     { name: 'East Field', score: 78, status: 'Good' },
     { name: 'South Field', score: 65, status: 'Fair' }, 
     { name: 'West Field', score: 88, status: 'Excellent' },
  ];

  const activeAlerts = nutrients.reduce<any[]>((acc, n) => {
      if (n.thresholdMin !== undefined && n.value < n.thresholdMin) {
          acc.push({
              id: `${n.label}-low`,
              sensor: n.label,
              value: n.value,
              unit: n.unit,
              threshold: n.thresholdMin,
              type: 'Low',
              severity: 'Critical'
          });
      }
      if (n.thresholdMax !== undefined && n.value > n.thresholdMax) {
          acc.push({
              id: `${n.label}-high`,
              sensor: n.label,
              value: n.value,
              unit: n.unit,
              threshold: n.thresholdMax,
              type: 'High',
              severity: 'Warning'
          });
      }
      return acc;
  }, []);

  const handleExport = () => {
    const headers = ['Category', 'Parameter', 'Value', 'Unit', 'Additional Info'];
    
    const rows = [
      ...nutrients.map(n => ['Soil Metrics', n.label, n.value, n.unit, `Trend: ${n.trend}`]),
      ...devices.map(d => ['Device Reading', d.label, d.value, d.unit, '-']),
      ...fieldHealth.map(f => ['Field Health', f.name, f.score, '/100', f.status]),
      [], // spacer
      ['Time', 'Soil Moisture (%)', 'Temperature (C)', 'pH Level', ''], // Trend headers
      ...trendsData.map(t => [t.time, t.moisture, t.temp, t.ph, ''])
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "agriscore_soil_water_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
     <div className="space-y-8">
        <SectionHeader 
            title="Soil & Water" 
            subtitle="Real-time monitoring and analytics" 
            action={
                <button 
                  onClick={handleExport}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center shadow-lg shadow-green-200 transition-colors"
                >
                  Export Data <Download className="w-3.5 h-3.5 ml-2" strokeWidth={2.5} />
                </button>
            }
        />

        {/* Alert Banner */}
        {activeAlerts.map(alert => (
            <div key={alert.id} className={`rounded-2xl p-4 border-l-4 shadow-soft flex items-start gap-4 animate-in slide-in-from-top-4 duration-500 ${
                alert.severity === 'Critical' ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500'
            }`}>
                <div className={`p-2 rounded-full ${alert.severity === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h4 className={`font-bold text-sm uppercase tracking-wide ${alert.severity === 'Critical' ? 'text-red-800' : 'text-amber-800'}`}>
                            {alert.severity} Alert: {alert.sensor}
                        </h4>
                        <button className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                    </div>
                    <p className={`text-sm font-medium mt-1 ${alert.severity === 'Critical' ? 'text-red-700' : 'text-amber-700'}`}>
                        Current reading of <span className="font-bold">{alert.value}{alert.unit}</span> is {alert.type.toLowerCase()}er than recommended threshold ({alert.threshold}{alert.unit}).
                    </p>
                </div>
            </div>
        ))}

        {/* Top Cards - Updated with Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
           {nutrients.map((item, i) => (
             <Card key={i} className={`p-4 flex flex-col items-center justify-center relative h-48 hover:shadow-md transition-all ${item.thresholdMin && item.value < item.thresholdMin ? 'ring-2 ring-red-100' : ''}`}>
                <div className="absolute top-3 left-3">
                    <div className={`p-1.5 rounded-full ${item.bgColor} ${item.color}`}>
                        <item.icon className="w-3.5 h-3.5" />
                    </div>
                </div>
                
                <div className="mt-2 mb-3">
                   <MiniGauge value={item.value} max={item.max} color={item.color} track={item.track} size={84} strokeWidth={8}>
                      <div className="text-center">
                         <span className="text-xl font-bold text-slate-800 leading-none">{item.value}</span>
                         <span className="text-[9px] text-slate-400 font-medium block mt-0.5">{item.unit}</span>
                      </div>
                   </MiniGauge>
                </div>
                
                <div className="text-center">
                   <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">{item.label}</p>
                   <p className={`text-[10px] font-bold flex items-center justify-center ${item.trendPos ? 'text-green-500' : 'text-red-500'}`}>
                      {item.trendPos ? <ArrowUp className="w-3 h-3 mr-0.5" /> : <ArrowDown className="w-3 h-3 mr-0.5" />} {item.trend}
                   </p>
                </div>
             </Card>
           ))}
        </div>

        {/* Device Section */}
        <div>
           <div className="mb-5 pl-1 border-l-4 border-blue-500">
              <h2 className="text-lg font-bold text-slate-800 ml-3">Device & Environmental Readings</h2>
              <p className="text-xs text-slate-500 ml-3">Live data from IoT sensors across your farm</p>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {devices.map((device, i) => (
                 <Card key={i} className="p-4 relative hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                       <div className={`w-10 h-10 rounded-xl ${device.color} text-white flex items-center justify-center shadow-lg shadow-blue-500/10`}>
                          <device.icon className="w-5 h-5" />
                       </div>
                       <div className="flex gap-1 pt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                       </div>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">{device.label}</p>
                    <div className="flex items-baseline gap-1">
                       <span className="text-2xl font-bold text-slate-800">{device.value}</span>
                       <span className="text-xs text-slate-500 font-medium">{device.unit}</span>
                    </div>
                 </Card>
              ))}
           </div>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 gap-6">
           {/* Chart */}
           <Card className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center">
                       <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">IoT Sensor Trends</h3>
                        <p className="text-xs text-slate-500">24-hour monitoring data</p>
                    </div>
                 </div>
                 <div className="flex bg-slate-100 rounded-lg p-1 self-end sm:self-auto">
                    <button className="px-3 py-1 bg-white rounded-md text-xs font-bold text-slate-800 shadow-sm transition-all">Live</button>
                    <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-all">Historical</button>
                 </div>
              </div>
              <div className="h-[280px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                       <defs>
                          <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                          itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                       />
                       <Area type="monotone" dataKey="moisture" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorMoisture)" name="Soil Moisture (%)" />
                       <Area type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={2} fill="none" name="Temperature (°C)" />
                       <Area type="monotone" dataKey="ph" stroke="#f59e0b" strokeWidth={2} fill="none" name="pH Level" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6">
                  <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                     <span className="text-xs text-slate-500 font-medium">Soil Moisture (%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                     <span className="text-xs text-slate-500 font-medium">Temperature (°C)</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                     <span className="text-xs text-slate-500 font-medium">pH Level</span>
                  </div>
              </div>
           </Card>
        </div>
        
        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card>
              <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                        <Droplet className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-800">Water Usage Analytics</h3>
                        <p className="text-xs text-slate-500">Weekly consumption pattern</p>
                     </div>
                 </div>
                 <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">3,030L</p>
                    <p className="text-[10px] font-bold text-green-500 flex items-center justify-end">
                       <ArrowDown className="w-3 h-3 mr-0.5" /> 12% vs last week
                    </p>
                 </div>
              </div>
              <div className="h-[220px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={waterUsageData} barSize={40}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} dy={10} />
                       <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                       />
                       <Bar dataKey="value" fill="#34d399" radius={[6, 6, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </Card>
           
           <Card>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-800">Field Health Zones</h3>
                    <p className="text-xs text-slate-500">Soil quality across different areas</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {fieldHealth.map((field, i) => (
                    <div key={i} className="p-4 border border-slate-100 rounded-xl hover:border-green-200 transition-all bg-slate-50/50 group">
                       <div className="flex justify-between items-start mb-3">
                          <div>
                             <p className="text-xs font-bold text-slate-700">{field.name}</p>
                             <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-xl font-bold text-slate-800">{field.score}</span>
                                <span className="text-[10px] text-slate-400 font-medium">/100</span>
                             </div>
                          </div>
                          {field.score < 70 ? (
                             <AlertTriangle className="w-5 h-5 text-orange-500" />
                          ) : (
                             <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                       </div>
                       <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                          <div 
                             className={`h-full rounded-full transition-all duration-1000 ${field.score < 70 ? 'bg-orange-500' : 'bg-green-500'}`} 
                             style={{ width: `${field.score}%` }}
                          ></div>
                       </div>
                    </div>
                 ))}
              </div>
              
              <div className="mt-8 flex justify-between items-center text-[10px] text-slate-500 px-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Excellent (85+)</div>
                 <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-600"></span> Good (70-84)</div>
                 <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Fair (50-69)</div>
              </div>
           </Card>
        </div>
     </div>
  );
}

// --- Main App Component ---

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <div className="bg-slate-100 p-4 rounded-full mb-4">
      <Sprout className="w-8 h-8 text-slate-400" />
    </div>
    <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
    <p className="text-slate-500 max-w-xs">This module is currently under development. Check back soon for updates!</p>
  </div>
);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <HashRouter>
      <Layout onLogout={() => setIsAuthenticated(false)}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/farms" element={<PlaceholderPage title="Crop Management" />} />
          <Route path="/irrigation" element={<SoilWater />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/tasks" element={<TaskManagement />} />
          <Route path="/doctor" element={<PlaceholderPage title="Crop Doctor" />} />
          <Route path="/reports" element={<PlaceholderPage title="Reports & Analytics" />} />
          <Route path="/score" element={<PlaceholderPage title="AgriScore" />} />
          <Route path="/settings" element={<FarmSettings />} />
          <Route path="/account" element={<MyAccount />} />
          <Route path="/help" element={<HelpSupport />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
