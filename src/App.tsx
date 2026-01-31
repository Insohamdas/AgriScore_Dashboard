import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Sprout, Bell, Droplets, Settings, Menu, X, 
  Thermometer, Activity, Battery, Wifi, WifiOff, MapPin, ChevronRight,
  Wind, AlertTriangle, FileText, Stethoscope, BarChart2, HelpCircle, LogOut,
  Search, Download, Sun, Cloud, ArrowDown, ArrowUp, Carrot, MoreHorizontal, Calendar,
  User as UserIcon, Shield, Globe, Lock, Mail, Smartphone, Camera, Save,
  CheckCircle, Clock, Filter, Plus, Trash2, Droplet, CloudRain, Zap,
  ChevronDown, MessageSquare, Phone, FlaskConical, Layers, Diamond, Award, Star,
  CreditCard, Users, Link as LinkIcon, Key, History, BadgeCheck, AlertCircle, FileCheck,
  Facebook, IndianRupee, Sunrise, Sunset, Eye, Gauge, Navigation, Umbrella, MoveRight,
  BookOpen, Bug, LifeBuoy, Upload, Moon, Edit2, Sparkles, Mic, Loader2, ArrowRight, Bot
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { api } from './services/mockDataService';
import { useProfile } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { Task, HarvestItem } from './types';
import { Notifications } from './pages/Notifications';
import { HelpSupport } from './pages/HelpSupport';

// Import reusable UI components
import { StatusBadge, Toggle, Card, SectionHeader, MiniGauge } from './components/ui';

const soilHistoryUrl = new URL('./assets/data/IoT_soil_data.csv', import.meta.url).href;

