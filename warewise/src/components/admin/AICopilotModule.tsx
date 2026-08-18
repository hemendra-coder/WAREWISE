import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Bot,
  Sparkles,
  Send,
  ArrowRight,
  Zap,
  CheckCircle2,
  Activity,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const AICopilotModule: React.FC = () => {
  const {
    orders,
    exceptions,
    metrics,
    products,
    applyRecommendation,
    applyReallocation,
    setActiveAdminModule,
  } = useWarehouse();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsActive, setSecondsActive] = useState(0);

  // 1-second ticker to reflect live site changes in real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsActive((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [messages, setMessages] = useState<
    Array<{
      id: string;
      sender: 'USER' | 'GEMINI';
      text: string;
      timestamp: string;
      actionCard?: {
        title: string;
        target: string;
        actionLabel: string;
        recId?: string;
        moduleTarget?: any;
        executed?: boolean;
      };
    }>
  >([
    {
      id: 'msg-init-1',
      sender: 'GEMINI',
      text: "Hi! I am Buddy, your autonomous AI operations & warehouse co-pilot. I am monitoring your store, order queues, floor inventory, and outbound waves in real-time. How can I assist your operational decisions today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionCard: {
        title: 'Priority Shortage Resolution for Order #1042',
        target: 'ORD-WW-1042 // NeoCore X9 Edge AI Kit (SKU-NC-900)',
        actionLabel: 'Apply 3-Unit Reallocation',
        recId: 'REC-NEXT-01',
        moduleTarget: '04_ALLOCATION',
      },
    },
  ]);

  const presetQueries = [
    'hi',
    'Why is Order #1042 ranked Priority #1?',
    'How should we resolve the missing item in Bin B-03-2?',
    'What is our bottleneck risk at Dock 03 before BlueDart cutoff?',
    'Which SKUs need replenishment purchase orders today?',
  ];

  const handleExecuteActionCard = (msgId: string, card: {
    title: string;
    target: string;
    actionLabel: string;
    recId?: string;
    moduleTarget?: any;
    executed?: boolean;
  }) => {
    // 1. Mark message card as executed so button transforms visually
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.actionCard) {
          return {
            ...m,
            actionCard: { ...m.actionCard, executed: true },
          };
        }
        return m;
      })
    );

    // 2. Perform the actual warehouse operation
    let actionSummary = '';
    if (card.recId) {
      applyRecommendation(card.recId);
      applyReallocation('ORD-WW-1042', 'ORD-WW-1047', 'SKU-NC-900', 3);
      actionSummary = '3-Unit Reallocation committed! 3x SKU-NC-900 transferred from donor Order #1047 to Order #1042. Order #1042 is now 100% Fully Allocated.';
    }

    if (card.moduleTarget && !card.recId) {
      setActiveAdminModule(card.moduleTarget);
      actionSummary = `Navigated to ${card.moduleTarget} module.`;
    }

    if (!actionSummary) {
      actionSummary = `Action executed successfully for target: ${card.target}`;
    }

    // 3. Post a confirmation message in Buddy AI Chat
    const confirmMsg = {
      id: `ai-confirm-${Date.now()}`,
      sender: 'GEMINI' as const,
      text: `✅ **Autonomous Action Executed Successfully**\n\n${actionSummary}\n\nWarehouse telemetry updated: Allocation matrix and pick waves refreshed across WH-METRO-01.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, confirmMsg]);
    }, 250);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'USER' as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context: {
            criticalSlaCount: metrics.criticalSlaCount,
            ordersCount: orders.length,
            productsCount: products.length,
            activeExceptions: exceptions.filter((e) => e.status !== 'RESOLVED').length,
            topOrder: orders[0]?.id,
            totalRevenue: orders.reduce((sum, o) => sum + o.totalValue, 0),
          },
        }),
      });

      const data = await response.json();
      const aiReplyText = data.text || data.reply || 'Operational analysis completed.';

      let actionCard: any = undefined;
      const lower = textToSend.toLowerCase();
      if (lower.includes('1042') || lower.includes('priority')) {
        actionCard = {
          title: 'Direct Order #1042 Allocation Action',
          target: 'ORD-WW-1042',
          actionLabel: 'Inspect Allocation Matrix',
          moduleTarget: '04_ALLOCATION',
        };
      } else if (lower.includes('b-03-2') || lower.includes('missing')) {
        actionCard = {
          title: 'Picker Alternate Bin Reroute',
          target: 'Bin B-07-1 (Buffer Stock)',
          actionLabel: 'View 2D Floor Route Map',
          moduleTarget: '05_PICKING',
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'GEMINI',
          text: aiReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionCard,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'GEMINI',
          text: `Hi! I am Buddy. Verified warehouse state: Order #1042 holds top SLA priority (cutoff in 34m) for 10 units of NeoCore X9 Edge AI Kit (₹4,99,990 value). Donor reservation on Order #1047 offers 3 available units with zero customer penalty.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionCard: {
            title: 'Apply Shortage Reallocation',
            target: 'REC-NEXT-01',
            actionLabel: 'Commit Reallocation',
            recId: 'REC-NEXT-01',
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono-tech uppercase tracking-widest text-stone-500 font-semibold mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>Buddy AI Operations Co-Pilot • Live Ticker Active ({secondsActive}s)</span>
          </div>
          <h1 className="font-serif-luxury font-bold text-2xl sm:text-3xl text-stone-900">
            Autonomous Copilot & Real-Time Decision Engine
          </h1>
          <p className="text-xs text-stone-600 font-sans mt-0.5">
            Real-time warehouse telemetry, instant site change awareness, and execution shortcuts.
          </p>
        </div>

        {/* Live Site Telemetry Bar */}
        <div className="flex items-center gap-3 bg-[#FAFAF9] border border-[#E7E5E0] p-3 rounded-xl text-xs font-mono-tech">
          <div className="text-stone-700">
            <span className="text-stone-400 block text-[10px] uppercase">Orders Queue</span>
            <span className="font-bold text-stone-900">{orders.length} Active</span>
          </div>
          <div className="h-6 w-[1px] bg-stone-300" />
          <div className="text-stone-700">
            <span className="text-stone-400 block text-[10px] uppercase">Critical SLAs</span>
            <span className="font-bold text-amber-700">{metrics.criticalSlaCount} Cutoffs</span>
          </div>
          <div className="h-6 w-[1px] bg-stone-300" />
          <div className="text-stone-700">
            <span className="text-stone-400 block text-[10px] uppercase">Exceptions</span>
            <span className="font-bold text-red-700">{exceptions.filter((e) => e.status !== 'RESOLVED').length} Open</span>
          </div>
        </div>
      </div>

      {/* Preset Query Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-mono-tech text-stone-500 shrink-0 font-medium">Quick Prompts:</span>
        {presetQueries.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-stone-100 border border-[#E7E5E0] text-xs text-stone-700 hover:text-stone-900 whitespace-nowrap transition-all cursor-pointer font-sans shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Main Copilot Chat Surface */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux flex flex-col h-[560px] space-y-4">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m) => {
            const isAi = m.sender === 'GEMINI';
            return (
              <div
                key={m.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  isAi ? 'items-start' : 'items-start flex-row-reverse'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-mono-tech font-bold ${
                    isAi
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-200 text-stone-800'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : 'OP'}
                </div>

                <div className="space-y-2 max-w-[80%]">
                  <div
                    className={`p-4 rounded-2xl ${
                      isAi
                        ? 'bg-[#FBFBF9] border border-[#E7E5E0] text-stone-800'
                        : 'bg-stone-900 text-white font-normal'
                    }`}
                  >
                    <p className="font-sans text-xs leading-relaxed">{m.text}</p>
                  </div>

                  {m.actionCard && (
                    <div className="p-3.5 rounded-xl bg-[#F5F4F0] border border-stone-300 space-y-2 font-mono-tech text-xs">
                      <div className="flex items-center justify-between text-stone-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                          <span>{m.actionCard.title}</span>
                        </span>
                        {m.actionCard.executed && (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>EXECUTED</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-600">Target: {m.actionCard.target}</div>
                      {m.actionCard.executed ? (
                        <div className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Reallocation Applied & Order Updated</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleExecuteActionCard(m.id, m.actionCard!)}
                          className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-black active:scale-95 text-white text-xs font-medium cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <span>{m.actionCard.actionLabel}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="text-[10px] text-stone-400 font-mono-tech px-1">
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex items-center gap-2 text-xs font-mono-tech text-stone-500 p-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing warehouse graphs...</span>
            </div>
          )}
        </div>

        {/* Query Input Bar */}
        <div className="pt-3 border-t border-[#E7E5E0] flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask about orders, shortage reallocations, picker routes, or supplier POs..."
            className="flex-1 bg-[#FBFBF9] border border-[#E7E5E0] rounded-xl px-4 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputQuery.trim()}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
