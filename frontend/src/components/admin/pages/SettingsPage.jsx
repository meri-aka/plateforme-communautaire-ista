import { useState } from 'react';
import { 
  Save, RotateCcw, Building, Globe, Lock, Bell, Shield, 
  Activity, Wrench, Database, Trash2, Sliders, AlertTriangle, 
  ChevronRight, CreditCard, Users, Link 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';

function SettingsSection({ title, Icon, children }) {
  return (
    <div className="pro-card mb-6 overflow-hidden animate-slide-up">
      <div className="p-5 sm:p-6 border-b border-[var(--glass-border)] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--brand)]/10 flex items-center justify-center text-[var(--brand)]">
          <Icon size={18} />
        </div>
        <h3 className="text-base font-bold text-[var(--text-primary)]">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function ToggleItem({ label, desc, defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-5 border-b border-[var(--glass-border)] last:border-none">
      <div className="flex-1 pr-5">
        <p className="text-sm font-bold text-[var(--text-primary)] mb-1">{label}</p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
      </div>
      <button 
        onClick={() => setOn(!on)}
        className={`w-11 h-6 rounded-full relative transition-all duration-300 ${on ? 'bg-[var(--brand)]' : 'bg-white/5'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md ${on ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}

function InputRow({ label, defaultValue, type = 'text', placeholder }) {
  return (
    <div className="mb-5 last:mb-0">
      <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">{label}</label>
      <input 
        type={type} 
        defaultValue={defaultValue} 
        placeholder={placeholder}
        className="pro-glass w-full px-4 py-3 rounded-xl text-sm text-white outline-none border border-[var(--glass-border)] focus:border-[var(--brand)] transition-colors"
      />
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('Core');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'Core', Icon: Sliders, label: t('settings.tabs.core') },
    { id: 'Security', Icon: Shield, label: t('settings.tabs.security') },
    { id: 'Notifications', Icon: Bell, label: t('settings.tabs.notifications') },
    { id: 'Database', Icon: Database, label: t('settings.tabs.database') },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <AdminLayout
      title={t('nav.settings')}
      subtitle={t('settings.subtitle')}
      actions={[
        { icon: <RotateCcw size={14} />, label: t('common.sync') || 'Sync' },
        { 
          icon: isSaving ? null : <Save size={14} />, 
          label: isSaving ? 'Synchronizing...' : t('common.save') || 'Apply Changes', 
          primary: true,
          onClick: handleSave
        },
      ]}
    >
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Responsive Navigation Sidebar */}
        <div className="w-full lg:w-[260px] lg:sticky lg:top-8 order-2 lg:order-1">
          <div className="pro-card p-2 flex lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all flex-shrink-0 lg:flex-shrink-1 transition-all ${activeTab === tab.id ? 'bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand-glow)]' : 'text-[var(--text-secondary)] hover:bg-white/5'}`}
              >
                <tab.Icon size={18} />
                <span>{tab.label}</span>
                {activeTab === tab.id && <ChevronRight size={14} className="ml-auto hidden lg:block" />}
              </button>
            ))}
          </div>

          <div className="pro-card mt-6 p-5 bg-[var(--brand)]/5 border-[var(--brand)]/20 hidden lg:block">
            <p className="text-xs font-black text-white uppercase tracking-widest mb-3">{t('common.status_ready') || 'Node Status'}</p>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              Operational v4.2.0
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 order-1 lg:order-2 w-full">
          {activeTab === 'Core' && (
            <>
              <SettingsSection title={t('settings.sections.identity')} Icon={Building}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputRow label={t('settings.fields.alias')} defaultValue="ISTA Connect" />
                  <InputRow label={t('settings.fields.env')} defaultValue="Production" />
                  <InputRow label={t('settings.fields.url')} defaultValue="https://connect.ista.ma" />
                  <InputRow label={t('settings.fields.email')} defaultValue="ops@ista.ma" type="email" />
                </div>
              </SettingsSection>

              <SettingsSection title={t('settings.sections.localization')} Icon={Globe}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputRow label={t('settings.fields.lang')} defaultValue="French (Standard)" />
                  <InputRow label={t('settings.fields.tz')} defaultValue="Africa/Casablanca" />
                </div>
              </SettingsSection>
            </>
          )}

          {activeTab === 'Security' && (
            <SettingsSection title={t('settings.sections.security')} Icon={Shield}>
              <ToggleItem label="Multi-Factor Auth (MFA)" desc="Require 2FA for all administrative clearance levels" defaultOn={true} />
              <ToggleItem label="Biometric Passthrough" desc="Allow WebAuthn based authentication" defaultOn={false} />
              <ToggleItem label="Regional Fencing" desc="Restrict admin access to specific IP ranges" defaultOn={true} />
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <InputRow label="Token TTL" defaultValue="12" type="number" />
                <InputRow label="Limit" defaultValue="3" type="number" />
                <InputRow label="Timeout" defaultValue="30" type="number" />
              </div>
            </SettingsSection>
          )}

          {activeTab === 'Notifications' && (
            <SettingsSection title={t('settings.sections.alerts')} Icon={Bell}>
              <ToggleItem label="Real-time WebSockets" desc="Push events to active admin sessions instantly" defaultOn={true} />
              <ToggleItem label="Slack/Discord Webhooks" desc="Relay critical alerts to external communication hubs" defaultOn={true} />
              <ToggleItem label="Email Dispatch" desc="Asynchronous delivery of high-importance reports" defaultOn={true} />
            </SettingsSection>
          )}

          {activeTab === 'Database' && (
            <div className="pro-card p-6 bg-rose-500/5 border-rose-500/20">
              <h4 className="text-rose-400 font-black text-sm uppercase tracking-widest flex items-center gap-2 mb-4">
                <AlertTriangle size={18} /> {t('settings.danger.title')}
              </h4>
              <p className="text-rose-400/80 text-xs mb-6 leading-relaxed">{t('settings.danger.desc')}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="bg-rose-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider">{t('settings.danger.wipe')}</button>
                <button className="border border-rose-500 text-rose-500 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider">{t('settings.danger.revoke')}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
