import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Settings2,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Database,
  Search,
  Bell,
  Cpu,
  Lock,
  UserX,
  AlertTriangle,
  RefreshCw,
  Check,
  Save,
  Radio,
  FileCode,
  Sparkles
} from 'lucide-react';
import { BusinessRule, FeatureFlag, SecuritySession, NotificationTemplate } from '../../types';

export const PlatformSettingsModule: React.FC = () => {
  const {
    businessRules,
    updateBusinessRule,
    featureFlags,
    toggleFeatureFlag,
    updateFeatureFlagRollout,
    securitySessions,
    terminateSecuritySession,
    flagSecuritySession,
    notificationTemplates,
    updateNotificationTemplate,
    rebuildSearchIndex,
    currentUser
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState<'RULES' | 'FEATURE_FLAGS' | 'SECURITY' | 'NOTIFICATIONS' | 'SYSTEM_INDEX'>('RULES');
  const [isRebuildingIndex, setIsRebuildingIndex] = useState(false);
  const [indexSuccessMsg, setIndexSuccessMsg] = useState('');

  // Selected Notification Template state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(notificationTemplates[0]?.id || '');
  const [templateBody, setTemplateBody] = useState(notificationTemplates[0]?.body || '');

  const handleRebuildSearchIndex = async () => {
    setIsRebuildingIndex(true);
    setIndexSuccessMsg('');
    const res = await rebuildSearchIndex();
    setIsRebuildingIndex(false);
    setIndexSuccessMsg(`Successfully re-indexed ${res.indexedCount} catalog items & orders in ${res.durationMs}ms.`);
    setTimeout(() => setIndexSuccessMsg(''), 5000);
  };

  const currentTemplate = notificationTemplates.find((t) => t.id === selectedTemplateId) || notificationTemplates[0];

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplate) return;
    updateNotificationTemplate(currentTemplate.id, templateBody);
    alert('Notification template updated successfully.');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 bg-[#1C1917] text-white rounded-xl">
              <Settings2 className="w-5 h-5 text-[#E27B58]" />
            </span>
            <h1 className="font-display font-bold text-2xl text-stone-900 italic">
              Platform Governance, Rules & Security
            </h1>
          </div>
          <p className="text-stone-500 text-xs">
            Configure business rules engine thresholds, feature flag rollouts, active RBAC sessions, notification templates, and search indexing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRebuildSearchIndex}
            disabled={isRebuildingIndex}
            className="btn-secondary text-xs flex items-center gap-2 px-4 py-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#E27B58] ${isRebuildingIndex ? 'animate-spin' : ''}`} />
            <span>{isRebuildingIndex ? 'Rebuilding Search Index...' : 'Rebuild Search Index'}</span>
          </button>
        </div>
      </div>

      {indexSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{indexSuccessMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E7E5E0] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('RULES')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'RULES' ? 'bg-[#1C1917] text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 inline mr-1.5" />
          Business Rules Engine ({businessRules.length})
        </button>
        <button
          onClick={() => setActiveTab('FEATURE_FLAGS')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'FEATURE_FLAGS' ? 'bg-[#1C1917] text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Radio className="w-3.5 h-3.5 inline mr-1.5" />
          Feature Flags & Rollouts ({featureFlags.length})
        </button>
        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'SECURITY' ? 'bg-[#1C1917] text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 inline mr-1.5" />
          Active Sessions & Security ({securitySessions.length})
        </button>
        <button
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'NOTIFICATIONS' ? 'bg-[#1C1917] text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Bell className="w-3.5 h-3.5 inline mr-1.5" />
          Notification Templates ({notificationTemplates.length})
        </button>
      </div>

      {/* Rules Engine */}
      {activeTab === 'RULES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {businessRules.map((rule) => (
            <div key={rule.id} className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono-tech text-[10px] uppercase font-bold">
                    {rule.category}
                  </span>
                  <h3 className="font-bold text-stone-900 text-base mt-1">{rule.name}</h3>
                </div>
                <span className="font-mono text-xs text-stone-400">{rule.id}</span>
              </div>

              <p className="text-stone-500 text-xs leading-relaxed">{rule.description}</p>

              <div className="pt-2 border-t border-[#E7E5E0] flex items-center justify-between text-xs">
                <span className="text-stone-600">Current Parameter Value:</span>
                <input
                  type="text"
                  value={String(rule.value)}
                  onChange={(e) => updateBusinessRule(rule.id, e.target.value)}
                  className="bg-[#F8F7F4] border border-[#E7E5E0] rounded-lg px-3 py-1 font-mono font-bold text-stone-900 focus:outline-none w-32 text-right"
                />
              </div>

              <div className="text-[10px] text-stone-400 font-mono-tech text-right">
                Last modified by {rule.lastModifiedBy} ({rule.lastModifiedAt})
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feature Flags */}
      {activeTab === 'FEATURE_FLAGS' && (
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F4] text-stone-500 font-mono-tech uppercase border-b border-[#E7E5E0]">
                <tr>
                  <th className="p-3">Flag Key</th>
                  <th className="p-3">Feature Name & Scope</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Rollout %</th>
                  <th className="p-3 text-right">Toggle Switch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {featureFlags.map((flag) => (
                  <tr key={flag.id} className="hover:bg-stone-50">
                    <td className="p-3 font-mono font-bold text-stone-900">{flag.key}</td>
                    <td className="p-3">
                      <div className="font-bold text-stone-900">{flag.name}</div>
                      <div className="text-stone-500 text-[11px]">{flag.description}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono-tech uppercase font-bold ${
                        flag.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {flag.enabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={flag.rolloutPercentage}
                        onChange={(e) => updateFeatureFlagRollout(flag.id, Number(e.target.value))}
                        className="w-16 bg-[#F8F7F4] border border-[#E7E5E0] rounded px-2 py-0.5 font-bold focus:outline-none"
                      /> %
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleFeatureFlag(flag.id)}
                        className="p-1 cursor-pointer text-stone-800 hover:text-stone-900"
                      >
                        {flag.enabled ? (
                          <ToggleRight className="w-7 h-7 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-stone-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security Sessions */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-stone-900 text-base">Active Administrative Sessions & Audit Security</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F4] text-stone-500 font-mono-tech uppercase border-b border-[#E7E5E0]">
                <tr>
                  <th className="p-3">User & Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">IP & Location</th>
                  <th className="p-3">Device Agent</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Security Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {securitySessions.map((session) => (
                  <tr key={session.id} className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-stone-900">
                      {session.userName}
                      <div className="text-stone-400 text-[11px] font-normal">{session.userEmail}</div>
                    </td>
                    <td className="p-3 font-mono-tech font-bold text-[#E27B58]">{session.role}</td>
                    <td className="p-3 font-mono">
                      {session.ipAddress}
                      <div className="text-stone-400 text-[11px]">{session.location}</div>
                    </td>
                    <td className="p-3 text-stone-600 truncate max-w-[150px]">{session.device}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono-tech uppercase font-bold ${
                        session.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : session.status === 'FLAGGED'
                          ? 'bg-terracotta text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {session.status} {session.isCurrent && '(CURRENT)'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {session.status === 'ACTIVE' && !session.isCurrent && (
                        <button
                          onClick={() => terminateSecuritySession(session.id)}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Revoke Session
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notifications Template Editor */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white border border-[#E7E5E0] rounded-2xl p-4 shadow-sm space-y-2">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider font-mono-tech px-2 py-1">Templates</h4>
            {notificationTemplates.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedTemplateId(t.id);
                  setTemplateBody(t.body);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1 ${
                  selectedTemplateId === t.id
                    ? 'bg-[#1C1917] text-white border-[#1C1917]'
                    : 'bg-[#F8F7F4] border-[#E7E5E0] hover:bg-stone-100 text-stone-900'
                }`}
              >
                <div className="font-semibold">{t.title}</div>
                <div className="font-mono text-[10px] opacity-70">{t.type} • {t.id}</div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-8 bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-sm space-y-4">
            {currentTemplate ? (
              <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{currentTemplate.title}</h3>
                  <div className="text-stone-500 text-[11px] mt-0.5">Placeholders available: &#123;&#123;customer_name&#125;&#123;, &#123;&#123;order_id&#125;&#123;, &#123;&#123;tracking_ref&#125;&#123;</div>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Email Subject</label>
                  <input
                    type="text"
                    value={currentTemplate.subject}
                    onChange={() => {}}
                    className="w-full bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl p-2.5 font-medium text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Notification Body Content</label>
                  <textarea
                    rows={6}
                    value={templateBody}
                    onChange={(e) => setTemplateBody(e.target.value)}
                    className="w-full bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl p-3 font-mono text-stone-900 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="submit" className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2">
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Notification Template</span>
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
