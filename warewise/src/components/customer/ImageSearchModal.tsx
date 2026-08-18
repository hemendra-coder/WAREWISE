import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Camera,
  UploadCloud,
  Sparkles,
  X,
  ArrowRight,
  CheckCircle2,
  ScanLine
} from 'lucide-react';

export const ImageSearchModal: React.FC = () => {
  const {
    isImageSearchOpen,
    setIsImageSearchOpen,
    setCustomerSearchQuery,
    setActiveCustomerNavTab
  } = useWarehouse();

  const [analyzing, setAnalyzing] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);

  const sampleVisualTargets = [
    {
      title: 'PCI-e Tensor Inference Accelerator',
      category: 'Edge Computing',
      preview: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Studio Planar Magnetic Headphone Enclosure',
      category: 'Smart Audio',
      preview: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'LoRaWAN Telemetry Sensor PCB',
      category: 'Robotics & IoT',
      preview: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=400&q=80'
    }
  ];

  if (!isImageSearchOpen) return null;

  const handleSimulateUpload = (category: string) => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setDetectedCategory(category);
    }, 900);
  };

  const handleApplyMatch = (cat: string) => {
    setCustomerSearchQuery(cat);
    setActiveCustomerNavTab('SHOP');
    setIsImageSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#E7E5E0] max-w-lg w-full p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 animate-fadeIn relative">
        <button
          onClick={() => setIsImageSearchOpen(false)}
          className="absolute top-4 right-4 p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-600 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-mono-tech uppercase tracking-wider text-stone-800 mb-2">
            <ScanLine className="w-3.5 h-3.5 text-stone-700" />
            <span>NEURAL VISUAL SEARCH</span>
          </div>
          <h3 className="font-serif-luxury font-bold text-xl text-stone-900">
            Search Hardware by Image or Schematic
          </h3>
          <p className="text-xs text-stone-500 font-mono-tech mt-1">
            Drop hardware photos, circuit boards, or server rack photos to identify exact matching SKUs
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onClick={() => handleSimulateUpload('Edge Computing')}
          className="border-2 border-dashed border-stone-300 hover:border-stone-800 bg-stone-50/70 hover:bg-stone-50 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
        >
          <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="font-serif-luxury font-bold text-sm text-stone-800">
            {analyzing ? 'Analyzing Visual Vectors...' : 'Click to Upload or Drag & Drop'}
          </div>
          <p className="text-[11px] text-stone-500 font-mono-tech">
            Supports PNG, JPG, WEBP, or PCB Schematic diagrams
          </p>
        </div>

        {/* Sample Images to Try */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono-tech uppercase font-bold text-stone-400">
            OR TEST WITH HARDWARE SAMPLES:
          </div>
          <div className="grid grid-cols-3 gap-2">
            {sampleVisualTargets.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSimulateUpload(item.category)}
                className="p-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl cursor-pointer transition-colors space-y-1 group"
              >
                <img
                  src={item.preview}
                  alt={item.title}
                  className="w-full h-16 object-cover rounded-lg border border-stone-200"
                />
                <div className="text-[10px] font-serif-luxury font-bold text-stone-900 line-clamp-1">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {detectedCategory && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-fadeIn">
            <div className="flex items-center gap-1.5 text-xs font-mono-tech font-bold text-emerald-800 uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Matching Category Identified: {detectedCategory}</span>
            </div>
            <button
              onClick={() => handleApplyMatch(detectedCategory)}
              className="w-full py-2.5 bg-stone-900 hover:bg-black text-white font-mono-tech font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>View Matching SKUs in Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
