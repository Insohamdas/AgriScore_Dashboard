import React, { useState, useEffect } from 'react';
import { Settings, Shield, Download, BarChart3, Bell, Smartphone, Lock, LogOut, Eye, EyeOff, CheckCircle, AlertCircle, Copy } from 'lucide-react';

interface AdvancedSettingsProps {
  userId: string;
  userName: string;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ userId, userName }) => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [notifications, setNotifications] = useState({
    profileUpdates: true,
    teamInvites: true,
    reports: true,
    weatherAlerts: true,
    systemAlerts: true
  });
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [exportLoading, setExportLoading] = useState(false);

  // Notifications Tab
  const NotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Email Notifications</p>
            <p className="text-xs text-blue-700 mt-1">Choose what notifications you want to receive via email</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'profileUpdates', label: 'Profile Updates', desc: 'Get notified when your profile is updated' },
          { key: 'teamInvites', label: 'Team Invitations', desc: 'Receive team invitation notifications' },
          { key: 'reports', label: 'Report Generation', desc: 'Get notified when reports are ready' },
          { key: 'weatherAlerts', label: 'Weather Alerts', desc: 'Receive important weather and agricultural alerts' },
          { key: 'systemAlerts', label: 'System Alerts', desc: 'Get critical system and security notifications' }
        ].map(({ key, label, desc }) => (
          <label key={key} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={notifications[key as keyof typeof notifications]}
              onChange={(e) => setNotifications({
                ...notifications,
                [key]: e.target.checked
              })}
              className="w-4 h-4 accent-green-600"
            />
            <div>
              <p className="font-medium text-slate-800">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          </label>
        ))}
      </div>

      <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors">
        Save Notification Settings
      </button>
    </div>
  );

  // Two-Factor Authentication Tab
  const TwoFactorTab = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-purple-900">Two-Factor Authentication</p>
            <p className="text-xs text-purple-700 mt-1">Add an extra layer of security to your account</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-slate-800">Status</p>
            <p className="text-sm text-slate-600 mt-1">
              {twoFAEnabled ? '✅ Enabled' : '❌ Disabled'}
            </p>
          </div>
          <button
            onClick={() => setTwoFAEnabled(!twoFAEnabled)}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              twoFAEnabled
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
          >
            {twoFAEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>

        {!twoFAEnabled ? (
          <div className="space-y-4 mt-6">
            <p className="text-sm text-slate-700">Steps to enable 2FA:</p>
            <ol className="space-y-3 text-sm text-slate-700 list-decimal list-inside">
              <li>Download an authenticator app (Google Authenticator, Authy, Microsoft Authenticator)</li>
              <li>Click "Enable" and scan the QR code</li>
              <li>Enter the 6-digit code from your authenticator</li>
              <li>Save your backup codes in a safe place</li>
            </ol>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-colors mt-6">
              Get Started
            </button>
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">💾 Save your backup codes in a secure location. You'll need them if you lose access to your authenticator.</p>
            </div>
            <button className="w-full border-2 border-green-600 text-green-600 font-semibold py-2 rounded-xl hover:bg-green-50 transition-colors">
              Download Backup Codes
            </button>
            <button className="w-full border-2 border-red-600 text-red-600 font-semibold py-2 rounded-xl hover:bg-red-50 transition-colors">
              Disable 2FA
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <p className="font-semibold text-slate-800 mb-4">Trusted Devices</p>
        <div className="space-y-3">
          {[
            { name: 'MacBook Pro', lastUsed: '2 minutes ago', verified: true },
            { name: 'iPhone 14', lastUsed: '1 hour ago', verified: true }
          ].map((device, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
              <div>
                <p className="font-medium text-slate-800">{device.name}</p>
                <p className="text-xs text-slate-500">Last used: {device.lastUsed}</p>
              </div>
              <button className="text-red-600 hover:text-red-700 font-semibold text-xs">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Export Data Tab
  const ExportDataTab = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Download className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-900">Export Your Data</p>
            <p className="text-xs text-green-700 mt-1">Download your farm data and reports in various formats</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { type: 'pdf', icon: '📄', title: 'Farm Report (PDF)', desc: 'Comprehensive farm report with charts' },
          { type: 'excel', icon: '📊', title: 'Farm Data (Excel)', desc: 'Raw farm data in spreadsheet format' },
          { type: 'soil', icon: '🌱', title: 'Soil Data (Excel)', desc: 'Detailed soil analysis and history' },
          { type: 'yield', icon: '🌾', title: 'Yield Analysis', desc: 'Crop yield predictions and analysis' }
        ].map((item) => (
          <button
            key={item.type}
            onClick={() => setExportLoading(true)}
            className="p-4 border-2 border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <p className="text-2xl mb-2">{item.icon}</p>
            <p className="font-semibold text-slate-800 group-hover:text-green-600">{item.title}</p>
            <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-slate-800 mb-3">Select Format:</p>
        <div className="flex gap-3">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="pdf"
              checked={exportFormat === 'pdf'}
              onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel')}
              className="w-4 h-4 accent-green-600"
            />
            <span className="text-sm text-slate-700">PDF</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="excel"
              checked={exportFormat === 'excel'}
              onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel')}
              className="w-4 h-4 accent-green-600"
            />
            <span className="text-sm text-slate-700">Excel</span>
          </label>
        </div>
      </div>

      <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors">
        {exportLoading ? 'Generating...' : '⬇️ Export Data'}
      </button>
    </div>
  );

  // Analytics Tab
  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <div className="flex gap-3">
          <BarChart3 className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-cyan-900">Your Activity Analytics</p>
            <p className="text-xs text-cyan-700 mt-1">Track your usage and engagement</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Logins', value: '24', icon: '📱' },
          { label: 'Profile Updates', value: '12', icon: '✏️' },
          { label: 'Documents Uploaded', value: '8', icon: '📄' },
          { label: 'Reports Generated', value: '5', icon: '📊' }
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
            <p className="text-2xl mb-2">{stat.icon}</p>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-xs text-slate-600 mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <p className="font-semibold text-slate-800 mb-4">Activity Timeline (Last 7 Days)</p>
        <div className="space-y-3">
          {[
            { date: 'Today', action: 'Updated profile picture', time: '2:30 PM' },
            { date: 'Yesterday', action: 'Uploaded farm document', time: '11:15 AM' },
            { date: '2 days ago', action: 'Exported farm report', time: '3:45 PM' },
            { date: '3 days ago', action: 'Invited team member', time: '10:20 AM' }
          ].map((item, i) => (
            <div key={i} className="flex gap-3 pb-3 border-b border-slate-200 last:border-0 last:pb-0">
              <p className="text-xs text-slate-500 min-w-[70px]">{item.date}</p>
              <div className="flex-1">
                <p className="text-sm text-slate-800">{item.action}</p>
                <p className="text-xs text-slate-500">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'notifications', label: '🔔 Notifications', icon: Bell },
          { id: 'security', label: '🔐 Security', icon: Shield },
          { id: 'export', label: '📥 Export Data', icon: Download },
          { id: 'analytics', label: '📊 Analytics', icon: BarChart3 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'security' && <TwoFactorTab />}
        {activeTab === 'export' && <ExportDataTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
};

export default AdvancedSettings;
