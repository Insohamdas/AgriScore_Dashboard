import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout, MapPin, ChevronRight, ArrowDown, ArrowUp, Download, HelpCircle,
  MoreHorizontal, Cloud, Sun, Carrot
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../services/mockDataService';
import { Task, HarvestItem } from '../types';
import { StatusBadge, Card, SectionHeader } from '../components/ui';

const soilHistoryUrl = new URL('../assets/data/IoT_soil_data.csv', import.meta.url).href;

export const Dashboard = () => {
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
        <div className="lg:col-span-3 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-[24px] p-6 shadow-xl shadow-blue-200 relative overflow-hidden flex flex-col justify-between min-h-[240px] text-white">
          <div className="flex justify-between items-start z-10">
             <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center shadow-sm border border-white/10">
               <MapPin className="w-3 h-3 mr-1" /> Tarakeswar
             </div>
             <div className="flex bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10">
               <button className="w-7 h-7 rounded-full bg-white text-blue-600 flex items-center justify-center text-[10px] font-bold shadow-sm">C</button>
               <button className="w-7 h-7 rounded-full text-blue-100 flex items-center justify-center text-[10px] font-medium hover:bg-white/10 hover:text-white transition-colors">F</button>
             </div>
          </div>
          
          <div className="z-10 mt-4">
            <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Tuesday</p>
            <p className="text-white/80 text-[11px]">25 Nov, 2025</p>
            
            <div className="flex items-start mt-3">
               <span className="text-[56px] font-bold text-white leading-none tracking-tight drop-shadow-sm">24</span>
               <span className="text-xl text-blue-100 mt-1 ml-1 font-medium">°C</span>
            </div>
            <p className="text-[11px] text-blue-100 mt-2 font-medium">High: 25 &nbsp;•&nbsp; Low: 12</p>
          </div>

          <div className="z-10 mt-4 border-t border-white/10 pt-4">
             <p className="text-blue-100 text-[11px]">Feels Like 26</p>
             <p className="text-white font-semibold text-sm">Cloudy</p>
          </div>

          {/* Weather Decor */}
          <div className="absolute top-16 -right-6 pointer-events-none">
             <Cloud className="w-32 h-32 text-white/10 fill-white/10" />
             <Sun className="w-12 h-12 text-yellow-300 fill-yellow-300 absolute top-2 right-8 animate-pulse opacity-80" />
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
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">1,000</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">tons production</span>
             </div>
          </div>

          <div className="flex justify-center space-x-6 mt-4">
             {productionData.map(item => (
               <div key={item.name} className="flex items-center group cursor-default">
                 <span className="w-2.5 h-2.5 rounded-full mr-2 group-hover:scale-125 transition-transform duration-300" style={{ backgroundColor: item.color }}></span>
                 <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-medium uppercase group-hover:text-slate-600 transition-colors">{item.name}</span>
                    <span className="text-xs font-bold text-slate-700">{item.value}%</span>
                 </div>
               </div>
             ))}
          </div>
        </Card>

        {/* Stats Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           {/* Land Area */}
           <Card className="flex items-start justify-between flex-1 group hover:border-[#22C55E]/30 transition-all duration-300">
             <div className="flex flex-col justify-between h-full">
               <div className="flex items-center space-x-2">
                 <span className="text-[13px] text-slate-500 font-medium group-hover:text-[#22C55E] transition-colors">Total Land Area</span>
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
             <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <Sprout className="w-6 h-6" strokeWidth={2} />
             </div>
           </Card>

           {/* Revenue */}
           <Card className="flex items-start justify-between flex-1 group hover:border-[#9333EA]/30 transition-all duration-300">
             <div className="flex flex-col justify-between h-full">
               <div className="flex items-center space-x-2">
                 <span className="text-[13px] text-slate-500 font-medium group-hover:text-[#9333EA] transition-colors">Revenue</span>
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
             <div className="w-12 h-12 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#9333EA] group-hover:scale-110 transition-transform duration-300 shadow-sm">
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
