import React, { useState } from 'react';
import { ScrapItem, ScreenName, Language } from '../types';
import { SCRAP_ITEMS } from '../data/scrapData';
import { TRANSLATIONS } from '../data/translations';
import { speakVernacular, stopSpeech, triggerHaptic } from '../utils/speech';
import { LanguageBar } from './LanguageBar';

interface HomeDashboardProps {
  onNavigate: (screen: ScreenName) => void;
  onSelectItemForWeighing: (item: ScrapItem, initialWeight?: number) => void;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  onSync: () => void;
  isSyncing: boolean;
  totalEarned: number;
  totalWeight: number;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  onSelectItemForWeighing,
  language,
  onLanguageChange,
  onSync,
  isSyncing,
  totalEarned,
  totalWeight,
}) => {
  const [calcWeight, setCalcWeight] = useState<number>(15.0);
  const [purchasePrice, setPurchasePrice] = useState<number>(180);
  const [selectedScrapId, setSelectedScrapId] = useState<string>(SCRAP_ITEMS[0].id);
  const [transcript, setTranscript] = useState<string>('');
  const [speechMode, setSpeechMode] = useState<'stt' | 'tts'>('stt');
  const [sttLang, setSttLang] = useState<'mr-IN' | 'hi-IN' | 'en-IN' | 'auto'>('auto');
  const [isListening, setIsListening] = React.useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Search & Category Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const recognitionRef = React.useRef<any>(null);
  const finalTranscriptRef = React.useRef<string>('');

  // Browser Speech Recognition with non-duplicating finalTranscript logic
  const handleToggleListen = () => {
    triggerHaptic(20);
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        language === 'en'
          ? 'Live speech recognition is not supported on this browser.'
          : 'आपके ब्राउज़र में लाइव वॉयस टाइपिंग समर्थित नहीं है।'
      );
      return;
    }

    const recognition = new SpeechRecognition();
    const activeLang =
      sttLang === 'auto'
        ? language === 'mr'
          ? 'mr-IN'
          : language === 'hi'
          ? 'hi-IN'
          : 'en-IN'
        : sttLang;

    recognition.lang = activeLang;
    recognition.continuous = true;
    recognition.interimResults = true;

    finalTranscriptRef.current = transcript.trim();

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const textChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += ' ' + textChunk.trim();
        } else {
          interimTranscript += ' ' + textChunk;
        }
      }

      const combined = (finalTranscriptRef.current + ' ' + interimTranscript)
        .replace(/\s+/g, ' ')
        .trim();
      setTranscript(combined);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition status/error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleSpeakText = () => {
    triggerHaptic(20);
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = transcript.trim() || (
      language === 'mr'
        ? 'कबाडीवाला कनेक्ट मध्ये आपले स्वागत आहे. येथे थेट शासकीय दराने ई-कचरा खरेदी करा.'
        : language === 'hi'
        ? 'कबाड़ीवाला कनेक्ट में आपका स्वागत है। यहाँ सरकारी मंडी भाव से ई-कचरा बेचें।'
        : 'Welcome to Kabadiwala Connect. Discover real-time scrap rates and scan e-waste easily.'
    );

    if (!transcript.trim()) {
      setTranscript(textToSpeak);
    }

    setIsSpeaking(true);
    speakVernacular(textToSpeak, language, true, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleSwitchSpeechMode = (mode: 'stt' | 'tts') => {
    triggerHaptic(15);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    }
    setSpeechMode(mode);
  };
  const t = TRANSLATIONS[language];
  const kb = t.kabadiwala;
  
  const selectedScrapItem = SCRAP_ITEMS.find(item => item.id === selectedScrapId) || SCRAP_ITEMS[0];
  const ratePerKg = selectedScrapItem.baseRate;

  const estimatedCalcPrice = Math.round(calcWeight * ratePerKg);
  const estimatedProfit = Math.round(calcWeight * (ratePerKg - purchasePrice));

  const handleAdjustWeight = (delta: number) => {
    triggerHaptic(25);
    setCalcWeight((prev) => Math.max(1, parseFloat((prev + delta).toFixed(1))));
  };

  const handleAdjustPurchasePrice = (delta: number) => {
    triggerHaptic(25);
    setPurchasePrice((prev) => Math.max(0, prev + delta));
  };

  const handleSetPresetWeight = (val: number) => {
    triggerHaptic(35);
    setCalcWeight(val);
  };

  const handleVoiceBanner = () => {
    triggerHaptic(30);
    speakVernacular(kb.audioWelcomePrompt, language);
  };

  const CATEGORY_CHIPS = [
    { id: 'all', labelEn: 'All Items', labelHi: 'सभी माल', labelMr: 'सर्व माल', icon: 'apps' },
    { id: 'boards', labelEn: 'Circuit Boards / IT', labelHi: 'मदरबोर्ड व IT', labelMr: 'सर्किट बोर्ड व IT', icon: 'developer_board' },
    { id: 'metals', labelEn: 'Metals & Wires', labelHi: 'तांबा व धातु', labelMr: 'कॉपर व धातू', icon: 'cable' },
    { id: 'batteries', labelEn: 'Batteries & Power', labelHi: 'बैटरी व पावर', labelMr: 'बॅटरी व पॉवर', icon: 'battery_charging_full' },
    { id: 'appliances', labelEn: 'Motors & Appliances', labelHi: 'मोटर व उपकरण', labelMr: 'मोटर व उपकरणे', icon: 'hardware' },
    { id: 'hazardous', labelEn: 'Hazardous ⚠️', labelHi: 'ख़तरनाक माल ⚠️', labelMr: 'धोकादायक ⚠️', icon: 'warning' },
  ];

  const getCategoryCount = (catId: string): number => {
    if (catId === 'all') return SCRAP_ITEMS.length;
    return SCRAP_ITEMS.filter((item) => {
      if (catId === 'hazardous') return Boolean(item.isHazardous);
      if (catId === 'boards') {
        return (
          item.id.includes('pcb') ||
          item.id.includes('board') ||
          item.categoryEn.toLowerCase().includes('board') ||
          item.categoryHi.includes('मदरबोर्ड') ||
          (item.categoryMr && item.categoryMr.includes('मदरबोर्ड'))
        );
      }
      if (catId === 'metals') {
        return (
          item.id.includes('copper') ||
          item.id.includes('brass') ||
          item.id.includes('aluminum') ||
          item.categoryEn.toLowerCase().includes('wire') ||
          item.categoryEn.toLowerCase().includes('metal') ||
          item.categoryHi.includes('धातु') ||
          item.categoryHi.includes('तांबा') ||
          item.categoryHi.includes('पीतल')
        );
      }
      if (catId === 'batteries') {
        return (
          item.id.includes('battery') ||
          item.categoryEn.toLowerCase().includes('battery') ||
          item.categoryHi.includes('बैटरी') ||
          (item.categoryMr && item.categoryMr.includes('बॅटरी'))
        );
      }
      if (catId === 'appliances') {
        return (
          item.id.includes('compressor') ||
          item.id.includes('motor') ||
          item.categoryEn.toLowerCase().includes('motor') ||
          item.categoryHi.includes('मोटर') ||
          (item.categoryMr && item.categoryMr.includes('मोटर'))
        );
      }
      return false;
    }).length;
  };

  const filteredScrapItems = SCRAP_ITEMS.filter((item) => {
    // Category filter check
    if (selectedCategory === 'hazardous') {
      if (!item.isHazardous) return false;
    } else if (selectedCategory === 'boards') {
      const isBoard =
        item.id.includes('pcb') ||
        item.id.includes('board') ||
        item.categoryEn.toLowerCase().includes('board') ||
        item.categoryHi.includes('मदरबोर्ड') ||
        (item.categoryMr && item.categoryMr.includes('मदरबोर्ड'));
      if (!isBoard) return false;
    } else if (selectedCategory === 'metals') {
      const isMetal =
        item.id.includes('copper') ||
        item.id.includes('brass') ||
        item.id.includes('aluminum') ||
        item.categoryEn.toLowerCase().includes('wire') ||
        item.categoryEn.toLowerCase().includes('metal') ||
        item.categoryHi.includes('धातु') ||
        item.categoryHi.includes('तांबा') ||
        item.categoryHi.includes('पीतल');
      if (!isMetal) return false;
    } else if (selectedCategory === 'batteries') {
      const isBattery =
        item.id.includes('battery') ||
        item.categoryEn.toLowerCase().includes('battery') ||
        item.categoryHi.includes('बैटरी') ||
        (item.categoryMr && item.categoryMr.includes('बॅटरी'));
      if (!isBattery) return false;
    } else if (selectedCategory === 'appliances') {
      const isAppliance =
        item.id.includes('compressor') ||
        item.id.includes('motor') ||
        item.categoryEn.toLowerCase().includes('motor') ||
        item.categoryHi.includes('मोटर') ||
        (item.categoryMr && item.categoryMr.includes('मोटर'));
      if (!isAppliance) return false;
    }

    // Search query check
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameEn = (item.nameEn || '').toLowerCase();
    const nameHi = (item.nameHi || '').toLowerCase();
    const nameMr = (item.nameMr || '').toLowerCase();
    const catEn = (item.categoryEn || '').toLowerCase();
    const catHi = (item.categoryHi || '').toLowerCase();
    const catMr = (item.categoryMr || '').toLowerCase();
    const grade = (item.grade || '').toLowerCase();

    return (
      nameEn.includes(q) ||
      nameHi.includes(q) ||
      nameMr.includes(q) ||
      catEn.includes(q) ||
      catHi.includes(q) ||
      catMr.includes(q) ||
      grade.includes(q)
    );
  });

  const handleHearAllRates = () => {
    triggerHaptic(30);
    if (filteredScrapItems.length === 0) {
      speakVernacular(
        language === 'mr'
          ? 'कोणतेही आयटम सापडले नाहीत.'
          : language === 'en'
          ? 'No items found in search.'
          : 'कोई आइटम नहीं मिला।',
        language
      );
      return;
    }
    const itemSummaries = filteredScrapItems
      .slice(0, 4)
      .map(
        (it) =>
          `${getItemName(it)} ₹${it.baseRate} ${language === 'en' ? 'rupees per kg' : 'रुपये प्रति किलो'}`
      )
      .join('. ');
    speakVernacular(itemSummaries, language);
  };

  const getItemName = (item: ScrapItem) => {
    if (language === 'mr') return item.nameMr || item.nameHi;
    if (language === 'en') return item.nameEn;
    return item.nameHi;
  };

  const getItemCategory = (item: ScrapItem) => {
    if (language === 'mr') return item.categoryMr || item.categoryHi;
    if (language === 'en') return item.categoryEn;
    return item.categoryHi;
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 pt-24 pb-28 gap-4">
      {/* Multilingual Selector Pill Bar */}
      {onLanguageChange && (
        <LanguageBar currentLanguage={language} onLanguageChange={onLanguageChange} />
      )}

      {/* 1. Vernacular Voice Assistance Bar */}
      <section
        id="voice-assist-banner"
        className="w-full bg-[#ffdcc3] rounded-xl p-3 shadow-[0_4px_0px_#191c1e] border-2 border-[#191c1e] flex items-center justify-between gap-2 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-11 h-11 rounded-full bg-[#8d4b00] text-white flex items-center justify-center animate-bounce shrink-0 shadow-sm">
            <span
              className="material-symbols-outlined text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              volume_up
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[16px] font-extrabold text-[#2f1500] leading-tight truncate">
              {kb.voiceBannerTitle}
            </span>
            <span className="text-[12px] text-[#6e3900] font-medium leading-none truncate">
              {kb.voiceBannerSubtitle}
            </span>
          </div>
        </div>

        <button
          id="btn-voice-prompt"
          type="button"
          onClick={handleVoiceBanner}
          className="h-11 px-4 rounded-xl bg-[#2f1500] text-[#ffdcc3] flex items-center gap-1.5 active:bg-[#8d4b00] active:scale-95 shadow-[0_2px_0px_#191c1e] transition-transform shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">mic</span>
          <span className="text-[14px] font-bold">{kb.speakBtn}</span>
        </button>
      </section>

      {/* 2. Massive Operational Hero CTA: Scan E-Waste Camera */}
      <section className="w-full">
        <button
          id="scan-trigger"
          type="button"
          onClick={() => {
            triggerHaptic([40, 60, 40]);
            speakVernacular(
              language === 'hi'
                ? 'कैमरा शुरू हो रहा है। ई-कचरे की फोटो खींचें।'
                : language === 'mr'
                ? 'कॅमेरा सुरू होत आहे. ई-कचऱ्याचा फोटो काढा.'
                : 'Starting camera. Snap a photo of the e-waste scrap.',
              language
            );
            onNavigate('scanner');
          }}
          className="w-full bg-[#00855d] text-white rounded-xl p-4 shadow-[0_6px_0px_#002114] border-2 border-[#002114] active:translate-y-1 active:shadow-[0_2px_0px_#002114] transition-all flex flex-col justify-between min-h-[148px] relative overflow-hidden group text-left"
        >
          {/* Subtle background decorative icon */}
          <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none">
            <span className="material-symbols-outlined text-[150px]">document_scanner</span>
          </div>

          <div className="flex items-start justify-between w-full relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-xl bg-white text-[#006948] flex items-center justify-center shadow-[0_3px_0px_#000000] shrink-0 p-2">
                <span
                  className="material-symbols-outlined text-[34px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  photo_camera
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[22px] font-black text-white tracking-tight leading-tight">
                  {kb.scanCtaTitle}
                </span>
                <span className="text-[12px] font-bold text-[#85f8c4] tracking-wider uppercase font-['Space_Grotesk']">
                  {kb.scanCtaSubtitle}
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-[#85f8c4] text-[#002114] text-[12px] font-bold flex items-center gap-1 shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[15px]">bolt</span>
              {kb.scanCtaBadge}
            </span>
          </div>

          <div className="w-full bg-white/15 backdrop-blur-sm rounded-lg p-2.5 mt-3 flex items-center justify-between relative z-10 border border-white/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#85f8c4]">
                center_focus_strong
              </span>
              <span className="text-[14px] text-white font-semibold">{kb.scanCtaAction}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#85f8c4] text-[#002114] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </div>
          </div>
        </button>
      </section>

      {/* 3. Visual Earnings Summary Cards (Side by Side Grid) */}
      <section className="grid grid-cols-2 gap-3 w-full">
        {/* Card 1: Total Earned Money */}
        <div className="bg-white rounded-xl p-3.5 shadow-[0_4px_0px_#191c1e] border-2 border-[#191c1e] flex flex-col justify-between min-h-[148px] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-[#85f8c4] text-[#002114] flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                payments
              </span>
            </div>
            <button
              id="btn-speak-earnings"
              aria-label="Audio read total earned"
              onClick={() => {
                triggerHaptic(20);
                speakVernacular(
                  language === 'hi'
                    ? `आपकी कुल बिक्री की कमाई ₹${totalEarned.toLocaleString('en-IN')} है।`
                    : language === 'mr'
                    ? `तुमची एकूण विक्री कमाई ₹${totalEarned.toLocaleString('en-IN')} आहे.`
                    : `Your total verified earnings are ₹${totalEarned.toLocaleString('en-IN')}.`,
                  language
                );
              }}
              className="w-9 h-9 rounded-full bg-[#eceef0] flex items-center justify-center text-[#8d4b00] active:scale-90 transition-transform"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">volume_up</span>
            </button>
          </div>

          <div className="flex flex-col mt-2">
            <div className="flex items-baseline">
              <span className="text-[26px] font-bold text-[#006948] font-['Space_Grotesk'] leading-none">
                ₹{totalEarned.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[15px] font-extrabold text-[#191c1e] mt-1 leading-tight">
              {kb.earningsTitle}
            </span>
            <span className="text-[11px] text-[#565e74] leading-none">{kb.earningsSubtitle}</span>
          </div>

          <div className="mt-2 inline-flex items-center gap-1 text-[#006948] text-[11px] font-bold">
            <span className="material-symbols-outlined text-[15px]">trending_up</span>
            <span>+₹1,240</span>
          </div>
        </div>

        {/* Card 2: Waste Sold Weight */}
        <div className="bg-white rounded-xl p-3.5 shadow-[0_4px_0px_#191c1e] border-2 border-[#191c1e] flex flex-col justify-between min-h-[148px] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-[#dae2fd] text-[#131b2e] flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                scale
              </span>
            </div>
            <button
              id="btn-speak-weight"
              aria-label="Audio read total weight"
              onClick={() => {
                triggerHaptic(20);
                speakVernacular(
                  language === 'hi'
                    ? `आपने कुल ${totalWeight} किलोग्राम कबाड़ माल बेचा है।`
                    : language === 'mr'
                    ? `तुम्ही एकूण ${totalWeight} किलो ई-कचरा विकला आहे.`
                    : `You have weighed and sold ${totalWeight} kilograms of e-waste.`,
                  language
                );
              }}
              className="w-9 h-9 rounded-full bg-[#eceef0] flex items-center justify-center text-[#565e74] active:scale-90 transition-transform"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">volume_up</span>
            </button>
          </div>

          <div className="flex flex-col mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] font-bold text-[#565e74] font-['Space_Grotesk'] leading-none">
                {totalWeight}
              </span>
              <span className="text-[15px] font-bold text-[#565e74]">KG</span>
            </div>
            <span className="text-[15px] font-extrabold text-[#191c1e] mt-1 leading-tight">
              {kb.weightTitle}
            </span>
            <span className="text-[11px] text-[#565e74] leading-none">{kb.weightSubtitle}</span>
          </div>

          <div className="mt-2 inline-flex items-center gap-1 text-[#565e74] text-[11px] font-bold">
            <span className="material-symbols-outlined text-[15px]">inventory_2</span>
            <span>
              {language === 'mr'
                ? '२४ पोती'
                : language === 'en'
                ? '24 verified bags'
                : '24 बोरियां (Sacks)'}
            </span>
          </div>
        </div>
      </section>

      {/* 4. Quick Rate Ticker (Live Scrap Rates / मंडी के भाव) */}
      <section className="w-full flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#006948] animate-ping" />
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-[#191c1e]">{kb.mandiRatesTitle}</span>
              <span className="text-[11px] text-[#565e74]">{kb.mandiRatesSubtitle}</span>
            </div>
          </div>

          <button
            id="btn-speak-all-rates"
            onClick={handleHearAllRates}
            className="h-8 px-2.5 rounded-full bg-[#ffdcc3] text-[#2f1500] text-[11px] font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px] text-[#8d4b00]">volume_up</span>
            <span>{language === 'mr' ? 'भाव ऐका' : language === 'en' ? 'Listen' : 'भाव सुनें'}</span>
          </button>
        </div>

        {/* Search Bar & Category Filter Chips */}
        <div className="flex flex-col gap-2.5 w-full bg-white p-3 rounded-xl border-2 border-[#191c1e] shadow-[0_3px_0px_#191c1e]">
          {/* Search Bar Input */}
          <div className="relative w-full flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#565e74] text-[20px] pointer-events-none">
              search
            </span>
            <input
              id="scrap-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Search scrap items (e.g. Copper, PCB, Battery...)'
                  : language === 'mr'
                  ? 'कचरा किंवा धातू शोधा (उदा. तांबे, PCB, बॅटरी...)'
                  : 'स्क्रैप आइटम खोजें (जैसे तांबा, मदरबोर्ड, बैटरी...)'
              }
              className="w-full bg-[#f2f4f6] border border-[#bccac0]/60 rounded-xl py-2 pl-9 pr-8 text-[13px] font-bold text-[#191c1e] outline-none focus:border-[#006948] transition-colors placeholder:text-[#8e9099] placeholder:font-medium"
            />
            {searchQuery && (
              <button
                id="scrap-search-clear-btn"
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setSearchQuery('');
                }}
                className="absolute right-2.5 p-1 text-[#8e9099] hover:text-[#191c1e] active:scale-90 cursor-pointer"
                aria-label="Clear search input"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5 scrollbar-none">
            {CATEGORY_CHIPS.map((chip) => {
              const label =
                language === 'mr'
                  ? chip.labelMr
                  : language === 'en'
                  ? chip.labelEn
                  : chip.labelHi;
              const isActive = selectedCategory === chip.id;
              const count = getCategoryCount(chip.id);

              return (
                <button
                  key={chip.id}
                  id={`chip-category-${chip.id}`}
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    setSelectedCategory(chip.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[11px] whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer border select-none ${
                    isActive
                      ? 'bg-[#006948] text-white border-[#002114] shadow-[0_2px_0px_#002114]'
                      : 'bg-[#f2f4f6] text-[#191c1e] border-[#bccac0]/60 hover:bg-[#e6e8ea]'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[15px] ${
                      isActive ? 'text-[#85f8c4]' : 'text-[#565e74]'
                    }`}
                  >
                    {chip.icon}
                  </span>
                  <span>{label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold leading-none ${
                      isActive
                        ? 'bg-[#85f8c4] text-[#002114]'
                        : 'bg-[#e6e8ea] text-[#565e74]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-[11px] text-[#565e74] pt-1 border-t border-[#e6e8ea]">
            <span className="font-semibold">
              {language === 'en'
                ? `Showing ${filteredScrapItems.length} of ${SCRAP_ITEMS.length} items`
                : language === 'mr'
                ? `${SCRAP_ITEMS.length} पैकी ${filteredScrapItems.length} आयटम सापडले`
                : `${SCRAP_ITEMS.length} में से ${filteredScrapItems.length} आइटम मिले`}
            </span>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                id="scrap-filter-reset-btn"
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-[#006948] font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">refresh</span>
                <span>{language === 'en' ? 'Reset' : language === 'mr' ? 'रीसेट' : 'रीसेट करें'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Rates Stacking List */}
        <div className="flex flex-col gap-2.5 w-full">
          {filteredScrapItems.length === 0 ? (
            <div className="w-full bg-white rounded-xl p-6 border-2 border-dashed border-[#bccac0] flex flex-col items-center justify-center text-center gap-2">
              <span className="material-symbols-outlined text-[36px] text-[#8e9099]">search_off</span>
              <span className="text-[14px] font-bold text-[#191c1e]">
                {language === 'en'
                  ? 'No scrap items match your query'
                  : language === 'mr'
                  ? 'कोणताही ई-कचरा किंवा धातू आढळला नाही'
                  : 'आपकी खोज के अनुसार कोई आइटम नहीं मिला'}
              </span>
              <p className="text-[11px] text-[#565e74] max-w-[240px]">
                {language === 'en'
                  ? 'Try searching with a different keyword or select "All Items".'
                  : language === 'mr'
                  ? 'कृपया वेगळा शब्द शोधा किंवा "सर्व माल" निवडा.'
                  : 'कृपया कोई अन्य शब्द खोजें या "सभी माल" चुनें।'}
              </p>
              <button
                id="scrap-empty-reset-btn"
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-1 px-4 py-1.5 bg-[#006948] text-white rounded-lg text-[12px] font-bold shadow-sm active:scale-95 cursor-pointer"
              >
                {language === 'en' ? 'Show All Items' : language === 'mr' ? 'सर्व माल पहा' : 'सभी माल देखें'}
              </button>
            </div>
          ) : (
            filteredScrapItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  triggerHaptic(25);
                  onSelectItemForWeighing(item, calcWeight);
                }}
                className="w-full bg-white rounded-xl p-3 shadow-[0_3px_0px_#191c1e] border-2 border-[#191c1e] flex items-center justify-between active:scale-[0.99] transition-all cursor-pointer hover:border-[#006948]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-[#e6e8ea] flex items-center justify-center overflow-hidden relative shrink-0 border border-[#bccac0]/40">
                    <img
                      src={item.imageUrl}
                      alt={getItemName(item)}
                      className="w-full h-full object-cover"
                    />
                    {item.isHazardous && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ba1a1a] flex items-center justify-center text-white text-[10px]">
                        !
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[15px] font-bold text-[#191c1e] truncate">
                        {getItemName(item)}
                      </span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full inline-block shrink-0 ${
                          item.isHazardous ? 'bg-[#b15f00]' : 'bg-[#006948]'
                        }`}
                      />
                    </div>
                    <span className="text-[11px] text-[#565e74] truncate">
                      {getItemCategory(item)}
                    </span>
                    <span className="text-[10px] text-[#006948] font-bold">{kb.tapToWeigh}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 pl-2">
                  <div
                    className={`flex items-baseline gap-0.5 px-2 py-0.5 rounded-lg ${
                      item.isHazardous
                        ? 'bg-[#ffdcc3] text-[#2f1500]'
                        : 'bg-[#85f8c4]/40 text-[#002114]'
                    }`}
                  >
                    <span
                      className={`text-[22px] font-bold font-['Space_Grotesk'] leading-tight ${
                        item.isHazardous ? 'text-[#8d4b00]' : 'text-[#006948]'
                      }`}
                    >
                      ₹{item.baseRate}
                    </span>
                    <span
                      className={`text-[11px] font-bold ${
                        item.isHazardous ? 'text-[#8d4b00]' : 'text-[#006948]'
                      }`}
                    >
                      /KG
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-0.5 ${
                      item.rateTrend === 'up'
                        ? 'text-[#006948]'
                        : item.rateTrend === 'down'
                        ? 'text-[#ba1a1a]'
                        : 'text-[#565e74]'
                    }`}
                  >
                    {item.rateChange}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. Interactive Weighing Shortcut Card */}
      <section className="w-full bg-[#f2f4f6] rounded-xl p-4 shadow-[0_4px_0px_#191c1e] border-2 border-[#191c1e] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[24px] text-[#006948]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              calculate
            </span>
            <span className="text-[16px] font-black text-[#191c1e]">{kb.calcTitle}</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e6e8ea] text-[#565e74]">
            {kb.ratePerKgLabel}: ₹{ratePerKg}
          </span>
        </div>

        <div className="flex flex-col gap-2 bg-white p-2.5 rounded-xl border border-[#bccac0]/40 shadow-inner">
          {/* Product Select */}
          <div className="flex flex-col mb-1">
            <span className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider mb-1">
              {kb.calcProductLabel}
            </span>
            <select
              value={selectedScrapId}
              onChange={(e) => setSelectedScrapId(e.target.value)}
              className="w-full bg-[#f2f4f6] border border-[#bccac0]/60 rounded-lg p-2 text-[14px] font-bold text-[#191c1e] outline-none focus:border-[#006948]"
            >
              {SCRAP_ITEMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {language === 'mr' ? (item.nameMr || item.nameHi) : language === 'en' ? item.nameEn : item.nameHi}
                </option>
              ))}
            </select>
          </div>
          
          <div className="h-[1px] w-full bg-[#e6e8ea] mb-2"></div>

          {/* Weight Stepper */}
          <div className="flex items-center justify-between gap-3">
            <button
              id="btn-calc-minus"
              type="button"
              onClick={() => handleAdjustWeight(-5)}
              className="w-12 h-12 rounded-xl bg-[#e6e8ea] text-[#191c1e] font-bold text-[26px] font-['Space_Grotesk'] flex items-center justify-center active:scale-90 select-none shadow-[0_2px_0px_#191c1e] border border-[#191c1e]"
            >
              −
            </button>

            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider">{kb.weightLabel}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[30px] font-bold text-[#191c1e] font-['Space_Grotesk'] leading-none">
                  {calcWeight.toFixed(1)}
                </span>
                <span className="text-[15px] font-black text-[#006948]">KG</span>
              </div>
            </div>

            <button
              id="btn-calc-plus"
              type="button"
              onClick={() => handleAdjustWeight(5)}
              className="w-12 h-12 rounded-xl bg-[#006948] text-white font-bold text-[26px] font-['Space_Grotesk'] flex items-center justify-center active:scale-90 select-none shadow-[0_2px_0px_#002114] border border-[#002114]"
            >
              +
            </button>
          </div>

          <div className="h-[1px] w-full bg-[#e6e8ea] my-1"></div>

          {/* Cost Stepper */}
          <div className="flex items-center justify-between gap-3">
            <button
              id="btn-cost-minus"
              type="button"
              onClick={() => handleAdjustPurchasePrice(-10)}
              className="w-10 h-10 rounded-xl bg-[#e6e8ea] text-[#191c1e] font-bold text-[22px] font-['Space_Grotesk'] flex items-center justify-center active:scale-90 select-none shadow-[0_2px_0px_#191c1e] border border-[#191c1e]"
            >
              −
            </button>

            <div className="flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider">{kb.calcCostLabel}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[15px] font-black text-[#006948]">₹</span>
                <span className="text-[24px] font-bold text-[#191c1e] font-['Space_Grotesk'] leading-none">
                  {purchasePrice}
                </span>
              </div>
            </div>

            <button
              id="btn-cost-plus"
              type="button"
              onClick={() => handleAdjustPurchasePrice(10)}
              className="w-10 h-10 rounded-xl bg-[#dae2fd] text-[#131b2e] font-bold text-[22px] font-['Space_Grotesk'] flex items-center justify-center active:scale-90 select-none shadow-[0_2px_0px_#131b2e] border border-[#131b2e]"
            >
              +
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#e6e8ea]">
            <div className="flex flex-col">
               <span className="text-[11px] font-bold text-[#565e74] uppercase">{kb.estPayoutLabel}</span>
               <span className="text-[15px] font-bold text-[#191c1e] font-['Space_Grotesk']">
                 ₹{estimatedCalcPrice.toLocaleString('en-IN')}
               </span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[11px] font-bold text-[#006948] uppercase">{kb.calcProfitLabel}</span>
               <span className="text-[18px] font-black text-[#006948] font-['Space_Grotesk']">
                 +₹{estimatedProfit.toLocaleString('en-IN')}
               </span>
            </div>
          </div>
        </div>

        {/* Quick Weight Preset Chips */}
        <div className="grid grid-cols-4 gap-1.5 w-full">
          {[5, 10, 25, 50].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleSetPresetWeight(preset)}
              className={`h-10 rounded-lg text-[14px] font-bold flex items-center justify-center active:scale-95 shadow-[0_2px_0px_#191c1e] border border-[#191c1e] transition-all font-['Space_Grotesk'] ${
                calcWeight === preset
                  ? 'bg-[#85f8c4] text-[#002114]'
                  : 'bg-white text-[#191c1e] hover:bg-[#85f8c4]/30'
              }`}
            >
              +{preset} KG
            </button>
          ))}
        </div>

        {/* Action Button: Proceed to Weighed Deal */}
        <button
          onClick={() => {
            triggerHaptic(30);
            onSelectItemForWeighing(selectedScrapItem, calcWeight);
          }}
          className="w-full h-11 bg-[#006948] text-white rounded-lg font-bold text-[14px] flex items-center justify-center gap-2 active:scale-98 shadow-sm"
        >
          <span>{kb.weighThisNowBtn}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </section>

      
      {/* 6. Speech & Voice Utility (STT / TTS Toggle) */}
      <section className="w-full bg-[#dae2fd] rounded-xl p-4 shadow-[0_4px_0px_#191c1e] border-2 border-[#191c1e] flex flex-col gap-3">
        {/* Mode Toggle Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] text-[#003b8e]">
                {speechMode === 'stt' ? 'mic' : 'volume_up'}
              </span>
              <span className="text-[16px] font-black text-[#191c1e]">
                {speechMode === 'stt'
                  ? language === 'en'
                    ? 'Voice Typing (Speech to Text)'
                    : language === 'mr'
                    ? 'आवाज टाईपिंग (मजकूर लिहा)'
                    : 'आवाज़ टाइपिंग (टेक्स्ट लिखें)'
                  : language === 'en'
                  ? 'Text to Speech (TTS)'
                  : language === 'mr'
                  ? 'टेक्स्ट टू स्पीच (मजकूर ऐका)'
                  : 'टेक्स्ट टू स्पीच (बोलकर सुनें)'}
              </span>
            </div>

            {/* Live active badges */}
            {speechMode === 'stt' && isListening && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#003b8e] text-white text-[11px] font-bold uppercase animate-pulse shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>{language === 'en' ? 'Listening...' : language === 'mr' ? 'ऐकत आहे...' : 'सुन रहा है...'}</span>
              </span>
            )}

            {speechMode === 'tts' && isSpeaking && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#006948]/10 text-[#006948] text-[10px] font-bold uppercase animate-pulse border border-[#006948]/30">
                <span className="material-symbols-outlined text-[12px] animate-bounce">graphic_eq</span>
                {language === 'en' ? 'Speaking...' : language === 'mr' ? 'बोलत आहे...' : 'बोल रहा है...'}
              </span>
            )}
          </div>

          {/* Segmented Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/70 rounded-xl border border-[#003b8e]/20 shadow-inner">
            <button
              type="button"
              onClick={() => handleSwitchSpeechMode('stt')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                speechMode === 'stt'
                  ? 'bg-[#003b8e] text-white shadow-sm'
                  : 'text-[#003b8e] hover:bg-white/80'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">mic</span>
              <span>{language === 'en' ? 'Speech to Text' : language === 'mr' ? 'आवाजातून टाईप' : 'आवाज़ से लिखें'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchSpeechMode('tts')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                speechMode === 'tts'
                  ? 'bg-[#006948] text-white shadow-sm'
                  : 'text-[#006948] hover:bg-white/80'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">volume_up</span>
              <span>{language === 'en' ? 'Text to Speech' : language === 'mr' ? 'मजकूर ऐका' : 'बोलकर सुनें'}</span>
            </button>
          </div>
        </div>

        {/* Dialect / Language Sub-bar */}
        {speechMode === 'stt' && (
          <div className="flex items-center justify-between gap-1 p-2 rounded-lg bg-white/80 border border-[#003b8e]/20 text-[11px]">
            <span className="font-bold text-[#003b8e]">
              {language === 'en' ? 'Language:' : language === 'mr' ? 'भाषा निवडा:' : 'भाषा चुनें:'}
            </span>
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'auto', label: 'Auto' },
                { id: 'hi-IN', label: 'हिंदी' },
                { id: 'mr-IN', label: 'मराठी' },
                { id: 'en-IN', label: 'English' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSttLang(item.id as any)}
                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-all border cursor-pointer ${
                    sttLang === item.id
                      ? 'bg-[#003b8e] text-white border-[#003b8e]'
                      : 'bg-white text-[#191c1e] border-[#bccac0]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Guidance Prompt */}
        <p className="text-[12px] text-[#003b8e] font-medium leading-tight">
          {speechMode === 'stt'
            ? language === 'en'
              ? 'Tap microphone to start live voice typing in English, Hindi, or Marathi.'
              : language === 'mr'
              ? 'मराठी, हिंदी किंवा इंग्रजीत थेट बोलून टाईप करण्यासाठी मायक्रोफोन दाबा.'
              : 'मराठी, हिंदी या अंग्रेज़ी में बोलकर टाइप करने के लिए माइक्रोफ़ोन बटन दबाएं।'
            : language === 'en'
            ? 'Type or paste text below and tap "Read Aloud" to hear clear voice playback.'
            : language === 'mr'
            ? 'खाली मजकूर लिहा किंवा पेस्ट करा आणि आवाज ऐकण्यासाठी "वाचून दाखवा" दाबा.'
            : 'नीचे टेक्स्ट लिखें या पेस्ट करें और आवाज़ में सुनने के लिए "बोलकर सुनाएं" दबाएं।'}
        </p>

        {/* Preset chips for TTS */}
        {speechMode === 'tts' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            <span className="text-[11px] font-bold text-[#003b8e] shrink-0">
              {language === 'en' ? 'Sample:' : language === 'mr' ? 'उदा:' : 'उदा:'}
            </span>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setTranscript(
                  language === 'mr'
                    ? 'आजचे थेट बाजार भाव: पीसीबी मदरबोर्ड २८० रुपये किलो, तांब्याची वायर ५४० रुपये किलो.'
                    : language === 'hi'
                    ? 'आज के लाइव मंडी भाव: पीसीबी मदरबोर्ड ₹280 प्रति किलो, तांबा वायर ₹540 प्रति किलो।'
                    : 'Live Scrap Rates: PCB Motherboard ₹280 per kg, Copper Wire ₹540 per kg.'
                );
              }}
              className="px-2.5 py-1 rounded-full bg-white text-[#003b8e] border border-[#003b8e]/30 shrink-0 hover:bg-[#003b8e]/10 active:scale-95 font-semibold cursor-pointer"
            >
              {language === 'en' ? 'Mandi Rates' : language === 'mr' ? 'बाजार भाव' : 'मंडी भाव'}
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setTranscript(
                  language === 'mr'
                    ? 'सावधान! ई-कचरा हाताळताना सुरक्षिततेचे हातमोजे वापरा.'
                    : language === 'hi'
                    ? 'सावधानी! ई-कचरा संभालते समय सुरक्षा दस्ताने पहनें।'
                    : 'Safety Notice: Always wear protective safety gloves when handling e-waste.'
                );
              }}
              className="px-2.5 py-1 rounded-full bg-white text-[#003b8e] border border-[#003b8e]/30 shrink-0 hover:bg-[#003b8e]/10 active:scale-95 font-semibold cursor-pointer"
            >
              {language === 'en' ? 'Safety Notice' : language === 'mr' ? 'सुरक्षितता' : 'सुरक्षा निर्देश'}
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setTranscript(
                  language === 'mr'
                    ? 'कबाडीवाला कनेक्ट मध्ये आपले स्वागत आहे. थेट शासकीय दराने ई-कचरा विक्री करा.'
                    : language === 'hi'
                    ? 'कबाड़ीवाला कनेक्ट में आपका स्वागत है। सीधे सरकारी दरों पर ई-कचरा बेचें।'
                    : 'Welcome to Kabadiwala Connect. Sell certified e-waste directly at verified rates.'
                );
              }}
              className="px-2.5 py-1 rounded-full bg-white text-[#003b8e] border border-[#003b8e]/30 shrink-0 hover:bg-[#003b8e]/10 active:scale-95 font-semibold cursor-pointer"
            >
              {language === 'en' ? 'Welcome' : language === 'mr' ? 'स्वागत' : 'स्वागत'}
            </button>
          </div>
        )}

        <div className="relative w-full">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={
              speechMode === 'stt'
                ? language === 'en'
                  ? 'Your voice transcript will appear here...'
                  : language === 'mr'
                  ? 'तुमचे बोलणे येथे टाईप दिसेल...'
                  : 'आपकी आवाज़ का टेक्स्ट यहाँ टाइप होगा...'
                : language === 'en'
                ? 'Enter text to convert into speech...'
                : language === 'mr'
                ? 'आवाजात ऐकण्यासाठी मजकूर येथे टाईप करा...'
                : 'आवाज़ में सुनने के लिए टेक्स्ट यहाँ टाइप करें...'
            }
            className="w-full bg-white border border-[#003b8e]/30 rounded-lg p-3 text-[14px] font-medium text-[#191c1e] outline-none focus:border-[#003b8e] min-h-[95px] resize-none shadow-inner pr-10"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {speechMode === 'stt' ? (
            <button
              type="button"
              onClick={handleToggleListen}
              className={`flex-1 h-11 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 active:scale-95 shadow-[0_2px_0px_#191c1e] transition-all cursor-pointer ${
                isListening ? 'bg-[#ba1a1a]' : 'bg-[#003b8e]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isListening ? 'mic_off' : 'mic'}
              </span>
              <span>
                {isListening
                  ? language === 'en'
                    ? 'Stop Listening'
                    : language === 'mr'
                    ? 'थांबवा'
                    : 'रोकें'
                  : language === 'en'
                  ? 'Start Voice Typing'
                  : language === 'mr'
                  ? 'आवाज टाईपिंग सुरू करा'
                  : 'आवाज़ टाइपिंग शुरू करें'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSpeakText}
              className={`flex-1 h-11 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 active:scale-95 shadow-[0_2px_0px_#191c1e] transition-all cursor-pointer ${
                isSpeaking ? 'bg-[#ba1a1a]' : 'bg-[#006948]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isSpeaking ? 'stop_circle' : 'volume_up'}
              </span>
              <span>
                {isSpeaking
                  ? language === 'en'
                    ? 'Stop Speaking'
                    : language === 'mr'
                    ? 'आवाज थांबवा'
                    : 'आवाज़ रोकें'
                  : language === 'en'
                  ? 'Read Aloud (Play Audio)'
                  : language === 'mr'
                  ? 'वाचून दाखवा (मजकूर ऐका)'
                  : 'बोलकर सुनाएं (ऑडियो)'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setTranscript('');
              if (isSpeaking) {
                stopSpeech();
                setIsSpeaking(false);
              }
            }}
            className="w-11 h-11 bg-white border border-[#003b8e]/30 rounded-xl flex items-center justify-center text-[#ba1a1a] active:scale-95 shadow-sm transition-transform hover:bg-[#ba1a1a]/10 cursor-pointer"
            title={language === 'en' ? 'Clear Text' : language === 'mr' ? 'मजकूर पुसा' : 'टेक्स्ट साफ़ करें'}
          >
            <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
          </button>
        </div>
      </section>

      {/* 7. Offline Sync Status Bar */}
      <section className="w-full bg-white rounded-xl p-3.5 shadow-[0_3px_0px_#191c1e] border-2 border-[#191c1e] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#006948]/10 text-[#006948] flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              cloud_done
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-bold text-[#191c1e] truncate">
              {kb.offlineModeTitle}
            </span>
            <span className="text-[11px] text-[#006948] font-bold truncate">
              {kb.offlineModeDesc}
            </span>
          </div>
        </div>

        <button
          id="btn-sync-action"
          type="button"
          onClick={onSync}
          className="h-10 px-3 rounded-lg bg-[#eceef0] text-[#3d4a42] text-[13px] font-bold flex items-center gap-1 active:scale-95 border border-[#bccac0]/40 shrink-0"
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              isSyncing ? 'animate-spin text-[#006948]' : ''
            }`}
          >
            sync
          </span>
          <span>{isSyncing ? '...' : t.syncNow}</span>
        </button>
      </section>

      {/* CPCB compliance notice */}
      <div className="p-2 text-center text-[11px] text-[#565e74]">
        <span>{kb.cpcbNotice}</span>
      </div>
    </div>
  );
};