const Layout: React.FC<{ children: React.ReactNode; onLogout: () => void }> = ({ children, onLogout }) => {
   const location = useLocation();
   const navigate = useNavigate();
   const [isMobileOpen, setIsMobileOpen] = useState(false);
   const { userName, userEmail, userAvatar } = useProfile();

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
         <aside
            className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-slate-100 transition-transform duration-200 ease-in-out flex flex-col ${
               isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
         >
            <div className="h-20 flex items-center justify-between px-4 border-b border-slate-100 lg:hidden">
               <img src="/logo.svg" alt="AgriScore Logo" className="w-14 h-14" />
               <button onClick={() => setIsMobileOpen(false)} className="p-2 text-slate-500">
                  <X className="w-6 h-6" />
               </button>
            </div>
            <div className="hidden lg:flex h-32 items-center justify-center w-full">
               <img src="/logo.svg" alt="AgriScore Logo" className="w-32 h-32" />
            </div>

            <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
               {navItems.map((item) => (
                  <Link
                     key={item.path}
                     to={item.path}
                     onClick={() => setIsMobileOpen(false)}
                     className={`flex items-center px-4 py-3 rounded-xl transition-all text-[13px] font-medium ${
                        isActive(item.path)
                           ? 'bg-[#F1FDF4] text-green-600 shadow-sm'
                           : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                     }`}
                  >
                     <item.icon
                        className={`w-[18px] h-[18px] mr-3.5 transition-colors ${
                           isActive(item.path) ? 'text-green-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                     />
                     <span>{item.label}</span>
                  </Link>
               ))}
            </nav>

            <div className="p-4 mt-auto">
               <button
                  onClick={() => {
                     if (window.confirm('Are you sure you want to log out? You will be returned to the login page.')) {
                        onLogout();
                     }
                  }}
                  className="flex items-center w-full px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors text-[13px] font-medium"
               >
                  <LogOut className="w-[18px] h-[18px] mr-3.5" />
                  Log Out
               </button>
            </div>
         </aside>

         <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 lg:px-10 z-20 sticky top-0 supports-[backdrop-filter]:bg-white/60">
               <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                  <Menu className="w-6 h-6" />
               </button>

               <div className="flex-1 flex justify-center px-4 lg:px-8">
                  <div className="hidden md:flex items-center w-full max-w-md relative group transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:max-w-2xl">
                     <div className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-emerald-100/50 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 -z-10 blur-md" />
                     <Search className="w-[18px] h-[18px] absolute left-4 text-slate-400 group-focus-within:text-green-600 transition-all duration-300 group-focus-within:scale-110 z-10" />
                     <input
                        type="text"
                        placeholder="Search farms, crops, or tasks..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-2xl text-sm text-slate-600 placeholder:text-slate-400 transition-all duration-300 outline-none 
                        focus:bg-white focus:border-green-500/30 focus:ring-4 focus:ring-green-500/10 focus:shadow-lg
                        hover:bg-white hover:border-slate-300"
                     />
                  </div>
               </div>

               <div className="flex items-center gap-5">
                  {/* Device Status Indicators */}
                  <div className="hidden xl:flex items-center gap-4 pr-5 border-r border-slate-200">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold">System Online</span>
                     </div>
                     
                     <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-full border border-slate-100" title="Network Strength">
                        <Wifi className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-xs font-medium">5G</span>
                     </div>

                     <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-full border border-slate-100" title="Sensor Battery">
                        <Battery className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-xs font-medium">98%</span>
                     </div>
                  </div>

                  <button 
                     onClick={() => navigate('/notifications')}
                     className="relative p-2.5 text-slate-400 hover:text-slate-600 transition-colors hover:bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                     <Bell className="w-5 h-5" />
                     <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                  </button>

                  <button 
                     onClick={() => navigate('/account')}
                     className="group flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-2xl hover:bg-white transition-all duration-300 border border-transparent hover:border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                  >
                     <div className="relative">
                        {userAvatar ? (
                           <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-xl object-cover shadow-sm ring-2 ring-white group-hover:ring-emerald-50 transition-all duration-300" />
                        ) : (
                           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white group-hover:ring-emerald-50 transition-all duration-300">
                              {userName.charAt(0)}
                           </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
                        </span>
                     </div>

                     <div className="hidden md:flex flex-col items-start text-left">
                        <span className="text-sm font-bold text-slate-800 group-hover:text-emerald-950 transition-colors">{userName}</span>
                        <span className="text-[11px] font-medium text-slate-400 group-hover:text-emerald-600/80 transition-colors">{userEmail}</span>
                     </div>
                  </button>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F8F9FC]">
               <div className="max-w-7xl mx-auto pb-10">{children}</div>
            </div>
         </main>
      </div>
   );
};

// --- Dashboard Page ---

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [harvest, setHarvest] = useState<HarvestItem[]>([]);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [greeting, setGreeting] = useState('Good Morning');
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getTasks().then(setTasks);
    api.getHarvestSummary().then(setHarvest);
  }, []);

  // Set time-based greeting
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning');
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good Afternoon');
      } else if (hour >= 17 && hour < 21) {
        setGreeting('Good Evening');
      } else {
        setGreeting('Good Night');
      }
    };
    
    updateGreeting();
    const timer = setInterval(updateGreeting, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const handleExport = (type: 'live' | 'history') => {
      if (type === 'history') {
         const link = document.createElement('a');
         link.href = soilHistoryUrl;
         link.download = 'IoT_soil_data.csv';
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         setIsExportMenuOpen(false);
         return;
      }

      const headers = ['Category', 'Metric', 'Value', 'Unit', 'Notes'];
      const productionRows = productionData.map((crop) => ['Production Mix', crop.name, crop.value, '%', 'Relative share']);
      const harvestRows = harvest.map((item) => ['Harvest', item.name, item.amount, item.unit, `Color: ${item.color}`]);
      const taskRows = tasks.map((task) => ['Task', task.name, task.status, '-', `Due ${task.date}`]);
      const yieldRows = yieldData.map((point) => ['Yield Trend', point.name, point.value, 'tons', 'Monthly yield']);

      const rows = [...productionRows, ...harvestRows, ...taskRows, ...yieldRows];
      const csvContent =
         'data:text/csv;charset=utf-8,' +
         headers.join(',') +
         '\n' +
         rows.map((row) => row.join(',')).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'agriscore_dashboard_live_snapshot.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExportMenuOpen(false);
   };

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
        title={`${greeting} !`}
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
                  <div className="relative" ref={exportMenuRef}>
                     <button
                        onClick={() => setIsExportMenuOpen((prev) => !prev)}
                        className="bg-[#22C55E] hover:bg-green-600 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center transition-all shadow-sm shadow-green-200"
                     >
                        Export <Download className="w-3.5 h-3.5 ml-2" strokeWidth={2.5} />
                     </button>
                     {isExportMenuOpen && (
                        <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-lg z-20 overflow-hidden">
                           <button
                              onClick={() => handleExport('live')}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                           >
                              Live data <span className="text-[11px] text-slate-400">Snapshot</span>
                           </button>
                           <button
                              onClick={() => handleExport('history')}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between border-t border-slate-100"
                           >
                              Full history <span className="text-[11px] text-slate-400">ZIP export</span>
                           </button>
                        </div>
                     )}
                  </div>
          </div>
        }
      />

      {/* Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weather Card */}
        <div className="lg:col-span-3 bg-white rounded-[24px] p-6 shadow-soft border border-slate-100/50 relative overflow-hidden flex flex-col justify-between min-h-[240px]">
          <div className="flex justify-between items-start z-10">
             <div className="px-3 py-1.5 bg-[#22C55E] text-white rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center shadow-md shadow-green-500/20">
               <MapPin className="w-3 h-3 mr-1" /> Tarakeswar
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

const CropManagement = () => {
   const cropStats = [
      { label: 'Active Crops', value: 8, subtext: '4 at harvest stage', icon: Sprout, color: 'bg-green-100 text-green-700' },
      { label: 'Avg Yield', value: '4.3 t/acre', subtext: '+6% vs last season', icon: BarChart2, color: 'bg-amber-100 text-amber-700' },
      { label: 'Irrigation Status', value: '82%', subtext: 'All pivots synced', icon: Droplets, color: 'bg-blue-100 text-blue-700' },
      { label: 'Pest Alerts', value: 2, subtext: 'Both medium severity', icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
   ];

   const fields = [
      { name: 'North Plot', crop: 'Wheat', stage: 'Flowering', health: 91, irrigation: 'Drip • 06:00', tasks: 2 },
      { name: 'East Ridge', crop: 'Potato', stage: 'Vegetative', health: 78, irrigation: 'Pivot • 07:30', tasks: 3 },
      { name: 'River Bend', crop: 'Rice', stage: 'Tillering', health: 84, irrigation: 'Flood • 18:00', tasks: 1 },
      { name: 'South Orchard', crop: 'Mustard', stage: 'Sowing', health: 73, irrigation: 'Sprinkler • 21:00', tasks: 4 },
   ];

   const rotationPlan = [
      { field: 'North Plot', current: 'Wheat', next: 'Legume Mix', window: 'Apr 5 - Apr 20' },
      { field: 'East Ridge', current: 'Potato', next: 'Maize', window: 'Jun 10 - Jun 25' },
      { field: 'River Bend', current: 'Rice', next: 'Sesbania Cover', window: 'Aug 1 - Aug 12' },
   ];

   const upcomingActivities = [
      { title: 'Foliar spray (Zn + B)', field: 'North Plot', due: 'Tomorrow • 6 AM', owner: 'Ajay', status: 'Scheduled' },
      { title: 'Scouting for aphids', field: 'South Orchard', due: 'Thu • 4 PM', owner: 'Rina', status: 'Pending' },
      { title: 'Soil moisture audit', field: 'East Ridge', due: 'Fri • 7 AM', owner: 'Dev', status: 'In Progress' },
   ];

   const yieldTrend = [
      { week: 'W1', planned: 3.2, actual: 3.1 },
      { week: 'W2', planned: 3.4, actual: 3.35 },
      { week: 'W3', planned: 3.6, actual: 3.45 },
      { week: 'W4', planned: 3.8, actual: 3.7 },
      { week: 'W5', planned: 4.0, actual: 3.95 },
      { week: 'W6', planned: 4.2, actual: 4.15 },
   ];

   return (
      <div className="space-y-8">
         <SectionHeader
            title="Crop Management"
            subtitle="Track crop health, plan rotations, and coordinate field work"
            action={
               <button className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-green-200">
                  <Plus className="w-4 h-4 mr-2" /> Add Field Plan
               </button>
            }
         />

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {cropStats.map((stat, idx) => {
               const Icon = stat.icon;
               return (
                  <Card key={idx} className="flex flex-col gap-3">
                     <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase text-slate-400">{stat.label}</p>
                        <span className={`p-2 rounded-xl ${stat.color}`}>
                           <Icon className="w-4 h-4" />
                        </span>
                     </div>
                     <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                     <p className="text-sm text-slate-500">{stat.subtext}</p>
                  </Card>
               );
            })}
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Yield vs Plan</h3>
                  <span className="text-xs font-semibold text-slate-400">Last 6 weeks</span>
               </div>
               <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={yieldTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                           <stop offset="85%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                     <XAxis dataKey="week" stroke="#94A3B8" fontSize={12} />
                     <YAxis stroke="#94A3B8" fontSize={12} unit=" t" />
                     <Tooltip contentStyle={{ borderRadius: 16, borderColor: '#E2E8F0' }} />
                     <Area type="monotone" dataKey="planned" stroke="#F97316" strokeWidth={2} fill="none" />
                     <Area type="monotone" dataKey="actual" stroke="#22C55E" strokeWidth={2.5} fill="url(#colorActual)" />
                  </AreaChart>
               </ResponsiveContainer>
            </Card>

            <Card>
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Rotation Plan</h3>
                  <span className="text-xs font-semibold text-green-600">Soil recovery</span>
               </div>
               <div className="space-y-4">
                  {rotationPlan.map((item, idx) => (
                     <div key={idx} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/60">
                        <p className="text-xs font-bold text-slate-500 uppercase">{item.field}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm font-semibold text-slate-800">
                           <span>{item.current}</span>
                           <MoveRight className="w-4 h-4 text-slate-400" />
                           <span className="text-green-600">{item.next}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Window: {item.window}</p>
                     </div>
                  ))}
               </div>
            </Card>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Field Health</h3>
                  <span className="text-xs font-semibold text-slate-400">Updated 2 mins ago</span>
               </div>
               <div className="space-y-4">
                  {fields.map((field) => (
                     <div key={field.name} className="flex items-center justify-between border border-slate-100 rounded-2xl p-4">
                        <div>
                           <p className="text-sm font-semibold text-slate-800">{field.name}</p>
                           <p className="text-xs text-slate-500">{field.crop} • {field.stage}</p>
                           <p className="text-xs text-slate-400 mt-1">{field.irrigation}</p>
                        </div>
                        <div className="flex flex-col items-end">
                           <MiniGauge value={field.health} max={100} color="text-green-500" track="text-green-200" size={72}>
                              <span className="text-lg font-bold text-slate-800">{field.health}%</span>
                              <span className="text-[10px] text-slate-400 uppercase">Health</span>
                           </MiniGauge>
                           <span className="mt-2 text-xs text-slate-500">{field.tasks} tasks</span>
                        </div>
                     </div>
                  ))}
               </div>
            </Card>

            <Card>
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Upcoming Activities</h3>
                  <button className="text-xs font-semibold text-green-600 hover:text-green-700">View schedule</button>
               </div>
               <div className="space-y-4">
                  {upcomingActivities.map((activity, idx) => (
                     <div key={idx} className="flex items-center justify-between border border-slate-100 rounded-2xl p-4">
                        <div>
                           <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
                           <p className="text-xs text-slate-500">{activity.field}</p>
                           <p className="text-xs text-slate-400 mt-1">{activity.due}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-semibold text-slate-500 mb-1">Lead: {activity.owner}</p>
                           <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                              {activity.status}
                           </span>
                        </div>
                     </div>
                  ))}
               </div>
            </Card>
         </div>
      </div>
   );
};

const CropDoctor = () => {
   const [symptomText, setSymptomText] = useState('');
   const [analysis, setAnalysis] = useState<string | null>(null);
   const [isAnalyzing, setIsAnalyzing] = useState(false);

   const stats = [
      { label: 'Cases Analyzed (7d)', value: 43, trend: '+8%', color: 'bg-green-100 text-green-700' },
      { label: 'High-Risk Alerts', value: 3, trend: '2 resolved', color: 'bg-red-100 text-red-600' },
      { label: 'Accuracy (last season)', value: '92%', trend: '+3% YoY', color: 'bg-amber-100 text-amber-700' },
      { label: 'Lab Tests Requested', value: 6, trend: 'Awaiting 2', color: 'bg-blue-100 text-blue-700' },
   ];

   const diseaseAlerts = [
      { crop: 'Potato', issue: 'Leaf miner presence', severity: 'Medium', probability: 0.64, recommendation: 'Release parasitoid wasps / sticky traps' },
   ];

   const recommendedTreatments = [
      { name: 'Bio-fungicide rotation', window: 'Apply this evening', steps: ['Mix 2 ml/L of Bacillus-based fungicide', 'Cover underside of leaves', 'Repeat in 5 days if lesions persist'] },
      { name: 'Targeted fertigation', window: 'Tomorrow 05:30', steps: ['Inject 8 kg KNO₃ via drip', 'Flush lines for 10 minutes', 'Log EC/ppm after run'] },
   ];

   const caseHistory = [
      { date: '24 Nov • 08:10', title: 'Chili wilting diagnosis', action: 'Identified fusarium; issued soil drench plan' },
      { date: '22 Nov • 15:45', title: 'Rice leaf blast alert closed', action: 'Farmer uploaded recovery photos' },
      { date: '20 Nov • 11:20', title: 'Maize nutrient deficiency', action: 'Recommended foliar Zn + Mg mix' },
   ];

   const knowledgeCenter = [
      { title: 'Spot the differences between early and late blight', duration: '4 min read' },
      { title: 'Field checklist before sending samples to lab', duration: '2 min read' },
      { title: 'Safe spray intervals during humid weeks', duration: 'Podcast • 8 min' },
   ];

   const handleAnalyze = () => {
      if (!symptomText.trim()) return;
      setIsAnalyzing(true);
      setAnalysis(null);
      setTimeout(() => {
         setAnalysis('Likely early-stage fungal infection. Focus on drying canopy, schedule a copper spray, and revisit symptoms in 48 hours.');
         setIsAnalyzing(false);
      }, 1200);
   };

   return (
      <div className="space-y-8">
         <SectionHeader
            title="Crop Doctor"
            subtitle="Describe field symptoms, review AI alerts, and share recovery plans"
            action={
               <button className="flex items-center bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:bg-slate-800">
                  <Upload className="w-4 h-4 mr-2" /> Upload Lab Report
               </button>
            }
         />

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
               <Card key={idx} className="space-y-2">
                  <div className="text-xs font-bold uppercase text-slate-400">{stat.label}</div>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${stat.color}`}>
                     {stat.trend}
                  </span>
               </Card>
            ))}
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2 overflow-hidden relative">
               {/* Optional background decoration */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
               
               <div className="flex items-center justify-between mb-6 relative">
                  <h3 className="font-bold text-slate-800 flex items-center gap-3 text-lg">
                     <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                        <Stethoscope className="w-5 h-5" />
                     </div>
                     AI Symptom Diagnosis
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100 flex items-center gap-1">
                     <Sparkles className="w-3 h-3" /> Live Assistant
                  </span>
               </div>

               <div className="relative">
                  <textarea
                     value={symptomText}
                     onChange={(e) => setSymptomText(e.target.value)}
                     rows={5}
                     placeholder="Describe what you see (e.g., 'Yellow spots on tomato leaves', 'Wilting despite irrigation')..."
                     className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-400 focus:bg-white resize-none transition-all placeholder:text-slate-400"
                  />
                  
                  {/* Quick actions inside or below textarea */}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                     <button className="p-2 bg-white text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 border border-slate-200 transition-colors" title="Upload Image">
                        <Camera className="w-4 h-4" />
                     </button>
                     <button className="p-2 bg-white text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 border border-slate-200 transition-colors" title="Voice Input">
                        <Mic className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex gap-2 w-full overflow-x-auto pb-2 scrollbar-hide sm:w-auto">
                     {['Yellowing', 'Wilting', 'Spots', 'Pests'].map(tag => (
                        <button 
                           key={tag} 
                           onClick={() => setSymptomText(prev => prev + (prev ? ', ' : '') + tag)}
                           className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all whitespace-nowrap"
                        >
                           + {tag}
                        </button>
                     ))}
                  </div>
                  
                  <div className="flex gap-3 w-full sm:w-auto justify-end">
                     <button
                        onClick={() => setSymptomText('')}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                        disabled={!symptomText}
                     >
                        Clear
                     </button>
                     <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !symptomText.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all flex items-center gap-2"
                     >
                        {isAnalyzing ? (
                           <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                           </>
                        ) : (
                           <>
                              Analyze Symptoms <ArrowRight className="w-4 h-4" />
                           </>
                        )}
                     </button>
                  </div>
               </div>

               {analysis && (
                  <div className="mt-6 p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
                     <div className="flex items-start gap-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                           <Bot className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                           <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Diagnosis</p>
                           <p className="text-sm font-medium text-slate-700 leading-relaxed">{analysis}</p>
                        </div>
                     </div>
                  </div>
               )}
            </Card>

            <Card>
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Knowledge center</h3>
                  <button className="text-xs font-semibold text-green-600">View all</button>
               </div>
               <div className="space-y-4">
                  {knowledgeCenter.map((item, idx) => (
                     <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/80">
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-2">{item.duration}</p>
                     </div>
                  ))}
               </div>
            </Card>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">AI disease alerts</h3>
                  <span className="text-xs font-semibold text-slate-400">Updated 10 min ago</span>
               </div>
               <div className="space-y-4">
                  {diseaseAlerts.map((alert, idx) => (
                     <div key={idx} className="flex items-center justify-between border border-slate-100 rounded-2xl p-4">
                        <div>
                           <p className="text-sm font-semibold text-slate-800">{alert.crop}</p>
                           <p className="text-xs text-slate-500">{alert.issue}</p>
                           <p className="text-xs text-slate-400 mt-1">{alert.recommendation}</p>
                        </div>
                        <div className="text-right">
                           <span className={`px-3 py-1 rounded-full text-[11px] font-semibold mb-2 inline-block shadow-sm ${
                              alert.severity === 'High' ? 'bg-red-50 text-red-600' :
                              alert.severity === 'Medium' ? 'bg-amber-50 text-amber-600' :
                              'bg-indigo-50 text-indigo-600'
                           }`}>{alert.severity}</span>
                           <p className="text-xs text-slate-500">Probability: {(alert.probability * 100).toFixed(0)}%</p>
                        </div>
                     </div>
                  ))}
               </div>
            </Card>

            <Card>
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Treatment queue</h3>
                  <span className="text-xs text-slate-400">Auto sorted by urgency</span>
               </div>
               <div className="space-y-4">
                  {recommendedTreatments.map((plan, idx) => (
                     <div key={idx} className="border border-slate-100 rounded-2xl p-4">
                        <p className="text-sm font-semibold text-slate-800">{plan.name}</p>
                        <p className="text-xs text-green-600 font-semibold mt-1">{plan.window}</p>
                        <ul className="mt-3 text-xs text-slate-500 space-y-2 list-disc list-inside">
                           {plan.steps.map((step, i) => (
                              <li key={i}>{step}</li>
                           ))}
                        </ul>
                     </div>
                  ))}
               </div>
            </Card>
         </div>

         <Card>
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-slate-800">Recent cases</h3>
               <button className="text-xs font-semibold text-green-600">Export log</button>
            </div>
            <div className="space-y-4">
               {caseHistory.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                     <div className="w-32 text-xs font-semibold text-slate-500">{entry.date}</div>
                     <div className="flex-1 border-l border-slate-100 pl-4">
                        <p className="text-sm font-semibold text-slate-800">{entry.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{entry.action}</p>
                     </div>
                  </div>
               ))}
            </div>
         </Card>
      </div>
   );
};

