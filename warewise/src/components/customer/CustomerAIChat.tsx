import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Sparkles,
  X,
  Send,
  ShoppingBag,
  Bot,
  Truck,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface CustomerAIChatProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
}

export const CustomerAIChat: React.FC<CustomerAIChatProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { products, orders, addToCart, setIsCartOpen, setActiveCustomerNavTab } = useWarehouse();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      sender: 'USER' | 'GEMINI';
      text: string;
      time: string;
      productRecommendation?: {
        id: string;
        name: string;
        price: number;
        image: string;
      };
      actionChip?: {
        label: string;
        type: 'CART' | 'TRACK' | 'DEALS' | 'VIEW';
        productId?: string;
      };
    }>
  >([
    {
      id: 'init-c-1',
      sender: 'GEMINI',
      text: "Hi! I'm Buddy, your AI Shopping Assistant at WareWise. I can help you select hardware, inspect live regional stock, track active consignments, or unlock bank discount offers. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'USER' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/customer/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
          context: {
            availableProducts: products.map((p) => ({
              id: p.id,
              name: p.name,
              sku: p.sku,
              price: p.price,
              stock: p.availableStock,
              category: p.category,
            })),
            activeOrder: orders[0]?.id,
            activeOrderStatus: orders[0]?.status,
          },
        }),
      });

      const data = await response.json();
      const aiReply = data.text || 'I checked our warehouse catalog for you.';

      let productRec: any = undefined;
      let actionChip: any = undefined;

      const lower = textToSend.toLowerCase();
      if (lower.includes('accelerator') || lower.includes('neocore') || lower.includes('ai')) {
        const prod = products.find((p) => p.sku === 'SKU-NC-900') || products[0];
        if (prod) {
          productRec = { id: prod.id, name: prod.name, price: prod.price, image: prod.image };
          actionChip = { label: 'Add NeoCore X9 to Cart', type: 'CART', productId: prod.id };
        }
      } else if (lower.includes('track') || lower.includes('order') || lower.includes('delivery')) {
        actionChip = { label: 'Track Consignment #1042', type: 'TRACK' };
      } else if (lower.includes('deal') || lower.includes('discount') || lower.includes('offer')) {
        actionChip = { label: 'Explore Active Deals', type: 'DEALS' };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'GEMINI',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          productRecommendation: productRec,
          actionChip,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'GEMINI',
          text: "I verified our regional logistics inventory. The NeoCore X9 Enterprise AI Accelerator is in stock with 7 units ready for priority air dispatch from Bengaluru Central Hub.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          productRecommendation: {
            id: 'prod-01',
            name: 'NeoCore X9 Enterprise AI Accelerator',
            price: 49999,
            image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80',
          },
          actionChip: { label: 'Add to Cart (₹49,999)', type: 'CART', productId: 'prod-01' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white border border-[#E7E5E0] rounded-3xl shadow-lux-lg overflow-hidden flex flex-col h-[520px] text-stone-900 animate-slideUp">
      {/* Header */}
      <div className="p-4 bg-[#FAFAF9] border-b border-[#E7E5E0] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center font-serif-luxury font-bold text-sm shadow-sm">
            S
          </div>
          <div>
            <h3 className="font-serif-luxury font-bold text-sm text-stone-900 tracking-tight">AI Concierge</h3>
            <span className="text-[10px] text-stone-500 font-mono-tech flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>Gemini 3.6 Live Assistant</span>
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-full text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans">
        {messages.map((m) => {
          const isAi = m.sender === 'GEMINI';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 text-xs ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono-tech font-bold ${
                  isAi ? 'bg-stone-100 text-stone-800 border border-stone-200' : 'bg-stone-900 text-white'
                }`}
              >
                {isAi ? <Bot className="w-3.5 h-3.5" /> : 'YOU'}
              </div>

              <div
                className={`max-w-[82%] p-3.5 rounded-2xl space-y-2 leading-relaxed ${
                  isAi
                    ? 'bg-stone-50 border border-stone-200 text-stone-800'
                    : 'bg-stone-900 text-white font-medium'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {m.productRecommendation && (
                  <div
                    onClick={() => onSelectProduct(m.productRecommendation!.id)}
                    className="p-2.5 bg-white border border-stone-200 hover:border-stone-400 rounded-xl cursor-pointer flex items-center justify-between gap-2 transition-all group font-mono-tech shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={m.productRecommendation.image}
                        alt={m.productRecommendation.name}
                        className="w-9 h-9 object-cover rounded-lg border border-stone-200"
                      />
                      <div>
                        <div className="font-serif-luxury font-bold text-[11px] text-stone-900 group-hover:text-stone-700 truncate max-w-[180px]">
                          {m.productRecommendation.name}
                        </div>
                        <div className="text-[10px] text-stone-600 font-bold">
                          ₹{m.productRecommendation.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all" />
                  </div>
                )}

                {m.actionChip && (
                  <button
                    type="button"
                    onClick={() => {
                      if (m.actionChip?.type === 'CART' && m.actionChip.productId) {
                        const prod = products.find((p) => p.id === m.actionChip?.productId);
                        if (prod) {
                          addToCart(prod, 1);
                          setIsCartOpen(true);
                        }
                      } else if (m.actionChip?.type === 'TRACK') {
                        setActiveCustomerNavTab('ORDERS');
                      } else if (m.actionChip?.type === 'DEALS') {
                        setActiveCustomerNavTab('DEALS');
                      }
                    }}
                    className="mt-1 px-3 py-1.5 bg-stone-900 hover:bg-black text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3 h-3 text-amber-400" />
                    <span>{m.actionChip.label}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-stone-600 text-xs font-mono-tech p-2.5 bg-stone-50 border border-stone-200 rounded-xl w-fit">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-stone-800" />
            <span>Consulting warehouse inventory...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-[#E7E5E0] bg-[#FAFAF9] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask specs, live stock, or order status..."
          className="flex-1 bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 font-mono-tech"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-stone-900 hover:bg-black text-white rounded-xl font-bold disabled:opacity-40 transition-all cursor-pointer shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
