import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  Zap,
  Radio,
  RadioTower,
  CornerDownLeft,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../../types';

interface VoicePickingControllerProps {
  activeOrder?: Order;
  currentWaypoint?: {
    sku: string;
    itemName: string;
    binLocation: string;
    quantity: number;
    stepNumber: number;
  };
  completedSkus: Record<string, boolean>;
  onPickSku: (sku: string, qty: number, source: 'voice' | 'manual') => void;
  onNextStep: () => void;
  onReroute?: () => void;
  isOnline: boolean;
}

// Extend Window interface for Webkit SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const VoicePickingController: React.FC<VoicePickingControllerProps> = ({
  activeOrder,
  currentWaypoint,
  completedSkus,
  onPickSku,
  onNextStep,
  onReroute,
  isOnline
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState(true);
  const [lastMatchedCommand, setLastMatchedCommand] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [showCommandsModal, setShowCommandsModal] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Audio Speech Synthesis feedback helper
  const speakFeedback = (text: string) => {
    if (!audioFeedbackEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Stop ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  };

  // Initialize SpeechRecognition Engine
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback({ type: 'info', text: '🎙️ Headset Microphone Active. Say "Pick next item" or "Pick SKU..."' });
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech Recognition Event Error:', event.error);
        if (event.error === 'not-allowed') {
          setFeedback({ type: 'error', text: 'Microphone permission blocked. Click simulated commands below to test.' });
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          // Normal timeout, ignore or keep listening
        }
      };

      recognition.onend = () => {
        // Auto-restart if user kept listening active
        if (recognitionRef.current?.keepAlive) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalSentence = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalSentence += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(currentInterim);

        if (finalSentence) {
          const cleanText = finalSentence.trim();
          setTranscript(cleanText);
          processVoiceCommand(cleanText);
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Failed to construct SpeechRecognition:', err);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.keepAlive = false;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [activeOrder, currentWaypoint, completedSkus]);

  // Command processing logic matching voice against order items & SKUs
  const processVoiceCommand = (phrase: string) => {
    if (!activeOrder) return;

    const text = phrase.toLowerCase().replace(/[-_]/g, ' ');
    setLastMatchedCommand(phrase);

    // 1. Voice Pick Current Target Waypoint ("Pick current", "Pick item", "Got it", "Confirmed", "Pick next")
    if (
      text.includes('pick current') ||
      text.includes('pick next') ||
      text.includes('confirm pick') ||
      text.includes('got it') ||
      text.includes('item picked') ||
      text.includes('confirm') ||
      text.includes('picked')
    ) {
      if (currentWaypoint) {
        onPickSku(currentWaypoint.sku, currentWaypoint.quantity, 'voice');
        const feedbackMsg = `Picked ${currentWaypoint.quantity}x ${currentWaypoint.itemName} from Bin ${currentWaypoint.binLocation}`;
        setFeedback({ type: 'success', text: `✓ VOICE LOGGED: ${feedbackMsg}` });
        speakFeedback(`Item ${currentWaypoint.sku} confirmed.`);
        return;
      }
    }

    // 2. Direct SKU or Item Name Voice Match
    const matchedItem = activeOrder.items.find((item) => {
      const skuClean = item.sku.toLowerCase().replace(/[-_]/g, ' ');
      const nameClean = item.name.toLowerCase();
      // Extract numbers or words from phrase
      return (
        text.includes(skuClean) ||
        text.includes(nameClean) ||
        (skuClean.includes('5090') && text.includes('5090')) ||
        (skuClean.includes('air') && text.includes('air max')) ||
        (skuClean.includes('coffee') && text.includes('coffee')) ||
        (skuClean.includes('watch') && text.includes('apple watch')) ||
        (skuClean.includes('drone') && text.includes('drone'))
      );
    });

    if (matchedItem) {
      onPickSku(matchedItem.sku, matchedItem.quantity, 'voice');
      const feedbackMsg = `Picked ${matchedItem.quantity}x ${matchedItem.name} (${matchedItem.sku})`;
      setFeedback({ type: 'success', text: `✓ VOICE VERIFIED: ${feedbackMsg}` });
      speakFeedback(`Picked ${matchedItem.name}.`);
      return;
    }

    // 3. Navigation Voice Commands ("Next step", "Skip item", "Reroute")
    if (text.includes('next') || text.includes('skip')) {
      onNextStep();
      setFeedback({ type: 'info', text: '⏩ Advanced to next waypoint location in route.' });
      speakFeedback('Moving to next pick location.');
      return;
    }

    if (text.includes('reroute') || text.includes('alternate')) {
      if (onReroute) {
        onReroute();
        speakFeedback('Rerouting picker to alternate bin.');
      }
      return;
    }

    // Unrecognized Command Feedback
    setFeedback({
      type: 'error',
      text: `❓ Unrecognized command: "${phrase}". Try "Pick SKU ${currentWaypoint?.sku || ''}" or "Confirm pick".`
    });
    speakFeedback('Command not recognized.');
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Simulate voice activation for browsers without native Speech API
      setIsListening(!isListening);
      if (!isListening) {
        setFeedback({ type: 'info', text: '🎙️ Simulated Voice Picking Active. Select a voice shortcut below.' });
      }
      return;
    }

    if (isListening) {
      recognitionRef.current.keepAlive = false;
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
      setFeedback({ type: 'info', text: 'Voice microphone paused.' });
    } else {
      recognitionRef.current.keepAlive = true;
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition start error:', e);
        setIsListening(true);
      }
    }
  };

  // Simulate a specific spoken voice phrase for testing & demonstration
  const handleSimulateVoicePhrase = (phrase: string) => {
    setTranscript(phrase);
    processVoiceCommand(phrase);
  };

  return (
    <div
      role="region"
      aria-label="Order Clerk Voice-to-Text Hands-Free Audio Picking Controller"
      className="bg-[#1F1F23] rounded-2xl p-5 border border-amber-500/30 shadow-2xl relative overflow-hidden text-stone-100"
    >
      {/* Background glow when listening */}
      <div
        className={`absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isListening ? 'bg-amber-500/20 scale-125' : 'bg-stone-800/20 scale-90'
        }`}
      />

      <div className="relative z-10 space-y-4">
        {/* Header Controller Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-stone-950 shadow-lg shadow-amber-500/20 animate-pulse'
                  : 'bg-stone-800 text-stone-400 border border-stone-700'
              }`}
            >
              <Mic className="w-5 h-5" aria-hidden="true" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 font-mono-tech uppercase">
                  <span>ORDER CLERK VOICE PICK CONTROLLER</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    WEB SPEECH API
                  </span>
                </h3>
              </div>
              <p className="text-xs text-stone-400">
                Hands-free audio picking for warehouse order clerks & route pickers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Audio Speech Synthesis Toggle */}
            <button
              type="button"
              onClick={() => setAudioFeedbackEnabled(!audioFeedbackEnabled)}
              aria-label={audioFeedbackEnabled ? 'Disable Text-to-Speech audio readback' : 'Enable Text-to-Speech audio readback'}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                audioFeedbackEnabled
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
              }`}
              title={audioFeedbackEnabled ? 'Audio Speech Feedback Enabled' : 'Mute Audio Readback'}
            >
              {audioFeedbackEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{audioFeedbackEnabled ? 'TTS On' : 'TTS Muted'}</span>
            </button>

            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={toggleListening}
              aria-pressed={isListening}
              aria-label={isListening ? 'Pause voice recognition microphone' : 'Start voice recognition microphone'}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isListening
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 ring-2 ring-amber-400/50'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
              }`}
            >
              {isListening ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stone-950 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-stone-950"></span>
                  </span>
                  <span>PAUSE MIC</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-amber-400" />
                  <span>START VOICE PICK</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Active Waypoint Display & Audio Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Active Target Banner */}
          <div className="md:col-span-2 bg-stone-900/90 rounded-xl p-3.5 border border-stone-800 flex items-center justify-between gap-3">
            {currentWaypoint ? (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <span className="text-amber-400 font-mono font-bold text-sm">
                    #{currentWaypoint.stepNumber}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                    CURRENT TARGET BIN: <span className="font-bold underline">{currentWaypoint.binLocation}</span>
                  </div>
                  <div className="text-xs font-semibold text-white truncate">
                    {currentWaypoint.itemName}
                  </div>
                  <div className="text-[11px] text-stone-400 font-mono">
                    SKU: {currentWaypoint.sku} • Qty: <span className="text-emerald-400 font-bold">{currentWaypoint.quantity}x</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-stone-400 italic">No active pick waypoint selected.</div>
            )}

            {currentWaypoint && (
              <button
                type="button"
                onClick={() => onPickSku(currentWaypoint.sku, currentWaypoint.quantity, 'voice')}
                aria-label={`Confirm voice pick for ${currentWaypoint.itemName} SKU ${currentWaypoint.sku}`}
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CONFIRM PICK</span>
              </button>
            )}
          </div>

          {/* Transcript / Sound Wave Bar */}
          <div className="bg-stone-900/90 rounded-xl p-3.5 border border-stone-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 uppercase">
              <span>VOICE TRANSCRIPT</span>
              {isListening && (
                <span className="flex items-center gap-1 text-emerald-400 animate-pulse">
                  <Activity className="w-3 h-3" /> LISTENING
                </span>
              )}
            </div>

            <div
              aria-live="polite"
              aria-atomic="true"
              className="mt-1 text-xs font-mono text-stone-200 min-h-[1.5rem] flex items-center truncate"
            >
              {transcript || interimTranscript ? (
                <span className="text-amber-300 italic">"{transcript || interimTranscript}"</span>
              ) : (
                <span className="text-stone-500 italic">Say command or click voice shortcut...</span>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Message Banner */}
        {feedback && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-2.5 rounded-xl text-xs font-mono flex items-center justify-between border shadow-sm ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : feedback.type === 'error'
                  ? 'bg-red-950/60 border-red-500/40 text-red-200'
                  : 'bg-stone-900 border-amber-500/30 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Voice Command Quick Simulators / Shortcuts Bar */}
        <div className="pt-2 border-t border-stone-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono-tech uppercase text-stone-400 tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>HANDS-FREE VOICE SHORTCUT SIMULATION</span>
            </span>
            <button
              onClick={() => setShowCommandsModal(!showCommandsModal)}
              className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              {showCommandsModal ? 'Hide Commands' : 'View Command Cheat Sheet'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentWaypoint && (
              <button
                onClick={() => handleSimulateVoicePhrase(`Pick current item ${currentWaypoint.sku}`)}
                className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Mic className="w-3 h-3 text-amber-400" />
                <span>🎤 "Pick {currentWaypoint.sku}"</span>
              </button>
            )}

            <button
              onClick={() => handleSimulateVoicePhrase('Pick next item')}
              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Mic className="w-3 h-3 text-amber-400" />
              <span>🎤 "Pick next item"</span>
            </button>

            <button
              onClick={() => handleSimulateVoicePhrase('Next waypoint')}
              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Mic className="w-3 h-3 text-amber-400" />
              <span>🎤 "Next waypoint"</span>
            </button>

            <button
              onClick={() => handleSimulateVoicePhrase('Confirm bin A 02 1')}
              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Mic className="w-3 h-3 text-amber-400" />
              <span>🎤 "Confirm bin location"</span>
            </button>
          </div>

          {/* Expanded Cheat Sheet */}
          {showCommandsModal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-stone-900/90 rounded-xl border border-stone-800 text-xs font-mono space-y-2 text-stone-300"
            >
              <div className="font-bold text-amber-400 font-mono-tech uppercase">
                Warehouse Order Clerk Voice Syntax Reference:
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <li className="bg-stone-800/60 p-2 rounded border border-stone-700">
                  <span className="text-white font-bold">Pick Item:</span> "Pick SKU-G-FORCE-01", "Pick current", "Got item", "Pick GPU"
                </li>
                <li className="bg-stone-800/60 p-2 rounded border border-stone-700">
                  <span className="text-white font-bold">Advance Route:</span> "Next item", "Skip waypoint", "Confirm"
                </li>
                <li className="bg-stone-800/60 p-2 rounded border border-stone-700">
                  <span className="text-white font-bold">Verify Bin:</span> "Bin A-02-1", "Aisle A Bay 2"
                </li>
                <li className="bg-stone-800/60 p-2 rounded border border-stone-700">
                  <span className="text-white font-bold">Reroute:</span> "Reroute picker", "Alternate bin"
                </li>
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
