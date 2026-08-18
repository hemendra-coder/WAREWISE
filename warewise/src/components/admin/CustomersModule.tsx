import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Users,
  Headphones,
  Star,
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Search,
  Filter,
  ShieldAlert,
  Bot,
  Mail,
  Smartphone,
  Calendar,
  AlertTriangle,
  RefreshCw,
  FileText,
  Sparkles
} from 'lucide-react';
import { SupportTicket, ReturnRMA } from '../../types';

export const CustomersModule: React.FC = () => {
  const {
    supportTickets,
    replyToSupportTicket,
    updateTicketStatus,
    returnRMAs,
    approveRMA,
    rejectRMA,
    processInstantRefund,
    orders,
    currentUser
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState<'TICKETS' | 'RETURNS_RMA' | 'DIRECTORY' | 'REVIEWS'>('TICKETS');
  const [selectedTicketId, setSelectedTicketId] = useState<string>(supportTickets[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');

  const selectedTicket = supportTickets.find((t) => t.id === selectedTicketId) || supportTickets[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    replyToSupportTicket(selectedTicket.id, replyText, 'AGENT');
    setReplyText('');
  };

  const handleCopilotSuggestReply = () => {
    if (!selectedTicket) return;
    const suggested = `Hello ${selectedTicket.customerName}, our warehouse dispatch engine has fast-tracked your order #${selectedTicket.orderId || 'ORD-WW-1042'}. Handoff to courier express wave is in progress.`;
    setReplyText(suggested);
  };

  const handleApproveReturnRMA = (rmaId: string, orderId: string, amount: number) => {
    approveRMA(rmaId, 'Approved by Support Agent via Customer Operations Portal');
    processInstantRefund(orderId, rmaId, amount, 'RMA Return Approved');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-lux flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 bg-[#1C1917] text-white rounded-xl">
              <Headphones className="w-5 h-5 text-[#E27B58]" />
            </span>
            <h1 className="font-display font-bold text-2xl text-stone-900 italic">
              Customer Operations & Helpdesk
            </h1>
          </div>
          <p className="text-stone-500 text-xs">
            2-way SLA support desk, RMA returns authorization, instant UPI refunds, customer accounts & review moderation.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono-tech text-xs">
          <div className="bg-[#F8F7F4] border border-[#E7E5E0] px-3 py-1.5 rounded-xl">
            Open Tickets: <strong className="text-stone-900">{supportTickets.filter(t => t.status !== 'RESOLVED').length}</strong>
          </div>
          <div className="bg-[#F8F7F4] border border-[#E7E5E0] px-3 py-1.5 rounded-xl">
            Pending RMAs: <strong className="text-terracotta">{returnRMAs.filter(r => r.status === 'REQUESTED' || r.status === 'PICKUP_SCHEDULED').length}</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E7E5E0] pb-2">
        <button
          onClick={() => setActiveTab('TICKETS')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'TICKETS' ? 'bg-[#1C1917] text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Headphones className="w-3.5 h-3.5 inline mr-1.5" />
          Support Desk ({supportTickets.length})
        </button>
        <button
          onClick={() => setActiveTab('RETURNS_RMA')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'RETURNS_RMA' ? 'bg-[#1C1917] text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5 inline mr-1.5" />
          Returns & RMAs ({returnRMAs.length})
        </button>
        <button
          onClick={() => setActiveTab('DIRECTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'DIRECTORY' ? 'bg-[#1C1917] text-white' : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Users className="w-3.5 h-3.5 inline mr-1.5" />
          Customer Accounts Directory
        </button>
      </div>

      {/* Support Desk View */}
      {activeTab === 'TICKETS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
          {/* Ticket List Column */}
          <div className="lg:col-span-5 bg-white border border-[#E7E5E0] rounded-2xl p-4 shadow-sm space-y-3 flex flex-col">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search ticket number, customer, email..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="w-full bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[500px]">
              {supportTickets
                .filter((t) =>
                  t.customerName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                  t.ticketNumber.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                  t.subject.toLowerCase().includes(ticketSearch.toLowerCase())
                )
                .map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-[#1C1917] text-white border-[#1C1917] shadow-md'
                          : 'bg-[#F8F7F4]/60 border-[#E7E5E0] hover:bg-stone-100 text-stone-900'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono-tech">
                        <span className={isSelected ? 'text-stone-300' : 'text-stone-500'}>
                          {t.ticketNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            t.priority === 'URGENT' || t.priority === 'HIGH'
                              ? 'bg-terracotta text-white'
                              : isSelected
                              ? 'bg-stone-800 text-stone-300'
                              : 'bg-stone-200 text-stone-800'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>

                      <h4 className="font-semibold text-xs truncate">{t.subject}</h4>

                      <div className="flex items-center justify-between text-[11px] opacity-80 pt-1 border-t border-stone-200/20">
                        <span>{t.customerName}</span>
                        <span>SLA: {t.slaDeadline}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Ticket Detail & Conversation Stream */}
          <div className="lg:col-span-7 bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
            {selectedTicket ? (
              <>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E7E5E0] pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-stone-400">{selectedTicket.ticketNumber}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono-tech text-[10px] font-bold">
                          {selectedTicket.status}
                        </span>
                      </div>
                      <h2 className="font-bold text-stone-900 text-lg">{selectedTicket.subject}</h2>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Customer: <strong className="text-stone-800">{selectedTicket.customerName}</strong> ({selectedTicket.customerEmail})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as any)}
                        className="bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-800 focus:outline-none"
                      >
                        <option value="OPEN">Mark Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </div>
                  </div>

                  {/* Messages Timeline */}
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                    {selectedTicket.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                          m.sender === 'CUSTOMER'
                            ? 'bg-[#F8F7F4] border border-[#E7E5E0] text-stone-900'
                            : m.sender === 'AI_COPILOT'
                            ? 'bg-amber-50/80 border border-amber-200/80 text-stone-900'
                            : 'bg-stone-900 text-white ml-6'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-mono-tech opacity-75">
                          <span className="font-bold uppercase flex items-center gap-1">
                            {m.sender === 'AI_COPILOT' && <Bot className="w-3 h-3 text-[#E27B58]" />}
                            {m.senderName}
                          </span>
                          <span>{m.timestamp}</span>
                        </div>
                        <p className="leading-relaxed">{m.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="space-y-3 pt-4 border-t border-[#E7E5E0]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-700">Write Customer Response</span>
                    <button
                      type="button"
                      onClick={handleCopilotSuggestReply}
                      className="text-[11px] text-[#E27B58] hover:text-stone-900 font-mono-tech font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>AI Copilot Smart Reply</span>
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    required
                    placeholder="Type official support message to customer..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl p-3 text-xs text-stone-900 focus:outline-none"
                  />

                  <div className="flex justify-end gap-2">
                    <button type="submit" className="btn-primary text-xs px-5 py-2 flex items-center gap-2">
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Official Reply</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-stone-400 text-center py-20 text-xs">Select a ticket to view messages.</div>
            )}
          </div>
        </div>
      )}

      {/* RMAs Table View */}
      {activeTab === 'RETURNS_RMA' && (
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-stone-900 text-base">Return Request & RMA Management</h3>
            <span className="text-xs font-mono text-stone-500">Automated Instant Gateway Credit Enabled</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F4] text-stone-500 font-mono-tech uppercase border-b border-[#E7E5E0]">
                <tr>
                  <th className="p-3">RMA Ref</th>
                  <th className="p-3">Customer & Order</th>
                  <th className="p-3">Product SKU</th>
                  <th className="p-3">Return Reason</th>
                  <th className="p-3">Refund Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {returnRMAs.map((rma) => (
                  <tr key={rma.id} className="hover:bg-stone-50">
                    <td className="p-3 font-mono font-bold text-stone-900">{rma.rmaNumber}</td>
                    <td className="p-3">
                      <div className="font-bold text-stone-900">{rma.customerName}</div>
                      <div className="text-stone-400 text-[11px] font-mono">{rma.orderId}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-stone-900">{rma.productName}</div>
                      <div className="text-stone-400 text-[11px] font-mono">{rma.sku}</div>
                    </td>
                    <td className="p-3 font-semibold text-stone-800">{rma.reason}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">₹{rma.refundAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono-tech uppercase font-bold ${
                        rma.status === 'REFUND_ISSUED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rma.status === 'APPROVED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rma.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {rma.status === 'REQUESTED' ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleApproveReturnRMA(rma.id, rma.orderId, rma.refundAmount)}
                            className="px-3 py-1 bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Approve & Instant Refund
                          </button>
                          <button
                            onClick={() => rejectRMA(rma.id, 'Invalid claim')}
                            className="px-2.5 py-1 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Directory View */}
      {activeTab === 'DIRECTORY' && (
        <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-stone-900 text-base">Registered Customer Accounts Directory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl space-y-2 text-xs">
              <div className="font-bold text-stone-900 text-sm">Kishore Venkat</div>
              <div className="text-stone-500">srivenkatakishoren@gmail.com</div>
              <div className="text-stone-500">+91 98450 78901</div>
              <div className="pt-2 border-t border-[#E7E5E0] flex justify-between font-mono-tech text-[11px]">
                <span>Orders Placed: <strong>8</strong></span>
                <span className="text-[#E27B58] font-bold">ENTERPRISE VIP</span>
              </div>
            </div>

            <div className="p-4 bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl space-y-2 text-xs">
              <div className="font-bold text-stone-900 text-sm">Marcus Vance</div>
              <div className="text-stone-500">m.vance@aerotech.io</div>
              <div className="text-stone-500">+91 98801 23456</div>
              <div className="pt-2 border-t border-[#E7E5E0] flex justify-between font-mono-tech text-[11px]">
                <span>Orders Placed: <strong>4</strong></span>
                <span className="text-stone-700 font-bold">PRO TIER</span>
              </div>
            </div>

            <div className="p-4 bg-[#F8F7F4] border border-[#E7E5E0] rounded-xl space-y-2 text-xs">
              <div className="font-bold text-stone-900 text-sm">Ananya Deshmukh</div>
              <div className="text-stone-500">ananya.d@fintech-labs.in</div>
              <div className="text-stone-500">+91 94480 55432</div>
              <div className="pt-2 border-t border-[#E7E5E0] flex justify-between font-mono-tech text-[11px]">
                <span>Orders Placed: <strong>2</strong></span>
                <span className="text-stone-700 font-bold">STANDARD</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