const ReportsAnalytics = () => {
   const overviewCards = [
      { label: 'Total Output Value', value: '₹56.3L', change: '+12.4%', positive: true },
      { label: 'Input Cost / Acre', value: '₹18,200', change: '-4.1%', positive: true },
      { label: 'Avg Profit Margin', value: '32%', change: '+2.7%', positive: true },
      { label: 'Carbon Savings', value: '4.8 t CO₂e', change: '+0.6 t', positive: true },
   ];

   const revenueTrend = [
      { month: 'Jan', revenue: 6.2, cost: 3.8 },
      { month: 'Feb', revenue: 6.8, cost: 4.1 },
      { month: 'Mar', revenue: 7.4, cost: 4.4 },
      { month: 'Apr', revenue: 7.9, cost: 4.6 },
      { month: 'May', revenue: 8.5, cost: 4.9 },
      { month: 'Jun', revenue: 9.4, cost: 5.2 },
      { month: 'Jul', revenue: 9.8, cost: 5.4 },
      { month: 'Aug', revenue: 10.2, cost: 5.6 },
      { month: 'Sep', revenue: 10.6, cost: 5.8 },
   ];

   const channelMix = [
      { name: 'Local Mandis', value: 42, color: '#22C55E' },
      { name: 'Agri Exporters', value: 28, color: '#10B981' },
      { name: 'Retail Contracts', value: 18, color: '#F97316' },
      { name: 'Direct Farmgate', value: 12, color: '#6366F1' },
   ];

   const efficiencyMetrics = [
      { label: 'Water Use Efficiency', value: 86, target: 'Target 80%' },
      { label: 'Nutrient Balance', value: 74, target: 'Target 70%' },
      { label: 'Machinery Utilization', value: 63, target: 'Target 65%' },
      { label: 'Labor Productivity', value: 91, target: 'Target 85%' },
   ];

   const reportDownloads = [
      { name: 'Seasonal Yield Summary', updated: '25 Nov 2025', size: '2.3 MB', type: 'PDF' },
      { name: 'Input Cost Ledger', updated: '22 Nov 2025', size: '1.1 MB', type: 'CSV' },
      { name: 'Irrigation Schedule Log', updated: '21 Nov 2025', size: '895 KB', type: 'XLSX' },
      { name: 'Pest & Disease Tracker', updated: '19 Nov 2025', size: '1.8 MB', type: 'PDF' },
   ];



   return (
      <div className="space-y-8">
         <SectionHeader
            title="Reports & Analytics"
            subtitle="Monitor profitability, resource efficiency, and compliance-ready exports"
            action={
               <div className="flex gap-2">
                  <button className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                     <Filter className="w-4 h-4" /> Filters
                  </button>
                  <button className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-lg shadow-green-200 flex items-center gap-2">
                     <Download className="w-4 h-4" /> Export Dashboard
                  </button>
               </div>
            }
         />

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {overviewCards.map((card, idx) => (
               <Card key={idx} className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">{card.label}</p>
                  <div className="text-2xl font-bold text-slate-900">{card.value}</div>
                  <span
                     className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${
                        card.positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                     }`}
                  >
                     {card.change}
                  </span>
               </Card>
            ))}
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2">
               <div className="flex items-center justify-between mb-4">
                  <div>
                     <h3 className="font-bold text-slate-800">Revenue vs Inputs</h3>
                     <p className="text-xs text-slate-400">FY25-to-date</p>
                  </div>
                  <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                     <option>Monthly</option>
                     <option>Weekly</option>
                     <option>Quarterly</option>
                  </select>
               </div>
               <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                           <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="cost" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                           <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                     <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                     <YAxis stroke="#94A3B8" fontSize={12} unit=" L" />
                     <Tooltip contentStyle={{ borderRadius: 16, borderColor: '#E2E8F0' }} />
                     <Area type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2.5} fill="url(#rev)" name="Revenue (₹L)" />
                     <Area type="monotone" dataKey="cost" stroke="#0EA5E9" strokeWidth={2} fill="url(#cost)" name="Input Cost (₹L)" />
                  </AreaChart>
               </ResponsiveContainer>
            </Card>

            <Card>
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Sales channel mix</h3>
                  <span className="text-xs text-slate-400">Rolling 90 days</span>
               </div>
               <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                     <Pie
                        data={channelMix}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                        paddingAngle={2}
                     >
                        {channelMix.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
                  {channelMix.map((mix) => (
                     <div key={mix.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: mix.color }}></span>
                        {mix.name}
                        <span className="ml-auto text-slate-400">{mix.value}%</span>
                     </div>
                  ))}
               </div>
            </Card>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2">
               <div className="flex items-center justify-between mb-4">
                  <div>
                     <h3 className="font-bold text-slate-800">Compliance-ready reports</h3>
                     <p className="text-xs text-slate-400">Auto refreshed nightly</p>
                  </div>
                  <button className="text-xs font-semibold text-green-600">Create custom report</button>
               </div>
               <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                     <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase">
                        <tr>
                           <th className="p-4 text-left">Report</th>
                           <th className="p-4 text-left">Last updated</th>
                           <th className="p-4 text-left">Format</th>
                           <th className="p-4 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody>
                        {reportDownloads.map((report, idx) => (
                           <tr key={idx} className="border-t border-slate-50">
                              <td className="p-4 font-semibold text-slate-800">{report.name}</td>
                              <td className="p-4 text-slate-500">{report.updated}</td>
                              <td className="p-4 text-slate-500">{report.type} • {report.size}</td>
                              <td className="p-4 text-right">
                                 <button className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 ml-auto">
                                    <Download className="w-4 h-4" /> Download
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>

            <Card>
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Efficiency index</h3>
                  <span className="text-xs text-slate-400">Vs seasonal targets</span>
               </div>
               <div className="space-y-4">
                  {efficiencyMetrics.map((metric) => (
                     <div key={metric.label} className="flex items-center justify-between border border-slate-100 rounded-2xl p-3">
                        <div>
                           <p className="text-sm font-semibold text-slate-800">{metric.label}</p>
                           <p className="text-xs text-slate-400">{metric.target}</p>
                        </div>
                        <MiniGauge value={metric.value} max={100} color="text-green-500" track="text-slate-200" size={66}>
                           <span className="text-base font-bold text-slate-800">{metric.value}%</span>
                        </MiniGauge>
                     </div>
                  ))}
               </div>
            </Card>
         </div>


      </div>
   );
};

const AgriScorePage = () => {
   const [displayScore, setDisplayScore] = useState(0);
   
   useEffect(() => {
      let start = 0;
      const end = 82;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
         start += increment;
         if (start >= end) {
            setDisplayScore(end);
            clearInterval(timer);
         } else {
            setDisplayScore(Math.floor(start));
         }
      }, 16);
      
      return () => clearInterval(timer);
   }, []);

   const summaryCards = [
      {
         label: 'Overall AgriScore',
         value: '82 / 100',
         change: '+3.4 vs last audit',
         positive: true,
      },
      {
         label: 'Sustainability tier',
         value: 'Gold',
         change: 'meets 92% compliance',
         positive: true,
      },
      {
         label: 'Resilience outlook',
         value: 'Low risk',
         change: 'stable for 6 weeks',
         positive: true,
      },
      {
         label: 'Data confidence',
         value: '97%',
         change: 'all sensors syncing',
         positive: true,
      },
   ];

   const scoreBreakdown = [
      { name: 'Field health', score: 84, benchmark: 78 },
      { name: 'Resource use', score: 79, benchmark: 74 },
      { name: 'Climate impact', score: 88, benchmark: 80 },
      { name: 'Compliance', score: 91, benchmark: 85 },
      { name: 'Supply readiness', score: 76, benchmark: 70 },
   ];

   const sustainabilityPillars = [
      {
         label: 'Water stewardship',
         value: 86,
         detail: 'Deficit irrigation in place',
         status: 'Stable',
         change: '+2.1 pts',
         trend: 'Conserving 18% more vs LY',
         gaugeColor: 'text-emerald-500',
         barColor: 'bg-emerald-500',
         accent: 'bg-emerald-50',
      },
      {
         label: 'Soil vitality',
         value: 79,
         detail: 'Microbial balance trending up',
         status: 'Improving',
         change: '+1.4 pts',
         trend: 'Compost program in progress',
         gaugeColor: 'text-lime-500',
         barColor: 'bg-lime-500',
         accent: 'bg-lime-50',
      },
      {
         label: 'Carbon intensity',
         value: 68,
         detail: 'Needs cover crop expansion',
         status: 'Attention',
         change: '-0.6 pts',
         trend: 'Offset plan pending',
         gaugeColor: 'text-amber-500',
         barColor: 'bg-amber-500',
         accent: 'bg-amber-50',
      },
      {
         label: 'Input efficiency',
         value: 92,
         detail: 'Optimized fertigation',
         status: 'Leading',
         change: '+3.8 pts',
         trend: 'Auto dosing covers 90%',
         gaugeColor: 'text-emerald-500',
         barColor: 'bg-emerald-500',
         accent: 'bg-emerald-50',
      },
   ];

   const certifications = [
      { name: 'FSSAI exporter credential', status: 'Valid till Mar 2026', score: '98%', accent: 'text-green-600', icon: Shield },
      { name: 'Global GAP checklist', status: 'Audit scheduled 12 Dec', score: 'In review', accent: 'text-amber-600', icon: Globe },
      { name: 'Carbon smart farming', status: 'Pilot cohort', score: 'Pending data', accent: 'text-slate-500', icon: Award },
   ];

   const auditTimeline = [
      { title: 'Soil regeneration audit', due: '28 Nov • Field cluster B', owner: 'Sustainability PMO', status: 'Ready' },
      { title: 'ESG lender attestation', due: '02 Dec • Virtual', owner: 'Finance Ops', status: 'Docs in draft' },
      { title: 'Carbon registry sync', due: '06 Dec • API push', owner: 'Data Services', status: 'Awaiting samples' },
   ];

   const riskAlerts = [
      { label: 'Nitrogen overuse window', impact: 'Could reduce score by 4 pts', severity: 'Monitor closely' },
      { label: 'Irrigation schedule variance', impact: '2 pivots skipped last week', severity: 'Investigate' },
      { label: 'Field sensor downtime', impact: 'Block C offline 3 hrs', severity: 'Resolved' },
   ];

   const actionItems = [
      { task: 'Deploy biochar trial plots', owner: 'R&D Crew', eta: 'Next 10 days', progress: 45 },
      { task: 'Digitize pesticide logbooks', owner: 'Compliance', eta: 'Due this week', progress: 68 },
      { task: 'Automate soil sample ingestion', owner: 'Data Team', eta: 'Sprint 47', progress: 22 },
   ];

   return (
      <div className="space-y-8">
         {/* Header with Gradient Text */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                  <div className="p-3 bg-emerald-900 rounded-2xl text-emerald-400 shadow-lg shadow-emerald-900/20">
                     <Activity className="w-8 h-8" />
                  </div>
                  <span>Agri<span className="text-emerald-600">Score</span></span>
               </h1>
               <p className="text-slate-500 font-medium mt-2 ml-1">Live ESG & Resilience Intelligence</p>
            </div>
            <div className="flex gap-3">
               <button className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Configure
               </button>
               <button className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all flex items-center gap-2">
                  <Download className="w-4 h-4" /> Export Report
               </button>
            </div>
         </div>

         {/* Hero Score Card */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 group flex flex-col justify-between">
               {/* Background Effects - Lighter & Subtler */}
               <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-emerald-50 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none opacity-60"></div>
               <div className="absolute bottom-0 left-0 w-[20rem] h-[20rem] bg-blue-50 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none opacity-60"></div>
               
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 mb-8">
                  {/* Score Circle - Clean & Modern */}
                  <div className="relative w-40 h-40 flex-shrink-0">
                     {/* Background Circle */}
                     <div className="absolute inset-0 rounded-full border-[10px] border-slate-50"></div>
                     
                     <svg className="w-full h-full transform -rotate-90">
                        <circle 
                           cx="80" cy="80" r="70" 
                           stroke="url(#scoreGradientClean)" 
                           strokeWidth="10" 
                           fill="transparent" 
                           strokeDasharray={440} 
                           strokeDashoffset={440 - (440 * displayScore) / 100} 
                           strokeLinecap="round"
                           className="transition-all duration-1000 ease-out drop-shadow-md"
                        />
                        <defs>
                           <linearGradient id="scoreGradientClean" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#059669" />
                           </linearGradient>
                        </defs>
                     </svg>
                     
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black tracking-tighter text-slate-900">{displayScore}</span>
                        <div className="flex items-center gap-1 mt-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                           <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                           <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Excellent</span>
                        </div>
                     </div>
                  </div>
                  
                  {/* Metrics Grid - Cards Style */}
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {[
                        { label: 'Sustainability Tier', value: 'Gold Standard', sub: '92% Match', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                        { label: 'Resilience Outlook', value: 'Low Risk', sub: 'Stable State', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                        { label: 'Data Confidence', value: '97% Score', sub: 'Live Sync', icon: Wifi, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                        { label: 'Next Audit', value: '22 Days Left', sub: 'Due Feb 22', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                     ].map((item, i) => (
                        <div key={i} className={`bg-white rounded-2xl p-4 border ${item.border} shadow-sm hover:shadow-md transition-all group/card cursor-pointer relative overflow-hidden`}>
                           <div className={`absolute top-0 right-0 w-16 h-16 ${item.bg} rounded-bl-[3rem] opacity-50 transition-transform group-hover/card:scale-110`}></div>
                           
                           <div className="relative z-10">
                              <div className="flex items-start justify-between mb-2">
                                  <div className={`p-2 rounded-xl ${item.bg} ${item.color} shadow-sm`}>
                                      <item.icon className="w-5 h-5" />
                                  </div>
                              </div>
                              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{item.label}</p>
                              <div className="flex items-end justify-between">
                                 <p className="text-lg font-black text-slate-900 tracking-tight leading-none">{item.value}</p>
                                 <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${item.bg} ${item.color}`}>{item.sub}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               
               {/* Footer Insight */}
               <div className="relative z-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 animate-pulse">
                        <SparklesIcon className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Insight</p>
                        <p className="text-sm font-bold text-slate-700">Score trending up <span className="text-emerald-600">5%</span> due to improved soil health in North Zone.</p>
                     </div>
                  </div>
                  <button className="hidden sm:flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                     View Analysis <ArrowUp className="w-3 h-3 ml-1" />
                  </button>
               </div>
            </div>

            {/* Quick Actions / Certifications */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
               <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 text-lg">
                  <Award className="w-6 h-6 text-emerald-600" /> Certifications
               </h3>
               <div className="space-y-4 flex-1">
                  {certifications.map((item, idx) => (
                     <div key={idx} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-pointer hover:shadow-sm">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${idx === 0 ? 'bg-emerald-100 text-emerald-600' : idx === 1 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                           <item.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                           <p className="text-xs text-slate-500 truncate font-medium mt-0.5">{item.status}</p>
                        </div>
                        <div className={`text-xs font-black px-2.5 py-1.5 rounded-xl ${idx === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
                           {item.score}
                        </div>
                     </div>
                  ))}
               </div>
               <button className="w-full mt-4 py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-xs hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all uppercase tracking-wide">
                  + Add Certification
               </button>
            </div>
         </div>

         {/* Charts & Breakdown */}
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
               <div className="flex items-center justify-between mb-8">
                  <div>
                     <h3 className="font-black text-slate-900 text-lg">Score Contributors</h3>
                     <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wide">Weighted pillars vs peer benchmark</p>
                  </div>
                  <div className="flex gap-3">
                     <span className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div> You
                     </span>
                     <span className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div> Peers
                     </span>
                  </div>
               </div>
               <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={scoreBreakdown} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#94A3B8" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} />
                        <Tooltip 
                           cursor={{ fill: '#F8FAFC' }}
                           contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', padding: '12px' }}
                        />
                        <Bar dataKey="score" radius={[8, 8, 8, 8]} fill="#10B981" />
                        <Bar dataKey="benchmark" radius={[8, 8, 8, 8]} fill="#E2E8F0" />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
               <h3 className="font-black text-slate-900 mb-6 text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" /> Risk Watchlist
               </h3>
               <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {riskAlerts.map((risk, idx) => (
                     <div key={idx} className="p-5 rounded-2xl bg-red-50/50 border border-red-100 hover:shadow-md transition-all group cursor-pointer">
                        <div className="flex items-start gap-4">
                           <div className="p-2.5 bg-white rounded-xl shadow-sm text-red-500 group-hover:scale-110 transition-transform">
                              <AlertTriangle className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-900">{risk.label}</p>
                              <p className="text-xs text-red-600 font-bold mt-1">{risk.impact}</p>
                              <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-lg bg-white border border-red-100 text-[10px] font-black text-red-500 uppercase tracking-wide shadow-sm">
                                 {risk.severity}
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Pillars Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {sustainabilityPillars.map((pillar, idx) => (
               <div key={idx} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                  <div className="flex justify-between items-start mb-6">
                     <div className={`p-4 rounded-2xl ${pillar.accent} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                        {idx === 0 ? <Droplets className={`w-7 h-7 ${pillar.gaugeColor}`} /> :
                         idx === 1 ? <Sprout className={`w-7 h-7 ${pillar.gaugeColor}`} /> :
                         idx === 2 ? <Cloud className={`w-7 h-7 ${pillar.gaugeColor}`} /> :
                         <Zap className={`w-7 h-7 ${pillar.gaugeColor}`} />}
                     </div>
                     <span className={`text-xs font-black px-3 py-1.5 rounded-xl ${pillar.value >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {pillar.change}
                     </span>
                  </div>
                  
                  <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{pillar.label}</h4>
                  <div className="flex items-end gap-2 mb-4">
                     <span className="text-4xl font-black text-slate-900 tracking-tight">{pillar.value}</span>
                     <span className="text-sm font-bold text-slate-400 mb-1.5">/100</span>
                  </div>
                  
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                     <div className={`h-full rounded-full ${pillar.barColor} transition-all duration-1000`} style={{ width: `${pillar.value}%` }}></div>
                  </div>
                  
                  <p className="text-xs font-bold text-slate-500">{pillar.detail}</p>
               </div>
            ))}
         </div>

         {/* Roadmap & Audit Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Improvement Roadmap */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-slate-900 flex items-center gap-3 text-lg">
                     <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                        <Zap className="w-5 h-5" />
                     </div>
                     Improvement Roadmap
                  </h3>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">Next 30 Days</span>
               </div>
               <div className="space-y-5">
                  {actionItems.map((task, idx) => (
                     <div key={idx} className="group p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                           <span className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{task.task}</span>
                           <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg group-hover:bg-white border border-transparent group-hover:border-slate-100">{task.eta}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                           <span className="font-medium">Owner: <span className="font-bold text-slate-700">{task.owner}</span></span>
                           <span className="font-black text-emerald-600">{task.progress}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-sm" style={{ width: `${task.progress}%` }}></div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Audit Timeline */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-slate-900 flex items-center gap-3 text-lg">
                     <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                        <Calendar className="w-5 h-5" />
                     </div>
                     Audit Timeline
                  </h3>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">Sync Calendar</button>
               </div>
               
               <div className="relative space-y-0 ml-4">
                  {/* Continuous Line */}
                  <div className="absolute top-4 bottom-4 left-[5px] w-0.5 bg-slate-100"></div>

                  {auditTimeline.map((event, idx) => (
                     <div key={idx} className="relative pl-10 pb-8 last:pb-0 group">
                        {/* Timeline Dot */}
                        <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-white border-[3px] border-slate-300 group-hover:border-blue-500 group-hover:scale-125 transition-all z-10 shadow-sm"></div>
                        
                        {/* Card Content */}
                        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-slate-200/50 transition-all cursor-pointer relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-100 to-transparent rounded-bl-full opacity-50 transition-all group-hover:scale-150"></div>
                           
                           <div className="relative z-10">
                              <div className="flex justify-between items-start mb-2">
                                 <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors">{event.title}</h4>
                                 <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide shadow-sm ${
                                    event.status === 'Ready' ? 'bg-emerald-100 text-emerald-600' : 
                                    event.status === 'Docs in draft' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'
                                 }`}>
                                    {event.status}
                                 </span>
                              </div>
                              
                              <p className="text-xs font-bold text-slate-500 mb-4 flex items-center gap-2">
                                 <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                 {event.due}
                              </p>
                              
                              <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                       <UserIcon className="w-3 h-3" />
                                    </div>
                                    {event.owner}
                                 </div>
                                 <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
};


// --- Page Components ---

const TaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState('All');
  
  useEffect(() => {
    // Fetch tasks
    api.getTasks().then(data => {
        setTasks(data);
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
                    <div className="text-center py-4 text-slate-400 text-sm">No task</div>
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

  const LAT = 22.88;
  const LON = 88.02;

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
                          <span className="text-sm font-bold tracking-wide">TARAKESWAR, WEST BENGAL</span>
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
   const [preferences, setPreferences] = useState({
      notifications: true,
      autoIrrigation: false,
      darkMode: false,
      timezone: 'IST (GMT+05:30)',
      contactTime: '09:00',
      language: 'English',
   });

  const devices = [
    { id: 1, name: 'Node-WZ-01', type: 'Sensor Node', status: 'Online', battery: 98, location: 'North Field' },
    { id: 2, name: 'Node-WZ-02', type: 'Sensor Node', status: 'Maintenance', battery: 12, location: 'North Field' },
   { id: 3, name: 'Node-RS-01', type: 'Weather Station', status: 'Offline', battery: 95, location: 'River Side' },
    { id: 4, name: 'Node-HT-01', type: 'Gateway', status: 'Offline', battery: 0, location: 'Hilltop' },
      { id: 5, name: 'Pump-Controller-A', type: 'Actuator', status: 'Offline', battery: 100, location: 'Pump House' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
       <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-8 text-white shadow-2xl isolate">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-58197bd47d26?q=80&w=2071&auto=format&fit=crop')] opacity-10 mix-blend-overlay bg-cover bg-center"></div>
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          
          <div className="relative z-10">
             <h1 className="text-3xl font-black tracking-tight mb-2 drop-shadow-lg">Farm Settings</h1>
             <p className="text-emerald-100/80 text-base font-medium max-w-2xl">Configure your farm's digital twin, manage IoT device networks, and customize your dashboard experience.</p>
          </div>
       </div>
       
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2 relative z-10">
                   <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                      <Sprout className="w-4 h-4" />
                   </div>
                   Farm Details
                </h3>
                <div className="space-y-4 relative z-10">
                   <div className="group/input">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 group-focus-within/input:text-emerald-600 transition-colors">Farm Name</label>
                      <input type="text" defaultValue="Green Valley Estates" className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-sm" />
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="group/input">
                         <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 group-focus-within/input:text-emerald-600 transition-colors">Latitude</label>
                         <input type="text" defaultValue="22.68" className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-sm" />
                      </div>
                      <div className="group/input">
                         <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 group-focus-within/input:text-emerald-600 transition-colors">Longitude</label>
                         <input type="text" defaultValue="88.38" className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-sm" />
                      </div>
                   </div>
                   <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all transform active:scale-95">Save Changes</button>
                </div>
             </div>
             
             <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 relative overflow-hidden">
                <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
                   <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <Settings className="w-4 h-4" />
                   </div>
                   Preferences
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                         <Bell className="w-4 h-4 text-slate-400" />
                         <span className="text-sm font-bold text-slate-700">Notifications</span>
                      </div>
                      <Toggle
                         enabled={preferences.notifications}
                         onChange={(value) => setPreferences((prev) => ({ ...prev, notifications: value }))}
                      />
                   </div>
                   <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                         <Droplets className="w-4 h-4 text-slate-400" />
                         <span className="text-sm font-bold text-slate-700">Auto-Irrigation</span>
                      </div>
                      <Toggle
                         enabled={preferences.autoIrrigation}
                         onChange={(value) => setPreferences((prev) => ({ ...prev, autoIrrigation: value }))}
                      />
                   </div>
                   <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                         <Moon className="w-4 h-4 text-slate-400" />
                         <span className="text-sm font-bold text-slate-700">Dark Mode</span>
                      </div>
                      <Toggle
                         enabled={preferences.darkMode}
                         onChange={(value) => setPreferences((prev) => ({ ...prev, darkMode: value }))}
                      />
                   </div>
                   <div className="pt-3 border-t border-slate-100">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Timezone</label>
                      <div className="relative">
                         <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                         <select value={preferences.timezone} onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer hover:bg-white">
                            <option>IST (GMT+05:30)</option>
                            <option>UTC (GMT+00:00)</option>
                            <option>EST (GMT-05:00)</option>
                         </select>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="lg:col-span-2">
             <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                   <div>
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                         <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Wifi className="w-4 h-4" />
                         </div>
                         Connected Devices
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 ml-10">Manage your IoT sensor network</p>
                   </div>
                   <button className="text-xs font-bold text-white bg-emerald-600 px-4 py-2.5 rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center transform active:scale-95">
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Add New Device
                   </button>
                </div>
                
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/30 flex-1">
                   {devices.map(device => (
                      <div key={device.id} className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-bl-full -mr-4 -mt-4 transition-colors group-hover:from-emerald-50 group-hover:to-teal-50"></div>
                         
                         <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-3">
                               <div className={`p-2.5 rounded-xl ${
                                  device.status === 'Online' ? 'bg-emerald-100 text-emerald-600' : 
                                  device.status === 'Offline' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                               }`}>
                                  {device.status === 'Online' && <Wifi className="w-5 h-5" />}
                                  {device.status === 'Offline' && <WifiOff className="w-5 h-5" />}
                                  {device.status === 'Maintenance' && <AlertTriangle className="w-5 h-5" />}
                               </div>
                               <div>
                                  <h4 className="font-black text-slate-900 text-sm">{device.name}</h4>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: #{device.id.toString().padStart(4, '0')}</p>
                               </div>
                            </div>
                            <div className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${
                               device.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 
                               device.status === 'Offline' ? 'bg-red-500' : 'bg-amber-500'
                            }`}></div>
                         </div>

                         <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                            <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-100 flex items-center gap-1">
                               <Activity className="w-3 h-3 text-slate-400" /> {device.type}
                            </span>
                            <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-100 flex items-center gap-1">
                               <MapPin className="w-3 h-3 text-slate-400" /> {device.location}
                            </span>
                         </div>

                         <div className="flex items-center justify-between pt-3 border-t border-slate-50 relative z-10">
                            <div className="flex items-center gap-2">
                               <div className={`p-1 rounded-md ${device.battery < 20 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                  <Battery className="w-3.5 h-3.5" />
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Battery</span>
                                  <span className={`text-xs font-black ${device.battery < 20 ? 'text-red-500' : 'text-slate-700'}`}>{device.battery}%</span>
                               </div>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                               <MoreHorizontal className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                   ))}
                   
                   {/* Add New Placeholder Card */}
                   <button className="group flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all min-h-[160px]">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors mb-3">
                         <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-slate-500 group-hover:text-emerald-700">Link New Device</span>
                   </button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [commPrefs, setCommPrefs] = useState({ alerts: true, advisory: false, whatsapp: true });
  const [securityPrefs, setSecurityPrefs] = useState({ twoFactor: true, biometrics: false, loginAlerts: true });
  const { profile, updateProfile, uploadAvatar, userName, userEmail, userAvatar } = useProfile();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [farmName, setFarmName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [preferences, setPreferences] = useState({
    autoIrrigation: true,
    darkMode: false,
    timezone: 'IST (GMT+05:30)',
    language: 'English (India)',
    preferredContactTime: '08:00 – 12:00 IST'
  });

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

  // Sync profile data to form inputs
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setAvatarUrl(profile.avatar_url || '');
      setFarmName(profile.farm_name || '');
      
      setCommPrefs({
        alerts: profile.alerts_enabled ?? true,
        advisory: profile.advisory_enabled ?? false,
        whatsapp: profile.whatsapp_enabled ?? true
      });
      
      setSecurityPrefs({
        twoFactor: profile.two_factor_enabled ?? false,
        biometrics: profile.biometrics_enabled ?? false,
        loginAlerts: profile.login_alerts_enabled ?? true
      });
      
      setPreferences({
        autoIrrigation: profile.auto_irrigation ?? true,
        darkMode: profile.dark_mode ?? false,
        timezone: profile.timezone || 'IST (GMT+05:30)',
        language: profile.language || 'English (India)',
        preferredContactTime: profile.preferred_contact_time || '08:00 – 12:00 IST'
      });
    }
  }, [profile]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'subscription', label: 'Billing & Plans', icon: CreditCard },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const quickStats = [
     { label: 'Plan tier', value: 'Pro', detail: 'Renews 22 Nov' },
     { label: 'Farms linked', value: '08', detail: 'West Bengal cluster' },
     { label: 'Usage this month', value: '72%', detail: 'Data & automation' },
     { label: 'Last sync', value: 'Live', detail: 'All devices healthy' },
  ];

  const profileHighlights = [
     { label: 'Certified acreage', value: '1,200 ac' },
     { label: 'Preferred advisor', value: 'AgriScore Prime' },
     { label: 'Support SLA', value: '<4 hrs' },
  ];

  const documents = [
     { name: 'KYC Verification.pdf', status: 'Verified', updated: '12 Oct 2025' },
     { name: 'Land Ownership Registry', status: 'Pending review', updated: '08 Nov 2025' },
     { name: 'Bank Mandate Letter', status: 'Uploaded', updated: '18 Sep 2025' },
  ];

  const activityTimeline = [
     { title: 'Updated farm boundaries', time: 'Today • 10:15 AM', tag: 'Geomatics' },
     { title: 'Invited agronomist Anita', time: 'Yesterday • 8:42 PM', tag: 'Team' },
     { title: 'Downloaded subsidy dossier', time: '22 Nov • 4:05 PM', tag: 'Compliance' },
  ];

  const integrationCatalog = [
     { name: 'Weather API (IMD)', status: 'Connected', sync: '45 min ago', icon: Cloud },
     { name: 'Tractor telematics', status: 'Sync issue', sync: 'Needs re-auth', icon: Layers },
     { name: 'Market price feed', status: 'Connected', sync: 'Live', icon: IndianRupee },
     { name: 'Accounting (Tally)', status: 'In sandbox', sync: 'Setup pending', icon: BookOpen },
  ];

  const apiTokens = [
     { name: 'Field Ops App', created: '05 Dec 2025', lastUsed: '2 days ago', scope: 'read:fields write:tasks' },
     { name: 'Partner Coop', created: '18 Dec 2025', lastUsed: '6 hours ago', scope: 'read:analytics' },
  ];

  const commPrefList = [
     { key: 'alerts', label: 'Critical agronomy alerts', desc: 'SMS + push notifications' },
     { key: 'advisory', label: 'Monthly advisory brief', desc: 'Email digest every 30th' },
     { key: 'whatsapp', label: 'WhatsApp updates', desc: 'Weather nudges & ticket updates' },
  ];

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMessage('');
    const { error } = await updateProfile({
      full_name: fullName,
      email,
      phone,
      location,
      farm_name: farmName,
      alerts_enabled: commPrefs.alerts,
      advisory_enabled: commPrefs.advisory,
      whatsapp_enabled: commPrefs.whatsapp,
      two_factor_enabled: securityPrefs.twoFactor,
      biometrics_enabled: securityPrefs.biometrics,
      login_alerts_enabled: securityPrefs.loginAlerts,
      auto_irrigation: preferences.autoIrrigation,
      dark_mode: preferences.darkMode,
      timezone: preferences.timezone,
      language: preferences.language,
      preferred_contact_time: preferences.preferredContactTime
    });
    if (error) {
      setSaveMessage(`Error: ${error}`);
    } else {
      setSaveMessage('Profile saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    const { url, error } = await uploadAvatar(file);
    if (error) {
      setSaveMessage(`Error uploading image: ${error}`);
    } else {
      setAvatarUrl(url || '');
      setSaveMessage('Profile picture uploaded successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
    setSaving(false);
  };

  // Auto-save profile changes with debounce
  useEffect(() => {
    if (!profile) return; // Don't auto-save if profile not loaded yet

    const timer = setTimeout(() => {
      if (
        fullName !== profile.full_name ||
        email !== profile.email ||
        phone !== profile.phone ||
        location !== profile.location ||
        farmName !== profile.farm_name ||
        JSON.stringify(commPrefs) !== JSON.stringify({
          alerts: profile.alerts_enabled,
          advisory: profile.advisory_enabled,
          whatsapp: profile.whatsapp_enabled
        }) ||
        JSON.stringify(securityPrefs) !== JSON.stringify({
          twoFactor: profile.two_factor_enabled,
          biometrics: profile.biometrics_enabled,
          loginAlerts: profile.login_alerts_enabled
        }) ||
        JSON.stringify(preferences) !== JSON.stringify({
          autoIrrigation: profile.auto_irrigation,
          darkMode: profile.dark_mode,
          timezone: profile.timezone,
          language: profile.language,
          preferredContactTime: profile.preferred_contact_time
        })
      ) {
        handleSaveProfile();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [fullName, email, phone, location, farmName, commPrefs, securityPrefs, preferences]);

  return (
    <div className="space-y-0 -mt-8 -mx-8 pb-8">
       {/* Hero Section with Image Carousel Background */}
       <div className="relative overflow-hidden px-6 pt-6 pb-24 mb-8">
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
            {/* Overlays for readability */}
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto">
             <div className="flex items-center justify-between mb-4">
                <div>
                   <h1 className="text-2xl font-black text-white mb-1 tracking-tight drop-shadow-lg">Account Center</h1>
                   <p className="text-emerald-100/80 text-xs font-medium drop-shadow-md">Manage your profile, preferences, and billing</p>
                </div>
                {saveMessage && (
                   <div className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl shadow-lg ${
                      saveMessage.includes('Error') 
                         ? 'bg-red-500/20 text-red-200 border border-red-400/30' 
                         : 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                   }`}>
                      {saveMessage}
                   </div>
                )}
             </div>

             {/* Profile Hero Card */}
             <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-2xl">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                   {/* Avatar with Glow Effect */}
                   <div className="relative group/avatar">
                      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full opacity-75 group-hover/avatar:opacity-100 blur-xl transition duration-500"></div>
                      <div className="relative">
                         {avatarUrl ? (
                            <img src={avatarUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover ring-4 ring-black/50 shadow-2xl" />
                         ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-3xl font-black text-white ring-4 ring-black/50 shadow-inner">
                               {fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                            </div>
                         )}
                         <label className="absolute bottom-1 right-1 p-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full cursor-pointer hover:scale-110 transition-transform shadow-xl border border-white/20 group-hover/avatar:rotate-12">
                            <Camera className="w-4 h-4" />
                            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={saving} />
                         </label>
                      </div>
                   </div>

                   {/* Profile Info */}
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                         <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">{fullName || 'Your Name'}</h2>
                         <span className="px-2.5 py-1 bg-gradient-to-r from-amber-300 to-amber-500 text-amber-950 text-[10px] font-black uppercase rounded-full shadow-lg shadow-amber-500/20 border border-amber-200/50">
                            <Star className="w-2.5 h-2.5 inline mr-1 fill-amber-900" />Pro
                         </span>
                      </div>
                      <p className="text-emerald-100/80 text-sm mb-3 font-medium drop-shadow-sm">{email || userEmail}</p>
                      <div className="flex flex-wrap gap-2">
                         <div className="px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/40 transition-colors">
                            <span className="text-emerald-100 text-xs font-bold tracking-wide">📍 {location || 'Tarakeswar'}</span>
                         </div>
                         <div className="px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/40 transition-colors">
                            <span className="text-emerald-100 text-xs font-bold tracking-wide">🌾 {farmName || 'All Set Complete'}</span>
                         </div>
                         {profile?.created_at && (
                            <div className="px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/40 transition-colors">
                               <span className="text-emerald-100 text-xs font-bold tracking-wide">🎂 Joined 15th Nov, 2025</span>
                            </div>
                         )}
                      </div>
                   </div>

                   {/* Quick Actions */}
                   <button 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-5 py-2.5 bg-white text-emerald-950 hover:bg-emerald-50 font-black rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-white/10 transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                   >
                      {saving ? (
                         <div className="w-4 h-4 border-2 border-emerald-900/30 border-t-emerald-900 rounded-full animate-spin" />
                      ) : (
                         <Save className="w-4 h-4" />
                      )}
                      Save Changes
                   </button>
                </div>
             </div>
          </div>
       </div>

       {/* Main Content Area */}
       <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
          {/* Stats Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
             {quickStats.map((stat, idx) => (
                <div key={idx} className="group relative bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <div className="relative">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
                      <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                      <p className="text-xs text-slate-500 font-medium">{stat.detail}</p>
                   </div>
                </div>
             ))}
          </div>

          {/* Horizontal Tabs Navigation */}
          <div className="bg-white rounded-2xl p-2 shadow-lg mb-8 border border-slate-100">
             <div className="flex overflow-x-auto scrollbar-hide gap-2">
                {tabs.map(tab => (
                   <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                         activeTab === tab.id
                            ? 'bg-emerald-900 text-white shadow-lg shadow-emerald-900/20'
                            : 'text-slate-600 hover:bg-slate-50'
                      }`}
                   >
                      <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-400'}`} />
                      {tab.label}
                   </button>
                ))}
             </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
             {activeTab === 'profile' && (
                <div className="space-y-6">
                   {/* Profile Highlights Bento */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {profileHighlights.map((item, idx) => (
                         <div key={item.label} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full filter blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative">
                               <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">{item.label}</p>
                               <p className="text-2xl font-black text-slate-900">{item.value}</p>
                            </div>
                         </div>
                      ))}
                   </div>

                   {/* Form Section - Premium Cards */}
                   <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
                      <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                         <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
                         Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-5">
                            <div className="group">
                               <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 group-focus-within:text-emerald-700 transition-colors">Full Name</label>
                               <div className="relative">
                                  <UserIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                  <input 
                                     type="text" 
                                     value={fullName} 
                                     onChange={(e) => setFullName(e.target.value)} 
                                     className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                     placeholder="Enter your full name"
                                  />
                               </div>
                            </div>
                            <div className="group">
                               <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 group-focus-within:text-emerald-700 transition-colors">Email Address</label>
                               <div className="relative">
                                  <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                  <input 
                                     type="email" 
                                     value={email} 
                                     onChange={(e) => setEmail(e.target.value)} 
                                     className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                     placeholder="you@example.com"
                                  />
                               </div>
                            </div>
                            <div className="group">
                               <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 group-focus-within:text-emerald-700 transition-colors">Phone Number</label>
                               <div className="relative">
                                  <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                  <input 
                                     type="tel" 
                                     value={phone} 
                                     onChange={(e) => setPhone(e.target.value)} 
                                     className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                     placeholder="+91 98765 43210"
                                  />
                               </div>
                            </div>
                         </div>
                         <div className="space-y-5">
                            <div className="group">
                               <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 group-focus-within:text-emerald-700 transition-colors">Location</label>
                               <div className="relative">
                                  <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                  <input 
                                     type="text" 
                                     value={location} 
                                     onChange={(e) => setLocation(e.target.value)} 
                                     className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                     placeholder="City, State"
                                  />
                               </div>
                            </div>
                            <div className="group">
                               <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 group-focus-within:text-emerald-700 transition-colors">Farm Name</label>
                               <div className="relative">
                                  <Sprout className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                  <input 
                                     type="text" 
                                     value={farmName} 
                                     onChange={(e) => setFarmName(e.target.value)} 
                                     className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                     placeholder="Your Farm Name"
                                  />
                               </div>
                            </div>
                            <div className="group">
                               <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 group-focus-within:text-emerald-700 transition-colors">Language</label>
                               <div className="relative">
                                  <Globe className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                  <select 
                                     value={preferences.language} 
                                     onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))} 
                                     className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                                  >
                                     <option>English (India)</option>
                                     <option>Hindi</option>
                                     <option>Punjabi</option>
                                  </select>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Verification Badges */}
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                         { label: 'Kisan ID', value: 'WB-45-9821', verified: true, icon: BadgeCheck },
                         { label: 'PAN / GST', value: 'ABCPK1234F', verified: true, icon: FileCheck },
                         { label: 'Subsidy wallet', value: '₹3.2L available', verified: false, icon: IndianRupee },
                      ].map((item) => (
                         <div key={item.label} className={`group relative bg-gradient-to-br ${item.verified ? 'from-emerald-50 to-teal-50' : 'from-amber-50 to-orange-50'} rounded-2xl p-5 border-2 ${item.verified ? 'border-emerald-200' : 'border-amber-200'} hover:scale-105 transition-transform`}>
                            <div className="flex items-start justify-between mb-2">
                               <p className="text-xs font-black text-slate-600 uppercase tracking-wider">{item.label}</p>
                               <item.icon className={`w-5 h-5 ${item.verified ? 'text-emerald-600' : 'text-amber-600'}`} />
                            </div>
                            <p className="text-lg font-black text-slate-900">{item.value}</p>
                            {!item.verified && (
                               <button className="mt-2 text-xs font-bold text-amber-700 hover:text-amber-800 underline">
                                  Complete verification →
                               </button>
                            )}
                         </div>
                      ))}
                   </div>

                   {/* Bottom Cards Grid */}
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Communication Preferences */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                         <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-emerald-600" />
                            Communication
                         </h3>
                         <p className="text-xs text-slate-500 mb-5">Manage notification preferences</p>
                         <div className="space-y-4">
                            {commPrefList.map((pref) => (
                               <div key={pref.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                  <div className="flex-1">
                                     <p className="text-sm font-bold text-slate-900">{pref.label}</p>
                                     <p className="text-xs text-slate-500">{pref.desc}</p>
                                  </div>
                                  <Toggle
                                     enabled={commPrefs[pref.key as keyof typeof commPrefs]}
                                     onChange={(value) =>
                                        setCommPrefs((prev) => ({ ...prev, [pref.key as keyof typeof commPrefs]: value }))
                                     }
                                  />
                               </div>
                            ))}
                         </div>
                      </div>

                      {/* Document Locker */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                         <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-emerald-600" />
                            Document Locker
                         </h3>
                         <p className="text-xs text-slate-500 mb-5">Your verified documents</p>
                         <div className="space-y-3">
                            {documents.map((doc, idx) => (
                               <div key={idx} className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-3">
                                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                     <p className="text-sm font-bold text-slate-900 truncate">{doc.name}</p>
                                     <p className="text-xs text-slate-500">Updated {doc.updated}</p>
                                  </div>
                                  <span className={`text-[10px] font-black px-2 py-1 rounded-full whitespace-nowrap ${
                                     doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 
                                     doc.status === 'Pending review' ? 'bg-amber-100 text-amber-700' : 
                                     'bg-slate-200 text-slate-700'
                                  }`}>
                                     {doc.status}
                                  </span>
                               </div>
                            ))}
                            <button 
                               onClick={() => document.getElementById('doc-upload')?.click()} 
                               className="w-full mt-3 py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                            >
                               <Upload className="w-4 h-4" /> Upload Document
                            </button>
                            <input
                               id="doc-upload"
                               type="file"
                               className="hidden"
                               onChange={async (e) => {
                                 const file = e.target.files?.[0];
                                 if (file && profile) {
                                   try {
                                     const fileName = `${Date.now()}_${file.name}`;
                                     const { error } = await supabase.storage.from('documents').upload(`${profile.id}/${fileName}`, file);
                                     if (error) throw error;
                                     alert('Document uploaded successfully!');
                                   } catch (err) {
                                     alert('Failed to upload document: ' + (err instanceof Error ? err.message : 'Unknown error'));
                                   }
                                 }
                               }}
                            />
                         </div>
                      </div>

                      {/* Activity Timeline */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                         <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-emerald-600" />
                            Recent Activity
                         </h3>
                         <p className="text-xs text-slate-500 mb-5">Your latest account actions</p>
                         <div className="space-y-3">
                            {activityTimeline.map((item, idx) => (
                               <div key={idx} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs group-hover:scale-110 transition-transform flex-shrink-0">
                                     {idx + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <p className="text-sm font-bold text-slate-900">{item.title}</p>
                                     <p className="text-xs text-slate-500">{item.time}</p>
                                     <span className="inline-block text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">{item.tag}</span>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                   <div className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-8 text-white overflow-hidden shadow-2xl border border-emerald-800/50">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full filter blur-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full filter blur-3xl"></div>
                      <div className="relative">
                         <div className="flex items-center justify-between mb-6">
                            <div>
                               <div className="flex items-center gap-2 mb-2">
                                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                                  <span className="text-xs font-black uppercase tracking-wider text-emerald-200">Current Plan</span>
                               </div>
                               <h2 className="text-4xl font-black mb-1 tracking-tight">Pro Plan</h2>
                               <p className="text-emerald-200/80 text-sm font-medium">Next billing • 25 Dec, 2025</p>
                            </div>
                            <div className="text-right">
                               <div className="text-5xl font-black tracking-tight">₹2,499</div>
                               <div className="text-sm text-emerald-200/80 font-medium">/month</div>
                            </div>
                         </div>
                         <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                            <div>
                               <div className="text-2xl font-black mb-1">1,200</div>
                               <div className="text-xs text-emerald-200/60 uppercase tracking-wider font-bold">Acres Managed</div>
                            </div>
                            <div>
                               <div className="text-2xl font-black mb-1">15</div>
                               <div className="text-xs text-emerald-200/60 uppercase tracking-wider font-bold">Team Members</div>
                            </div>
                            <div>
                               <div className="text-2xl font-black mb-1">50GB</div>
                               <div className="text-xs text-emerald-200/60 uppercase tracking-wider font-bold">Data Storage</div>
                            </div>
                         </div>
                         <button className="mt-6 w-full py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-black/20">
                            Upgrade Plan
                         </button>
                      </div>
                   </div>

                   {/* Payment Methods */}
                   <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                      <h3 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
                         <CreditCard className="w-5 h-5 text-emerald-600" />
                         Payment Methods
                      </h3>
                      <div className="flex items-center justify-between p-5 border-2 border-slate-200 rounded-2xl hover:border-emerald-300 transition-colors bg-gradient-to-r from-slate-50 to-slate-100">
                         <div className="flex items-center gap-4">
                            <div className="w-14 h-10 bg-gradient-to-br from-slate-800 to-black rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg border border-slate-700">VISA</div>
                            <div>
                               <p className="font-black text-slate-900 text-sm">Visa ending in 4242</p>
                               <p className="text-xs text-slate-500 font-semibold">Expires 12/28</p>
                            </div>
                         </div>
                         <button className="px-4 py-2 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                            Edit
                         </button>
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'subscription' && (
                <div className="space-y-6">
                   {/* Current Plan Overview */}
                   <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl">
                      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"></div>
                      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                      
                      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                         <div>
                            <div className="flex items-center gap-2 mb-2">
                               <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-amber-950 uppercase tracking-wide">Current Plan</span>
                               <span className="text-sm font-medium text-slate-300">Billed monthly</span>
                            </div>
                            <h2 className="text-3xl font-black tracking-tight mb-2">AgriScore Pro</h2>
                            <p className="text-slate-300 max-w-md">You are on the Pro plan with advanced analytics, 3 team members, and unlimited historical data.</p>
                         </div>
                         <div className="flex flex-col items-start md:items-end">
                            <div className="flex items-baseline gap-1">
                               <span className="text-4xl font-black">₹2,499</span>
                               <span className="text-slate-400 font-medium">/ month</span>
                            </div>
                            <p className="text-sm text-emerald-400 font-medium mt-1">Renews on Nov 22, 2026</p>
                            <div className="mt-4 flex gap-3">
                               <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/10 transition-colors">
                                  Change Plan
                               </button>
                               <button className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all">
                                  Upgrade to Enterprise
                               </button>
                            </div>
                         </div>
                      </div>

                      {/* Usage Bars */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/10">
                         <div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                               <span className="text-slate-400">Team Seats</span>
                               <span className="text-white">2 / 5 Used</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-400 w-2/5"></div>
                            </div>
                         </div>
                         <div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                               <span className="text-slate-400">Data Storage</span>
                               <span className="text-white">12.5GB / 50GB</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-400 w-1/4"></div>
                            </div>
                         </div>
                         <div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                               <span className="text-slate-400">SMS Alerts</span>
                               <span className="text-white">850 / 1000</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-amber-400 w-[85%]"></div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Payment Method */}
                      <Card className="lg:col-span-1">
                         <h3 className="font-bold text-slate-900 mb-4">Payment Method</h3>
                         <div className="p-4 rounded-xl border-2 border-slate-100 bg-slate-50 relative group overflow-hidden">
                            <div className="relative z-10">
                               <div className="flex items-center justify-between mb-4">
                                  <div className="h-8 w-12 rounded bg-white border border-slate-200 flex items-center justify-center">
                                     <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
                                  </div>
                                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Primary</span>
                               </div>
                               <p className="font-bold text-slate-800 mb-1">•••• •••• •••• 4242</p>
                               <p className="text-xs text-slate-500">Expires 12/2028</p>
                            </div>
                            <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                               <Edit2 className="w-4 h-4" />
                            </button>
                         </div>
                         <button className="mt-4 w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Add Payment Method
                         </button>
                      </Card>

                      {/* Invoice History */}
                      <Card className="lg:col-span-2">
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900">Billing History</h3>
                            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Download All</button>
                         </div>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                               <thead>
                                  <tr className="border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                                     <th className="py-3 px-2">Invoice</th>
                                     <th className="py-3 px-2">Date</th>
                                     <th className="py-3 px-2">Amount</th>
                                     <th className="py-3 px-2">Status</th>
                                     <th className="py-3 px-2 text-right">Download</th>
                                  </tr>
                               </thead>
                               <tbody>
                                  {[
                                     { id: 'INV-2024-001', date: 'Nov 22, 2025', amount: '₹2,499.00', status: 'Paid' },
                                     { id: 'INV-2023-012', date: 'Nov 22, 2024', amount: '₹2,100.00', status: 'Paid' },
                                     { id: 'INV-2022-012', date: 'Nov 22, 2023', amount: '₹1,800.00', status: 'Paid' },
                                  ].map((invoice) => (
                                     <tr key={invoice.id} className="border-b border-slate-50 group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-2 text-sm font-bold text-slate-700">{invoice.id}</td>
                                        <td className="py-3 px-2 text-sm text-slate-500">{invoice.date}</td>
                                        <td className="py-3 px-2 text-sm font-bold text-slate-900">{invoice.amount}</td>
                                        <td className="py-3 px-2">
                                           <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                              {invoice.status}
                                           </span>
                                        </td>
                                        <td className="py-3 px-2 text-right">
                                           <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                              <Download className="w-4 h-4" />
                                           </button>
                                        </td>
                                     </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                      </Card>
                   </div>
                   
                   {/* Enterprise Banner */}
                   <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border border-indigo-100 flex items-center justify-between gap-6">
                      <div>
                         <h4 className="font-bold text-indigo-900 text-lg mb-1">Need a custom plan?</h4>
                         <p className="text-indigo-700/80 text-sm">Get dedicated support, custom integrations, and unlimited team members for large scale operations.</p>
                      </div>
                      <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all whitespace-nowrap">
                         Contact Sales
                      </button>
                   </div>
                </div>
             )}

             {activeTab === 'team' && (
                <Card>
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-800">Team Members</h3>
                      <button onClick={() => {
                        const email = prompt('Enter team member email:');
                        const role = prompt('Enter role (Owner, Agronomist, Viewer):', 'Agronomist');
                        if (email && role) {
                          alert(`Invitation sent to ${email} with role: ${role}\n\nNote: This is a demo. In production, this would send an email.`);
                        }
                      }} className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors flex items-center">
                         <Plus className="w-3.5 h-3.5 mr-1" /> Invite Member
                      </button>
                   </div>
                   <div className="space-y-4">
                      {[
                         { name: 'Manish Kumar', role: 'Owner', email: 'kmanish45@gmail.com', avatar: 'bg-orange-100 text-orange-600' },
                         { name: 'Anita Desai', role: 'Viewer', email: 'anita564@gmail.com', avatar: 'bg-teal-100 text-teal-600' }
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
                               <button onClick={() => {
                                 if (confirm(`Remove ${member.name} from team?`)) {
                                   alert(`${member.name} has been removed from the team.`);
                                 }
                               }} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                         </div>
                      ))}
                   </div>
                </Card>
             )}

             {activeTab === 'integrations' && (
                <div className="space-y-6">
                   <Card>
                      <div className="flex items-center justify-between mb-6">
                         <div>
                            <h3 className="font-bold text-slate-800">Connected integrations</h3>
                            <p className="text-xs text-slate-500">Sync agronomic data with your existing stack</p>
                         </div>
                         <button className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100">Add connector</button>
                      </div>
                      <div className="space-y-4">
                         {integrationCatalog.map((integration, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                                     <integration.icon className="w-5 h-5 text-slate-500" />
                                  </div>
                                  <div>
                                     <p className="text-sm font-semibold text-slate-800">{integration.name}</p>
                                     <p className="text-xs text-slate-500">Last sync: {integration.sync}</p>
                                  </div>
                               </div>
                               <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                  integration.status === 'Connected'
                                     ? 'bg-green-50 text-green-700'
                                     : integration.status === 'Sync issue'
                                        ? 'bg-amber-50 text-amber-600'
                                        : 'bg-slate-100 text-slate-600'
                               }`}>
                                  {integration.status}
                               </span>
                            </div>
                         ))}
                      </div>
                   </Card>

                   <Card>
                      <div className="flex items-center justify-between mb-4">
                         <h3 className="font-bold text-slate-800">API tokens & webhooks</h3>
                         <button className="text-xs font-bold text-slate-500 hover:text-slate-800">Generate token</button>
                      </div>
                      <div className="space-y-4">
                         {apiTokens.map((token, idx) => (
                            <div key={idx} className="p-4 border border-slate-100 rounded-2xl">
                               <div className="flex items-center justify-between">
                                  <div>
                                     <p className="text-sm font-semibold text-slate-800">{token.name}</p>
                                     <p className="text-xs text-slate-500">Scopes: {token.scope}</p>
                                  </div>
                                  <span className="text-xs text-slate-400">Created {token.created}</span>
                               </div>
                               <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                  <span>Last used {token.lastUsed}</span>
                                  <button className="text-slate-400 hover:text-red-500">Revoke</button>
                               </div>
                            </div>
                         ))}
                      </div>
                   </Card>
                </div>
             )}
             
             {activeTab === 'security' && (
                <div className="space-y-6">
                   <Card>
                      <h3 className="font-bold text-slate-800 mb-4">Security controls</h3>
                      <div className="space-y-4">
                         {[ 
                            { key: 'twoFactor', label: 'Two-factor authentication', desc: 'OTP over SMS + authenticator' },
                            { key: 'biometrics', label: 'Biometric unlock on mobile', desc: 'Face ID / Fingerprint' },
                            { key: 'loginAlerts', label: 'Login alerts', desc: 'Notify me for new devices' },
                         ].map((setting) => (
                            <div key={setting.key} className="flex items-start justify-between gap-4">
                               <div>
                                  <p className="text-sm font-semibold text-slate-800">{setting.label}</p>
                                  <p className="text-xs text-slate-500">{setting.desc}</p>
                               </div>
                               <Toggle
                                  enabled={securityPrefs[setting.key as keyof typeof securityPrefs]}
                                  onChange={(value) =>
                                     setSecurityPrefs((prev) => ({ ...prev, [setting.key as keyof typeof securityPrefs]: value }))
                                  }
                               />
                            </div>
                         ))}
                      </div>
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500">
                         <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="font-semibold text-slate-800 text-sm">Last password change</p>
                            <p>14 Dec 2025</p>
                         </div>
                         <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="font-semibold text-slate-800 text-sm">Recovery email</p>
                            <p>backup@myagriscore.com</p>
                         </div>
                         <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="font-semibold text-slate-800 text-sm">Trusted devices</p>
                            <p>4 active sessions</p>
                         </div>
                      </div>
                   </Card>

                   <Card>
                      <h3 className="font-bold text-slate-800 mb-6">Login history</h3>
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
                               <td className="px-4 py-4 font-medium text-slate-700 flex items-center gap-2"><Globe className="w-4 h-4" /> Chrome / Windows</td>
                               <td className="px-4 py-4 text-slate-500">Tarakeswar, India</td>
                               <td className="px-4 py-4 text-slate-500">Just now</td>
                               <td className="px-4 py-4"><span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">Active</span></td>
                            </tr>
                            <tr>
                               <td className="px-4 py-4 font-medium text-slate-700 flex items-center gap-2"><Smartphone className="w-4 h-4" /> iPhone 14 Pro</td>
                               <td className="px-4 py-4 text-slate-500">Kolkata, India</td>
                               <td className="px-4 py-4 text-slate-500">Yesterday, 10:23 PM</td>
                               <td className="px-4 py-4"><span className="text-slate-400 font-bold text-xs bg-slate-50 px-2 py-1 rounded">Logged Out</span></td>
                            </tr>
                         </tbody>
                      </table>
                   </Card>
                </div>
             )}
          </div>
       </div>
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

  const connectedNodes = [
     { name: 'Node-WZ-01', id: '#0001', type: 'Sensor Node', location: 'North Field', battery: 98, status: 'Online', lastPing: 'Just now' },
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

   const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
   const exportMenuRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const handleExport = (type: 'live' | 'history') => {
      if (type === 'history') {
         const link = document.createElement('a');
         link.href = soilHistoryUrl;
         link.download = 'IoT_soil_data.csv';
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         setIsExportMenuOpen(false);
         return;
      }

      const headers = ['Category', 'Parameter', 'Value', 'Unit', 'Additional Info'];

      const liveRows = [
         ...nutrients.map((n) => ['Soil Metric', n.label, n.value, n.unit, `Trend: ${n.trend}`]),
         ...devices.map((d) => ['IoT Device', d.label, d.value, d.unit, 'Live reading']),
         ...fieldHealth.map((f) => ['Field Health', f.name, f.score, '/100', f.status]),
      ];

      const csvContent =
         'data:text/csv;charset=utf-8,' +
         headers.join(',') +
         '\n' +
         liveRows.map((e) => e.join(',')).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'agriscore_live_snapshot.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExportMenuOpen(false);
  };

  return (
     <div className="space-y-8">
        <SectionHeader 
            title="Soil & Water" 
            subtitle="Real-time monitoring and analytics" 
            action={
               <div className="relative" ref={exportMenuRef}>
                  <button
                     onClick={() => setIsExportMenuOpen((prev) => !prev)}
                     className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center shadow-lg shadow-green-200 transition-colors"
                  >
                     Export Data <Download className="w-3.5 h-3.5 ml-2" strokeWidth={2.5} />
                  </button>
                  {isExportMenuOpen && (
                     <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-lg z-20 overflow-hidden">
                        <button
                           onClick={() => handleExport('live')}
                           className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                        >
                           Live data <span className="text-[11px] text-slate-400">Snapshot</span>
                        </button>
                        <button
                           onClick={() => handleExport('history')}
                           className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between border-t border-slate-100"
                        >
                           Full history <span className="text-[11px] text-slate-400">ZIP export</span>
                        </button>
                     </div>
                  )}
               </div>
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

        {/* Connected Nodes Section */}
        <div>
           <div className="mb-5 pl-1 border-l-4 border-emerald-500">
              <h2 className="text-lg font-bold text-slate-800 ml-3">Sensor Nodes</h2>
              <p className="text-xs text-slate-500 ml-3">Real-time status of deployed hardware</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {connectedNodes.map((node, i) => (
                 <Card key={i} className="p-4 relative hover:border-emerald-200 transition-colors group">
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-lg shadow-slate-500/10">
                             <Wifi className="w-5 h-5" />
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-800 text-sm">{node.name}</h4>
                             <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ID: {node.id}</p>
                          </div>
                       </div>
                       <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                       </span>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Type</span>
                          <span className="font-bold text-slate-700">{node.type}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Location</span>
                          <span className="font-bold text-slate-700">{node.location}</span>
                       </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex items-center gap-1.5">
                          <Battery className={`w-3.5 h-3.5 ${node.battery > 20 ? 'text-emerald-500' : 'text-red-500'}`} />
                          <span className="text-xs font-bold text-slate-700">{node.battery}%</span>
                       </div>
                       <span className="text-[10px] font-medium text-slate-400">{node.lastPing}</span>
                    </div>
                 </Card>
              ))}
           </div>
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

export type AppShellProps = {
  onLogout: () => void;
};

const AppShell: React.FC<AppShellProps> = ({ onLogout }) => {
  return (
    <HashRouter>
      <Layout onLogout={onLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/farms" element={<CropManagement />} />
          <Route path="/irrigation" element={<SoilWater />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/tasks" element={<TaskManagement />} />
          <Route path="/doctor" element={<CropDoctor />} />
          <Route path="/reports" element={<ReportsAnalytics />} />
          <Route path="/score" element={<AgriScorePage />} />
          <Route path="/settings" element={<FarmSettings />} />
          <Route path="/account" element={<MyAccount />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/help" element={<HelpSupport />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default AppShell;
