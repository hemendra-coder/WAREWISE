import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  ArrowRight,
  CheckCircle2,
  Volume2
} from 'lucide-react';

export const VoiceSearchModal: React.FC = () => {
  const {
    isVoiceSearchOpen,
    setIsVoiceSearchOpen,
    setCustomerSearchQuery,
    setActiveCustomerNavTab
  } = useWarehouse();

  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [detectedIntent, setDetectedIntent] = useState<string | null>(null);

  const samplePrompts = [
    "Find AI Tensor Accelerators in Metro Hub",
    "Show pro workstations with 64GB RAM",
    "Track order ORD-WW-1042 dispatch wave",
    "Show GaN fast chargers under 5,000"
  ];

  useEffect(() => {
    if (!isVoiceSearchOpen) {
      setTranscript('');
      setDetectedIntent(null);
      return;
    }

    setIsListening(true);
    // Simulate voice listening waveform and realistic speech recognition
    const timer1 = setTimeout(() => {
      setTranscript("Looking for high throughput AI accelerators in Bangalore warehouse...");
      setDetectedIntent("Filter: Category: Edge Computing • Velocity: Same-Day");
    }, 1200);

    return () => clearTimeout(timer1);
  }, [isVoiceSearchOpen]);

  if (!isVoiceSearchOpen) return null;

  const handleApplyVoiceQuery = (query: string) => {
    setCustomerSearchQuery(query);
    setActiveCustomerNavTab('SHOP');
    setIsVoiceSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#E7E5E0] max-w-lg w-full p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 animate-fadeIn relative">
        <button
          onClick={() => setIsVoiceSearchOpen(false)}
          className="absolute top-4 right-4 p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-600 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-4 pt-2">
          {/* Animated Microphone Ring */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full bg-stone-900/10 ${isListening ? 'animate-ping' : ''}`} />
            <div className="w-16 h-16 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-lg relative z-10">
              {isListening ? <Mic className="w-7 h-7 animate-pulse text-amber-300" /> : <MicOff className="w-7 h-7 text-stone-400" />}
            </div>
          </div>

          <div>
            <h3 className="font-serif-luxury font-bold text-xl text-stone-900">
              {isListening ? 'Listening for Hardware Command...' : 'Voice Query Processed'}
            </h3>
            <p className="text-xs text-stone-500 font-mono-tech mt-1">
              Speak naturally to search specs, track consignments, or lock warehouse inventory
            </p>
          </div>

          {/* Transcript Box */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl min-h-[70px] flex flex-col justify-center text-left">
            <div className="text-[10px] font-mono-tech uppercase font-bold text-stone-400 mb-1">
              LIVE SPEECH TRANSCRIPTION
            </div>
            <p className="text-xs sm:text-sm font-sans text-stone-900 italic font-medium">
              "{transcript || 'Listening to microphone input...'}"
            </p>
            {detectedIntent && (
              <div className="mt-2 pt-2 border-t border-stone-200 text-[11px] font-mono-tech text-emerald-700 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>{detectedIntent}</span>
              </div>
            )}
          </div>

          {/* Quick Voice Suggestions */}
          <div className="text-left space-y-2">
            <div className="text-[10px] font-mono-tech uppercase font-bold text-stone-400">
              OR CHOOSE COMMON VOICE COMMANDS:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleApplyVoiceQuery(p)}
                  className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-800 text-left transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span className="line-clamp-1">{p}</span>
                  <ArrowRight className="w-3 h-3 text-stone-400 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3 font-mono-tech">
            <button
              onClick={() => handleApplyVoiceQuery(transcript || 'AI Accelerators')}
              className="w-full py-3 bg-stone-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Execute Voice Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
