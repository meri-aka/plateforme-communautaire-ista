import { useState, useEffect, useCallback } from 'react';
import { 
  Save, RotateCcw, Building, Globe, Shield, Bell,
  Database, Sliders, AlertTriangle, ChevronRight, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../api/axios';

function SettingsSection({ title, children }) {
  return (
    <div className="pro-card mb-6 overflow-hidden animate-slide-up">
      <div className="p-5 border-b border-[var(--glass-border)] flex items-center gap-3">
        <h3 className="text-base font-bold text-[var(--text-primary)]">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function ToggleItem({ label, desc, value, onChange }) {
  const { theme } = useTheme();
  return (
    <div className="flex items-center justify-between py-5 border-b border-[var(--glass-border)] last:border-none">
      <div className="flex-1 pr-5">
        <p className="text-sm font-bold text-[var(--text-primary)] mb-1">{label}</p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full relative transition-all duration-300 flex-shrink-0"
        style={{ background: value ? 'var(--brand)' : 'var(--bg-card-hover)' }}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 shadow-md bg-white ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}

function InputRow({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="mb-5 last:mb-0">
      <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none border transition-colors"
        style={{ color: 'var(--text-primary)', borderColor: 'var(--border-subtle)', background: 'var(--bg-card-hover)' }}
      />
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState('Core');
  const [isSaving, setIsSaving]   = useState(false);
  const [loading, setLoading]     = useState(true);
  const [settings, setSettings]   = useState({});

  const fetchSettings = useCallback(() => {
    setLoading(true);
    api.get('/admin/settings')
      .then(res => setSettings(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const set = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSetting = async (key, value) => {
    await api.patch('/admin/settings', { key, value: String(value) });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all(
        Object.entries(settings).map(([key, value]) => saveSetting(key, value))
      );
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'Core',          Icon: Sliders,   label: t('settings.tabs.core')          },
    { id: 'Security',      Icon: Shield,    label: t('settings.tabs.security')      },
    { id: 'Notifications', Icon: Bell,      label: t('settings.tabs.notifications') },
    { id: 'Database',      Icon: Database,  label: t('settings.tabs.database')      },
  ];

  return (
    <AdminLayout
      title={t('nav.settings')}
      subtitle={t('settings.subtitle')}
      actions={[
        { icon: <RotateCcw size={14} />, label: 'Sync',          onClick: fetchSettings },
        { icon: isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />,
          label: isSaving ? 'Saving...' : t('common.save') || 'Apply Changes',
          primary: true, onClick: handleSave },
      ]}
    >
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Sidebar */}
        <div className="w-full lg:w-[260px] lg:sticky lg:top-8 order-2 lg:order-1 space-y-4">
          <div className="pro-card p-2">
            {tabs.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: active ? 'var(--brand)' : 'transparent',
                    color:      active ? '#fff' : 'var(--text-secondary)',
                    boxShadow:  active ? '0 4px 12px var(--brand-glow)' : 'none',
                  }}
                >
                  <tab.Icon size={18} />
                  <span>{tab.label}</span>
                  {active && <ChevronRight size={14} className="ml-auto hidden lg:block" />}
                </button>
              );
            })}
          </div>

          <div className="pro-card p-5 hidden lg:block" style={{ background: 'var(--brand-dim)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-3 text-[var(--text-primary)]">Node Status</p>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              Operational
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 order-1 lg:order-2 w-full">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[var(--brand)]" />
            </div>
          ) : (
            <>
              {activeTab === 'Core' && (
                <>
                  <SettingsSection title={t('settings.sections.identity')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputRow label={t('settings.fields.alias')}  value={settings.site_name}  onChange={v => set('site_name', v)}  placeholder="ISTA Connect" />
                      <InputRow label={t('settings.fields.env')}    value={settings.environment} onChange={v => set('environment', v)} placeholder="Production" />
                      <InputRow label={t('settings.fields.url')}    value={settings.site_url}   onChange={v => set('site_url', v)}   placeholder="https://connect.ista.ma" />
                      <InputRow label={t('settings.fields.email')}  value={settings.admin_email} onChange={v => set('admin_email', v)} placeholder="ops@ista.ma" type="email" />
                    </div>
                  </SettingsSection>
                  <SettingsSection title={t('settings.sections.localization')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputRow label={t('settings.fields.lang')} value={settings.language} onChange={v => set('language', v)} placeholder="French (Standard)" />
                      <InputRow label={t('settings.fields.tz')}   value={settings.timezone} onChange={v => set('timezone', v)} placeholder="Africa/Casablanca" />
                    </div>
                  </SettingsSection>
                </>
              )}

              {activeTab === 'Security' && (
                <SettingsSection title={t('settings.sections.security')}>
                  <ToggleItem label="Multi-Factor Auth (MFA)"  desc="Require 2FA for all administrative clearance levels" value={settings.mfa_enabled === 'true'}     onChange={v => set('mfa_enabled', v)} />
                  <ToggleItem label="Biometric Passthrough"     desc="Allow WebAuthn based authentication"                value={settings.webauthn_enabled === 'true'} onChange={v => set('webauthn_enabled', v)} />
                  <ToggleItem label="Regional Fencing"          desc="Restrict admin access to specific IP ranges"        value={settings.ip_fencing === 'true'}      onChange={v => set('ip_fencing', v)} />
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <InputRow label="Token TTL (hours)"  value={settings.token_ttl}       onChange={v => set('token_ttl', v)}       type="number" placeholder="12" />
                    <InputRow label="Max Login Attempts" value={settings.login_attempts}   onChange={v => set('login_attempts', v)}   type="number" placeholder="3"  />
                    <InputRow label="Session Timeout"    value={settings.session_timeout}  onChange={v => set('session_timeout', v)}  type="number" placeholder="30" />
                  </div>
                </SettingsSection>
              )}

              {activeTab === 'Notifications' && (
                <SettingsSection title={t('settings.sections.alerts')}>
                  <ToggleItem label="Real-time WebSockets"    desc="Push events to active admin sessions instantly"                value={settings.ws_enabled === 'true'}    onChange={v => set('ws_enabled', v)} />
                  <ToggleItem label="Slack/Discord Webhooks"  desc="Relay critical alerts to external communication hubs"         value={settings.webhook_enabled === 'true'} onChange={v => set('webhook_enabled', v)} />
                  <ToggleItem label="Email Dispatch"          desc="Asynchronous delivery of high-importance reports"             value={settings.email_notif === 'true'}   onChange={v => set('email_notif', v)} />
                </SettingsSection>
              )}

              {activeTab === 'Database' && (
                <div className="pro-card p-6 bg-rose-500/5 border-rose-500/20">
                  <h4 className="text-rose-400 font-black text-sm uppercase tracking-widest flex items-center gap-2 mb-4">
                    <AlertTriangle size={18} /> {t('settings.danger.title')}
                  </h4>
                  <p className="text-rose-400/80 text-xs mb-6 leading-relaxed">{t('settings.danger.desc')}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="bg-rose-500 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider">
                      {t('settings.danger.wipe')}
                    </button>
                    <button className="border border-rose-500 text-rose-500 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider">
                      {t('settings.danger.revoke')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}